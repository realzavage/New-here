import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getUserConversations } from '@/lib/messaging';
import { Conversation } from '@/types/messaging';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getUserConversations(user.userId, (newConversations) => {
      setConversations(newConversations);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    // The real-time listener will automatically update the data
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== user?.userId);
    return otherUserId ? conversation.participantDetails[otherUserId] : null;
  };

  const handleConversationPress = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return;

    const otherUserId = conversation.participants.find(id => id !== user?.userId);
    if (!otherUserId) return;

    const params = new URLSearchParams({
      targetUserId: otherUserId,
      targetUserName: otherParticipant.name,
      ...(conversation.relatedItemId && { relatedItemId: conversation.relatedItemId }),
      ...(conversation.relatedItemType && { relatedItemType: conversation.relatedItemType })
    });

    router.push(`/chat?${params.toString()}`);
  };

  const renderConversation = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return null;

    const unreadCount = user ? conversation.unreadCount[user.userId] || 0 : 0;

    return (
      <TouchableOpacity
        key={conversation.conversationId}
        style={styles.conversationItem}
        onPress={() => handleConversationPress(conversation)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: otherParticipant.profileImageUrl ||
              'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
          }}
          style={styles.avatar}
        />
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName} numberOfLines={1}>
              {otherParticipant.name}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(conversation.lastMessage.timestamp)}
            </Text>
          </View>
          
          <View style={styles.lastMessageContainer}>
            <Text
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {conversation.lastMessage.senderId === user?.userId && 'You: '}
              {conversation.lastMessage.text || 'No messages yet'}
            </Text>
            
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Messages</Text>
        </View>
        
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Please log in to view messages</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#D97706']}
            tintColor="#D97706"
          />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#D97706" />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.centerContainer}>
            <MessageCircle size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Start messaging with service providers and sellers
            </Text>
          </View>
        ) : (
          conversations.map(renderConversation)
        )}
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
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
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#D97706',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  conversationItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: '#F3F4F6',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#1F2937',
  },
  unreadBadge: {
    backgroundColor: '#D97706',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});