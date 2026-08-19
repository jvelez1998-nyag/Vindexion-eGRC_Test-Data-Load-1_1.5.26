import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Activity, Target, CheckCircle2, Sparkles, Zap, List,
  AlertCircle, Settings, TestTube, Download, FileText
} from "lucide-react";

const GuideSection = ({ icon: Icon, title, steps }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-8 pb-6 border-l-2 border-blue-500/30 last:border-l-0 last:pb-0">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white text-sm font-bold">{idx + 1}</span>
            </div>
            
            <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2a3548]">
              <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{step.description}</p>
              
              {step.image && (
                <div className="bg-[#0f1623] rounded-lg p-4 border border-[#2a3548] mb-3">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg">
                    <step.image className="h-16 w-16 text-blue-400/30" />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">{step.imageCaption}</p>
                </div>
              )}
              
              {step.tips && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-400 mb-1">Pro Tip</p>
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

export default function ControlManagementUserGuide() {
  const [activeGuide, setActiveGuide] = useState("dashboard");

  const guides = {
    dashboard: {
      icon: Activity,
      title: "Control Dashboard",
      steps: [
        {
          title: "Control Portfolio Overview",
          description: "View total controls, effective controls, average effectiveness rating, and controls by status. These metrics provide instant visibility into your control environment strength.",
          image: Activity,
          imageCaption: "Control portfolio metrics",
          tips: "Aim for 80%+ effectiveness rating across your control environment for a mature security posture."
        },
        {
          title: "Control Effectiveness Visualization",
          description: "The pie chart shows distribution of controls by status: Effective, Implemented, Ineffective, and Planned. Identify areas needing attention.",
          image: CheckCircle2,
          imageCaption: "Control effectiveness distribution"
        },
        {
          title: "Control Testing Status",
          description: "Track testing progress: last test dates, upcoming tests, and overdue tests. Ensure controls are validated regularly per your testing schedule.",
          image: TestTube,
          imageCaption: "Control testing calendar",
          warning: "Controls not tested in 12+ months should be re-validated before relying on them for compliance."
        },
        {
          title: "Control Domains Breakdown",
          description: "See how controls are distributed across security domains: Access Control, Data Protection, Network Security, etc. Identify domain gaps.",
          image: Target,
          imageCaption: "Control domain distribution"
        }
      ]
    },
    
    design: {
      icon: Target,
      title: "Control Design Engine",
      steps: [
        {
          title: "Starting Control Design",
          description: "Click 'Design Engine' to launch the guided control creation wizard. Select control domain, category (preventive, detective, corrective), and automation level.",
          image: Target,
          imageCaption: "Control design wizard",
          tips: "Start with preventive controls - they're most cost-effective for risk reduction."
        },
        {
          title: "Defining Control Objectives",
          description: "Clearly state what the control is designed to achieve. Good objectives are specific, measurable, and directly address identified risks.",
          image: FileText,
          imageCaption: "Control objective definition"
        },
        {
          title: "Mapping to Frameworks",
          description: "Link controls to framework requirements (NIST, ISO 27001, SOC 2, COBIT). One control can satisfy multiple framework requirements.",
          image: CheckCircle2,
          imageCaption: "Framework mapping interface",
          tips: "Multi-framework mapping maximizes control value and reduces redundant implementation."
        },
        {
          title: "Defining Implementation Details",
          description: "Document control procedures, frequency, responsible parties, and evidence collection methods. Clear implementation guidance ensures consistency.",
          image: Settings,
          imageCaption: "Implementation details form"
        },
        {
          title: "Setting Success Criteria",
          description: "Define how control effectiveness will be measured: thresholds, KPIs, test procedures. Objective criteria enable consistent evaluation.",
          image: Target,
          imageCaption: "Success criteria configuration",
          warning: "Subjective success criteria lead to inconsistent assessments - use quantifiable metrics."
        }
      ]
    },
    
    testing: {
      icon: TestTube,
      title: "Control Testing",
      steps: [
        {
          title: "Planning Test Schedules",
          description: "Navigate to Testing tab to view and plan control tests. Set testing frequency based on control criticality and risk level.",
          image: TestTube,
          imageCaption: "Testing schedule calendar",
          tips: "High-risk controls should be tested quarterly, medium-risk semi-annually, low-risk annually."
        },
        {
          title: "Selecting Test Samples",
          description: "Choose sample sizes using statistical methods or judgment-based approaches. Document sample selection rationale for audit trail.",
          image: CheckCircle2,
          imageCaption: "Sample selection interface"
        },
        {
          title: "Executing Tests",
          description: "Follow documented test procedures. Record observations, collect evidence (screenshots, reports, logs), and document any deviations.",
          image: TestTube,
          imageCaption: "Test execution workspace",
          warning: "Incomplete evidence collection may result in 'unable to test' conclusions and compliance issues."
        },
        {
          title: "Rating Test Results",
          description: "Rate control operating effectiveness: Effective, Partially Effective, Ineffective, or Not Operating. Provide specific rationale for ratings.",
          image: Target,
          imageCaption: "Test result rating form"
        },
        {
          title: "Managing Exceptions",
          description: "Document control exceptions or failures. Create remediation tasks, assign owners, and set resolution deadlines. Track exception trends.",
          image: AlertCircle,
          imageCaption: "Exception management interface",
          tips: "Recurring exceptions indicate control design flaws - consider redesign rather than continuous exception handling."
        }
      ]
    },
    
    ai_testing: {
      icon: Sparkles,
      title: "AI-Powered Testing",
      steps: [
        {
          title: "Enabling AI Testing",
          description: "The AI Testing Engine analyzes control configurations and automatically suggests optimal test procedures based on control type and industry best practices.",
          image: Sparkles,
          imageCaption: "AI testing engine dashboard",
          tips: "AI suggestions improve over time as it learns from your testing outcomes."
        },
        {
          title: "Automated Evidence Analysis",
          description: "Upload test evidence (logs, reports, configs) and AI automatically extracts relevant data, identifies anomalies, and flags potential issues.",
          image: FileText,
          imageCaption: "AI evidence analyzer"
        },
        {
          title: "Risk-Based Test Prioritization",
          description: "AI prioritizes which controls to test next based on: time since last test, risk exposure, compliance requirements, and historical failure rates.",
          image: Target,
          imageCaption: "AI test prioritization list",
          tips: "Follow AI recommendations but apply professional judgment for organization-specific contexts."
        },
        {
          title: "Predictive Control Failure",
          description: "AI predicts which controls are likely to fail based on patterns, environmental changes, and historical data. Proactively strengthen predicted failures.",
          image: AlertCircle,
          imageCaption: "Predictive failure analytics"
        },
        {
          title: "Natural Language Test Reports",
          description: "AI generates executive summaries and detailed test reports in natural language. Customize report templates for different audiences.",
          image: FileText,
          imageCaption: "AI-generated test report",
          tips: "Export AI reports to share with non-technical stakeholders - clear explanations without jargon."
        }
      ]
    },
    
    gap_analysis: {
      icon: Target,
      title: "Control Gap Analysis",
      steps: [
        {
          title: "Running Gap Analysis",
          description: "Click 'Gap Analysis' to compare your current control environment against frameworks, industry benchmarks, or regulatory requirements.",
          image: Target,
          imageCaption: "Gap analysis initiation",
          tips: "Run gap analyses before external audits to proactively address deficiencies."
        },
        {
          title: "Framework Gap Assessment",
          description: "Select target frameworks (NIST CSF, ISO 27001, CIS Controls) and AI identifies missing controls, partially implemented controls, and coverage gaps.",
          image: CheckCircle2,
          imageCaption: "Framework gap matrix"
        },
        {
          title: "Peer Benchmarking",
          description: "Compare your control maturity against industry peers. Identify areas where you're ahead or behind average for your sector and company size.",
          image: Activity,
          imageCaption: "Peer benchmarking dashboard",
          tips: "Focus on gaps in controls that prevent incidents at peer organizations."
        },
        {
          title: "Remediation Roadmap",
          description: "AI generates a prioritized remediation roadmap: quick wins, high-impact controls, and long-term strategic implementations.",
          image: Zap,
          imageCaption: "Remediation priority matrix"
        },
        {
          title: "Gap Tracking",
          description: "Monitor gap closure progress over time. Track which gaps are being addressed, timelines, and responsible parties.",
          image: Activity,
          imageCaption: "Gap closure tracking dashboard",
          warning: "Unaddressed critical gaps for 90+ days should escalate to executive leadership."
        }
      ]
    },
    
    automation: {
      icon: Zap,
      title: "Control Automation",
      steps: [
        {
          title: "Identifying Automation Candidates",
          description: "AI analyzes your controls and suggests which can be automated: repetitive tasks, data-driven checks, and rule-based assessments.",
          image: Zap,
          imageCaption: "Automation opportunity dashboard",
          tips: "Prioritize automating high-frequency, manual controls for maximum efficiency gain."
        },
        {
          title: "Configuring Automated Controls",
          description: "Set up automated control execution: data sources, execution frequency, success criteria, and alert thresholds. Test before production deployment.",
          image: Settings,
          imageCaption: "Automation configuration panel"
        },
        {
          title: "Continuous Control Monitoring",
          description: "Automated controls run continuously and report status in real-time. Monitor control health dashboards for immediate failure notification.",
          image: Activity,
          imageCaption: "Real-time control monitoring",
          warning: "Automated control failures can indicate security incidents - investigate promptly."
        },
        {
          title: "Integration with Security Tools",
          description: "Connect controls to SIEM, EDR, vulnerability scanners, and cloud security tools. Automated data collection reduces manual testing effort.",
          image: Zap,
          imageCaption: "Security tool integrations"
        },
        {
          title: "Automation Effectiveness Metrics",
          description: "Track automation ROI: time saved, errors reduced, coverage improved, and detection speed. Use metrics to justify additional automation investments.",
          image: Activity,
          imageCaption: "Automation ROI dashboard",
          tips: "Document automation savings to secure budget for expanding automated control coverage."
        }
      ]
    },
    
    register: {
      icon: List,
      title: "Control Register",
      steps: [
        {
          title: "Navigating the Register",
          description: "View all controls in a filterable, sortable table. Search by name, domain, framework, owner, or status. Use grid or list view.",
          image: List,
          imageCaption: "Control register table",
          tips: "Create saved views for different purposes: audit prep, quarterly reviews, executive summaries."
        },
        {
          title: "Filtering and Sorting",
          description: "Filter by domain, category, status, effectiveness, framework, or custom tags. Sort by effectiveness, last test date, or criticality.",
          image: Settings,
          imageCaption: "Advanced filtering options"
        },
        {
          title: "Control Libraries",
          description: "Access pre-built control libraries: NIST 800-53, CIS Controls, ITGC. Import relevant controls directly into your register.",
          image: Download,
          imageCaption: "Control library browser",
          tips: "Customize imported library controls to match your specific environment and naming conventions."
        },
        {
          title: "Bulk Operations",
          description: "Select multiple controls for batch updates: change status, update owners, schedule tests, or apply tags. Saves time on portfolio management.",
          image: CheckCircle2,
          imageCaption: "Bulk operation toolbar"
        },
        {
          title: "Export and Reporting",
          description: "Export filtered views to CSV, Excel, or PDF. Generate control matrices mapping controls to risks and frameworks. Share with auditors and management.",
          image: Download,
          imageCaption: "Export and reporting options",
          tips: "Create control matrices showing multi-framework coverage for efficient compliance demonstrations."
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <BookOpen className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Control Management User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Step-by-step instructions for designing, testing, and optimizing security controls
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
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto bg-transparent p-0">
              {Object.entries(guides).map(([key, guide]) => {
                const Icon = guide.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:border-blue-500/50 border border-[#2a3548] rounded-lg h-auto"
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