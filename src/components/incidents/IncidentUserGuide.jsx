import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Activity, AlertTriangle, Shield, Zap, Brain, Book,
  CheckCircle2, AlertCircle, FileText, Bell, Clock
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
            <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <span className="text-white text-sm font-bold">{idx + 1}</span>
            </div>
            
            <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2a3548]">
              <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{step.description}</p>
              
              {step.image && (
                <div className="bg-[#0f1623] rounded-lg p-4 border border-[#2a3548] mb-3">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-lg">
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

export default function IncidentUserGuide() {
  const [activeGuide, setActiveGuide] = useState("dashboard");

  const guides = {
    dashboard: {
      icon: Activity,
      title: "Incident Dashboard",
      steps: [
        {
          title: "Understanding Key Metrics",
          description: "The dashboard shows total incidents, critical incidents, open incidents, and average resolution time. These metrics indicate incident management maturity.",
          image: Activity,
          imageCaption: "Incident metrics overview",
          tips: "Track MTTR (mean time to resolve) trends - decreasing MTTR indicates improving incident response capability."
        },
        {
          title: "Severity Distribution Analysis",
          description: "View breakdown of incidents by severity (Critical, High, Medium, Low). Use this to understand your threat landscape and allocate response resources.",
          image: AlertTriangle,
          imageCaption: "Severity distribution visualization"
        },
        {
          title: "Incident Status Tracking",
          description: "Monitor incident lifecycle stages: Reported, Triaging, Investigating, Contained, Remediated, Closed. Identify bottlenecks in your response process.",
          image: Clock,
          imageCaption: "Incident status workflow",
          warning: "Incidents stuck in 'Investigating' for 7+ days may indicate resource constraints or complexity issues."
        },
        {
          title: "Recent Incident Timeline",
          description: "Review chronological incident history with severity indicators. Identify patterns, recurring issues, or clustering that might indicate systemic problems.",
          image: Activity,
          imageCaption: "Incident timeline view",
          tips: "Look for incident clusters - multiple incidents in short timeframes often share root causes."
        }
      ]
    },
    
    reporting: {
      icon: AlertTriangle,
      title: "Incident Reporting",
      steps: [
        {
          title: "Initiating Incident Report",
          description: "Click 'Report Incident' to start guided reporting. Provide initial details: title, type, severity, discovered date, and affected systems.",
          image: AlertTriangle,
          imageCaption: "Incident reporting form",
          tips: "Report incidents immediately upon discovery - time is critical for containment."
        },
        {
          title: "Classifying Incident Type",
          description: "Select incident type: Security Breach, Data Leak, System Outage, Policy Violation, Compliance Breach, or Fraud. Accurate classification routes to correct response team.",
          image: FileText,
          imageCaption: "Incident type selector"
        },
        {
          title: "Assessing Severity",
          description: "Rate severity based on impact scope, data sensitivity, system criticality, and regulatory implications. Use severity matrix for consistency.",
          image: AlertCircle,
          imageCaption: "Severity assessment matrix",
          warning: "Under-rating severity delays executive notification and can worsen impact - err on the side of higher severity."
        },
        {
          title: "Documenting Affected Systems",
          description: "List all affected systems, applications, data repositories, and user populations. Complete asset documentation aids containment and forensics.",
          image: Shield,
          imageCaption: "Affected systems checklist"
        },
        {
          title: "Regulatory Notification Assessment",
          description: "Determine if incident requires regulatory notification (data breaches, financial fraud, etc.). System provides guidance on notification timelines and authorities.",
          image: Bell,
          imageCaption: "Regulatory notification requirements",
          warning: "Many jurisdictions require breach notification within 72 hours - start assessment immediately."
        }
      ]
    },
    
    response: {
      icon: Shield,
      title: "Incident Response Planning",
      steps: [
        {
          title: "Activating Response Plan",
          description: "Upon incident detection, activate pre-built response playbooks for the incident type. Playbooks guide containment, eradication, and recovery actions.",
          image: Shield,
          imageCaption: "Response playbook activation",
          tips: "Customize standard playbooks for your environment during peacetime, not during active incidents."
        },
        {
          title: "Assembling Response Team",
          description: "Assign incident commander and response team members. Define roles: technical lead, communications, legal liaison, executive sponsor.",
          image: Activity,
          imageCaption: "Response team assignment"
        },
        {
          title: "Containment Actions",
          description: "Document and execute containment steps: isolate systems, disable accounts, block IPs, segment networks. Track action status and effectiveness.",
          image: CheckCircle2,
          imageCaption: "Containment action tracker",
          warning: "Document all containment actions with timestamps - forensic integrity requires detailed logs."
        },
        {
          title: "Evidence Preservation",
          description: "Capture forensic evidence: system logs, memory dumps, network traffic, screenshots. Follow chain of custody procedures for potential legal proceedings.",
          image: FileText,
          imageCaption: "Evidence collection checklist"
        },
        {
          title: "Stakeholder Communication",
          description: "Manage internal and external communications: status updates, customer notifications, regulatory reports. Track what was communicated, to whom, and when.",
          image: Bell,
          imageCaption: "Communication tracking log",
          tips: "Designate a single communications lead to ensure consistent messaging and avoid confusion."
        }
      ]
    },
    
    automation: {
      icon: Zap,
      title: "Incident Automation",
      steps: [
        {
          title: "Setting Up Auto-Detection",
          description: "Configure automated incident detection from SIEM, IDS/IPS, vulnerability scanners, and monitoring tools. Set detection criteria and severity thresholds.",
          image: Zap,
          imageCaption: "Auto-detection configuration",
          tips: "Fine-tune detection rules to minimize false positives while catching true incidents."
        },
        {
          title: "Automated Triage",
          description: "AI automatically categorizes incoming incidents by type and severity. Routes incidents to appropriate response teams based on classification.",
          image: Brain,
          imageCaption: "Automated triage workflow"
        },
        {
          title: "Auto-Response Actions",
          description: "Configure automated immediate responses: isolate infected hosts, disable compromised accounts, block malicious IPs. Reduce manual reaction time.",
          image: Shield,
          imageCaption: "Auto-response action rules",
          warning: "Test automated responses in non-production environments first to avoid unintended disruptions."
        },
        {
          title: "Automated Notifications",
          description: "Set up automatic stakeholder notifications based on incident severity and type. Escalate to executives for critical incidents.",
          image: Bell,
          imageCaption: "Notification automation rules"
        },
        {
          title: "Post-Incident Automation",
          description: "Automate post-incident activities: create improvement tasks, schedule lessons learned meetings, update playbooks, and track action item completion.",
          image: CheckCircle2,
          imageCaption: "Post-incident automation workflow",
          tips: "Automated lessons learned capture ensures continuous improvement of your incident response process."
        }
      ]
    },
    
    playbooks: {
      icon: Book,
      title: "Response Playbooks",
      steps: [
        {
          title: "Browsing Playbook Library",
          description: "Access pre-built playbooks for common scenarios: Ransomware, Phishing, DDoS, Insider Threat, Data Breach, Supply Chain Attack, etc.",
          image: Book,
          imageCaption: "Playbook library browser",
          tips: "Review and customize playbooks annually or after major incidents to keep them current."
        },
        {
          title: "Creating Custom Playbooks",
          description: "Build organization-specific playbooks. Define triggers, response steps, decision trees, escalation paths, and success criteria.",
          image: FileText,
          imageCaption: "Playbook editor interface"
        },
        {
          title: "Playbook Testing",
          description: "Conduct tabletop exercises to test playbooks before real incidents. Identify gaps, unclear procedures, or missing resources.",
          image: CheckCircle2,
          imageCaption: "Tabletop exercise planner",
          warning: "Untested playbooks often fail during real incidents - schedule quarterly tabletop exercises."
        },
        {
          title: "Executing Playbooks",
          description: "During incidents, launch playbooks which guide responders through step-by-step procedures. Track completion and deviations from the plan.",
          image: Activity,
          imageCaption: "Playbook execution monitor"
        },
        {
          title: "Playbook Effectiveness Analysis",
          description: "After incidents, evaluate playbook performance: Were steps clear? Were timelines realistic? What worked well? What needs improvement?",
          image: Brain,
          imageCaption: "Playbook effectiveness dashboard",
          tips: "Incorporate lessons learned into playbook updates within 30 days of incident closure."
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/20">
              <BookOpen className="h-7 w-7 text-rose-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Incident Management User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Complete guide to reporting, responding to, and learning from security incidents
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
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-500/20 data-[state=active]:to-red-500/20 data-[state=active]:border-rose-500/50 border border-[#2a3548] rounded-lg h-auto"
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