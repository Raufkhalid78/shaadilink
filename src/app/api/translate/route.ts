import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { texts } = await request.json()

    if (!texts || typeof texts !== 'object') {
      return NextResponse.json({ error: 'texts object is required' }, { status: 400 })
    }

    // Try to use ZAI — but fall back gracefully if config not found
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a professional Urdu translator specializing in Pakistani wedding invitations. Translate all text values of the input JSON object to elegant, formal Urdu suitable for wedding invitations. Keep the JSON keys exactly identical. Do not translate names if they are already Urdu names (like Ahmed, Fatima, Ayesha) but write them in beautiful Urdu script. Translate addresses, timeline descriptions, welcome messages, dress codes, and blessings into high-quality, culturally appropriate Urdu.

Return ONLY a valid JSON object. Do not include markdown (do not wrap in backticks), do not include any explanatory text, just the raw JSON.`
          },
          {
            role: 'user',
            content: JSON.stringify(texts)
          }
        ],
        thinking: { type: 'disabled' }
      })

      const responseText = completion.choices[0]?.message?.content || ''

      let translations: Record<string, string> = {}
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          for (const [key, value] of Object.entries(parsed)) {
            const cleanKey = key.replace(/^\[(.+)\]$/, '$1')
            translations[cleanKey] = value as string
          }
        }
      } catch {
        // Fallback: return original texts
        translations = texts as Record<string, string>
      }

      return NextResponse.json({ translations })
    } catch (zaiError) {
      // ZAI not configured — silently return original texts so the invitation still works
      console.warn('Translation service unavailable (ZAI config missing), returning originals:', (zaiError as Error).message)
      return NextResponse.json({ translations: texts })
    }
  } catch (error) {
    console.error('Translation error:', error)
    // Always return originals as fallback — never crash the invitation viewer
    return NextResponse.json({ translations: {} }, { status: 500 })
  }
}
