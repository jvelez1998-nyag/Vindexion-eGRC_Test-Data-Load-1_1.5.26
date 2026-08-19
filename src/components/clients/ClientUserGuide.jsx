import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Users, Sparkles, BarChart3, 
  AlertTriangle, CheckCircle2, MessageSquare, GraduationCap,
  FileText, Target, Shield, TrendingUp, Brain, Calendar,
  Search, PlayCircle, Download, ExternalLink, Rocket,
  Zap, Clock, Star, ChevronRight, Book, Video, Code, Plus, GitBranch
} from "lucide-react";

const GUIDE_SECTIONS = {
  gettingStarted: [
    {
      title: "Adding a New Client",
      content: `Click the "Add Client" button to manually create a client, or use "AI Onboarding" for guided setup with automatic risk assessment.

**Quick Steps:**
1. Enter basic client information (name, industry, type)
2. Add contact details
3. Set initial status and risk level
4. Save to create the client profile

**Pro Tip:** Use AI Onboarding for automated risk scoring and compliance baseline assessment.`,
      icon: Users
    },
    {
      title: "AI-Powered Onboarding",
      content: `The AI Onboarding wizard automates client setup with intelligent analysis:

**How It Works:**
1. Enter basic client info
2. AI analyzes industry risks and compliance requirements
3. Automatically calculates initial risk scores
4. Suggests applicable regulatory frameworks
5. Creates complete client profile

**Benefits:**
- Saves 70% of setup time
- Industry-specific risk intelligence
- Compliance framework recommendations
- Consistent assessment methodology`,
      icon: Sparkles
    },
    {
      title: "Understanding the Dashboard",
      content: `The Client Management dashboard provides real-time portfolio insights:

**Key Metrics:**
- Total clients and status breakdown
- Average risk and compliance scores
- Incident and finding counts
- Critical issues requiring attention

**Charts:**
- Client type distribution
- Risk level breakdown
- Status overview
- Monthly trends
- Portfolio maturity radar

**Actions:**
- Click any client card to view details
- Use filters to narrow your view
- Monitor at-risk clients`,
      icon: BarChart3
    }
  ],
  features: [
    {
      title: "Client Scorecard",
      content: `Comprehensive health metrics for each client:

**Overall Health Score:** Calculated from risk, compliance, controls, and security
**Key Metrics:**
- Compliance maturity (0-100)
- Risk score (0-100) 
- Control environment maturity
- Security posture assessment

**Maturity Radar:** Visual representation across 5 dimensions
**Issues Summary:** Critical issues, findings, and incidents at a glance`,
      icon: Target
    },
    {
      title: "AI Assessment Engine",
      content: `Run comprehensive AI-powered assessments:

**Assessment Covers:**
1. Risk evaluation with industry benchmarks
2. Compliance maturity assessment
3. Control environment review
4. Security posture analysis
5. Compliance gap identification
6. Strategic recommendations
7. Next review date calculation

**Output:** Complete assessment with scores, gaps, and actionable recommendations
**Apply:** One-click to update client profile with assessment results`,
      icon: Brain
    },
    {
      title: "Continuous Monitoring",
      content: `Track client health trends over time:

**Monitoring Features:**
- Real-time trend indicators (improving/declining/stable)
- 6-month historical performance charts
- Alert threshold tracking
- Scheduled review reminders
- Performance metric tracking

**Trend Analysis:**
- Risk score trends
- Compliance trajectory
- Control maturity progression
- Security posture evolution`,
      icon: TrendingUp
    },
    {
      title: "AI Analysis & Intelligence",
      content: `Advanced AI-driven portfolio intelligence:

**Analysis Types:**
1. Risk Intelligence - Patterns and predictions
2. Predictive Analytics - Future incident likelihood
3. Benchmark Analysis - Peer comparison
4. Strategic Recommendations - Prioritized actions
5. Resource Optimization - Where to focus efforts

**Outputs:**
- Health score calculation
- Key insights and opportunities
- Warning signs and red flags
- Actionable recommendations`,
      icon: Brain
    },
    {
      title: "Reporting Engine",
      content: `Generate professional client reports instantly:

**Report Types:**
- Executive Summary (C-level overview)
- Detailed Assessment (comprehensive analysis)
- Portfolio Comparison (benchmarking)
- Trend Analysis (historical performance)

**Features:**
- AI-generated content
- PDF export capability
- Email distribution
- Customizable templates`,
      icon: FileText
    },
    {
      title: "Engagement Scenarios",
      content: `AI-generated guides for client interactions:

**Scenario Types:**
1. Onboarding Kickoff - First meeting agenda
2. Quarterly Review - QBR preparation
3. Incident Response - Crisis communication
4. Risk Escalation - Handling critical situations
5. Improvement Planning - Growth roadmap

**Each Scenario Includes:**
- Meeting agenda
- Discussion points
- Stakeholder mapping
- Common objections
- Next steps and deliverables`,
      icon: MessageSquare
    },
    {
      title: "Questionnaire Library",
      content: `Pre-built assessment questionnaires:

**Available Templates:**
- Security Assessment (42 questions)
- Compliance Readiness (38 questions)
- Enterprise Risk (35 questions)
- Data Privacy (29 questions)
- Vendor Assessment (45 questions)
- Financial Controls (31 questions)

**Features:**
- Framework-mapped questions
- Difficulty ratings
- Send directly to clients
- Download as PDF`,
      icon: FileText
    },
    {
      title: "Advanced Visualizations",
      content: `Interactive analytics and charts:

**Visualization Types:**
1. Risk vs Compliance Scatter - Portfolio positioning
2. Industry Benchmarking - Peer comparison
3. Risk Distribution - Portfolio breakdown
4. Maturity Radar - Multi-dimensional view
5. Health Trends - Time-series analysis

**Insights:**
- Identify outliers
- Spot trends
- Compare across segments
- Track improvements`,
      icon: BarChart3
    },
    {
      title: "Deep Dive Analysis",
      content: `Forensic-level client investigation:

**Analysis Includes:**
- 360-degree risk analysis
- Compliance deep assessment
- Control environment investigation
- Security posture forensics
- Incident pattern analysis
- Financial impact assessment
- Strategic roadmap (30-60-90 days)
- Stakeholder engagement strategy

**Enhanced with:** External threat intelligence integration`,
      icon: Target
    }
  ],
  bestPractices: [
    {
      title: "Client Risk Assessment Best Practices",
      content: `**Frequency Guidelines:**
- High/Critical Risk: Monthly assessments
- Medium Risk: Quarterly assessments
- Low Risk: Semi-annual assessments

**Assessment Process:**
1. Review previous assessment results
2. Gather current metrics and data
3. Run AI assessment for objectivity
4. Validate with manual review
5. Document findings and gaps
6. Create action plan
7. Schedule follow-up

**Red Flags to Watch:**
- Increasing incident frequency
- Declining compliance scores
- Control failures
- Missed review dates
- Regulatory citations`,
      icon: AlertTriangle
    },
    {
      title: "Effective Client Communication",
      content: `**Communication Cadence:**
- Weekly: High-risk clients
- Bi-weekly: Medium-risk clients
- Monthly: Low-risk clients
- Quarterly: All clients (formal review)

**Communication Tips:**
1. Be proactive, not reactive
2. Use data to support recommendations
3. Speak to business impact, not just technical details
4. Provide solutions, not just problems
5. Document all communications

**Escalation Triggers:**
- Critical findings or incidents
- Compliance deadline misses
- Regulatory inquiries
- Significant risk score increases`,
      icon: MessageSquare
    },
    {
      title: "Portfolio Management Strategy",
      content: `**Risk-Based Prioritization:**
1. Critical risk clients - Daily monitoring
2. High risk clients - Weekly review
3. Medium risk clients - Bi-weekly check
4. Low risk clients - Monthly oversight

**Resource Allocation:**
- Allocate 60% of time to high-risk clients
- 30% to medium-risk clients
- 10% to low-risk and prospects

**Portfolio Health Indicators:**
- Average risk score trending down
- Compliance scores trending up
- Decreasing incident frequency
- Improving control maturity
- Positive client feedback`,
      icon: Users
    },
    {
      title: "Leveraging AI Features",
      content: `**AI Assessment Engine:**
- Run assessments quarterly minimum
- Use for consistent scoring methodology
- Apply recommendations to action plans
- Track AI suggestions vs manual findings

**AI Analysis:**
- Use for portfolio benchmarking
- Identify systemic issues across clients
- Predict future risks
- Optimize resource allocation

**Engagement Scenarios:**
- Prepare for difficult conversations
- Practice escalation protocols
- Standardize meeting agendas
- Improve stakeholder communication

**Deep Dive:**
- Use annually for strategic planning
- Before major renewals or contracts
- After significant incidents
- When transitioning relationship managers`,
      icon: Sparkles
    }
  ],
  workflows: [
    {
      title: "New Client Onboarding Workflow",
      content: `**Phase 1: Initial Setup (Week 1)**
1. Run AI Onboarding wizard
2. Review AI-generated risk scores
3. Schedule kickoff meeting
4. Send initial questionnaire

**Phase 2: Assessment (Weeks 2-3)**
1. Conduct initial assessment
2. Review compliance frameworks
3. Identify gaps and risks
4. Document findings

**Phase 3: Planning (Week 4)**
1. Create remediation roadmap
2. Set monitoring thresholds
3. Schedule regular reviews
4. Establish communication cadence

**Phase 4: Ongoing Management**
1. Continuous monitoring
2. Regular assessments
3. Quarterly business reviews
4. Annual strategic planning`,
      icon: CheckCircle2
    },
    {
      title: "Quarterly Business Review Process",
      content: `**2 Weeks Before:**
- Run AI Assessment
- Generate trend analysis
- Prepare QBR materials
- Schedule meeting

**1 Week Before:**
- Send pre-read materials
- Confirm stakeholder attendance
- Prepare presentation deck
- Review action items from last QBR

**During QBR:**
- Review performance metrics
- Discuss incidents and findings
- Present recommendations
- Agree on next quarter priorities
- Document decisions

**After QBR:**
- Send meeting summary
- Update client profile
- Create action items
- Schedule next review`,
      icon: Calendar
    },
    {
      title: "Incident Response Workflow",
      content: `**Immediate (0-24 hours):**
1. Acknowledge incident
2. Assess severity
3. Notify stakeholders
4. Begin investigation

**Short-term (1-7 days):**
1. Complete root cause analysis
2. Implement containment
3. Update risk scores
4. Communicate findings

**Medium-term (1-4 weeks):**
1. Execute remediation plan
2. Test controls
3. Document lessons learned
4. Update procedures

**Long-term (1-3 months):**
1. Monitor for recurrence
2. Validate effectiveness
3. Share best practices
4. Update risk profile`,
      icon: AlertTriangle
    }
  ]
};

