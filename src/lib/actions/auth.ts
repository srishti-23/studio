
'use server';

import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { cookies, headers } from 'next/headers';

// --- SCHEMAS ---
const signupSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

const googleUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  uid: z.string(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits.'),
});

const passwordResetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
    token: z.string().min(1, 'Token is missing.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

// --- COOKIE HELPERS ---
function setUserCookie(user: {id: string, name: string, email: string}) {
  cookies().set('user', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function setCurrentUser(user: {id: string, name: string, email: string}) {
    setUserCookie(user);
    return { success: true };
}


export async function getCurrentUser() {
    const userCookie = cookies().get('user');
    if (!userCookie) return null;
    try {
        const userData = JSON.parse(userCookie.value);
        // Basic validation of the cookie payload
        if (!userData || !userData.id || !userData.email || !userData.name) {
             cookies().set('user', '', { path: '/', maxAge: 0 }); // Clear malformed cookie
             return null;
        }
        return userData as { id: string; email: string; name: string };
    } catch (e) {
        // Clear cookie if parsing fails
        cookies().set('user', '', { path: '/', maxAge: 0 });
        return null;
    }
}


export async function logout() {
  cookies().set('user', '', { path: '/', maxAge: 0 });
  return { success: true };
}

// --- EMAIL HELPERS ---
function getTransporter() {
  // Use .env.local variables
  const emailFrom = process.env.EMAIL_FROM;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_SERVER_HOST;
  const emailPort = process.env.EMAIL_SERVER_PORT;

  if (!emailFrom || !emailPassword || !emailHost || !emailPort) {
    console.warn('Email credentials are not set in .env.local file. Email sending will be skipped.');
    return null;
  }
  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort, 10),
    secure: parseInt(emailPort, 10) === 465,
    auth: {
      user: emailFrom,
      pass: emailPassword,
    },
  });
}

const otpEmailTemplate = (otp: string) => `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
    <h2>AdFleek Email Verification</h2>
    <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your account:</p>
    <h2 style="font-size: 24px; letter-spacing: 4px; margin: 20px 0;">${otp}</h2>
    <p>This OTP is valid for 5 minutes. If you did not request this, please disregard this email.</p>
  </div>
`;

const passwordResetTemplate = (name: string, url: string) => `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
    <h2>AdFleek Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset your password. Please click the link below to set a new password:</p>
    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4A4A4A; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px;">Reset Password</a>
    <p style="margin-top: 20px;">This link is valid for 1 hour. If you did not request a password reset, please ignore this email.</p>
  </div>
`;

// --- AUTH ACTIONS ---

export async function sendVerificationOtp(email: string) {
  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser && existingUser.emailVerified) {
      return { success: false, message: 'This email is already verified.' };
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otp, 10);

    await users.updateOne(
      { email },
      { $set: { otp: hashedOtp, otpExpires } },
      { upsert: true }
    );

    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"AdFleek" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Your AdFleek Verification Code',
        html: otpEmailTemplate(otp),
      });
      return { success: true, message: 'OTP sent to your email.' };
    } else {
      console.log('--- EMAIL SENDING SKIPPED ---');
      console.log(`OTP for ${email}: ${otp}`);
      return { success: true, message: `OTP sent (testing): ${otp}`, otp };
    }
  } catch (error) {
    console.error('sendVerificationOtp error:', error);
    return { success: false, message: 'Could not send OTP.' };
  }
}

