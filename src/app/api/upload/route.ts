import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/* POST /api/upload — upload image to Supabase Storage */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const formData = await request.formData()
    let rawFiles = formData.getAll('files') as File[]
    if (!rawFiles || rawFiles.length === 0) {
      rawFiles = formData.getAll('file') as File[]
    }
    if (!rawFiles || rawFiles.length === 0) {
      // Check all entries for File objects
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

    // Ensure bucket exists and is public
    try {
      const { data: buckets } = await service.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === 'invitation-images')
      if (!bucketExists) {
        await service.storage.createBucket('invitation-images', {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024,
        })
      }
    } catch (bErr) {
      console.warn('Bucket check/create note:', bErr)
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      const rawExt = file.name?.split('.').pop()?.toLowerCase() ?? 'jpg'
      const ext = rawExt.replace(/[^a-z0-9]/g, '')
      const isImage = (file.type && file.type.startsWith('image/')) || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'].includes(ext)

      if (!isImage) {
        return NextResponse.json({ error: `Invalid file type: ${file.name || 'file'}. Only image files are allowed.` }, { status: 400 })
      }

      // Max 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name || 'file'} exceeds 10MB limit` }, { status: 400 })
      }

      const folder = user ? user.id : 'uploads'
      const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'].includes(ext) ? ext : 'jpg'
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${cleanExt}`
      const buffer = await file.arrayBuffer()
      const contentType = file.type && file.type.startsWith('image/') ? file.type : `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`

      let { error: uploadError } = await service.storage
        .from('invitation-images')
        .upload(fileName, buffer, {
          contentType,
          upsert: true,
        })

      if (uploadError && (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket'))) {
        try {
          await service.storage.createBucket('invitation-images', { public: true })
          const retry = await service.storage
            .from('invitation-images')
            .upload(fileName, buffer, {
              contentType,
              upsert: true,
            })
          uploadError = retry.error
        } catch {}
      }

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json({ error: uploadError.message || 'Failed to upload image' }, { status: 500 })
      }

      const { data: { publicUrl } } = service.storage
        .from('invitation-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
