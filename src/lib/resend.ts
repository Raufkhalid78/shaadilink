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
      from: 'Smart Invites <info@smartinvites.com.pk>',
      to: [toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: 'Welcome to Smart Invites! 🎉',
      text: `Welcome to Smart Invites!\n\nHi there,\n\nThank you for subscribing to our newsletter! We're thrilled to have you join our community.\n\nYou'll be the first to know about our newest wedding templates, exclusive offers, and platform updates.\n\nBest regards,\nThe Smart Invites Team\nhttps://www.smartinvites.com.pk`,
      html: getEmailWrapper(
        'Welcome to Smart Invites!',
        'Thank you for subscribing to our newsletter!',
        `
          <h2 style="color: #022c22; margin-top: 0;">Welcome to Smart Invites!</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing to our newsletter! We're thrilled to have you join our community.</p>
          <p>You'll be the first to know about our newest wedding templates, exclusive offers, and platform updates.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Smart Invites Team</strong></p>
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
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return null;
  const resend = new Resend(resendApiKey);

  try {
    const statusColor = status === 'accept' ? '#059669' : '#dc2626';
    const statusText = status === 'accept' ? 'Accepted' : 'Declined';
    
    return await resend.emails.send({
      from: 'Smart Invites <info@smartinvites.com.pk>',
      to: [toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: `New RSVP: ${guestName} has ${statusText.toLowerCase()}`,
      text: `New RSVP Received\n\nHi there,\n\n${guestName} has just submitted an RSVP for your invitation.\nStatus: ${statusText}\n\nView All RSVPs: https://www.smartinvites.com.pk/dashboard`,
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
            <a href="https://smartinvites.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View All RSVPs</a>
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
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return null;
  const resend = new Resend(resendApiKey);

  try {
    return await resend.emails.send({
      from: 'Smart Invites <info@smartinvites.com.pk>',
      to: [toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: `New Wish from ${guestName}`,
      text: `New Wish Received\n\nHi there,\n\n${guestName} left a new wish on your invitation:\n\n"${message}"\n\nView All Wishes: https://www.smartinvites.com.pk/dashboard`,
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
            <a href="https://smartinvites.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View All Wishes</a>
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
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return null;
  const resend = new Resend(resendApiKey);

  try {
    return await resend.emails.send({
      from: 'Smart Invites <info@smartinvites.com.pk>',
      to: [toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: 'Complete Your Dream Invitation & Get 10% Off! 💍',
      text: `Don't lose your progress!\n\nHi there,\n\nWe noticed you started setting up your ${plan} plan invitation but didn't complete the payment.\n\nUse Promo Code: EARLYBIRD10 for 10% OFF.\n\nComplete My Invitation: https://www.smartinvites.com.pk/dashboard\n\nNeed help? Just reply to this email!`,
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
            <a href="https://smartinvites.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Complete My Invitation</a>
          </center>
          
          <br/><br/>
          <p>Need help choosing a template or have questions? Just reply to this email, and our team will be happy to assist you.</p>
          <p>Best wishes,</p>
          <p><strong>The Smart Invites Team</strong></p>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending Recovery email via Resend:', error);
    return null;
  }
}

export async function sendAffiliateApplicationAdminAlert(data: {
  name: string;
  email: string;
  socialId?: string | null;
  promotionPlan: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return null;
  const resend = new Resend(resendApiKey);

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'info@smartinvites.com.pk';
    return await resend.emails.send({
      from: 'Smart Invites System <info@smartinvites.com.pk>',
      to: [adminEmail],
      replyTo: data.email,
      subject: `New Partner Application: ${data.name} 💼`,
      text: `New Partner Application Received!\n\nName: ${data.name}\nEmail: ${data.email}\nSocial Link/Channel: ${data.socialId || 'None provided'}\nPromotion Strategy: ${data.promotionPlan}\n\nReview & Approve in Admin Portal: https://www.smartinvites.com.pk/admin/affiliates`,
      html: getEmailWrapper(
        'New Partner Application',
        `${data.name} has applied to join the Smart Invites Partner Program.`,
        `
          <h2 style="color: #022c22; margin-top: 0;">New Partner Application</h2>
          <p>Hi Admin,</p>
          <p>A new applicant has submitted their registration for the <strong>Smart Invites Partner / Affiliate Program</strong>.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>Applicant Name:</strong> ${data.name}</p>
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #059669; text-decoration: none;">${data.email}</a></p>
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>Social Link / Handle:</strong> ${data.socialId ? `<a href="${data.socialId}" target="_blank" style="color: #059669;">${data.socialId}</a>` : 'Not provided'}</p>
            <p style="margin: 0 0 5px 0; color: #334155;"><strong>Promotion Strategy:</strong></p>
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; color: #1e293b; font-size: 15px; line-height: 1.6;">
              ${data.promotionPlan.replace(/\n/g, '<br/>')}
            </div>
          </div>
          
          <br/>
          <center>
            <a href="https://www.smartinvites.com.pk/admin/affiliates" style="background-color: #d4af37; color: #111827; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review &amp; Approve Application</a>
          </center>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending affiliate admin alert via Resend:', error);
    return null;
  }
}

export async function sendAffiliateApplicationConfirmation(toEmail: string, name: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return null;
  const resend = new Resend(resendApiKey);

  try {
    return await resend.emails.send({
      from: 'Smart Invites Partners <info@smartinvites.com.pk>',
      to: [toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: "We've Received Your Smart Invites Partner Application! 🤝",
      text: `Application Received\n\nHi ${name},\n\nThank you for applying to the Smart Invites Partner Program!\n\nWe have received your application and our team is currently reviewing your details. You will receive an email update within 24 to 48 hours once your application has been processed.\n\nBest regards,\nThe Smart Invites Team\nhttps://www.smartinvites.com.pk`,
      html: getEmailWrapper(
        'Application Received!',
        'Thank you for applying to the Smart Invites Partner Program.',
        `
          <h2 style="color: #022c22; margin-top: 0;">Application Received!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for applying to the <strong>Smart Invites Partner Program</strong>! We're excited about the opportunity to collaborate with you.</p>
          <p>Our team is currently reviewing your application. You will receive an email update with your unique referral link and dashboard access once approved (typically within <strong>24 to 48 hours</strong>).</p>
          
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #d4af37;">
            <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Status</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #022c22;">Under Review ⏳</p>
          </div>
          
          <p>If you have any questions in the meantime, simply reply to this email.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Smart Invites Team</strong></p>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending affiliate applicant confirmation via Resend:', error);
    return null;
  }
}

export async function sendDraftRecoveryEmail(toEmail: string, plan: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return null;
  const resend = new Resend(resendApiKey);

  try {
    return await resend.emails.send({
      from: 'Smart Invites <info@smartinvites.com.pk>',
      to: [toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: 'Save 10% on your Smart Invites Invitation! 🎁',
      text: `Your invitation is waiting for you!\n\nHi there,\n\nWe noticed you started designing your ${plan} plan invitation but haven't completed it yet.\n\nUse Promo Code: WELCOME10 for 10% OFF when you upgrade to active.\n\nContinue Editing: https://www.smartinvites.com.pk/dashboard\n\nNeed help? Just reply to this email!`,
      html: getEmailWrapper(
        "Finish Your Masterpiece",
        "Complete your digital invitation today and get 10% OFF.",
        `
          <h2 style="color: #022c22; margin-top: 0;">Your invitation is waiting for you!</h2>
          <p>Hi there,</p>
          <p>We noticed you started designing your beautiful <strong>${plan}</strong> plan invitation but haven't completed it yet.</p>
          <p>Your draft is saved securely in your dashboard. To help you cross this off your wedding to-do list, we're offering a special <strong>10% OFF</strong> coupon when you activate your invitation.</p>
          
          <div style="background-color: #022c22; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; border: 1px dashed #d4af37;">
            <p style="margin: 0; color: #a7f3d0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Use Promo Code</p>
            <p style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 800; letter-spacing: 2px;">WELCOME10</p>
          </div>
          
          <p style="text-align: center; color: #64748b; font-size: 14px; font-style: italic; margin-bottom: 30px;">(Valid for a limited time on any premium plan)</p>
          
          <center>
            <a href="https://smartinvites.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Continue Editing</a>
          </center>
          
          <br/><br/>
          <p>Need help choosing a template or have questions? Just reply to this email, and our team will be happy to assist you.</p>
          <p>Best wishes,</p>
          <p><strong>The Smart Invites Team</strong></p>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending Draft Recovery email via Resend:', error);
    return null;
  }
}
