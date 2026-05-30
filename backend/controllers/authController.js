import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { inngest } from '../inngest/client.js';

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP Email via Brevo fetch
const sendOTPEmail = async (email, otp, name) => {
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'myMart',
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [{ email }],
      subject: '🔐 Verify your myMart account',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a3c2e; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🛒 myMart</h1>
            <p style="color: #a7f3d0; margin: 5px 0 0;">Email Verification</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a3c2e;">Hi ${name}! 👋</h2>
            <p style="color: #666; font-size: 16px;">
              Use the OTP below to verify your email address.
              This OTP is valid for <strong>10 minutes</strong>.
            </p>
            <div style="background: #1a3c2e; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0;">
              <p style="color: #a7f3d0; margin: 0 0 8px; font-size: 14px;">Your Verification OTP</p>
              <h1 style="color: white; margin: 0; letter-spacing: 15px; font-size: 40px; font-family: monospace;">
                ${otp}
              </h1>
            </div>
            <p style="color: #999; font-size: 13px;">
              ⚠️ Do not share this OTP with anyone.<br/>
              If you didn't request this, ignore this email.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
              myMart Team | Fresh groceries delivered daily
            </p>
          </div>
        </div>
      `
    })
  });
};

// ✅ Step 1 — Send OTP
export const sendOTP = async (req, res) => {
  const { email, name } = req.body;
  try {
    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    if (userExists.rows.length > 0)
      return res.status(400).json({ message: 'User already exists with this email!' });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this email
    await pool.query('DELETE FROM email_otps WHERE email = $1', [email]);

    // Save new OTP
    await pool.query(
      'INSERT INTO email_otps (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    // Send OTP email
    await sendOTPEmail(email, otp, name || 'User');

    res.json({ message: 'OTP sent to your email!' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Try again!' });
  }
};

// ✅ Step 2 — Verify OTP + Register
export const register = async (req, res) => {
  const { name, email, password, otp } = req.body;
  try {
    // Check OTP
    const otpResult = await pool.query(
      'SELECT * FROM email_otps WHERE email = $1 AND otp = $2 AND verified = FALSE ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpResult.rows.length === 0)
      return res.status(400).json({ message: 'Invalid OTP. Please try again!' });

    const otpRecord = otpResult.rows[0];

    // Check expiry
    if (new Date() > new Date(otpRecord.expires_at))
      return res.status(400).json({ message: 'OTP expired! Please request a new one.' });

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    if (userExists.rows.length > 0)
      return res.status(400).json({ message: 'User already exists!' });

    // Mark OTP as verified
    await pool.query(
      'UPDATE email_otps SET verified = TRUE WHERE id = $1',
      [otpRecord.id]
    );

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, hashedPassword]
    );
    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send welcome email via Inngest
    await inngest.send({
      name: 'user/registered',
      data: { name: user.name, email: user.email }
    });

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};