
"use server";

import { z } from "zod";
import bcrypt from 'bcryptjs';
import clientPromise from './mongodb';

const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});


export async function signup(values: z.infer<typeof signupSchema>) {
    const validatedFields = signupSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ email });

        if (existingUser) {
            return { error: "Email already in use!" };
        }

        await usersCollection.insertOne({
            email,
            password: hashedPassword,
            name: email.split('@')[0], // a default name
        });

        return { success: "User created successfully!", user: { email, name: email.split('@')[0] } };
    } catch (error) {
        console.error("Signup error:", error);
        return { error: "Something went wrong!" };
    }
}


export async function login(values: z.infer<typeof loginSchema>) {
    const validatedFields = loginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }
    
    const { email, password } = validatedFields.data;

    try {
        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection("users");
        
        const existingUser = await usersCollection.findOne({ email });

        if (!existingUser) {
            return { error: "No user found with this email." };
        }

        const passwordsMatch = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!passwordsMatch) {
            return { error: "Invalid credentials!" };
        }

        return { success: "Logged in!", user: { email: existingUser.email, name: existingUser.name } };
    } catch (error) {
        console.error("Login error:", error);
        return { error: "Something went wrong!" };
    }
}
