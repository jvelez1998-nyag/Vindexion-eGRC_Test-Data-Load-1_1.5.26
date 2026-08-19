import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, ClipboardCheck, Lightbulb, GraduationCap, FileText,
  CheckCircle2, AlertCircle, TestTube, Paperclip, Brain
} from "lucide-react";

const GuideSection = ({ icon: Icon, title, steps }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-violet-500/20">
          <Icon className="h-6 w-6 text-violet-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-8 pb-6 border-l-2 border-violet-500/30 last:border-l-0 last:pb-0">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white text-sm font-bold">{idx + 1}</span>
            </div>
            
            <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2a3548]">
              <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{step.description}</p>
              
              {step.image && (
                <div className="bg-[#0f1623] rounded-lg p-4 border border-[#2a3548] mb-3">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg">
                    <step.image className="h-16 w-16 text-violet-400/30" />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">{step.imageCaption}</p>
                </div>
              )}
              
              {step.tips && (
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-violet-400 mb-1">Pro Tip</p>
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

export default function AuditUserGuide() {
  const [activeGuide, setActiveGuide] = useState("overview");

  const guides = {
    overview: {
      icon: ClipboardCheck,
      title: "Audit Overview & Planning",
      steps: [
        {
          title: "Creating an Audit",
          description: "Click 'Add Audit' to create a new audit engagement. Specify audit type (internal, external, regulatory), scope, objectives, and timeline.",
          image: ClipboardCheck,
          imageCaption: "Audit creation form",
          tips: "Define clear, measurable objectives upfront - they guide all audit activities."
        },
        {
          title: "Audit Dashboard Overview",
          description: "The dashboard shows active audits, completed audits, total findings, and upcoming audit deadlines. Monitor overall audit program health.",
          image: ClipboardCheck,
          imageCaption: "Audit program dashboard"
        },
        {
          title: "Building Audit Programs",
          description: "Create reusable audit programs with standardized procedures, checklists, and testing steps. Apply programs to new audits for consistency.",
          image: FileText,
          imageCaption: "Audit program builder",
          tips: "Build program libraries for common audit types (SOX, SOC 2, ISO) to accelerate future audits."
        },
        {
          title: "Team Assignment",
          description: "Assign audit team members, define roles (lead, reviewer, specialist), and set individual responsibilities. Track team workload and availability.",
          image: CheckCircle2,
          imageCaption: "Team assignment interface"
        },
        {
          title: "Scheduling and Milestones",
          description: "Set key dates: fieldwork start/end, interim reviews, draft report due, final report delivery. System tracks progress against schedule.",
          image: CheckCircle2,
          imageCaption: "Audit schedule timeline",
          warning: "Scope changes mid-audit often require timeline adjustments - document and communicate changes."
        }
      ]
    },
    
    guidance: {
      icon: Lightbulb,
      title: "AI Audit Guidance",
      steps: [
        {
          title: "AI Audit Preparation",
          description: "Click 'AI Guidance' for intelligent audit prep. AI analyzes your risk profile, prior findings, and compliance status to suggest audit focus areas.",
          image: Brain,
          imageCaption: "AI audit preparation dashboard",
          tips: "Run AI prep 2-3 weeks before audit to identify and address potential findings proactively."
        },
        {
          title: "Risk-Based Audit Planning",
          description: "AI prioritizes audit areas based on risk scores, control maturity, time since last review, and regulatory importance. Optimize audit resource allocation.",
          image: Lightbulb,
          imageCaption: "Risk-based planning matrix"
        },
        {
          title: "Smart Sampling",
          description: "AI recommends optimal sample sizes and selection methods based on population characteristics, desired confidence level, and materiality thresholds.",
          image: TestTube,
          imageCaption: "AI sampling recommendations",
          tips: "Use stratified sampling for large populations to ensure representative coverage."
        },
        {
          title: "Predictive Finding Analysis",
          description: "AI predicts likely findings based on historical data, industry trends, and your control environment. Helps prepare mitigation strategies in advance.",
          image: AlertCircle,
          imageCaption: "Predictive findings dashboard"
        },
        {
          title: "Natural Language Queries",
          description: "Ask audit questions in plain English: 'Show high-risk areas not audited in 18 months' or 'What were common findings last year?' AI provides targeted answers.",
          image: Brain,
          imageCaption: "Natural language audit query"
        }
      ]
    },
    
    frameworks: {
      icon: GraduationCap,
      title: "Audit Frameworks & Study Guides",
      steps: [
        {
          title: "Framework Library Access",
          description: "Access comprehensive audit frameworks: SOX, SOC 2, ISO 27001, NIST, COBIT. Each includes requirements, guidance, and testing procedures.",
          image: GraduationCap,
          imageCaption: "Framework library browser",
          tips: "Bookmark frequently used frameworks for quick reference during audits."
        },
        {
          title: "Study Guide Navigation",
          description: "Use interactive study guides to understand audit standards, key controls, and common deficiencies. Includes examples and real-world scenarios.",
          image: GraduationCap,
          imageCaption: "Interactive study guide"
        },
        {
          title: "Control Testing Procedures",
          description: "Access step-by-step testing procedures for each control type. Procedures include sample test cases, documentation requirements, and rating criteria.",
          image: TestTube,
          imageCaption: "Control testing procedures library",
          warning: "Always adapt standard procedures to your specific environment - one size doesn't fit all."
        },
        {
          title: "Evidence Collection Guidance",
          description: "Learn what evidence auditors require for each control type: policies, screenshots, logs, approvals. Guidance on evidence quality and sufficiency.",
          image: Paperclip,
          imageCaption: "Evidence requirements guide"
        },
        {
          title: "Common Pitfalls and Solutions",
          description: "Review common audit findings, root causes, and proven remediation approaches. Learn from historical challenges to avoid repeat issues.",
          image: AlertCircle,
          imageCaption: "Common audit pitfalls database",
          tips: "Share pitfall lessons with control owners to prevent issues before audits."
        }
      ]
    },
    
    execution: {
      icon: TestTube,
      title: "Audit Execution & Testing",
      steps: [
        {
          title: "Creating Workpapers",
          description: "Generate workpapers for each audit area. Include objectives, procedures, samples selected, testing performed, results, and conclusions.",
          image: Paperclip,
          imageCaption: "Workpaper creation interface",
          tips: "Use workpaper templates for consistency and to ensure complete documentation."
        },
        {
          title: "Evidence Collection",
          description: "Upload and organize audit evidence: documents, screenshots, system reports, interview notes. Link evidence to specific workpapers and test steps.",
          image: Paperclip,
          imageCaption: "Evidence repository",
          warning: "Evidence should be original, unaltered, and from authoritative sources to satisfy audit standards."
        },
        {
          title: "Testing and Documentation",
          description: "Execute test procedures, document observations, and record results in real-time. Include timestamps, tester name, and detailed findings.",
          image: TestTube,
          imageCaption: "Test execution workspace"
        },
        {
          title: "Finding Documentation",
          description: "Document findings with condition (what is wrong), criteria (what should be), cause (why it happened), and effect (potential impact). Assign severity.",
          image: AlertCircle,
          imageCaption: "Finding documentation form",
          tips: "Strong findings link to specific risks and have measurable impacts - avoid vague statements."
        },
        {
          title: "Review and Approval",
          description: "Submit workpapers for senior review. Reviewers validate testing adequacy, conclusion support, and documentation quality before finalizing.",
          image: CheckCircle2,
          imageCaption: "Workpaper review workflow",
          warning: "Incomplete reviews can lead to incorrect audit conclusions - allow sufficient time for thorough review."
        }
      ]
    },
    
    reporting: {
      icon: FileText,
      title: "Audit Reporting",
      steps: [
        {
          title: "Generating Draft Reports",
          description: "Click 'Generate Report' to compile findings, test results, and recommendations into structured audit report. Choose from standard templates.",
          image: FileText,
          imageCaption: "Report generation wizard",
          tips: "Generate draft reports early and iteratively refine rather than waiting until the end."
        },
        {
          title: "AI Report Writing Assistance",
          description: "AI helps draft finding descriptions, recommendations, and executive summaries. It ensures consistent tone, clarity, and professional language.",
          image: Brain,
          imageCaption: "AI report writing assistant"
        },
        {
          title: "Finding Prioritization",
          description: "Findings are automatically prioritized by severity and risk. Report presents critical findings first with clear remediation timelines.",
          image: AlertCircle,
          imageCaption: "Finding prioritization matrix",
          tips: "Include management responses to findings in the final report for complete accountability."
        },
        {
          title: "Management Response Tracking",
          description: "Send findings to management for response. Track response status, agreed remediation plans, and target completion dates.",
          image: CheckCircle2,
          imageCaption: "Management response tracker"
        },
        {
          title: "Report Distribution",
          description: "Distribute final reports to stakeholders: management, audit committee, board, regulators. Track who received reports and acknowledgment status.",
          image: FileText,
          imageCaption: "Report distribution log",
          warning: "Control report distribution carefully - audit reports often contain sensitive information."
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <BookOpen className="h-7 w-7 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Audit Management User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Complete guide to planning, executing, and reporting on internal and external audits
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
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 h-auto bg-transparent p-0">
              {Object.entries(guides).map(([key, guide]) => {
                const Icon = guide.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:border-violet-500/50 border border-[#2a3548] rounded-lg h-auto"
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