import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Activity, Target, Shield, Zap, ClipboardList, Brain,
  CheckCircle2, AlertCircle, Sparkles
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

export default function RiskAssessmentUserGuide() {
  const [activeGuide, setActiveGuide] = useState("dashboard");

  const guides = {
    dashboard: {
      icon: Activity,
      title: "Risk Dashboard",
      steps: [
        {
          title: "Overview Metrics",
          description: "View key risk metrics at a glance: critical risks, high risks, open risks, and overdue items. These KPIs provide instant insight into your risk exposure.",
          image: Activity,
          imageCaption: "Dashboard metrics overview",
          tips: "Monitor the critical risk count daily - aim to keep it below 5% of total risks."
        },
        {
          title: "Risk Heat Map",
          description: "Visual representation of risks plotted by likelihood and impact. Helps identify concentration areas and prioritize resources.",
          image: Target,
          imageCaption: "Risk heat map visualization"
        },
        {
          title: "Trend Analysis",
          description: "Track risk metrics over time to identify patterns. See if risks are increasing, decreasing, or remaining stable across categories.",
          image: Zap,
          imageCaption: "Risk trend charts",
          tips: "Review trends monthly to spot emerging risk patterns early."
        },
        {
          title: "Quick Actions",
          description: "Access frequently used functions: add new risk, run AI analysis, generate reports, and export data directly from the dashboard.",
          image: ClipboardList,
          imageCaption: "Quick action buttons"
        }
      ]
    },
    
    engine: {
      icon: Target,
      title: "Risk Identification Engine",
      steps: [
        {
          title: "Starting Risk Identification",
          description: "Launch the guided workflow to identify new risks. The engine walks you through structured risk assessment questions.",
          image: Target,
          imageCaption: "Risk identification wizard",
          tips: "Use the AI-powered question prompts to ensure comprehensive risk identification."
        },
        {
          title: "Risk Categorization",
          description: "Classify risks by category: operational, financial, strategic, compliance, cybersecurity, or reputational. Proper categorization enables better analysis and reporting.",
          image: Shield,
          imageCaption: "Risk category selection"
        },
        {
          title: "Likelihood & Impact Assessment",
          description: "Rate likelihood (1-5) and impact (1-5) for each risk. The system calculates risk score automatically (Likelihood × Impact).",
          image: Activity,
          imageCaption: "Risk scoring interface",
          warning: "Be consistent in scoring - use organizational criteria and consider both qualitative and quantitative factors."
        },
        {
          title: "Risk Context",
          description: "Document risk description, potential causes, consequences, and existing controls. Rich context enables better decision-making and treatment planning.",
          image: ClipboardList,
          imageCaption: "Risk details form"
        },
        {
          title: "Assignment & Timing",
          description: "Assign risk owners and set due dates for assessment and mitigation activities. Clear ownership ensures accountability.",
          image: CheckCircle2,
          imageCaption: "Risk assignment",
          tips: "Risk owners should have authority and resources to manage the risk effectively."
        }
      ]
    },
    
    treatment: {
      icon: Shield,
      title: "Risk Treatment Planning",
      steps: [
        {
          title: "Treatment Strategies",
          description: "Select appropriate risk response: avoid, mitigate, transfer, or accept. Each strategy has different implications for controls and residual risk.",
          image: Shield,
          imageCaption: "Treatment strategy options",
          tips: "Critical risks typically require mitigation or avoidance. Low risks may be accepted."
        },
        {
          title: "Control Selection",
          description: "Identify and document controls that reduce risk likelihood or impact. Link existing controls or plan new ones.",
          image: CheckCircle2,
          imageCaption: "Control linking interface"
        },
        {
          title: "AI Control Suggestions",
          description: "Use AI to generate relevant control recommendations based on risk profile. AI analyzes risk characteristics and suggests preventive, detective, and corrective controls.",
          image: Sparkles,
          imageCaption: "AI control generator",
          tips: "Review AI suggestions carefully and customize to your organization's context."
        },
        {
          title: "Treatment Plan Documentation",
          description: "Document treatment approach, implementation timeline, resource requirements, and success criteria. Comprehensive plans ensure effective execution.",
          image: ClipboardList,
          imageCaption: "Treatment plan template"
        },
        {
          title: "Residual Risk Assessment",
          description: "After controls are applied, reassess likelihood and impact to calculate residual risk. Monitor to ensure risk stays within acceptable tolerance.",
          image: Target,
          imageCaption: "Residual risk calculation",
          warning: "Residual risk should align with organization's risk appetite. Escalate if tolerance is exceeded."
        }
      ]
    },
    
    aitools: {
      icon: Sparkles,
      title: "AI-Powered Tools",
      steps: [
        {
          title: "AI Risk Prioritization",
          description: "Multi-factor analysis to intelligently rank risks. AI considers likelihood, impact, business criticality, existing controls, urgency, and cascading effects.",
          image: Brain,
          imageCaption: "AI prioritization engine",
          tips: "Run prioritization monthly or after significant changes to the risk landscape."
        },
        {
          title: "Control Suggestion Engine",
          description: "AI generates tailored control recommendations for each risk. Provides control type, effectiveness rating, implementation complexity, and detailed rationale.",
          image: Sparkles,
          imageCaption: "Control suggestion interface",
          tips: "AI suggests 5-7 controls per risk - select those most feasible for your organization."
        },
        {
          title: "Dynamic Threat Intelligence",
          description: "Real-time risk scoring based on external threat data. AI monitors CVE databases, security bulletins, news feeds, and industry reports to adjust risk scores dynamically.",
          image: Activity,
          imageCaption: "Threat intelligence dashboard",
          warning: "Threat-adjusted scores may significantly increase risk ratings based on current threat landscape."
        },
        {
          title: "Predictive Risk Analytics",
          description: "AI identifies patterns and predicts emerging risks. Analyzes historical data, incident trends, and control effectiveness to forecast future risk scenarios.",
          image: Zap,
          imageCaption: "Predictive analytics"
        },
        {
          title: "Automated Insights",
          description: "AI continuously analyzes risk portfolio and generates actionable insights: risk concentrations, control gaps, emerging patterns, and optimization recommendations.",
          image: Brain,
          imageCaption: "AI insights panel",
          tips: "Review AI insights weekly to stay ahead of evolving risk landscape."
        }
      ]
    },
    
    register: {
      icon: ClipboardList,
      title: "Risk Register Management",
      steps: [
        {
          title: "Register Overview",
          description: "Complete list of all identified risks with key details: title, category, status, likelihood, impact, score, and owner. Central repository for risk information.",
          image: ClipboardList,
          imageCaption: "Risk register view",
          tips: "Keep register up-to-date - outdated information leads to poor decisions."
        },
        {
          title: "Filtering & Search",
          description: "Filter risks by category, status, owner, or custom criteria. Search by keyword to quickly find specific risks. Combine filters for precise queries.",
          image: Target,
          imageCaption: "Filter and search tools"
        },
        {
          title: "Sorting & Views",
          description: "Sort by risk score, date, title, or custom fields. Switch between list and grid views. Customize display to match your workflow.",
          image: Activity,
          imageCaption: "View customization options",
          tips: "Use grid view for visual scanning, list view for detailed analysis."
        },
        {
          title: "Bulk Operations",
          description: "Select multiple risks for bulk actions: export, delete, status update, or reassignment. Efficient management of large risk portfolios.",
          image: CheckCircle2,
          imageCaption: "Bulk action toolbar"
        },
        {
          title: "Risk Details & Editing",
          description: "Click any risk to view full details or edit. Track change history, view linked controls, see comments, and monitor workflow status.",
          image: Shield,
          imageCaption: "Risk detail view",
          warning: "Major risk changes should be reviewed and approved per your governance process."
        },
        {
          title: "Exporting & Reporting",
          description: "Export risk register to CSV, PDF, or Excel. Generate custom reports for stakeholders, auditors, or board presentations.",
          image: ClipboardList,
          imageCaption: "Export options",
          tips: "Schedule automated reports to keep stakeholders informed without manual effort."
        }
      ]
    },
    
    monitoring: {
      icon: Zap,
      title: "Continuous Risk Monitoring",
      steps: [
        {
          title: "Automated Monitoring Setup",
          description: "Configure continuous monitoring rules: thresholds, alert triggers, escalation criteria, and notification preferences. System monitors risks 24/7.",
          image: Zap,
          imageCaption: "Monitoring configuration",
          tips: "Set thresholds aligned with risk appetite - not too sensitive to avoid alert fatigue."
        },
        {
          title: "Real-Time Alerts",
          description: "Receive immediate notifications when risks exceed thresholds, controls fail, due dates approach, or external threats emerge.",
          image: AlertCircle,
          imageCaption: "Alert notification system"
        },
        {
          title: "KRI Tracking",
          description: "Monitor Key Risk Indicators (KRIs) to detect risk changes early. Track metrics over time and identify concerning trends before risks materialize.",
          image: Activity,
          imageCaption: "KRI dashboard",
          warning: "Respond promptly to KRI threshold breaches - delayed action can lead to risk escalation."
        },
        {
          title: "External Data Integration",
          description: "Integrate external threat feeds, vulnerability databases, and industry reports. Enrich risk assessments with real-world intelligence.",
          image: Sparkles,
          imageCaption: "External data feeds"
        },
        {
          title: "Periodic Review Workflow",
          description: "Automated reminders for scheduled risk reviews. Ensure risks are reassessed at appropriate intervals based on criticality and organizational policies.",
          image: CheckCircle2,
          imageCaption: "Review workflow automation",
          tips: "Critical risks: monthly review. High: quarterly. Medium/Low: semi-annual or annual."
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
              <CardTitle className="text-2xl text-white">Risk Assessment User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Complete guide to risk identification, assessment, treatment, and monitoring
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