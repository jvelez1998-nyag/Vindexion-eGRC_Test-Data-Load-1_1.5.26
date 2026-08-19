import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, AlertTriangle, FileCheck, Shield, 
  ClipboardCheck, TrendingUp, Lightbulb, CheckCircle2 
} from "lucide-react";

export default function BestPractices() {
  const practices = [
    {
      category: "Risk Management",
      icon: AlertTriangle,
      color: "rose",
      tips: [
        { title: "Regular Risk Reviews", description: "Review and update your risk register monthly to ensure accuracy and relevance" },
        { title: "Consistent Scoring", description: "Use a standardized scoring methodology across all risks for better comparison" },
        { title: "Link Controls Early", description: "Associate mitigating controls with risks from the start for better tracking" },
        { title: "Document Assumptions", description: "Record the basis for risk scores and treatment decisions for audit trail" }
      ]
    },
    {
      category: "Compliance Management",
      icon: FileCheck,
      color: "emerald",
      tips: [
        { title: "Map Cross-Framework", description: "Use crosswalk mapping to identify overlapping requirements and reduce duplication" },
        { title: "Evidence-First Approach", description: "Collect and link evidence documentation as you implement requirements" },
        { title: "Assign Clear Ownership", description: "Each requirement should have a designated owner responsible for implementation" },
        { title: "Schedule Reviews", description: "Set periodic review dates to ensure ongoing compliance" }
      ]
    },
    {
      category: "Control Management",
      icon: Shield,
      color: "blue",
      tips: [
        { title: "Test Regularly", description: "Establish a testing cadence based on control criticality (quarterly for key controls)" },
        { title: "Document Procedures", description: "Maintain detailed testing procedures for consistency and repeatability" },
        { title: "Track Exceptions", description: "Document all control exceptions and monitor remediation" },
        { title: "Use Control Libraries", description: "Leverage pre-built control libraries (NIST, ITGC) for faster implementation" }
      ]
    },
    {
      category: "Audit Management",
      icon: ClipboardCheck,
      color: "purple",
      tips: [
        { title: "Plan Early", description: "Start audit planning 90 days before the audit date for adequate preparation" },
        { title: "Organize Evidence", description: "Maintain a central repository of audit evidence for quick access" },
        { title: "Track Findings", description: "Document findings immediately and assign remediation tasks with clear deadlines" },
        { title: "Conduct Pre-Audits", description: "Run internal pre-audits to identify and fix issues before external audits" }
      ]
    }
  ];

  const dos = [
    "Use AI features to accelerate risk identification and gap analysis",
    "Link related entities (risks, controls, compliance) for better visibility",
    "Generate reports regularly and share with stakeholders",
    "Set up automated notifications for critical events",
    "Document workflows and maintain audit trails",
    "Leverage templates and libraries to save time"
  ];

  const donts = [
    "Don't skip periodic reviews - schedule them consistently",
    "Don't work in isolation - collaborate with your team",
    "Don't ignore AI recommendations - review and refine them",
    "Don't forget to backup your data regularly",
    "Don't over-customize - use standard frameworks when possible",
    "Don't neglect user training and onboarding"
  ];

  return (
    <div className="space-y-6">
      {/* Best Practices by Category */}
      {practices.map((practice, idx) => {
        const Icon = practice.icon;
        return (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg bg-${practice.color}-500/10 border border-${practice.color}-500/20`}>
                  <Icon className={`h-5 w-5 text-${practice.color}-400`} />
                </div>
                <CardTitle className="text-lg">{practice.category} Best Practices</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {practice.tips.map((tip, tipIdx) => (
                  <div key={tipIdx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{tip.title}</h4>
                        <p className="text-sm text-slate-400">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Do's and Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Do's
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dos.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              Don'ts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {donts.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/5">
                  <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Metrics */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            Success Metrics to Track
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { metric: 'Compliance Rate', target: '> 95%', description: 'Percentage of requirements implemented' },
              { metric: 'Control Effectiveness', target: '> 90%', description: 'Controls rated effective or better' },
              { metric: 'Risk Mitigation', target: '< 10%', description: 'Critical/high risks as % of total' },
              { metric: 'Audit Findings', target: 'Decreasing', description: 'Trend in audit findings over time' },
              { metric: 'Remediation Time', target: '< 30 days', description: 'Average time to close findings' },
              { metric: 'Review Currency', target: '100%', description: 'Items reviewed within schedule' }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <h4 className="text-sm font-semibold text-white mb-1">{item.metric}</h4>
                <Badge className="bg-indigo-500/10 text-indigo-400 mb-2">{item.target}</Badge>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}