import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import { ServiceProvider } from '@/types/provider';
import MessageButton from './MessageButton';

interface ProviderCardProps {
  provider: ServiceProvider;
  onPress?: () => void;
}

export default function ProviderCard({ provider, onPress }: ProviderCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          color={i < fullStars ? '#FCD34D' : '#E5E7EB'}
          fill={i < fullStars ? '#FCD34D' : 'transparent'}
        />
      );
    }

    return stars;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: provider.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.category}>{provider.category}</Text>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.location}>{provider.location}</Text>
        </View>

        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {renderStars(provider.rating)}
          </View>
          <Text style={styles.rating}>{provider.rating}</Text>
          <Text style={styles.reviewCount}>({provider.reviewCount})</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {provider.description}
        </Text>

        {/* Message Button */}
        <View style={styles.actionContainer}>
          <MessageButton
            targetUserId={provider.id}
            targetUserName={provider.name}
            relatedItemId={provider.id}
            relatedItemType="service"
            style={styles.messageButton}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionContainer: {
    alignItems: 'flex-start',
  },
  messageButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});