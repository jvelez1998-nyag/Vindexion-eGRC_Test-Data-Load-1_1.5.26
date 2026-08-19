import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
  Brain,
  Trophy,
  Clock,
  GitMerge
} from "lucide-react";

const GuideSection = ({ icon: Icon, title, steps }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-indigo-400" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    {steps.map((step, idx) => (
      <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {idx + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{step.description}</p>
              
              {step.image && (
                <div className="bg-[#0f1623] rounded-lg p-2 mb-3">
                  <p className="text-xs text-slate-500 italic">Visual: {step.image}</p>
                </div>
              )}

              {step.tips && step.tips.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-2">
                  <p className="text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" /> Pro Tips:
                  </p>
                  <ul className="space-y-1">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-slate-300">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {step.warning && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                  <p className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Important:
                  </p>
                  <p className="text-xs text-slate-300">{step.warning}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function CrossWalkUserGuide() {
  const [activeGuide, setActiveGuide] = useState("overview");

  const guides = {
    overview: {
      icon: BookOpen,
      title: "Cross-Walk Overview",
      steps: [
        {
          title: "What is Cross-Walk Mapping?",
          description: "Cross-walk mapping is the process of identifying relationships and alignments between different compliance frameworks, standards, and regulatory requirements. It helps organizations demonstrate how meeting one framework's requirements satisfies multiple others.",
          tips: [
            "Cross-walks reduce duplicative compliance efforts",
            "They provide a unified view of compliance obligations",
            "Essential for multi-framework compliance programs"
          ]
        },
        {
          title: "Why Cross-Walk Mapping Matters",
          description: "Organizations often face requirements from multiple frameworks (NIST, ISO, SOC 2, HIPAA, etc.). Cross-walk mapping shows overlaps and gaps, enabling efficient compliance by addressing shared requirements once rather than separately for each framework.",
          tips: [
            "Reduces assessment fatigue",
            "Identifies control reuse opportunities",
            "Streamlines audit preparation"
          ]
        },
        {
          title: "Key Components",
          description: "Source Framework: The starting point. Target Framework: The destination. Mapping Rules: Relationships between requirements. Coverage Analysis: How well frameworks align. Gap Analysis: Requirements unique to each framework.",
          tips: [
            "Start with your primary compliance framework",
            "Map to frameworks required by customers/regulators",
            "Document mapping rationale for auditors"
          ]
        }
      ]
    },
    
    dashboard: {
      icon: TrendingUp,
      title: "Dashboard & Analytics",
      steps: [
        {
          title: "Viewing Cross-Walk Mappings",
          description: "The dashboard displays all active cross-walk mappings between frameworks. Each mapping shows source/target frameworks, coverage percentage, status, and identified gaps.",
          tips: [
            "Sort by coverage percentage to prioritize low-alignment mappings",
            "Filter by status to focus on in-progress work",
            "Use the search to quickly find specific framework mappings"
          ]
        },
        {
          title: "Coverage Metrics",
          description: "Coverage percentage indicates how much of the target framework is addressed by the source framework. Higher percentages mean better alignment and less additional work.",
          tips: [
            "90%+ coverage indicates strong alignment",
            "70-90% coverage suggests moderate additional effort",
            "Below 70% may require significant supplemental controls"
          ],
          warning: "Low coverage doesn't mean frameworks are incompatible—just that they address different areas"
        },
        {
          title: "Gap Analysis View",
          description: "Gaps represent requirements in the target framework not covered by the source. Review gaps to understand what additional controls or documentation are needed.",
          tips: [
            "Prioritize closing gaps for critical requirements",
            "Document compensating controls for unaddressed gaps",
            "Update mappings as your control environment evolves"
          ]
        }
      ]
    },

    mapping_engine: {
      icon: GitMerge,
      title: "AI Mapping Engine",
      steps: [
        {
          title: "Creating a New Cross-Walk",
          description: "Select source and target frameworks, then let the AI mapping engine analyze requirements and suggest relationships. The engine uses natural language processing to identify semantic similarities between framework controls.",
          tips: [
            "Choose your most mature framework as the source",
            "AI suggestions are starting points—review and refine",
            "Save partial mappings and iterate over time"
          ]
        },
        {
          title: "Understanding Mapping Types",
          description: "Full Match: Requirements are nearly identical. Partial Match: Source partially addresses target. Superset: Source exceeds target requirements. No Match: No clear relationship. The AI assigns confidence scores to each mapping.",
          tips: [
            "High confidence (80%+) mappings usually need minimal review",
            "Medium confidence (50-80%) requires validation",
            "Low confidence (<50%) may need manual mapping"
          ],
          warning: "Always validate AI mappings before using them for compliance decisions"
        },
        {
          title: "Refining Mappings",
          description: "Review AI-suggested mappings and adjust as needed. Add notes explaining the mapping rationale, link to supporting evidence, and indicate if compensating controls are required.",
          tips: [
            "Document your reasoning—auditors will ask",
            "Link to actual control implementations",
            "Update mappings when controls change"
          ]
        },
        {
          title: "Bulk Mapping Operations",
          description: "Use bulk operations to apply mapping decisions across similar requirements. The AI can suggest bulk mappings based on patterns it identifies in your manual mappings.",
          tips: [
            "Review bulk suggestions before accepting",
            "Use consistent mapping rules across your organization",
            "Export mappings for external auditor review"
          ]
        }
      ]
    },

    gap_analysis: {
      icon: AlertTriangle,
      title: "Gap Analysis",
      steps: [
        {
          title: "Identifying Gaps",
          description: "Gaps are target framework requirements with no corresponding source framework control. The AI gap analyzer highlights these and suggests potential remediation strategies.",
          tips: [
            "Categorize gaps by severity and effort to address",
            "Some gaps may be addressed by informal practices",
            "Document acceptance for low-risk gaps"
          ]
        },
        {
          title: "Prioritizing Gap Remediation",
          description: "Not all gaps require immediate action. Prioritize based on regulatory importance, risk level, customer requirements, and implementation complexity.",
          tips: [
            "Address regulatory mandates first",
            "Quick wins can improve coverage percentage rapidly",
            "Bundle related gaps for efficient implementation"
          ],
          warning: "Don't ignore gaps just because they're difficult—plan for long-term remediation"
        },
        {
          title: "Closing Gaps",
          description: "Options include: implementing new controls, extending existing controls, accepting the risk with justification, or using compensating controls. Document your approach for each gap.",
          tips: [
            "Leverage existing controls where possible",
            "Document compensating controls clearly",
            "Track gap closure progress over time"
          ]
        }
      ]
    },

    automation: {
      icon: Brain,
      title: "Automation & Intelligence",
      steps: [
        {
          title: "Automated Mapping Updates",
          description: "Enable automation to keep mappings current as frameworks evolve. The system monitors framework updates and suggests remapping when requirements change.",
          tips: [
            "Subscribe to framework update notifications",
            "Review automated remapping suggestions quarterly",
            "Version control your mappings"
          ]
        },
        {
          title: "Cross-Framework Insights",
          description: "The AI analyzes patterns across all your mappings to suggest optimization opportunities, identify over-controlled areas, and highlight under-addressed risks.",
          tips: [
            "Review insights monthly for optimization ideas",
            "Use insights to justify control consolidation",
            "Share insights with audit committees"
          ]
        },
        {
          title: "Mapping Quality Scoring",
          description: "The system scores mapping quality based on completeness, documentation, evidence linkage, and review recency. Use quality scores to focus improvement efforts.",
          tips: [
            "Aim for 90%+ quality scores for external frameworks",
            "Schedule reviews for mappings with declining scores",
            "Quality scores help demonstrate due diligence"
          ]
        }
      ]
    }
  };

  const studyGuide = {
    fundamentals: [
      {
        topic: "Framework Types",
        description: "Regulatory frameworks (HIPAA, GDPR), Industry standards (PCI DSS, SOC 2), Best practice frameworks (NIST, ISO), Risk management frameworks (COSO, RMF)",
        keyPoints: [
          "Regulatory frameworks are mandatory for certain industries",
          "Standards may be required by contracts or customers",
          "Best practices are voluntary but demonstrate maturity",
          "Choose frameworks aligned with your business and risks"
        ]
      },
      {
        topic: "Mapping Methodologies",
        description: "One-to-one, one-to-many, many-to-one, many-to-many relationships. Understanding control objectives vs. control activities.",
        keyPoints: [
          "Map at the objective level for higher-level alignments",
          "Map at the activity level for detailed implementation",
          "Document mapping granularity decisions",
          "Consistency is more important than perfection"
        ]
      },
      {
        topic: "Coverage Analysis",
        description: "Quantitative metrics (percentage coverage) and qualitative assessment (mapping strength, confidence levels, gap severity)",
        keyPoints: [
          "Coverage percentage is a starting point, not the full story",
          "Consider mapping confidence in coverage calculations",
          "Weight critical requirements more heavily",
          "Track coverage trends over time"
        ]
      }
    ],
    advanced: [
      {
        topic: "Multi-Framework Harmonization",
        description: "Creating a unified control framework that satisfies multiple compliance obligations simultaneously. Building a controls taxonomy that maps to all required frameworks.",
        keyPoints: [
          "Start with the most comprehensive framework as your base",
          "Add controls to address gaps in other frameworks",
          "Use a consistent control numbering scheme",
          "Maintain traceability to each framework requirement"
        ]
      },
      {
        topic: "Continuous Compliance",
        description: "Automating evidence collection, maintaining real-time mapping accuracy, handling framework updates proactively, scaling compliance as you grow.",
        keyPoints: [
          "Integrate controls with monitoring tools for continuous evidence",
          "Schedule regular mapping review cycles",
          "Set alerts for framework updates",
          "Build compliance into development workflows"
        ]
      },
      {
        topic: "Audit Optimization",
        description: "Using cross-walks to reduce audit scope and effort. Presenting mappings to auditors effectively. Demonstrating multi-framework compliance efficiently.",
        keyPoints: [
          "Share mappings with auditors upfront",
          "Explain mapping methodology and validation process",
          "Provide evidence once, reference for multiple frameworks",
          "Negotiate integrated audit schedules"
        ]
      }
    ]
  };

  const studyPlan = [
    {
      week: "Week 1-2",
      phase: "Foundation",
      focus: "Cross-Walk Basics",
      activities: [
        "Complete Overview guide",
        "Review framework fundamentals",
        "Understand mapping types and relationships",
        "Practice: Map 2-3 simple requirements between familiar frameworks"
      ],
      goal: "Understand cross-walk concepts and terminology"
    },
    {
      week: "Week 3-4",
      phase: "Application",
      focus: "Mapping Engine & Dashboard",
      activities: [
        "Create your first AI-assisted mapping",
        "Explore mapping quality indicators",
        "Review coverage analysis techniques",
        "Practice: Complete a small cross-walk (20-30 requirements)"
      ],
      goal: "Become proficient with the mapping engine"
    },
    {
      week: "Week 5-6",
      phase: "Analysis",
      focus: "Gap Analysis & Remediation",
      activities: [
        "Conduct comprehensive gap analysis",
        "Prioritize gaps using risk-based approach",
        "Develop gap remediation plans",
        "Practice: Analyze gaps between two major frameworks"
      ],
      goal: "Master gap identification and remediation planning"
    },
    {
      week: "Week 7-8",
      phase: "Optimization",
      focus: "Automation & Multi-Framework Strategy",
      activities: [
        "Enable automation features",
        "Build multi-framework mapping strategy",
        "Configure automated updates and alerts",
        "Practice: Create a harmonized control framework"
      ],
      goal: "Optimize cross-walk processes and automation"
    },
    {
      week: "Week 9-10",
      phase: "Mastery",
      focus: "Advanced Topics & Audit Preparation",
      activities: [
        "Study multi-framework harmonization",
        "Prepare audit-ready mapping documentation",
        "Review advanced scenarios and edge cases",
        "Practice: Present mappings to stakeholders"
      ],
      goal: "Achieve expert-level cross-walk proficiency"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Cross-Walk Mapping Learning Center</h2>
          <p className="text-slate-400">Comprehensive guides and study materials for framework mapping</p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 flex items-center gap-1">
          <Trophy className="h-3 w-3" />
          Learning Hub
        </Badge>
      </div>

      <Tabs value={activeGuide} onValueChange={setActiveGuide}>
        <TabsList className="bg-[#1a2332] border border-[#2a3548] flex-wrap h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600">
            <BookOpen className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="mapping_engine" className="data-[state=active]:bg-indigo-600">
            <GitMerge className="h-4 w-4 mr-2" />
            Mapping Engine
          </TabsTrigger>
          <TabsTrigger value="gap_analysis" className="data-[state=active]:bg-indigo-600">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Gap Analysis
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-indigo-600">
            <Brain className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="study_guide" className="data-[state=active]:bg-indigo-600">
            <Target className="h-4 w-4 mr-2" />
            Study Guide
          </TabsTrigger>
          <TabsTrigger value="study_plan" className="data-[state=active]:bg-indigo-600">
            <Calendar className="h-4 w-4 mr-2" />
            Study Plan
          </TabsTrigger>
        </TabsList>

        {/* User Guide Tabs */}
        {Object.entries(guides).map(([key, guide]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <ScrollArea className="h-[800px] pr-4">
              <GuideSection icon={guide.icon} title={guide.title} steps={guide.steps} />
            </ScrollArea>
          </TabsContent>
        ))}

        {/* Study Guide Tab */}
        <TabsContent value="study_guide" className="space-y-6">
          <ScrollArea className="h-[800px] pr-4">
            {/* Fundamentals */}
            <Card className="bg-[#1a2332] border-[#2a3548] mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  Fundamentals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studyGuide.fundamentals.map((item, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-2">{item.topic}</h4>
                      <p className="text-sm text-slate-400 mb-3">{item.description}</p>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-400 mb-2">Key Points:</p>
                        <ul className="space-y-1">
                          {item.keyPoints.map((point, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Advanced Topics */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Advanced Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studyGuide.advanced.map((item, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-2">{item.topic}</h4>
                      <p className="text-sm text-slate-400 mb-3">{item.description}</p>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs font-semibold text-purple-400 mb-2">Key Points:</p>
                        <ul className="space-y-1">
                          {item.keyPoints.map((point, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        {/* Study Plan Tab */}
        <TabsContent value="study_plan" className="space-y-6">
          <ScrollArea className="h-[800px] pr-4">
            <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/20">
                    <Calendar className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">10-Week Cross-Walk Mastery Program</h3>
                    <p className="text-slate-300 mb-4">
                      A structured learning path to become an expert in cross-walk mapping and multi-framework compliance
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-400">10 Weeks</Badge>
                      <Badge className="bg-blue-500/20 text-blue-400">5 Phases</Badge>
                      <Badge className="bg-purple-500/20 text-purple-400">Expert Level</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {studyPlan.map((phase, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-slate-500/20 text-slate-300">
                            <Clock className="h-3 w-3 mr-1" />
                            {phase.week}
                          </Badge>
                          <Badge className="bg-indigo-500/20 text-indigo-400">{phase.phase}</Badge>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">{phase.focus}</h4>
                        <p className="text-sm text-slate-400 mb-4">Goal: {phase.goal}</p>
                        
                        <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
                          <p className="text-xs font-semibold text-slate-300 mb-2">Activities:</p>
                          <ul className="space-y-2">
                            {phase.activities.map((activity, i) => (
                              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20 mt-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="h-6 w-6 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Certification Path</h3>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Upon completing this study plan, you'll have the knowledge and skills to:
                </p>
                <ul className="space-y-2">
                  <li className="text-sm text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    Design and implement enterprise cross-walk strategies
                  </li>
                  <li className="text-sm text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    Lead multi-framework compliance initiatives
                  </li>
                  <li className="text-sm text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    Present cross-walk analyses to executive leadership and auditors
                  </li>
                  <li className="text-sm text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    Optimize compliance programs through intelligent framework harmonization
                  </li>
                </ul>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}