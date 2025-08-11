
'use server';

import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required."),
});

export async function signupUser(values: z.infer<typeof signupSchema>) {
  const validation = signupSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: values.email });
    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);

    await usersCollection.insertOne({
      email: values.email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return { success: true, message: 'Signup successful!' };
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
    const db = client.db();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: values.email });
    if (!user) {
      return { success: false, message: 'User not found. Please sign up.' };
    }

    const isPasswordValid = await bcrypt.compare(values.password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    const { password, ...userWithoutPassword } = user;

    return { success: true, message: 'Login successful!', user: { email: user.email, name: user.email.split('@')[0] } };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
