// Messaging System Types

export interface Conversation {
  conversationId: string;
  participants: string[]; // Array of user IDs
  participantDetails: {
    [userId: string]: {
      name: string;
      profileImageUrl?: string;
      isVerified: boolean;
    };
  };
  relatedItemId?: string; // productId or serviceId
  relatedItemType?: 'product' | 'service';
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Date;
    messageType: MessageType;
  };
  isActive: boolean;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 'text' | 'image' | 'document' | 'system';

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  messageType: MessageType;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isRead: boolean;
  createdAt: Date;
  
  // Sender details (denormalized for performance)
  senderDetails: {
    name: string;
    profileImageUrl?: string;
  };
}

export interface MessageInput {
  text: string;
  messageType: MessageType;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}