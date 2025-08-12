
// 'use server';

// import { revalidatePath } from 'next/cache';
// import clientPromise from '@/lib/mongodb';
// import { z } from 'zod';
// import { cookies } from 'next/headers';
// import { ObjectId } from 'mongodb';

// const messageSchema = z.object({
//   id: z.number(),
//   prompt: z.string(),
//   aspectRatio: z.string(),
//   variations: z.number(),
//   imageUrls: z.array(z.string()),
//   isRefinement: z.boolean(),
//   refinedFrom: z.string().optional(),
//   createdAt: z.date().optional(),
// });

// export async function createConversation(firstMessage: Omit<z.infer<typeof messageSchema>, 'id' | 'createdAt'>) {
//     const cookieStore = cookies();
//     const userCookie = cookieStore.get('user');
//     if (!userCookie) return { success: false, message: 'User not authenticated.' };
    
//     let user;
//     try {
//         user = JSON.parse(userCookie.value);
//     } catch (e) {
//         return { success: false, message: 'Invalid user session.' };
//     }

//     if (!user || !user.id) {
//         return { success: false, message: 'User not authenticated.' };
//     }


//     try {
//         const client = await clientPromise;
//         const db = client.db("adfleek");
//         const conversationsCollection = db.collection('conversations');

//         const newConversation = {
//             userId: new ObjectId(user.id), // Ensure userId is stored as ObjectId
//             title: firstMessage.prompt,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             messages: [{ ...firstMessage, id: Date.now(), createdAt: new Date() }],
//         };

//         const result = await conversationsCollection.insertOne(newConversation);
        
//         revalidatePath('/');
//         revalidatePath('/?conversationId=*');
//         return { success: true, conversationId: result.insertedId.toString() };

//     } catch (error) {
//         console.error('Create conversation error:', error);
//         return { success: false, message: 'An unexpected error occurred while creating the conversation.' };
//     }
// }

// export async function addMessageToConversation(conversationId: string, message: Omit<z.infer<typeof messageSchema>, 'id' | 'createdAt'>) {
//     const cookieStore = cookies();
//     const userCookie = cookieStore.get('user');
//     if (!userCookie) return { success: false, message: 'User not authenticated.' };

//     let user;
//     try {
//         user = JSON.parse(userCookie.value);
//     } catch (e) {
//         return { success: false, message: 'Invalid user session.' };
//     }
    
//     if (!user || !user.id) {
//         return { success: false, message: 'User not authenticated.' };
//     }

//     try {
//         const client = await clientPromise;
//         const db = client.db("adfleek");
//         const conversationsCollection = db.collection('conversations');

//         const newMessage = { ...message, id: Date.now(), createdAt: new Date() };

//         // Ensure the conversation belongs to the user before updating
//         const result = await conversationsCollection.updateOne(
//             { _id: new ObjectId(conversationId), userId: new ObjectId(user.id) },
//             { 
//                 $push: { messages: newMessage },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         if (result.matchedCount === 0) {
//             return { success: false, message: 'Conversation not found or access denied.' };
//         }
        
//         revalidatePath('/');
//         revalidatePath('/?conversationId=*');
//         return { success: true, message: 'Message added.' };
//     } catch (error) {
//         console.error('Add message error:', error);
//         return { success: false, message: 'An unexpected error occurred while adding the message.' };
//     }
// }

// export async function getConversations() {
//     const cookieStore = cookies();
//     const userCookie = cookieStore.get('user');
//     if (!userCookie) return { success: false, message: 'User not authenticated.', conversations: [] };

//     let user;
//     try {
//         user = JSON.parse(userCookie.value);
//     } catch (e) {
//         return { success: false, message: 'Invalid user session.', conversations: [] };
//     }

//     if (!user || !user.id) {
//         return { success: false, message: 'User not authenticated.', conversations: [] };
//     }

//     try {
//         const client = await clientPromise;
//         const db = client.db("adfleek");
//         const conversationsCollection = db.collection('conversations');

