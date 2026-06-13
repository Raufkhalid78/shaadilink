import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { texts } = await request.json()

    if (!texts || typeof texts !== 'object') {
      return NextResponse.json({ error: 'texts object is required' }, { status: 400 })
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('GEMINI_API_KEY is not configured')
      }

      const ai = new GoogleGenAI({ apiKey })

      const prompt = `You are a professional Urdu translator specializing in Pakistani wedding invitations. Translate all text values of the input JSON object to elegant, formal Urdu suitable for wedding invitations. Keep the JSON keys exactly identical. Do not translate names if they are already Urdu names (like Ahmed, Fatima, Ayesha) but write them in beautiful Urdu script. Translate addresses, timeline descriptions, welcome messages, dress codes, and blessings into high-quality, culturally appropriate Urdu.

Return ONLY a valid JSON object. Do not include markdown (do not wrap in backticks), do not include any explanatory text, just the raw JSON.

Input JSON to translate:
${JSON.stringify(texts)}`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      })

      const responseText = response.text || ''

      let translations: Record<string, string> = {}
      try {
        translations = JSON.parse(responseText)
      } catch {
        // Fallback gracefully if parsing fails
        translations = texts as Record<string, string>
      }

      return NextResponse.json({ translations })

    } catch (aiError) {
      console.warn('Translation service unavailable, returning originals:', (aiError as Error).message)
      return NextResponse.json({ translations: texts })
    }
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ translations: {} }, { status: 500 })
  }
}
