import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Shield, Target, Brain, ListChecks, Workflow, BarChart3,
  CheckCircle2, AlertCircle, FileText, Users, Building2
} from "lucide-react";

const GuideSection = ({ icon: Icon, title, steps }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-500/20">
          <Icon className="h-6 w-6 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-8 pb-6 border-l-2 border-indigo-500/30 last:border-l-0 last:pb-0">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-sm font-bold">{idx + 1}</span>
            </div>
            
            <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2a3548]">
              <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{step.description}</p>
              
              {step.image && (
                <div className="bg-[#0f1623] rounded-lg p-4 border border-[#2a3548] mb-3">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg">
                    <step.image className="h-16 w-16 text-indigo-400/30" />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">{step.imageCaption}</p>
                </div>
              )}
              
              {step.tips && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-400 mb-1">Pro Tip</p>
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

export default function VendorRiskUserGuide() {
  const [activeGuide, setActiveGuide] = useState("dashboard");

  const guides = {
    dashboard: {
      icon: BarChart3,
      title: "Vendor Risk Dashboard",
      steps: [
        {
          title: "Vendor Portfolio Overview",
          description: "View total vendors, high-risk vendors, average security scores, and vendors by criticality tier. These metrics show third-party risk exposure.",
          image: BarChart3,
          imageCaption: "Vendor portfolio metrics",
          tips: "Maintain vendor count below 100 critical/high-risk vendors for manageable oversight."
        },
        {
          title: "Risk Tiering Visualization",
          description: "See vendor distribution across Tier 1 (critical), Tier 2 (high), and Tier 3 (low) classifications. Focus resources on higher tiers.",
          image: Shield,
          imageCaption: "Vendor risk tier distribution"
        },
        {
          title: "Upcoming Reviews Calendar",
          description: "Track vendor assessments due for review. Color-coded by urgency: overdue (red), due soon (amber), upcoming (green).",
          image: CheckCircle2,
          imageCaption: "Vendor review calendar",
          warning: "Overdue vendor reviews can indicate compliance gaps - escalate reviews overdue 30+ days."
        },
        {
          title: "Compliance Status Tracking",
          description: "Monitor vendor compliance with standards: SOC 2, ISO 27001, GDPR, etc. Identify vendors with expiring certifications.",
          image: FileText,
          imageCaption: "Vendor compliance dashboard"
        }
      ]
    },
    
    builder: {
      icon: ListChecks,
      title: "Assessment Builder",
      steps: [
        {
          title: "Creating Assessment Templates",
          description: "Build reusable assessment questionnaires. Include questions on security controls, data handling, incident response, business continuity, and compliance.",
          image: ListChecks,
          imageCaption: "Assessment template builder",
          tips: "Create tiered questionnaires: basic for low-risk vendors, comprehensive for critical vendors."
        },
        {
          title: "Question Library",
          description: "Access pre-built question banks for common assessment areas. Questions include scoring guidance and evidence requirements.",
          image: FileText,
          imageCaption: "Assessment question library"
        },
        {
          title: "AI-Powered Questions",
          description: "AI suggests relevant questions based on vendor type, services provided, data access level, and industry. Generates custom questions for unique scenarios.",
          image: Brain,
          imageCaption: "AI question generator",
          tips: "AI-generated questions adapt to evolving threats - review suggestions monthly."
        },
        {
          title: "Scoring Models",
          description: "Configure scoring methodologies: weighted scoring, pass/fail criteria, or maturity models. Align scoring with your risk appetite.",
          image: Target,
          imageCaption: "Scoring model configuration"
        },
        {
          title: "Distributing Assessments",
          description: "Send assessments to vendors via portal or email. Track completion status, send reminders, and manage vendor responses.",
          image: Building2,
          imageCaption: "Assessment distribution dashboard",
          warning: "Set realistic completion deadlines - complex assessments may require 2-3 weeks for vendor response."
        }
      ]
    },
    
    simulator: {
      icon: Brain,
      title: "Vendor Risk Simulator",
      steps: [
        {
          title: "Launching Risk Scenarios",
          description: "Practice vendor risk assessments with AI-generated scenarios. Scenarios simulate real vendor profiles, security incidents, and decision points.",
          image: Brain,
          imageCaption: "Risk scenario launcher",
          tips: "Use simulator for training new team members on vendor assessment methodology."
        },
        {
          title: "Making Risk Decisions",
          description: "Evaluate simulated vendor risks and make treatment decisions: approve, reject, require remediation, or adjust terms. AI provides feedback on decisions.",
          image: Target,
          imageCaption: "Risk decision interface"
        },
        {
          title: "Scenario Complexity Levels",
          description: "Start with basic scenarios (clear-cut decisions) and progress to complex scenarios (ambiguous information, competing priorities).",
          image: ListChecks,
          imageCaption: "Complexity level selector"
        },
        {
          title: "Performance Feedback",
          description: "Receive AI feedback on your risk assessment decisions: accuracy, consistency with policies, alignment with industry practices.",
          image: CheckCircle2,
          imageCaption: "Performance feedback report",
          tips: "Track your simulator scores over time to demonstrate growing vendor risk management expertise."
        }
      ]
    },
    
    workflow: {
      icon: Workflow,
      title: "Vendor Lifecycle Workflow",
      steps: [
        {
          title: "Onboarding New Vendors",
          description: "Initiate vendor onboarding workflow: due diligence, assessment, contract review, approval routing. Track status through each stage.",
          image: Workflow,
          imageCaption: "Vendor onboarding workflow",
          tips: "Build onboarding checklists by vendor tier - more rigorous for critical vendors."
        },
        {
          title: "Ongoing Monitoring",
          description: "Set up continuous monitoring: news monitoring, financial health checks, security posture tracking, compliance status updates.",
          image: Shield,
          imageCaption: "Continuous monitoring dashboard"
        },
        {
          title: "Periodic Reassessments",
          description: "Schedule recurring assessments based on vendor tier: Tier 1 (annual), Tier 2 (biennial), Tier 3 (triennial). System auto-generates assessment tasks.",
          image: CheckCircle2,
          imageCaption: "Reassessment schedule",
          warning: "High-risk vendors should be reassessed after major security incidents regardless of schedule."
        },
        {
          title: "Contract Renewal Process",
          description: "Manage renewal workflow: assessment update, contract review, SLA validation, pricing review, approval routing. Track renewal decisions.",
          image: FileText,
          imageCaption: "Contract renewal workflow"
        },
        {
          title: "Vendor Offboarding",
          description: "Execute offboarding procedures: data return/destruction, access revocation, final assessment, contract closure documentation.",
          image: Building2,
          imageCaption: "Vendor offboarding checklist",
          tips: "Complete offboarding within 30 days of contract end to minimize lingering data exposure."
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <BookOpen className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Third-Party Risk Management User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Complete guide to vendor lifecycle management and risk assessment
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
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto bg-transparent p-0">
              {Object.entries(guides).map(([key, guide]) => {
                const Icon = guide.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:border-indigo-500/50 border border-[#2a3548] rounded-lg h-auto"
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