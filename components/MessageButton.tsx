import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface MessageButtonProps {
  targetUserId: string;
  targetUserName: string;
  relatedItemId?: string;
  relatedItemType?: 'product' | 'service';
  style?: any;
}

export default function MessageButton({
  targetUserId,
  targetUserName,
  relatedItemId,
  relatedItemType,
  style
}: MessageButtonProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handlePress = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.userId === targetUserId) {
      // Can't message yourself
      return;
    }

    // Navigate to chat screen with parameters
    const params = new URLSearchParams({
      targetUserId,
      targetUserName,
      ...(relatedItemId && { relatedItemId }),
      ...(relatedItemType && { relatedItemType })
    });

    router.push(`/chat?${params.toString()}`);
  };

  if (!user || user.userId === targetUserId) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <MessageCircle size={20} color="#FFFFFF" />
      <Text style={styles.buttonText}>Message</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});