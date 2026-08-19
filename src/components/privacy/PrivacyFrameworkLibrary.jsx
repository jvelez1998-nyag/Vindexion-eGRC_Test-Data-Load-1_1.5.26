import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Search, BookOpen, FileText, Shield, AlertCircle } from "lucide-react";

const PRIVACY_FRAMEWORKS = {
  "GDPR": {
    name: "EU General Data Protection Regulation",
    region: "European Union",
    effectiveDate: "May 25, 2018",
    scope: "EU residents' personal data",
    keyPrinciples: [
      "Lawfulness, fairness and transparency",
      "Purpose limitation",
      "Data minimization",
      "Accuracy",
      "Storage limitation",
      "Integrity and confidentiality",
      "Accountability"
    ],
    dataSubjectRights: [
      "Right of access (Art. 15)",
      "Right to rectification (Art. 16)",
      "Right to erasure (Art. 17)",
      "Right to restriction (Art. 18)",
      "Right to data portability (Art. 20)",
      "Right to object (Art. 21)",
      "Rights related to automated decisions (Art. 22)"
    ],
    keyRequirements: [
      "Data Protection Impact Assessment (DPIA) - Art. 35",
      "Data Protection Officer (DPO) - Art. 37-39",
      "Records of Processing Activities (RoPA) - Art. 30",
      "Data Breach Notification - Art. 33-34",
      "Privacy by Design and Default - Art. 25",
      "Lawful basis for processing - Art. 6",
      "Special category data protection - Art. 9"
    ],
    penalties: "Up to €20M or 4% of global annual turnover"
  },
  "CCPA": {
    name: "California Consumer Privacy Act",
    region: "California, USA",
    effectiveDate: "January 1, 2020",
    scope: "California residents",
    keyPrinciples: [
      "Consumer rights to know",
      "Consumer rights to delete",
      "Consumer rights to opt-out",
      "Non-discrimination"
    ],
    dataSubjectRights: [
      "Right to know what personal information is collected",
      "Right to know if PI is sold or disclosed",
      "Right to say no to sale of PI",
      "Right to access personal information",
      "Right to deletion",
      "Right to non-discrimination"
    ],
    keyRequirements: [
      "Privacy policy disclosure",
      "Consumer request response (45 days)",
      "Do Not Sell opt-out",
      "Service provider agreements",
      "Reasonable security procedures",
      "Data minimization",
      "Purpose limitation"
    ],
    penalties: "Up to $7,500 per intentional violation"
  },
  "CPRA": {
    name: "California Privacy Rights Act",
    region: "California, USA",
    effectiveDate: "January 1, 2023",
    scope: "California residents (expands CCPA)",
    keyPrinciples: [
      "Enhanced consumer rights",
      "Sensitive personal information protections",
      "Automated decision-making transparency",
      "Data minimization and retention limits"
    ],
    dataSubjectRights: [
      "Right to correct inaccurate information",
      "Right to limit use of sensitive PI",
      "Right to opt-out of automated decision-making",
      "All CCPA rights plus enhancements"
    ],
    keyRequirements: [
      "California Privacy Protection Agency (CPPA) enforcement",
      "Sensitive personal information limitations",
      "Risk assessments for high-risk processing",
      "Annual cybersecurity audits",
      "Contractor requirements"
    ],
    penalties: "Up to $7,500 per violation + CPPA enforcement"
  },
  "PIPEDA": {
    name: "Personal Information Protection and Electronic Documents Act",
    region: "Canada (Federal)",
    effectiveDate: "January 1, 2001",
    scope: "Private sector organizations in Canada",
    keyPrinciples: [
      "Accountability",
      "Identifying purposes",
      "Consent",
      "Limiting collection",
      "Limiting use, disclosure, and retention",
      "Accuracy",
      "Safeguards",
      "Openness",
      "Individual access",
      "Challenging compliance"
    ],
    dataSubjectRights: [
      "Right to access personal information",
      "Right to correct inaccuracies",
      "Right to withdraw consent",
      "Right to file complaints"
    ],
    keyRequirements: [
      "Consent for collection, use, disclosure",
      "Breach notification to Privacy Commissioner",
      "Breach notification to affected individuals",
      "Record keeping of breaches",
      "Appropriate safeguards"
    ],
    penalties: "Up to $100,000 CAD per violation"
  },
  "LGPD": {
    name: "Lei Geral de Proteção de Dados",
    region: "Brazil",
    effectiveDate: "September 18, 2020",
    scope: "Brazilian residents' personal data",
    keyPrinciples: [
      "Purpose, adequacy, and necessity",
      "Free access",
      "Data quality",
      "Transparency",
      "Security and prevention",
      "Non-discrimination",
      "Accountability"
    ],
    dataSubjectRights: [
      "Confirmation and access",
      "Correction of incomplete/inaccurate data",
      "Anonymization, blocking or deletion",
      "Portability",
      "Information about sharing",
      "Revocation of consent"
    ],
    keyRequirements: [
      "Legal basis for processing",
      "Data Protection Officer appointment",
      "Data breach notification (ANPD)",
      "Privacy impact assessments",
      "International data transfer safeguards",
      "Consent requirements"
    ],
    penalties: "Up to R$50M or 2% of revenue in Brazil"
  },
  "PDPA_Singapore": {
    name: "Personal Data Protection Act",
    region: "Singapore",
    effectiveDate: "July 2, 2014",
    scope: "Organizations in Singapore",
    keyPrinciples: [
      "Consent",
      "Purpose limitation",
      "Notification",
      "Access and correction",
      "Accuracy",
      "Protection",
      "Retention limitation",
      "Transfer limitation",
      "Accountability"
    ],
    dataSubjectRights: [
      "Right to access",
      "Right to correction",
      "Right to withdraw consent"
    ],
    keyRequirements: [
      "Data Protection Officer (organizations with >250 employees)",
      "Data breach notification (within 72 hours)",
      "Consent for collection and use",
      "Purpose limitation",
      "Security arrangements",
      "Cross-border transfer restrictions"
    ],
    penalties: "Up to S$1M per organization"
  }
};

