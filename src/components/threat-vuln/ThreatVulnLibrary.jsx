import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Database, Download, Search, AlertTriangle, Shield } from "lucide-react";

const THREAT_LIBRARY = [
  {
    name: "Ransomware Attack",
    threat_type: "ransomware",
    severity: "critical",
    threat_actor: "cybercriminal",
    description: "Malicious software that encrypts organizational data and demands ransom for decryption keys",
    attack_vector: ["phishing", "exploit_kits", "rdp_brute_force"],
    mitre_attack_tactics: ["Initial Access", "Execution", "Impact"],
    mitre_attack_techniques: ["T1566", "T1486", "T1489"],
    business_impact: "Critical business disruption, data loss, financial loss, reputational damage",
    likelihood: 4,
    impact: 5
  },
  {
    name: "Advanced Persistent Threat (APT)",
    threat_type: "apt",
    severity: "critical",
    threat_actor: "nation_state",
    description: "Sophisticated, prolonged cyber attack focused on stealing sensitive information",
    attack_vector: ["spear_phishing", "zero_day_exploits", "supply_chain"],
    mitre_attack_tactics: ["Reconnaissance", "Initial Access", "Persistence", "Exfiltration"],
    mitre_attack_techniques: ["T1595", "T1566", "T1053", "T1041"],
    business_impact: "Intellectual property theft, espionage, long-term compromise",
    likelihood: 3,
    impact: 5
  },
  {
    name: "Insider Threat",
    threat_type: "insider_threat",
    severity: "high",
    threat_actor: "insider",
    description: "Malicious or negligent actions by employees or contractors",
    attack_vector: ["privilege_abuse", "data_exfiltration", "sabotage"],
    mitre_attack_tactics: ["Collection", "Exfiltration", "Impact"],
    mitre_attack_techniques: ["T1005", "T1041", "T1485"],
    business_impact: "Data breach, sabotage, compliance violations",
    likelihood: 3,
    impact: 4
  },
  {
    name: "Supply Chain Attack",
    threat_type: "supply_chain",
    severity: "critical",
    threat_actor: "nation_state",
    description: "Compromise through trusted third-party vendors or software",
    attack_vector: ["software_update", "vendor_compromise", "hardware_implant"],
    mitre_attack_tactics: ["Initial Access", "Execution"],
    mitre_attack_techniques: ["T1195", "T1078"],
    business_impact: "Widespread compromise, loss of trust, extensive remediation costs",
    likelihood: 2,
    impact: 5
  },
  {
    name: "DDoS Attack",
    threat_type: "ddos",
    severity: "high",
    threat_actor: "hacktivist",
    description: "Distributed denial of service overwhelming systems with traffic",
    attack_vector: ["botnet", "amplification_attacks"],
    mitre_attack_tactics: ["Impact"],
    mitre_attack_techniques: ["T1498", "T1499"],
    business_impact: "Service disruption, revenue loss, customer impact",
    likelihood: 4,
    impact: 3
  }
];

const VULNERABILITY_LIBRARY = [
  {
    title: "SQL Injection Vulnerability",
    vulnerability_type: "software",
    severity: "critical",
    description: "Unsanitized user input allows SQL command injection",
    cvss_score: 9.8,
    attack_complexity: "low",
    privileges_required: "none",
    confidentiality_impact: "high",
    integrity_impact: "high",
    availability_impact: "high",
    cwe_id: ["CWE-89"],
    remediation_plan: "Implement parameterized queries, input validation, and WAF rules"
  },
  {
    title: "Cross-Site Scripting (XSS)",
    vulnerability_type: "software",
    severity: "high",
    description: "Improper neutralization of input allows script injection",
    cvss_score: 7.2,
    attack_complexity: "low",
    privileges_required: "none",
    confidentiality_impact: "low",
    integrity_impact: "high",
    availability_impact: "none",
    cwe_id: ["CWE-79"],
    remediation_plan: "Implement output encoding, CSP headers, and input sanitization"
  },
  {
    title: "Weak Authentication",
    vulnerability_type: "configuration",
    severity: "high",
    description: "Insufficient authentication controls allow unauthorized access",
    cvss_score: 8.1,
    attack_complexity: "low",
    privileges_required: "none",
    confidentiality_impact: "high",
    integrity_impact: "high",
    availability_impact: "high",
    cwe_id: ["CWE-287"],
    remediation_plan: "Implement MFA, strong password policies, and account lockout"
  },
  {
    title: "Unpatched Systems",
    vulnerability_type: "software",
    severity: "critical",
    description: "Systems running outdated software with known vulnerabilities",
    cvss_score: 9.0,
    attack_complexity: "low",
    privileges_required: "none",
    confidentiality_impact: "high",
    integrity_impact: "high",
    availability_impact: "high",
    remediation_plan: "Implement patch management process and automated patching"
  },
  {
    title: "Insecure API Endpoints",
    vulnerability_type: "architectural",
    severity: "high",
    description: "API endpoints lack proper authentication and rate limiting",
    cvss_score: 7.5,
    attack_complexity: "low",
    privileges_required: "none",
    confidentiality_impact: "high",
    integrity_impact: "low",
    availability_impact: "low",
    cwe_id: ["CWE-306"],
    remediation_plan: "Implement API authentication, rate limiting, and input validation"
  }
];

