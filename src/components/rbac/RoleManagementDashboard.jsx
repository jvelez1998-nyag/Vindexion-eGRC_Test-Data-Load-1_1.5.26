import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Shield, CheckCircle2, AlertCircle, Lock, Eye, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ROLES, ROLE_DESCRIPTIONS, MODULES, PERMISSIONS, PERMISSION_MATRIX } from "./RolePermissionMatrix";

export default function RoleManagementDashboard({ users = [] }) {
  const [selectedRoles, setSelectedRoles] = useState([ROLES.ADMINISTRATOR, ROLES.AUDITOR]);

  const roleDistribution = Object.values(ROLES).map(role => ({
    role,
    count: users.filter(u => u.role === role).length,
    name: ROLE_DESCRIPTIONS[role]?.name || role,
    description: ROLE_DESCRIPTIONS[role]?.description,
    color: role === ROLES.ADMINISTRATOR ? '#a855f7' :
           role === ROLES.AUDITOR ? '#3b82f6' :
           role === ROLES.RISK_MANAGER ? '#ef4444' :
           role === ROLES.COMPLIANCE_OFFICER ? '#10b981' :
           role === ROLES.STANDARD_USER ? '#6366f1' :
           '#64748b'
  })).filter(r => r.count > 0);

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === ROLES.ADMINISTRATOR).length;
  const privilegedUsers = users.filter(u => 
    [ROLES.ADMINISTRATOR, ROLES.AUDITOR, ROLES.RISK_MANAGER, ROLES.COMPLIANCE_OFFICER].includes(u.role)
  ).length;
  const standardUsers = users.filter(u => u.role === ROLES.STANDARD_USER || u.role === ROLES.READ_ONLY).length;
  
  const privilegedPercentage = totalUsers > 0 ? Math.round((privilegedUsers / totalUsers) * 100) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium">{payload[0].name}</p>
          <p className="text-xs text-slate-400">{payload[0].value} users</p>
        </div>
      );
    }
    return null;
  };

  const toggleRoleSelection = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-white">{totalUsers}</p>
            <p className="text-xs text-slate-500 mt-1">Active accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <Lock className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Administrators</p>
            <p className="text-3xl font-bold text-white">{adminUsers}</p>
            <p className="text-xs text-slate-500 mt-1">Full platform access</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-400" />
              </div>
              <CheckCircle2 className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Privileged</p>
            <p className="text-3xl font-bold text-white">{privilegedUsers}</p>
            <p className="text-xs text-slate-500 mt-1">{privilegedPercentage}% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-500/10 to-gray-500/10 border-slate-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-slate-500/20">
                <Eye className="h-5 w-5 text-slate-400" />
              </div>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mb-1">Standard Users</p>
            <p className="text-3xl font-bold text-white">{standardUsers}</p>
            <p className="text-xs text-slate-500 mt-1">Limited access</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution with Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              Role Distribution
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">User breakdown by role type</p>
          </CardHeader>
          <CardContent>
            {roleDistribution.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="flex-1 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        strokeWidth={0}
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {roleDistribution.map(({ role, count, name, color }) => (
                    <div key={role} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs text-slate-400">{name}</span>
                      <span className="text-xs font-semibold text-white ml-auto">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">No role data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Role Details
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">Access levels and user counts</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roleDistribution.map(({ role, count, name, description, color }) => {
                const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                return (
                  <div key={role} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <h4 className="text-sm font-medium text-white">{name}</h4>
                      </div>
                      <Badge className="bg-indigo-500/20 text-indigo-400">
                        {count} user{count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Matrix */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-400" />
                Permission Matrix
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">Compare permissions across selected roles</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.values(ROLES).map(role => (
                <Badge
                  key={role}
                  onClick={() => toggleRoleSelection(role)}
                  className={`cursor-pointer transition-all ${
                    selectedRoles.includes(role)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#0f1623] text-slate-400 hover:bg-[#2a3548]'
                  }`}
                >
                  {ROLE_DESCRIPTIONS[role]?.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1623]">
                <tr>
                  <th className="text-left p-3 text-white font-medium sticky left-0 bg-[#0f1623]">Module</th>
                  {selectedRoles.map(role => (
                    <th key={role} className="text-center p-3 text-white font-medium">
                      {ROLE_DESCRIPTIONS[role]?.name}
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
                    {selectedRoles.map(role => {
                      const permissions = PERMISSION_MATRIX[role]?.[module] || [];
                      return (
                        <td key={role} className="text-center p-3">
                          {permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {permissions.map(perm => (
                                <Badge key={perm} className="bg-emerald-500/20 text-emerald-400 text-xs">
                                  {perm}
                                </Badge>
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
    </div>
  );
}