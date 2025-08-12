
'use server';

import { revalidatePath } from 'next/cache';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

function getAuthUser() {
  const userCookie = cookies().get('user');
  if (!userCookie) return null;

  try {
    const user = JSON.parse(userCookie.value);
    if (!user || !user.id) return null;
    return user as { id: string; email?: string; name?: string };
  } catch {
    return null;
  }
}

export async function addImageToLibrary(imageUrl: string) {
    const user = getAuthUser();
    if (!user) return { success: false, message: 'User not authenticated.' };
    
    if (!imageUrl) return { success: false, message: 'Image URL is required.' };

    try {
        const client = await clientPromise;
        const db = client.db("adfleek");
        const librariesCollection = db.collection('libraries');

        await librariesCollection.updateOne(
            { userId: new ObjectId(user.id) },
            {
                $push: {
                    images: {
                        $each: [{
                            src: imageUrl,
                            alt: 'Generated image',
                            createdAt: new Date(),
                            _id: new ObjectId(),
                        }],
                        $position: 0 
                    }
                },
                $setOnInsert: { userId: new ObjectId(user.id) }
            },
            { upsert: true }
        );
        
        revalidatePath('/library');
        return { success: true, message: 'Image added to library.' };
    } catch (error) {
        console.error('Add to library error:', error);
        return { success: false, message: 'An unexpected error occurred while adding to library.' };
    }
}

export async function getLibraryImages() {
    const user = getAuthUser();
    if (!user) return { success: false, message: 'User not authenticated.', images: [] };

    try {
        const client = await clientPromise;
        const db = client.db("adfleek");
        const librariesCollection = db.collection('libraries');
        
        const library = await librariesCollection.findOne({ userId: new ObjectId(user.id) });

        if (!library || !library.images) {
            return { success: true, images: [] };
        }
        
        return { success: true, images: JSON.parse(JSON.stringify(library.images)) };
    } catch (error) {
        console.error('Get library images error:', error);
        return { success: false, message: 'An unexpected error occurred.', images: [] };
    }
}
