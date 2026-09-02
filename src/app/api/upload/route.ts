import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { uploadLimiter, getClientIp } from '@/lib/rate-limit'

function isValidImageBytes(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false
  const bytes = new Uint8Array(buffer.slice(0, 12))

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true

  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true

  // WebP: RIFF ... WEBP (52 49 46 46 ... 57 45 42 50)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true
  }

  // HEIC / HEIF: ftyp box
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return true

  return false
}

/* POST /api/upload — upload authenticated user image to Supabase Storage */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to upload photos.' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const { success } = await uploadLimiter.limit(`upload_${user.id}_${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Upload rate limit reached. Please try again later.' }, { status: 429 })
    }

    const formData = await request.formData()
    let rawFiles = formData.getAll('files') as File[]
    if (!rawFiles || rawFiles.length === 0) {
      rawFiles = formData.getAll('file') as File[]
    }
    if (!rawFiles || rawFiles.length === 0) {
      const allFiles: File[] = []
      for (const value of formData.values()) {
        if (value && typeof value === 'object' && 'name' in value && 'size' in value) {
          allFiles.push(value as File)
        }
      }
      rawFiles = allFiles
    }

    const files = (rawFiles || []).filter(f => f && typeof f === 'object' && f.size > 0)

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 files allowed per request' }, { status: 400 })
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    if (totalSize > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Total upload size exceeds 25MB limit' }, { status: 400 })
    }

    const service = createServiceClient()
    const uploadedUrls: string[] = []

    for (const file of files) {
      const rawExt = file.name?.split('.').pop()?.toLowerCase() ?? 'jpg'
      const ext = rawExt.replace(/[^a-z0-9]/g, '')
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif']
      const cleanExt = allowedExts.includes(ext) ? ext : 'jpg'

      // Max 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name || 'file'} exceeds 10MB limit` }, { status: 400 })
      }

      const buffer = await file.arrayBuffer()

      // Magic byte validation against polyglot or non-image files
      if (!isValidImageBytes(buffer)) {
        return NextResponse.json({ error: `Invalid image format for ${file.name || 'file'}. Only genuine image files are allowed.` }, { status: 400 })
      }

      // User-scoped storage isolation
      const fileName = `users/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${cleanExt}`
      const contentType = file.type && file.type.startsWith('image/') ? file.type : `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`

      const { error: uploadError } = await service.storage
        .from('invitation-images')
        .upload(fileName, buffer, {
          contentType,
          upsert: true,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload image. Please try again.' }, { status: 500 })
      }

      const { data: { publicUrl } } = service.storage
        .from('invitation-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json({ error: 'Internal server error while processing upload' }, { status: 500 })
  }
}
