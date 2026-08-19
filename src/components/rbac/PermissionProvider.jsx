import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u || null);
      } catch (err) {
        console.log("User fetch:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Fetch user's roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles', user?.email],
    queryFn: async () => {
      const data = await base44.entities.UserRole.filter({ 
        user_email: user?.email,
        status: 'active'
      });
      return data || [];
    },
    enabled: !!user?.email
  });

  // Fetch role details
  const { data: roles = [] } = useQuery({
    queryKey: ['roles', userRoles.map(ur => ur.role_id)],
    queryFn: async () => {
      if (userRoles.length === 0) return [];
      const rolePromises = userRoles.map(async (ur) => {
        const data = await base44.entities.Role.filter({ id: ur.role_id, status: 'active' });
        return data || [];
      });
      const roleResults = await Promise.all(rolePromises);
      return roleResults.flat();
    },
    enabled: userRoles.length > 0
  });

  // Check if user has permission
  const hasPermission = (resource, action) => {
    if (!user) return false;
    
    // Built-in admin has all permissions
    if (user.role === 'admin') return true;

    // Check custom roles
    return roles.some(role => {
      const resourcePerms = role.permissions?.[resource];
      return resourcePerms?.[action] === true;
    });
  };

  // Check if user can access specific data
  const canAccessData = (item, action = 'view') => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    // Find highest priority role
    const sortedRoles = [...roles].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const primaryRole = sortedRoles[0];

    if (!primaryRole) return false;

    // Check data access level
    const accessLevel = primaryRole.data_access_level;

    if (accessLevel === 'full') return true;
    if (accessLevel === 'read_only') {
      // Can only view, no modifications
      return action === 'view';
    }
    if (accessLevel === 'assigned_only') {
      // Can only access data they own or are assigned to
      return item?.created_by === user.email || 
             item?.owner === user.email || 
             item?.assigned_to === user.email ||
             item?.lead_coordinator === user.email;
    }
    if (accessLevel === 'department') {
      // Would need department field on entities
      return item?.department === user.department;
    }

    return false;
  };

  // Filter data based on access level
  const filterAccessibleData = (items, action = 'view') => {
    if (!user || !Array.isArray(items)) return [];
    if (user.role === 'admin') return items;

    const sortedRoles = [...roles].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const primaryRole = sortedRoles[0];

    if (!primaryRole) return [];

    const accessLevel = primaryRole.data_access_level;

    if (accessLevel === 'full') return items;
    if (accessLevel === 'read_only' && action === 'view') return items;
    if (accessLevel === 'assigned_only') {
      return items.filter(item => 
        item?.created_by === user.email || 
        item?.owner === user.email || 
        item?.assigned_to === user.email ||
        item?.lead_coordinator === user.email
      );
    }

    return [];
  };

  // Get effective permissions (merged from all roles)
  const getEffectivePermissions = () => {
    if (!user) return {};
    if (user.role === 'admin') {
      // Admin has all permissions
      return {
        risks: { view: true, create: true, edit: true, delete: true, export: true },
        controls: { view: true, create: true, edit: true, delete: true, test: true },
        audits: { view: true, create: true, edit: true, delete: true, approve: true },
        findings: { view: true, create: true, edit: true, delete: true, approve: true, view_sensitive: true },
        compliance: { view: true, create: true, edit: true, delete: true },
        incidents: { view: true, create: true, edit: true, delete: true, view_sensitive: true },
        reports: { view: true, create: true, export: true, view_executive: true },
        users: { view: true, create: true, edit: true, delete: true, assign_roles: true },
        settings: { view: true, edit: true }
      };
    }

    // Merge permissions from all roles (higher priority wins)
    const merged = {};
    const sortedRoles = [...roles].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    sortedRoles.forEach(role => {
      Object.entries(role.permissions || {}).forEach(([resource, actions]) => {
        if (!merged[resource]) merged[resource] = {};
        Object.entries(actions).forEach(([action, value]) => {
          if (merged[resource][action] === undefined) {
            merged[resource][action] = value;
          }
        });
      });
    });

    return merged;
  };

  const value = {
    user,
    roles,
    userRoles,
    loading,
    hasPermission,
    canAccessData,
    filterAccessibleData,
    getEffectivePermissions,
    isAdmin: user?.role === 'admin'
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-[#0f1623]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
}