export async function signupUser(values: z.infer<typeof signupSchema>, otp: string) {
  const validation = signupSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  const otpValidation = verifyOtpSchema.safeParse({ email: values.email, otp });
  if (!otpValidation.success) {
    return { success: false, message: 'Invalid OTP format.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const users = db.collection('users');

    const user = await users.findOne({ email: values.email });

    if (!user || !user.otp) {
      return { success: false, message: 'Please request an OTP first.' };
    }
    if (user.otpExpires && new Date() > user.otpExpires) {
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return { success: false, message: 'Invalid OTP.' };
    }

    const existingVerifiedUser = await users.findOne({ email: values.email, emailVerified: true });
    if (existingVerifiedUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);

    await users.updateOne(
      { email: values.email },
      {
        $set: {
          name: values.name,
          password: hashedPassword,
          emailVerified: true,
          createdAt: new Date(),
        },
        $unset: { otp: '', otpExpires: '' },
      }
    );

    const finalUser = await users.findOne({ email: values.email });
    if (!finalUser) {
      return { success: false, message: 'Could not finalize user creation.' };
    }

    const librariesCollection = db.collection('libraries');
    await librariesCollection.insertOne({
      userId: finalUser._id,
      images: [],
    });

    const u = { id: finalUser._id.toString(), email: finalUser.email, name: finalUser.name };
    setUserCookie(u);

    return { success: true, message: 'Signup successful!', user: u };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function loginUser(values: z.infer<typeof loginSchema>) {
  const validation = loginSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const users = db.collection('users');

    const user = await users.findOne({ email: values.email });
    if (!user || !user.password) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (!user.emailVerified) {
      return { success: false, message: 'Please verify your email before logging in.' };
    }

    const isPasswordValid = await bcrypt.compare(values.password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const u = { id: user._id.toString(), email: user.email, name: user.name };
    setUserCookie(u);

    return { success: true, message: 'Login successful!', user: u };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function findOrCreateUserFromGoogle(values: z.infer<typeof googleUserSchema>) {
  const validation = googleUserSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }
  const { email, name, uid } = values;

  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const users = db.collection('users');

    let user = await users.findOne({ email });

    if (!user) {
      const result = await users.insertOne({
        email,
        name,
        emailVerified: true,
        authProvider: 'google',
        googleUid: uid,
        createdAt: new Date(),
      });

      const librariesCollection = db.collection('libraries');
      await librariesCollection.insertOne({
        userId: result.insertedId,
        images: [],
      });

      user = await users.findOne({ _id: result.insertedId });
    }

    if (!user) {
      return { success: false, message: 'Could not find or create user.' };
    }

    const u = { id: user._id.toString(), email: user.email, name: user.name };
    // This is the crucial step: set the server-side cookie for Google Sign-In users
    setUserCookie(u);
    return { success: true, user: u };
  } catch (error) {
    console.error('Google user handling error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function sendPasswordResetLink(email: string) {
  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const users = db.collection('users');

    const user = await users.findOne({ email });
    // Always act successful to avoid email enumeration
    if (!user) {
      return { success: true, message: 'If an account with this email exists, a reset link has been sent.' };
    }

    // Generate token (plain) and store SHA-256 hash + expiry
    const token = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await users.updateOne(
      { _id: user._id },
      { $set: { resetPasswordToken, resetPasswordExpires } }
    );

    // ---------- Build base URL robustly ----------
    const h = headers();
    const proto = h.get('x-forwarded-proto') || 'http';
    const host  = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';

    // If you set NEXT_PUBLIC_APP_URL, we’ll use it **only if it looks sane**.
    const envBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
    const base =
      envBase.startsWith('http://') || envBase.startsWith('https://')
        ? envBase
        : `${proto}://${host}`;
    // ---------------------------------------------

    const resetUrl = `${base}/reset-password/${token}`;
    console.log('[sendPasswordResetLink] resetUrl =>', resetUrl); // verify in server console

    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"AdFleek" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Your AdFleek Password Reset Link',
        html: passwordResetTemplate(user.name || 'there', resetUrl),
      });
    } else {
      // Dev: no SMTP configured
      console.log('--- EMAIL SENDING SKIPPED (NO CREDENTIALS) ---');
      console.log(`Password reset link for ${email}: ${resetUrl}`);
      console.log('-------------------------------------------------');
    }

    return { success: true, message: 'If an account with this email exists, a reset link has been sent.' };
  } catch (error) {
    console.error('sendPasswordResetLink error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}


export async function resetPassword(values: z.infer<typeof passwordResetSchema>) {
    const validation = passwordResetSchema.safeParse(values);
    if (!validation.success) {
        const issues = validation.error.issues.map(issue => issue.message).join(' ');
        return { success: false, message: `Invalid input: ${issues}` };
    }

    try {
        const { password, token } = values;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const client = await clientPromise;
        const db = client.db('adfleek');
        const users = db.collection('users');

        const userToUpdate = await users.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!userToUpdate) {
            return { success: false, message: 'Invalid or expired password reset token.' };
        }

        if (userToUpdate.password) {
            const isPasswordSame = await bcrypt.compare(password, userToUpdate.password);
            if(isPasswordSame) {
                return { success: false, message: 'New password cannot be the same as the old password.' };
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await users.updateOne(
            { _id: userToUpdate._id },
            {
                $set: { password: hashedPassword },
                $unset: { resetPasswordToken: '', resetPasswordExpires: '' },
            }
        );

        return { success: true, message: 'Password has been reset successfully.' };
    } catch (error) {
        console.error('resetPassword error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
