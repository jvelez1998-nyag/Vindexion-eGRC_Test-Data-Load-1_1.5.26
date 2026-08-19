import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ROLES, ROLE_DESCRIPTIONS } from './RolePermissionMatrix';
import { Users, Search, Shield, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function UserRoleAssignment({ users, onUpdateRole }) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssignRole = () => {
    if (!selectedUser || !newRole) return;
    
    onUpdateRole(selectedUser.id, newRole);
    setDialogOpen(false);
    setSelectedUser(null);
    setNewRole("");
    toast.success("Role updated successfully");
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      administrator: 'bg-purple-500/20 text-purple-400',
      auditor: 'bg-blue-500/20 text-blue-400',
      risk_manager: 'bg-rose-500/20 text-rose-400',
      compliance_officer: 'bg-emerald-500/20 text-emerald-400',
      standard_user: 'bg-indigo-500/20 text-indigo-400',
      read_only: 'bg-slate-500/20 text-slate-400'
    };
    return colors[role] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <>
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-base text-white">User Role Management</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Assign and modify individual user roles</p>
              </div>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#151d2e] border-[#2a3548]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No users found</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-[#151d2e] to-[#0f1623] border border-[#2a3548] hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10">
                        <Shield className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{user.full_name || 'Unknown'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <span className="text-xs text-slate-400">{user.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-12">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {ROLE_DESCRIPTIONS[user.role]?.name || 'Unknown Role'}
                      </Badge>
                      {user.created_date && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          Joined {format(new Date(user.created_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.role || ROLES.STANDARD_USER);
                      setDialogOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Change Role
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">User</p>
                <p className="text-white font-medium">{selectedUser.full_name}</p>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Select Role</p>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {Object.values(ROLES).map(role => (
                      <SelectItem key={role} value={role} className="text-white hover:bg-[#2a3548]">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <div>
                            <div>{ROLE_DESCRIPTIONS[role]?.name}</div>
                            <div className="text-xs text-slate-400">{ROLE_DESCRIPTIONS[role]?.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-[#2a3548]">
              Cancel
            </Button>
            <Button onClick={handleAssignRole} className="bg-indigo-600 hover:bg-indigo-700">
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}