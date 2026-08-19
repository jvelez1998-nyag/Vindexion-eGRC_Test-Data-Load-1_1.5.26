import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Building2, Shield, Scale, FileText, Search, ExternalLink, Users, Lock, TrendingUp, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const occHandbooks = [
  {
    category: "Comptroller's Handbook",
    icon: BookOpen,
    color: "blue",
    booklets: [
      { id: "safety-soundness", title: "Safety and Soundness", topics: ["Capital", "Asset Quality", "Management", "Earnings", "Liquidity", "Sensitivity"], pages: "800+" },
      { id: "compliance", title: "Compliance Management", topics: ["BSA/AML", "Consumer Compliance", "Fair Lending", "CRA"], pages: "600+" },
      { id: "bank-supervision", title: "Bank Supervision Process", topics: ["Risk Assessment", "Examination Planning", "Exam Execution", "Post-Exam"], pages: "400+" }
    ]
  },
  {
    category: "Risk Management",
    icon: Shield,
    color: "emerald",
    booklets: [
      { id: "credit-risk", title: "Credit Risk", topics: ["Underwriting", "Portfolio Management", "Problem Assets", "ALLL"], pages: "500+" },
      { id: "operational-risk", title: "Operational Risk", topics: ["Internal Controls", "Business Continuity", "Third Party", "Technology"], pages: "450+" },
      { id: "interest-rate", title: "Interest Rate Risk", topics: ["IRR Measurement", "Modeling", "Stress Testing", "Board Oversight"], pages: "300+" },
      { id: "liquidity-risk", title: "Liquidity Risk", topics: ["Liquidity Management", "Funding", "Contingency Planning"], pages: "250+" }
    ]
  },
  {
    category: "Technology & Cybersecurity",
    icon: Lock,
    color: "violet",
    booklets: [
      { id: "information-security", title: "Information Security", topics: ["Security Controls", "Incident Response", "Risk Assessment"], pages: "350+" },
      { id: "cybersecurity", title: "Cybersecurity", topics: ["Threat Management", "Network Security", "Access Controls"], pages: "400+" },
      { id: "cloud-computing", title: "Cloud Computing", topics: ["Risk Assessment", "Due Diligence", "Ongoing Monitoring"], pages: "200+" },
      { id: "payment-systems", title: "Payment Systems", topics: ["ACH", "Wire Transfer", "Card Processing"], pages: "300+" }
    ]
  },
  {
    category: "Consumer Compliance",
    icon: Users,
    color: "amber",
    booklets: [
      { id: "fair-lending", title: "Fair Lending", topics: ["ECOA", "Fair Housing Act", "Redlining", "Disparate Impact"], pages: "350+" },
      { id: "deposit-accounts", title: "Deposit Accounts", topics: ["Regulation DD", "Funds Availability", "Truth in Savings"], pages: "250+" },
      { id: "mortgage-lending", title: "Mortgage Lending", topics: ["TILA/RESPA", "HOEPA", "HPML", "QM Rules"], pages: "500+" },
      { id: "consumer-protection", title: "Consumer Protection", topics: ["UDAAP", "Privacy", "E-Sign", "Fair Credit Reporting"], pages: "400+" }
    ]
  }
];

