import { PERMISSION_MATRIX, ROLES } from './RolePermissionMatrix';

export class PermissionChecker {
  constructor(userRole) {
    this.userRole = userRole || ROLES.READ_ONLY;
  }

  hasPermission(module, permission) {
    const rolePermissions = PERMISSION_MATRIX[this.userRole];
    if (!rolePermissions) return false;
    
    const modulePermissions = rolePermissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions.includes(permission);
  }

  canView(module) {
    return this.hasPermission(module, 'view');
  }

  canCreate(module) {
    return this.hasPermission(module, 'create');
  }

  canEdit(module) {
    return this.hasPermission(module, 'edit');
  }

  canDelete(module) {
    return this.hasPermission(module, 'delete');
  }

  canApprove(module) {
    return this.hasPermission(module, 'approve');
  }

  canExport(module) {
    return this.hasPermission(module, 'export');
  }

  isAdmin() {
    return this.userRole === ROLES.ADMINISTRATOR;
  }
}

// React Hook for permissions
export const usePermissions = (userRole) => {
  const checker = new PermissionChecker(userRole);
  
  return {
    hasPermission: (module, permission) => checker.hasPermission(module, permission),
    canView: (module) => checker.canView(module),
    canCreate: (module) => checker.canCreate(module),
    canEdit: (module) => checker.canEdit(module),
    canDelete: (module) => checker.canDelete(module),
    canApprove: (module) => checker.canApprove(module),
    canExport: (module) => checker.canExport(module),
    isAdmin: () => checker.isAdmin()
  };
};