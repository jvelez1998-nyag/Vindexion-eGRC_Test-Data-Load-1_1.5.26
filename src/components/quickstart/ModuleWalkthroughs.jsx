import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  ClipboardCheck,
  Users,
  Database,
  PlayCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

const WALKTHROUGHS = [
  {
    id: "risk_management",
    title: "Risk Management Walkthrough",
    icon: AlertTriangle,
    iconColor: "text-rose-400",
    bgColor: "from-rose-500/10 to-orange-500/10",
    borderColor: "border-rose-500/20",
    duration: "5 min",
    steps: [
      {
        title: "Understanding Risk Management",
        content: "Risk management identifies, assesses, and prioritizes threats to your organization. It's the foundation of GRC."
      },
      {
        title: "Creating a Risk",
        content: "Go to Risk Management → Click 'Add Risk' → Fill in: Title, Category, Description, Likelihood, and Impact."
      },
      {
        title: "Risk Scoring",
        content: "Risks are scored using: Likelihood (1-5) × Impact (1-5) = Risk Score. Scores 15-25 are Critical, 10-14 High, 5-9 Medium, 1-4 Low."
      },
      {
        title: "Linking Controls",
        content: "Mitigate risks by linking controls. Click 'Link Controls' on any risk to associate security measures."
      },
      {
        title: "Risk Treatment",
        content: "Choose your strategy: Accept, Mitigate, Transfer, or Avoid. Document your mitigation plan."
      },
      {
        title: "Monitoring & Review",
        content: "Set review dates and track risk status. Use KRIs (Key Risk Indicators) to monitor risk trends."
      }
    ]
  },
  {
    id: "controls",
    title: "Controls Management Walkthrough",
    icon: Shield,
    iconColor: "text-blue-400",
    bgColor: "from-blue-500/10 to-cyan-500/10",
    borderColor: "border-blue-500/20",
    duration: "4 min",
    steps: [
      {
        title: "What Are Controls?",
        content: "Controls are security measures that reduce risk. They can be preventive, detective, corrective, or directive."
      },
      {
        title: "Creating a Control",
        content: "Navigate to Controls → Click 'Add Control' → Define: Name, Type, Domain, and Implementation Status."
      },
      {
        title: "Control Types",
        content: "Preventive: Stop incidents before they happen. Detective: Identify incidents in progress. Corrective: Fix issues after detection."
      },
      {
        title: "Testing Controls",
        content: "Regular testing validates control effectiveness. Schedule tests: Monthly, Quarterly, or Annually."
      },
      {
        title: "Framework Mapping",
        content: "Map controls to frameworks like ISO 27001, NIST, SOC 2, or GDPR to demonstrate compliance."
      }
    ]
  },
  {
    id: "compliance",
    title: "Compliance Tracking Walkthrough",
    icon: FileText,
    iconColor: "text-emerald-400",
    bgColor: "from-emerald-500/10 to-teal-500/10",
    borderColor: "border-emerald-500/20",
    duration: "6 min",
    steps: [
      {
        title: "Compliance Basics",
        content: "Compliance means adhering to regulations and standards like GDPR, SOX, HIPAA, ISO 27001, etc."
      },
      {
        title: "Selecting Frameworks",
        content: "Go to Compliance Frameworks → Choose frameworks relevant to your industry and geography."
      },
      {
        title: "Tracking Requirements",
        content: "Each framework has requirements. Track their implementation status: Not Started, In Progress, Implemented, Verified."
      },
      {
        title: "Evidence Collection",
        content: "Upload evidence (policies, screenshots, reports) to prove compliance. Auditors will review this."
      },
      {
        title: "Compliance Reports",
        content: "Generate compliance reports showing your status across all frameworks. Use for audits and board meetings."
      },
      {
        title: "Continuous Monitoring",
        content: "Compliance isn't one-time. Set review schedules and get alerts for upcoming deadlines."
      }
    ]
  },
  {
    id: "audits",
    title: "Audit Management Walkthrough",
    icon: ClipboardCheck,
    iconColor: "text-indigo-400",
    bgColor: "from-indigo-500/10 to-blue-500/10",
    borderColor: "border-indigo-500/20",
    duration: "7 min",
    steps: [
      {
        title: "Audit Overview",
        content: "Audits verify that your GRC program is working. They can be internal, external, or regulatory."
      },
      {
        title: "Planning an Audit",
        content: "Define scope, objectives, schedule, and team. Use AI to generate audit programs and procedures."
      },
      {
        title: "Audit Execution",
        content: "During the audit: Test controls, interview stakeholders, review documentation, and collect evidence."
      },
      {
        title: "Findings Management",
        content: "Document findings with severity levels. Track remediation actions and deadlines."
      },
      {
        title: "Audit Reports",
        content: "Generate formal audit reports with findings, recommendations, and management responses."
      },
      {
        title: "Follow-up Audits",
        content: "Schedule follow-up audits to verify remediation of findings. Close the audit lifecycle."
      }
    ]
  },
  {
    id: "privacy",
    title: "Privacy Compliance Walkthrough",
    icon: Database,
    iconColor: "text-purple-400",
    bgColor: "from-purple-500/10 to-violet-500/10",
    borderColor: "border-purple-500/20",
    duration: "8 min",
    steps: [
      {
        title: "Privacy Fundamentals",
        content: "Privacy compliance (GDPR, CCPA) protects personal data and individual rights."
      },
      {
        title: "Data Mapping",
        content: "Use AI Data Mapping to discover where personal data lives, who accesses it, and how it flows."
      },
      {
        title: "DPIA (Data Protection Impact Assessment)",
        content: "Required for high-risk processing. Answer questions about data types, purposes, risks, and safeguards."
      },
      {
        title: "Data Subject Rights",
        content: "Manage requests for: Access, Rectification, Erasure, Portability. Respond within 30 days (GDPR)."
      },
      {
        title: "RoPA (Record of Processing Activities)",
        content: "Article 30 GDPR: Maintain a register of all data processing activities with purposes and legal bases."
      },
      {
        title: "Privacy Policies",
        content: "Generate privacy policies using AI based on your processing activities and applicable regulations."
      }
    ]
  },
  {
    id: "vendors",
    title: "Vendor Risk Management Walkthrough",
    icon: Users,
    iconColor: "text-cyan-400",
    bgColor: "from-cyan-500/10 to-teal-500/10",
    borderColor: "border-cyan-500/20",
    duration: "6 min",
    steps: [
      {
        title: "Third-Party Risk",
        content: "Vendors can introduce risks through data access, security gaps, or non-compliance. TPRM is critical."
      },
      {
        title: "Vendor Onboarding",
        content: "Add vendors with: Name, Type, Criticality, Contract Details. Send security questionnaires."
      },
      {
        title: "Risk Assessment",
        content: "Assess vendor risk across: Security, Compliance, Financial, Operational, and Reputational dimensions."
      },
      {
        title: "Continuous Monitoring",
        content: "Monitor vendor security posture, breach notifications, and compliance status continuously."
      },
      {
        title: "Vendor Audits",
        content: "Conduct periodic vendor audits. Review SOC 2 reports, penetration tests, and certifications."
      },
      {
        title: "Offboarding",
        content: "When terminating vendor relationships, ensure data is deleted and access is revoked."
      }
    ]
  }
];

