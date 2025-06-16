import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, RolePermissions, ROLE_PERMISSIONS } from '@/types/roles';

export interface RoleBasedAccess {
  role: UserRole;
  permissions: RolePermissions;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  canAccess: (requiredRole: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isBusiness: boolean;
  isIndividual: boolean;
}

export const useRoleBasedAccess = (): RoleBasedAccess => {
  const { user } = useAuth();

  const roleAccess = useMemo(() => {
    const role: UserRole = user?.userType || 'individual';
    const permissions = ROLE_PERMISSIONS[role];

    const hasPermission = (permission: keyof RolePermissions): boolean => {
      return permissions[permission] as boolean;
    };

    const canAccess = (requiredRole: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      return requiredRoles.includes(role);
    };

    return {
      role,
      permissions,
      hasPermission,
      canAccess,
      isAdmin: role === 'admin',
      isBusiness: role === 'business',
      isIndividual: role === 'individual',
    };
  }, [user]);

  return roleAccess;
};