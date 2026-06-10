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

      const textEntries = Object.entries(texts as Record<string, string>)
      const numberedTexts = textEntries.map(([key, value], i) => `${i + 1}. ${key}: ${value}`).join('\n')

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a professional Urdu translator specializing in Pakistani wedding invitations. Translate the following English text strings to Urdu. Maintain the elegant, formal tone appropriate for wedding invitations. Use culturally appropriate Pakistani wedding terminology.

Return ONLY a valid JSON object where each key maps to its Urdu translation. No additional text, no markdown, just the JSON object.

Example input: {"greeting": "You are invited", "venue": "The Grand Hall"}
Example output: {"greeting": "آپ مدعو ہیں", "venue": "دی گرانڈ ہال"}`
          },
          {
            role: 'user',
            content: `Translate these text strings to Urdu:\n\n${numberedTexts}`
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
