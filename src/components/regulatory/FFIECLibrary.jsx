import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, FileText, ClipboardList, ExternalLink, Download } from "lucide-react";

const ffiecWorkbooks = [
  {
    id: "architecture",
    title: "Architecture and Infrastructure",
    category: "IT Examination Handbook",
    description: "Guidance on evaluating IT architecture, infrastructure design, capacity planning, and technology standards in financial institutions.",
    topics: ["System Architecture", "Network Infrastructure", "Capacity Planning", "Technology Standards", "Infrastructure Security"],
    lastUpdated: "2024",
    url: "https://ithandbook.ffiec.gov/it-booklets/architecture-infrastructure-and-operations.aspx"
  },
  {
    id: "audit",
    title: "Audit",
    category: "IT Examination Handbook",
    description: "Standards for internal and external audits of information systems, including audit planning, execution, and reporting.",
    topics: ["Audit Planning", "Risk Assessment", "Control Testing", "Audit Documentation", "Findings Reporting"],
    lastUpdated: "2023",
    url: "https://ithandbook.ffiec.gov/it-booklets/audit.aspx"
  },
  {
    id: "business-continuity",
    title: "Business Continuity Planning",
    category: "IT Examination Handbook",
    description: "Requirements for business continuity planning, disaster recovery, and resilience testing in financial services.",
    topics: ["BCP Development", "Disaster Recovery", "Testing Programs", "Crisis Management", "Recovery Strategies"],
    lastUpdated: "2024",
    url: "https://ithandbook.ffiec.gov/it-booklets/business-continuity-planning.aspx"
  },
  {
    id: "development",
    title: "Development and Acquisition",
    category: "IT Examination Handbook",
    description: "Guidance on system development lifecycle, vendor management, and secure acquisition of technology solutions.",
    topics: ["SDLC", "Vendor Management", "Change Management", "System Integration", "Quality Assurance"],
    lastUpdated: "2023",
    url: "https://ithandbook.ffiec.gov/it-booklets/development-and-acquisition.aspx"
  },
  {
    id: "information-security",
    title: "Information Security",
    category: "IT Examination Handbook",
    description: "Comprehensive information security standards covering governance, risk management, and security controls.",
    topics: ["Security Governance", "Access Control", "Encryption", "Incident Response", "Security Testing"],
    lastUpdated: "2024",
    url: "https://ithandbook.ffiec.gov/it-booklets/information-security.aspx"
  },
  {
    id: "management",
    title: "Management",
    category: "IT Examination Handbook",
    description: "IT governance, strategic planning, and management oversight requirements for financial institutions.",
    topics: ["IT Governance", "Strategic Planning", "Risk Management", "Board Oversight", "Performance Metrics"],
    lastUpdated: "2024",
    url: "https://ithandbook.ffiec.gov/it-booklets/management.aspx"
  },
  {
    id: "operations",
    title: "Operations",
    category: "IT Examination Handbook",
    description: "Operational requirements including monitoring, maintenance, and day-to-day IT operations management.",
    topics: ["System Monitoring", "Maintenance", "Change Control", "Problem Management", "Service Delivery"],
    lastUpdated: "2023",
    url: "https://ithandbook.ffiec.gov/it-booklets/architecture-infrastructure-and-operations.aspx"
  },
  {
    id: "outsourcing",
    title: "Outsourcing Technology Services",
    category: "IT Examination Handbook",
    description: "Risk management for outsourced technology services, vendor due diligence, and ongoing monitoring.",
    topics: ["Vendor Selection", "Contract Management", "Risk Assessment", "Ongoing Monitoring", "Exit Planning"],
    lastUpdated: "2024",
    url: "https://ithandbook.ffiec.gov/it-booklets/outsourcing-technology-services.aspx"
  },
  {
    id: "retail-payment",
    title: "Retail Payment Systems",
    category: "IT Examination Handbook",
    description: "Security and operational requirements for retail payment systems including ACH, cards, and mobile payments.",
    topics: ["Payment Security", "Fraud Detection", "ACH Operations", "Card Processing", "Mobile Banking"],
    lastUpdated: "2024",
    url: "https://ithandbook.ffiec.gov/it-booklets/retail-payment-systems.aspx"
  },
  {
    id: "wholesale-payment",
    title: "Wholesale Payment Systems",
    category: "IT Examination Handbook",
    description: "Requirements for wholesale payment systems, wire transfers, and large-value payment processing.",
    topics: ["Wire Transfer Security", "Payment Authentication", "Fraud Prevention", "Transaction Monitoring"],
    lastUpdated: "2023",
    url: "https://ithandbook.ffiec.gov/it-booklets/wholesale-payment-systems.aspx"
  }
];

