import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";

const THREAT_TERMS = [
  {
    term: "CVE (Common Vulnerabilities and Exposures)",
    definition: "A standardized identifier for publicly known cybersecurity vulnerabilities. Format: CVE-YEAR-NUMBER (e.g., CVE-2024-12345)",
    category: "Vulnerability Management"
  },
  {
    term: "CVSS (Common Vulnerability Scoring System)",
    definition: "A framework for rating the severity of security vulnerabilities. Scores range from 0-10: Low (0-3.9), Medium (4-6.9), High (7-8.9), Critical (9-10)",
    category: "Risk Assessment"
  },
  {
    term: "Zero-Day Vulnerability",
    definition: "A security flaw unknown to the software vendor, giving attackers 'zero days' of protection. Extremely dangerous as no patch exists",
    category: "Vulnerability Management"
  },
  {
    term: "APT (Advanced Persistent Threat)",
    definition: "A sophisticated, prolonged cyberattack by nation-states or organized groups. Characterized by stealth, persistence, and specific targets",
    category: "Threat Intelligence"
  },
  {
    term: "IoC (Indicator of Compromise)",
    definition: "Evidence that a system has been breached. Examples: suspicious IPs, file hashes, registry changes, unusual network traffic",
    category: "Threat Detection"
  },
  {
    term: "TTP (Tactics, Techniques, and Procedures)",
    definition: "Patterns of activities used by threat actors. Documented in frameworks like MITRE ATT&CK for threat hunting",
    category: "Threat Intelligence"
  },
  {
    term: "Threat Actor",
    definition: "Individual or group performing malicious cyber activities. Types: nation-states, cybercriminals, hacktivists, insiders",
    category: "Threat Intelligence"
  },
  {
    term: "Attack Surface",
    definition: "All possible points where an attacker could enter or extract data. Includes networks, applications, devices, users",
    category: "Risk Assessment"
  },
  {
    term: "Exploit",
    definition: "Code or technique that takes advantage of a vulnerability to compromise a system",
    category: "Threat Vectors"
  },
  {
    term: "Patch Management",
    definition: "Process of acquiring, testing, and installing software updates to fix vulnerabilities",
    category: "Vulnerability Management"
  },
  {
    term: "MTTR (Mean Time to Remediate)",
    definition: "Average time from vulnerability discovery to complete fix. Key metric for security program effectiveness",
    category: "Metrics"
  },
  {
    term: "Threat Hunting",
    definition: "Proactive search for hidden threats in your environment before they trigger alerts",
    category: "Threat Detection"
  },
  {
    term: "Threat Intelligence",
    definition: "Evidence-based knowledge about existing or emerging threats to assets, used to inform security decisions",
    category: "Threat Intelligence"
  },
  {
    term: "Vulnerability Assessment",
    definition: "Systematic review of security weaknesses in systems. Identifies, quantifies, and prioritizes vulnerabilities",
    category: "Vulnerability Management"
  },
  {
    term: "Penetration Testing",
    definition: "Authorized simulated cyberattack to evaluate security. Goes beyond assessment by actively exploiting vulnerabilities",
    category: "Security Testing"
  },
  {
    term: "Threat Modeling",
    definition: "Structured approach to identify, enumerate, and prioritize potential threats to a system",
    category: "Risk Assessment"
  },
  {
    term: "Kill Chain",
    definition: "Framework describing stages of a cyberattack: Reconnaissance → Weaponization → Delivery → Exploitation → Installation → C2 → Actions",
    category: "Threat Intelligence"
  },
  {
    term: "MITRE ATT&CK",
    definition: "Knowledge base of adversary tactics and techniques based on real-world observations. Industry standard for threat modeling",
    category: "Frameworks"
  },
  {
    term: "Vulnerability Disclosure",
    definition: "Process of reporting discovered vulnerabilities. Responsible disclosure gives vendors time to patch before public release",
    category: "Vulnerability Management"
  },
  {
    term: "Threat Surface",
    definition: "The sum of all attack surfaces exposed to threats. Includes digital, physical, and social engineering vectors",
    category: "Risk Assessment"
  },
  {
    term: "Ransomware",
    definition: "Malware that encrypts data and demands payment. Often includes data exfiltration for double extortion",
    category: "Threat Vectors"
  },
  {
    term: "Phishing",
    definition: "Social engineering attack using fraudulent communications to steal credentials or install malware",
    category: "Threat Vectors"
  },
  {
    term: "DDoS (Distributed Denial of Service)",
    definition: "Attack flooding systems with traffic to make services unavailable to legitimate users",
    category: "Threat Vectors"
  },
  {
    term: "Malware",
    definition: "Malicious software designed to damage, disrupt, or gain unauthorized access. Includes viruses, worms, trojans, spyware",
    category: "Threat Vectors"
  }
];

export default function ThreatTermsGlossary() {
  const [search, setSearch] = useState("");

  const categories = [...new Set(THREAT_TERMS.map(t => t.category))];
  
  const filteredTerms = THREAT_TERMS.filter(term =>
    term.term.toLowerCase().includes(search.toLowerCase()) ||
    term.definition.toLowerCase().includes(search.toLowerCase()) ||
    term.category.toLowerCase().includes(search.toLowerCase())
  );

  const termsByCategory = categories.map(category => ({
    category,
    terms: filteredTerms.filter(t => t.category === category)
  })).filter(c => c.terms.length > 0);

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            Threat Intelligence Glossary
          </CardTitle>
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
            {THREAT_TERMS.length} Terms
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search terms or definitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
          />
        </div>

        <ScrollArea className="h-[500px]">
          <Accordion type="single" collapsible className="space-y-2 pr-3">
            {termsByCategory.map((group, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white">
                    {group.category}
                    <Badge className="ml-2 text-[8px] bg-cyan-500/10 text-cyan-400">
                      {group.terms.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {group.terms.map((term, termIdx) => (
                      <AccordionItem key={termIdx} value={`${idx}-${termIdx}`} className="border-[#2a3548]">
                        <AccordionTrigger className="text-sm text-cyan-400 hover:text-cyan-300 py-2">
                          {term.term}
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-slate-300 pb-2">
                          {term.definition}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}