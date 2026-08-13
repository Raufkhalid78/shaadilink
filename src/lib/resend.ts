import { Resend } from 'resend';
import { getEmailWrapper } from './email-templates';

// Initialize the Resend client. 
// Note: It will only work if RESEND_API_KEY is present in your .env.local file
const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Helper utility to send a welcome email to new newsletter subscribers.
 * You must verify your domain in the Resend dashboard to send emails from it.
 */
export async function sendWelcomeEmail(toEmail: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY is missing. Email not sent to:', toEmail);
    return null;
  }

  try {
    const data = await resend.emails.send({
      from: 'ShaadiLink <hello@shaadilink.com.pk>',
      to: [toEmail],
      subject: 'Welcome to ShaadiLink! 🎉',
      html: getEmailWrapper(
        'Welcome to ShaadiLink!',
        'Thank you for subscribing to our newsletter!',
        `
          <h2 style="color: #022c22; margin-top: 0;">Welcome to ShaadiLink!</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing to our newsletter! We're thrilled to have you join our community.</p>
          <p>You'll be the first to know about our newest wedding templates, exclusive offers, and platform updates.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The ShaadiLink Team</strong></p>
        `
      ),
    });
    return data;
  } catch (error) {
    console.error('Error sending welcome email via Resend:', error);
    return null;
  }
}

export async function sendRsvpNotification(toEmail: string, guestName: string, status: 'accept' | 'decline') {
  if (!resend) return null;

  try {
    const statusColor = status === 'accept' ? '#059669' : '#dc2626';
    const statusText = status === 'accept' ? 'Accepted' : 'Declined';
    
    return await resend.emails.send({
      from: 'ShaadiLink <hello@shaadilink.com.pk>',
      to: [toEmail],
      subject: `New RSVP: ${guestName} has ${statusText.toLowerCase()}`,
      html: getEmailWrapper(
        'New RSVP Received',
        `${guestName} has ${statusText.toLowerCase()} your invitation.`,
        `
          <h2 style="color: #022c22; margin-top: 0;">New RSVP Received</h2>
          <p>Hi there,</p>
          <p><strong>${guestName}</strong> has just submitted an RSVP for your invitation.</p>
          
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid ${statusColor};">
            <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Status</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: ${statusColor};">${statusText}</p>
          </div>
          
          <br/>
          <center>
            <a href="https://shaadilink.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View All RSVPs</a>
          </center>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending RSVP email via Resend:', error);
    return null;
  }
}

export async function sendWishNotification(toEmail: string, guestName: string, message: string) {
  if (!resend) return null;

  try {
    return await resend.emails.send({
      from: 'ShaadiLink <hello@shaadilink.com.pk>',
      to: [toEmail],
      subject: `New Wish from ${guestName}`,
      html: getEmailWrapper(
        'New Wish Received',
        `${guestName} left a new wish on your invitation.`,
        `
          <h2 style="color: #022c22; margin-top: 0;">New Wish Received</h2>
          <p>Hi there,</p>
          <p><strong>${guestName}</strong> left a new wish on your invitation:</p>
          
          <blockquote style="background-color: #f8fafc; border-left: 4px solid #d4af37; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; font-style: italic; color: #334155; font-size: 17px; line-height: 1.6;">
            "${message}"
          </blockquote>
          
          <br/>
          <center>
            <a href="https://shaadilink.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View All Wishes</a>
          </center>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending Wish email via Resend:', error);
    return null;
  }
}

export async function sendRecoveryEmail(toEmail: string, orderId: string, plan: string) {
  if (!resend) return null;

  try {
    return await resend.emails.send({
      from: 'ShaadiLink <hello@shaadilink.com.pk>',
      to: [toEmail],
      subject: 'Complete Your Dream Invitation & Get 10% Off! 💍',
      html: getEmailWrapper(
        "Don't lose your progress!",
        "Complete your order today and get 10% off your digital invitation.",
        `
          <h2 style="color: #022c22; margin-top: 0;">Don't lose your progress!</h2>
          <p>Hi there,</p>
          <p>We noticed you started setting up your <strong>${plan}</strong> plan invitation but didn't complete the payment.</p>
          <p>We know planning a wedding can be overwhelming, so we'd love to help you cross one thing off your list! For a limited time, you can complete your order and get <strong>10% OFF</strong> your digital invitation.</p>
          
          <div style="background-color: #022c22; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; border: 1px dashed #d4af37;">
            <p style="margin: 0; color: #a7f3d0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Use Promo Code</p>
            <p style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 800; letter-spacing: 2px;">EARLYBIRD10</p>
          </div>
          
          <p style="text-align: center; color: #64748b; font-size: 14px; font-style: italic; margin-bottom: 30px;">(Hurry! This code is only valid for the first 10 people who use it.)</p>
          
          <center>
            <a href="https://shaadilink.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Complete My Invitation</a>
          </center>
          
          <br/><br/>
          <p>Need help choosing a template or have questions? Just reply to this email, and our team will be happy to assist you.</p>
          <p>Best wishes,</p>
          <p><strong>The ShaadiLink Team</strong></p>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending Recovery email via Resend:', error);
    return null;
  }
}