export default function PrivacyFrameworkLibrary() {
  const [selectedFramework, setSelectedFramework] = useState("GDPR");
  const [searchTerm, setSearchTerm] = useState("");

  const framework = PRIVACY_FRAMEWORKS[selectedFramework];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-xl">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Global Privacy Framework Library</h3>
              <p className="text-sm text-slate-400">Comprehensive privacy law reference and compliance guide</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.keys(PRIVACY_FRAMEWORKS).map(code => (
          <Button
            key={code}
            onClick={() => setSelectedFramework(code)}
            variant={selectedFramework === code ? "default" : "outline"}
            className={selectedFramework === code 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600" 
              : "border-[#2a3548] hover:border-indigo-500/30"
            }
          >
            {code}
          </Button>
        ))}
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white mb-1">{framework.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                  {framework.region}
                </Badge>
                <span className="text-xs text-slate-500">Effective: {framework.effectiveDate}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="principles" className="space-y-4">
            <TabsList className="bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="principles">Principles</TabsTrigger>
              <TabsTrigger value="rights">Rights</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="penalties">Penalties</TabsTrigger>
            </TabsList>

            <TabsContent value="principles" className="space-y-3">
              <div className="grid gap-2">
                {framework.keyPrinciples.map((principle, idx) => (
                  <div key={idx} className="p-3 bg-[#151d2e] rounded border border-[#2a3548] flex items-center gap-3">
                    <Shield className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm text-white">{principle}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rights" className="space-y-3">
              <div className="grid gap-2">
                {framework.dataSubjectRights.map((right, idx) => (
                  <div key={idx} className="p-3 bg-[#151d2e] rounded border border-[#2a3548] flex items-center gap-3">
                    <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-white">{right}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-3">
              <div className="grid gap-2">
                {framework.keyRequirements.map((req, idx) => (
                  <div key={idx} className="p-3 bg-[#151d2e] rounded border border-[#2a3548] flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-white">{req}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="penalties">
              <Card className="bg-rose-500/10 border-rose-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-rose-400" />
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">Maximum Penalties</div>
                      <div className="text-base font-bold text-rose-400">{framework.penalties}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}