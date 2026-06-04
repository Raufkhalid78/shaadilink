import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { texts } = await request.json()

    if (!texts || typeof texts !== 'object') {
      return NextResponse.json({ error: 'texts object is required' }, { status: 400 })
    }

    const zai = await ZAI.create()

    // Build a structured prompt for translation
    const textEntries = Object.entries(texts as Record<string, string>)
    const numberedTexts = textEntries.map(([key, value], i) => `${i + 1}. [${key}]: ${value}`).join('\n')

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
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

    // Parse the JSON response
    let translations: Record<string, string> = {}
    try {
      // Try to extract JSON from the response (in case it has markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        translations = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse translation response:', e)
      // Fallback: return original texts
      translations = texts as Record<string, string>
    }

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
