'use server';

import { revalidatePath } from 'next/cache';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function addImageToLibrary(imageUrl: string) {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    if (!userCookie) return { success: false, message: 'User not authenticated.' };
    
    const user = JSON.parse(userCookie.value);
    const userId = user.id;

    if (!imageUrl) return { success: false, message: 'Image URL is required.' };

    try {
        const client = await clientPromise;
        const db = client.db("adfleek");
        const librariesCollection = db.collection('libraries');

        await librariesCollection.updateOne(
            { userId: new ObjectId(userId) },
            {
                $push: {
                    images: {
                        $each: [{
                            src: imageUrl,
                            alt: 'Generated image', // You might want to pass a real alt text
                            createdAt: new Date(),
                            id: new ObjectId(),
                        }],
                        $position: 0 // Adds to the beginning of the array (stack order)
                    }
                },
                $setOnInsert: { userId: new ObjectId(userId) }
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
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    if (!userCookie) return { success: false, message: 'User not authenticated.', images: [] };

    try {
        const user = JSON.parse(userCookie.value);
        const userId = user.id;
        
        const client = await clientPromise;
        const db = client.db("adfleek");
        const librariesCollection = db.collection('libraries');

        const library = await librariesCollection.findOne({ userId: new ObjectId(userId) });

        if (!library || !library.images) {
            return { success: true, images: [] };
        }
        
        return { success: true, images: JSON.parse(JSON.stringify(library.images)) };
    } catch (error) {
        console.error('Get library images error:', error);
        return { success: false, message: 'An unexpected error occurred.', images: [] };
    }
}
