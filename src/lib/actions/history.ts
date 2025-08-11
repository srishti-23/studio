
'use server';

import { revalidatePath } from 'next/cache';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { cookies } from 'next/headers';

const generationSchema = z.object({
  userId: z.string(),
  prompt: z.string(),
  aspectRatio: z.string(),
  variations: z.number(),
  imageUrls: z.array(z.string()),
  isRefinement: z.boolean(),
  refinedFrom: z.string().optional(),
});

export async function saveGeneration(values: Omit<z.infer<typeof generationSchema>, 'userId'>) {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    if (!userCookie) {
        return { success: false, message: 'User not authenticated.' };
    }
    const user = JSON.parse(userCookie.value);


  const validation = generationSchema.safeParse({ userId: user.id, ...values });
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db("adfleek");
    const generationsCollection = db.collection('generations');

    await generationsCollection.insertOne({
      ...validation.data,
      createdAt: new Date(),
    });

    revalidatePath('/'); // To refresh the history in the sidebar
    return { success: true, message: 'Generation saved!' };
  } catch (error) {
    console.error('Save generation error:', error);
    return { success: false, message: 'An unexpected error occurred while saving the generation.' };
  }
}

export async function getHistory() {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie) {
        return { success: false, message: 'User not authenticated.', history: [] };
    }
    
    try {
        const user = JSON.parse(userCookie.value);
        const client = await clientPromise;
        const db = client.db("adfleek");
        const generationsCollection = db.collection('generations');

        const history = await generationsCollection.find({ userId: user.id }).sort({ createdAt: -1 }).limit(20).toArray();
        
        return { success: true, history: JSON.parse(JSON.stringify(history)) };

    } catch (error) {
        console.error('Get history error:', error);
        return { success: false, message: 'An unexpected error occurred while fetching history.', history: [] };
    }
}
