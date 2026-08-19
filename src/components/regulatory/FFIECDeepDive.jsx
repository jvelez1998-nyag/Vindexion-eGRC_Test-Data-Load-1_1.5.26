import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Layers, AlertTriangle, Scale, Users, Building, Lock, FileCheck, Zap, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

const deepDiveTopics = [
  {
    id: "cybersecurity-cat",
    title: "Cybersecurity Assessment Tool (CAT)",
    icon: Shield,
    color: "blue",
    overview: "The FFIEC Cybersecurity Assessment Tool helps institutions identify risks and determine cybersecurity maturity.",
    sections: [
      {
        title: "Inherent Risk Profile",
        content: `## Understanding Inherent Risk

The Inherent Risk Profile assesses risks from:
- **Technologies & Connection Types**: Internet banking, mobile, cloud services
- **Delivery Channels**: Online, mobile, telephone banking
- **Online/Mobile Products & Services**: Account opening, bill pay, remote deposit
- **Organizational Characteristics**: Asset size, complexity, geographic footprint
- **External Threats**: Threat intelligence, attack trends

### Risk Categories
- **Least**: Minimal technology adoption, low complexity
- **Minimal**: Limited online services, basic technology
- **Moderate**: Standard banking technology, moderate complexity
- **Significant**: Advanced services, higher complexity
- **Most**: Extensive digital services, high complexity`,
        keyPoints: ["Risk assessment methodology", "Category determination", "Documentation requirements"]
      },
      {
        title: "Cybersecurity Maturity",
        content: `## Maturity Assessment

Five maturity levels across five domains:

### Domains
1. **Cyber Risk Management & Oversight**
2. **Threat Intelligence & Collaboration**
3. **Cybersecurity Controls**
4. **External Dependency Management**
5. **Cyber Incident Management & Resilience**

### Maturity Levels
- **Baseline**: Foundational practices
- **Evolving**: Risk-informed practices
- **Intermediate**: Integrated, repeatable practices
- **Advanced**: Adaptive, innovative practices
- **Innovative**: Industry-leading practices`,
        keyPoints: ["Domain assessment", "Maturity progression", "Gap analysis"]
      },
      {
        title: "Declarative Statements",
        content: `## Using Declarative Statements

200+ declarative statements help assess cybersecurity controls:

### Example Statements
- "Management ensures the board receives timely information"
- "The institution identifies internal and external threats"
- "Security controls are implemented based on risk assessment"
- "Incident response procedures are tested regularly"

### Assessment Process
1. Review each statement
2. Determine current state (Yes/No/Partial)
3. Identify gaps
4. Develop action plans
5. Track progress`,
        keyPoints: ["Statement evaluation", "Gap identification", "Action planning"]
      }
    ]
  },
  {
    id: "bsa-aml",
    title: "Bank Secrecy Act / Anti-Money Laundering",
    icon: Scale,
    color: "violet",
    overview: "Comprehensive BSA/AML compliance requirements for financial institutions.",
    sections: [
      {
        title: "Customer Identification Program (CIP)",
        content: `## CIP Requirements

Financial institutions must establish a Customer Identification Program:

### Minimum Requirements
- **Name**: Legal name of customer
- **Date of Birth**: For individuals
- **Address**: Residential or business street address
- **Identification Number**: TIN, SSN, EIN, or passport number

### Verification Methods
- Documentary (ID cards, passports, driver's licenses)
- Non-documentary (credit reports, third-party verification)

### Special Considerations
- Foreign persons
- Legal entities
- Trust accounts
- Politically Exposed Persons (PEPs)`,
        keyPoints: ["Documentation requirements", "Verification methods", "Special cases"]
      },
      {
        title: "Customer Due Diligence (CDD)",
        content: `## Enhanced Due Diligence

CDD Rule requires understanding:

### Core Elements
1. **Identify and verify customer identity**
2. **Identify and verify beneficial owners** (25%+ ownership or control)
3. **Understand nature and purpose** of customer relationships
4. **Conduct ongoing monitoring** for suspicious activity

### Risk-Based Approach
- **Low Risk**: Standard CDD procedures
- **Medium Risk**: Enhanced monitoring
- **High Risk**: Enhanced due diligence, senior management approval

### Red Flags
- Unusual transaction patterns
- Structuring to avoid reporting
- Reluctance to provide information
- Business model doesn't make sense`,
        keyPoints: ["Beneficial ownership", "Risk assessment", "Red flags"]
      },
      {
        title: "Suspicious Activity Reporting (SAR)",
        content: `## SAR Filing Requirements

### When to File
File within 30 days if:
- Transaction involves $5,000+ (insider abuse or violations)
- Transaction involves $25,000+ (other suspicious activity)
- No suspect identified: 60 days to file

### SAR Categories
- **Money Laundering**: Structuring, layering, integration
- **Fraud**: Check, wire, mortgage, identity theft
- **Terrorist Financing**: Fundraising, transfers
- **Other**: Cybercrime, elder abuse, etc.

### Documentation
- Narrative description
- Supporting documentation
- Involved parties
- Timeline of events
- Financial analysis`,
        keyPoints: ["Filing thresholds", "SAR categories", "Documentation"]
      }
    ]
  },
  {
    id: "tprm",
    title: "Third-Party Risk Management",
    icon: Users,
    color: "emerald",
    overview: "Managing risks from third-party relationships and service providers.",
    sections: [
      {
        title: "Due Diligence Process",
        content: `## Third-Party Due Diligence

### Pre-Contract Phase
- **Risk Assessment**: Criticality and inherent risk
- **Vendor Research**: Background, reputation, financial stability
- **Security Review**: Controls, certifications (SOC 2, ISO 27001)
- **Legal Review**: Contract terms, SLAs, liability

### Key Areas to Assess
- Information security program
- Business continuity and disaster recovery
- Compliance and regulatory history
- Subcontracting arrangements
- Geographic locations
- Financial stability

### Red Flags
- Reluctance to provide documentation
- Lack of certifications or audits
- Recent security incidents
- Poor financial health
- Offshore data storage (without disclosure)`,
        keyPoints: ["Due diligence steps", "Assessment areas", "Warning signs"]
      },
      {
        title: "Contract Requirements",
        content: `## Essential Contract Elements

### Performance Standards
- Service level agreements (SLAs)
- Response time requirements
- Uptime guarantees
- Error rates

### Security & Compliance
- Security controls requirements
- Compliance with regulations
- Right to audit
- Incident notification
- Data encryption standards

### Business Continuity
- Disaster recovery obligations
- Backup requirements
- Failover capabilities
- Testing requirements

### Exit Strategy
- Data return/destruction
- Transition assistance
- Intellectual property rights
- Post-termination support`,
        keyPoints: ["SLA requirements", "Security clauses", "Exit planning"]
      },
      {
        title: "Ongoing Monitoring",
        content: `## Continuous Oversight

### Monitoring Activities
- **Performance Monitoring**: SLA compliance, error rates
- **Security Monitoring**: Vulnerability scans, penetration testing
- **Compliance Monitoring**: Regulatory changes, audit reports
- **Financial Monitoring**: Financial statements, credit reports

### Review Frequency
- **Critical Services**: Quarterly or more frequent
- **High Risk**: Semi-annually
- **Medium Risk**: Annually
- **Low Risk**: Every 2-3 years

### Documentation
- Performance metrics
- Security incidents
- Audit results
- Remediation tracking
- Management reports`,
        keyPoints: ["Monitoring activities", "Review schedule", "Documentation"]
      }
    ]
  },
  {
    id: "information-security",
    title: "Information Security Program",
    icon: Lock,
    color: "amber",
    overview: "Comprehensive information security program requirements under GLBA and FFIEC guidance.",
    sections: [
      {
        title: "Risk Assessment",
        content: `## Security Risk Assessment

### Assessment Components
1. **Identify Information Assets**: Customer data, systems, networks
2. **Identify Threats**: Internal, external, natural disasters
3. **Assess Vulnerabilities**: Technical, physical, administrative
4. **Determine Likelihood & Impact**: Risk rating methodology
5. **Document Results**: Risk register, executive summary

### Asset Classification
- **Critical**: Core banking systems, customer PII
- **Important**: Supporting systems, internal data
- **Standard**: General business systems

### Threat Sources
- Cyber attackers (external)
- Malicious insiders
- Human error
- System failures
- Natural disasters

### Risk Ratings
- **Critical**: Immediate action required
- **High**: Address within 30 days
- **Medium**: Address within 90 days
- **Low**: Address as resources permit`,
        keyPoints: ["Risk assessment process", "Asset classification", "Threat identification"]
      },
      {
        title: "Security Controls",
        content: `## Implementing Security Controls

### Access Controls
- Multi-factor authentication
- Role-based access control (RBAC)
- Principle of least privilege
- Periodic access reviews
- Privileged access management

### Network Security
- Firewalls and IDS/IPS
- Network segmentation
- DMZ for external services
- VPN for remote access
- DDoS protection

### Data Protection
- Encryption at rest and in transit
- Data loss prevention (DLP)
- Secure data disposal
- Backup and recovery
- Database activity monitoring

### Endpoint Security
- Antivirus/anti-malware
- Endpoint detection and response (EDR)
- Patch management
- Mobile device management (MDM)
- Application whitelisting`,
        keyPoints: ["Control categories", "Implementation priorities", "Layered defense"]
      },
      {
        title: "Incident Response",
        content: `## Incident Response Program

### IR Plan Components
1. **Preparation**: Tools, training, communication plans
2. **Detection & Analysis**: Monitoring, triage, classification
3. **Containment**: Isolation, evidence preservation
4. **Eradication**: Remove threat, patch vulnerabilities
5. **Recovery**: Restore systems, validate integrity
6. **Post-Incident**: Lessons learned, improvements

### Incident Classification
- **Level 1 (Critical)**: Material impact, data breach, ransomware
- **Level 2 (High)**: Significant impact, contained compromise
- **Level 3 (Medium)**: Limited impact, suspicious activity
- **Level 4 (Low)**: Minimal impact, policy violation

### Notification Requirements
- Board of directors (material incidents)
- Regulators (within specified timeframes)
- Law enforcement (criminal activity)
- Affected customers (data breaches)
- Business partners (shared services)`,
        keyPoints: ["IR phases", "Incident classification", "Notification"]
      }
    ]
  }
];

