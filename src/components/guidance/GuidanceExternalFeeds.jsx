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
  Newspaper,
  FileText,
  Bell
} from "lucide-react";

export default function GuidanceExternalFeeds() {
  const regulatoryUpdates = [
    {
      title: "SEC Enhances Cybersecurity Risk Disclosure Requirements",
      agency: "SEC",
      region: "United States",
      framework: "SOX",
      effectiveDate: "2025-12-15",
      impact: "High",
      summary: "New rules require enhanced disclosure of cybersecurity governance, risk management, and incident reporting.",
      status: "Final Rule",
      categories: ["Cybersecurity", "Disclosure", "Governance"]
    },
    {
      title: "EDPB Guidelines on Consent Under GDPR",
      agency: "European Data Protection Board",
      region: "European Union",
      framework: "GDPR",
      effectiveDate: "2025-01-01",
      impact: "High",
      summary: "Updated guidance clarifying consent requirements for digital services and cookie management.",
      status: "Final Guidelines",
      categories: ["Privacy", "Consent", "Digital Services"]
    },
    {
      title: "NIST Updates Cybersecurity Framework to Version 2.0",
      agency: "NIST",
      region: "Global",
      framework: "NIST",
      effectiveDate: "2024-02-26",
      impact: "Medium",
      summary: "Enhanced framework includes supply chain security and governance improvements.",
      status: "Published",
      categories: ["Cybersecurity", "Framework", "Supply Chain"]
    },
    {
      title: "PCI DSS v4.0 Transition Deadline Approaching",
      agency: "PCI Security Standards Council",
      region: "Global",
      framework: "PCI-DSS",
      effectiveDate: "2025-03-31",
      impact: "Critical",
      summary: "All organizations must transition to PCI DSS v4.0 by March 31, 2025.",
      status: "Compliance Deadline",
      categories: ["Payment Security", "Compliance", "Deadline"]
    },
    {
      title: "EU AI Act Final Text Published",
      agency: "European Commission",
      region: "European Union",
      framework: "EU_AI_ACT",
      effectiveDate: "2026-08-01",
      impact: "High",
      summary: "Comprehensive regulation of AI systems with risk-based approach and compliance obligations.",
      status: "Adopted",
      categories: ["AI", "Innovation", "Risk Management"]
    }
  ];

  const industryAlerts = [
    {
      industry: "Financial Services",
      alerts: [
        { 
          title: "FFIEC Releases Updated IT Examination Handbook", 
          type: "Guidance", 
          severity: "medium",
          date: "Today",
          summary: "Updated guidance on cloud computing and third-party risk management."
        },
        { 
          title: "FINRA Issues Alert on Social Media Risks", 
          type: "Alert", 
          severity: "medium",
          date: "Yesterday",
          summary: "Regulatory notice on supervision of social media communications."
        },
        { 
          title: "Basel Committee on Operational Resilience", 
          type: "Standard", 
          severity: "high",
          date: "2 days ago",
          summary: "New principles for operational resilience in banking."
        }
      ]
    },
    {
      industry: "Healthcare",
      alerts: [
        { 
          title: "HHS Updates HIPAA Security Risk Assessment Guidance", 
          type: "Guidance", 
          severity: "high",
          date: "Today",
          summary: "Enhanced requirements for security risk assessments in healthcare."
        },
        { 
          title: "FDA Issues Cybersecurity Guidance for Medical Devices", 
          type: "Guidance", 
          severity: "high",
          date: "1 day ago",
          summary: "New premarket and postmarket cybersecurity requirements."
        },
        { 
          title: "Healthcare Data Breach Trends Report", 
          type: "Report", 
          severity: "medium",
          date: "3 days ago",
          summary: "Analysis of data breach patterns in healthcare sector."
        }
      ]
    },
    {
      industry: "Technology",
      alerts: [
        { 
          title: "CISA Releases Secure by Design Principles", 
          type: "Framework", 
          severity: "medium",
          date: "Today",
          summary: "Guidelines for building security into software development."
        },
        { 
          title: "FTC Announces Data Security Enforcement Actions", 
          type: "Enforcement", 
          severity: "high",
          date: "2 days ago",
          summary: "Recent enforcement actions highlight compliance gaps."
        },
        { 
          title: "NIST Publishes AI Risk Management Framework", 
          type: "Framework", 
          severity: "medium",
          date: "1 week ago",
          summary: "Voluntary framework for managing AI risks."
        }
      ]
    },
    {
      industry: "Retail & E-commerce",
      alerts: [
        { 
          title: "FTC Strengthens Online Privacy Requirements", 
          type: "Regulation", 
          severity: "high",
          date: "Today",
          summary: "Enhanced consumer privacy protections for online platforms."
        },
        { 
          title: "Payment Card Industry Security Updates", 
          type: "Standard", 
          severity: "critical",
          date: "1 day ago",
          summary: "Critical updates to payment security standards."
        }
      ]
    }
  ];

  const bestPractices = [
    {
      title: "Control Testing Best Practices",
      source: "IIA",
      category: "Auditing",
      readTime: "15 min",
      topics: ["Sample Selection", "Evidence Documentation", "Test Design", "Deficiency Reporting"]
    },
    {
      title: "Privacy by Design Implementation",
      source: "IAPP",
      category: "Privacy",
      readTime: "20 min",
      topics: ["Data Minimization", "Purpose Limitation", "Privacy Controls", "Impact Assessment"]
    },
    {
      title: "Security Incident Response",
      source: "SANS",
      category: "Cybersecurity",
      readTime: "25 min",
      topics: ["Detection", "Containment", "Eradication", "Recovery", "Lessons Learned"]
    },
    {
      title: "Third-Party Risk Management",
      source: "COSO",
      category: "Risk Management",
      readTime: "30 min",
      topics: ["Due Diligence", "Ongoing Monitoring", "Contract Management", "Exit Planning"]
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
      <Tabs defaultValue="regulatory" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="regulatory">
            <Newspaper className="h-4 w-4 mr-2" />
            Regulatory Updates
          </TabsTrigger>
          <TabsTrigger value="industry">
            <Radio className="h-4 w-4 mr-2" />
            Industry Alerts
          </TabsTrigger>
          <TabsTrigger value="practices">
            <FileText className="h-4 w-4 mr-2" />
            Best Practices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regulatory" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-emerald-400" />
                Latest Regulatory Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px]">
                <div className="space-y-4 pr-4">
                  {regulatoryUpdates.map((update, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white mb-2">{update.title}</h4>
                            <p className="text-xs text-slate-400 mb-3">{update.summary}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className="bg-emerald-500/10 text-emerald-400">
                            <Globe className="h-3 w-3 mr-1" />
                            {update.region}
                          </Badge>
                          <Badge className="bg-blue-500/10 text-blue-400">
                            {update.framework}
                          </Badge>
                          <Badge className="bg-purple-500/10 text-purple-400">
                            {update.agency}
                          </Badge>
                          <Badge className={
                            update.impact === 'Critical' ? 'bg-rose-500/10 text-rose-400' :
                            update.impact === 'High' ? 'bg-orange-500/10 text-orange-400' :
                            'bg-amber-500/10 text-amber-400'
                          }>
                            Impact: {update.impact}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            Effective: <span className="text-white font-medium">{update.effectiveDate}</span>
                          </div>
                          <Button variant="outline" size="sm" className="border-[#2a3548]">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Full Details
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {update.categories.map((cat, i) => (
                            <Badge key={i} className="bg-slate-500/10 text-slate-400 text-xs">
                              {cat}
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

        <TabsContent value="industry" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-5 w-5 text-blue-400" />
                Industry-Specific Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px]">
                <div className="space-y-6 pr-4">
                  {industryAlerts.map((industry, idx) => (
                    <div key={idx}>
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        {industry.industry}
                      </h3>
                      <div className="space-y-2">
                        {industry.alerts.map((alert, i) => (
                          <Card key={i} className="bg-[#151d2e] border-[#2a3548]">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={severityColors[alert.severity]}>
                                      {alert.type}
                                    </Badge>
                                    <span className="text-xs text-slate-500">{alert.date}</span>
                                  </div>
                                  <h4 className="text-sm font-medium text-white mb-1">{alert.title}</h4>
                                  <p className="text-xs text-slate-400">{alert.summary}</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practices" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                Industry Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {bestPractices.map((practice, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-2">{practice.title}</h4>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-purple-500/10 text-purple-400">
                              {practice.category}
                            </Badge>
                            <Badge className="bg-slate-500/10 text-slate-400">
                              {practice.source}
                            </Badge>
                            <Badge className="bg-blue-500/10 text-blue-400">
                              {practice.readTime} read
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-2">Key Topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {practice.topics.map((topic, i) => (
                            <Badge key={i} className="bg-slate-500/10 text-slate-400 text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full border-[#2a3548]">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Read Full Article
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