//         const conversations = await conversationsCollection.find(
//             { userId: new ObjectId(user.id) },
//             { 
//               projection: { 
//                 _id: 1, 
//                 title: 1, 
//                 createdAt: 1, 
//                 messages: { $slice: 1 } // Project only the first message
//               } 
//             }
//         ).sort({ updatedAt: -1 }).limit(20).toArray();

//         // Get the first image URL from the first message
//         const processedConversations = conversations.map(convo => {
//             const firstMessage = convo.messages?.[0];
//             const imageUrl = firstMessage?.imageUrls?.[0] || null;
//             return {
//                 ...convo,
//                 firstImageUrl: imageUrl,
//                 messages: undefined, // Remove the messages array from the final payload
//             };
//         });


//         return { success: true, conversations: JSON.parse(JSON.stringify(processedConversations)) };
//     } catch (error) {
//         console.error('Get conversations error:', error);
//         return { success: false, message: 'An unexpected error occurred.', conversations: [] };
//     }
// }

// export async function getConversationById(conversationId: string) {
//     const cookieStore = cookies();
//     const userCookie = cookieStore.get('user');
//     if (!userCookie) return { success: false, message: 'User not authenticated.' };
    
//     let user;
//     try {
//         user = JSON.parse(userCookie.value);
//     } catch (e) {
//         return { success: false, message: 'Invalid user session.' };
//     }

//     if (!user || !user.id) {
//         return { success: false, message: 'User not authenticated.' };
//     }

//     try {
//         const client = await clientPromise;
//         const db = client.db("adfleek");
//         const conversationsCollection = db.collection('conversations');

//         const conversation = await conversationsCollection.findOne({ 
//             _id: new ObjectId(conversationId),
//             userId: new ObjectId(user.id) 
//         });

//         if (!conversation) {
//             return { success: false, message: 'Conversation not found.' };
//         }

//         return { success: true, conversation: JSON.parse(JSON.stringify(conversation)) };
//     } catch (error) {
//         console.error('Get conversation error:', error);
//         return { success: false, message: 'An unexpected error occurred.' };
//     }
// }
'use server';

import { revalidatePath } from 'next/cache';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

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

export async function createConversation(
  firstMessage: Omit<z.infer<typeof messageSchema>, 'id' | 'createdAt'>
) {
  const user = getAuthUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

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
    revalidatePath('/?conversationId=*');
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
  const user = getAuthUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

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
      return { success: false, message: 'Conversation not found or access denied.' };
    }

    revalidatePath('/');
    revalidatePath('/?conversationId=*');
    return { success: true, message: 'Message added.' };
  } catch (error) {
    console.error('Add message error:', error);
    return { success: false, message: 'An unexpected error occurred while adding the message.' };
  }
}

export async function getConversations() {
  const user = getAuthUser();
  if (!user) return { success: false, message: 'User not authenticated.', conversations: [] };

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
            messages: { $slice: 1 },
          },
        }
      )
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    const processedConversations = conversations.map((convo: any) => {
      const firstMessage = convo.messages?.[0];
      const imageUrl = firstMessage?.imageUrls?.[0] || null;
      return {
        _id: convo._id,
        title: convo.title,
        createdAt: convo.createdAt,
        firstImageUrl: imageUrl,
      };
    });

    return { success: true, conversations: JSON.parse(JSON.stringify(processedConversations)) };
  } catch (error) {
    console.error('Get conversations error:', error);
    return { success: false, message: 'An unexpected error occurred.', conversations: [] };
  }
}

export async function getConversationById(conversationId: string) {
  const user = getAuthUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  try {
    const client = await clientPromise;
    const db = client.db('adfleek');
    const conversationsCollection = db.collection('conversations');

    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
      userId: new ObjectId(user.id),
    });

    if (!conversation) {
      return { success: false, message: 'Conversation not found.' };
    }

    return { success: true, conversation: JSON.parse(JSON.stringify(conversation)) };
  } catch (error) {
    console.error('Get conversation error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
