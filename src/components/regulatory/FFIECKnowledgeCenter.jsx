import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Shield, AlertTriangle, FileText, Search, ExternalLink, Building, Scale, Users, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ffiecPrograms = [
  {
    category: "Information Technology",
    icon: Shield,
    color: "blue",
    programs: [
      { id: "it_audit", title: "IT Examination", description: "Technology risk assessment and controls evaluation", areas: ["Cybersecurity", "Data Protection", "System Security"] },
      { id: "cybersecurity", title: "Cybersecurity Assessment Tool (CAT)", description: "Inherent risk profile and cybersecurity maturity", areas: ["Threat Intelligence", "Incident Response", "Security Controls"] },
      { id: "bcp", title: "Business Continuity Planning", description: "Resilience and recovery capabilities", areas: ["Disaster Recovery", "Crisis Management", "Testing"] }
    ]
  },
  {
    category: "BSA/AML Compliance",
    icon: Scale,
    color: "violet",
    programs: [
      { id: "bsa", title: "Bank Secrecy Act", description: "Anti-money laundering compliance examination", areas: ["CIP", "CDD", "SAR Filing"] },
      { id: "aml", title: "AML Program", description: "Risk-based AML program assessment", areas: ["Risk Assessment", "Internal Controls", "Independent Testing"] },
      { id: "ofac", title: "OFAC Compliance", description: "Sanctions screening and reporting", areas: ["Interdiction", "Blocking", "Reporting"] }
    ]
  },
  {
    category: "Consumer Compliance",
    icon: Users,
    color: "emerald",
    programs: [
      { id: "cra", title: "Community Reinvestment Act", description: "CRA performance evaluation", areas: ["Lending Test", "Investment Test", "Service Test"] },
      { id: "fair_lending", title: "Fair Lending", description: "Equal credit opportunity and fair housing", areas: ["ECOA", "FHA", "Redlining"] },
      { id: "tila", title: "Truth in Lending Act", description: "Disclosure and advertising compliance", areas: ["APR Disclosure", "HOEPA", "Credit Cards"] }
    ]
  },
  {
    category: "Safety & Soundness",
    icon: Building,
    color: "amber",
    programs: [
      { id: "capital", title: "Capital Adequacy", description: "Risk-based capital requirements", areas: ["Tier 1 Capital", "Risk-Weighted Assets", "Leverage Ratio"] },
      { id: "asset_quality", title: "Asset Quality", description: "Credit risk and loan portfolio review", areas: ["Loan Grading", "ALLL", "Problem Assets"] },
      { id: "management", title: "Management", description: "Board oversight and risk governance", areas: ["Strategic Planning", "Internal Audit", "Risk Management"] }
    ]
  },
  {
    category: "Third-Party Risk",
    icon: AlertTriangle,
    color: "rose",
    programs: [
      { id: "tprm", title: "Third-Party Risk Management", description: "Vendor due diligence and oversight", areas: ["Due Diligence", "Contract Review", "Monitoring"] },
      { id: "fintech", title: "Fintech Partnerships", description: "Technology service provider risk", areas: ["Cloud Services", "Payment Processors", "Core Systems"] }
    ]
  }
];

const ffiecHandbooks = [
  { title: "IT Examination Handbook", sections: ["Architecture", "Operations", "Security"], pages: "500+" },
  { title: "Retail Payment Systems", sections: ["ACH", "Card Payments", "Wire Transfer"], pages: "300+" },
  { title: "Bank Secrecy Act/AML", sections: ["Customer Due Diligence", "Suspicious Activity", "OFAC"], pages: "400+" },
  { title: "Audit Program", sections: ["Scope", "Procedures", "Workpapers"], pages: "250+" },
  { title: "Cybersecurity Assessment Tool", sections: ["Inherent Risk", "Maturity", "Declarative Statements"], pages: "150+" }
];

const keyRegulations = [
  { name: "Regulation E", description: "Electronic Fund Transfers", agency: "Federal Reserve" },
  { name: "Regulation Z", description: "Truth in Lending", agency: "Federal Reserve" },
  { name: "Regulation B", description: "Equal Credit Opportunity", agency: "Federal Reserve" },
  { name: "Regulation D", description: "Reserve Requirements", agency: "Federal Reserve" },
  { name: "Regulation CC", description: "Funds Availability", agency: "Federal Reserve" },
  { name: "GLBA", description: "Gramm-Leach-Bliley Act Privacy", agency: "Federal Trade Commission" }
];

export default function FFIECKnowledgeCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredPrograms = searchQuery 
    ? ffiecPrograms.filter(cat => 
        cat.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.programs.some(p => 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : ffiecPrograms;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">FFIEC Knowledge Center</h2>
                <p className="text-xs text-slate-400">Comprehensive regulatory examination resources and guidance</p>
              </div>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              U.S. Federal Regulations
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
              placeholder="Search FFIEC programs, handbooks, regulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="programs">Exam Programs</TabsTrigger>
          <TabsTrigger value="handbooks">Handbooks</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          {filteredPrograms.map((category) => {
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
                    {category.programs.map((program) => (
                      <Card key={program.id} className="bg-[#0f1623] border-[#2a3548] hover:border-blue-500/40 transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-white mb-2">{program.title}</h3>
                          <p className="text-xs text-slate-400 mb-3">{program.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {program.areas.map((area, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] border-slate-600 text-slate-300">
                                {area}
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

        <TabsContent value="handbooks" className="space-y-3">
          {ffiecHandbooks.map((handbook, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-white">{handbook.title}</h3>
                      <Badge variant="outline" className="text-[10px]">{handbook.pages}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {handbook.sections.map((section, sidx) => (
                        <Badge key={sidx} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="regulations" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyRegulations.map((reg, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{reg.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{reg.description}</p>
                    </div>
                    <Lock className="h-4 w-4 text-violet-400" />
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-2">{reg.agency}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">Official FFIEC Resources</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-400" />
                      <span>FFIEC.gov - Official Website</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-400" />
                      <span>IT Examination Handbook InfoBase</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-400" />
                      <span>Cybersecurity Assessment Tool</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Regulatory Agencies</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {["OCC", "FDIC", "Federal Reserve", "NCUA", "CFPB"].map((agency) => (
                      <Badge key={agency} className="bg-violet-500/20 text-violet-400 border-violet-500/30 justify-center">
                        {agency}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}