const occBulletins = [
  {
    number: "2023-17",
    title: "Third-Party Relationships: Risk Management",
    date: "June 2023",
    category: "Risk Management",
    summary: "Updated guidance on managing risks associated with third-party relationships",
    topics: ["Due Diligence", "Contract Requirements", "Ongoing Monitoring", "Fintech Partnerships"]
  },
  {
    number: "2023-10",
    title: "Model Risk Management",
    date: "March 2023",
    category: "Risk Management",
    summary: "Principles for managing risks from reliance on models",
    topics: ["Model Development", "Validation", "Governance", "AI/ML Models"]
  },
  {
    number: "2021-32",
    title: "Artificial Intelligence",
    date: "October 2021",
    category: "Innovation",
    summary: "Sound practices for AI risk management in banking",
    topics: ["AI Governance", "Model Risk", "Fair Lending", "Transparency"]
  },
  {
    number: "2020-10",
    title: "Comptroller's Handbook: Allowance for Credit Losses",
    date: "March 2020",
    category: "Accounting",
    summary: "CECL implementation and examination procedures",
    topics: ["CECL Methodology", "Data Requirements", "Validation", "Documentation"]
  },
  {
    number: "2019-62",
    title: "Community Reinvestment Act",
    date: "December 2019",
    category: "Community Compliance",
    summary: "CRA examination procedures and performance standards",
    topics: ["Lending Test", "Investment Test", "Service Test", "Assessment Areas"]
  }
];

const occRegulations = [
  { part: "Part 30", title: "Safety and Soundness Standards", topics: ["Operations & Management", "Asset Quality", "Earnings", "Liquidity"] },
  { part: "Part 34", title: "Real Estate Lending and Appraisals", topics: ["Lending Standards", "Appraisal Requirements", "Exceptions"] },
  { part: "Part 39", title: "Prompt Corrective Action", topics: ["Capital Categories", "Restrictions", "Regulatory Actions"] },
  { part: "Part 24", title: "Community Reinvestment Act", topics: ["CRA Requirements", "Performance Evaluations", "Public File"] },
  { part: "Part 21", title: "Minimum Security Devices and Procedures", topics: ["Security Officer", "Security Program", "Incident Reporting"] }
];

const occExamAreas = [
  {
    area: "Capital Adequacy (C)",
    icon: TrendingUp,
    color: "emerald",
    description: "Evaluation of capital levels, quality, and trends",
    components: [
      "Tier 1 Capital Ratio",
      "Total Risk-Based Capital Ratio",
      "Leverage Ratio",
      "Capital Planning Process",
      "Stress Testing",
      "Dividend Policy"
    ]
  },
  {
    area: "Asset Quality (A)",
    icon: FileText,
    color: "blue",
    description: "Assessment of credit risk and loan portfolio quality",
    components: [
      "Loan Grading System",
      "Allowance for Loan Losses (ALL/ACL)",
      "Problem Asset Management",
      "Concentration Risk",
      "Credit Underwriting",
      "Portfolio Trends"
    ]
  },
  {
    area: "Management (M)",
    icon: Users,
    color: "violet",
    description: "Board and management oversight effectiveness",
    components: [
      "Board Oversight",
      "Strategic Planning",
      "Risk Management Framework",
      "Internal Audit Function",
      "Succession Planning",
      "Policies & Procedures"
    ]
  },
  {
    area: "Earnings (E)",
    icon: TrendingUp,
    color: "amber",
    description: "Profitability, sustainability, and earnings quality",
    components: [
      "Return on Assets (ROA)",
      "Return on Equity (ROE)",
      "Net Interest Margin",
      "Efficiency Ratio",
      "Revenue Diversification",
      "Earnings Trends"
    ]
  },
  {
    area: "Liquidity (L)",
    icon: Building2,
    color: "cyan",
    description: "Ability to meet obligations and fund operations",
    components: [
      "Liquidity Coverage Ratio",
      "Net Stable Funding Ratio",
      "Contingent Funding Plan",
      "Asset Liquidity",
      "Funding Sources",
      "Deposit Stability"
    ]
  },
  {
    area: "Sensitivity to Market Risk (S)",
    icon: AlertTriangle,
    color: "rose",
    description: "Exposure to market risk factors",
    components: [
      "Interest Rate Risk",
      "Price Risk",
      "Foreign Exchange Risk",
      "IRR Modeling",
      "Economic Value of Equity",
      "Net Interest Income at Risk"
    ]
  }
];

