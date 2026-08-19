import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radio, 
  TrendingUp, 
  AlertTriangle, 
  Globe, 
  Shield, 
  ExternalLink,
  Sparkles,
  Newspaper
} from "lucide-react";

export default function ExternalRiskFeeds() {
  const [selectedFeed, setSelectedFeed] = useState("threat");

  const threatIntelligence = [
    {
      title: "Critical Zero-Day Vulnerability in Enterprise Software",
      source: "CISA",
      severity: "critical",
      timestamp: "2 hours ago",
      description: "New zero-day vulnerability discovered affecting major enterprise software platforms. Immediate patching recommended.",
      tags: ["Cybersecurity", "Software", "Critical"]
    },
    {
      title: "Ransomware Campaign Targeting Financial Services",
      source: "FBI Cyber Division",
      severity: "high",
      timestamp: "5 hours ago",
      description: "Coordinated ransomware attacks detected across financial institutions. Enhanced monitoring advised.",
      tags: ["Cybersecurity", "Financial", "Ransomware"]
    },
    {
      title: "Supply Chain Disruption in Asia-Pacific Region",
      source: "Supply Chain Risk Network",
      severity: "high",
      timestamp: "1 day ago",
      description: "Major port closures affecting supply chains. Expected delays of 2-3 weeks for shipments.",
      tags: ["Supply Chain", "Operations", "APAC"]
    },
    {
      title: "New GDPR Enforcement Guidelines Released",
      source: "European Data Protection Board",
      severity: "medium",
      timestamp: "1 day ago",
      description: "Updated guidelines on cross-border data transfers and consent requirements.",
      tags: ["Compliance", "Privacy", "GDPR"]
    },
    {
      title: "Geopolitical Tensions Impact Global Markets",
      source: "World Economic Forum",
      severity: "medium",
      timestamp: "2 days ago",
      description: "Escalating tensions affecting commodity prices and trade routes.",
      tags: ["Geopolitical", "Economic", "Strategic"]
    }
  ];

  const emergingRisks = [
    {
      title: "AI Governance Regulations Accelerating",
      trend: "increasing",
      impact: "High",
      timeframe: "6-12 months",
      description: "Multiple jurisdictions preparing comprehensive AI governance frameworks. Organizations should prepare for compliance requirements.",
      indicators: ["Regulatory Activity", "Industry Standards", "Technology Evolution"]
    },
    {
      title: "Climate-Related Financial Disclosures Expanding",
      trend: "increasing",
      impact: "Medium",
      timeframe: "12-18 months",
      description: "Mandatory climate risk reporting expanding globally. Financial impact assessment becoming critical.",
      indicators: ["Regulatory Change", "Investor Pressure", "ESG Requirements"]
    },
    {
      title: "Quantum Computing Security Threats",
      trend: "emerging",
      impact: "High",
      timeframe: "3-5 years",
      description: "Quantum computing advances threaten current encryption standards. Post-quantum cryptography planning essential.",
      indicators: ["Technology Advancement", "Security Research", "Standards Development"]
    },
    {
      title: "Deepfake Technology in Fraud",
      trend: "increasing",
      impact: "Medium",
      timeframe: "Current",
      description: "Sophisticated deepfake technology being used in social engineering and fraud attacks.",
      indicators: ["Fraud Reports", "Technology Capability", "Detection Challenges"]
    }
  ];

  const industryAlerts = [
    {
      industry: "Financial Services",
      alerts: [
        { title: "New Banking Regulations - Basel IV Implementation", type: "Regulatory", date: "Today" },
        { title: "Crypto Asset Risk Management Guidelines", type: "Advisory", date: "Yesterday" },
        { title: "Payment Fraud Increase in Q4", type: "Threat", date: "2 days ago" }
      ]
    },
    {
      industry: "Healthcare",
      alerts: [
        { title: "HIPAA Compliance Updates for Telehealth", type: "Regulatory", date: "Today" },
        { title: "Medical Device Cybersecurity Vulnerabilities", type: "Threat", date: "1 day ago" },
        { title: "Healthcare Data Breach Trends", type: "Advisory", date: "3 days ago" }
      ]
    },
    {
      industry: "Technology",
      alerts: [
        { title: "Software Supply Chain Security Guidelines", type: "Advisory", date: "Today" },
        { title: "Cloud Service Provider Outages Rising", type: "Operational", date: "2 days ago" },
        { title: "Open Source Vulnerability Disclosure", type: "Threat", date: "3 days ago" }
      ]
    }
  ];

  const regulatoryUpdates = [
    {
      title: "SEC Proposes New Cybersecurity Disclosure Rules",
      region: "United States",
      effectiveDate: "2025-Q2",
      impact: "High",
      summary: "Public companies required to disclose material cybersecurity incidents within 4 business days."
    },
    {
      title: "EU Digital Operational Resilience Act (DORA) Final Text",
      region: "European Union",
      effectiveDate: "2025-01-17",
      impact: "High",
      summary: "Comprehensive framework for ICT risk management in financial sector."
    },
    {
      title: "NIST Cybersecurity Framework 2.0 Released",
      region: "Global",
      effectiveDate: "2024-Q1",
      impact: "Medium",
      summary: "Updated framework with expanded guidance on supply chain security and governance."
    }
  ];

  const severityColors = {
    critical: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/30"
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="threat" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="threat">
            <Shield className="h-4 w-4 mr-2" />
            Threat Intelligence
          </TabsTrigger>
          <TabsTrigger value="emerging">
            <Sparkles className="h-4 w-4 mr-2" />
            Emerging Risks
          </TabsTrigger>
          <TabsTrigger value="industry">
            <Radio className="h-4 w-4 mr-2" />
            Industry Alerts
          </TabsTrigger>
          <TabsTrigger value="regulatory">
            <Newspaper className="h-4 w-4 mr-2" />
            Regulatory Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threat" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-400" />
                Live Threat Intelligence Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {threatIntelligence.map((threat, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={severityColors[threat.severity]}>
                                {threat.severity}
                              </Badge>
                              <span className="text-xs text-slate-500">{threat.timestamp}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-2">{threat.title}</h4>
                            <p className="text-xs text-slate-400 mb-3">{threat.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-500">{threat.source}</span>
                          </div>
                          <Button variant="outline" size="sm" className="border-[#2a3548] text-xs h-7">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {threat.tags.map((tag, i) => (
                            <Badge key={i} className="bg-slate-500/10 text-slate-400 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emerging" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Emerging Risk Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergingRisks.map((risk, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-2">{risk.title}</h4>
                          <p className="text-xs text-slate-400 mb-3">{risk.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="p-2 rounded bg-[#1a2332] border border-[#2a3548]">
                          <p className="text-xs text-slate-500 mb-1">Trend</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-rose-400" />
                            <span className="text-xs text-white capitalize">{risk.trend}</span>
                          </div>
                        </div>
                        <div className="p-2 rounded bg-[#1a2332] border border-[#2a3548]">
                          <p className="text-xs text-slate-500 mb-1">Impact</p>
                          <span className="text-xs text-white">{risk.impact}</span>
                        </div>
                        <div className="p-2 rounded bg-[#1a2332] border border-[#2a3548]">
                          <p className="text-xs text-slate-500 mb-1">Timeframe</p>
                          <span className="text-xs text-white">{risk.timeframe}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Key Indicators:</p>
                        <div className="flex flex-wrap gap-1">
                          {risk.indicators.map((indicator, i) => (
                            <Badge key={i} className="bg-purple-500/10 text-purple-400 text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="industry" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-5 w-5 text-blue-400" />
                Industry-Specific Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {industryAlerts.map((industry, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-semibold text-white mb-3">{industry.industry}</h3>
                    <div className="space-y-2">
                      {industry.alerts.map((alert, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-blue-500/40 transition-all"
                        >
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium mb-1">{alert.title}</p>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                                {alert.type}
                              </Badge>
                              <span className="text-xs text-slate-500">{alert.date}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-emerald-400" />
                Regulatory Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regulatoryUpdates.map((update, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-2">{update.title}</h4>
                          <p className="text-xs text-slate-400 mb-3">{update.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-emerald-500/10 text-emerald-400">
                          {update.region}
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400">
                          Effective: {update.effectiveDate}
                        </Badge>
                        <Badge className="bg-orange-500/10 text-orange-400">
                          Impact: {update.impact}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#2a3548] w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Read Full Update
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}