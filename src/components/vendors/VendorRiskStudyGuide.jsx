import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function VendorRiskStudyGuide() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Vendor Risk Management Study Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">
            Master vendor risk management concepts and best practices
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="fundamentals" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="fundamentals" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                Core Concepts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">What is Third-Party Risk Management?</h4>
                <p className="text-sm text-slate-400">
                  TPRM is the process of identifying, assessing, and mitigating risks associated with outsourcing to third-party vendors, suppliers, and service providers.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Key Risk Categories</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { title: "Strategic Risk", desc: "Business model alignment and long-term viability" },
                    { title: "Operational Risk", desc: "Service delivery and performance capabilities" },
                    { title: "Financial Risk", desc: "Financial stability and continuity of service" },
                    { title: "Compliance Risk", desc: "Regulatory and legal compliance status" },
                    { title: "Cybersecurity Risk", desc: "Security controls and data protection" },
                    { title: "Reputational Risk", desc: "Brand impact and public perception" }
                  ].map((risk, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <h5 className="text-sm font-medium text-white mb-1">{risk.title}</h5>
                      <p className="text-xs text-slate-400">{risk.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Vendor Assessment Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    phase: "1. Pre-Assessment",
                    items: ["Define vendor criticality", "Identify data classification", "Determine assessment scope"]
                  },
                  {
                    phase: "2. Due Diligence",
                    items: ["Financial stability review", "Security questionnaires", "Reference checks"]
                  },
                  {
                    phase: "3. Risk Assessment",
                    items: ["Evaluate controls", "Identify gaps", "Calculate risk score"]
                  },
                  {
                    phase: "4. Decision & Onboarding",
                    items: ["Accept/reject decision", "Contract negotiation", "Onboarding procedures"]
                  }
                ].map((phase, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <h4 className="text-sm font-semibold text-white mb-2">{phase.phase}</h4>
                    <ul className="space-y-1">
                      {phase.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Continuous Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Key Monitoring Activities</h4>
                <div className="space-y-3">
                  {[
                    { title: "Performance Monitoring", desc: "Track SLAs, KPIs, and service delivery metrics" },
                    { title: "Financial Monitoring", desc: "Monitor financial health and bankruptcy indicators" },
                    { title: "Security Monitoring", desc: "Track security incidents, breaches, and control effectiveness" },
                    { title: "Compliance Monitoring", desc: "Verify ongoing regulatory compliance and certifications" },
                    { title: "News & Intelligence", desc: "Monitor news, social media, and threat intelligence" }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-white mb-1">{activity.title}</h5>
                        <p className="text-xs text-slate-400">{activity.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base text-white">Regulatory Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { reg: "GDPR Article 28", req: "Data Processor Requirements", badge: "EU" },
                  { reg: "SOC 2 Type II", req: "Service Organization Controls", badge: "US" },
                  { reg: "FFIEC Guidance", req: "Third-Party Relationships", badge: "Banking" },
                  { reg: "HIPAA", req: "Business Associate Agreements", badge: "Healthcare" }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-semibold text-white">{item.reg}</h5>
                      <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">{item.badge}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{item.req}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}