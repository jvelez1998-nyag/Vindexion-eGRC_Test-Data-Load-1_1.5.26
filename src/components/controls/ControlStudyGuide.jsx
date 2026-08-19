import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Shield, CheckCircle2, Target, Brain, Zap, FileCheck, AlertTriangle } from "lucide-react";

export default function ControlStudyGuide() {
  const [activeModule, setActiveModule] = useState("fundamentals");

  const modules = {
    fundamentals: {
      title: "Control Fundamentals",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      sections: [
        {
          title: "What are Controls?",
          content: "Controls are policies, procedures, practices, and organizational structures designed to provide reasonable assurance that business objectives will be achieved and undesired events will be prevented or detected and corrected.",
          keyPoints: [
            "Preventive controls stop problems before they occur",
            "Detective controls identify problems after they happen",
            "Corrective controls fix problems once detected",
            "Directive controls guide behavior through policies"
          ]
        },
        {
          title: "Control Categories",
          content: "Understanding the four main types of controls is essential for building an effective control framework.",
          keyPoints: [
            "Preventive: Access controls, segregation of duties, authorization requirements",
            "Detective: Reconciliations, monitoring, exception reports, audits",
            "Corrective: Error correction procedures, backup recovery, incident response",
            "Directive: Policies, procedures, training, code of conduct"
          ]
        },
        {
          title: "Control Domains",
          content: "Controls are organized by domain to address different areas of organizational risk.",
          keyPoints: [
            "Access Control: User authentication, authorization, privileged access",
            "Data Protection: Encryption, DLP, data classification, backup",
            "Network Security: Firewalls, IDS/IPS, network segmentation",
            "Incident Response: Detection, containment, recovery procedures",
            "Business Continuity: DR planning, failover, recovery strategies"
          ]
        }
      ]
    },
    design: {
      title: "Control Design",
      icon: Target,
      color: "from-indigo-500 to-purple-500",
      sections: [
        {
          title: "Design Principles",
          content: "Effective control design follows key principles to ensure controls are robust, sustainable, and aligned with business objectives.",
          keyPoints: [
            "Risk-based: Controls should address specific identified risks",
            "Cost-effective: Benefits should exceed implementation costs",
            "Appropriate: Control strength matches risk severity",
            "Sustainable: Controls can be maintained long-term",
            "Measurable: Effectiveness can be objectively assessed"
          ]
        },
        {
          title: "Control Objectives",
          content: "Each control should have a clear objective that links to specific risks and business goals.",
          keyPoints: [
            "Define what the control is intended to achieve",
            "Link to specific risks being mitigated",
            "Align with regulatory or compliance requirements",
            "Establish measurable success criteria",
            "Document ownership and responsibilities"
          ]
        },
        {
          title: "Control Procedures",
          content: "Well-documented procedures ensure controls are executed consistently and effectively.",
          keyPoints: [
            "Step-by-step instructions for control execution",
            "Frequency and timing requirements",
            "Required evidence and documentation",
            "Roles and responsibilities",
            "Escalation procedures for exceptions"
          ]
        }
      ]
    },
    testing: {
      title: "Control Testing",
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-500",
      sections: [
        {
          title: "Testing Methodologies",
          content: "Different testing approaches provide varying levels of assurance about control effectiveness.",
          keyPoints: [
            "Inquiry: Asking questions of control performers",
            "Observation: Watching controls being performed",
            "Inspection: Examining documents and evidence",
            "Re-performance: Executing the control independently",
            "Walkthrough: Tracing transactions through processes"
          ]
        },
        {
          title: "Test Planning",
          content: "Effective test planning ensures comprehensive coverage and efficient resource utilization.",
          keyPoints: [
            "Risk-based sampling: Test higher-risk controls more frequently",
            "Sample size determination: Statistical vs judgmental sampling",
            "Test timing: Interim vs year-end testing considerations",
            "Test documentation: What to document and retain",
            "Independence: Who should perform testing"
          ]
        },
        {
          title: "Evaluating Results",
          content: "Test results must be properly evaluated to determine if controls are operating effectively.",
          keyPoints: [
            "Define pass/fail criteria in advance",
            "Assess severity and pervasiveness of exceptions",
            "Distinguish design vs operating effectiveness issues",
            "Determine root causes of control failures",
            "Develop remediation plans for deficiencies"
          ]
        }
      ]
    },
    frameworks: {
      title: "Control Frameworks",
      icon: Shield,
      color: "from-violet-500 to-purple-500",
      sections: [
        {
          title: "COSO Framework",
          content: "The Committee of Sponsoring Organizations (COSO) framework is widely used for internal control evaluation.",
          keyPoints: [
            "Control Environment: Tone at the top, integrity, competence",
            "Risk Assessment: Identifying and analyzing risks",
            "Control Activities: Policies and procedures to mitigate risks",
            "Information & Communication: Capturing and sharing information",
            "Monitoring Activities: Ongoing evaluations of controls"
          ]
        },
        {
          title: "COBIT Framework",
          content: "Control Objectives for Information and Related Technologies focuses on IT governance and management.",
          keyPoints: [
            "Align: Strategy and enterprise goals alignment",
            "Plan: Solution planning and architecture",
            "Build: Solution acquisition and implementation",
            "Run: Service delivery and support",
            "Monitor: Performance and conformance monitoring"
          ]
        },
        {
          title: "ISO 27001",
          content: "International standard for information security management systems.",
          keyPoints: [
            "114 security controls across 14 domains",
            "Risk-based approach to control selection",
            "Continuous improvement through PDCA cycle",
            "Certification and third-party assessment",
            "Integration with business processes"
          ]
        },
        {
          title: "NIST Cybersecurity Framework",
          content: "Framework for improving critical infrastructure cybersecurity.",
          keyPoints: [
            "Identify: Asset management, risk assessment",
            "Protect: Access control, data security, protective technology",
            "Detect: Anomalies, continuous monitoring, detection processes",
            "Respond: Response planning, communications, analysis, mitigation",
            "Recover: Recovery planning, improvements, communications"
          ]
        }
      ]
    },
    sox: {
      title: "SOX Compliance",
      icon: FileCheck,
      color: "from-amber-500 to-orange-500",
      sections: [
        {
          title: "SOX Overview",
          content: "Sarbanes-Oxley Act requires public companies to maintain effective internal controls over financial reporting.",
          keyPoints: [
            "Section 302: CEO/CFO certification of financial statements",
            "Section 404: Management assessment of internal controls",
            "Section 409: Real-time disclosure of material changes",
            "Criminal penalties for fraud and obstruction",
            "Independent auditor attestation requirements"
          ]
        },
        {
          title: "Key Control Requirements",
          content: "SOX compliance requires specific controls over financial reporting processes.",
          keyPoints: [
            "Segregation of duties in financial processes",
            "Access controls to financial systems and data",
            "Change management controls for financial systems",
            "Evidence retention and documentation standards",
            "Management review and approval controls"
          ]
        },
        {
          title: "Testing and Documentation",
          content: "SOX requires rigorous testing and documentation of control effectiveness.",
          keyPoints: [
            "Annual testing of key controls by management",
            "Independent auditor testing and attestation",
            "Documentation of control design and operating effectiveness",
            "Remediation of identified deficiencies",
            "Quarterly CEO/CFO certifications"
          ]
        }
      ]
    },
    bestpractices: {
      title: "Best Practices",
      icon: Brain,
      color: "from-rose-500 to-pink-500",
      sections: [
        {
          title: "Control Environment",
          content: "A strong control environment is the foundation of effective internal control.",
          keyPoints: [
            "Tone at the top: Leadership commitment to integrity",
            "Clear organizational structure and reporting lines",
            "Competence: Hiring, training, and retaining qualified staff",
            "Accountability: Holding individuals responsible for control performance",
            "Ethics and values: Code of conduct and ethics training"
          ]
        },
        {
          title: "Control Documentation",
          content: "Comprehensive documentation ensures controls are understood, executed consistently, and can be evaluated.",
          keyPoints: [
            "Process narratives describing control activities",
            "Control matrices mapping controls to risks",
            "Procedure documents with step-by-step instructions",
            "Evidence retention policies and archives",
            "Version control and change management"
          ]
        },
        {
          title: "Continuous Monitoring",
          content: "Shift from periodic testing to continuous monitoring for more timely detection of control issues.",
          keyPoints: [
            "Automated control execution where feasible",
            "Real-time alerting for control exceptions",
            "Dashboard reporting of control health metrics",
            "Predictive analytics to identify emerging issues",
            "Integration with business intelligence tools"
          ]
        },
        {
          title: "Control Optimization",
          content: "Regularly evaluate and optimize controls to maintain effectiveness while reducing costs.",
          keyPoints: [
            "Identify and eliminate redundant or outdated controls",
            "Automate manual controls where possible",
            "Consolidate overlapping control activities",
            "Benchmark against industry standards",
            "Balance control costs with risk reduction benefits"
          ]
        }
      ]
    }
  };

  const Module = modules[activeModule];
  const ModuleIcon = Module.icon;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <BookOpen className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Control Management Study Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Comprehensive learning resource for control frameworks, design, testing, and best practices
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeModule} onValueChange={setActiveModule} className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <p className="text-sm text-slate-400">Select a module to begin learning</p>
          </CardHeader>
          <CardContent>
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto bg-transparent p-0">
              {Object.entries(modules).map(([key, module]) => {
                const Icon = module.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={`flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:${module.color}/20 data-[state=active]:border-current/50 border border-[#2a3548] rounded-lg h-auto`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">{module.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </CardContent>
        </Card>

        {Object.entries(modules).map(([key, module]) => (
          <TabsContent key={key} value={key}>
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${module.color}/20`}>
                    <ModuleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{module.title}</CardTitle>
                    <Badge className={`mt-1 bg-gradient-to-r ${module.color}/20 border-0`}>
                      {module.sections.length} Topics
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="space-y-6 pr-4">
                    {module.sections.map((section, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                        <CardHeader>
                          <CardTitle className="text-base text-white flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            {section.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {section.content}
                          </p>
                          
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                              Key Points
                            </h4>
                            <div className="space-y-2">
                              {section.keyPoints.map((point, pidx) => (
                                <div key={pidx} className="flex items-start gap-2 text-sm text-slate-400">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                  <span>{point}</span>
                                </div>
                              ))}
                            </div>
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