export default function FFIECDeepDive() {
  const [selectedTopic, setSelectedTopic] = useState(deepDiveTopics[0]);
  const [selectedSection, setSelectedSection] = useState(0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <Layers className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">FFIEC Deep Dive</h2>
              <p className="text-xs text-slate-400">Comprehensive technical guidance for regulatory examinations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Topic Selector */}
        <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deepDiveTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Button
                  key={topic.id}
                  variant={selectedTopic.id === topic.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    selectedTopic.id === topic.id 
                      ? `bg-${topic.color}-500/20 text-${topic.color}-400 hover:bg-${topic.color}-500/30` 
                      : 'text-slate-300 hover:bg-[#0f1623]'
                  }`}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setSelectedSection(0);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-xs">{topic.title}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Topic Overview */}
          <Card className={`bg-gradient-to-r from-${selectedTopic.color}-500/10 to-${selectedTopic.color}-500/5 border-${selectedTopic.color}-500/20`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-${selectedTopic.color}-500/20 border border-${selectedTopic.color}-500/30`}>
                  <selectedTopic.icon className={`h-6 w-6 text-${selectedTopic.color}-400`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">{selectedTopic.title}</h2>
                  <p className="text-sm text-slate-300">{selectedTopic.overview}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-4">
                {/* Section Nav */}
                <div className="lg:col-span-1 border-r border-[#2a3548] p-4 space-y-2">
                  {selectedTopic.sections.map((section, idx) => (
                    <Button
                      key={idx}
                      variant={selectedSection === idx ? "default" : "ghost"}
                      className={`w-full justify-between text-left ${
                        selectedSection === idx 
                          ? 'bg-indigo-500/20 text-indigo-400' 
                          : 'text-slate-300 hover:bg-[#0f1623]'
                      }`}
                      onClick={() => setSelectedSection(idx)}
                    >
                      <span className="text-xs">{section.title}</span>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  ))}
                </div>

                {/* Section Content */}
                <ScrollArea className="lg:col-span-3 h-[600px]">
                  <div className="p-6">
                    <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                      {selectedTopic.sections[selectedSection].content}
                    </ReactMarkdown>
                    
                    <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-400" />
                        Key Takeaways
                      </h4>
                      <ul className="space-y-1">
                        {selectedTopic.sections[selectedSection].keyPoints.map((point, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                            <FileCheck className="h-3 w-3 text-blue-400" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}