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
