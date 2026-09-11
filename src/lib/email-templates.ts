export function getEmailWrapper(title: string, preheader: string, content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafaf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <span style="display: none; font-size: 1px; color: #fafaf9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </span>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafaf9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #022c22; padding: 35px 20px; border-bottom: 2px solid #d4af37;">
              <a href="https://www.smartinvites.com.pk" style="text-decoration: none;">
                <h1 style="margin: 0; color: #d4af37; font-size: 30px; font-weight: 800; letter-spacing: 2px;">SMART INVITES</h1>
              </a>
              <p style="margin: 8px 0 0 0; color: #a7f3d0; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;">Luxury Digital Invitations</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px; color: #1f2937; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">&copy; ${new Date().getFullYear()} Smart Invites. All rights reserved.</p>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">Need help? Reply directly to this email or contact <br/><a href="mailto:info@smartinvites.com.pk" style="color: #059669; text-decoration: none; font-weight: 600;">info@smartinvites.com.pk</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
