import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Shield, Lock, FileText, Search, ExternalLink, Building, Building2, Scale, Users, AlertTriangle, Database, Globe, Calendar, Target, TrendingUp, Layers } from "lucide-react";

export default function UnifiedKnowledgeCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRegulator, setActiveRegulator] = useState("ffiec");

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
                <h2 className="text-xl font-bold text-white">U.S. Regulatory Knowledge Center</h2>
                <p className="text-xs text-slate-400">Comprehensive examination resources across federal and state regulators</p>
              </div>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Multi-Regulator
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
              placeholder="Search across all regulatory knowledge bases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Regulator Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card 
          className={`cursor-pointer transition-all ${activeRegulator === 'ffiec' ? 'bg-blue-500/10 border-blue-500/40' : 'bg-[#1a2332] border-[#2a3548] hover:border-blue-500/30'}`}
          onClick={() => setActiveRegulator('ffiec')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="font-semibold text-white text-sm">FFIEC</h3>
                <p className="text-xs text-slate-400">Federal Financial Institutions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${activeRegulator === 'occ' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/30'}`}
          onClick={() => setActiveRegulator('occ')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-white text-sm">OCC</h3>
                <p className="text-xs text-slate-400">Comptroller of the Currency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${activeRegulator === 'nydfs' ? 'bg-violet-500/10 border-violet-500/40' : 'bg-[#1a2332] border-[#2a3548] hover:border-violet-500/30'}`}
          onClick={() => setActiveRegulator('nydfs')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-violet-400" />
              <div>
                <h3 className="font-semibold text-white text-sm">NYDFS</h3>
                <p className="text-xs text-slate-400">NY Department of Financial Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content based on selected regulator */}
      {activeRegulator === 'ffiec' && <FFIECContent searchQuery={searchQuery} />}
      {activeRegulator === 'occ' && <OCCContent searchQuery={searchQuery} />}
      {activeRegulator === 'nydfs' && <NYDFSContent searchQuery={searchQuery} />}
    </div>
  );
}

// FFIEC Content Component
function FFIECContent({ searchQuery }) {
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
    }
  ];

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
    <Tabs defaultValue="programs" className="space-y-4">
      <TabsList className="bg-[#1a2332] border border-[#2a3548]">
        <TabsTrigger value="programs">Exam Programs</TabsTrigger>
        <TabsTrigger value="handbooks">Handbooks</TabsTrigger>
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
                        <h3 className="font-semibold text-white mb-2 text-sm">{program.title}</h3>
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

      <TabsContent value="handbooks">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-6 text-center text-slate-400">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>FFIEC Handbooks: IT Examination, Retail Payment Systems, BSA/AML, Audit Program</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resources">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="space-y-2">
              {['FFIEC.gov', 'IT Handbook InfoBase', 'CAT Tool'].map((resource, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-blue-500/40 transition-all cursor-pointer">
                  <span className="text-sm text-white">{resource}</span>
                  <ExternalLink className="h-4 w-4 text-blue-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// OCC Content Component
function OCCContent({ searchQuery }) {
  const occHandbooks = [
    { category: "Safety and Soundness", topics: ["Capital", "Asset Quality", "Management", "Earnings", "Liquidity"] },
    { category: "Compliance Management", topics: ["BSA/AML", "Consumer Compliance", "Fair Lending", "CRA"] },
    { category: "Credit Risk", topics: ["Underwriting", "Portfolio Management", "Problem Assets", "ALLL"] }
  ];

  return (
    <Tabs defaultValue="camels" className="space-y-4">
      <TabsList className="bg-[#1a2332] border border-[#2a3548]">
        <TabsTrigger value="camels">CAMELS</TabsTrigger>
        <TabsTrigger value="handbooks">Handbooks</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
      </TabsList>

      <TabsContent value="camels" className="space-y-4">
        <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-400" />
              CAMELS Rating System
            </h3>
            <p className="text-sm text-slate-300 mb-3">
              Evaluates banks across Capital, Asset Quality, Management, Earnings, Liquidity, and Sensitivity to Market Risk
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Capital', 'Asset Quality', 'Management', 'Earnings', 'Liquidity', 'Sensitivity'].map((component, idx) => (
                <Badge key={idx} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 justify-center py-2">
                  {component}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="handbooks">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {occHandbooks.map((handbook, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-2">{handbook.category}</h3>
                <div className="flex flex-wrap gap-1">
                  {handbook.topics.map((topic, tidx) => (
                    <Badge key={tidx} variant="outline" className="text-[10px] border-slate-600 text-slate-300">
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
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="space-y-2">
              {['OCC.gov', "Comptroller's Handbook", 'OCC Bulletins'].map((resource, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-emerald-500/40 transition-all cursor-pointer">
                  <span className="text-sm text-white">{resource}</span>
                  <ExternalLink className="h-4 w-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// NYDFS Content Component
function NYDFSContent({ searchQuery }) {
  const part500Sections = [
    { title: "§500.02 Cybersecurity Program", icon: Shield },
    { title: "§500.03 Chief Information Security Officer", icon: Users },
    { title: "§500.04 Penetration Testing", icon: AlertTriangle },
    { title: "§500.07 Access Privileges", icon: Lock },
    { title: "§500.12 Multi-Factor Authentication", icon: Database },
    { title: "§500.17 Incident Response Plan", icon: Target }
  ];

  return (
    <Tabs defaultValue="part500" className="space-y-4">
      <TabsList className="bg-[#1a2332] border border-[#2a3548]">
        <TabsTrigger value="part500">Part 500</TabsTrigger>
        <TabsTrigger value="regulations">Regulations</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
      </TabsList>

      <TabsContent value="part500" className="space-y-4">
        <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-6 w-6 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-2">
                  23 NYCRR Part 500 - Cybersecurity Requirements
                </h3>
                <p className="text-sm text-slate-300">
                  Comprehensive cybersecurity requirements for covered financial services entities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {part500Sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-violet-400" />
                    <h3 className="font-semibold text-white text-xs">{section.title}</h3>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="regulations">
        <div className="space-y-3">
          {[
            { title: "Part 3 - Assessments", topics: ["Banking Institutions", "Licensed Lenders"] },
            { title: "Part 36 - Consumer Protection", topics: ["Prohibited Practices", "Disclosure"] },
            { title: "Part 410 - Virtual Currency (BitLicense)", topics: ["Capital Requirements", "AML/KYC"] }
          ].map((reg, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-2">{reg.title}</h3>
                <div className="flex flex-wrap gap-1">
                  {reg.topics.map((topic, tidx) => (
                    <Badge key={tidx} variant="outline" className="text-[10px] border-slate-600 text-slate-300">
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
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="space-y-2">
              {['DFS.ny.gov', 'Part 500 Guidance', 'BitLicense Info'].map((resource, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-violet-500/40 transition-all cursor-pointer">
                  <span className="text-sm text-white">{resource}</span>
                  <ExternalLink className="h-4 w-4 text-violet-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}