const ffiecExamPlans = [
  {
    id: "comprehensive-it",
    title: "Comprehensive IT Examination",
    scope: "Full Scope",
    description: "Complete evaluation of all IT risk areas including governance, operations, security, and compliance.",
    areas: ["IT Management", "Security", "Operations", "Business Continuity", "Audit", "Outsourcing"],
    duration: "3-6 weeks",
    frequency: "18-24 months"
  },
  {
    id: "targeted-security",
    title: "Targeted Security Review",
    scope: "Focused",
    description: "Focused assessment of information security controls, vulnerabilities, and incident response capabilities.",
    areas: ["Access Controls", "Network Security", "Encryption", "Incident Response", "Security Testing"],
    duration: "1-2 weeks",
    frequency: "Annual"
  },
  {
    id: "bcp-resilience",
    title: "Business Continuity and Resilience",
    scope: "Focused",
    description: "Evaluation of business continuity planning, disaster recovery, and operational resilience.",
    areas: ["BCP Documentation", "Recovery Procedures", "Testing Results", "Vendor Dependencies"],
    duration: "1 week",
    frequency: "Annual"
  },
  {
    id: "vendor-management",
    title: "Third-Party Risk Management",
    scope: "Focused",
    description: "Assessment of vendor management, due diligence, and oversight of critical service providers.",
    areas: ["Vendor Inventory", "Due Diligence", "Contract Review", "Ongoing Monitoring", "Incident Management"],
    duration: "1-2 weeks",
    frequency: "18 months"
  },
  {
    id: "payment-systems",
    title: "Payment Systems Security",
    scope: "Focused",
    description: "Evaluation of retail and wholesale payment system controls, fraud detection, and security measures.",
    areas: ["Payment Security", "Fraud Controls", "Authentication", "Transaction Monitoring"],
    duration: "2 weeks",
    frequency: "Annual"
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Assessment Tool (CAT)",
    scope: "Comprehensive",
    description: "Standardized assessment of inherent risk profile and cybersecurity maturity across five domains.",
    areas: ["Cyber Risk Management", "Threat Intelligence", "Cybersecurity Controls", "External Dependencies", "Incident Response"],
    duration: "2-4 weeks",
    frequency: "Annual"
  }
];

const ffiecRequirements = [
  {
    id: "auth-controls",
    category: "Information Security",
    requirement: "Multi-Factor Authentication",
    description: "Financial institutions must implement multi-factor authentication for all remote access and high-risk transactions.",
    control: "PR.AC-1",
    references: ["FFIEC Information Security Booklet", "FFIEC Authentication Guidance"]
  },
  {
    id: "encryption",
    category: "Information Security",
    requirement: "Data Encryption",
    description: "Sensitive customer data must be encrypted both in transit and at rest using approved encryption standards.",
    control: "PR.DS-1, PR.DS-2",
    references: ["FFIEC Information Security Booklet"]
  },
  {
    id: "patch-mgmt",
    category: "Operations",
    requirement: "Patch Management",
    description: "Establish formal patch management process with risk-based prioritization and timely deployment.",
    control: "PR.IP-3",
    references: ["FFIEC Operations Booklet"]
  },
  {
    id: "incident-response",
    category: "Information Security",
    requirement: "Incident Response Plan",
    description: "Maintain documented incident response plan with defined roles, procedures, and communication protocols.",
    control: "RS.RP-1",
    references: ["FFIEC Information Security Booklet", "Cybersecurity Assessment Tool"]
  },
  {
    id: "bcp-testing",
    category: "Business Continuity",
    requirement: "BCP Testing",
    description: "Conduct annual testing of business continuity plans with documented results and improvement actions.",
    control: "RC.RP-1",
    references: ["FFIEC Business Continuity Planning Booklet"]
  },
  {
    id: "vendor-diligence",
    category: "Outsourcing",
    requirement: "Third-Party Due Diligence",
    description: "Perform comprehensive due diligence on critical service providers before engagement and ongoing monitoring.",
    control: "ID.SC-1, ID.SC-2",
    references: ["FFIEC Outsourcing Technology Services Booklet"]
  },
  {
    id: "access-review",
    category: "Information Security",
    requirement: "Access Rights Review",
    description: "Review and recertify user access rights at least annually with prompt removal of unnecessary access.",
    control: "PR.AC-4",
    references: ["FFIEC Information Security Booklet"]
  },
  {
    id: "vulnerability-scanning",
    category: "Information Security",
    requirement: "Vulnerability Management",
    description: "Conduct regular vulnerability scans and penetration testing with timely remediation of identified issues.",
    control: "DE.CM-8",
    references: ["FFIEC Information Security Booklet", "CAT"]
  },
  {
    id: "segregation",
    category: "Information Security",
    requirement: "Network Segmentation",
    description: "Implement network segmentation to isolate critical systems and limit lateral movement.",
    control: "PR.AC-5",
    references: ["FFIEC Architecture and Infrastructure Booklet"]
  },
  {
    id: "logging",
    category: "Operations",
    requirement: "Audit Logging",
    description: "Maintain comprehensive audit logs for security-relevant events with secure storage and regular review.",
    control: "PR.PT-1, DE.AE-3",
    references: ["FFIEC Audit Booklet", "FFIEC Operations Booklet"]
  },
  {
    id: "change-mgmt",
    category: "Development",
    requirement: "Change Management",
    description: "Implement formal change management process with testing, approval, and rollback procedures.",
    control: "PR.IP-3",
    references: ["FFIEC Development and Acquisition Booklet"]
  },
  {
    id: "awareness",
    category: "Management",
    requirement: "Security Awareness Training",
    description: "Provide annual security awareness training to all personnel covering phishing, social engineering, and policies.",
    control: "PR.AT-1",
    references: ["FFIEC Management Booklet"]
  },
  {
    id: "board-oversight",
    category: "Management",
    requirement: "Board Oversight",
    description: "Board must receive regular reports on IT risk, cybersecurity posture, and significant incidents.",
    control: "ID.GV-1",
    references: ["FFIEC Management Booklet"]
  },
  {
    id: "customer-auth",
    category: "Retail Payments",
    requirement: "Customer Authentication",
    description: "Implement layered authentication for high-risk transactions including anomaly detection.",
    control: "PR.AC-1",
    references: ["FFIEC Authentication Guidance", "FFIEC Retail Payment Systems Booklet"]
  },
  {
    id: "fraud-monitoring",
    category: "Retail Payments",
    requirement: "Transaction Monitoring",
    description: "Deploy automated fraud detection and monitoring for payment transactions with alert thresholds.",
    control: "DE.CM-1",
    references: ["FFIEC Retail Payment Systems Booklet"]
  }
];

