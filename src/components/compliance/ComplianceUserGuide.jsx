import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Activity, Target, Eye, FileCheck, Sparkles,
  CheckCircle2, AlertCircle, Search, Filter, Download
} from "lucide-react";

const GuideSection = ({ icon: Icon, title, steps }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-emerald-500/20">
          <Icon className="h-6 w-6 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-8 pb-6 border-l-2 border-emerald-500/30 last:border-l-0 last:pb-0">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white text-sm font-bold">{idx + 1}</span>
            </div>
            
            <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2a3548]">
              <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{step.description}</p>
              
              {step.image && (
                <div className="bg-[#0f1623] rounded-lg p-4 border border-[#2a3548] mb-3">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-lg">
                    <step.image className="h-16 w-16 text-emerald-400/30" />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">{step.imageCaption}</p>
                </div>
              )}
              
              {step.tips && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 mb-1">Pro Tip</p>
                      <p className="text-xs text-slate-300">{step.tips}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {step.warning && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-400 mb-1">Important</p>
                      <p className="text-xs text-slate-300">{step.warning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ComplianceUserGuide() {
  const [activeGuide, setActiveGuide] = useState("overview");

  const guides = {
    overview: {
      icon: Activity,
      title: "Compliance Overview",
      steps: [
        {
          title: "Understanding Compliance Dashboard",
          description: "The overview displays compliance rate, total requirements, compliant items, in-progress items, and non-compliant items across all frameworks.",
          image: Activity,
          imageCaption: "Compliance portfolio metrics",
          tips: "Target 95%+ compliance rate for mature regulatory programs."
        },
        {
          title: "Framework Status Breakdown",
          description: "View compliance status by individual framework (SOC 2, ISO 27001, HIPAA, GDPR, etc.). Identify which frameworks need attention.",
          image: FileCheck,
          imageCaption: "Framework compliance breakdown",
          tips: "Prioritize frameworks with upcoming audits or regulatory deadlines."
        },
        {
          title: "Compliance Trends Over Time",
          description: "Track how your compliance rate changes monthly. Identify improvement trends or declining areas requiring intervention.",
          image: Activity,
          imageCaption: "Compliance trend chart"
        },
        {
          title: "Requirements by Status",
          description: "See distribution of requirements: Not Started, In Progress, Implemented, Verified, and Non-Compliant. Focus efforts on non-compliant items.",
          image: Target,
          imageCaption: "Requirements status distribution",
          warning: "Non-compliant requirements for 30+ days should escalate to management."
        }
      ]
    },
    
    assessment: {
      icon: Target,
      title: "Compliance Assessment Engine",
      steps: [
        {
          title: "Starting a New Assessment",
          description: "Click 'Assessment Engine' to begin structured compliance evaluation. Select framework, scope (full or specific controls), and assessment type (self or external).",
          image: Target,
          imageCaption: "Assessment configuration",
          tips: "Run full assessments quarterly and targeted assessments after significant changes."
        },
        {
          title: "Guided Requirement Review",
          description: "The engine walks through each framework requirement with guidance on evidence needed, implementation expectations, and common pitfalls.",
          image: FileCheck,
          imageCaption: "Requirement review interface"
        },
        {
          title: "Evidence Collection",
          description: "Upload evidence for each requirement: policies, procedures, screenshots, reports, meeting minutes. Organize evidence by requirement for audit readiness.",
          image: Download,
          imageCaption: "Evidence repository",
          warning: "Evidence older than 12 months may not satisfy auditor requirements - refresh regularly."
        },
        {
          title: "Automated Compliance Checks",
          description: "For technical requirements, configure automated checks that continuously validate compliance (e.g., MFA enabled, encryption in use).",
          image: CheckCircle2,
          imageCaption: "Automated compliance monitoring"
        },
        {
          title: "Gap Identification",
          description: "AI automatically identifies compliance gaps by comparing your current state against framework requirements. Generates prioritized remediation list.",
          image: Sparkles,
          imageCaption: "AI gap analysis results",
          tips: "Address critical gaps first - they typically block certification or create audit findings."
        }
      ]
    },
    
    monitoring: {
      icon: Eye,
      title: "Continuous Compliance Monitoring",
      steps: [
        {
          title: "Setting Up Monitoring Rules",
          description: "Configure continuous monitoring for compliance requirements. Set rules that check compliance status in real-time based on integrated data sources.",
          image: Eye,
          imageCaption: "Monitoring rules dashboard",
          tips: "Focus monitoring on high-risk requirements most likely to drift out of compliance."
        },
        {
          title: "Compliance Alerts",
          description: "Receive alerts when compliance status changes: requirement becomes non-compliant, evidence expires, or automated check fails.",
          image: AlertCircle,
          imageCaption: "Alert configuration panel"
        },
        {
          title: "Evidence Expiration Tracking",
          description: "Monitor evidence expiration dates (certifications, training, audits). Get advance warnings before evidence becomes stale.",
          image: Activity,
          imageCaption: "Evidence expiration calendar",
          warning: "Expired evidence can trigger audit findings even if underlying control is still effective."
        },
        {
          title: "Regulatory Change Monitoring",
          description: "System monitors regulatory updates for your frameworks. Get notifications when requirements change, new guidance issued, or deadlines announced.",
          image: FileCheck,
          imageCaption: "Regulatory intelligence feed"
        },
        {
          title: "Compliance Reporting",
          description: "Generate compliance status reports for management, board, regulators, or customers. Customize report content, format, and distribution schedule.",
          image: Activity,
          imageCaption: "Automated reporting dashboard",
          tips: "Schedule automated monthly reports to stakeholders to maintain compliance visibility."
        }
      ]
    },
    
    requirements: {
      icon: FileCheck,
      title: "Managing Requirements",
      steps: [
        {
          title: "Adding Requirements",
          description: "Click 'Add Requirement' to manually add compliance obligations. Specify framework, requirement ID, description, category, and implementation details.",
          image: FileCheck,
          imageCaption: "Requirement entry form",
          tips: "Use consistent naming conventions across frameworks for easier cross-referencing."
        },
        {
          title: "Requirement Mapping",
          description: "Map requirements to controls, risks, and other entities. This creates traceability and shows how controls satisfy multiple compliance obligations.",
          image: Target,
          imageCaption: "Requirement mapping interface"
        },
        {
          title: "Searching and Filtering",
          description: "Use search to find requirements by framework, keyword, or ID. Apply filters for status, priority, owner, or review date.",
          image: Search,
          imageCaption: "Advanced search and filters",
          tips: "Save common filter combinations as views for quick access during audits."
        },
        {
          title: "Bulk Status Updates",
          description: "Select multiple requirements to update status, assign owners, set deadlines, or apply tags in batch. Efficient for large compliance programs.",
          image: CheckCircle2,
          imageCaption: "Bulk operation toolbar"
        },
        {
          title: "Compliance Matrices",
          description: "Generate compliance matrices showing requirement-to-control mappings, multi-framework coverage, and gap analysis. Export for audit readiness.",
          image: Download,
          imageCaption: "Compliance matrix generator",
          tips: "Compliance matrices are key deliverables for auditors - keep them current."
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <BookOpen className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Compliance Management User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Complete guide to managing regulatory compliance and framework requirements
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeGuide} onValueChange={setActiveGuide} className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <p className="text-sm text-slate-400">Select a module to view its guide</p>
          </CardHeader>
          <CardContent>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto bg-transparent p-0">
              {Object.entries(guides).map(([key, guide]) => {
                const Icon = guide.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:border-emerald-500/50 border border-[#2a3548] rounded-lg h-auto"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{guide.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </CardContent>
        </Card>

        {Object.entries(guides).map(([key, guide]) => (
          <TabsContent key={key} value={key}>
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-6">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="pr-4">
                    <GuideSection
                      icon={guide.icon}
                      title={guide.title}
                      steps={guide.steps}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}