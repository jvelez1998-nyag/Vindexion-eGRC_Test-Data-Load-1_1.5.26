import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Download, Search, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const OWASP_RISKS = [
  {
    id: "A01:2021",
    name: "Broken Access Control",
    description: "Failures in access control allow unauthorized users to act outside their intended permissions. This can lead to unauthorized information disclosure, modification, or destruction of data.",
    category: "cybersecurity",
    likelihood: 4,
    impact: 5,
    treatment: "Implement least privilege access, deny by default, enforce access controls at the application layer, and regularly audit permissions."
  },
  {
    id: "A02:2021",
    name: "Cryptographic Failures",
    description: "Failures related to cryptography which often leads to sensitive data exposure. Previously known as Sensitive Data Exposure.",
    category: "data_security",
    likelihood: 4,
    impact: 5,
    treatment: "Encrypt all sensitive data at rest and in transit, use strong encryption algorithms, implement proper key management, and avoid storing unnecessary sensitive data."
  },
  {
    id: "A03:2021",
    name: "Injection",
    description: "Injection flaws such as SQL, NoSQL, OS command injection occur when untrusted data is sent to an interpreter as part of a command or query.",
    category: "cybersecurity",
    likelihood: 4,
    impact: 5,
    treatment: "Use parameterized queries, implement input validation, employ least privilege database accounts, and use safe APIs that avoid interpreters."
  },
  {
    id: "A04:2021",
    name: "Insecure Design",
    description: "Missing or ineffective control design. Focuses on risks related to design and architectural flaws requiring secure design patterns and principles.",
    category: "cybersecurity",
    likelihood: 3,
    impact: 4,
    treatment: "Establish secure development lifecycle, use threat modeling, implement secure design patterns, and conduct security architecture reviews."
  },
  {
    id: "A05:2021",
    name: "Security Misconfiguration",
    description: "Security misconfiguration is the most common issue due to insecure default configurations, incomplete configurations, open cloud storage, misconfigured HTTP headers.",
    category: "operational",
    likelihood: 5,
    impact: 4,
    treatment: "Implement automated configuration management, remove unnecessary features, regularly update configurations, and conduct security hardening."
  },
  {
    id: "A06:2021",
    name: "Vulnerable and Outdated Components",
    description: "Using components with known vulnerabilities, unsupported or out-of-date software including OS, web/application servers, DBMS, APIs, and libraries.",
    category: "cybersecurity",
    likelihood: 4,
    impact: 4,
    treatment: "Maintain inventory of components, continuously monitor for vulnerabilities, remove unused dependencies, and implement automated patch management."
  },
  {
    id: "A07:2021",
    name: "Identification and Authentication Failures",
    description: "Confirmation of user's identity, authentication, and session management is critical. Authentication weaknesses may include credential stuffing, brute force attacks, weak passwords.",
    category: "cybersecurity",
    likelihood: 4,
    impact: 5,
    treatment: "Implement multi-factor authentication, enforce strong password policies, use secure session management, and implement account lockout mechanisms."
  },
  {
    id: "A08:2021",
    name: "Software and Data Integrity Failures",
    description: "Code and infrastructure that does not protect against integrity violations. Includes insecure CI/CD pipelines, auto-update without integrity verification, and untrusted sources.",
    category: "cybersecurity",
    likelihood: 3,
    impact: 4,
    treatment: "Implement digital signatures, use trusted repositories, verify integrity of dependencies, and secure CI/CD pipelines."
  },
  {
    id: "A09:2021",
    name: "Security Logging and Monitoring Failures",
    description: "Insufficient logging and monitoring, coupled with missing or ineffective integration with incident response, allows attackers to persist and pivot to more systems.",
    category: "operational",
    likelihood: 4,
    impact: 4,
    treatment: "Implement comprehensive logging, ensure logs are centralized, establish monitoring and alerting, and integrate with incident response processes."
  },
  {
    id: "A10:2021",
    name: "Server-Side Request Forgery (SSRF)",
    description: "SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL, allowing attackers to coerce the application to send requests to unexpected destinations.",
    category: "cybersecurity",
    likelihood: 3,
    impact: 4,
    treatment: "Validate and sanitize all user-supplied URLs, implement whitelist-based input validation, disable HTTP redirections, and segment network access."
  }
];

export default function OWASPRiskLibrary() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const filteredRisks = OWASP_RISKS.filter(risk =>
    risk.name.toLowerCase().includes(search.toLowerCase()) ||
    risk.description.toLowerCase().includes(search.toLowerCase()) ||
    risk.id.toLowerCase().includes(search.toLowerCase())
  );

  const importRiskMutation = useMutation({
    mutationFn: (risk) => base44.entities.Risk.create({
      title: `${risk.id}: ${risk.name}`,
      description: risk.description,
      category: risk.category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      inherent_risk_score: risk.likelihood * risk.impact,
      treatment_plan: risk.treatment,
      status: "identified",
      source: "OWASP Top 10 2021"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['risks']);
      toast.success("Risk imported successfully");
    },
    onError: () => {
      toast.error("Failed to import risk");
    }
  });

  const importAllMutation = useMutation({
    mutationFn: async () => {
      const risks = filteredRisks.map(risk => ({
        title: `${risk.id}: ${risk.name}`,
        description: risk.description,
        category: risk.category,
        likelihood: risk.likelihood,
        impact: risk.impact,
        inherent_risk_score: risk.likelihood * risk.impact,
        treatment_plan: risk.treatment,
        status: "identified",
        source: "OWASP Top 10 2021"
      }));
      
      for (const risk of risks) {
        await base44.entities.Risk.create(risk);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['risks']);
      toast.success(`${filteredRisks.length} risks imported successfully`);
    },
    onError: () => {
      toast.error("Failed to import risks");
    }
  });

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-400" />
                OWASP Top 10 - 2021
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Most critical web application security risks
              </p>
            </div>
            <Button
              onClick={() => importAllMutation.mutate()}
              disabled={importAllMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {importAllMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Import All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search OWASP risks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{OWASP_RISKS.length}</div>
              <div className="text-xs text-slate-400">Total Risks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-400">
                {OWASP_RISKS.filter(r => r.likelihood * r.impact >= 20).length}
              </div>
              <div className="text-xs text-slate-400">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{filteredRisks.length}</div>
              <div className="text-xs text-slate-400">Shown</div>
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {filteredRisks.map((risk) => (
                <Card key={risk.id} className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30">
                            {risk.id}
                          </Badge>
                          <h3 className="text-sm font-semibold text-white">{risk.name}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                            {risk.category}
                          </Badge>
                          <Badge className="bg-amber-500/10 text-amber-400 text-xs">
                            L: {risk.likelihood} | I: {risk.impact}
                          </Badge>
                          <Badge className="bg-rose-500/10 text-rose-400 text-xs">
                            Score: {risk.likelihood * risk.impact}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="font-medium">Treatment: </span>
                          {risk.treatment}
                        </div>
                      </div>
                      <Button
                        onClick={() => importRiskMutation.mutate(risk)}
                        disabled={importRiskMutation.isPending}
                        size="sm"
                        className="ml-3 bg-indigo-600 hover:bg-indigo-700"
                      >
                        {importRiskMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}