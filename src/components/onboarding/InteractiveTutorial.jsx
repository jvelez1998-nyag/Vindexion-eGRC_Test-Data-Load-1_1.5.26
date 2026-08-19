import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, AlertTriangle, FileCheck, Shield, X, CheckCircle2,
  ArrowRight, ArrowLeft, Play, Target, Lightbulb, Sparkles,
  ClipboardCheck, Calculator, HelpCircle, LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tutorials = [
  {
    id: "grc-basics",
    title: "GRC Fundamentals",
    description: "Learn the basics of Governance, Risk & Compliance",
    icon: BookOpen,
    color: "indigo",
    duration: "5 min",
    steps: [
      {
        title: "What is GRC?",
        content: `GRC stands for **Governance, Risk, and Compliance**. It's a strategic approach that organizations use to manage three critical areas:

**Governance:** Establishing policies, procedures, and decision-making frameworks
**Risk:** Identifying, assessing, and mitigating potential threats
**Compliance:** Ensuring adherence to laws, regulations, and standards

Together, these three pillars help organizations operate efficiently while maintaining security and meeting regulatory requirements.`,
        visual: "concept"
      },
      {
        title: "Key GRC Concepts",
        content: `**Risk:** A potential event that could negatively impact your organization. Risks are rated by:
- **Likelihood** (1-5): How probable is the risk?
- **Impact** (1-5): How severe would the consequences be?
- **Risk Score** = Likelihood × Impact (1-25)

**Controls:** Measures implemented to prevent, detect, or correct risks. Types include:
- **Preventive:** Stop issues before they occur
- **Detective:** Identify issues when they happen
- **Corrective:** Fix issues after detection

**Compliance:** Meeting requirements from frameworks like SOX, SOC2, ISO27001, GDPR, etc.`,
        visual: "definitions"
      },
      {
        title: "Risk Levels Explained",
        content: `Risks are categorized into four levels based on their score:

**🟢 Low (1-3):** Minor risks that require monitoring
**🟡 Medium (4-8):** Moderate risks that need mitigation plans
**🟠 High (9-15):** Significant risks requiring immediate attention
**🔴 Critical (16-25):** Severe risks demanding urgent action

The **Risk Heat Map** on your dashboard visualizes risks across these levels, helping you prioritize mitigation efforts.`,
        visual: "risk-levels"
      },
      {
        title: "GRC Lifecycle",
        content: `GRC is a continuous cycle:

1. **Identify** risks and compliance requirements
2. **Assess** the likelihood and impact
3. **Implement** controls to mitigate risks
4. **Monitor** effectiveness and compliance status
5. **Report** findings to stakeholders
6. **Improve** based on findings and changing conditions

This platform supports every stage of the GRC lifecycle with dedicated modules and AI-powered tools.`,
        visual: "lifecycle"
      }
    ]
  },
  {
    id: "report-incident",
    title: "Report an Incident",
    description: "Step-by-step guide to reporting security incidents",
    icon: AlertTriangle,
    color: "amber",
    duration: "3 min",
    steps: [
      {
        title: "Navigate to Incidents",
        content: `Start by clicking **"Incidents"** in the left sidebar navigation menu.

The Incidents page displays all reported security events, policy violations, and operational failures. You'll see key metrics like:
- Total open incidents
- Critical incidents requiring immediate attention
- Average resolution time`,
        visual: "navigate",
        action: { label: "Go to Incidents", page: "Incidents" }
      },
      {
        title: "Click 'Report Incident'",
        content: `In the top-right corner, click the **"Report Incident"** button.

This opens a form where you'll provide details about the incident. The form has three tabs:
- **Details:** Basic incident information
- **Investigation:** Root cause and impact analysis
- **Links:** Connect to related risks, controls, or compliance items`,
        visual: "button"
      },
      {
        title: "Fill in Incident Details",
        content: `**Required fields:**
- **Title:** Brief description (e.g., "Unauthorized Access Attempt")
- **Incident Type:** Select from:
  - Security Breach
  - Data Leak
  - System Outage
  - Policy Violation
  - Compliance Breach
  - Fraud
  - Other
- **Severity:** Critical, High, Medium, or Low

**Optional but recommended:**
- Description of what happened
- When it occurred and was detected
- Who reported it and who's assigned
- Affected systems`,
        visual: "form"
      },
      {
        title: "Add Investigation Details",
        content: `Switch to the **Investigation** tab to document:

- **Impact Assessment:** Business impact (financial, operational, reputational)
- **Root Cause:** What caused the incident?
- **Containment Actions:** What was done to stop it?
- **Remediation Actions:** Steps to fix and prevent recurrence
- **Lessons Learned:** Key takeaways

💡 **Pro Tip:** Use the AI Analysis feature (from the incident's menu) to get automated categorization and remediation suggestions!`,
        visual: "investigation"
      },
      {
        title: "Link Related Items (Optional)",
        content: `Connect the incident to existing GRC data:

- **Link to Risks:** If this incident relates to an identified risk
- **Link to Controls:** If control failures contributed to the incident
- **Link to Compliance:** If this affects compliance requirements

These links help track patterns and improve your overall GRC posture. They also appear in reports and dashboards.`,
        visual: "links"
      },
      {
        title: "Submit the Incident",
        content: `Review your information and click **"Report Incident"**.

**What happens next?**
- The incident appears on the Incidents page
- Stakeholders receive notifications (if configured)
- You can track its status from Reported → Triaging → Investigating → Contained → Remediated → Closed
- Use the AI Incident Analyzer for automated root cause analysis and remediation recommendations

The incident is now part of your organization's security record.`,
        visual: "success"
      }
    ]
  },
  {
    id: "assess-risk",
    title: "Assess a Risk",
    description: "Learn how to create and evaluate organizational risks",
    icon: Calculator,
    color: "rose",
    duration: "4 min",
    steps: [
      {
        title: "Navigate to Risks",
        content: `Click **"Risks"** in the left sidebar to access the Risk Management module.

Here you'll see:
- Your risk register with all identified risks
- Risk statistics (total, critical, high, overdue)
- Filters by category and status
- Risk heat map showing risk distribution by severity`,
        visual: "navigate",
        action: { label: "Go to Risks", page: "Risks" }
      },
      {
        title: "Create a New Risk",
        content: `Click the **"Add Risk"** button in the top-right corner.

A form opens with multiple tabs to capture comprehensive risk information:
- **Basic Info:** Title, category, description, owner
- **Risk Scoring:** Likelihood and impact assessment
- **Controls:** Link mitigating controls
- **Attachments:** Upload supporting documentation`,
        visual: "button"
      },
      {
        title: "Enter Risk Details",
        content: `**Required information:**
- **Title:** Clear, concise risk description
- **Category:** Select from:
  - Operational
  - Financial
  - Strategic
  - Compliance
  - Cybersecurity
  - Reputational

**Additional details:**
- Detailed description of the risk
- Risk owner (person responsible for managing it)
- Mitigation plan and actions
- Target completion date`,
        visual: "form"
      },
      {
        title: "Score the Risk",
        content: `Switch to the **Risk Scoring** tab to assess:

**Inherent Risk (before controls):**
- **Likelihood (1-5):** How likely is this risk to occur?
  - 1 = Rare, 2 = Unlikely, 3 = Possible, 4 = Likely, 5 = Almost Certain
- **Impact (1-5):** If it occurs, how severe would it be?
  - 1 = Negligible, 2 = Minor, 3 = Moderate, 4 = Major, 5 = Severe

**Residual Risk (after controls):**
- Same scoring, but accounting for existing controls
- Shows effectiveness of your mitigation efforts

The system automatically calculates your **Risk Score** and assigns a risk level (Low, Medium, High, Critical).`,
        visual: "scoring"
      },
      {
        title: "Link Controls",
        content: `In the **Controls** tab, link controls that mitigate this risk:

- Select from your existing Control Library
- Controls can be preventive, detective, or corrective
- Linking shows how you're managing the risk
- Helps calculate residual risk levels

💡 **AI Tip:** Use the AI Risk Analyzer to get control recommendations based on your risk description!`,
        visual: "controls"
      },
      {
        title: "Submit and Monitor",
        content: `Click **"Create"** to add the risk to your register.

**Next steps:**
- Monitor risk status through the lifecycle: Identified → Assessing → Mitigating → Monitoring → Closed
- Update risk scores as conditions change
- Link to incidents if the risk materializes
- Generate risk reports for management

**Pro Feature:** Use AI Risk Suggestions to identify hidden risks and get mitigation recommendations automatically.`,
        visual: "success"
      }
    ]
  },
  {
    id: "platform-tour",
    title: "Platform Tour",
    description: "Quick overview of main features and navigation",
    icon: LayoutDashboard,
    color: "blue",
    duration: "3 min",
    steps: [
      {
        title: "Dashboard Overview",
        content: `Your **Dashboard** is mission control for GRC activities:

- **Stats Cards:** Quick metrics on risks, compliance, controls, audits, and incidents
- **Risk Heat Map:** Visual risk distribution
- **Compliance Gauge:** Overall compliance percentage
- **Trend Analysis:** Track improvements over time
- **AI Insights:** Automated recommendations

Click any chart or card to drill down into details!`,
        visual: "dashboard",
        action: { label: "Go to Dashboard", page: "Dashboard" }
      },
      {
        title: "Left Sidebar Navigation",
        content: `Access all modules from the left sidebar:

**Core Modules:**
- Dashboard, Client Profiles, Client Risk Dashboard
- Risk Assessments, Risks, Incidents
- Policy Compliance, Controls, Audits

**Support & Tools:**
- Guidance Library, Regulatory Exams
- AI Assistant, Reports, User Administration

💡 The sidebar is scrollable if you have many modules!`,
        visual: "navigation"
      },
      {
        title: "AI-Powered Features",
        content: `GRC Hub integrates AI throughout:

- **AI Risk Analyzer:** Identify risks from scenarios
- **AI Incident Analyzer:** Auto-categorize and suggest remediation
- **AI Compliance Gap:** Find missing requirements
- **AI Control Advisor:** Get control recommendations
- **AI Audit Prep:** Generate audit checklists
- **Floating Chatbot:** Context-specific help (bottom-right)

Look for the ✨ sparkle icon to access AI features!`,
        visual: "ai-features"
      },
      {
        title: "Workflow & Approvals",
        content: `Items can go through review workflows:

**States:** Draft → Submitted → In Review → Approved/Rejected

**Process:**
1. Create an item in Draft
2. Submit for Review when ready
3. Reviewers approve, reject, or request changes
4. Track history of all actions

Available for risks, compliance items, and assessments.`,
        visual: "workflow"
      },
      {
        title: "Reports & Export",
        content: `Generate professional reports:

**Available Reports:**
- Risk Summary
- Compliance Status
- Controls Effectiveness
- Audit Findings
- Executive Summaries

**Export Options:**
- PDF (formatted reports)
- Excel (data analysis)
- CSV (raw data)

Access from the Reports section or use export buttons on list pages.`,
        visual: "reports"
      },
      {
        title: "Getting Help",
        content: `Multiple ways to get assistance:

**User Guide:** Comprehensive documentation (you're here!)
**AI Chatbot:** Click the floating icon for context-specific help
**Notifications:** Bell icon for important alerts
**User Administration:** Manage team access (admins only)

💡 **Best Practice:** Start by exploring the Dashboard, then dive into specific modules as needed. Use AI features to accelerate your GRC program!`,
        visual: "help"
      }
    ]
  }
];

