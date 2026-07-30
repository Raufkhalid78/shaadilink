import { Resend } from 'resend';

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
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ShaadiLink!</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing to our newsletter! We're thrilled to have you join our community.</p>
          <p>You'll be the first to know about our newest wedding templates, exclusive offers, and platform updates.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The ShaadiLink Team</strong></p>
        </div>
      `,
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
    return await resend.emails.send({
      from: 'ShaadiLink <hello@shaadilink.com.pk>',
      to: [toEmail],
      subject: `New RSVP: ${guestName} has ${status === 'accept' ? 'accepted' : 'declined'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New RSVP Received</h2>
          <p>Hi there,</p>
          <p><strong>${guestName}</strong> has just submitted an RSVP for your invitation.</p>
          <p>Status: <strong style="color: ${status === 'accept' ? 'green' : 'red'};">${status === 'accept' ? 'Accepted' : 'Declined'}</strong></p>
          <br/>
          <p>Log in to your ShaadiLink dashboard to view all RSVPs.</p>
        </div>
      `,
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
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Wish Received</h2>
          <p>Hi there,</p>
          <p><strong>${guestName}</strong> left a new wish on your invitation:</p>
          <blockquote style="border-left: 4px solid #f3f4f6; padding-left: 16px; margin-left: 0; font-style: italic;">
            "${message}"
          </blockquote>
          <br/>
          <p>Log in to your ShaadiLink dashboard to view all wishes.</p>
        </div>
      `,
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
      subject: 'Your invitation is almost ready!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Don't lose your progress!</h2>
          <p>Hi there,</p>
          <p>We noticed you started setting up your <strong>${plan}</strong> plan invitation but didn't complete the payment.</p>
          <p>Your personalized design and guest details are saved. You can complete your checkout and publish your invitation instantly.</p>
          <br/>
          <a href="https://shaadilink.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Checkout</a>
          <br/><br/>
          <p>If you have any questions, just reply to this email!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending recovery email via Resend:', error);
    return null;
  }
}