export default function FFIECLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("workbooks");

  const filteredWorkbooks = ffiecWorkbooks.filter(wb =>
    searchQuery === "" ||
    wb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wb.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredExamPlans = ffiecExamPlans.filter(ep =>
    searchQuery === "" ||
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.areas.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRequirements = ffiecRequirements.filter(req =>
    searchQuery === "" ||
    req.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">FFIEC IT Examination Library</h2>
              <p className="text-slate-300 text-sm">
                Comprehensive Federal Financial Institutions Examination Council resources including IT Examination Handbook booklets, 
                exam plans, and regulatory requirements for financial institutions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search FFIEC resources..."
          className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="workbooks">
            <BookOpen className="h-4 w-4 mr-2" />
            Workbooks ({ffiecWorkbooks.length})
          </TabsTrigger>
          <TabsTrigger value="examplans">
            <ClipboardList className="h-4 w-4 mr-2" />
            Exam Plans ({ffiecExamPlans.length})
          </TabsTrigger>
          <TabsTrigger value="requirements">
            <FileText className="h-4 w-4 mr-2" />
            Requirements ({ffiecRequirements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workbooks" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 pr-4">
              {filteredWorkbooks.map(workbook => (
                <Card key={workbook.id} className="bg-[#1a2332] border-[#2a3548] hover:border-blue-500/30 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base text-white">{workbook.title}</CardTitle>
                        <Badge className="mt-2 text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {workbook.category}
                        </Badge>
                      </div>
                      <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                        Updated {workbook.lastUpdated}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4">{workbook.description}</p>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-400 uppercase">Key Topics:</div>
                      <div className="flex flex-wrap gap-2">
                        {workbook.topics.map((topic, idx) => (
                          <Badge key={idx} className="text-[10px] bg-[#151d2e] text-slate-300 border-[#2a3548]">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => window.open(workbook.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View on FFIEC.gov
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="examplans" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 pr-4">
              {filteredExamPlans.map(plan => (
                <Card key={plan.id} className="bg-[#1a2332] border-[#2a3548] hover:border-cyan-500/30 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base text-white">{plan.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                            {plan.scope}
                          </Badge>
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                            {plan.duration}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4">{plan.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs font-medium text-slate-400 mb-2">Examination Areas:</div>
                        <div className="space-y-1">
                          {plan.areas.map((area, idx) => (
                            <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              {area}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-400 mb-2">Schedule:</div>
                        <div className="text-xs text-slate-300">
                          <div>Duration: {plan.duration}</div>
                          <div>Frequency: {plan.frequency}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requirements" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-3 pr-4">
              {filteredRequirements.map(req => (
                <Card key={req.id} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{req.requirement}</h4>
                        <p className="text-xs text-slate-400 mt-1">{req.description}</p>
                      </div>
                      <Badge className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {req.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="text-[10px] bg-[#151d2e] text-slate-300 border-[#2a3548]">
                        {req.control}
                      </Badge>
                      {req.references.map((ref, idx) => (
                        <Badge key={idx} className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}