export default function ModuleWalkthroughs() {
  const [selectedWalkthrough, setSelectedWalkthrough] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleStartWalkthrough = (walkthrough) => {
    setSelectedWalkthrough(walkthrough);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (currentStep < selectedWalkthrough.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setSelectedWalkthrough(null);
    setCurrentStep(0);
  };

  if (selectedWalkthrough) {
    const isLastStep = currentStep === selectedWalkthrough.steps.length - 1;
    const step = selectedWalkthrough.steps[currentStep];

    return (
      <div className="space-y-6">
        <Card className={`bg-gradient-to-br ${selectedWalkthrough.bgColor} border ${selectedWalkthrough.borderColor}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-[#1a2332] border ${selectedWalkthrough.borderColor}`}>
                  <selectedWalkthrough.icon className={`h-6 w-6 ${selectedWalkthrough.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedWalkthrough.title}</h3>
                  <p className="text-sm text-slate-400">Step {currentStep + 1} of {selectedWalkthrough.steps.length}</p>
                </div>
              </div>
              <Button onClick={() => setSelectedWalkthrough(null)} size="sm" className="bg-gradient-to-r from-rose-500/10 to-rose-500/10 border border-rose-500/30 text-rose-400 hover:from-rose-500/20 hover:to-rose-500/20">
                Exit
              </Button>
            </div>

            <div className="flex gap-1 mb-6">
              {selectedWalkthrough.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full flex-1 transition-all ${
                    idx <= currentStep ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <Card className="bg-[#1a2332] border-[#2a3548] mb-6">
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold text-white mb-4">{step.title}</h4>
                <p className="text-slate-300 leading-relaxed">{step.content}</p>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="bg-gradient-to-r from-slate-500/10 to-slate-500/10 border border-slate-500/30 text-slate-300 hover:from-slate-500/20 hover:to-slate-500/20"
              >
                Previous
              </Button>
              
              {isLastStep ? (
                <Button onClick={handleComplete} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Walkthrough
                </Button>
              ) : (
                <Button onClick={handleNextStep} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <PlayCircle className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Interactive Module Walkthroughs</h3>
          </div>
          <p className="text-sm text-slate-400">
            Step-by-step guides to master each GRC module. Learn by doing with interactive tutorials.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WALKTHROUGHS.map((walkthrough) => (
          <Card 
            key={walkthrough.id}
            className={`bg-gradient-to-br ${walkthrough.bgColor} border ${walkthrough.borderColor} hover:scale-105 transition-all cursor-pointer`}
            onClick={() => handleStartWalkthrough(walkthrough)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-[#1a2332] border ${walkthrough.borderColor}`}>
                  <walkthrough.icon className={`h-7 w-7 ${walkthrough.iconColor}`} />
                </div>
                <Badge variant="outline" className="text-xs border-slate-600">
                  ⏱ {walkthrough.duration}
                </Badge>
              </div>

              <h4 className="text-base font-semibold text-white mb-2">{walkthrough.title}</h4>
              <p className="text-xs text-slate-400 mb-4">{walkthrough.steps.length} interactive steps</p>

              <Button size="sm" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Walkthrough
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}