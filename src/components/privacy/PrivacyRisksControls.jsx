import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, TrendingUp, CheckCircle2 } from "lucide-react";

export default function PrivacyRisksControls() {
  const [selectedRisk, setSelectedRisk] = useState(null);

  const risks = [
    {
      id: 'unauthorized_access',
      name: 'Unauthorized Data Access',
      severity: 'high',
      description: 'Risk of unauthorized individuals accessing personal data',
      likelihood: 'medium',
      impact: 'high',
      controls: ['Access controls', 'MFA', 'Role-based access', 'Audit logging', 'Regular reviews'],
      regulations: ['GDPR Art. 32', 'HIPAA §164.312', 'CCPA'],
      mitigation: 'Implement strong authentication, least privilege, and monitoring'
    },
    {
      id: 'data_breach',
      name: 'Data Breach',
      severity: 'critical',
      description: 'Unauthorized disclosure or loss of personal data',
      likelihood: 'medium',
      impact: 'critical',
      controls: ['Encryption', 'DLP', 'Incident response plan', 'Security monitoring', 'Breach notification process'],
      regulations: ['GDPR Art. 33-34', 'CCPA 1798.150', 'HIPAA Breach Rule'],
      mitigation: 'Layered security, response plan, encryption at rest and in transit'
    },
    {
      id: 'consent_violation',
      name: 'Invalid Consent',
      severity: 'high',
      description: 'Processing without valid legal basis or consent',
      likelihood: 'high',
      impact: 'medium',
      controls: ['Consent management platform', 'Privacy notices', 'Withdrawal mechanism', 'Records of consent', 'Regular audits'],
      regulations: ['GDPR Art. 6-7', 'CCPA Opt-out', 'PIPEDA Principle 3'],
      mitigation: 'Clear consent mechanisms, granular options, easy withdrawal'
    },
    {
      id: 'third_party',
      name: 'Third-Party Data Sharing Risks',
      severity: 'high',
      description: 'Inadequate vendor due diligence and oversight',
      likelihood: 'high',
      impact: 'high',
      controls: ['Vendor assessments', 'DPAs', 'Regular audits', 'Transfer mechanisms', 'Contract terms'],
      regulations: ['GDPR Art. 28', 'CCPA Service Provider', 'HIPAA BAA'],
      mitigation: 'Comprehensive vendor management program with ongoing monitoring'
    },
    {
      id: 'retention',
      name: 'Excessive Data Retention',
      severity: 'medium',
      description: 'Keeping personal data longer than necessary',
      likelihood: 'high',
      impact: 'medium',
      controls: ['Retention policies', 'Automated deletion', 'Regular reviews', 'Data mapping', 'Classification'],
      regulations: ['GDPR Art. 5(e)', 'CCPA', 'HIPAA'],
      mitigation: 'Clear retention schedules and automated enforcement'
    }
  ];

  const controls = [
    {
      category: 'Technical',
      items: [
        { name: 'Encryption (at rest)', description: 'Encrypt stored personal data', status: 'implemented' },
        { name: 'Encryption (in transit)', description: 'TLS/SSL for data transmission', status: 'implemented' },
        { name: 'Access Controls', description: 'Role-based access control', status: 'implemented' },
        { name: 'Multi-Factor Authentication', description: 'MFA for sensitive systems', status: 'partial' },
        { name: 'Data Loss Prevention', description: 'DLP tools and policies', status: 'planned' },
        { name: 'Anonymization/Pseudonymization', description: 'Data minimization techniques', status: 'partial' }
      ]
    },
    {
      category: 'Administrative',
      items: [
        { name: 'Privacy Policies', description: 'Clear, accessible privacy notices', status: 'implemented' },
        { name: 'Training Program', description: 'Privacy awareness training', status: 'implemented' },
        { name: 'Data Mapping', description: 'Inventory of data processing', status: 'implemented' },
        { name: 'Vendor Management', description: 'Due diligence and oversight', status: 'partial' },
        { name: 'Incident Response Plan', description: 'Breach response procedures', status: 'implemented' },
        { name: 'Privacy Impact Assessments', description: 'Risk assessment for new projects', status: 'implemented' }
      ]
    },
    {
      category: 'Organizational',
      items: [
        { name: 'Data Protection Officer', description: 'Designated privacy lead', status: 'implemented' },
        { name: 'Privacy Governance', description: 'Privacy committee/oversight', status: 'implemented' },
        { name: 'Accountability Framework', description: 'Clear roles and responsibilities', status: 'implemented' },
        { name: 'Records of Processing', description: 'GDPR Article 30 records', status: 'partial' },
        { name: 'Data Subject Rights Process', description: 'Request handling procedures', status: 'implemented' },
        { name: 'Audit Program', description: 'Regular compliance audits', status: 'partial' }
      ]
    }
  ];

  return (
    <Tabs defaultValue="risks" className="space-y-6">
      <TabsList className="bg-[#1a2332] border border-[#2a3548]">
        <TabsTrigger value="risks">Privacy Risks</TabsTrigger>
        <TabsTrigger value="controls">Controls</TabsTrigger>
        <TabsTrigger value="mapping">Risk-Control Mapping</TabsTrigger>
      </TabsList>

      <TabsContent value="risks" className="space-y-4">
        {risks.map(risk => (
          <Card key={risk.id} className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base mb-2">{risk.name}</CardTitle>
                  <p className="text-sm text-slate-400">{risk.description}</p>
                </div>
                <Badge className={`${
                  risk.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                  risk.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {risk.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="text-xs text-slate-500 mb-1">Likelihood</div>
                  <Badge className="bg-amber-500/20 text-amber-400 capitalize">{risk.likelihood}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="text-xs text-slate-500 mb-1">Impact</div>
                  <Badge className="bg-rose-500/20 text-rose-400 capitalize">{risk.impact}</Badge>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-2">Key Controls:</div>
                <div className="flex flex-wrap gap-2">
                  {risk.controls.map((control, i) => (
                    <Badge key={i} className="text-xs bg-emerald-500/20 text-emerald-400">{control}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-2">Regulatory References:</div>
                <div className="flex flex-wrap gap-2">
                  {risk.regulations.map((reg, i) => (
                    <Badge key={i} className="text-xs bg-indigo-500/20 text-indigo-400">{reg}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs text-blue-400 mb-1">Mitigation Strategy:</div>
                <p className="text-xs text-slate-300">{risk.mitigation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="controls" className="space-y-6">
        {controls.map((category, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                {category.category} Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.items.map((control, i) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white mb-1">{control.name}</div>
                      <p className="text-xs text-slate-400">{control.description}</p>
                    </div>
                    <Badge className={`ml-2 ${
                      control.status === 'implemented' ? 'bg-emerald-500/20 text-emerald-400' :
                      control.status === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {control.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="mapping">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Risk-Control Effectiveness Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map(risk => (
                <div key={risk.id} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">{risk.name}</div>
                      <div className="text-xs text-slate-400">Residual Risk: {risk.severity}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Controls Applied: {risk.controls.length}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {risk.controls.map((control, i) => (
                      <div key={i} className="text-center p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 mx-auto mb-1" />
                        <div className="text-xs text-slate-300">{control}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}