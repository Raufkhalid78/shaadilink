import { Resend } from 'resend';
import { getEmailWrapper } from './email-templates';

// Initialize the Resend client. 
// Note: It will only work if RESEND_API_KEY is present in your environment
const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Helper utility to send a welcome email to new newsletter subscribers.
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
      text: `Welcome to Smart Invites!\n\nHi there,\n\nThank you for subscribing to our newsletter! We're thrilled to have you join our community.\n\nYou'll be the first to know about our newest event and wedding templates, exclusive offers, and platform updates.\n\nBest regards,\nThe Smart Invites Team\nhttps://www.smartinvites.com.pk`,
      html: getEmailWrapper(
        'Welcome to Smart Invites!',
        'Thank you for subscribing to our newsletter!',
        `
          <h2 style="color: #022c22; margin-top: 0;">Welcome to Smart Invites!</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing to our newsletter! We're thrilled to have you join our community.</p>
          <p>You'll be the first to know about our newest event and wedding templates, exclusive offers, and platform updates.</p>
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

/**
 * Send RSVP notification email to invitation owner.
 */
export async function sendRsvpNotification(
  toEmail: string,
  guestName: string,
  status: 'accept' | 'decline',
  details?: {
    adultsCount?: number;
    childrenCount?: number;
    dietaryNotes?: string;
    attendingEvents?: string[];
  }
) {
  if (!resend) return null;

  try {
    const statusColor = status === 'accept' ? '#059669' : '#dc2626';
    const statusText = status === 'accept' ? 'Accepted' : 'Declined';
    
    let detailsHtml = '';
    let detailsText = '';
    if (status === 'accept' && details) {
      const parts: string[] = [];
      if ((details.adultsCount ?? 0) > 0) parts.push(`${details.adultsCount} Adult${(details.adultsCount ?? 0) > 1 ? 's' : ''}`);
      if ((details.childrenCount ?? 0) > 0) parts.push(`${details.childrenCount} Child${(details.childrenCount ?? 0) > 1 ? 'ren' : ''}`);
      const headcountStr = parts.join(', ') || '1 Guest';

      detailsText += `\nHeadcount: ${headcountStr}`;
      if (details.attendingEvents && details.attendingEvents.length > 0) {
        detailsText += `\nCeremonies: ${details.attendingEvents.join(', ')}`;
      }
      if (details.dietaryNotes) {
        detailsText += `\nDietary / Allergies: ${details.dietaryNotes}`;
      }

      detailsHtml = `
        <div style="margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 14px; color: #334155;">
          <p style="margin: 4px 0;"><strong>👥 Party Headcount:</strong> ${headcountStr}</p>
          ${details.attendingEvents && details.attendingEvents.length > 0 ? `<p style="margin: 4px 0;"><strong>🎉 Attending Ceremonies:</strong> ${details.attendingEvents.join(', ')}</p>` : ''}
          ${details.dietaryNotes ? `<p style="margin: 4px 0;"><strong>🥗 Dietary Notes / Allergies:</strong> ${details.dietaryNotes}</p>` : ''}
        </div>
      `;
    }
    
    return await resend.emails.send({
      from: 'Smart Invites <info@smartinvites.com.pk>',
      to: [toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: `New RSVP: ${guestName} has ${statusText.toLowerCase()}`,
      text: `New RSVP Received\n\nHi there,\n\n${guestName} has just submitted an RSVP for your invitation.\nStatus: ${statusText}${detailsText}\n\nView All RSVPs: https://www.smartinvites.com.pk/dashboard`,
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
            ${detailsHtml}
          </div>
          
          <br/>
          <center>
            <a href="https://www.smartinvites.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View All RSVPs</a>
          </center>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending RSVP email via Resend:', error);
    return null;
  }
}

/**
 * Send guest wish notification email to invitation owner.
 */
export async function sendWishNotification(toEmail: string, guestName: string, message: string) {
  if (!resend) return null;

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
            <a href="https://www.smartinvites.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View All Wishes</a>
          </center>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending Wish email via Resend:', error);
    return null;
  }
}

/**
 * Send abandoned checkout recovery discount email.
 */
