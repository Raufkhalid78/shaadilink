import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { uploadLimiter, getClientIp } from '@/lib/rate-limit'

/* POST /api/upload/audio — upload authenticated user audio (MP3/M4A/WAV) up to 5MB */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to upload custom music.' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const { success } = await uploadLimiter.limit(`upload_audio_${user.id}_${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Upload rate limit reached. Please try again later.' }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || typeof file !== 'object' || file.size === 0) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file must be under 5MB for optimal mobile performance.' }, { status: 400 })
    }

    const rawExt = file.name?.split('.').pop()?.toLowerCase() ?? 'mp3'
    const allowedExts = ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'webm', 'weba', 'mp4']
    if (!allowedExts.includes(rawExt)) {
      return NextResponse.json({ error: 'Only audio files (MP3, M4A, WAV, AAC, WEBM, OGG) are supported.' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const service = createServiceClient()
    const fileName = `audio/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${rawExt}`
    const mimeMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      m4a: 'audio/mp4',
      mp4: 'audio/mp4',
      webm: 'audio/webm',
      weba: 'audio/webm',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      aac: 'audio/aac',
    }
    const contentType = file.type || mimeMap[rawExt] || `audio/${rawExt}`

    const { error: uploadError } = await service.storage
      .from('invitation-images')
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      console.error('Storage audio upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload audio file. Please try again.' }, { status: 500 })
    }

    const { data: { publicUrl } } = service.storage
      .from('invitation-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl, filename: file.name }, { status: 200 })
  } catch (err: unknown) {
    console.error('Audio upload route error:', err)
    return NextResponse.json({ error: 'Server error during audio upload.' }, { status: 500 })
  }
}
