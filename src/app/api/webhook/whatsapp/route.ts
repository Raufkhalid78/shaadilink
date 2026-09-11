import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// GET: Meta WhatsApp Webhook Challenge Verification
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'smartinvites_whatsapp_verify_secret';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return new Response(challenge || '', { status: 200 });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (err) {
    console.error('WhatsApp webhook GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Ingest incoming WhatsApp messages and parse RSVP responses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify it's a WhatsApp message payload
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // Could be a status update (sent, delivered, read), respond 200 OK
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const senderPhone = message.from; // e.g. "923001234567"
    const messageType = message.type;
    let messageText = '';

    if (messageType === 'text') {
      messageText = message.text?.body?.trim() || '';
    } else if (messageType === 'button') {
      messageText = message.button?.text?.trim() || message.button?.payload || '';
    } else if (messageType === 'interactive') {
      messageText = message.interactive?.button_reply?.title || message.interactive?.button_reply?.id || '';
    }

    const lowerText = messageText.toLowerCase();

    // Match RSVP intent
    const acceptKeywords = ['1', 'yes', 'accept', 'attending', 'haan', 'aunga', 'aungi', 'in', 'jee haan', 'zaroor', 'pakka'];
    const declineKeywords = ['2', 'no', 'decline', 'sorry', 'nahi', 'out', 'na', 'afsos', 'cannot attend'];

    const isAccept = acceptKeywords.some(kw => lowerText === kw || lowerText.startsWith(kw + ' ') || lowerText.endsWith(' ' + kw));
    const isDecline = declineKeywords.some(kw => lowerText === kw || lowerText.startsWith(kw + ' ') || lowerText.endsWith(' ' + kw));

    if (!isAccept && !isDecline) {
      // Not an explicit RSVP command, reply with instructions if API is configured
      await sendWhatsAppReply(senderPhone, "Thank you for reaching out to Smart Invites! To confirm your attendance for the event, please reply:\n\n*1* - to Accept (Attending)\n*2* - to Decline (Cannot attend)");
      return NextResponse.json({ status: 'unknown_command' }, { status: 200 });
    }

    const rsvpStatus = isAccept ? 'accept' : 'decline';
    const service = createServiceClient();

    // Try finding matching guest by phone or recent guest links
    const { data: matchedGuest } = await service
      .from('guest_links')
      .select('id, invitation_id, guest_name, seats')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const guestName = matchedGuest?.guest_name || `WhatsApp Guest (+${senderPhone.slice(-4)})`;
    const invitationId = matchedGuest?.invitation_id;

    if (invitationId) {
      // Insert or update RSVP record
      await service.from('rsvps').insert({
        invitation_id: invitationId,
        guest_name: guestName,
        status: rsvpStatus,
        notes: `Confirmed via WhatsApp (+${senderPhone})`,
      });

      if (matchedGuest?.id) {
        await service.from('guest_links').update({
          status: isAccept ? 'opened' : 'declined',
          last_viewed_at: new Date().toISOString()
        }).eq('id', matchedGuest.id);
      }
    }

    // Send confirmation message back to guest
    const confirmationText = isAccept
      ? `🎉 *RSVP Confirmed!* Thank you, ${guestName}. Your attendance has been joyfully accepted. We look forward to celebrating together!\n\nYour digital pass is verified.`
      : `💌 *RSVP Received.* Thank you for letting us know, ${guestName}. You will be dearly missed in our celebrations!`;

    await sendWhatsAppReply(senderPhone, confirmationText);

    return NextResponse.json({
      success: true,
      rsvp: {
        sender: senderPhone,
        status: rsvpStatus,
        guestName,
      }
    });
  } catch (err) {
    console.error('WhatsApp webhook POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to send WhatsApp messages using Meta Graph API if credentials exist
async function sendWhatsAppReply(recipientPhone: string, messageText: string) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    // Graceful fallback for local development or unconfigured credentials
    return;
  }

  try {
    await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: { body: messageText },
      }),
    });
  } catch (sendErr) {
    console.warn('Failed to send WhatsApp Cloud API reply:', sendErr);
  }
}
