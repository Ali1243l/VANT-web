import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { Resend } from 'resend';

function resendEmailPlugin(): Plugin {
  return {
    name: 'resend-email-plugin',
    configureServer(server) {
      const emailHandler = async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: string) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const apiKey =
              process.env.RESEND_API_KEY ||
              process.env.VITE_RESEND_API_KEY ||
              're_DgBbp68L_6UUeE8DRtYyyTgFMSrd7qSQo';

            const toEmail = (data.email || data.to || '').trim().toLowerCase();
            const subject = data.subject || 'Welcome to VANT // Access Granted';
            const couponCode = data.couponCode || 'VANT-WELCOME-15';
            const discountPercent = data.discountPercent || 15;
            const welcomeTitle = data.welcomeTitle || 'أهلاً بك في ڤانت // WELCOME TO THE ARCHIVE';
            const welcomeMessage =
              data.welcomeMessage ||
              'Your exclusive access is granted. Use the code below for your first curation.';
            const storeUrl = data.storeUrl || 'https://vant.fashion';

            if (!toEmail) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Recipient email required' }));
              return;
            }

            const htmlContent =
              data.html ||
              `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>VANT // WELCOME TO THE ARCHIVE</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f4f6;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0a0a0c; border: 1px solid rgba(255, 255, 255, 0.15); margin: 0 auto;">
    <tr><td style="padding: 12px 24px; background-color: #000000; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-family: Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #71717a; text-align: right;">VANT ARCHIVE // EDITION NO. 01 &bull; STATUS: VIP VERIFIED</td></tr>
    <tr><td align="center" style="padding: 36px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); background-color: #0a0a0c;"><h1 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-transform: uppercase;">VANT</h1><p style="margin: 8px 0 0 0; font-size: 10px; letter-spacing: 4px; color: #a1a1aa; text-transform: uppercase; font-family: Courier, monospace;">HIGH-FASHION ARCHIVE &bull; HAUTE STREETWEAR</p></td></tr>
    <tr><td style="padding: 44px 32px; background: linear-gradient(180deg, #11141c 0%, #0a0a0c 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.12);"><div style="display: inline-block; padding: 4px 12px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); font-size: 10px; font-family: Courier, monospace; letter-spacing: 2px; color: #d4d4d8; margin-bottom: 16px;">CONFIDENTIAL // VIP ACCESS</div><h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.4;">${welcomeTitle}</h2><p style="margin: 0; font-size: 13px; color: #d4d4d8; line-height: 1.6;">${welcomeMessage}</p></td></tr>
    <tr><td style="padding: 32px 32px 24px 32px; background-color: #0a0a0c;"><table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.2); padding: 24px;"><tr><td style="font-size: 10px; font-family: Courier, monospace; letter-spacing: 2px; color: #a1a1aa; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">WELCOME PRIVILEGE CODE &bull; <strong style="color: #60a5fa;">${discountPercent}% OFF CURATION</strong></td></tr><tr><td align="center" style="padding: 20px 0;"><div style="background-color: #000000; border: 1px solid rgba(255, 255, 255, 0.2); padding: 16px 24px; font-family: Courier, monospace; font-size: 26px; font-weight: 900; letter-spacing: 6px; color: #3b82f6; text-align: center;">${couponCode}</div></td></tr><tr><td style="font-size: 11px; font-family: Courier, monospace; color: #a1a1aa; text-align: center; padding-top: 6px;">&bull; Valid immediately across all archived drops and bespoke tailoring</td></tr></table></td></tr>
    <tr><td align="center" style="padding: 0 32px 36px 32px; background-color: #0a0a0c;"><a href="${storeUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #004ad7; color: #ffffff; text-decoration: none; padding: 18px 24px; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; text-align: center; border: 1px solid #3b82f6;">EXPLORE COLLECTION // تصفح التشكيلة</a></td></tr>
    <tr><td align="center" style="padding: 24px 32px; background-color: #050507; border-top: 1px solid rgba(255, 255, 255, 0.1); font-family: Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #71717a; text-align: center;"><p style="margin: 0 0 6px 0;">VANT ATELIER &bull; ARCHIVE PRIVILEGES &bull; ALL RIGHTS RESERVED</p><p style="margin: 0; font-size: 9px; color: #52525b;">Recipient: ${toEmail}</p></td></tr>
  </table>
</body>
</html>`;

            const resend = new Resend(apiKey);
            const result = await resend.emails.send({
              from: 'VANT Archive <onboarding@resend.dev>',
              to: [toEmail],
              subject,
              html: htmlContent,
            });

            if (result?.error) {
              res.statusCode = result.error.statusCode || 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: result.error.message, code: result.error.name }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: result.data }));
          } catch (err: any) {
            console.error('Vite Resend plugin error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
          }
        });
      };

      server.middlewares.use('/api/send-welcome', emailHandler);
      server.middlewares.use('/api/send-email', emailHandler);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), resendEmailPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
