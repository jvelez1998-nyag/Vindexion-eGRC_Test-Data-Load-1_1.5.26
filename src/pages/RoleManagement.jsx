import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Settings, BarChart3, HelpCircle, UserCog, CheckCircle2 } from "lucide-react";
import RBACSetup from "@/components/rbac/RBACSetup";
import RoleAssignmentPanel from "@/components/rbac/RoleAssignmentPanel";
import PermissionGuard from "@/components/rbac/PermissionGuard";

export default function RoleManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  return (
    <PermissionGuard resource="users" action="assign_roles" showError={true}>
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <Shield className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Role & Permission Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">Configure granular access controls and role-based permissions</p>
          </div>
        </div>

        {/* RBAC Initialization */}
        <RBACSetup />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto scrollbar-thin">
            <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1 inline-flex">
              {/* Dashboard & Overview */}
              <TabsTrigger value="dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              
              {/* Core Role Management */}
              <TabsTrigger value="matrix">
                <Settings className="h-4 w-4 mr-2" />
                Permission Matrix
              </TabsTrigger>
              <TabsTrigger value="assignments">
                <Users className="h-4 w-4 mr-2" />
                User Assignments
              </TabsTrigger>
              
              {/* Advanced Features */}
              <TabsTrigger value="custom">
                <UserCog className="h-4 w-4 mr-2" />
                Custom Roles
              </TabsTrigger>
              <TabsTrigger value="templates">
                <Shield className="h-4 w-4 mr-2" />
                Role Templates
              </TabsTrigger>
              <TabsTrigger value="bulk">
                <Users className="h-4 w-4 mr-2" />
                Bulk Assignment
              </TabsTrigger>
              
              {/* Audit & Help */}
              <TabsTrigger value="audit">
                <BarChart3 className="h-4 w-4 mr-2" />
                Audit Log
              </TabsTrigger>
              <TabsTrigger value="guide">
                <HelpCircle className="h-4 w-4 mr-2" />
                Guide
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20">
                        <Users className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Total Users</p>
                        <p className="text-2xl font-bold text-white">{users.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Shield className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Total Roles</p>
                        <p className="text-2xl font-bold text-white">{roles.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Active Assignments</p>
                        <p className="text-2xl font-bold text-white">{userRoles.filter(ur => ur.status === 'active').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Shield className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">System Roles</p>
                        <p className="text-2xl font-bold text-white">{roles.filter(r => r.is_system_role).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Roles List */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle>Configured Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {roles.map(role => (
                      <div key={role.id} className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-semibold">{role.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-500/20 text-indigo-400">{role.data_access_level}</Badge>
                            {role.is_system_role && (
                              <Badge className="bg-purple-500/20 text-purple-400">System</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{role.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matrix">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <p className="text-xs text-slate-400">View all role permissions across modules</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0f1623]">
                      <tr>
                        <th className="text-left p-3 text-white font-medium sticky left-0 bg-[#0f1623]">Module</th>
                        {roles.map(role => (
                          <th key={role.id} className="text-center p-3 text-white font-medium">
                            {role.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['risks', 'controls', 'audits', 'findings', 'compliance', 'incidents', 'vendors', 'clients', 'reports', 'users', 'settings'].map((module, idx) => (
                        <tr key={module} className={idx % 2 === 0 ? 'bg-[#151d2e]' : 'bg-[#0f1623]'}>
                          <td className="p-3 text-white capitalize sticky left-0" style={{ backgroundColor: idx % 2 === 0 ? '#151d2e' : '#0f1623' }}>
                            {module.replace(/_/g, ' ')}
                          </td>
                          {roles.map(role => {
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
          </TabsContent>

          <TabsContent value="assignments">
            <RoleAssignmentPanel />
          </TabsContent>

          <TabsContent value="custom">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle>Custom Role Builder</CardTitle>
                <p className="text-xs text-slate-400">Coming soon - create custom roles with granular permissions</p>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle>Role Templates</CardTitle>
                <p className="text-xs text-slate-400">Pre-configured role templates for common scenarios</p>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle>Bulk Role Assignment</CardTitle>
                <p className="text-xs text-slate-400">Assign roles to multiple users at once</p>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle>Role Audit Log</CardTitle>
                <p className="text-xs text-slate-400">Track role assignment changes and access logs</p>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="guide">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle>RBAC User Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">System Roles</h3>
                  <ul className="space-y-1 list-disc list-inside text-slate-400">
                    <li><strong>Administrator:</strong> Full access to all modules and settings</li>
                    <li><strong>Risk Manager:</strong> Manage risks, incidents, and related controls</li>
                    <li><strong>Compliance Officer:</strong> Manage compliance and conduct audits</li>
                    <li><strong>Auditor:</strong> Conduct audits and create findings</li>
                    <li><strong>Vendor Manager:</strong> Manage vendor relationships and assessments</li>
                    <li><strong>Control Owner:</strong> Implement and test controls</li>
                    <li><strong>Analyst:</strong> View and analyze data with limited editing</li>
                    <li><strong>Read-Only User:</strong> View-only access to non-sensitive data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Data Access Levels</h3>
                  <ul className="space-y-1 list-disc list-inside text-slate-400">
                    <li><strong>Full:</strong> Access all data across the organization</li>
                    <li><strong>Department:</strong> Access data within specific departments</li>
                    <li><strong>Assigned Only:</strong> Access only data assigned to the user</li>
                    <li><strong>Read Only:</strong> View-only access with no modifications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PermissionGuard>
  );
}