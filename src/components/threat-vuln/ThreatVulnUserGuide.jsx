import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Activity, 
  Shield, 
  Crosshair, 
  Network, 
  List, 
  Brain, 
  Zap,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Settings,
  Play,
  FileText,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Eye
} from "lucide-react";

const GuideSection = ({ icon: Icon, title, steps, images }) => {
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

export default function ThreatVulnUserGuide() {
  const [activeGuide, setActiveGuide] = useState("dashboard");

  const guides = {
    dashboard: {
      icon: Activity,
      title: "Dashboard Overview",
      steps: [
        {
          title: "Understanding Key Metrics",
          description: "The dashboard displays four critical metrics at the top: Critical CVEs, Active Threats, Total Vulnerabilities, and Average CVSS Score. These cards provide real-time visibility into your security posture.",
          image: Activity,
          imageCaption: "Dashboard key metrics display",
          tips: "Click on any metric card to filter the detailed views below and drill down into specific categories."
        },
        {
          title: "Analyzing Vulnerability Trends",
          description: "The trend chart shows detected vs. remediated vulnerabilities over the past 6 months. The red line represents newly detected threats, while the green line shows successful remediations.",
          image: Activity,
          imageCaption: "Vulnerability trend line chart",
          tips: "Watch for diverging lines - if detected vulnerabilities consistently exceed remediated ones, you may need to increase remediation capacity."
        },
        {
          title: "Severity Distribution Analysis",
          description: "The pie chart breaks down all vulnerabilities by severity level (Critical, High, Medium, Low). Use this to prioritize your remediation efforts.",
          image: Shield,
          imageCaption: "Severity distribution pie chart"
        },
        {
          title: "Top Active Threats List",
          description: "Review the list of highest-priority threats based on CVSS scores and current status. Each threat shows its severity badge and remediation status.",
          image: AlertCircle,
          imageCaption: "Active threats list view",
          warning: "Critical vulnerabilities (CVSS 9.0+) should be addressed within 24-48 hours according to industry best practices."
        }
      ]
    },
    
    cve: {
      icon: Shield,
      title: "CVE Feed Management",
      steps: [
        {
          title: "Connecting to CVE Feeds",
          description: "Navigate to the CVE Feeds tab and click 'Add Feed Source'. Select from popular sources like NIST NVD, MITRE, or vendor-specific feeds (Microsoft, Oracle, etc.).",
          image: Download,
          imageCaption: "CVE feed source configuration",
          tips: "Start with NIST NVD as your primary source - it's comprehensive and well-maintained."
        },
        {
          title: "Configuring Auto-Sync",
          description: "Enable automatic synchronization by clicking the Settings icon. Set your preferred sync frequency (hourly, daily, or real-time) and configure filters for CVE severity levels.",
          image: Settings,
          imageCaption: "Auto-sync settings panel",
          tips: "Real-time sync is recommended for production environments, but hourly sync works well for most use cases."
        },
        {
          title: "Filtering and Searching CVEs",
          description: "Use the search bar to find specific CVE IDs (e.g., CVE-2024-12345) or use filters to narrow by severity, date range, vendor, or product category.",
          image: Filter,
          imageCaption: "CVE search and filter interface",
          tips: "Create saved filter presets for your most commonly used searches to save time."
        },
        {
          title: "Mapping CVEs to Assets",
          description: "Click 'Map to Assets' on any CVE to link it to affected systems in your environment. This creates automatic tracking and remediation workflows.",
          image: Network,
          imageCaption: "CVE-to-asset mapping interface",
          warning: "Ensure your asset inventory is up-to-date before mapping CVEs for accurate vulnerability tracking."
        },
        {
          title: "Setting Up Notifications",
          description: "Configure notification rules in Settings to receive alerts for critical CVEs. Choose notification channels (email, Slack, Teams) and set severity thresholds.",
          image: Bell,
          imageCaption: "Notification configuration screen"
        }
      ]
    },
    
    hunting: {
      icon: Crosshair,
      title: "Threat Hunting Engine",
      steps: [
        {
          title: "Creating a Threat Hunt",
          description: "Click 'New Hunt' to start. Define your hypothesis (e.g., 'Detect lateral movement patterns') and select data sources to analyze (logs, network traffic, endpoints).",
          image: Play,
          imageCaption: "New threat hunt creation form",
          tips: "Base your hunts on MITRE ATT&CK techniques for structured, proven threat patterns."
        },
        {
          title: "Building Hunt Queries",
          description: "Use the query builder to define detection logic. You can use simple filters or write advanced queries using the query language. The AI assistant can help generate queries.",
          image: Search,
          imageCaption: "Query builder interface",
          tips: "Start with pre-built query templates and customize them for your environment."
        },
        {
          title: "Running the Hunt",
          description: "Click 'Execute Hunt' to run your query against selected time ranges. Monitor progress in real-time as the engine scans your data sources.",
          image: Activity,
          imageCaption: "Hunt execution progress view",
          warning: "Large time ranges may take significant time to process. Start with smaller windows for initial hunts."
        },
        {
          title: "Analyzing Hunt Results",
          description: "Review detected indicators, timeline visualizations, and affected assets. Use the severity scoring to prioritize investigation of findings.",
          image: Eye,
          imageCaption: "Hunt results analysis dashboard"
        },
        {
          title: "Creating Response Playbooks",
          description: "Convert confirmed threats into automated response playbooks. Define containment actions, notification workflows, and remediation steps.",
          image: FileText,
          imageCaption: "Playbook creation interface",
          tips: "Link hunts to incident response plans for seamless escalation when threats are confirmed."
        }
      ]
    },
    
    modeling: {
      icon: Network,
      title: "Threat Modeling Canvas",
      steps: [
        {
          title: "Starting a New Model",
          description: "Click 'Create Model' and select your application or system type. Choose from templates (web app, API, microservices) or start from scratch.",
          image: Network,
          imageCaption: "Model creation and template selection",
          tips: "Use templates to accelerate modeling - they come pre-populated with common components and threat patterns."
        },
        {
          title: "Adding System Components",
          description: "Drag and drop components (servers, databases, APIs, users) onto the canvas. Connect them with data flows to map how information moves through your system.",
          image: Network,
          imageCaption: "Component placement and connections",
          tips: "Group related components into trust boundaries to visualize security perimeters."
        },
        {
          title: "Identifying Threats (STRIDE)",
          description: "For each component and data flow, the system suggests threats using the STRIDE methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).",
          image: Shield,
          imageCaption: "STRIDE threat identification",
          warning: "Don't skip any components - even seemingly minor ones can introduce significant risks."
        },
        {
          title: "Assigning Risk Ratings",
          description: "Rate each identified threat based on likelihood and impact. The system calculates a composite risk score and prioritizes threats automatically.",
          image: AlertCircle,
          imageCaption: "Risk rating interface"
        },
        {
          title: "Defining Mitigations",
          description: "For each threat, document mitigation strategies and map them to existing controls. Track mitigation status and assign ownership.",
          image: CheckCircle2,
          imageCaption: "Mitigation tracking view",
          tips: "Link mitigations to your control framework for holistic security coverage."
        },
        {
          title: "Generating Reports",
          description: "Export threat models as PDF reports, Excel spreadsheets, or integrate with other tools via API. Reports include diagrams, threat lists, and mitigation plans.",
          image: FileText,
          imageCaption: "Report generation options"
        }
      ]
    },
    
    register: {
      icon: List,
      title: "Vulnerability Register",
      steps: [
        {
          title: "Viewing the Register",
          description: "The register displays all identified vulnerabilities in a centralized table. Use column sorting and filtering to organize by severity, age, owner, or status.",
          image: List,
          imageCaption: "Vulnerability register table view",
          tips: "Save custom views for different stakeholder groups (exec summary, technical details, remediation tracking)."
        },
        {
          title: "Adding Vulnerabilities Manually",
          description: "Click 'Add Vulnerability' to manually log findings from security assessments, penetration tests, or bug bounty programs that aren't auto-detected.",
          image: Upload,
          imageCaption: "Manual vulnerability entry form"
        },
        {
          title: "Bulk Import from Scans",
          description: "Import vulnerability scan results from tools like Nessus, Qualys, or Burp Suite. Use the CSV/JSON import feature for batch processing.",
          image: Upload,
          imageCaption: "Bulk import interface",
          warning: "Review imported data for duplicates and ensure proper categorization before finalizing imports."
        },
        {
          title: "Managing Vulnerability Lifecycle",
          description: "Update vulnerability status through the workflow: Detected → Validated → Assigned → Remediated → Verified → Closed. Track time-in-stage metrics.",
          image: Activity,
          imageCaption: "Lifecycle status workflow"
        },
        {
          title: "Setting Remediation Deadlines",
          description: "Assign SLA-based deadlines based on severity: Critical (7 days), High (30 days), Medium (60 days), Low (90 days). Configure custom SLAs as needed.",
          image: Settings,
          imageCaption: "SLA configuration settings",
          tips: "Enable auto-escalation for overdue vulnerabilities to ensure accountability."
        },
        {
          title: "Tracking Remediation Progress",
          description: "Monitor remediation metrics: time-to-fix, remediation rate, recurring vulnerabilities, and team performance. Use dashboards for stakeholder reporting.",
          image: Activity,
          imageCaption: "Remediation metrics dashboard"
        }
      ]
    },
    
    ai: {
      icon: Brain,
      title: "AI-Powered Assessment",
      steps: [
        {
          title: "Initiating AI Analysis",
          description: "Click 'Start AI Assessment' to begin intelligent analysis of your threat landscape. The AI analyzes patterns across all data sources.",
          image: Brain,
          imageCaption: "AI assessment initiation screen",
          tips: "Run AI assessments weekly to catch emerging patterns and threat trends."
        },
        {
          title: "Risk Correlation Analysis",
          description: "The AI identifies hidden relationships between vulnerabilities, threats, and assets. It surfaces non-obvious attack paths that manual analysis might miss.",
          image: Network,
          imageCaption: "Risk correlation visualization"
        },
        {
          title: "Predictive Threat Modeling",
          description: "Based on historical data and industry threat intelligence, the AI predicts likely future threats specific to your environment and suggests preemptive controls.",
          image: Activity,
          imageCaption: "Predictive threat timeline",
          tips: "Use predictions to inform security roadmap planning and budget allocation."
        },
        {
          title: "Automated Remediation Prioritization",
          description: "AI prioritizes remediation efforts by analyzing: business impact, exploit availability, asset criticality, and threat actor interest. Optimizes your security ROI.",
          image: CheckCircle2,
          imageCaption: "AI remediation priority list",
          warning: "While AI provides recommendations, always validate critical decisions with human expertise."
        },
        {
          title: "Natural Language Queries",
          description: "Ask questions in plain English: 'What are my top 5 risks?' or 'Show vulnerabilities affecting production databases'. The AI interprets and answers.",
          image: Search,
          imageCaption: "Natural language query interface",
          tips: "Export AI insights to share with non-technical stakeholders - the AI explains findings in accessible language."
        }
      ]
    },
    
    playbooks: {
      icon: FileText,
      title: "Resiliency Playbooks",
      steps: [
        {
          title: "Browsing Playbook Library",
          description: "Access pre-built playbooks for common scenarios: Ransomware Response, DDoS Mitigation, Data Breach, Insider Threat, APT Detection, etc.",
          image: BookOpen,
          imageCaption: "Playbook library browser",
          tips: "Customize existing playbooks rather than building from scratch - it's faster and leverages proven procedures."
        },
        {
          title: "Creating Custom Playbooks",
          description: "Click 'New Playbook' to build custom response procedures. Define triggers (what activates the playbook), actions (what to do), and decision points.",
          image: FileText,
          imageCaption: "Playbook editor interface"
        },
        {
          title: "Defining Automated Actions",
          description: "Configure automatic responses: isolate infected hosts, block IPs, disable accounts, capture forensic evidence, or trigger notifications.",
          image: Zap,
          imageCaption: "Automated action configuration",
          warning: "Test automated actions in a sandbox environment before enabling in production to avoid unintended disruptions."
        },
        {
          title: "Setting Approval Workflows",
          description: "For sensitive actions (e.g., production system changes), configure approval gates. Define approvers and timeout escalations.",
          image: CheckCircle2,
          imageCaption: "Approval workflow configuration"
        },
        {
          title: "Executing Playbooks",
          description: "Manually trigger playbooks from threat details or set them to auto-execute based on criteria. Monitor execution in real-time with step-by-step progress.",
          image: Play,
          imageCaption: "Playbook execution monitor",
          tips: "Document lessons learned after each playbook execution to continuously improve response procedures."
        },
        {
          title: "Measuring Playbook Effectiveness",
          description: "Track metrics: mean time to respond (MTTR), mean time to resolve (MTTR), containment speed, and false positive rates. Optimize based on data.",
          image: Activity,
          imageCaption: "Playbook performance metrics"
        }
      ]
    },
    
    automation: {
      icon: Zap,
      title: "Automation & Integration",
      steps: [
        {
          title: "Connecting External Tools",
          description: "Integrate with SIEM, SOAR, ticketing (Jira, ServiceNow), scanning tools, and cloud providers. Use OAuth for secure authentication.",
          image: Network,
          imageCaption: "Integration marketplace and connectors",
          tips: "Start with your SIEM integration - it's the foundation for automated threat correlation."
        },
        {
          title: "Creating Automation Rules",
          description: "Build 'if-this-then-that' rules: 'If critical CVE detected in production → Create P1 ticket → Notify security team → Auto-assign to owner'.",
          image: Zap,
          imageCaption: "Automation rule builder",
          tips: "Use rule templates for common scenarios and customize the details for your environment."
        },
        {
          title: "Setting Up Scheduled Tasks",
          description: "Configure recurring tasks: daily CVE sync, weekly vulnerability scans, monthly threat hunts, quarterly assessments. Set schedules and notifications.",
          image: Settings,
          imageCaption: "Scheduled task configuration"
        },
        {
          title: "Configuring Data Enrichment",
          description: "Enable automatic enrichment of threat indicators with OSINT, commercial threat intel, and historical context. Reduces manual research time.",
          image: Brain,
          imageCaption: "Data enrichment pipeline",
          warning: "Monitor API rate limits for external enrichment sources to avoid disruptions."
        },
        {
          title: "Building Custom Workflows",
          description: "Use the visual workflow builder to create complex multi-step automations with branching logic, parallel processing, and error handling.",
          image: Network,
          imageCaption: "Visual workflow designer"
        },
        {
          title: "Monitoring Automation Health",
          description: "Track automation execution: success rates, failure reasons, processing times, and resource usage. Set up alerts for automation failures.",
          image: Activity,
          imageCaption: "Automation health dashboard",
          tips: "Review automation logs weekly to identify opportunities for optimization and catch edge cases."
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
              <CardTitle className="text-2xl text-white">Threat & Vulnerability Management User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Comprehensive step-by-step instructions for using all features and customizing the module
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