import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, BookOpen, TrendingUp, Shield, FileText, Activity, Sparkles, Newspaper } from "lucide-react";
import { format } from "date-fns";

export default function ControlExternalFeeds() {
  const [activeCategory, setActiveCategory] = useState("standards");

  const feeds = {
    standards: {
      title: "Standards & Frameworks",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      items: [
        {
          title: "COSO 2013 Framework Update",
          source: "COSO",
          date: new Date("2024-12-10"),
          summary: "Updated guidance on integrating ESG considerations into the COSO framework for enterprise risk management and internal control.",
          url: "https://www.coso.org",
          tags: ["COSO", "Framework", "Update"]
        },
        {
          title: "ISO 27001:2022 Implementation Guide",
          source: "ISO",
          date: new Date("2024-12-08"),
          summary: "Comprehensive implementation guidance for the updated ISO/IEC 27001:2022 standard with new control sets.",
          url: "https://www.iso.org",
          tags: ["ISO27001", "Implementation", "Guide"]
        },
        {
          title: "COBIT 2019 Framework Updates",
          source: "ISACA",
          date: new Date("2024-12-05"),
          summary: "Latest updates to COBIT 2019 including cloud governance and DevOps integration considerations.",
          url: "https://www.isaca.org/resources/cobit",
          tags: ["COBIT", "Cloud", "DevOps"]
        },
        {
          title: "NIST Cybersecurity Framework 2.0",
          source: "NIST",
          date: new Date("2024-11-28"),
          summary: "Major update to NIST CSF with expanded governance function and supply chain risk management controls.",
          url: "https://www.nist.gov/cyberframework",
          tags: ["NIST", "Cybersecurity", "Framework"]
        }
      ]
    },
    regulations: {
      title: "Regulatory Updates",
      icon: FileText,
      color: "from-indigo-500 to-purple-500",
      items: [
        {
          title: "SEC Cybersecurity Disclosure Rules",
          source: "SEC",
          date: new Date("2024-12-12"),
          summary: "New requirements for public companies to disclose material cybersecurity incidents and describe their cybersecurity risk management processes.",
          url: "https://www.sec.gov",
          tags: ["SEC", "Disclosure", "Cybersecurity"]
        },
        {
          title: "GDPR Enforcement Trends 2024",
          source: "EDPB",
          date: new Date("2024-12-09"),
          summary: "Analysis of GDPR enforcement actions in 2024, focusing on data breach notifications and processor accountability.",
          url: "https://edpb.europa.eu",
          tags: ["GDPR", "Privacy", "Enforcement"]
        },
        {
          title: "SOX Auditing Standard Updates",
          source: "PCAOB",
          date: new Date("2024-12-03"),
          summary: "Updated auditing standards for evaluating internal control over financial reporting, effective for 2025 audits.",
          url: "https://pcaobus.org",
          tags: ["SOX", "PCAOB", "Auditing"]
        },
        {
          title: "PCI DSS v4.0 Transition Guidance",
          source: "PCI SSC",
          date: new Date("2024-11-30"),
          summary: "Implementation guidance for transitioning to PCI DSS v4.0 requirements by March 2025 deadline.",
          url: "https://www.pcisecuritystandards.org",
          tags: ["PCI-DSS", "Compliance", "Transition"]
        }
      ]
    },
    bestpractices: {
      title: "Best Practices & Research",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-500",
      items: [
        {
          title: "Control Automation Success Factors",
          source: "Gartner",
          date: new Date("2024-12-11"),
          summary: "Research findings on key success factors for control automation initiatives, including change management and technology selection.",
          url: "https://www.gartner.com",
          tags: ["Automation", "Research", "Best Practices"]
        },
        {
          title: "AI in Internal Audit and Controls",
          source: "IIA",
          date: new Date("2024-12-07"),
          summary: "Guidance on leveraging AI and machine learning for continuous control monitoring and predictive risk assessment.",
          url: "https://www.theiia.org",
          tags: ["AI", "Audit", "Innovation"]
        },
        {
          title: "Three Lines Model Implementation",
          source: "IIA",
          date: new Date("2024-12-04"),
          summary: "Practical case studies and lessons learned from organizations implementing the IIA's Three Lines Model.",
          url: "https://www.theiia.org",
          tags: ["Three Lines", "Governance", "Case Study"]
        },
        {
          title: "Cloud Control Matrix 4.0",
          source: "CSA",
          date: new Date("2024-11-29"),
          summary: "Updated Cloud Security Alliance control framework for cloud computing environments with SaaS, PaaS, and IaaS considerations.",
          url: "https://cloudsecurityalliance.org",
          tags: ["Cloud", "Security", "Framework"]
        }
      ]
    },
    industry: {
      title: "Industry News",
      icon: Newspaper,
      color: "from-amber-500 to-orange-500",
      items: [
        {
          title: "Major Banks Strengthen Cyber Controls",
          source: "Financial Times",
          date: new Date("2024-12-13"),
          summary: "Leading financial institutions announce significant investments in cybersecurity controls following recent threat intelligence.",
          url: "https://www.ft.com",
          tags: ["Banking", "Cybersecurity", "Investment"]
        },
        {
          title: "Healthcare HIPAA Compliance Trends",
          source: "Healthcare IT News",
          date: new Date("2024-12-10"),
          summary: "Analysis of healthcare organizations' approaches to HIPAA compliance and emerging privacy control challenges.",
          url: "https://www.healthcareitnews.com",
          tags: ["Healthcare", "HIPAA", "Privacy"]
        },
        {
          title: "Supply Chain Risk Management Focus",
          source: "Supply Chain Dive",
          date: new Date("2024-12-06"),
          summary: "Organizations enhancing third-party risk management controls amid growing supply chain vulnerabilities.",
          url: "https://www.supplychaindive.com",
          tags: ["Supply Chain", "Third-Party", "Risk"]
        },
        {
          title: "ESG Controls Integration Growing",
          source: "Bloomberg",
          date: new Date("2024-12-01"),
          summary: "Companies integrating ESG metrics into internal control frameworks as stakeholder pressure increases.",
          url: "https://www.bloomberg.com",
          tags: ["ESG", "Sustainability", "Controls"]
        }
      ]
    },
    tools: {
      title: "Tools & Technology",
      icon: Activity,
      color: "from-violet-500 to-purple-500",
      items: [
        {
          title: "GRC Platform Market Analysis 2024",
          source: "Forrester",
          date: new Date("2024-12-14"),
          summary: "Comprehensive analysis of leading GRC platforms, automation capabilities, and market trends for 2025.",
          url: "https://www.forrester.com",
          tags: ["GRC", "Technology", "Market"]
        },
        {
          title: "Control Testing Automation Tools",
          source: "TechTarget",
          date: new Date("2024-12-08"),
          summary: "Review of emerging tools for automating control testing, continuous monitoring, and anomaly detection.",
          url: "https://www.techtarget.com",
          tags: ["Automation", "Testing", "Tools"]
        },
        {
          title: "AI-Powered Risk Assessment",
          source: "MIT Technology Review",
          date: new Date("2024-12-02"),
          summary: "Breakthrough AI technologies for real-time risk assessment and dynamic control recommendations.",
          url: "https://www.technologyreview.com",
          tags: ["AI", "Risk", "Innovation"]
        },
        {
          title: "Blockchain for Control Evidence",
          source: "Journal of Accountancy",
          date: new Date("2024-11-27"),
          summary: "Exploring blockchain technology for immutable control evidence and audit trail management.",
          url: "https://www.journalofaccountancy.com",
          tags: ["Blockchain", "Audit", "Innovation"]
        }
      ]
    }
  };

  const Category = feeds[activeCategory];
  const CategoryIcon = Category.icon;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border-orange-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              <Activity className="h-7 w-7 text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                External Feeds & Industry Updates
                <Badge className="bg-orange-500/20 text-orange-400 text-[10px]">LIVE UPDATES</Badge>
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Latest news, standards, regulations, and best practices from across the control management landscape
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <p className="text-sm text-slate-400">Select a category to view updates</p>
          </CardHeader>
          <CardContent>
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 h-auto bg-transparent p-0">
              {Object.entries(feeds).map(([key, feed]) => {
                const Icon = feed.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={`flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:${feed.color}/20 data-[state=active]:border-current/50 border border-[#2a3548] rounded-lg h-auto`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">{feed.title}</span>
                    <Badge className="text-[9px] bg-slate-500/20 text-slate-400">{feed.items.length} new</Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </CardContent>
        </Card>

        {Object.entries(feeds).map(([key, feed]) => (
          <TabsContent key={key} value={key}>
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${feed.color}/20`}>
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{feed.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-3 pr-4">
                    {feed.items.map((item, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/40 transition-all group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors mb-1">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Badge className="bg-slate-500/10 text-slate-400 text-[10px]">
                                  {item.source}
                                </Badge>
                                <span>•</span>
                                <span>{format(item.date, 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                            >
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                          
                          <p className="text-sm text-slate-400 leading-relaxed mb-3">
                            {item.summary}
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {item.tags.map((tag, tidx) => (
                              <Badge key={tidx} className={`text-[10px] bg-gradient-to-r ${feed.color}/10 border-0`}>
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
        ))}
      </Tabs>
    </div>
  );
}