const occResources = [
  { title: "OCC.gov - Official Website", url: "https://occ.gov", type: "Portal" },
  { title: "Comptroller's Handbook (Full Library)", url: "https://occ.gov/publications-and-resources/publications/comptrollers-handbook", type: "Handbook" },
  { title: "OCC Bulletins & Alerts", url: "https://occ.gov/news-issuances/bulletins", type: "Guidance" },
  { title: "Quarterly Risk Perspective", url: "https://occ.gov/publications-and-resources/publications/qrp", type: "Report" },
  { title: "Semiannual Risk Perspective", url: "https://occ.gov/publications-and-resources/publications/semiannual-risk-perspective", type: "Report" },
  { title: "Consumer Complaints", url: "https://occ.gov/topics/consumers-and-communities/consumer-complaints", type: "Resource" }
];

export default function OCCKnowledgeCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState(null);

  const filteredHandbooks = searchQuery 
    ? occHandbooks.filter(cat => 
        cat.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.booklets.some(b => 
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      )
    : occHandbooks;

  const filteredBulletins = searchQuery
    ? occBulletins.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : occBulletins;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Building2 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">OCC Knowledge Center</h2>
                <p className="text-xs text-slate-400">Office of the Comptroller of the Currency - Examination Resources</p>
              </div>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              National Bank Regulator
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search OCC handbooks, bulletins, regulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="handbooks" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="handbooks">Comptroller's Handbook</TabsTrigger>
          <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
          <TabsTrigger value="camels">CAMELS Framework</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="handbooks" className="space-y-4">
          {filteredHandbooks.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.category} className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className={`h-5 w-5 text-${category.color}-400`} />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.booklets.map((booklet) => (
                      <Card key={booklet.id} className="bg-[#0f1623] border-[#2a3548] hover:border-blue-500/40 transition-all cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">{booklet.title}</h3>
                            <Badge variant="outline" className="text-[10px] flex-shrink-0 ml-2">{booklet.pages}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {booklet.topics.map((topic, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] border-slate-600 text-slate-300">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="bulletins" className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {filteredBulletins.map((bulletin) => (
              <Card key={bulletin.number} className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/40 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
                          OCC {bulletin.number}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{bulletin.category}</Badge>
                        <span className="text-xs text-slate-500">{bulletin.date}</span>
                      </div>
                      <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">{bulletin.title}</h3>
                      <p className="text-xs text-slate-400">{bulletin.summary}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {bulletin.topics.map((topic, idx) => (
                      <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="camels" className="space-y-4">
          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-400" />
                CAMELS Rating System
              </h3>
              <p className="text-sm text-slate-300 mb-3">
                The CAMELS rating system evaluates banks across six critical dimensions, each rated 1 (Strong) to 5 (Critically Deficient).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {['Capital', 'Asset Quality', 'Management', 'Earnings', 'Liquidity', 'Sensitivity'].map((component, idx) => (
                  <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30 justify-center py-2">
                    {component}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {occExamAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Card key={area.area} className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className={`h-5 w-5 text-${area.color}-400`} />
                      {area.area}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-400 mb-3">{area.description}</p>
                    <div className="space-y-1">
                      {area.components.map((component, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${area.color}-400`} />
                          {component}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {occRegulations.map((reg) => (
              <Card key={reg.part} className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/40 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="h-4 w-4 text-violet-400" />
                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                          12 CFR {reg.part}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-white text-sm mb-2">{reg.title}</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {reg.topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] border-slate-600 text-slate-300">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Official OCC Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {occResources.map((resource, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-blue-500/40 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">{resource.title}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">{resource.type}</Badge>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardHeader>
                <CardTitle className="text-sm">Key OCC Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Chartering</span>
                      <p className="text-xs text-slate-400">National bank and federal savings association charters</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Scale className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Supervision</span>
                      <p className="text-xs text-slate-400">Safety and soundness examinations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Consumer Protection</span>
                      <p className="text-xs text-slate-400">Enforce federal consumer protection laws</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Policy Development</span>
                      <p className="text-xs text-slate-400">Banking rules and regulations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}