export default function ThreatVulnLibrary() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("threats");
  const queryClient = useQueryClient();

  const importThreatMutation = useMutation({
    mutationFn: (data) => base44.entities.Threat.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      toast.success("Threat imported");
    }
  });

  const importVulnMutation = useMutation({
    mutationFn: (data) => base44.entities.Vulnerability.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
      toast.success("Vulnerability imported");
    }
  });

  const bulkImportThreats = () => {
    const filtered = THREAT_LIBRARY.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    );
    
    filtered.forEach(threat => {
      importThreatMutation.mutate({
        ...threat,
        status: 'active',
        risk_score: threat.likelihood * threat.impact
      });
    });
  };

  const bulkImportVulns = () => {
    const filtered = VULNERABILITY_LIBRARY.filter(v =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
    );
    
    filtered.forEach(vuln => {
      importVulnMutation.mutate({
        ...vuln,
        status: 'identified',
        remediation_priority: vuln.severity === 'critical' ? 'immediate' : vuln.severity === 'high' ? 'high' : 'medium'
      });
    });
  };

  const library = view === "threats" ? THREAT_LIBRARY : VULNERABILITY_LIBRARY;
  const filteredLibrary = library.filter(item =>
    (item.name || item.title).toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const severityColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-base text-white">Threat & Vulnerability Library</CardTitle>
          </div>
          <Button
            onClick={view === "threats" ? bulkImportThreats : bulkImportVulns}
            size="sm"
            disabled={importThreatMutation.isPending || importVulnMutation.isPending}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Download className="h-3 w-3 mr-1" />
            Import All ({filteredLibrary.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={setView} className="space-y-4">
          <TabsList className="bg-[#0f1623] border border-[#2a3548]">
            <TabsTrigger value="threats">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Threats ({THREAT_LIBRARY.length})
            </TabsTrigger>
            <TabsTrigger value="vulnerabilities">
              <Shield className="h-3 w-3 mr-1" />
              Vulnerabilities ({VULNERABILITY_LIBRARY.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Search library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-[#0f1623] border-[#2a3548] text-white"
            />
          </div>

          <TabsContent value="threats">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {filteredLibrary.map((threat, i) => (
                  <Card key={i} className="bg-[#0f1623] border-[#2a3548] hover:border-rose-500/40 transition-all">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{threat.name}</h4>
                          <p className="text-xs text-slate-400 mb-2">{threat.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge className={severityColors[threat.severity]}>{threat.severity}</Badge>
                            <Badge className="text-[9px] bg-indigo-500/20 text-indigo-400">{threat.threat_type.replace(/_/g, ' ')}</Badge>
                            <Badge className="text-[9px] bg-slate-500/20 text-slate-400">
                              Risk: {threat.likelihood * threat.impact}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => importThreatMutation.mutate({ ...threat, status: 'active', risk_score: threat.likelihood * threat.impact })}
                          disabled={importThreatMutation.isPending}
                          className="h-7 bg-rose-600 hover:bg-rose-700"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Import
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="vulnerabilities">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {filteredLibrary.map((vuln, i) => (
                  <Card key={i} className="bg-[#0f1623] border-[#2a3548] hover:border-amber-500/40 transition-all">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{vuln.title}</h4>
                          <p className="text-xs text-slate-400 mb-2">{vuln.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge className={severityColors[vuln.severity]}>{vuln.severity}</Badge>
                            <Badge className="text-[9px] bg-purple-500/20 text-purple-400">
                              CVSS: {vuln.cvss_score}
                            </Badge>
                            {vuln.cwe_id && vuln.cwe_id.length > 0 && (
                              <Badge className="text-[9px] bg-indigo-500/20 text-indigo-400">
                                {vuln.cwe_id[0]}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => importVulnMutation.mutate({ ...vuln, status: 'identified', remediation_priority: vuln.severity === 'critical' ? 'immediate' : 'high' })}
                          disabled={importVulnMutation.isPending}
                          className="h-7 bg-amber-600 hover:bg-amber-700"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Import
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}