const VIDEO_TUTORIALS = [
  { id: 1, title: "Getting Started with Client Management", duration: "5:30", category: "Basics" },
  { id: 2, title: "AI-Powered Onboarding Walkthrough", duration: "7:15", category: "Basics" },
  { id: 3, title: "Running Client Assessments", duration: "8:45", category: "Advanced" },
  { id: 4, title: "Understanding the Scorecard", duration: "6:20", category: "Basics" },
  { id: 5, title: "Portfolio Analytics & Benchmarking", duration: "9:30", category: "Advanced" },
  { id: 6, title: "Best Practices for QBRs", duration: "12:15", category: "Best Practices" }
];

const QUICK_ACTIONS = [
  { label: "Add First Client", icon: Plus, color: "emerald" },
  { label: "Run AI Assessment", icon: Brain, color: "purple" },
  { label: "View Dashboard", icon: BarChart3, color: "blue" },
  { label: "Generate Report", icon: FileText, color: "cyan" }
];

export default function ClientUserGuide() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filterContent = (sections) => {
    if (!searchQuery && selectedCategory === "all") return sections;
    return sections.filter(section => {
      const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           section.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent mb-1">
                  Client Management Mastery Guide
                </h1>
                <p className="text-slate-300 text-sm mb-3">Complete platform reference • Video tutorials • Best practices • Workflows</p>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Star className="h-3 w-3 mr-1" />
                    Expert Level
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <Clock className="h-3 w-3 mr-1" />
                    30 min read
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Video className="h-3 w-3 mr-1" />
                    6 videos
                  </Badge>
                </div>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search the guide..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Quick Start</span>
              </div>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Begin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="getting-started" className="w-full">
        <div className="overflow-x-auto scrollbar-thin">
          <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1 inline-flex gap-1">
            <TabsTrigger value="getting-started" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Rocket className="h-4 w-4 mr-2" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <Zap className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <Video className="h-4 w-4 mr-2" />
              Video Tutorials
            </TabsTrigger>
            <TabsTrigger value="best-practices" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Star className="h-4 w-4 mr-2" />
              Best Practices
            </TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              <GitBranch className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="examples" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300">
              <Code className="h-4 w-4 mr-2" />
              Examples
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="getting-started" className="mt-4 space-y-4">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Card key={idx} className={`bg-gradient-to-br from-${action.color}-500/10 to-${action.color}-500/5 border-${action.color}-500/20 hover:scale-105 transition-all cursor-pointer group`}>
                  <CardContent className="p-4 text-center">
                    <Icon className={`h-6 w-6 mx-auto mb-2 text-${action.color}-400`} />
                    <p className="text-xs font-medium text-white">{action.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <ScrollArea className="h-[550px]">
            <div className="space-y-3 pr-4">
              {filterContent(GUIDE_SECTIONS.gettingStarted).map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/40 transition-all group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-emerald-500/10">
                            <Icon className="h-4 w-4 text-emerald-400" />
                          </div>
                          {section.title}
                        </CardTitle>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Essential</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <ScrollArea className="h-[650px]">
            <Accordion type="single" collapsible className="space-y-2 pr-4">
              {filterContent(GUIDE_SECTIONS.features).map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-blue-500/40 transition-all">
                    <AccordionItem value={`feature-${idx}`} className="border-0">
                      <AccordionTrigger className="px-4 pt-4 pb-2 hover:no-underline group">
                        <div className="flex items-center gap-3 text-white">
                          <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                            <Icon className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="text-left flex-1">
                            <span className="font-semibold">{section.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500 group-data-[state=open]:rotate-90 transition-transform" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="ml-12 p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                          <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                            {section.content}
                          </div>
                          <div className="mt-4 pt-4 border-t border-[#2a3548] flex items-center gap-2">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Try Feature
                            </Button>
                            <Button size="sm" variant="ghost" className="text-slate-400">
                              <PlayCircle className="h-3 w-3 mr-1" />
                              Watch Demo
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                );
              })}
            </Accordion>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="videos" className="mt-4">
          <ScrollArea className="h-[650px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {VIDEO_TUTORIALS.map((video) => (
                <Card key={video.id} className="bg-[#1a2332] border-[#2a3548] hover:border-purple-500/40 transition-all group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      <PlayCircle className="h-16 w-16 text-white opacity-80 group-hover:scale-110 transition-transform" />
                      <Badge className="absolute top-2 right-2 bg-black/50 text-white text-xs">
                        {video.duration}
                      </Badge>
                    </div>
                    <Badge className="mb-2 bg-purple-500/20 text-purple-400 text-xs">
                      {video.category}
                    </Badge>
                    <h4 className="text-sm font-semibold text-white mb-2">{video.title}</h4>
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                      <PlayCircle className="h-3 w-3 mr-2" />
                      Watch Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="best-practices" className="mt-4">
          <ScrollArea className="h-[650px]">
            <div className="space-y-3 pr-4">
              {filterContent(GUIDE_SECTIONS.bestPractices).map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-amber-500/40 transition-all group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                            <Icon className="h-5 w-5 text-amber-400" />
                          </div>
                          {section.title}
                        </CardTitle>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          <Star className="h-3 w-3 mr-1" />
                          Pro Tip
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <ScrollArea className="h-[650px]">
            <div className="space-y-3 pr-4">
              {filterContent(GUIDE_SECTIONS.workflows).map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-cyan-500/40 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-cyan-500/10">
                            <Icon className="h-5 w-5 text-cyan-400" />
                          </div>
                          {section.title}
                        </CardTitle>
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                          <Download className="h-3 w-3 mr-1" />
                          Template
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                          {section.content}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="examples" className="mt-4">
          <ScrollArea className="h-[650px]">
            <div className="space-y-4 pr-4">
              <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="h-5 w-5 text-rose-400" />
                    Practical Examples
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Card className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Example 1: Onboarding a High-Risk Client</h4>
                      <p className="text-xs text-slate-400 mb-3">Step-by-step walkthrough of onboarding a financial services client with critical risk factors.</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-700">View Example</Button>
                        <Button size="sm" variant="ghost" className="text-slate-400">Copy Template</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Example 2: Conducting a Quarterly Business Review</h4>
                      <p className="text-xs text-slate-400 mb-3">Complete QBR template with metrics, slides, and discussion guide.</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-700">View Example</Button>
                        <Button size="sm" variant="ghost" className="text-slate-400">Copy Template</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Example 3: Managing an Incident with Client</h4>
                      <p className="text-xs text-slate-400 mb-3">Real-world scenario showing incident response workflow and communication.</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-700">View Example</Button>
                        <Button size="sm" variant="ghost" className="text-slate-400">Copy Template</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Example 4: Portfolio-Wide Risk Analysis</h4>
                      <p className="text-xs text-slate-400 mb-3">How to analyze patterns across your entire client portfolio and identify systemic issues.</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-700">View Example</Button>
                        <Button size="sm" variant="ghost" className="text-slate-400">Copy Template</Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Footer Help Section */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-white">Need Additional Help?</p>
                <p className="text-xs text-slate-400">Access support resources and community forums</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-slate-400">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Book className="h-4 w-4 mr-2" />
                View Full Docs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}