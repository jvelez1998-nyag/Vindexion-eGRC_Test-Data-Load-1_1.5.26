import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Lock, Shield, FileText, 
  AlertTriangle, CheckCircle2, Brain, Settings,
  Target, TrendingUp, MessageSquare, Workflow
} from "lucide-react";

const GUIDE_SECTIONS = {
  gettingStarted: [
    {
      title: "Creating Privacy Assessments",
      content: `Click "New Assessment" to start a privacy impact assessment.

**Quick Steps:**
1. Enter assessment title and description
2. Select assessment type (PIA, DPIA, etc.)
3. Choose applicable regulations
4. Define data processing activities
5. Assess privacy risks
6. Generate recommendations

**Pro Tip:** Use the AI-powered builder for automated risk scoring and regulatory guidance.`,
      icon: FileText
    },
    {
      title: "Understanding Privacy Frameworks",
      content: `The platform supports multiple privacy regulations:

**Supported Frameworks:**
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- HIPAA (Health Insurance Portability)
- PIPEDA (Personal Information Protection)
- LGPD (Brazilian Data Protection Law)

**Framework Selection:**
- Choose based on jurisdiction
- Multiple frameworks can apply
- Auto-mapping to requirements
- Built-in compliance checklists`,
      icon: Shield
    },
    {
      title: "Privacy Risk Assessment Dashboard",
      content: `Monitor your privacy program health:

**Key Metrics:**
- Total assessments and status
- Privacy risk distribution
- Compliance gaps identified
- Data processing activities tracked

**Visual Analytics:**
- Risk heatmaps
- Compliance trends
- Assessment status breakdown
- Regulatory coverage

**Actions:**
- Filter by regulation or risk level
- Export reports for stakeholders
- Track remediation progress`,
      icon: Target
    }
  ],
  features: [
    {
      title: "AI Privacy Assessment Builder",
      content: `Automated privacy impact assessment creation:

**AI Capabilities:**
1. Data flow analysis
2. Risk identification and scoring
3. Legal basis determination
4. Retention period recommendations
5. Security measure suggestions
6. DPIA necessity evaluation
7. Transfer mechanism guidance
8. Consent requirement analysis

**Output:** Complete assessment with risks, controls, and compliance mapping

**Benefits:**
- Saves 80% of manual effort
- Consistent methodology
- Regulatory intelligence
- Best practice recommendations`,
      icon: Brain
    },
    {
      title: "Privacy Regulation Library",
      content: `Comprehensive regulatory guidance database:

**Library Features:**
- Searchable regulation database
- Article-by-article guidance
- Practical implementation tips
- Evidence requirements
- Penalty information
- Case law references

**Covered Regulations:**
- GDPR (99 articles)
- CCPA/CPRA provisions
- HIPAA Privacy Rule
- PIPEDA principles
- State privacy laws
- Industry-specific rules

**Search:** By keyword, article number, or requirement type`,
      icon: BookOpen
    },
    {
      title: "Privacy Simulator",
      content: `Interactive scenario training:

**Simulation Types:**
1. Data Subject Requests (DSR)
2. Data Breach Response
3. Privacy by Design Reviews
4. Vendor Assessment
5. Consent Management
6. International Transfer

**Features:**
- Realistic scenarios
- Time-pressure simulation
- Decision consequences
- Scoring and feedback
- Best practice comparison
- Certificate of completion`,
      icon: Settings
    },
    {
      title: "Study Guide & Learning",
      content: `Structured privacy training content:

**Learning Modules:**
- Privacy fundamentals
- Regulation deep-dives
- Risk assessment techniques
- Data mapping methodologies
- Breach response procedures
- Privacy by design principles

**Interactive Elements:**
- Knowledge checks
- Case studies
- Practical exercises
- Expert tips
- Common pitfalls`,
      icon: BookOpen
    },
    {
      title: "Workflow Automation",
      content: `Automate privacy operations:

**Automated Workflows:**
1. DSR intake and routing
2. Assessment scheduling
3. Compliance monitoring
4. Breach notification
5. Vendor reviews
6. Training reminders

**Triggers:**
- Date-based (review cycles)
- Event-based (new processing)
- Risk-based (threshold breach)
- Regulatory (law changes)

**Actions:**
- Create tasks
- Send notifications
- Update records
- Generate reports`,
      icon: Workflow
    },
    {
      title: "Privacy Risk & Controls",
      content: `Link privacy risks to mitigating controls:

**Risk Categories:**
- Unauthorized access
- Data breaches
- Unlawful processing
- Inadequate retention
- Transfer violations
- Consent failures

**Control Types:**
- Technical safeguards
- Organizational measures
- Legal mechanisms
- Procedural controls

**Integration:** Links to main risk register and control library`,
      icon: Shield
    },
    {
      title: "Data Processing Registry",
      content: `Maintain GDPR-compliant processing records:

**Registry Features:**
- Processing activity catalog
- Data flow mapping
- Legal basis tracking
- Retention schedules
- Transfer documentation
- Controller/processor roles

**GDPR Article 30:**
Automatically generates compliant Records of Processing Activities (ROPA)`,
      icon: FileText
    },
    {
      title: "Privacy Prioritization",
      content: `AI-driven priority ranking:

**Prioritization Factors:**
- Data sensitivity
- Processing volume
- Regulatory penalties
- Reputational impact
- Likelihood of harm
- Remediation complexity

**Output:**
- Ranked action list
- Resource allocation guidance
- Timeline recommendations
- Quick wins identification`,
      icon: Target
    }
  ],
  bestPractices: [
    {
      title: "Privacy Assessment Best Practices",
      content: `**When to Conduct PIAs:**
- New data processing activities
- Significant changes to existing processing
- Technology implementations
- Vendor engagements
- High-risk processing (required for DPIA)

**Assessment Process:**
1. Map data flows
2. Identify legal basis
3. Assess privacy risks
4. Define mitigating controls
5. Document decisions
6. Obtain approvals
7. Review annually

**DPIA Triggers (GDPR):**
- Systematic monitoring
- Large-scale sensitive data
- Public area monitoring
- Automated decision-making
- Profiling with legal effects`,
      icon: AlertTriangle
    },
    {
      title: "Data Subject Rights Management",
      content: `**Handling DSRs Effectively:**

**Response Timelines:**
- GDPR: 30 days (extendable to 60)
- CCPA: 45 days (extendable to 90)
- HIPAA: 30-60 days

**Best Practices:**
1. Verify requestor identity
2. Log all requests
3. Search all systems
4. Validate before deletion
5. Document decisions
6. Communicate clearly
7. Track metrics

**Common Requests:**
- Access (most common)
- Deletion/erasure
- Rectification
- Portability
- Restriction of processing
- Objection to processing`,
      icon: MessageSquare
    },
    {
      title: "Data Breach Response",
      content: `**Breach Notification Requirements:**

**GDPR Timelines:**
- Supervisory authority: 72 hours
- Affected individuals: Without undue delay

**Response Steps:**
1. Contain the breach (immediate)
2. Assess the risk (0-24 hours)
3. Notify authority if required (72 hours)
4. Notify individuals if high risk
5. Document everything
6. Investigate root cause
7. Implement improvements

**When to Notify:**
- High risk to rights and freedoms
- Sensitive data exposed
- Large number of individuals
- Financial harm likely
- Identity theft risk`,
      icon: AlertTriangle
    },
    {
      title: "International Data Transfers",
      content: `**Transfer Mechanisms:**

**GDPR-Approved Methods:**
1. Adequacy decisions (easiest)
2. Standard Contractual Clauses (SCCs)
3. Binding Corporate Rules (BCRs)
4. Certifications (e.g., EU-US Data Privacy Framework)
5. Codes of conduct
6. Derogations (limited use)

**Transfer Assessment:**
- Identify all transfers
- Document legal basis
- Assess third country protections
- Implement supplementary measures
- Review regularly

**Post-Schrems II:**
- Conduct transfer impact assessments
- Evaluate local laws
- Consider encryption
- Review data localization options`,
      icon: TrendingUp
    },
    {
      title: "Privacy by Design Integration",
      content: `**7 Foundational Principles:**
1. Proactive not reactive
2. Privacy as default
3. Privacy embedded in design
4. Full functionality (positive-sum)
5. End-to-end security
6. Visibility and transparency
7. User-centric

**Implementation:**
- Privacy in project planning
- Privacy requirements in specs
- Privacy in vendor selection
- Privacy in testing
- Privacy in deployment
- Privacy in monitoring

**Integration Points:**
- Software development lifecycle
- Change management
- Vendor management
- IT procurement
- Business process design`,
      icon: Settings
    }
  ],
  workflows: [
    {
      title: "Privacy Impact Assessment (PIA) Workflow",
      content: `**Phase 1: Planning (Days 1-3)**
1. Define scope and objectives
2. Identify stakeholders
3. Map data flows
4. Gather documentation

**Phase 2: Assessment (Days 4-10)**
1. Analyze data processing
2. Identify privacy risks
3. Determine legal basis
4. Evaluate necessity and proportionality
5. Assess security measures

**Phase 3: Mitigation (Days 11-15)**
1. Design risk controls
2. Document decisions
3. Consult DPO if required
4. Obtain approvals

**Phase 4: Documentation (Days 16-20)**
1. Complete PIA report
2. Create executive summary
3. Update processing records
4. Archive documentation

**Phase 5: Review**
- Annual reviews minimum
- Review on significant changes
- Monitor effectiveness`,
      icon: FileText
    },
    {
      title: "Data Breach Response Workflow",
      content: `**Phase 1: Detection & Containment (0-4 hours)**
1. Confirm the breach
2. Activate response team
3. Contain the incident
4. Preserve evidence

**Phase 2: Assessment (4-24 hours)**
1. Determine scope
2. Identify affected data
3. Count affected individuals
4. Assess risk level
5. Determine notification requirements

**Phase 3: Notification (24-72 hours)**
1. Notify supervisory authority (if required)
2. Notify affected individuals (if high risk)
3. Notify partners/vendors
4. Prepare public statement (if needed)

**Phase 4: Investigation (Ongoing)**
1. Root cause analysis
2. Document timeline
3. Identify control failures
4. Assess regulatory exposure

**Phase 5: Remediation (1-4 weeks)**
1. Implement fixes
2. Strengthen controls
3. Update procedures
4. Conduct lessons learned
5. Follow-up with authorities`,
      icon: AlertTriangle
    },
    {
      title: "Vendor Privacy Assessment Workflow",
      content: `**Phase 1: Due Diligence (Week 1)**
1. Send privacy questionnaire
2. Review privacy policy
3. Check certifications
4. Assess sub-processors
5. Evaluate data location

**Phase 2: Risk Assessment (Week 2)**
1. Score privacy risks
2. Identify gaps
3. Determine legal basis
4. Assess transfer mechanisms
5. Review security controls

**Phase 3: Contracting (Week 3)**
1. Draft Data Processing Agreement (DPA)
2. Include SCCs if needed
3. Define security requirements
4. Set audit rights
5. Agree breach notification terms

**Phase 4: Ongoing Management**
1. Annual reassessment
2. Monitor compliance
3. Review sub-processor changes
4. Audit if needed
5. Renew contracts`,
      icon: CheckCircle2
    }
  ]
};

