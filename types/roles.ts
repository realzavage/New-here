// Role-based UI types for Lumo Marketplace

export type UserRole = 'individual' | 'business' | 'admin';

export interface RolePermissions {
  canCreateProducts: boolean;
  canCreateServices: boolean;
  canManageUsers: boolean;
  canAccessAnalytics: boolean;
  canModerateContent: boolean;
  canViewAllConversations: boolean;
  maxProductListings: number;
  maxServiceListings: number;
}

export interface RoleConfig {
  role: UserRole;
  permissions: RolePermissions;
  homeRoute: string;
  tabsConfig: TabConfig[];
}

export interface TabConfig {
  name: string;
  title: string;
  icon: string;
  visible: boolean;
  route: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  individual: {
    canCreateProducts: true,
    canCreateServices: false,
    canManageUsers: false,
    canAccessAnalytics: false,
    canModerateContent: false,
    canViewAllConversations: false,
    maxProductListings: 10,
    maxServiceListings: 0,
  },
  business: {
    canCreateProducts: true,
    canCreateServices: true,
    canManageUsers: false,
    canAccessAnalytics: true,
    canModerateContent: false,
    canViewAllConversations: false,
    maxProductListings: -1, // unlimited
    maxServiceListings: -1, // unlimited
  },
  admin: {
    canCreateProducts: true,
    canCreateServices: true,
    canManageUsers: true,
    canAccessAnalytics: true,
    canModerateContent: true,
    canViewAllConversations: true,
    maxProductListings: -1, // unlimited
    maxServiceListings: -1, // unlimited
  },
};