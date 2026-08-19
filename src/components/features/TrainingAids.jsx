import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Lightbulb, CheckCircle2, AlertCircle, TrendingUp, Target } from "lucide-react";

const trainingContent = {
  bestPractices: [
    {
      title: "Risk Management Best Practices",
      icon: Target,
      color: "text-rose-400",
      practices: [
        "Conduct risk assessments at least annually and after major changes",
        "Ensure risk owners are clearly identified and accountable",
        "Document risk treatment decisions and rationale",
        "Link risks to controls for traceability and gap analysis",
        "Review and update risk registers regularly (quarterly minimum)",
        "Use consistent risk scoring methodology across the organization"
      ]
    },
    {
      title: "Control Implementation Tips",
      icon: CheckCircle2,
      color: "text-emerald-400",
      practices: [
        "Design controls with clear ownership and responsibilities",
        "Document control procedures with step-by-step instructions",
        "Schedule regular control testing (at least annually)",
        "Maintain evidence of control operation and effectiveness",
        "Address control deficiencies promptly with remediation plans",
        "Leverage automation where possible to reduce human error"
      ]
    },
    {
      title: "Compliance Management Guidelines",
      icon: CheckCircle2,
      color: "text-indigo-400",
      practices: [
        "Map requirements to controls for full traceability",
        "Maintain a central repository of compliance evidence",
        "Track regulatory changes and assess impact to your program",
        "Conduct periodic gap assessments against frameworks",
        "Document exceptions and compensating controls",
        "Prepare for audits with organized, accessible documentation"
      ]
    },
    {
      title: "Vendor Risk Management",
      icon: Target,
      color: "text-amber-400",
      practices: [
        "Classify vendors by risk tier (critical, high, medium, low)",
        "Perform due diligence before vendor engagement",
        "Include security and compliance requirements in contracts",
        "Conduct periodic vendor assessments based on risk tier",
        "Monitor vendor performance against SLAs and KPIs",
        "Maintain vendor documentation and audit rights"
      ]
    }
  ],
  commonMistakes: [
    {
      mistake: "Treating GRC as a one-time project",
      solution: "Implement continuous monitoring and periodic reviews",
      impact: "High"
    },
    {
      mistake: "Lack of executive sponsorship and support",
      solution: "Engage leadership early and communicate value regularly",
      impact: "High"
    },
    {
      mistake: "Over-documentation without value",
      solution: "Focus on meaningful documentation that supports decisions",
      impact: "Medium"
    },
    {
      mistake: "Siloed GRC activities across departments",
      solution: "Establish cross-functional collaboration and shared platforms",
      impact: "High"
    },
    {
      mistake: "Ignoring the human element in controls",
      solution: "Provide training, awareness, and clear accountability",
      impact: "Medium"
    },
    {
      mistake: "Not leveraging automation and AI",
      solution: "Use platform automation features to reduce manual effort",
      impact: "Medium"
    }
  ],
  workflowTips: [
    {
      workflow: "Risk Assessment Workflow",
      steps: [
        "Identify and document the risk",
        "Assess inherent risk (likelihood x impact)",
        "Identify and link existing controls",
        "Calculate residual risk",
        "Determine risk treatment strategy",
        "Assign risk owner and review schedule"
      ]
    },
    {
      workflow: "Control Testing Workflow",
      steps: [
        "Select control for testing based on schedule or risk",
        "Review control design and procedures",
        "Select sample or testing method",
        "Execute test and collect evidence",
        "Document results and effectiveness assessment",
        "Address deficiencies with remediation plan"
      ]
    },
    {
      workflow: "Vendor Onboarding Workflow",
      steps: [
        "Classify vendor risk tier",
        "Send security questionnaire",
        "Review vendor documentation (SOC 2, ISO certs)",
        "Conduct risk assessment",
        "Negotiate contract with security requirements",
        "Schedule ongoing monitoring and reviews"
      ]
    },
    {
      workflow: "Incident Response Workflow",
      steps: [
        "Detect and log the incident",
        "Assess severity and impact",
        "Activate response team and playbook",
        "Contain and investigate",
        "Remediate and recover",
        "Document lessons learned and update controls"
      ]
    }
  ]
};

export default function TrainingAids() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Training & Best Practices</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Guidance to maximize your GRC program effectiveness</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Best Practices Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          Best Practices
        </h3>
        <div className="grid lg:grid-cols-2 gap-4">
          {trainingContent.bestPractices.map((section, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                  <CardTitle className="text-base text-white">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.practices.map((practice, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Common Mistakes Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-400" />
          Common Mistakes to Avoid
        </h3>
        <div className="grid gap-3">
          {trainingContent.commonMistakes.map((item, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={
                        item.impact === "High" ? "bg-rose-500/20 text-rose-400" :
                        item.impact === "Medium" ? "bg-amber-500/20 text-amber-400" :
                        "bg-blue-500/20 text-blue-400"
                      }>
                        {item.impact} Impact
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-white mb-2">❌ {item.mistake}</div>
                    <div className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{item.solution}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Workflow Tips Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          Recommended Workflows
        </h3>
        <div className="grid lg:grid-cols-2 gap-4">
          {trainingContent.workflowTips.map((workflow, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base text-white">{workflow.workflow}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {workflow.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
                        {sIdx + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            Platform Usage Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
              <div className="text-emerald-400 font-medium text-sm mb-1">💡 Use AI Features</div>
              <p className="text-xs text-slate-400">Leverage AI-powered insights, recommendations, and automation to work smarter</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
              <div className="text-blue-400 font-medium text-sm mb-1">💡 Link Everything</div>
              <p className="text-xs text-slate-400">Create relationships between risks, controls, audits, and vendors for full traceability</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <div className="text-purple-400 font-medium text-sm mb-1">💡 Automate Workflows</div>
              <p className="text-xs text-slate-400">Set up automation rules to reduce manual effort and ensure consistency</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
              <div className="text-amber-400 font-medium text-sm mb-1">💡 Export Reports</div>
              <p className="text-xs text-slate-400">Use custom report builder to create stakeholder-ready documentation</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/30">
              <div className="text-rose-400 font-medium text-sm mb-1">💡 Monitor Dashboards</div>
              <p className="text-xs text-slate-400">Review dashboards regularly to stay on top of risks, compliance, and issues</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
              <div className="text-indigo-400 font-medium text-sm mb-1">💡 Collaborate</div>
              <p className="text-xs text-slate-400">Use comments, mentions, and task assignments to work effectively with your team</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}