import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Shield, UserPlus, Trash2, Search, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function RoleAssignmentPanel() {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list('-assigned_date'),
  });

  const assignRoleMutation = useMutation({
    mutationFn: (data) => base44.entities.UserRole.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success("Role assigned successfully");
      setSelectedUser("");
      setSelectedRole("");
    }
  });

  const revokeRoleMutation = useMutation({
    mutationFn: (id) => base44.entities.UserRole.update(id, { status: 'revoked' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success("Role revoked");
    }
  });

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error("Please select both user and role");
      return;
    }

    const currentUser = await base44.auth.me();
    
    assignRoleMutation.mutate({
      user_email: selectedUser,
      role_id: selectedRole,
      assigned_by: currentUser.email,
      assigned_date: new Date().toISOString(),
      status: 'active'
    });
  };

  const filteredUserRoles = userRoles.filter(ur => 
    ur.status === 'active' && 
    (!searchTerm || ur.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          Role Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assignment Form */}
        <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg space-y-3">
          <h3 className="text-sm font-semibold text-white">Assign Role to User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue placeholder="Select user..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {users.map(user => (
                  <SelectItem key={user.email} value={user.email} className="text-white hover:bg-[#2a3548]">
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {roles.filter(r => r.status === 'active').map(role => (
                  <SelectItem key={role.id} value={role.id} className="text-white hover:bg-[#2a3548]">
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleAssignRole} 
            disabled={!selectedUser || !selectedRole || assignRoleMutation.isPending}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </div>

        {/* Current Assignments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Current Assignments</h3>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
              <Input 
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-8 text-xs bg-[#0f1623] border-[#2a3548] w-48"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUserRoles.map(ur => {
              const user = users.find(u => u.email === ur.user_email);
              return (
                <div key={ur.id} className="flex items-center justify-between p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Mail className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {user?.full_name || ur.user_email}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{ur.user_email}</p>
                    </div>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                      {getRoleName(ur.role_id)}
                    </Badge>
                    {ur.assigned_date && (
                      <span className="text-xs text-slate-500 hidden md:block">
                        {format(new Date(ur.assigned_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      if (confirm(`Revoke ${getRoleName(ur.role_id)} role from ${ur.user_email}?`)) {
                        revokeRoleMutation.mutate(ur.id);
                      }
                    }}
                    className="ml-2 h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {filteredUserRoles.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                {searchTerm ? 'No users found matching search' : 'No role assignments yet'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}