export default function InteractiveTutorial({ open, onOpenChange }) {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState([]);

  const handleSelectTutorial = (tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (!completedTutorials.includes(selectedTutorial.id)) {
      setCompletedTutorials([...completedTutorials, selectedTutorial.id]);
    }
    setSelectedTutorial(null);
    setCurrentStep(0);
  };

  const handleClose = () => {
    setSelectedTutorial(null);
    setCurrentStep(0);
    onOpenChange(false);
  };

  const progress = selectedTutorial ? ((currentStep + 1) / selectedTutorial.steps.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        {!selectedTutorial ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                  <BookOpen className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Interactive Tutorials</h2>
                  <p className="text-sm text-slate-400">Learn GRC Hub step-by-step</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial) => {
                const isCompleted = completedTutorials.includes(tutorial.id);
                const Icon = tutorial.icon;
                const colorClasses = {
                  indigo: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30",
                  amber: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
                  rose: "from-rose-500/20 to-pink-500/20 border-rose-500/30",
                  blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                };

                return (
                  <Card
                    key={tutorial.id}
                    className="bg-[#151d2e] border-[#2a3548] p-5 hover:border-indigo-500/50 transition-all cursor-pointer group"
                    onClick={() => handleSelectTutorial(tutorial)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[tutorial.color]} border`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {isCompleted && (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{tutorial.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{tutorial.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{tutorial.duration} • {tutorial.steps.length} steps</span>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 group-hover:translate-x-1 transition-transform">
                        <Play className="h-3 w-3 mr-1" />
                        {isCompleted ? "Review" : "Start"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[85vh]">
            {/* Header */}
            <div className="p-6 border-b border-[#2a3548]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTutorial(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedTutorial.title}</h2>
                    <p className="text-sm text-slate-400">
                      Step {currentStep + 1} of {selectedTutorial.steps.length}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Progress value={progress} className="h-2 bg-[#151d2e]" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {selectedTutorial.steps[currentStep].title}
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    {selectedTutorial.steps[currentStep].content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-slate-300 leading-relaxed mb-4">
                        {para.split('**').map((part, j) => 
                          j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
                        )}
                      </p>
                    ))}
                  </div>

                  {selectedTutorial.steps[currentStep].action && (
                    <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-indigo-400" />
                          <span className="text-sm font-medium text-indigo-400">Try it now</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => {
                            window.location.href = `#/${selectedTutorial.steps[currentStep].action.page}`;
                            handleClose();
                          }}
                        >
                          {selectedTutorial.steps[currentStep].action.label}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#2a3548] flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="flex gap-2">
                {selectedTutorial.steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentStep ? 'bg-indigo-400' : i < currentStep ? 'bg-indigo-600' : 'bg-[#2a3548]'
                    }`}
                  />
                ))}
              </div>
              <Button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {currentStep === selectedTutorial.steps.length - 1 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}