export default function PrivacyUserGuide() {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Privacy Assessment User Guide</h3>
              <p className="text-xs text-slate-400">Complete reference for privacy management</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="getting-started" className="w-full">
        <TabsList className="bg-[#151d2e] border border-[#2a3548] grid grid-cols-3 w-full">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {GUIDE_SECTIONS.gettingStarted.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <Icon className="h-4 w-4 text-purple-400" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-sm text-slate-300 whitespace-pre-line">
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
          <ScrollArea className="h-[600px]">
            <Accordion type="single" collapsible className="space-y-2 pr-4">
              {GUIDE_SECTIONS.features.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <AccordionItem value={`feature-${idx}`} className="border-0">
                      <AccordionTrigger className="px-4 pt-4 pb-2 hover:no-underline">
                        <div className="flex items-center gap-2 text-white">
                          <Icon className="h-4 w-4 text-purple-400" />
                          <span className="font-semibold">{section.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="text-sm text-slate-300 whitespace-pre-line">
                          {section.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                );
              })}
            </Accordion>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="best-practices" className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {GUIDE_SECTIONS.bestPractices.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <Icon className="h-4 w-4 text-emerald-400" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-sm text-slate-300 whitespace-pre-line">
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
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {GUIDE_SECTIONS.workflows.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-400" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-sm text-slate-300 whitespace-pre-line">
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
      </Tabs>
    </div>
  );
}