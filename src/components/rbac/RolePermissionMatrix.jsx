// Role-Based Access Control Configuration
export const ROLES = {
  ADMINISTRATOR: 'administrator',
  AUDITOR: 'auditor',
  RISK_MANAGER: 'risk_manager',
  COMPLIANCE_OFFICER: 'compliance_officer',
  STANDARD_USER: 'standard_user',
  READ_ONLY: 'read_only'
};

export const MODULES = {
  RISKS: 'risks',
  CONTROLS: 'controls',
  COMPLIANCE: 'compliance',
  INCIDENTS: 'incidents',
  AUDITS: 'audits',
  VENDORS: 'vendors',
  CLIENTS: 'clients',
  QUESTIONS: 'questions',
  ASSESSMENTS: 'assessments',
  REPORTS: 'reports',
  USERS: 'users',
  SETTINGS: 'settings'
};

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export'
};

// Permission Matrix: role -> module -> permissions
export const PERMISSION_MATRIX = {
  [ROLES.ADMINISTRATOR]: {
    [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.COMPLIANCE]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.INCIDENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.AUDITS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.VENDORS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.CLIENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.QUESTIONS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.EXPORT],
    [MODULES.USERS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE],
    [MODULES.SETTINGS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT]
  },
  
  [ROLES.AUDITOR]: {
    [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.COMPLIANCE]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.INCIDENTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.AUDITS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.EXPORT],
    [MODULES.VENDORS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.CLIENTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.QUESTIONS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EXPORT],
    [MODULES.USERS]: [PERMISSIONS.VIEW],
    [MODULES.SETTINGS]: [PERMISSIONS.VIEW]
  },
  
  [ROLES.RISK_MANAGER]: {
    [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.COMPLIANCE]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.INCIDENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.AUDITS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.VENDORS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.CLIENTS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.QUESTIONS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EXPORT],
    [MODULES.USERS]: [PERMISSIONS.VIEW],
    [MODULES.SETTINGS]: [PERMISSIONS.VIEW]
  },
  
  [ROLES.COMPLIANCE_OFFICER]: {
    [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.COMPLIANCE]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE, PERMISSIONS.APPROVE, PERMISSIONS.EXPORT],
    [MODULES.INCIDENTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.AUDITS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.VENDORS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.CLIENTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
    [MODULES.QUESTIONS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
    [MODULES.REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EXPORT],
    [MODULES.USERS]: [PERMISSIONS.VIEW],
    [MODULES.SETTINGS]: [PERMISSIONS.VIEW]
  },
  
  [ROLES.STANDARD_USER]: {
    [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.COMPLIANCE]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.INCIDENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.AUDITS]: [PERMISSIONS.VIEW],
    [MODULES.VENDORS]: [PERMISSIONS.VIEW],
    [MODULES.CLIENTS]: [PERMISSIONS.VIEW],
    [MODULES.QUESTIONS]: [PERMISSIONS.VIEW],
    [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
    [MODULES.REPORTS]: [PERMISSIONS.VIEW],
    [MODULES.USERS]: [],
    [MODULES.SETTINGS]: []
  },
  
  [ROLES.READ_ONLY]: {
    [MODULES.RISKS]: [PERMISSIONS.VIEW],
    [MODULES.CONTROLS]: [PERMISSIONS.VIEW],
    [MODULES.COMPLIANCE]: [PERMISSIONS.VIEW],
    [MODULES.INCIDENTS]: [PERMISSIONS.VIEW],
    [MODULES.AUDITS]: [PERMISSIONS.VIEW],
    [MODULES.VENDORS]: [PERMISSIONS.VIEW],
    [MODULES.CLIENTS]: [PERMISSIONS.VIEW],
    [MODULES.QUESTIONS]: [PERMISSIONS.VIEW],
    [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW],
    [MODULES.REPORTS]: [PERMISSIONS.VIEW],
    [MODULES.USERS]: [],
    [MODULES.SETTINGS]: []
  }
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMINISTRATOR]: {
    name: 'Administrator',
    description: 'Full system access with all permissions across all modules',
    color: 'from-purple-500 to-pink-500'
  },
  [ROLES.AUDITOR]: {
    name: 'Auditor',
    description: 'Full access to audits and assessments, read access to other modules',
    color: 'from-blue-500 to-cyan-500'
  },
  [ROLES.RISK_MANAGER]: {
    name: 'Risk Manager',
    description: 'Full access to risk management, controls, and assessments',
    color: 'from-rose-500 to-orange-500'
  },
  [ROLES.COMPLIANCE_OFFICER]: {
    name: 'Compliance Officer',
    description: 'Full access to compliance, controls, and regulatory requirements',
    color: 'from-emerald-500 to-teal-500'
  },
  [ROLES.STANDARD_USER]: {
    name: 'Standard User',
    description: 'Can view and contribute to most modules with limited permissions',
    color: 'from-indigo-500 to-blue-500'
  },
  [ROLES.READ_ONLY]: {
    name: 'Read Only',
    description: 'View-only access across all modules without modification rights',
    color: 'from-slate-500 to-gray-500'
  }
};

// Default export for component usage
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RolePermissionMatrix({ roles }) {
  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <h3 className="text-white font-semibold">Permission Matrix</h3>
        <p className="text-xs text-slate-400">View all role permissions</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0f1623]">
              <tr>
                <th className="text-left p-3 text-white font-medium sticky left-0 bg-[#0f1623]">Module</th>
                {(roles || []).map(role => (
                  <th key={role.id} className="text-center p-3 text-white font-medium">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(MODULES).map((module, idx) => (
                <tr key={module} className={idx % 2 === 0 ? 'bg-[#151d2e]' : 'bg-[#0f1623]'}>
                  <td className="p-3 text-white capitalize sticky left-0" style={{ backgroundColor: idx % 2 === 0 ? '#151d2e' : '#0f1623' }}>
                    {module.replace(/_/g, ' ')}
                  </td>
                  {(roles || []).map(role => {
                    const permissions = role.permissions?.[module] || {};
                    const activePerms = Object.entries(permissions).filter(([k, v]) => v === true).map(([k]) => k);
                    return (
                      <td key={role.id} className="text-center p-3">
                        {activePerms.length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {activePerms.map(perm => (
                              <span key={perm} className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
                                {perm}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}