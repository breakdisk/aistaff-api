require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors({
  origin: ['https://www.aistaff.ph', 'https://aistaff.ph', 'http://localhost']
}));
app.use(express.json());

// ── GOOGLE SHEETS AUTH ───────────────────────────────────────
const sheetsAuth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// ── SES SMTP TRANSPORTER ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ── EMAIL TEMPLATES ──────────────────────────────────────────
function hiringEmail(name) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7f9fc;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#050d1a;padding:28px 40px;text-align:center;">
            <img src="https://www.aistaff.ph/logo-white.png" alt="AiStaff — Future Workforce" style="height:55px;width:auto;display:block;margin:0 auto;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="font-size:24px;font-weight:800;color:#1a2340;margin:0 0 16px;">Welcome to AiStaff, ${name}.</h1>
            <p style="font-size:16px;color:#475569;line-height:1.7;margin:0 0 24px;">
              Thank you for joining AiStaff — the Philippines' #1 AI talent marketplace. You're now one step closer to building your AI-powered team.
            </p>
            <div style="background:#f0f7ff;border-left:4px solid #1a73e8;border-radius:8px;padding:20px 24px;margin-bottom:32px;">
              <div style="font-size:13px;font-weight:700;color:#1a73e8;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">What happens next</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;vertical-align:top;padding:4px 12px 12px 0;">
                    <div style="width:28px;height:28px;background:#1a73e8;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">1</div>
                  </td>
                  <td style="padding-bottom:12px;">
                    <div style="font-weight:600;color:#1a2340;font-size:15px;">Our team reviews your request</div>
                    <div style="color:#64748b;font-size:14px;margin-top:2px;">We'll reach out to understand your exact hiring needs.</div>
                  </td>
                </tr>
                <tr>
                  <td style="width:32px;vertical-align:top;padding:4px 12px 12px 0;">
                    <div style="width:28px;height:28px;background:#1a73e8;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">2</div>
                  </td>
                  <td style="padding-bottom:12px;">
                    <div style="font-weight:600;color:#1a2340;font-size:15px;">AI matching begins</div>
                    <div style="color:#64748b;font-size:14px;margin-top:2px;">Our system scores and ranks pre-vetted Filipino AI professionals for your role.</div>
                  </td>
                </tr>
                <tr>
                  <td style="width:32px;vertical-align:top;padding:4px 12px 0 0;">
                    <div style="width:28px;height:28px;background:#22c55e;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">3</div>
                  </td>
                  <td>
                    <div style="font-weight:600;color:#1a2340;font-size:15px;">Receive your shortlist</div>
                    <div style="color:#64748b;font-size:14px;margin-top:2px;">You get a ranked shortlist of top candidates — within 48 hours.</div>
                  </td>
                </tr>
              </table>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://www.aistaffglobal.com/login" style="display:inline-block;background:#F97316;color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                    Access Your Account &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f7f9fc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="font-size:13px;color:#94a3b8;margin:0 0 8px;">AiStaff &mdash; Future Workforce &bull; Philippines</p>
            <p style="font-size:12px;color:#94a3b8;margin:0;">
              <a href="https://www.aistaff.ph" style="color:#1a73e8;text-decoration:none;">www.aistaff.ph</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function freelancerEmail(name) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7f9fc;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#050d1a;padding:28px 40px;text-align:center;">
            <img src="https://www.aistaff.ph/logo-white.png" alt="AiStaff — Future Workforce" style="height:55px;width:auto;display:block;margin:0 auto;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="font-size:24px;font-weight:800;color:#1a2340;margin:0 0 16px;">You're in, ${name}.</h1>
            <p style="font-size:16px;color:#475569;line-height:1.7;margin:0 0 24px;">
              Welcome to AiStaff — where top Filipino AI talent connects with global opportunities. We're excited to have you on board.
            </p>
            <div style="background:#f0fff4;border-left:4px solid #22c55e;border-radius:8px;padding:20px 24px;margin-bottom:32px;">
              <div style="font-size:13px;font-weight:700;color:#16a34a;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">What happens next</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;vertical-align:top;padding:4px 12px 12px 0;">
                    <div style="width:28px;height:28px;background:#22c55e;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">1</div>
                  </td>
                  <td style="padding-bottom:12px;">
                    <div style="font-weight:600;color:#1a2340;font-size:15px;">Complete your profile</div>
                    <div style="color:#64748b;font-size:14px;margin-top:2px;">Log in and add your skills, portfolio, and experience to get matched faster.</div>
                  </td>
                </tr>
                <tr>
                  <td style="width:32px;vertical-align:top;padding:4px 12px 12px 0;">
                    <div style="width:28px;height:28px;background:#22c55e;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">2</div>
                  </td>
                  <td style="padding-bottom:12px;">
                    <div style="font-weight:600;color:#1a2340;font-size:15px;">AI vetting begins</div>
                    <div style="color:#64748b;font-size:14px;margin-top:2px;">Our system scores your profile across 40+ dimensions. Top performers get priority placement.</div>
                  </td>
                </tr>
                <tr>
                  <td style="width:32px;vertical-align:top;padding:4px 12px 0 0;">
                    <div style="width:28px;height:28px;background:#1a73e8;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">3</div>
                  </td>
                  <td>
                    <div style="font-weight:600;color:#1a2340;font-size:15px;">Get matched with global clients</div>
                    <div style="color:#64748b;font-size:14px;margin-top:2px;">Roles are matched to your skills. Expect opportunities within 48 hours.</div>
                  </td>
                </tr>
              </table>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://www.aistaffglobal.com/login" style="display:inline-block;background:#F97316;color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                    Complete Your Profile &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f7f9fc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="font-size:13px;color:#94a3b8;margin:0 0 8px;">AiStaff &mdash; Future Workforce &bull; Philippines</p>
            <p style="font-size:12px;color:#94a3b8;margin:0;">
              <a href="https://www.aistaff.ph" style="color:#1a73e8;text-decoration:none;">www.aistaff.ph</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── HEALTH CHECK ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── FORM SUBMIT ──────────────────────────────────────────────
app.post('/submit', async (req, res) => {
  const { name, email, role, detail } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  try {
    // 1. Append row to Google Sheets
    const client = await sheetsAuth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          name,
          email,
          role === 'hirer' ? 'Hiring' : 'Freelancer',
          detail || ''
        ]],
      },
    });

    // 2. Send confirmation email to user
    const isHiring = role === 'hirer';
    await transporter.sendMail({
      from: `"AiStaff" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: isHiring
        ? 'Welcome to AiStaff — Your AI Talent Search Starts Here'
        : 'Welcome to AiStaff — Your AI Career Starts Here',
      html: isHiring ? hiringEmail(name) : freelancerEmail(name),
    });

    // 3. Notify admin
    await transporter.sendMail({
      from: `"AiStaff Form" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_FROM,
      subject: `New Sign-Up [${isHiring ? 'HIRING' : 'FREELANCER'}] — ${name}`,
      html: `
        <p><b>Date:</b> ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</p>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Role:</b> ${isHiring ? 'Hiring' : 'Freelancer'}</p>
        <p><b>Company / Skill:</b> ${detail || 'N/A'}</p>
      `,
    });

    res.json({ success: true });

  } catch (err) {
    console.error('Submit error:', err.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AiStaff API running on port ${PORT}`));