export async function sendRecoveryEmail(toEmail: string, orderId: string, plan: string) {
  if (!resend) return null;

  try {
    return await resend.emails.send({
      from: 'Smart Invites <info@smartinvites.com.pk>',
      to: [toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: 'Complete Your Dream Invitation & Get 10% Off! 🎁',
      text: `Don't lose your progress!\n\nHi there,\n\nWe noticed you started setting up your ${plan} plan invitation but didn't complete the payment.\n\nUse Promo Code: EARLYBIRD10 for 10% OFF.\n\nComplete My Invitation: https://www.smartinvites.com.pk/dashboard\n\nNeed help? Just reply to this email!`,
      html: getEmailWrapper(
        "Don't lose your progress!",
        "Complete your order today and get 10% off your digital invitation.",
        `
          <h2 style="color: #022c22; margin-top: 0;">Don't lose your progress!</h2>
          <p>Hi there,</p>
          <p>We noticed you started setting up your <strong>${plan}</strong> plan invitation but didn't complete the payment.</p>
          <p>We know planning an event can be overwhelming, so we'd love to help you cross one thing off your list! For a limited time, you can complete your order and get <strong>10% OFF</strong> your digital invitation.</p>
          
          <div style="background-color: #022c22; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; border: 1px dashed #d4af37;">
            <p style="margin: 0; color: #a7f3d0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Use Promo Code</p>
            <p style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 800; letter-spacing: 2px;">EARLYBIRD10</p>
          </div>
          
          <p style="text-align: center; color: #64748b; font-size: 14px; font-style: italic; margin-bottom: 30px;">(Hurry! This code is only valid for the first 10 people who use it.)</p>
          
          <center>
            <a href="https://www.smartinvites.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Complete My Invitation</a>
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

/**
 * Send alert to admin when a new affiliate application is submitted.
 */
export async function sendAffiliateApplicationAdminAlert(data: {
  name: string;
  email: string;
  socialId?: string | null;
  promotionPlan: string;
}) {
  if (!resend) return null;

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

/**
 * Send confirmation email to user when they apply for the affiliate program.
 */
export async function sendAffiliateApplicationConfirmation(toEmail: string, name: string) {
  if (!resend) return null;

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

/**
 * Send admin email alert when a new Agency / Event Planner application is submitted.
 */
export async function sendAgencyApplicationAdminAlert(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city?: string;
  websiteOrSocial?: string;
  monthlyEvents?: string;
  notes?: string;
}) {
  if (!resend) return null;

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'info@smartinvites.com.pk';
    return await resend.emails.send({
      from: 'Smart Invites System <info@smartinvites.com.pk>',
      to: [adminEmail],
      replyTo: data.email,
      subject: `New Agency Partner Application: ${data.companyName} 🏢`,
      text: `New Agency Partner Application Received!\n\nAgency/Company: ${data.companyName}\nContact Person: ${data.contactName}\nEmail: ${data.email}\nPhone/WhatsApp: ${data.phone}\nCity: ${data.city || 'N/A'}\nPortfolio/Social: ${data.websiteOrSocial || 'None'}\nMonthly Events: ${data.monthlyEvents || 'N/A'}\nNotes: ${data.notes || 'None'}\n\nReview & Approve in Admin Portal: https://www.smartinvites.com.pk/admin/affiliates`,
      html: getEmailWrapper(
        'New Agency Partner Application',
        `${data.companyName} has applied for Agency & Event Planner Partner access.`,
        `
          <h2 style="color: #022c22; margin-top: 0;">New Agency Partner Application 🏢</h2>
          <p>Hi Admin,</p>
          <p>An event planner or agency has applied for access to the <strong>Smart Invites Agency Workspace & Wholesale Portal</strong>.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>Agency / Company:</strong> <span style="font-size: 16px; font-weight: bold; color: #022c22;">${data.companyName}</span></p>
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>Contact Person:</strong> ${data.contactName}</p>
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #059669; text-decoration: none; font-weight: 600;">${data.email}</a></p>
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>Phone / WhatsApp:</strong> <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #25D366; text-decoration: none; font-weight: 600;">${data.phone}</a></p>
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>City / Region:</strong> ${data.city || 'Not provided'}</p>
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>Website / Instagram:</strong> ${data.websiteOrSocial ? `<a href="${data.websiteOrSocial}" target="_blank" style="color: #059669;">${data.websiteOrSocial}</a>` : 'Not provided'}</p>
            <p style="margin: 0 0 10px 0; color: #334155;"><strong>Estimated Monthly Events:</strong> ${data.monthlyEvents || 'Not specified'}</p>
            ${data.notes ? `
            <p style="margin: 15px 0 5px 0; color: #334155;"><strong>Agency Bio / Notes:</strong></p>
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; color: #1e293b; font-size: 14px; line-height: 1.6;">
              ${data.notes.replace(/\n/g, '<br/>')}
            </div>
            ` : ''}
          </div>
          
          <br/>
          <center>
            <a href="https://www.smartinvites.com.pk/admin/affiliates" style="background-color: #d4af37; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Review &amp; Approve Agency</a>
          </center>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending agency admin alert via Resend:', error);
    return null;
  }
}

/**
 * Send confirmation email to applicant when they apply for Agency & Planner Partner access.
 */
export async function sendAgencyApplicationConfirmation(toEmail: string, contactName: string, companyName: string) {
  if (!resend) return null;

  try {
    return await resend.emails.send({
      from: 'Smart Invites Partners <info@smartinvites.com.pk>',
      to: [toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: "We've Received Your Smart Invites Agency Partner Application! 🏢",
      text: `Agency Application Received\n\nHi ${contactName},\n\nThank you for applying to the Smart Invites Agency & Planner Partner Program on behalf of ${companyName}!\n\nOur team is currently reviewing your agency details and portfolio. A partnership manager will reach out via WhatsApp / Email within 24 to 48 hours to activate your wholesale credits and white-label access.\n\nBest regards,\nThe Smart Invites Team\nhttps://www.smartinvites.com.pk`,
      html: getEmailWrapper(
        'Agency Application Received',
        `Thank you for applying for Agency Partner access for ${companyName}.`,
        `
          <h2 style="color: #022c22; margin-top: 0;">Agency Application Received! 🏢</h2>
          <p>Hi ${contactName},</p>
          <p>Thank you for applying for the <strong>Smart Invites Agency &amp; Event Planner Partner Program</strong> on behalf of <strong>${companyName}</strong>!</p>
          <p>Our partnership team is currently reviewing your submission. Once approved, your account will unlock:</p>
          
          <ul style="color: #334155; line-height: 1.8; margin: 15px 0;">
            <li><strong>Wholesale Credit Wallet</strong>: Purchase bulk invitation credits at up to 50% discount.</li>
            <li><strong>100% White-Label Branding</strong>: Seamlessly replace Smart Invites footer branding with your own agency name, logo, website, and phone number.</li>
            <li><strong>Multi-Client Workspace</strong>: Organize all client invitations, RSVPs, and guest links in one command center.</li>
            <li><strong>Branded Invoicing &amp; Review Links</strong>: Share watermarked client review links and issue itemized PDF invoices in PKR.</li>
          </ul>
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 18px; margin: 25px 0; border-left: 4px solid #d4af37;">
            <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Application Status</p>
            <p style="margin: 5px 0 0 0; font-size: 17px; font-weight: bold; color: #022c22;">Under Review ⏳ (24 - 48 Hours)</p>
          </div>
          
          <p>A partnership manager may also connect with you directly via WhatsApp to verify your portfolio and assist with your first batch of wholesale credits.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Smart Invites Team</strong><br/><a href="https://www.smartinvites.com.pk" style="color: #059669; text-decoration: none;">www.smartinvites.com.pk</a></p>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending agency applicant confirmation via Resend:', error);
    return null;
  }
}

/**
 * Send draft recovery email with coupon to user who started building an invitation.
 */
export async function sendDraftRecoveryEmail(toEmail: string, plan: string) {
  if (!resend) return null;

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
          <p>Your draft is saved securely in your dashboard. To help you cross this off your event planning list, we're offering a special <strong>10% OFF</strong> coupon when you activate your invitation.</p>
          
          <div style="background-color: #022c22; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; border: 1px dashed #d4af37;">
            <p style="margin: 0; color: #a7f3d0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Use Promo Code</p>
            <p style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 800; letter-spacing: 2px;">WELCOME10</p>
          </div>
          
          <p style="text-align: center; color: #64748b; font-size: 14px; font-style: italic; margin-bottom: 30px;">(Valid for a limited time on any premium plan)</p>
          
          <center>
            <a href="https://www.smartinvites.com.pk/dashboard" style="background-color: #d4af37; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Continue Editing</a>
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

/**
 * Send order confirmation & activation receipt to customer upon successful payment.
 */
export async function sendOrderConfirmationEmail(data: {
  toEmail: string;
  orderId: string;
  plan: string;
  amount: number;
  currency?: string;
  invitationUrl?: string;
}) {
  if (!resend) return null;

  try {
    const planName = data.plan.charAt(0).toUpperCase() + data.plan.slice(1);
    const curr = data.currency || 'PKR';
    const invLink = data.invitationUrl || 'https://www.smartinvites.com.pk/dashboard';

    return await resend.emails.send({
      from: 'Smart Invites Orders <info@smartinvites.com.pk>',
      to: [data.toEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject: `Order Confirmed: Your ${planName} Plan is Active! 🎉`,
      text: `Order Confirmed!\n\nHi there,\n\nYour payment for the ${planName} Plan (${data.amount.toLocaleString()} ${curr}) was successful.\nOrder ID: ${data.orderId}\n\nView Your Invitation: ${invLink}\n\nThank you for choosing Smart Invites!`,
      html: getEmailWrapper(
        'Order Confirmed!',
        `Your ${planName} Plan invitation is now active.`,
        `
          <h2 style="color: #022c22; margin-top: 0;">Payment Successful! 🎉</h2>
          <p>Hi there,</p>
          <p>Thank you for your order! Your payment has been processed successfully and your <strong>${planName} Plan</strong> is now active.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Plan:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #022c22;">${planName} Plan</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Amount Paid:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #059669;">${data.amount.toLocaleString()} ${curr}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Order Reference:</td>
                <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #334155;">${data.orderId.slice(0, 13)}</td>
              </tr>
            </table>
          </div>
          
          <center>
            <a href="${invLink}" style="background-color: #d4af37; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">View &amp; Manage Invitation</a>
          </center>
          
          <br/><br/>
          <p>You can make unlimited edits to your invitation details, view RSVPs in real time, and generate personalized guest links anytime from your dashboard.</p>
          <p>Best regards,</p>
          <p><strong>The Smart Invites Team</strong></p>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending order confirmation email via Resend:', error);
    return null;
  }
}

/**
 * Send admin notification email when a user submits a manual bank transfer slip.
 */
export async function sendManualBankTransferAdminAlert({
  orderId,
  userEmail,
  amount,
  transactionRef,
  senderDetails,
  receiptUrl,
  plan,
  invitationTitle,
}: {
  orderId: string;
  userEmail: string;
  amount: number;
  transactionRef: string;
  senderDetails?: string;
  receiptUrl?: string;
  plan: string;
  invitationTitle: string;
}) {
  if (!resend) return null;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartinvites.com.pk';

  try {
    return await resend.emails.send({
      from: 'Smart Invites Orders <info@smartinvites.com.pk>',
      to: [adminEmail],
      replyTo: userEmail,
      subject: `[Manual Bank Transfer] Rs. ${amount.toLocaleString()} - ${invitationTitle} (Ref: ${transactionRef})`,
      text: `New Manual Bank Transfer Order Submitted!\n\nOrder ID: ${orderId}\nCustomer: ${userEmail}\nEvent: ${invitationTitle}\nPlan: ${plan}\nAmount: Rs. ${amount.toLocaleString()}\nTransaction Ref: ${transactionRef}\nSender Details: ${senderDetails || 'N/A'}\nReceipt URL: ${receiptUrl || 'None'}\n\nPlease review and approve in your Admin Panel:\nhttps://www.smartinvites.com.pk/admin/orders`,
      html: getEmailWrapper(
        'Manual Bank Transfer Order',
        `New manual payment verification required: Rs. ${amount.toLocaleString()}`,
        `
          <h2 style="color: #022c22; margin-top: 0;">New Manual Bank Transfer Submitted</h2>
          <p>A customer has uploaded a bank transfer receipt and submitted an order for review.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Event Title:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #022c22;">${invitationTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Customer:</td>
                <td style="padding: 6px 0; text-align: right; color: #334155;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Plan:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; text-transform: uppercase;">${plan}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Amount:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #059669; font-size: 16px;">Rs. ${amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Transaction Ref:</td>
                <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold; color: #1e293b;">${transactionRef}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Sender Details:</td>
                <td style="padding: 6px 0; text-align: right; color: #475569;">${senderDetails || 'N/A'}</td>
              </tr>
            </table>
          </div>

          ${receiptUrl ? `
            <div style="margin: 20px 0; text-align: center;">
              <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Uploaded Receipt Slip:</p>
              <a href="${receiptUrl}" target="_blank">
                <img src="${receiptUrl}" alt="Payment Receipt" style="max-width: 100%; max-height: 360px; border-radius: 8px; border: 1px solid #cbd5e1;" />
              </a>
            </div>
          ` : ''}

          <center style="margin-top: 25px;">
            <a href="https://www.smartinvites.com.pk/admin/orders" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Open Admin Orders to Approve</a>
          </center>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending manual bank transfer admin alert via Resend:', error);
    return null;
  }
}

/**
 * Send email alert to event planner/agency and admin when client approves an invitation or requests changes.
 */
export async function sendClientReviewNotification(data: {
  toEmail: string;
  plannerName?: string;
  eventTitle: string;
  invitationId: string;
  slug?: string;
  status: 'approved' | 'changes_requested';
  notes?: string | null;
  approvedAt?: string;
  previewUrl?: string;
  agencyName?: string;
}) {
  if (!resend) return null;

  try {
    const isApproved = data.status === 'approved';
    const title = data.eventTitle || 'Event Invitation';
    const planner = data.plannerName || data.agencyName || 'Event Planner';
    const subject = isApproved
      ? `🎉 Client Approved: "${title}" Invitation Draft is Ready to Publish!`
      : `✏️ Revision Requested: Client Left Feedback for "${title}"`;
    const preheader = isApproved
      ? `Your client has approved the "${title}" invitation draft.`
      : `Your client requested revisions on "${title}".`;

    const adminEmail = process.env.ADMIN_EMAIL || 'info@smartinvites.com.pk';
    const cockpitUrl = 'https://www.smartinvites.com.pk/dashboard/agency';
    const editUrl = `https://www.smartinvites.com.pk/create?edit=${data.invitationId}&agency=true`;

    return await resend.emails.send({
      from: 'Smart Invites Client Review <info@smartinvites.com.pk>',
      to: [data.toEmail],
      bcc: [adminEmail],
      replyTo: 'info@smartinvites.com.pk',
      subject,
      text: isApproved
        ? `Client Approved!\n\nHi ${planner},\n\nGreat news! Your client has reviewed and APPROVED the draft invitation for "${title}".\n\nYou can now activate and publish it with 1 wholesale credit from your Agency Cockpit:\n${cockpitUrl}\n\nSmart Invites Team`
        : `Client Requested Changes!\n\nHi ${planner},\n\nYour client has reviewed the draft invitation for "${title}" and requested the following changes:\n\n"${data.notes || 'Revisions requested.'}"\n\nPlease update the invitation here:\n${editUrl}\n\nSmart Invites Team`,
      html: getEmailWrapper(
        isApproved ? 'Client Approved Invitation Draft' : 'Client Requested Changes',
        preheader,
        `
          <h2 style="color: ${isApproved ? '#059669' : '#d97706'}; margin-top: 0;">
            ${isApproved ? '🎉 Invitation Draft Approved by Client!' : '✏️ Client Requested Revisions'}
          </h2>
          <p>Hi ${planner},</p>
          <p>
            ${isApproved
              ? `Great news! Your client has completed their review and <strong>APPROVED</strong> the invitation draft for <strong>${title}</strong>.`
              : `Your client has reviewed their invitation draft for <strong>${title}</strong> and submitted revision requests.`
            }
          </p>

          ${!isApproved && data.notes ? `
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 18px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #b45309; letter-spacing: 1px;">Client Revision Notes:</p>
              <p style="margin: 0; font-size: 15px; color: #78350f; line-height: 1.6; white-space: pre-wrap;">${data.notes}</p>
            </div>
          ` : ''}

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Event Title:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #022c22;">${title}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Review Status:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: ${isApproved ? '#059669' : '#d97706'};">
                  ${isApproved ? 'APPROVED ✓' : 'CHANGES REQUESTED ✏️'}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Updated At:</td>
                <td style="padding: 6px 0; text-align: right; color: #334155;">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} PKT</td>
              </tr>
            </table>
          </div>

          <center style="margin: 30px 0;">
            <a href="${isApproved ? cockpitUrl : editUrl}" style="background-color: ${isApproved ? '#059669' : '#d4af37'}; color: ${isApproved ? '#ffffff' : '#111827'}; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              ${isApproved ? 'Open Agency Cockpit to Publish' : 'Edit Invitation in Cockpit'}
            </a>
          </center>

          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">
            ${isApproved
              ? 'You can now publish and unlock the live invitation link for wedding guests with 1 wholesale credit.'
              : 'Once you have made the updates, you can resend the review link to your client.'
            }
          </p>
          <p>Best regards,<br/><strong>The Smart Invites Team</strong></p>
        `
      ),
    });
  } catch (error) {
    console.error('Error sending client review notification email via Resend:', error);
    return null;
  }
}


