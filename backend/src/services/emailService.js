const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (toEmail, name, verificationLink) => {
  try {
    await resend.emails.send({
      from: 'VPX <onboarding@resend.dev>',
      to: toEmail,
      subject: 'Verify your VPX account',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Welcome to VPX, ${name}!</h2>
          <p>Please verify your email address to activate your account.</p>
          <a href="${verificationLink}" style="display:inline-block; padding:12px 24px; background:#4D7EFF; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
            Verify Email
          </a>
          <p style="color:#6B7280; font-size:0.85rem; margin-top:24px;">
            If you didn't create a VPX account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`✓ Verification email sent to ${toEmail}`);
  } catch (err) {
    console.log('Email send error:', err.message);
  }
};

module.exports = { sendVerificationEmail };
