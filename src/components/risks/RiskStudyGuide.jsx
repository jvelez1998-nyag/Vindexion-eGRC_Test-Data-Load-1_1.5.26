import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Brain, Target, CheckCircle2, Play, Clock, TrendingUp, Download, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function RiskStudyGuide() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedDeepDive, setSelectedDeepDive] = useState(null);
  const [learningModalOpen, setLearningModalOpen] = useState(false);

  const learningPaths = [
    {
      id: "fundamentals",
      title: "Risk Management Fundamentals",
      level: "Beginner",
      duration: "4 weeks",
      modules: 8,
      color: "from-blue-500 to-cyan-500",
      description: "Master the core principles of enterprise risk management following ISO 31000 and COSO ERM frameworks",
      topics: [
        "Introduction to Enterprise Risk Management - Understanding ERM principles, value creation, and organizational integration",
        "Risk Identification Techniques - Brainstorming, Delphi technique, SWOT analysis, and risk workshops",
        "Risk Assessment Methodologies - Qualitative vs quantitative analysis, risk matrices, and heat maps",
        "Risk Appetite and Tolerance - Defining organizational risk capacity, appetite statements, and tolerance levels",
        "Risk Treatment Strategies - The 4Ts: Transfer, Tolerate, Treat, Terminate",
        "Risk Monitoring and Reporting - Key Risk Indicators (KRIs), dashboards, and stakeholder communication",
        "Risk Culture and Governance - Three lines of defense model and tone at the top",
        "ERM Frameworks (COSO, ISO 31000) - Comparing frameworks and selecting the right approach"
      ],
      keyTakeaways: [
        "Risk = Likelihood × Impact",
        "Risk management is everyone's responsibility",
        "Residual risk should align with risk appetite",
        "Controls reduce likelihood or impact of risks"
      ]
    },
    {
      id: "advanced",
      title: "Advanced Risk Analytics",
      level: "Advanced",
      duration: "6 weeks",
      modules: 10,
      color: "from-purple-500 to-pink-500",
      description: "Deep dive into quantitative risk analysis techniques and predictive modeling approaches",
      topics: [
        "Quantitative Risk Analysis - Statistical methods, probability distributions, and expected loss calculations",
        "Monte Carlo Simulation - Building simulation models, running iterations, and interpreting results",
        "Scenario Analysis and Stress Testing - Developing scenarios, reverse stress testing, and sensitivity analysis",
        "Risk Aggregation Techniques - Correlation analysis, copulas, and portfolio risk modeling",
        "Predictive Risk Modeling - Time series analysis, regression models, and forecasting techniques",
        "Machine Learning in Risk Management - Classification algorithms, anomaly detection, and neural networks",
        "Risk Data Analytics and Visualization - Big data analytics, risk data lakes, and interactive dashboards",
        "Advanced Risk Reporting - Executive summaries, risk appetite alignment, and trend analysis",
        "Emerging Risk Detection - Horizon scanning, weak signal analysis, and early warning systems",
        "Risk-Based Decision Making - Decision trees, expected value analysis, and real options"
      ],
      keyTakeaways: [
        "Expected Loss = Probability × Impact × Exposure",
        "Correlation does not equal causation",
        "All models are wrong, but some are useful",
        "Backtesting validates model accuracy"
      ]
    },
    {
      id: "compliance",
      title: "Risk & Compliance Integration",
      level: "Intermediate",
      duration: "5 weeks",
      modules: 9,
      color: "from-emerald-500 to-teal-500",
      description: "Integrate risk management with compliance requirements across multiple regulatory frameworks",
      topics: [
        "Integrated Risk Management - GRC platforms, unified risk-compliance taxonomies, and integrated reporting",
        "Compliance Risk Assessment - Identifying compliance obligations, assessing gaps, and prioritizing remediation",
        "Regulatory Change Management - Monitoring regulatory updates, impact assessments, and change implementation",
        "SOX Controls and Risk - ICFR risk assessment, control design, and testing procedures",
        "Third-Party Risk Management - Vendor due diligence, continuous monitoring, and contract risk clauses",
        "Operational Risk Management - Basel II/III operational risk framework and loss event databases",
        "Information Security Risk - NIST CSF, ISO 27001, cyber risk quantification (FAIR methodology)",
        "Business Continuity and Crisis Management - BIA, recovery strategies, and crisis response planning",
        "Risk-Based Audit Planning - Risk-based audit universe, audit prioritization, and resource allocation"
      ],
      keyTakeaways: [
        "Compliance is a minimum standard, not best practice",
        "Risk-based approach optimizes resource allocation",
        "Controls should be mapped to multiple requirements",
        "Continuous monitoring beats periodic assessments"
      ]
    },
    {
      id: "strategic",
      title: "Strategic Risk Management",
      level: "Executive",
      duration: "3 weeks",
      modules: 6,
      color: "from-rose-500 to-orange-500",
      description: "Lead enterprise-wide risk management initiatives and build a strong risk-aware culture",
      topics: [
        "Board-Level Risk Oversight - Board risk committee charter, risk reporting cadence, and fiduciary duties",
        "Enterprise Risk Strategy - Aligning risk strategy with business strategy and competitive advantage",
        "Risk Appetite Framework Development - Creating risk appetite statements, setting limits, and cascading to business units",
        "Strategic Risk Identification - PESTLE analysis, scenario planning, and war gaming exercises",
        "Risk Culture Transformation - Leading cultural change, incentive alignment, and behavioral risk",
        "Risk-Based Performance Management - Integrating risk metrics into KPIs and balanced scorecards"
      ],
      keyTakeaways: [
        "Risk appetite drives strategy execution",
        "Culture eats strategy for breakfast",
        "Risk is opportunity if managed well",
        "Board oversight is critical for ERM success"
      ]
    },
    {
      id: "cyber",
      title: "Cyber Risk Management",
      level: "Intermediate",
      duration: "4 weeks",
      modules: 8,
      color: "from-red-500 to-pink-500",
      description: "Comprehensive cyber risk assessment, quantification, and mitigation strategies",
      topics: [
        "Cyber Risk Landscape - Threat actors, attack vectors, and emerging cyber threats",
        "NIST Cybersecurity Framework - Identify, Protect, Detect, Respond, Recover functions",
        "FAIR Cyber Risk Quantification - Loss Event Frequency, Loss Magnitude, and risk distribution",
        "Threat Modeling - STRIDE, DREAD, attack trees, and threat intelligence integration",
        "Vulnerability Management - Patch management, vulnerability scanning, and risk-based prioritization",
        "Incident Response Planning - IR playbooks, tabletop exercises, and post-incident reviews",
        "Third-Party Cyber Risk - Vendor security assessments, supply chain attacks, and fourth-party risk",
        "Cyber Insurance - Coverage options, risk transfer strategies, and claims management"
      ],
      keyTakeaways: [
        "Assume breach, focus on resilience",
        "Cyber risk is business risk, not just IT risk",
        "Quantification enables better decision-making",
        "Threat intelligence drives proactive defense"
      ]
    },
    {
      id: "financial",
      title: "Financial Risk Management",
      level: "Advanced",
      duration: "5 weeks",
      modules: 9,
      color: "from-green-500 to-emerald-500",
      description: "Master financial risk categories including market, credit, liquidity, and operational risk",
      topics: [
        "Market Risk Management - Interest rate risk, FX risk, equity risk, and commodity price risk",
        "Credit Risk Assessment - Credit scoring models, default probability, loss given default, and exposure at default",
        "Value at Risk (VaR) - Historical simulation, variance-covariance, and Monte Carlo VaR methods",
        "Liquidity Risk Management - Funding liquidity vs market liquidity and liquidity stress testing",
        "Operational Risk in Finance - Basel operational risk framework and operational risk capital",
        "Counterparty Risk - Credit valuation adjustment (CVA) and collateral management",
        "Model Risk Management - Model validation, backtesting, and model governance frameworks",
        "Capital Adequacy and Stress Testing - Basel III capital requirements and CCAR stress testing",
        "Risk-Adjusted Performance - RAROC, economic capital allocation, and risk-adjusted returns"
      ],
      keyTakeaways: [
        "Diversification reduces portfolio risk",
        "VaR has limitations - use multiple metrics",
        "Stress testing reveals tail risks",
        "Capital is the ultimate risk buffer"
      ]
    }
  ];

  const deepDives = [
    {
      title: "Risk Assessment Methodologies",
      description: "Comprehensive guide to qualitative and quantitative risk assessment techniques used across industries",
      duration: "90 min",
      topics: ["5×5 Likelihood-Impact Matrices", "Risk Scoring Models (Weighted & Unweighted)", "Heat Maps & Risk Registers", "Bow-Tie Analysis for Root Causes"],
      bestPractices: [
        "Use consistent scales across the organization",
        "Define clear criteria for each rating level",
        "Involve subject matter experts in assessments",
        "Document assumptions and justifications",
        "Review and update assessments regularly"
      ],
      industryExample: "Financial services typically use 5×5 matrices with quantitative thresholds (e.g., Impact >$10M = Critical)"
    },
    {
      title: "Emerging Risk Identification",
      description: "Proactive techniques for identifying and assessing emerging risks before they materialize",
      duration: "60 min",
      topics: ["Horizon Scanning Techniques", "Scenario Planning & War Gaming", "PESTLE Analysis", "Early Warning Indicators & Weak Signals"],
      bestPractices: [
        "Establish a cross-functional emerging risk committee",
        "Monitor external sources (news, research, regulatory)",
        "Conduct regular scenario planning exercises",
        "Create a taxonomy of risk categories",
        "Link emerging risks to strategic objectives"
      ],
      industryExample: "During COVID-19, organizations with strong horizon scanning identified supply chain risks 3-6 months earlier"
    },
    {
      title: "Risk Appetite Framework",
      description: "Building and implementing an effective risk appetite statement aligned with strategy",
      duration: "75 min",
      topics: ["Risk Capacity vs Appetite vs Tolerance", "Risk Tolerance Levels & Thresholds", "Key Risk Indicators (KRIs)", "Board Communication & Governance"],
      bestPractices: [
        "Start with qualitative statements, then add metrics",
        "Ensure board approval and ownership",
        "Cascade to business units with specific limits",
        "Monitor against appetite quarterly minimum",
        "Review appetite annually or after major changes"
      ],
      industryExample: "Sample: 'We have no appetite for regulatory compliance failures' with supporting KRIs and thresholds"
    },
    {
      title: "Cyber Risk Quantification",
      description: "Quantifying cyber risk using FAIR methodology and industry-standard approaches",
      duration: "120 min",
      topics: ["Loss Event Frequency (LEF)", "Probable Loss Magnitude (PLM)", "Risk Distribution Curves", "ROI on Security Controls"],
      bestPractices: [
        "Start with high-value scenarios (ransomware, data breach)",
        "Use industry data (Advisen, Verizon DBIR) for benchmarks",
        "Express risk in annual loss expectancy (ALE)",
        "Run Monte Carlo simulations for distributions",
        "Update models as threat landscape evolves"
      ],
      industryExample: "Healthcare data breach: LEF = 0.3/year, PLM = $2.5M-$8M, ALE = $1.575M"
    },
    {
      title: "Third-Party Risk Management",
      description: "Managing vendor and supply chain risks across the vendor lifecycle",
      duration: "90 min",
      topics: ["Vendor Due Diligence & Tiering", "Continuous Monitoring Programs", "Contract Risk Clauses", "Exit Strategies & Contingency Planning"],
      bestPractices: [
        "Tier vendors by criticality (Tier 1-3 risk levels)",
        "Require SOC 2, ISO 27001 for critical vendors",
        "Include right-to-audit clauses in contracts",
        "Monitor financial health and breach notifications",
        "Maintain vendor inventory and risk register"
      ],
      industryExample: "Critical vendors (Tier 1) require annual assessments, SOC 2 reports, and quarterly business reviews"
    },
    {
      title: "Operational Resilience",
      description: "Building resilient operations through risk management and business continuity",
      duration: "60 min",
      topics: ["Business Impact Analysis (BIA)", "Recovery Time & Point Objectives", "Testing Strategies (Tabletop, Full-Scale)", "Crisis Management & Communications"],
      bestPractices: [
        "Identify critical business services and dependencies",
        "Set realistic RTOs and RPOs based on impact",
        "Test BC/DR plans at least annually",
        "Establish a crisis management team",
        "Document lessons learned after incidents"
      ],
      industryExample: "Tier 1 services: RTO = 4 hours, RPO = 1 hour; tested quarterly with tabletop exercises"
    },
    {
      title: "Risk Culture Assessment",
      description: "Evaluating and transforming organizational risk culture for better outcomes",
      duration: "75 min",
      topics: ["Risk Culture Indicators", "Behavioral Risk Assessment", "Incentive Alignment", "Tone at the Top & Middle"],
      bestPractices: [
        "Conduct risk culture surveys annually",
        "Review incentive structures for risk conflicts",
        "Include risk metrics in performance reviews",
        "Promote speak-up culture and psychological safety",
        "Lead by example - walk the talk"
      ],
      industryExample: "Wells Fargo fake accounts scandal highlighted the dangers of misaligned incentives and weak risk culture"
    },
    {
      title: "Key Risk Indicators (KRIs)",
      description: "Designing and implementing effective early warning metrics",
      duration: "60 min",
      topics: ["Leading vs Lagging Indicators", "Threshold Setting", "KRI Dashboards", "Escalation Protocols"],
      bestPractices: [
        "Focus on leading indicators for early warning",
        "Set green-yellow-red thresholds with board input",
        "Review KRIs monthly, update annually",
        "Link KRIs to risk appetite statements",
        "Automate data collection where possible"
      ],
      industryExample: "Cybersecurity KRI: Unpatched critical vulnerabilities >30 days (Green <5, Yellow 5-10, Red >10)"
    },
    {
      title: "Risk-Based Audit Planning",
      description: "Using risk assessments to prioritize audit activities and optimize coverage",
      duration: "90 min",
      topics: ["Risk Universe Development", "Risk-Based Prioritization", "Audit Coverage Analysis", "Dynamic Audit Planning"],
      bestPractices: [
        "Update risk universe annually minimum",
        "Use risk scores + time since last audit",
        "Balance mandatory vs discretionary audits",
        "Maintain 3-year audit cycle for key risks",
        "Adjust plan quarterly based on risk changes"
      ],
      industryExample: "High-risk areas audited annually, medium-risk every 2-3 years, low-risk every 4-5 years"
    },
    {
      title: "Basel Operational Risk Framework",
      description: "Understanding Basel II/III operational risk requirements for financial institutions",
      duration: "120 min",
      topics: ["Basic Indicator Approach (BIA)", "Standardized Approach (TSA)", "Advanced Measurement Approach (AMA)", "Loss Data Collection"],
      bestPractices: [
        "Maintain comprehensive loss event database",
        "Categorize losses using Basel event types",
        "Calculate operational risk capital requirements",
        "Implement strong controls to reduce losses",
        "Report to regulators per requirements"
      ],
      industryExample: "Large banks use AMA with internal loss data, external data, scenario analysis, and business environment factors"
    },
    {
      title: "Model Risk Management",
      description: "Managing risks from financial and AI/ML models used in decision-making",
      duration: "90 min",
      topics: ["Model Inventory & Tiering", "Model Validation Process", "Backtesting & Performance Monitoring", "Model Governance Framework"],
      bestPractices: [
        "Maintain central model inventory",
        "Require independent validation for critical models",
        "Backtest model performance quarterly",
        "Document model limitations and assumptions",
        "Establish model risk committee"
      ],
      industryExample: "Credit risk models require annual validation, backtesting, and board-level reporting per SR 11-7"
    },
    {
      title: "Scenario Analysis & Stress Testing",
      description: "Designing and running scenario analysis and stress tests to assess tail risks",
      duration: "105 min",
      topics: ["Scenario Development", "Reverse Stress Testing", "Sensitivity Analysis", "CCAR/DFAST Requirements"],
      bestPractices: [
        "Develop plausible but severe scenarios",
        "Include multiple risk factors (correlation)",
        "Use reverse stress tests (what breaks us?)",
        "Document scenario rationale and assumptions",
        "Present results to board quarterly"
      ],
      industryExample: "2008 financial crisis scenario: 30% market decline, 50% real estate decline, 10% GDP contraction"
    }
  ];

  const resources = [
    {
      category: "Frameworks & Standards",
      items: [
        { name: "COSO ERM Framework (2017)", type: "PDF", description: "20 principles across 5 components for enterprise risk management", url: "#" },
        { name: "ISO 31000:2018 Risk Management", type: "Standard", description: "International standard for risk management principles and guidelines", url: "#" },
        { name: "NIST Risk Management Framework", type: "Guide", description: "7-step process for managing information security and privacy risk", url: "#" },
        { name: "FAIR Methodology", type: "Framework", description: "Factor Analysis of Information Risk for cyber risk quantification", url: "#" },
        { name: "Basel III Framework", type: "Standard", description: "International regulatory framework for banking risk management", url: "#" },
        { name: "COSO Internal Control (2013)", type: "Framework", description: "17 principles for effective internal control systems", url: "#" },
        { name: "IRM Risk Management Standard", type: "Guide", description: "UK Institute of Risk Management professional standards", url: "#" },
        { name: "ISO 27005 Information Security Risk", type: "Standard", description: "Guidelines for information security risk management", url: "#" }
      ]
    },
    {
      category: "Templates & Tools",
      items: [
        { name: "Risk Register Template", type: "Excel", description: "Comprehensive risk register with scoring, treatment plans, and KRIs", url: "#" },
        { name: "5×5 Risk Assessment Matrix", type: "Template", description: "Likelihood-impact matrix with color-coded heat map", url: "#" },
        { name: "Risk Report Template", type: "PowerPoint", description: "Executive dashboard for board-level risk reporting", url: "#" },
        { name: "Risk Appetite Statement", type: "Document", description: "Sample risk appetite framework with qualitative and quantitative statements", url: "#" },
        { name: "Bow-Tie Analysis Tool", type: "Excel", description: "Visual tool for analyzing threat, event, and consequences", url: "#" },
        { name: "KRI Dashboard Template", type: "Excel", description: "Key risk indicator tracking with thresholds and trend analysis", url: "#" },
        { name: "Risk Heat Map Generator", type: "Tool", description: "Automated heat map creation from risk data", url: "#" },
        { name: "RCSA Questionnaire", type: "Template", description: "Risk and control self-assessment survey template", url: "#" }
      ]
    },
    {
      category: "Best Practices & Guides",
      items: [
        { name: "Risk Culture Best Practices", type: "Guide", description: "IIF principles for building strong risk culture", url: "#" },
        { name: "Key Risk Indicators Library", type: "Database", description: "500+ KRIs across risk categories with benchmark data", url: "#" },
        { name: "Risk Taxonomy Standards", type: "Reference", description: "Standardized risk categorization across industries", url: "#" },
        { name: "Board Risk Reporting Guide", type: "Guide", description: "NACD principles for effective board risk oversight", url: "#" },
        { name: "Third-Party Risk Management", type: "Guide", description: "Shared assessments standardized information gathering", url: "#" },
        { name: "Operational Resilience Playbook", type: "Guide", description: "Building operational resilience per regulatory expectations", url: "#" },
        { name: "Model Risk Management Guide", type: "Guide", description: "SR 11-7 model validation and governance requirements", url: "#" },
        { name: "Stress Testing Handbook", type: "Guide", description: "Designing and executing enterprise stress tests", url: "#" }
      ]
    },
    {
      category: "Industry Benchmarks",
      items: [
        { name: "2024 Global Risk Report", type: "Report", description: "WEF annual report on global risk landscape", url: "#" },
        { name: "Verizon Data Breach Report", type: "Report", description: "Annual analysis of data breach incidents and trends", url: "#" },
        { name: "Operational Risk Data Exchange", type: "Database", description: "ORX international operational loss data consortium", url: "#" },
        { name: "Advisen Cyber Loss Data", type: "Database", description: "Cyber insurance claims and loss event database", url: "#" },
        { name: "AON Risk Maps", type: "Tool", description: "Global political and economic risk ratings by country", url: "#" },
        { name: "Cybersecurity Ventures Report", type: "Report", description: "Annual cybercrime cost and trend predictions", url: "#" }
      ]
    },
    {
      category: "Training & Certifications",
      items: [
        { name: "FRM - Financial Risk Manager", type: "Certification", description: "GARP certification for financial risk professionals", url: "#" },
        { name: "PRM - Professional Risk Manager", type: "Certification", description: "PRMIA international risk management certification", url: "#" },
        { name: "CRISC - Risk & IS Control", type: "Certification", description: "ISACA certification for IT and enterprise risk", url: "#" },
        { name: "CRM - Certified Risk Manager", type: "Certification", description: "National Alliance risk management certification", url: "#" },
        { name: "CRMA - Risk Management Assurance", type: "Certification", description: "IIA certification for risk-focused internal auditors", url: "#" },
        { name: "ERM Certificate Program", type: "Training", description: "RIMS executive education in enterprise risk management", url: "#" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="paths" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="paths">
            <Target className="h-4 w-4 mr-2" />
            Learning Paths
          </TabsTrigger>
          <TabsTrigger value="deepdives">
            <Brain className="h-4 w-4 mr-2" />
            Deep Dives
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="space-y-6">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" />
                Structured Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {learningPaths.map((path) => (
                  <Card
                    key={path.id}
                    className="bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/40 cursor-pointer transition-all"
                    onClick={() => setSelectedPath(path)}
                  >
                    <CardContent className="p-6">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${path.color}/20 w-fit mb-4`}>
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{path.title}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-indigo-500/20 text-indigo-400">{path.level}</Badge>
                        <Badge className="bg-slate-500/20 text-slate-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {path.duration}
                        </Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          {path.modules} modules
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">
                        Master {path.title.toLowerCase()} through structured learning
                      </p>
                      <Button 
                        onClick={() => {
                          setSelectedPath(path);
                          setLearningModalOpen(true);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedPath && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedPath.title} - Course Outline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                {selectedPath.topics.map((topic, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-400">{idx + 1}</span>
                    </div>
                    <span className="text-sm text-white">{topic}</span>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-slate-600" />
                </div>
                ))}
                </div>

                {selectedPath.keyTakeaways && (
                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <h4 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Key Takeaways
                </h4>
                <ul className="space-y-2">
                  {selectedPath.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
                </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deepdives" className="space-y-6">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Deep Dive Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {deepDives.map((dive, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white mb-2">{dive.title}</h3>
                          <p className="text-sm text-slate-400 mb-3">{dive.description}</p>
                          <Badge className="bg-purple-500/20 text-purple-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {dive.duration}
                          </Badge>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-2">Topics Covered:</p>
                        <div className="flex flex-wrap gap-2">
                          {dive.topics.map((topic, i) => (
                            <Badge key={i} className="bg-slate-500/10 text-slate-400 text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {dive.bestPractices && (
                        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-xs font-semibold text-emerald-400 mb-2">Industry Best Practices:</p>
                          <ul className="space-y-1">
                            {dive.bestPractices.map((practice, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>{practice}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dive.industryExample && (
                        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs font-semibold text-amber-400 mb-1">Industry Example:</p>
                          <p className="text-xs text-slate-300 italic">{dive.industryExample}</p>
                        </div>
                      )}
                      <Button 
                        onClick={() => setSelectedDeepDive(dive)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Deep Dive
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
                Resource Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {resources.map((category, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-semibold text-white mb-3">{category.category}</h3>
                    <div className="grid gap-2">
                      {category.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-emerald-500/40 cursor-pointer transition-all"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <BookOpen className="h-4 w-4 text-emerald-400 mt-1" />
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium mb-1">{item.name}</p>
                              <p className="text-xs text-slate-500 mb-1">{item.type}</p>
                              {item.description && (
                                <p className="text-xs text-slate-400">{item.description}</p>
                              )}
                            </div>
                          </div>
                          <Button 
                            onClick={() => toast.success(`Downloading ${item.name}...`)}
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ml-3"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
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
        </Tabs>

        {/* Learning Path Modal */}
        <Dialog open={learningModalOpen} onOpenChange={setLearningModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#1a2332] border-[#2a3548]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              {selectedPath?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedPath && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <Badge className="bg-indigo-500/20 text-indigo-400">{selectedPath.level}</Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedPath.duration}
                </span>
                <span>{selectedPath.modules} modules</span>
              </div>
              <p className="text-sm text-slate-300">{selectedPath.description}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Course Curriculum:</h4>
                {selectedPath.topics.map((topic, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-indigo-400">{idx + 1}</span>
                    </div>
                    <span className="text-sm text-slate-300">{topic}</span>
                  </div>
                ))}
              </div>
              {selectedPath.keyTakeaways && (
                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-400 mb-3">Key Takeaways:</h4>
                  <ul className="space-y-2">
                    {selectedPath.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button 
                onClick={() => {
                  toast.success(`Enrolled in ${selectedPath.title}!`);
                  setLearningModalOpen(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Enroll Now
              </Button>
            </div>
          )}
        </DialogContent>
        </Dialog>

        {/* Deep Dive Modal */}
        <Dialog open={!!selectedDeepDive} onOpenChange={() => setSelectedDeepDive(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#1a2332] border-[#2a3548]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              {selectedDeepDive?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedDeepDive && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {selectedDeepDive.duration}
                </Badge>
              </div>
              <p className="text-sm text-slate-300">{selectedDeepDive.description}</p>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Topics Covered:</h4>
                <div className="grid gap-2">
                  {selectedDeepDive.topics.map((topic, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedDeepDive.bestPractices && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3">Industry Best Practices:</h4>
                  <ul className="space-y-2">
                    {selectedDeepDive.bestPractices.map((practice, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 text-lg">✓</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDeepDive.industryExample && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-400 mb-2">Real-World Example:</h4>
                  <p className="text-sm text-slate-300 italic">{selectedDeepDive.industryExample}</p>
                </div>
              )}

              <Button 
                onClick={() => {
                  toast.success(`Started ${selectedDeepDive.title}!`);
                  setSelectedDeepDive(null);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Begin Session
              </Button>
            </div>
          )}
        </DialogContent>
        </Dialog>
        </div>
        );
        }