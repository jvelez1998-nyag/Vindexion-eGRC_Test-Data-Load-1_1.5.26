import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, BookOpen, CheckCircle2, Shield, FileText, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const FRAMEWORKS = {
  sox: {
    name: "SOX (Sarbanes-Oxley)",
    category: "financial",
    description: "Financial reporting controls and corporate governance",
    color: "emerald",
    icon: "🏦",
    sections: [
      "Internal Controls Over Financial Reporting (ICFR)",
      "Management Assessment",
      "Auditor Attestation",
      "Control Environment",
      "Risk Assessment",
      "Control Activities",
      "Information & Communication",
      "Monitoring Activities"
    ]
  },
  soc2: {
    name: "SOC 2",
    category: "security",
    description: "Service organization controls for security, availability, and confidentiality",
    color: "indigo",
    icon: "🔒",
    sections: [
      "Security",
      "Availability",
      "Processing Integrity",
      "Confidentiality",
      "Privacy"
    ]
  },
  iso27001: {
    name: "ISO 27001",
    category: "security",
    description: "Information security management systems",
    color: "violet",
    icon: "🛡️",
    sections: [
      "Context of the Organization",
      "Leadership",
      "Planning",
      "Support",
      "Operation",
      "Performance Evaluation",
      "Improvement",
      "Annex A Controls"
    ]
  },
  pcidss: {
    name: "PCI DSS",
    category: "compliance",
    description: "Payment card industry data security standards",
    color: "blue",
    icon: "💳",
    sections: [
      "Build and Maintain Secure Network",
      "Protect Cardholder Data",
      "Maintain Vulnerability Management",
      "Implement Access Controls",
      "Monitor and Test Networks",
      "Maintain Information Security Policy"
    ]
  },
  hipaa: {
    name: "HIPAA",
    category: "compliance",
    description: "Healthcare data privacy and security",
    color: "rose",
    icon: "🏥",
    sections: [
      "Administrative Safeguards",
      "Physical Safeguards",
      "Technical Safeguards",
      "Organizational Requirements",
      "Breach Notification"
    ]
  },
  nist: {
    name: "NIST CSF",
    category: "security",
    description: "Cybersecurity framework",
    color: "amber",
    icon: "⚡",
    sections: [
      "Identify",
      "Protect",
      "Detect",
      "Respond",
      "Recover"
    ]
  },
  cobit: {
    name: "COBIT",
    category: "governance",
    description: "IT governance and management",
    color: "cyan",
    icon: "🎯",
    sections: [
      "Evaluate, Direct and Monitor (EDM)",
      "Align, Plan and Organize (APO)",
      "Build, Acquire and Implement (BAI)",
      "Deliver, Service and Support (DSS)",
      "Monitor, Evaluate and Assess (MEA)"
    ]
  }
};

export default function AuditFrameworkLibrary() {
  const [search, setSearch] = useState("");
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [aiGuidance, setAiGuidance] = useState(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  const filteredFrameworks = Object.entries(FRAMEWORKS).filter(([key, fw]) =>
    fw.name.toLowerCase().includes(search.toLowerCase()) ||
    fw.description.toLowerCase().includes(search.toLowerCase())
  );

  const generateAuditGuidance = async (framework) => {
    setLoadingGuidance(true);
    try {
      const prompt = `You are an audit expert. Generate comprehensive audit guidance for ${framework.name}:

Framework: ${framework.name}
Description: ${framework.description}
Key Sections: ${framework.sections.join(', ')}

Provide:
1. Audit Objectives (what the audit should achieve)
2. Scope Definition (what to include/exclude)
3. Key Focus Areas (critical areas to examine)
4. Testing Procedures (specific tests to perform)
5. Common Findings (typical issues discovered)
6. Best Practices (recommendations for auditors)
7. Documentation Requirements (evidence to collect)

Format in clear, professional markdown with bullet points and sections.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setAiGuidance(response);
      toast.success("Guidance generated");
    } catch (error) {
      toast.error("Failed to generate guidance");
    } finally {
      setLoadingGuidance(false);
    }
  };

  const colorClasses = {
    emerald: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
    indigo: 'from-indigo-500/10 to-blue-500/10 border-indigo-500/20',
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    rose: 'from-rose-500/10 to-pink-500/10 border-rose-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Framework List */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Audit Frameworks</CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search frameworks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {filteredFrameworks.map(([key, framework]) => (
                <Card
                  key={key}
                  onClick={() => {
                    setSelectedFramework(framework);
                    setAiGuidance(null);
                  }}
                  className={`cursor-pointer transition-all ${
                    selectedFramework?.name === framework.name
                      ? `bg-gradient-to-br ${colorClasses[framework.color]}`
                      : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{framework.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">{framework.name}</h4>
                        <p className="text-xs text-slate-400">{framework.description}</p>
                        <Badge className="mt-2 text-[10px] bg-slate-500/10 text-slate-400 capitalize">
                          {framework.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Framework Details */}
      <div className="lg:col-span-2 space-y-6">
        {!selectedFramework ? (
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Select a Framework</h3>
              <p className="text-slate-400">Choose a framework to view audit guidance and requirements</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className={`bg-gradient-to-br ${colorClasses[selectedFramework.color]} border-${selectedFramework.color}-500/30`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{selectedFramework.icon}</div>
                    <div>
                      <CardTitle className="text-xl mb-1">{selectedFramework.name}</CardTitle>
                      <p className="text-sm text-slate-400">{selectedFramework.description}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => generateAuditGuidance(selectedFramework)}
                    disabled={loadingGuidance}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  >
                    {loadingGuidance ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    AI Guidance
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <Tabs defaultValue="sections">
                <CardHeader>
                  <TabsList className="bg-[#151d2e] border border-[#2a3548]">
                    <TabsTrigger value="sections">Key Sections</TabsTrigger>
                    <TabsTrigger value="guidance">AI Guidance</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="sections">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white mb-4">Framework Sections</h3>
                        {selectedFramework.sections.map((section, idx) => (
                          <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="text-sm font-medium text-white">{section}</h4>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                          <h4 className="text-sm font-medium text-indigo-400 mb-2">💡 Audit Tips</h4>
                          <ul className="text-xs text-slate-400 space-y-1">
                            <li>• Review each section systematically</li>
                            <li>• Gather evidence for all key requirements</li>
                            <li>• Document findings as you progress</li>
                            <li>• Interview key stakeholders</li>
                            <li>• Test controls for effectiveness</li>
                          </ul>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="guidance">
                    <ScrollArea className="h-[500px] pr-4">
                      {!aiGuidance ? (
                        <div className="text-center py-12">
                          <Sparkles className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400 mb-4">Generate AI-powered audit guidance</p>
                          <Button 
                            onClick={() => generateAuditGuidance(selectedFramework)}
                            disabled={loadingGuidance}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                          >
                            {loadingGuidance ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Generate Guidance
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-[#151d2e] border border-[#2a3548] rounded-xl p-6">
                          <ReactMarkdown 
                            className="prose prose-sm prose-invert max-w-none text-slate-300"
                            components={{
                              h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 mt-0">{children}</h1>,
                              h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-6 first:mt-0">{children}</h2>,
                              h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                              p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                              ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="text-slate-300">{children}</li>,
                              strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                            }}
                          >
                            {aiGuidance}
                          </ReactMarkdown>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}