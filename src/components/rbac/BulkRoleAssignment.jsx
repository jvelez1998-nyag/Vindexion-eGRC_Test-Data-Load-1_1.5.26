import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Users, Upload, Download, CheckCircle2 } from "lucide-react";
import { ROLES, ROLE_DESCRIPTIONS } from "./RolePermissionMatrix";
import { toast } from "sonner";

export default function BulkRoleAssignment({ users = [], onUpdateRole }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkRole, setBulkRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const applyBulkRole = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    if (!bulkRole) {
      toast.error("Please select a role");
      return;
    }

    selectedUsers.forEach(userId => {
      onUpdateRole(userId, bulkRole);
    });

    toast.success(`Updated ${selectedUsers.length} user(s) to ${ROLE_DESCRIPTIONS[bulkRole]?.name}`);
    setSelectedUsers([]);
    setBulkRole("");
  };

  const exportToCSV = () => {
    const headers = "Email,Full Name,Current Role\n";
    const rows = users.map(u => `${u.email},${u.full_name || 'N/A'},${u.role || 'none'}`).join('\n');
    const csv = headers + rows;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_roles_export.csv';
    a.click();
    
    toast.success("User roles exported to CSV");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Bulk Role Assignment</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Efficiently assign roles to multiple users at once</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label className="text-white text-sm mb-1 block">Select Role</Label>
              <Select value={bulkRole} onValueChange={setBulkRole}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                  <SelectValue placeholder="Choose role to assign" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {Object.values(ROLES).map(role => (
                    <SelectItem key={role} value={role} className="text-white">
                      {ROLE_DESCRIPTIONS[role]?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={applyBulkRole}
              disabled={selectedUsers.length === 0 || !bulkRole}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Apply to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f1623] border-[#2a3548] text-white flex-1"
            />
            <Button variant="outline" onClick={selectAll} className="border-[#2a3548]">
              {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button variant="outline" onClick={exportToCSV} className="border-[#2a3548]">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Select Users</p>
              <p className="text-xs text-slate-500 mt-1">{selectedUsers.length} of {filteredUsers.length} selected</p>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-400">
              {filteredUsers.length} users
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredUsers.map(user => (
              <div 
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedUsers.includes(user.id)
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : 'bg-[#0f1623] border-[#2a3548] hover:border-indigo-500/30'
                }`}
                onClick={() => toggleUser(user.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{user.email}</div>
                    {user.full_name && (
                      <div className="text-xs text-slate-400">{user.full_name}</div>
                    )}
                  </div>
                </div>
                <Badge className="bg-slate-500/20 text-slate-400">
                  {ROLE_DESCRIPTIONS[user.role]?.name || 'No Role'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}