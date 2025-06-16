import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Conversation, Message, MessageInput, MessageType } from '@/types/messaging';
import { User } from './auth';

// Create or get existing conversation
export const createOrGetConversation = async (
  currentUserId: string,
  otherUserId: string,
  relatedItemId?: string,
  relatedItemType?: 'product' | 'service'
): Promise<string> => {
  try {
    // Check if conversation already exists
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserId)
    );
    
    const snapshot = await getDocs(q);
    let existingConversation = null;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(otherUserId)) {
        existingConversation = { id: doc.id, ...data };
      }
    });
    
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Get user details for both participants
    const [currentUserDoc, otherUserDoc] = await Promise.all([
      getDoc(doc(db, 'users', currentUserId)),
      getDoc(doc(db, 'users', otherUserId))
    ]);
    
    const currentUser = currentUserDoc.data() as User;
    const otherUser = otherUserDoc.data() as User;
    
    // Create new conversation
    const newConversation: Omit<Conversation, 'conversationId'> = {
      participants: [currentUserId, otherUserId],
      participantDetails: {
        [currentUserId]: {
          name: currentUser.fullName,
          profileImageUrl: currentUser.profileImageUrl,
          isVerified: currentUser.isVerified
        },
        [otherUserId]: {
          name: otherUser.fullName,
          profileImageUrl: otherUser.profileImageUrl,
          isVerified: otherUser.isVerified
        }
      },
      relatedItemId,
      relatedItemType,
      lastMessage: {
        text: '',
        senderId: '',
        timestamp: new Date(),
        messageType: 'text'
      },
      isActive: true,
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(conversationsRef, {
      ...newConversation,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  messageInput: MessageInput
): Promise<void> => {
  try {
    // Get sender details
    const senderDoc = await getDoc(doc(db, 'users', senderId));
    const senderData = senderDoc.data() as User;
    
    const batch = writeBatch(db);
    
    // Add message to messages subcollection
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messageRef = doc(messagesRef);
    
    const newMessage: Omit<Message, 'messageId'> = {
      conversationId,
      senderId,
      receiverId,
      text: messageInput.text,
      messageType: messageInput.messageType,
      mediaUrl: messageInput.mediaUrl,
      fileName: messageInput.fileName,
      fileSize: messageInput.fileSize,
      mimeType: messageInput.mimeType,
      isRead: false,
      createdAt: new Date(),
      senderDetails: {
        name: senderData.fullName,
        profileImageUrl: senderData.profileImageUrl
      }
    };
    
    batch.set(messageRef, {
      ...newMessage,
      createdAt: serverTimestamp()
    });
    
    // Update conversation with last message and unread count
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      lastMessage: {
        text: messageInput.text || `Sent ${messageInput.messageType}`,
        senderId,
        timestamp: serverTimestamp(),
        messageType: messageInput.messageType
      },
      [`unreadCount.${receiverId}`]: increment(1),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get user conversations
export const getUserConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      conversationId: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
      lastMessage: {
        ...doc.data().lastMessage,
        timestamp: (doc.data().lastMessage?.timestamp as Timestamp)?.toDate() || new Date()
      }
    })) as Conversation[];
    
    callback(conversations);
  });
};

// Get messages for a conversation
export const getConversationMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      messageId: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
    })) as Message[];
    
    callback(messages);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Update conversation unread count
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      [`unreadCount.${userId}`]: 0
    });
    
    // Mark unread messages as read
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(messageDoc => {
      batch.update(messageDoc.ref, { isRead: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Upload media file
export const uploadMediaFile = async (
  file: File,
  conversationId: string,
  messageType: MessageType
): Promise<{ url: string; fileName: string; fileSize: number; mimeType: string }> => {
  try {
    const timestamp = Date.now();
    const fileName = file.name || `${messageType}_${timestamp}`;
    const storageRef = ref(storage, `conversations/${conversationId}/${messageType}s/${timestamp}_${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      fileName: fileName,
      fileSize: file.size,
      mimeType: file.type
    };
  } catch (error) {
    console.error('Error uploading media file:', error);
    throw error;
  }
};

// Get total unread count for user
export const getTotalUnreadCount = (
  userId: string,
  callback: (count: number) => void
) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    let totalUnread = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      totalUnread += data.unreadCount?.[userId] || 0;
    });
    callback(totalUnread);
  });
};