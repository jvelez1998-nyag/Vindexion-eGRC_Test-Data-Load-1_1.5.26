import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Activity, Brain, Target, Zap, List, Radio, Network,
  CheckCircle2, AlertCircle, TrendingUp, FileText, Filter, Download
} from "lucide-react";

const GuideSection = ({ icon: Icon, title, steps }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-rose-500/20">
          <Icon className="h-6 w-6 text-rose-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-8 pb-6 border-l-2 border-rose-500/30 last:border-l-0 last:pb-0">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <span className="text-white text-sm font-bold">{idx + 1}</span>
            </div>
            
            <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2a3548]">
              <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{step.description}</p>
              
              {step.image && (
                <div className="bg-[#0f1623] rounded-lg p-4 border border-[#2a3548] mb-3">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-lg">
                    <step.image className="h-16 w-16 text-rose-400/30" />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">{step.imageCaption}</p>
                </div>
              )}
              
              {step.tips && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-rose-400 mb-1">Pro Tip</p>
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

export default function RiskManagementUserGuide() {
  const [activeGuide, setActiveGuide] = useState("overview");

  const guides = {
    overview: {
      icon: Activity,
      title: "Dashboard Overview",
      steps: [
        {
          title: "Risk Portfolio Summary",
          description: "The dashboard displays key metrics including total risks, critical risks, risk treatment progress, and average risk score. These provide instant visibility into your organization's risk posture.",
          image: Activity,
          imageCaption: "Risk portfolio dashboard metrics",
          tips: "Monitor trending indicators - if critical risks are increasing, consider a portfolio review meeting."
        },
        {
          title: "Risk Heat Map Visualization",
          description: "The heat map plots risks by likelihood (x-axis) and impact (y-axis). Risks in the red zone (high likelihood, high impact) require immediate attention and treatment planning.",
          image: Target,
          imageCaption: "Interactive risk heat map",
          tips: "Click any risk on the heat map to drill into its details and treatment plan."
        },
        {
          title: "Treatment Status Tracking",
          description: "Track the distribution of risks across treatment strategies: Accept, Mitigate, Transfer, or Avoid. Monitor treatment effectiveness over time.",
          image: TrendingUp,
          imageCaption: "Risk treatment distribution chart"
        },
        {
          title: "Top Risks Quick View",
          description: "Review your highest-priority risks based on composite risk scores. Each entry shows risk title, category, score, and current treatment status.",
          image: AlertCircle,
          imageCaption: "Top risks ranked list",
          warning: "Critical risks (score 9+) should have documented treatment plans within 7 days of identification."
        }
      ]
    },
    
    analysis: {
      icon: Brain,
      title: "AI Risk Analysis",
      steps: [
        {
          title: "Starting AI Analysis",
          description: "Click 'Run AI Analysis' to initiate intelligent risk assessment. The AI analyzes historical data, industry trends, and your specific risk profile to provide insights.",
          image: Brain,
          imageCaption: "AI analysis initiation screen",
          tips: "Run monthly analyses to track how your risk landscape evolves over time."
        },
        {
          title: "Risk Correlation Detection",
          description: "AI identifies hidden relationships between risks. For example, it might reveal that vendor risks correlate with compliance risks, suggesting a systemic issue.",
          image: Network,
          imageCaption: "Risk correlation network diagram",
          tips: "Use correlation insights to design controls that address multiple related risks simultaneously."
        },
        {
          title: "Predictive Risk Scoring",
          description: "Based on patterns, the AI predicts which risks are likely to materialize and provides probability estimates. This helps prioritize monitoring efforts.",
          image: TrendingUp,
          imageCaption: "Predictive risk timeline"
        },
        {
          title: "Treatment Recommendations",
          description: "AI suggests optimal treatment strategies based on your organization's risk appetite, available resources, and historical effectiveness of similar treatments.",
          image: CheckCircle2,
          imageCaption: "AI treatment recommendations",
          tips: "Review AI recommendations with subject matter experts before implementation."
        },
        {
          title: "Natural Language Queries",
          description: "Ask questions like 'What are my top cyber risks?' or 'Show risks with no recent reviews'. The AI understands and provides targeted answers.",
          image: FileText,
          imageCaption: "Natural language query interface"
        }
      ]
    },
    
    identification: {
      icon: Target,
      title: "Risk Identification Engine",
      steps: [
        {
          title: "Launching Identification Session",
          description: "Click 'Start Identification' to begin a structured risk identification process. You can use templates (PESTLE, SWOT, Scenario Analysis) or start from scratch.",
          image: Target,
          imageCaption: "Risk identification launcher",
          tips: "Involve diverse stakeholders in identification sessions for comprehensive coverage."
        },
        {
          title: "Using Risk Libraries",
          description: "Access pre-built risk libraries including MITRE ATT&CK (cyber threats) and OWASP Top 10 (application security). Import relevant risks directly into your register.",
          image: Download,
          imageCaption: "Risk library browser",
          warning: "Customize imported risks to reflect your specific environment - generic risks lack context."
        },
        {
          title: "Defining Risk Details",
          description: "Document risk title, description, category, owner, and potential causes. Use specific, measurable language rather than vague statements.",
          image: FileText,
          imageCaption: "Risk details form"
        },
        {
          title: "Assessing Likelihood and Impact",
          description: "Rate likelihood (1-5 scale) and impact (1-5 scale) for both inherent (before controls) and residual (after controls) risk states.",
          image: TrendingUp,
          imageCaption: "Likelihood and impact assessment",
          tips: "Use consistent rating criteria across all risks for meaningful comparisons."
        },
        {
          title: "Linking to Existing Entities",
          description: "Connect risks to relevant controls, incidents, compliance requirements, and assets. This creates a holistic view of your risk landscape.",
          image: Network,
          imageCaption: "Entity linking interface"
        }
      ]
    },
    
    treatment: {
      icon: Zap,
      title: "Risk Treatment Workflow",
      steps: [
        {
          title: "Selecting Treatment Strategy",
          description: "Choose from four strategies: Mitigate (reduce), Transfer (share/insure), Avoid (eliminate activity), or Accept (acknowledge). Base decisions on cost-benefit analysis.",
          image: Zap,
          imageCaption: "Treatment strategy selector",
          tips: "Document rationale for acceptance decisions - regulators often request justification."
        },
        {
          title: "Creating Treatment Plans",
          description: "Document specific actions, assign owners, set deadlines, and allocate budget. Break complex treatments into manageable tasks with milestones.",
          image: FileText,
          imageCaption: "Treatment plan builder"
        },
        {
          title: "Implementing Controls",
          description: "Link treatment plans to new or existing controls. Track control implementation progress and test effectiveness regularly.",
          image: CheckCircle2,
          imageCaption: "Control implementation tracker",
          warning: "Controls must be tested before considering treatment complete."
        },
        {
          title: "Monitoring Treatment Progress",
          description: "Use the treatment dashboard to monitor status: planned, in-progress, completed, or overdue. Set up alerts for approaching deadlines.",
          image: Activity,
          imageCaption: "Treatment monitoring dashboard"
        },
        {
          title: "Measuring Effectiveness",
          description: "Track residual risk scores over time. Effective treatments should show measurable reduction in risk levels. Re-assess quarterly.",
          image: TrendingUp,
          imageCaption: "Treatment effectiveness metrics",
          tips: "If residual risk remains high after treatment, consider additional controls or strategy change."
        }
      ]
    },
    
    monitoring: {
      icon: Activity,
      title: "Automated Risk Monitoring",
      steps: [
        {
          title: "Setting Up Monitoring Rules",
          description: "Configure automated monitoring for key risk indicators (KRIs). Set thresholds that trigger alerts when risk levels change significantly.",
          image: Activity,
          imageCaption: "Monitoring rules configuration",
          tips: "Start with 3-5 critical KRIs per high-priority risk rather than monitoring everything."
        },
        {
          title: "Integrating Data Sources",
          description: "Connect external data feeds (SIEM, vulnerability scanners, financial systems) to automatically update risk levels based on real-time information.",
          image: Radio,
          imageCaption: "Data source integrations"
        },
        {
          title: "Configuring Alerts",
          description: "Set up notification rules: who gets alerted, when, and through which channels (email, Slack, Teams). Customize by risk severity and type.",
          image: AlertCircle,
          imageCaption: "Alert configuration panel",
          warning: "Avoid alert fatigue - set meaningful thresholds that warrant immediate attention."
        },
        {
          title: "Scheduled Risk Reviews",
          description: "Configure automatic review cycles (monthly, quarterly, annually) based on risk tier. The system creates review tasks and sends reminders.",
          image: CheckCircle2,
          imageCaption: "Scheduled review calendar"
        },
        {
          title: "Monitoring Dashboard",
          description: "View real-time risk status, trending indicators, overdue reviews, and treatment progress. Export reports for management and audit purposes.",
          image: Activity,
          imageCaption: "Real-time monitoring dashboard",
          tips: "Schedule weekly reviews of the monitoring dashboard to catch emerging issues early."
        }
      ]
    },
    
    register: {
      icon: List,
      title: "Risk Register Management",
      steps: [
        {
          title: "Navigating the Register",
          description: "The register displays all identified risks in a sortable, filterable table. Use search to find specific risks by title, category, owner, or keywords.",
          image: List,
          imageCaption: "Risk register table view",
          tips: "Create custom views (saved filters) for different stakeholder groups - executives, auditors, operations."
        },
        {
          title: "Filtering and Sorting",
          description: "Filter by category, status, severity, owner, or treatment strategy. Sort by risk score, date, or alphabetically. Combine filters for precise views.",
          image: Filter,
          imageCaption: "Advanced filtering options"
        },
        {
          title: "Bulk Operations",
          description: "Select multiple risks to perform batch updates: change owner, update status, apply tags, or export. Saves time when managing large portfolios.",
          image: CheckCircle2,
          imageCaption: "Bulk operations toolbar",
          tips: "Use bulk tagging to quickly categorize risks by project, department, or regulatory requirement."
        },
        {
          title: "Exporting Risk Data",
          description: "Export filtered views to CSV, Excel, or PDF. Choose from standard formats or customize columns. Useful for board reports and regulatory submissions.",
          image: Download,
          imageCaption: "Export options dialog"
        },
        {
          title: "Risk Versioning and Audit Trail",
          description: "Track all changes to risk records with automatic versioning. View who changed what and when. Essential for audit trail compliance.",
          image: FileText,
          imageCaption: "Version history and audit trail",
          warning: "Risk deletions are permanent - consider archiving instead for audit trail preservation."
        }
      ]
    },
    
    feeds: {
      icon: Radio,
      title: "External Risk Intelligence",
      steps: [
        {
          title: "Connecting Intelligence Feeds",
          description: "Integrate external threat intelligence sources: industry-specific feeds, regulatory updates, threat actor tracking, and vulnerability databases.",
          image: Radio,
          imageCaption: "Feed source configuration",
          tips: "Start with free feeds (NIST, CISA alerts) before investing in commercial threat intelligence."
        },
        {
          title: "Configuring Feed Filters",
          description: "Set relevance filters to avoid information overload. Filter by industry, threat type, geography, asset type, or severity level.",
          image: Filter,
          imageCaption: "Feed filtering rules"
        },
        {
          title: "Auto-Risk Creation",
          description: "Enable automatic risk creation for high-severity intelligence items. The system creates draft risks that you review and approve.",
          image: Target,
          imageCaption: "Auto-risk creation workflow",
          warning: "Review auto-created risks for applicability - not all external threats impact your environment."
        },
        {
          title: "Threat Actor Tracking",
          description: "Monitor specific threat actors, campaigns, or TTPs (tactics, techniques, procedures) relevant to your industry and technology stack.",
          image: Activity,
          imageCaption: "Threat actor monitoring dashboard"
        },
        {
          title: "Intelligence Digest Reports",
          description: "Generate weekly or monthly digests summarizing key intelligence findings, new threats, and recommended actions. Share with security teams.",
          image: FileText,
          imageCaption: "Intelligence digest report",
          tips: "Schedule digest reviews during standing security meetings to ensure insights drive action."
        }
      ]
    },
    
    visualization: {
      icon: Network,
      title: "Risk Visualizations & Networks",
      steps: [
        {
          title: "Risk-Control Network Map",
          description: "Visualize relationships between risks and controls. Identify risks with insufficient controls (orphaned risks) and controls protecting multiple risks.",
          image: Network,
          imageCaption: "Risk-control network diagram",
          tips: "Look for single points of failure - critical risks with only one control."
        },
        {
          title: "Interactive Risk Landscape",
          description: "3D visualization of your risk landscape. Risks appear as bubbles sized by impact, colored by category, positioned by likelihood and consequence.",
          image: Target,
          imageCaption: "3D risk landscape visualization"
        },
        {
          title: "Risk Propagation Analysis",
          description: "See how risks cascade through your organization. Understand which operational risks could trigger financial, reputation, or regulatory impacts.",
          image: Network,
          imageCaption: "Risk propagation flow diagram",
          tips: "Use propagation analysis for business impact assessments and disaster recovery planning."
        },
        {
          title: "Trend Analysis Charts",
          description: "Track risk metrics over time: total risks, risk scores, treatment effectiveness, and control coverage. Identify positive trends or emerging problems.",
          image: TrendingUp,
          imageCaption: "Multi-period trend charts"
        },
        {
          title: "Custom Dashboard Builder",
          description: "Create custom visualizations for specific stakeholder needs. Drag-and-drop widgets, set data sources, and save reusable dashboards.",
          image: Activity,
          imageCaption: "Custom dashboard builder",
          tips: "Build executive dashboards with high-level metrics and operational dashboards with detailed data."
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/20">
              <BookOpen className="h-7 w-7 text-rose-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Risk Management User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Comprehensive instructions for identifying, assessing, treating, and monitoring risks
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
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:border-rose-500/50 border border-[#2a3548] rounded-lg h-auto"
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