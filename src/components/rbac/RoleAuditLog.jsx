import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, Filter } from "lucide-react";
import { format } from "date-fns";

// Mock audit log data - in production, this would come from a database
const mockAuditLogs = [
  {
    id: 1,
    timestamp: new Date('2025-12-14T10:30:00'),
    action: 'role_assigned',
    userEmail: 'admin@company.com',
    targetUser: 'john.doe@company.com',
    oldRole: 'standard_user',
    newRole: 'risk_manager',
    details: 'Role upgraded for risk management responsibilities'
  },
  {
    id: 2,
    timestamp: new Date('2025-12-14T09:15:00'),
    action: 'role_revoked',
    userEmail: 'admin@company.com',
    targetUser: 'jane.smith@company.com',
    oldRole: 'administrator',
    newRole: 'auditor',
    details: 'Role downgraded after department transfer'
  },
  {
    id: 3,
    timestamp: new Date('2025-12-13T16:45:00'),
    action: 'custom_role_created',
    userEmail: 'admin@company.com',
    targetUser: null,
    roleName: 'Security Analyst',
    details: 'New custom role created with incident and control permissions'
  },
  {
    id: 4,
    timestamp: new Date('2025-12-13T14:20:00'),
    action: 'bulk_assignment',
    userEmail: 'admin@company.com',
    targetUser: null,
    count: 5,
    newRole: 'read_only',
    details: 'Bulk assignment of read-only role to 5 users'
  }
];

export default function RoleAuditLog({ userEmail }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  // In production, fetch from database
  const auditLogs = mockAuditLogs;

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action) => {
    const configs = {
      role_assigned: { label: 'Role Assigned', className: 'bg-emerald-500/20 text-emerald-400' },
      role_revoked: { label: 'Role Revoked', className: 'bg-amber-500/20 text-amber-400' },
      custom_role_created: { label: 'Custom Role Created', className: 'bg-blue-500/20 text-blue-400' },
      bulk_assignment: { label: 'Bulk Assignment', className: 'bg-purple-500/20 text-purple-400' }
    };
    
    const config = configs[action] || { label: action, className: 'bg-slate-500/20 text-slate-400' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <History className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-base text-white">Role Change Audit Log</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Complete history of role assignments and changes</p>
              </div>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-400 text-sm px-3 py-1">
              {filteredLogs.length} Events
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by user email or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48 bg-[#0f1623] border-[#2a3548] text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Actions</SelectItem>
                <SelectItem value="role_assigned" className="text-white">Role Assigned</SelectItem>
                <SelectItem value="role_revoked" className="text-white">Role Revoked</SelectItem>
                <SelectItem value="custom_role_created" className="text-white">Custom Role Created</SelectItem>
                <SelectItem value="bulk_assignment" className="text-white">Bulk Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredLogs.map(log => (
          <Card key={log.id} className="bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548] hover:border-indigo-500/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getActionBadge(log.action)}
                  <span className="text-xs text-slate-500">
                    {format(log.timestamp, 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="text-white">
                  <span className="text-slate-400">Performed by:</span> {log.userEmail}
                </div>
                
                {log.targetUser && (
                  <div className="text-white">
                    <span className="text-slate-400">Target user:</span> {log.targetUser}
                  </div>
                )}

                {log.oldRole && log.newRole && (
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-slate-400">Role change:</span>
                    <Badge className="bg-slate-500/20 text-slate-400">{log.oldRole}</Badge>
                    <span className="text-slate-500">→</span>
                    <Badge className="bg-indigo-500/20 text-indigo-400">{log.newRole}</Badge>
                  </div>
                )}

                {log.roleName && (
                  <div className="text-white">
                    <span className="text-slate-400">Role name:</span> {log.roleName}
                  </div>
                )}

                {log.count && (
                  <div className="text-white">
                    <span className="text-slate-400">Users affected:</span> {log.count}
                  </div>
                )}

                {log.details && (
                  <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-[#2a3548]">
                    {log.details}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}