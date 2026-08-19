import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Trash2, Copy } from "lucide-react";
import { MODULES, PERMISSIONS } from "./RolePermissionMatrix";
import { toast } from "sonner";

export default function CustomRoleBuilder() {
  const [customRole, setCustomRole] = useState({
    name: "",
    description: "",
    permissions: {}
  });

  const [savedRoles, setSavedRoles] = useState([
    {
      id: 1,
      name: "Security Analyst",
      description: "Focused on security controls and incidents",
      permissions: {
        [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
        [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
        [MODULES.INCIDENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.DELETE]
      }
    }
  ]);

  const togglePermission = (module, permission) => {
    setCustomRole(prev => {
      const modulePerms = prev.permissions[module] || [];
      const hasPermission = modulePerms.includes(permission);
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: hasPermission 
            ? modulePerms.filter(p => p !== permission)
            : [...modulePerms, permission]
        }
      };
    });
  };

  const hasPermission = (module, permission) => {
    return (customRole.permissions[module] || []).includes(permission);
  };

  const saveRole = () => {
    if (!customRole.name.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    const newRole = {
      id: Date.now(),
      ...customRole
    };

    setSavedRoles([...savedRoles, newRole]);
    setCustomRole({ name: "", description: "", permissions: {} });
    toast.success("Custom role saved successfully");
  };

  const deleteRole = (roleId) => {
    setSavedRoles(savedRoles.filter(r => r.id !== roleId));
    toast.success("Role deleted");
  };

  const duplicateRole = (role) => {
    setCustomRole({
      name: `${role.name} (Copy)`,
      description: role.description,
      permissions: { ...role.permissions }
    });
    toast.success("Role duplicated - modify and save");
  };

  const countPermissions = (permissions) => {
    return Object.values(permissions).reduce((total, perms) => total + perms.length, 0);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Plus className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Create Custom Role</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Define granular permissions for specific user needs</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white text-sm">Role Name</Label>
              <Input
                value={customRole.name}
                onChange={(e) => setCustomRole({ ...customRole, name: e.target.value })}
                placeholder="e.g., Security Analyst, Data Officer"
                className="bg-[#0f1623] border-[#2a3548] text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white text-sm">Description</Label>
              <Input
                value={customRole.description}
                onChange={(e) => setCustomRole({ ...customRole, description: e.target.value })}
                placeholder="Brief description of role responsibilities"
                className="bg-[#0f1623] border-[#2a3548] text-white mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-white text-sm mb-2 block">Permissions by Module</Label>
            <div className="border border-[#2a3548] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#0f1623]">
                  <tr>
                    <th className="text-left p-3 text-white font-medium">Module</th>
                    {Object.values(PERMISSIONS).map(perm => (
                      <th key={perm} className="text-center p-3 text-white font-medium capitalize">
                        {perm}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.values(MODULES).map((module, idx) => (
                    <tr key={module} className={idx % 2 === 0 ? 'bg-[#151d2e]' : ''}>
                      <td className="p-3 text-white capitalize">
                        {module.replace(/_/g, ' ')}
                      </td>
                      {Object.values(PERMISSIONS).map(perm => (
                        <td key={perm} className="text-center p-3">
                          <Checkbox
                            checked={hasPermission(module, perm)}
                            onCheckedChange={() => togglePermission(module, perm)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-slate-400">
              Total permissions: <span className="text-white font-semibold">{countPermissions(customRole.permissions)}</span>
            </div>
            <Button onClick={saveRole} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              Save Custom Role
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Save className="h-5 w-5 text-emerald-400" />
                Saved Custom Roles
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">{savedRoles.length} custom role{savedRoles.length !== 1 ? 's' : ''} created</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savedRoles.map(role => (
              <div key={role.id} className="p-4 rounded-lg bg-gradient-to-br from-[#0f1623] to-[#151d2e] border border-[#2a3548] hover:border-indigo-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{role.name}</h3>
                      <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                        {countPermissions(role.permissions)} permissions
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{role.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.permissions).map(([module, perms]) => (
                        perms.length > 0 && (
                          <Badge key={module} className="bg-slate-500/20 text-slate-400 text-xs">
                            {module.replace(/_/g, ' ')}: {perms.length}
                          </Badge>
                        )
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateRole(role)}
                      className="border-[#2a3548]"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteRole(role.id)}
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}