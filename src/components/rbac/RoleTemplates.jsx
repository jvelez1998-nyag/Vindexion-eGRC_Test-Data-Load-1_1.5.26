import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download } from "lucide-react";
import { MODULES, PERMISSIONS } from "./RolePermissionMatrix";
import { toast } from "sonner";

const roleTemplates = [
  {
    id: 1,
    name: "GRC Manager",
    category: "Management",
    description: "Comprehensive access for GRC program management",
    useCases: ["Program oversight", "Policy management", "Strategic planning"],
    permissions: {
      [MODULES.RISKS]: Object.values(PERMISSIONS),
      [MODULES.CONTROLS]: Object.values(PERMISSIONS),
      [MODULES.COMPLIANCE]: Object.values(PERMISSIONS),
      [MODULES.AUDITS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
      [MODULES.VENDORS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
      [MODULES.REPORTS]: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.DELETE)
    }
  },
  {
    id: 2,
    name: "Security Operations",
    category: "Operations",
    description: "Security-focused role for incident and control management",
    useCases: ["Incident response", "Control testing", "Security monitoring"],
    permissions: {
      [MODULES.INCIDENTS]: Object.values(PERMISSIONS),
      [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
      [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
      [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT]
    }
  },
  {
    id: 3,
    name: "Third-Party Risk Manager",
    category: "Vendor Management",
    description: "Vendor and third-party risk assessment specialist",
    useCases: ["Vendor assessments", "Contract management", "Due diligence"],
    permissions: {
      [MODULES.VENDORS]: Object.values(PERMISSIONS),
      [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
      [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
      [MODULES.COMPLIANCE]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT]
    }
  },
  {
    id: 4,
    name: "Compliance Analyst",
    category: "Compliance",
    description: "Framework compliance and requirements management",
    useCases: ["Compliance tracking", "Gap analysis", "Attestations"],
    permissions: {
      [MODULES.COMPLIANCE]: Object.values(PERMISSIONS),
      [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
      [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
      [MODULES.REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EXPORT]
    }
  },
  {
    id: 5,
    name: "Internal Auditor",
    category: "Audit",
    description: "Full audit lifecycle management",
    useCases: ["Audit planning", "Testing", "Findings management"],
    permissions: {
      [MODULES.AUDITS]: Object.values(PERMISSIONS),
      [MODULES.QUESTIONS]: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.DELETE),
      [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT, PERMISSIONS.EXPORT],
      [MODULES.REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EXPORT]
    }
  },
  {
    id: 6,
    name: "Risk Analyst",
    category: "Risk",
    description: "Risk identification and assessment specialist",
    useCases: ["Risk assessments", "Threat analysis", "Reporting"],
    permissions: {
      [MODULES.RISKS]: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.DELETE),
      [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
      [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
      [MODULES.INCIDENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT]
    }
  },
  {
    id: 7,
    name: "Business Contributor",
    category: "Operations",
    description: "Business unit contributor with limited access",
    useCases: ["Risk reporting", "Control attestation", "Assessment participation"],
    permissions: {
      [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE],
      [MODULES.CONTROLS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
      [MODULES.ASSESSMENTS]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
      [MODULES.INCIDENTS]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE]
    }
  },
  {
    id: 8,
    name: "Executive Viewer",
    category: "Leadership",
    description: "Dashboard and report access for executives",
    useCases: ["Strategic oversight", "Report review", "KPI monitoring"],
    permissions: {
      [MODULES.REPORTS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
      [MODULES.RISKS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
      [MODULES.COMPLIANCE]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT],
      [MODULES.AUDITS]: [PERMISSIONS.VIEW, PERMISSIONS.EXPORT]
    }
  }
];

export default function RoleTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    toast.success(`Template "${template.name}" applied - customize as needed`);
  };

  const countPermissions = (permissions) => {
    return Object.values(permissions).reduce((total, perms) => total + perms.length, 0);
  };

  const categories = [...new Set(roleTemplates.map(t => t.category))];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-indigo-500/20">
              <CheckCircle2 className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-white text-base font-semibold">Pre-Built Role Templates</p>
              <p className="text-slate-400 text-sm">Start with industry-standard role configurations and customize as needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {categories.map(category => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="h-px bg-gradient-to-r from-indigo-500/50 to-transparent flex-1" />
            <h3 className="text-sm font-semibold text-white">{category} Roles</h3>
            <div className="h-px bg-gradient-to-l from-indigo-500/50 to-transparent flex-1" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {roleTemplates.filter(t => t.category === category).map(template => (
              <Card 
                key={template.id} 
                className={`bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548] transition-all hover:border-indigo-500/30 ${
                  selectedTemplate === template.id ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/20' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">{template.name}</h4>
                        <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                          {countPermissions(template.permissions)} perms
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-slate-500 mb-1">Use Cases:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.useCases.map((useCase, idx) => (
                        <Badge key={idx} className="bg-slate-500/20 text-slate-400 text-xs">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-slate-500 mb-1">Module Access:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(template.permissions).map(module => (
                        <Badge key={module} className="bg-blue-500/20 text-blue-400 text-xs">
                          {module.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => applyTemplate(template)}
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="h-3 w-3 mr-2" />
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}