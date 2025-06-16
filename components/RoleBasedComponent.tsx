import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { UserRole } from '@/types/roles';

interface RoleBasedComponentProps {
  allowedRoles: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export default function RoleBasedComponent({
  allowedRoles,
  children,
  fallback,
  showFallback = false
}: RoleBasedComponentProps) {
  const { canAccess } = useRoleBasedAccess();

  const hasAccess = canAccess(allowedRoles);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  if (showFallback && !fallback) {
    return (
      <View style={styles.restrictedContainer}>
        <Text style={styles.restrictedText}>
          Access restricted to {Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles} users
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  restrictedContainer: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    margin: 16,
  },
  restrictedText: {
    color: '#92400E',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});