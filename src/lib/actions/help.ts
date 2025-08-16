
'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';
import { getCurrentUser } from './auth';

const helpFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

function getTransporter() {
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

const helpQueryEmailTemplate = (name: string, email: string, message: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
    <h2 style="color: #333;">New Help Query from AdFleek</h2>
    <p><strong>From:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
    <h3>Message:</h3>
    <p style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
      ${message.replace(/\n/g, '<br>')}
    </p>
  </div>
`;

export async function sendHelpQuery(values: z.infer<typeof helpFormSchema>) {
    const validation = helpFormSchema.safeParse(values);
    if (!validation.success) {
        return { success: false, message: 'Invalid input.' };
    }
    
    const { name, email, message } = validation.data;
    const recipientEmail = process.env.EMAIL_FROM;

    if (!recipientEmail) {
        console.error("EMAIL_FROM environment variable is not set.");
        return { success: false, message: 'Server configuration error: Recipient email is not set.' };
    }

    const transporter = getTransporter();

    if (!transporter) {
        console.log('--- EMAIL SENDING SKIPPED (NO CREDENTIALS) ---');
        console.log('Help Query Details:');
        console.log(`  Name: ${name}`);
        console.log(`  Email: ${email}`);
        console.log(`  Message: ${message}`);
        return { success: true, message: 'Query submitted (dev mode). Email not sent.' };
    }

    try {
        await transporter.sendMail({
            from: `"AdFleek Support" <${recipientEmail}>`,
            to: recipientEmail,
            replyTo: email,
            subject: `New AdFleek Help Query from ${name}`,
            html: helpQueryEmailTemplate(name, email, message),
        });

        return { success: true, message: 'Your message has been sent successfully.' };
    } catch (error) {
        console.error('sendHelpQuery error:', error);
        return { success: false, message: 'An unexpected error occurred while sending your message.' };
    }
}
