import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { ArrowLeft, Send, Camera, Paperclip, FileText, Image as ImageIcon } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  createOrGetConversation,
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  uploadMediaFile
} from '@/lib/messaging';
import { Message, MessageInput } from '@/types/messaging';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  const { targetUserId, targetUserName, relatedItemId, relatedItemType } = params as {
    targetUserId: string;
    targetUserName: string;
    relatedItemId?: string;
    relatedItemType?: 'product' | 'service';
  };

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!user || !targetUserId) return;

    initializeConversation();
  }, [user, targetUserId]);

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = getConversationMessages(conversationId, (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        
        // Mark messages as read
        if (user) {
          markMessagesAsRead(conversationId, user.userId);
        }
        
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      return unsubscribe;
    }
  }, [conversationId, user]);

  const initializeConversation = async () => {
    if (!user) return;

    try {
      const convId = await createOrGetConversation(
        user.userId,
        targetUserId,
        relatedItemId,
        relatedItemType
      );
      setConversationId(convId);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
    }
  };

  const handleSendMessage = async (messageInput: MessageInput) => {
    if (!user || !conversationId || sending) return;

    if (messageInput.messageType === 'text' && !messageInput.text.trim()) return;

    setSending(true);
    try {
      await sendMessage(conversationId, user.userId, targetUserId, messageInput);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendText = () => {
    handleSendMessage({
      text: inputText.trim(),
      messageType: 'text'
    });
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openImageLibrary },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAndSendMedia(result.assets[0], 'image');
    }
  };

  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAndSendMedia(result.assets[0], 'image');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAndSendMedia(result.assets[0], 'document');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const uploadAndSendMedia = async (asset: any, type: 'image' | 'document') => {
    if (!conversationId) return;

    setSending(true);
    try {
      // Create a File object from the asset
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const file = new File([blob], asset.name || `${type}_${Date.now()}`, {
        type: asset.mimeType || (type === 'image' ? 'image/jpeg' : 'application/octet-stream')
      });

      const uploadResult = await uploadMediaFile(file, conversationId, type);

      await handleSendMessage({
        text: type === 'image' ? 'Sent an image' : `Sent ${uploadResult.fileName}`,
        messageType: type,
        mediaUrl: uploadResult.url,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      Alert.alert('Error', `Failed to send ${type}`);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwnMessage = message.senderId === user?.userId;
    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].senderId !== message.senderId);

    return (
      <View key={message.messageId} style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {showAvatar && !isOwnMessage && (
          <Image
            source={{
              uri: message.senderDetails.profileImageUrl ||
                'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
            }}
            style={styles.avatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          !showAvatar && !isOwnMessage && styles.messageWithoutAvatar
        ]}>
          {message.messageType === 'image' && message.mediaUrl && (
            <Image source={{ uri: message.mediaUrl }} style={styles.messageImage} />
          )}
          
          {message.messageType === 'document' && (
            <View style={styles.documentContainer}>
              <FileText size={24} color="#6B7280" />
              <Text style={styles.documentName} numberOfLines={1}>
                {message.fileName || 'Document'}
              </Text>
            </View>
          )}
          
          {message.text && (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {message.text}
            </Text>
          )}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Please log in to access messages</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{targetUserName}</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#D97706" />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleImagePicker}
              disabled={sending}
            >
              <Camera size={24} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleDocumentPicker}
              disabled={sending}
            >
              <Paperclip size={24} color="#6B7280" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!sending}
              placeholderTextColor="#9CA3AF"
            />
            
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
              onPress={handleSendText}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size={20} color="#FFFFFF" />
              ) : (
                <Send size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#D97706',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  messageWithoutAvatar: {
    marginLeft: 40,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#FEF3C7',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#6B7280',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  documentName: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 12,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#D97706',
    borderRadius: 20,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});