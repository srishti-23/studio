'use server';

import { revalidatePath } from 'next/cache';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from './auth';

const messageSchema = z.object({
  id: z.number(),
  prompt: z.string(),
  aspectRatio: z.string(),
  variations: z.number(),
  imageUrls: z.array(z.string()),
  isRefinement: z.boolean(),
  refinedFrom: z.string().optional(),
  createdAt: z.date().optional(),
});


export async function createConversation(
  firstMessage: Omit<z.infer<typeof messageSchema>, 'id' | 'createdAt'>
) {
  const user = await getCurrentUser();
  if (!user) {
    // Silently fail for non-logged in users
    return { success: true, conversationId: null };
  }

  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const conversationsCollection = db.collection('conversations');

    const newConversation = {
      userId: new ObjectId(user.id),
      title: firstMessage.prompt,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [{ ...firstMessage, id: Date.now(), createdAt: new Date() }],
    };

    const result = await conversationsCollection.insertOne(newConversation);

    revalidatePath('/');
    return { success: true, conversationId: result.insertedId.toString() };
  } catch (error) {
    console.error('Create conversation error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while creating the conversation.',
    };
  }
}

export async function addMessageToConversation(
  conversationId: string,
  message: Omit<z.infer<typeof messageSchema>, 'id' | 'createdAt'>
) {
  const user = await getCurrentUser();
  if (!user) {
     // Silently fail for non-logged in users
    return { success: true };
  }

  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const conversationsCollection = db.collection('conversations');

    const newMessage = { ...message, id: Date.now(), createdAt: new Date() };

    const result = await conversationsCollection.updateOne(
      { _id: new ObjectId(conversationId), userId: new ObjectId(user.id) },
      {
        $push: { messages: newMessage },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: 'Conversation not found or user unauthorized.' };
    }

    revalidatePath('/');
    revalidatePath(`/?conversationId=${conversationId}`);
    return { success: true, message: 'Message added.' };
  } catch (error) {
    console.error('Add message error:', error);
    return { success: false, message: 'An unexpected error occurred while adding the message.' };
  }
}

export async function getConversations() {
  const user = await getCurrentUser();
  if (!user) {
      return { success: true, conversations: [] }; // Return empty array if not logged in
  }

  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const conversationsCollection = db.collection('conversations');

    const conversations = await conversationsCollection
      .find(
        { userId: new ObjectId(user.id) },
        {
          projection: {
            _id: 1,
            title: 1,
            createdAt: 1,
            updatedAt: 1,
            'messages.imageUrls': { $slice: 1 },
          },
        }
      )
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    const processedConversations = conversations.map((convo: any) => {
      const firstImageUrl = convo.messages?.[0]?.imageUrls?.[0] || null;
      return {
        _id: convo._id,
        title: convo.title,
        createdAt: convo.createdAt,
        firstImageUrl: firstImageUrl,
      };
    });

    return { success: true, conversations: JSON.parse(JSON.stringify(processedConversations)) };
  } catch (error) {
    console.error('Get conversations error:', error);
    return { success: false, message: 'An unexpected error occurred.', conversations: [] };
  }
}

export async function getConversationById(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const conversationsCollection = db.collection('conversations');

    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
      userId: new ObjectId(user.id),
    });

    if (!conversation) {
      return { success: false, message: 'Conversation not found or user unauthorized.' };
    }

    return { success: true, conversation: JSON.parse(JSON.stringify(conversation)) };
  } catch (error) {
    console.error('Get conversation error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}