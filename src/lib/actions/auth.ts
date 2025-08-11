
'use server';

import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

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

const googleUserSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    uid: z.string(),
});

export async function signupUser(values: z.infer<typeof signupSchema>) {
  const validation = signupSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db("adfleek");
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: values.email });
    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);

    const result = await usersCollection.insertOne({
      email: values.email,
      password: hashedPassword,
      createdAt: new Date(),
    });
    
    // Create an empty library for the new user
    const librariesCollection = db.collection('libraries');
    await librariesCollection.insertOne({
        userId: result.insertedId,
        images: []
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
    const db = client.db("adfleek");
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: values.email });
    if (!user) {
      return { success: false, message: 'User not found. Please sign up.' };
    }

    const isPasswordValid = await bcrypt.compare(values.password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    return { success: true, message: 'Login successful!', user: { id: user._id.toString(), email: user.email, name: user.email.split('@')[0] } };
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
        const db = client.db("adfleek");
        const usersCollection = db.collection('users');
        
        let user = await usersCollection.findOne({ email });

        if (!user) {
            const result = await usersCollection.insertOne({
                email,
                name,
                authProvider: 'google',
                googleUid: uid,
                createdAt: new Date(),
            });
            const newUser = await usersCollection.findOne({ _id: result.insertedId });
            
            const librariesCollection = db.collection('libraries');
            await librariesCollection.insertOne({
                userId: result.insertedId,
                images: [],
            });

            user = newUser;
        }

        if (!user) {
             return { success: false, message: 'Could not find or create user.' };
        }

        return { success: true, user: { id: user._id.toString(), email: user.email, name: user.name } };
    } catch (error) {
        console.error('Google user handling error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
