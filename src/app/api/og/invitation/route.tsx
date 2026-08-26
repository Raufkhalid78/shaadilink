import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const guest = searchParams.get('guest');

    let partner1 = 'Ahmed';
    let partner2 = 'Fatima';
    let venue = 'The Grand Palace';
    let date = 'Wedding Celebration';
    let heroImage: string | null = null;

    if (id) {
      const cleanId = id.replace(/%20| /g, '-');
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      const supabase = createServiceClient();

      const { data } = await (isUuid
        ? supabase
            .from('invitations')
            .select(`
              partner1_name,
              partner2_name,
              venue,
              hero_image_url,
              events (name, date, order_index)
            `)
            .eq('id', cleanId)
        : supabase
            .from('invitations')
            .select(`
              partner1_name,
              partner2_name,
              venue,
              hero_image_url,
              events (name, date, order_index)
            `)
            .eq('slug', cleanId)
      ).maybeSingle();

      if (data) {
        if (data.partner1_name) partner1 = data.partner1_name.trim();
        if (data.partner2_name) partner2 = data.partner2_name.trim();
        if (data.venue) venue = data.venue.trim();
        if (data.hero_image_url) heroImage = data.hero_image_url;

        const eventsList = (data.events as any[]) || [];
        if (eventsList.length > 0) {
          const sorted = [...eventsList].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
          const mainEvent = sorted.find(e => /baraat|wedding|nikkah|shaadi/i.test(e.name)) || sorted[0];
          if (mainEvent?.date) date = mainEvent.date;
        }
      }
    }

    const guestFormatted = guest
      ? guest.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#04100c',
            backgroundImage: 'radial-gradient(circle at 50% 10%, #0d2920 0%, #04100c 70%)',
            padding: '45px 55px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Ornate Gold Outer Border */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '18px',
              right: '18px',
              bottom: '18px',
              border: '2px solid rgba(212, 168, 83, 0.45)',
              borderRadius: '20px',
              display: 'flex',
            }}
          />
          {/* Inner Thin Border */}
          <div
            style={{
              position: 'absolute',
              top: '26px',
              left: '26px',
              right: '26px',
              bottom: '26px',
              border: '1px solid rgba(212, 168, 83, 0.2)',
              borderRadius: '14px',
              display: 'flex',
            }}
          />

          {/* Top Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '1px',
                  backgroundColor: '#d4a853',
                  opacity: 0.7,
                  display: 'flex',
                }}
              />
              <span
                style={{
                  color: '#d4a853',
                  fontSize: '16px',
                  letterSpacing: '5px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Royal Wedding Celebration
              </span>
              <div
                style={{
                  width: '50px',
                  height: '1px',
                  backgroundColor: '#d4a853',
                  opacity: 0.7,
                  display: 'flex',
                }}
              />
            </div>
            <span
              style={{
                color: 'rgba(212, 168, 83, 0.85)',
                fontSize: '15px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              The Union of Two Families
            </span>
          </div>

          {/* Center Main Names & Photo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '40px',
              margin: 'auto 0',
              width: '100%',
            }}
          >
            {/* Optional Photo */}
            {heroImage && (
              <div
                style={{
                  width: '170px',
                  height: '170px',
                  borderRadius: '50%',
                  border: '3px solid #d4a853',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt="Couple"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: heroImage ? 'flex-start' : 'center',
                textAlign: heroImage ? 'left' : 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  justifyContent: heroImage ? 'flex-start' : 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '60px',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {partner1}
                </span>
                <span
                  style={{
                    fontSize: '46px',
                    color: '#d4a853',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    margin: '0 4px',
                  }}
                >
                  &
                </span>
                <span
                  style={{
                    fontSize: '60px',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {partner2}
                </span>
              </div>

              {/* Personalized Guest Badge */}
              {guestFormatted && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '12px',
                    padding: '6px 18px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(212, 168, 83, 0.15)',
                    border: '1px solid rgba(212, 168, 83, 0.5)',
                    color: '#f0d78c',
                    fontSize: '18px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                  }}
                >
                  <span>Special Invitation for {guestFormatted}</span>
                </div>
              )}

              {/* Sub-pill with venue & date */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '16px',
                  fontSize: '18px',
                  color: 'rgba(224, 204, 170, 0.95)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#d4a853', fontWeight: 'bold' }}>VENUE:</span>
                  <span>{venue}</span>
                </div>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#d4a853', display: 'flex' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#d4a853', fontWeight: 'bold' }}>DATE:</span>
                  <span>{date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Branding Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '15px',
              borderTop: '1px solid rgba(212, 168, 83, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  backgroundColor: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                <span>SL</span>
              </div>
              <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>
                Shaadi<span style={{ color: '#d4a853' }}>Link</span>
              </span>
            </div>

            <span style={{ color: 'rgba(212, 168, 83, 0.8)', fontSize: '15px', letterSpacing: '1px' }}>
              Touch & Open Digital Invitation
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
