import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, User } from 'lucide-react-native';
import { Product } from '@/types/product';
import MessageButton from './MessageButton';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return `D${price.toLocaleString()}`;
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New':
        return '#10B981';
      case 'Like New':
        return '#3B82F6';
      case 'Used':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(product.condition) }]}>
            <Text style={styles.conditionText}>{product.condition}</Text>
          </View>
        </View>

        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        <View style={styles.locationContainer}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.location}>{product.location}</Text>
        </View>

        <View style={styles.sellerContainer}>
          <User size={14} color="#6B7280" />
          <Text style={styles.seller}>{product.seller}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        {/* Message Button */}
        <View style={styles.actionContainer}>
          <MessageButton
            targetUserId={product.id} // Note: This should be the actual seller's user ID
            targetUserName={product.seller}
            relatedItemId={product.id}
            relatedItemType="product"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  seller: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
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