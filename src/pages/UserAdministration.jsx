import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, UserPlus, Shield, User, Mail, Calendar, MoreVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserForm from "@/components/users/UserForm";
import InviteUserDialog from "@/components/users/InviteUserDialog";

export default function UserAdministration() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date')
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormOpen(false);
      setEditingUser(null);
      toast.success("User updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update user");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
    }
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) {
      toast.error("Cannot delete your own account");
      return;
    }
    if (confirm(`Delete user "${user.full_name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleSubmit = (data) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !search || 
        user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length,
    recent: users.filter(u => {
      const date = new Date(u.created_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo;
    }).length
  }), [users]);

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f1623] flex items-center justify-center">
        <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
          <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">You need administrator privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">User Administration</h1>
              <p className="text-slate-500 text-sm">Manage users, roles, and permissions</p>
            </div>
          </div>
          <Button onClick={() => setInviteOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#1a2332] border-[#2a3548] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-indigo-400" />
              <p className="text-xs text-slate-500">Total Users</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-slate-500">Administrators</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.admins}</p>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548] p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-slate-500">Standard Users</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.users}</p>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-violet-400" />
              <p className="text-xs text-slate-500">New (30 days)</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.recent}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-[#1a2332] border border-[#2a3548]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Roles</SelectItem>
              <SelectItem value="admin" className="text-white hover:bg-[#2a3548]">Admin</SelectItem>
              <SelectItem value="user" className="text-white hover:bg-[#2a3548]">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 bg-[#1a2332]" />)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No users found</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map(user => (
              <Card key={user.id} className="bg-[#1a2332] border-[#2a3548] p-5 hover:border-[#3a4558] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${
                      user.role === 'admin' 
                        ? 'bg-blue-500/10' 
                        : 'bg-emerald-500/10'
                    }`}>
                      {user.role === 'admin' ? (
                        <Shield className="h-5 w-5 text-blue-400" />
                      ) : (
                        <User className="h-5 w-5 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{user.full_name}</h3>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                      <DropdownMenuItem onClick={() => handleEdit(user)} className="text-white hover:bg-[#2a3548]">
                        Edit Details
                      </DropdownMenuItem>
                      {user.id !== currentUser?.id && (
                        <DropdownMenuItem onClick={() => handleDelete(user)} className="text-rose-400 hover:bg-rose-500/10">
                          Delete User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Role</span>
                    <Badge className={`text-[10px] ${
                      user.role === 'admin' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Joined</span>
                    <span className="text-white">{format(new Date(user.created_date), 'MMM d, yyyy')}</span>
                  </div>
                  {user.id === currentUser?.id && (
                    <Badge className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 w-full justify-center mt-2">
                      Current User
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        currentUserId={currentUser?.id}
      />

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}