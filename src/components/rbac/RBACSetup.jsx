import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_ROLES = [
  {
    name: "Administrator",
    description: "Full system access with all permissions",
    is_system_role: true,
    priority: 100,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: true, edit: true, delete: true, export: true, view_sensitive: true },
      controls: { view: true, create: true, edit: true, delete: true, test: true },
      audits: { view: true, create: true, edit: true, delete: true, approve: true },
      findings: { view: true, create: true, edit: true, delete: true, approve: true, view_sensitive: true },
      compliance: { view: true, create: true, edit: true, delete: true },
      incidents: { view: true, create: true, edit: true, delete: true, view_sensitive: true },
      vendors: { view: true, create: true, edit: true, delete: true, assess: true },
      clients: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, export: true, view_executive: true },
      users: { view: true, create: true, edit: true, delete: true, assign_roles: true },
      settings: { view: true, edit: true }
    }
  },
  {
    name: "Risk Manager",
    description: "Manages risk register, assessments, and mitigation activities",
    is_system_role: true,
    priority: 70,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: true, edit: true, delete: false, export: true, view_sensitive: true },
      controls: { view: true, create: true, edit: true, delete: false, test: false },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: false, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: true, edit: true, delete: false },
      incidents: { view: true, create: true, edit: true, delete: false, view_sensitive: true },
      vendors: { view: true, create: false, edit: false, delete: false, assess: false },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: false },
      users: { view: true, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Compliance Officer",
    description: "Manages compliance frameworks, requirements, and monitoring",
    is_system_role: true,
    priority: 70,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: false, edit: false, delete: false, export: true, view_sensitive: false },
      controls: { view: true, create: true, edit: true, delete: false, test: true },
      audits: { view: true, create: true, edit: true, delete: false, approve: true },
      findings: { view: true, create: true, edit: true, delete: false, approve: true, view_sensitive: true },
      compliance: { view: true, create: true, edit: true, delete: true },
      incidents: { view: true, create: false, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: true },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: true },
      users: { view: true, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Auditor",
    description: "Conducts audits, creates findings, and manages audit programs",
    is_system_role: true,
    priority: 60,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: false, edit: false, delete: false, export: true, view_sensitive: true },
      controls: { view: true, create: false, edit: false, delete: false, test: true },
      audits: { view: true, create: true, edit: true, delete: false, approve: false },
      findings: { view: true, create: true, edit: true, delete: false, approve: false, view_sensitive: true },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: false, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: true },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Vendor Manager",
    description: "Manages vendor relationships, assessments, and third-party risk",
    is_system_role: true,
    priority: 60,
    data_access_level: "full",
    permissions: {
      risks: { view: true, create: true, edit: false, delete: false, export: true, view_sensitive: false },
      controls: { view: true, create: false, edit: false, delete: false, test: false },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: false, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: true, edit: true, delete: false, view_sensitive: false },
      vendors: { view: true, create: true, edit: true, delete: true, assess: true },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Control Owner",
    description: "Responsible for implementing and maintaining controls",
    is_system_role: true,
    priority: 50,
    data_access_level: "assigned_only",
    permissions: {
      risks: { view: true, create: false, edit: false, delete: false, export: false, view_sensitive: false },
      controls: { view: true, create: true, edit: true, delete: false, test: true },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: false, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: true, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: false },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, export: false, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Analyst",
    description: "Reviews and analyzes GRC data with limited edit capabilities",
    is_system_role: true,
    priority: 40,
    data_access_level: "read_only",
    permissions: {
      risks: { view: true, create: true, edit: false, delete: false, export: true, view_sensitive: false },
      controls: { view: true, create: false, edit: false, delete: false, test: false },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: true, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: true, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: false },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: true, export: true, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: true, edit: false }
    }
  },
  {
    name: "Read-Only User",
    description: "View-only access to non-sensitive information",
    is_system_role: true,
    priority: 10,
    data_access_level: "read_only",
    permissions: {
      risks: { view: true, create: false, edit: false, delete: false, export: false, view_sensitive: false },
      controls: { view: true, create: false, edit: false, delete: false, test: false },
      audits: { view: true, create: false, edit: false, delete: false, approve: false },
      findings: { view: true, create: false, edit: false, delete: false, approve: false, view_sensitive: false },
      compliance: { view: true, create: false, edit: false, delete: false },
      incidents: { view: true, create: false, edit: false, delete: false, view_sensitive: false },
      vendors: { view: true, create: false, edit: false, delete: false, assess: false },
      clients: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, export: false, view_executive: false },
      users: { view: false, create: false, edit: false, delete: false, assign_roles: false },
      settings: { view: false, edit: false }
    }
  }
];

export default function RBACSetup() {
  const [setupStatus, setSetupStatus] = useState('checking');
  const queryClient = useQueryClient();

  const { data: existingRoles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
  });

  const createRoleMutation = useMutation({
    mutationFn: (roleData) => base44.entities.Role.create(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const initializeRoles = async () => {
    setSetupStatus('initializing');
    try {
      let createdCount = 0;
      
      for (const roleTemplate of DEFAULT_ROLES) {
        const exists = existingRoles.some(r => r.name === roleTemplate.name && r.is_system_role);
        
        if (!exists) {
          await createRoleMutation.mutateAsync(roleTemplate);
          createdCount++;
        }
      }

      if (createdCount > 0) {
        toast.success(`Created ${createdCount} system roles`);
      } else {
        toast.info("All system roles already exist");
      }
      
      setSetupStatus('complete');
    } catch (error) {
      console.error('Error initializing roles:', error);
      toast.error("Failed to initialize roles");
      setSetupStatus('error');
    }
  };

  useEffect(() => {
    if (existingRoles.length >= DEFAULT_ROLES.length) {
      setSetupStatus('complete');
    } else if (existingRoles.length === 0) {
      setSetupStatus('needs_init');
    } else {
      setSetupStatus('partial');
    }
  }, [existingRoles]);

  if (setupStatus === 'complete') {
    return (
      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">RBAC System Active</h3>
              <p className="text-xs text-slate-400">{existingRoles.length} roles configured</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          Role-Based Access Control Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <p className="text-sm text-slate-300 mb-3">
            Initialize the RBAC system with pre-configured roles and permissions:
          </p>
          <div className="space-y-2">
            {DEFAULT_ROLES.map((role, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-white">{role.name}</span>
                <Badge className="text-[10px]">{role.data_access_level}</Badge>
              </div>
            ))}
          </div>
        </div>

        {setupStatus === 'needs_init' && (
          <Button 
            onClick={initializeRoles} 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
            disabled={setupStatus === 'initializing'}
          >
            {setupStatus === 'initializing' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Initializing Roles...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Initialize RBAC System
              </>
            )}
          </Button>
        )}

        {setupStatus === 'partial' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Partial setup detected</span>
            </div>
            <Button 
              onClick={initializeRoles} 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
              disabled={setupStatus === 'initializing'}
            >
              {setupStatus === 'initializing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing Setup...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Complete RBAC Setup
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}