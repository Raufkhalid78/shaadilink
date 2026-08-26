import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/* POST /api/upload — upload image to Supabase Storage */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 files allowed per request' }, { status: 400 })
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    if (totalSize > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Total upload size exceeds 20MB limit' }, { status: 400 })
    }

    const service = createServiceClient()
    const uploadedUrls: string[] = []

    for (const file of files) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
      
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

      if (!allowedMimeTypes.includes(file.type) || !allowedExtensions.includes(ext)) {
        return NextResponse.json({ error: `Invalid file type or extension: ${file.name}` }, { status: 400 })
      }

      // Max 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds 10MB limit` }, { status: 400 })
      }
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const buffer = await file.arrayBuffer()

      const { error: uploadError } = await service.storage
        .from('invitation-images')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      const { data: { publicUrl } } = service.storage
        .from('invitation-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 201 })
  } catch (error) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
