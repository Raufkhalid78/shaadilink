import { NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 25;
export const runtime = 'edge';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

// Curated high-converting domain presets for instant zero-latency fallback
const FALLBACK_PRESETS: Record<string, Record<string, string[]>> = {
  wedding: {
    poetic: [
      "With hearts full of love, grace, and gratitude to the Almighty, we cordially invite you to celebrate the union of our souls as we embark on a sacred journey of companionship.",
      "دو دل، ایک دعا، اور زندگی کا نیا سفر — باہمی محبت، مسرت اور خلوص کے ساتھ، ہم آپ کو اپنے مسرتوں بھرے اس پروقار موقع پر شرکت کی دلی دعوت دیتے ہیں۔",
      "As two families unite in love, harmony, and timeless devotion, we request the honor of your presence and warm blessings to illuminate our celebration."
    ],
    formal: [
      "We request the pleasure of your esteemed company at the wedding celebrations of our beloved children. Your gracious presence will add immense joy and dignity to our momentous day.",
      "The families cordially request the honor of your presence to celebrate the solemn matrimonial union. Join us as we witness their vows under the blessings of family and elders.",
      "We warmly solicit the pleasure of your company and heartfelt prayers as our families unite in eternal matrimony. Please grace us with your esteemed presence."
    ],
    modern: [
      "Together with our families, we can't wait to celebrate the start of our greatest adventure yet! Join us for a night of music, laughter, dinner, and unforgettable memories.",
      "We're getting married! Come dance, feast, and make memories with us as we say 'I do' surrounded by the people who mean the world to us.",
      "Love brought us together, and friendship made it forever. Join us as we tie the knot and celebrate with an evening of pure joy and celebration!"
    ],
    traditional: [
      "In the name of Allah, the Most Gracious, the Most Merciful. With immense gratitude and joy, we invite you to bless the Nikkah and wedding celebrations of our beloved children.",
      "اللہ تعالیٰ کے فضل و کرم سے، ہم آپ کو اپنے پیاروں کے نکاح اور دعوتِ ولیمہ کے پرمسرت لمحات میں شرکت اور دعاؤں کی مخلصانہ گزارش کرتے ہیں۔",
      "Beginning our journey with Bismillah and the prayers of our elders. We warmly invite you to share in the joy and festive celebration of our auspicious union."
    ]
  },
  birthday: {
    modern: [
      "Another year bolder, brighter, and ready to celebrate! Join us for an epic night of great music, delicious food, and wonderful company.",
      "Let's raise a toast to another fabulous year! Come ready to dance, laugh, and celebrate this special milestone together.",
      "Good friends, great vibes, and an unforgettable celebration! You are warmly invited to make this birthday truly one for the books."
    ],
    poetic: [
      "Counting the moments, treasuring the years, and celebrating the gift of life with the people who brighten our days. Please join our celebratory evening!",
      "زندگیاں یادوں سے بنتی ہیں اور خوشیاں دوستوں سے۔ آئیے مل کر اس خوبصورت سالگرہ کی شام کو یادگار اور رنگین بنائیں۔",
      "A celebration of life, growth, and cherished memories. Join us as we blow out the candles and toast to a magical year ahead."
    ],
    formal: [
      "You are cordially invited to celebrate this milestone birthday evening. Join us for a cocktail reception followed by dinner and celebratory toasts.",
      "Please join us as we honor this milestone year with an evening of fine dining, laughter, and distinguished company.",
      "We request the pleasure of your company to celebrate this memorable birthday occasion with family and close friends."
    ],
    traditional: [
      "Celebrating the gift of life and the blessings of another year. We warmly welcome you to join our family gathering and dinner.",
      "خوشیوں اور دعاؤں کے ساتھ، ہم آپ کو اس سالگرہ کے خاص موقع پر اپنے ساتھ یادگار وقت گزارنے کی محبت بھری دعوت دیتے ہیں۔",
      "Surrounded by family, warmth, and heartfelt prayers. Please join us in celebrating this happy birthday gathering."
    ]
  },
  school: {
    formal: [
      "The Chancellor, Faculty, and Graduating Class cordially invite you to the Annual Commencement Ceremony in honor of academic distinction and excellence.",
      "We take immense pride in requesting the honor of your presence at our Convocation & Degree Conferral ceremony as we salute the leaders of tomorrow.",
      "Join us in celebrating the culmination of dedication, intellect, and relentless perseverance as our distinguished scholars receive their degrees."
    ],
    poetic: [
      "From humble beginnings to boundless horizons. We gather to celebrate the intellect, dreams, and remarkable achievements of our graduating batch.",
      "علم، محنت اور خوابوں کی تکمیل — آئیے مل کر اپنے ہونہار طلباء کی شاندار کامیابی اور روشن مستقبل کو خراجِ تحسین پیش کریں۔",
      "Turning the page to a new chapter of impact and leadership. Join us as our graduates step forth into the world with pride."
    ],
    modern: [
      "Caps in the air, dreams everywhere! Celebrate the relentless journey, late-night breakthroughs, and triumphs of the Class of 2027.",
      "We made it! Join us for a celebratory graduation evening recognizing our hard-earned achievements and the road ahead.",
      "Celebrating the milestones, friendships, and bold innovations of our graduating leaders. Let's send them off in style!"
    ],
    traditional: [
      "Honoring the traditions of academic scholarship, mentorship, and ethical leadership. You are cordially invited to our formal convocation proceedings.",
      "اساتذہ کی رہنمائی اور طلباء کی انتھک محنت کا ثمر — کانووکیشن کی اس باوقار تقریب میں آپ کی تشریف آوری ہمارے لیے باعثِ افتخار ہوگی۔",
      "With gratitude to our mentors and pride in our scholars, we invite you to witness the conferral of academic degrees."
    ]
  },
  meeting: {
    formal: [
      "The Board of Directors and Executive Committee request the pleasure of your presence at our Annual Leadership Summit and Keynote Assembly.",
      "You are cordially invited to participate in this exclusive executive gathering exploring strategic foresight, market disruption, and growth.",
      "Please join distinguished industry peers and executive leaders for an insightful plenary symposium followed by a private networking reception."
    ],
    modern: [
      "Connect, innovate, and lead. Join visionary thinkers and founders for a high-impact summit designed to accelerate growth and industry innovation.",
      "A dynamic gathering of forward-thinking minds. We invite you to collaborate, discover groundbreaking insights, and shape the industry roadmap.",
      "Great ideas spark when great minds connect. Join us for a day of keynote insights, panel debates, and executive networking."
    ],
    poetic: [
      "Where vision meets strategy, and collaboration inspires progress. We welcome you to this distinguished executive colloquium.",
      "فکر، تدبر اور مستقبل کے شاندار منصوبوں کا سنگم — ہم آپ کو اس اعلیٰ سطحی بزنس سمٹ میں شرکت کی باضابطہ دعوت دیتے ہیں۔",
      "Shaping tomorrow through principled leadership and bold innovation. We look forward to welcoming you to this landmark summit."
    ],
    traditional: [
      "We have the honor to invite you to our official corporate assembly and annual general proceedings. Your esteemed participation is highly valued.",
      "ادارے کی شاندار روایات اور ترقی کے تسلسل کو برقرار رکھتے ہوئے، ہم آپ کو اس اہم سالانہ کانفرنس میں خوش آمدید کہتے ہیں۔",
      "In honor of institutional partnership and sustained excellence, we cordially solicit your valuable participation."
    ]
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      category = 'wedding',
      tone = 'poetic',
      language = 'en',
      context = {}
    } = body;

    const partner1 = context.partner1Name || context.name || 'Honored Host';
    const partner2 = context.partner2Name || '';
    const venue = context.venue || 'Our Event Venue';
    const eventType = category === 'birthday' ? 'Birthday Celebration' : category === 'school' ? 'Graduation / Commencement' : category === 'meeting' ? 'Corporate Summit' : 'Wedding';

    // Attempt AI Generation if API key is present
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const prompt = `You are a world-class invitation copywriter specializing in Pakistani, South Asian, and international events.
Generate exactly 3 distinct, high-elegance welcome messages or invitation texts for an event invitation card.

Event Category: ${category} (${eventType})
Primary Name/Host: ${partner1}
${partner2 ? `Partner / Co-host: ${partner2}` : ''}
Venue: ${venue}
Selected Tone: ${tone} (e.g. poetic, formal, modern, traditional)
Preferred Language: ${language === 'ur' ? 'Urdu (or bilingual Urdu/English)' : language === 'bilingual' ? 'Bilingual (Urdu & English)' : 'English'}

Rules:
1. Output ONLY a valid JSON array of 3 strings: ["Option 1 text", "Option 2 text", "Option 3 text"].
2. Do not include markdown formatting or quotes outside the JSON.
3. Each option should be 2 to 4 sentences, emotionally captivating, warm, and sophisticated.
4. For weddings, make it heartfelt and culturally resonant.
5. For corporate/school, maintain appropriate executive or academic dignity.`;

        const { text } = await generateText({
          model: openrouter('google/gemini-2.5-flash'),
          prompt,
          maxTokens: 1000,
          temperature: 0.7,
        });

        // Parse JSON array from LLM response
        const cleanText = text.trim().replace(/^```json\s*/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return NextResponse.json({ suggestions: parsed.slice(0, 3), source: 'ai' });
        }
      } catch (aiErr) {
        console.warn('AI Generation fallback triggered:', aiErr);
      }
    }

    // High-quality domain fallback presets
    const categoryPresets = FALLBACK_PRESETS[category] || FALLBACK_PRESETS.wedding;
    const tonePresets = categoryPresets[tone] || categoryPresets.poetic || categoryPresets.formal || [];

    // Personalize presets if names exist
    const personalized = tonePresets.map((template) => {
      if (category === 'wedding' && partner1 && partner2) {
        return template.replace(/our beloved children|their vows|the union of our souls/gi, `the union of ${partner1} & ${partner2}`);
      }
      if (category === 'birthday' && partner1) {
        return template.replace(/this special milestone|this birthday/gi, `${partner1}'s special milestone`);
      }
      if (category === 'school' && partner1) {
        return template.replace(/Annual Commencement Ceremony/gi, `${partner1} Commencement Ceremony`);
      }
      if (category === 'meeting' && partner1) {
        return template.replace(/Annual Leadership Summit/gi, `${partner1} Executive Summit`);
      }
      return template;
    });

    return NextResponse.json({
      suggestions: personalized,
      source: 'preset'
    });
  } catch (error) {
    console.error('Error in /api/ai/generate-copy:', error);
    return NextResponse.json(
      { suggestions: FALLBACK_PRESETS.wedding.poetic, source: 'default' },
      { status: 200 }
    );
  }
}
