import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Shield,
  Lock,
  Mail,
  Server,
  User,
  Bug,
  Clock,
  Users,
  FileText,
  ChevronRight
} from "lucide-react";

const PLAYBOOKS = [
  {
    id: "ransomware",
    name: "Ransomware Attack",
    icon: Lock,
    severity: "critical",
    color: "from-rose-500 to-red-500",
    description: "Respond to ransomware encryption and extortion attempts",
    estimatedTime: "2-8 hours",
    phases: [
      {
        phase: "Immediate Response (0-15 min)",
        steps: [
          { action: "Isolate affected systems from network immediately", critical: true },
          { action: "Document all encrypted files and ransom notes", critical: true },
          { action: "Notify incident response team and management", critical: true },
          { action: "Preserve system memory and logs for forensics", critical: false },
          { action: "Identify ransomware variant if possible", critical: false }
        ]
      },
      {
        phase: "Containment (15-60 min)",
        steps: [
          { action: "Disable network shares and remote access", critical: true },
          { action: "Change all passwords for admin and service accounts", critical: true },
          { action: "Block C2 domains and IPs at firewall/gateway", critical: true },
          { action: "Identify all affected systems through network scanning", critical: false },
          { action: "Secure backups - ensure they're not compromised", critical: true }
        ]
      },
      {
        phase: "Eradication & Recovery (1-4 hours)",
        steps: [
          { action: "Determine if decryption tools are available", critical: false },
          { action: "Restore systems from clean backups", critical: true },
          { action: "Rebuild compromised systems from scratch", critical: true },
          { action: "Patch vulnerabilities that enabled initial access", critical: true },
          { action: "Deploy EDR/antivirus updates", critical: false }
        ]
      },
      {
        phase: "Post-Incident (2-4 hours)",
        steps: [
          { action: "Document complete incident timeline", critical: true },
          { action: "Conduct lessons learned meeting", critical: false },
          { action: "Update backup and recovery procedures", critical: false },
          { action: "Implement additional monitoring for reinfection", critical: true },
          { action: "Report to law enforcement if required", critical: false }
        ]
      }
    ],
    keyContacts: ["CISO", "IT Operations", "Legal", "PR/Communications", "Law Enforcement"],
    doNot: [
      "Pay ransom without legal/executive approval",
      "Delete ransom notes before documentation",
      "Restart encrypted systems",
      "Restore from backups until validated clean"
    ]
  },
  {
    id: "data-breach",
    name: "Data Breach",
    icon: Shield,
    severity: "critical",
    color: "from-red-500 to-orange-500",
    description: "Respond to unauthorized access and data exfiltration",
    estimatedTime: "4-12 hours",
    phases: [
      {
        phase: "Initial Assessment (0-30 min)",
        steps: [
          { action: "Confirm breach occurred and scope of exposure", critical: true },
          { action: "Identify data types compromised (PII, PHI, PCI, etc.)", critical: true },
          { action: "Determine how breach occurred (vulnerability, credentials, etc.)", critical: true },
          { action: "Estimate number of records affected", critical: true },
          { action: "Activate incident response team and stakeholders", critical: true }
        ]
      },
      {
        phase: "Containment (30 min - 2 hours)",
        steps: [
          { action: "Revoke access for compromised accounts", critical: true },
          { action: "Close vulnerability or attack vector", critical: true },
          { action: "Preserve evidence and logs", critical: true },
          { action: "Monitor for continued unauthorized access", critical: true },
          { action: "Implement additional access controls", critical: false }
        ]
      },
      {
        phase: "Notification & Compliance (2-8 hours)",
        steps: [
          { action: "Assess regulatory notification requirements (GDPR, CCPA, HIPAA)", critical: true },
          { action: "Notify legal and compliance teams", critical: true },
          { action: "Prepare breach notification for affected individuals", critical: true },
          { action: "Report to regulatory authorities within required timeframes", critical: true },
          { action: "Document all notification activities", critical: true }
        ]
      },
      {
        phase: "Remediation (4-12 hours)",
        steps: [
          { action: "Reset credentials for all potentially affected accounts", critical: true },
          { action: "Offer credit monitoring/identity theft protection", critical: false },
          { action: "Enhance monitoring and detection capabilities", critical: true },
          { action: "Conduct full security assessment", critical: false },
          { action: "Update security policies and procedures", critical: false }
        ]
      }
    ],
    keyContacts: ["Legal", "Compliance", "Privacy Officer", "CISO", "PR Team", "Regulatory Bodies"],
    doNot: [
      "Delay notification beyond legal requirements",
      "Minimize scope without proper investigation",
      "Communicate publicly before legal review",
      "Delete logs or evidence"
    ]
  },
  {
    id: "phishing",
    name: "Phishing Attack",
    icon: Mail,
    severity: "high",
    color: "from-amber-500 to-orange-500",
    description: "Respond to credential theft and social engineering attacks",
    estimatedTime: "1-4 hours",
    phases: [
      {
        phase: "Identification (0-15 min)",
        steps: [
          { action: "Verify phishing email/link reported", critical: true },
          { action: "Identify all recipients of phishing email", critical: true },
          { action: "Determine if credentials were compromised", critical: true },
          { action: "Check if malware was downloaded", critical: true },
          { action: "Document phishing indicators (sender, URLs, attachments)", critical: false }
        ]
      },
      {
        phase: "Containment (15-30 min)",
        steps: [
          { action: "Block sender domain/email at mail gateway", critical: true },
          { action: "Remove phishing emails from all mailboxes", critical: true },
          { action: "Reset passwords for users who clicked links", critical: true },
          { action: "Block malicious URLs at web proxy/firewall", critical: true },
          { action: "Quarantine affected systems if malware detected", critical: true }
        ]
      },
      {
        phase: "User Communication (30 min - 1 hour)",
        steps: [
          { action: "Send organization-wide alert about phishing campaign", critical: true },
          { action: "Provide guidance on identifying phishing attempts", critical: false },
          { action: "Instruct users to report suspicious emails", critical: false },
          { action: "Follow up with affected users individually", critical: true },
          { action: "Document user responses and actions taken", critical: false }
        ]
      },
      {
        phase: "Prevention (1-4 hours)",
        steps: [
          { action: "Update email filtering rules", critical: true },
          { action: "Add IOCs to threat intelligence platform", critical: false },
          { action: "Conduct targeted security awareness training", critical: false },
          { action: "Review and enhance email security controls", critical: false },
          { action: "Implement additional MFA where missing", critical: true }
        ]
      }
    ],
    keyContacts: ["IT Security", "Help Desk", "Communications", "All Staff"],
    doNot: [
      "Forward phishing emails without proper handling",
      "Click on links to investigate without isolation",
      "Delay password resets for compromised accounts",
      "Skip organization-wide notifications"
    ]
  },
  {
    id: "ddos",
    name: "DDoS Attack",
    icon: Server,
    severity: "high",
    color: "from-violet-500 to-purple-500",
    description: "Respond to distributed denial of service attacks",
    estimatedTime: "1-6 hours",
    phases: [
      {
        phase: "Detection & Assessment (0-15 min)",
        steps: [
          { action: "Confirm DDoS attack (vs. legitimate traffic spike)", critical: true },
          { action: "Identify attack type (volumetric, protocol, application)", critical: true },
          { action: "Determine targeted services/endpoints", critical: true },
          { action: "Assess impact on availability and performance", critical: true },
          { action: "Activate DDoS response team", critical: true }
        ]
      },
      {
        phase: "Mitigation (15 min - 2 hours)",
        steps: [
          { action: "Activate DDoS mitigation service (Cloudflare, Akamai, etc.)", critical: true },
          { action: "Implement rate limiting and traffic filtering", critical: true },
          { action: "Block attacking IPs/ASNs if feasible", critical: false },
          { action: "Scale infrastructure if possible", critical: false },
          { action: "Route traffic through scrubbing centers", critical: true }
        ]
      },
      {
        phase: "Communication (30 min - 1 hour)",
        steps: [
          { action: "Notify ISP and upstream providers", critical: true },
          { action: "Update status page with service disruption info", critical: true },
          { action: "Communicate with affected customers", critical: true },
          { action: "Coordinate with DDoS mitigation vendor", critical: true },
          { action: "Keep stakeholders updated on progress", critical: false }
        ]
      },
      {
        phase: "Recovery & Analysis (2-6 hours)",
        steps: [
          { action: "Monitor for attack cessation", critical: true },
          { action: "Gradually restore normal traffic routing", critical: true },
          { action: "Analyze attack patterns and sources", critical: false },
          { action: "Document attack characteristics and response", critical: false },
          { action: "Review and improve DDoS defenses", critical: false }
        ]
      }
    ],
    keyContacts: ["Network Operations", "ISP/Hosting Provider", "DDoS Mitigation Vendor", "CISO", "Communications"],
    doNot: [
      "Attempt to block all traffic indiscriminately",
      "Ignore communication with customers",
      "Scale infrastructure without mitigation first",
      "Disable monitoring during attack"
    ]
  },
  {
    id: "insider-threat",
    name: "Insider Threat",
    icon: User,
    severity: "high",
    color: "from-red-500 to-rose-500",
    description: "Respond to malicious or negligent insider actions",
    estimatedTime: "2-8 hours",
    phases: [
      {
        phase: "Investigation (0-1 hour)",
        steps: [
          { action: "Document suspicious behavior or indicators", critical: true },
          { action: "Review user access logs and activities", critical: true },
          { action: "Identify data or systems accessed", critical: true },
          { action: "Determine if action was malicious or negligent", critical: false },
          { action: "Consult with HR and Legal before action", critical: true }
        ]
      },
      {
        phase: "Containment (1-2 hours)",
        steps: [
          { action: "Disable user accounts and access", critical: true },
          { action: "Preserve evidence (logs, emails, files)", critical: true },
          { action: "Block data exfiltration channels", critical: true },
          { action: "Monitor for continued unauthorized access", critical: true },
          { action: "Secure physical access if applicable", critical: false }
        ]
      },
      {
        phase: "Assessment (2-4 hours)",
        steps: [
          { action: "Determine scope of data accessed/exfiltrated", critical: true },
          { action: "Identify potential compliance violations", critical: true },
          { action: "Assess business impact", critical: true },
          { action: "Interview witnesses if appropriate", critical: false },
          { action: "Coordinate with HR for employment actions", critical: true }
        ]
      },
      {
        phase: "Response & Prevention (4-8 hours)",
        steps: [
          { action: "Report to appropriate authorities if criminal", critical: false },
          { action: "Implement enhanced monitoring for similar behavior", critical: true },
          { action: "Review and strengthen access controls", critical: true },
          { action: "Conduct security awareness training", critical: false },
          { action: "Update insider threat detection capabilities", critical: false }
        ]
      }
    ],
    keyContacts: ["HR", "Legal", "CISO", "Management", "Law Enforcement (if applicable)"],
    doNot: [
      "Confront suspect without legal/HR consultation",
      "Delete evidence during investigation",
      "Discuss investigation with other employees",
      "Take action that violates employment law"
    ]
  },
  {
    id: "malware",
    name: "Malware Infection",
    icon: Bug,
    severity: "high",
    color: "from-orange-500 to-amber-500",
    description: "Respond to malware detection and system compromise",
    estimatedTime: "2-6 hours",
    phases: [
      {
        phase: "Isolation (0-15 min)",
        steps: [
          { action: "Disconnect infected systems from network", critical: true },
          { action: "Identify malware type and behavior", critical: true },
          { action: "Document affected systems and users", critical: true },
          { action: "Preserve memory dump for analysis", critical: false },
          { action: "Alert incident response team", critical: true }
        ]
      },
      {
        phase: "Analysis (15 min - 1 hour)",
        steps: [
          { action: "Determine infection vector (email, web, USB, etc.)", critical: true },
          { action: "Identify malware capabilities (keylogger, backdoor, etc.)", critical: true },
          { action: "Check for lateral movement to other systems", critical: true },
          { action: "Review logs for IOCs and timeline", critical: true },
          { action: "Assess data exfiltration potential", critical: true }
        ]
      },
      {
        phase: "Eradication (1-3 hours)",
        steps: [
          { action: "Remove malware using AV/EDR tools", critical: true },
          { action: "Delete malicious files and registry entries", critical: true },
          { action: "Close vulnerabilities exploited by malware", critical: true },
          { action: "Scan all network systems for same malware", critical: true },
          { action: "Consider reimaging severely compromised systems", critical: false }
        ]
      },
      {
        phase: "Recovery (2-6 hours)",
        steps: [
          { action: "Restore systems to normal operation", critical: true },
          { action: "Reset credentials for affected users", critical: true },
          { action: "Update AV/EDR signatures", critical: true },
          { action: "Monitor for reinfection attempts", critical: true },
          { action: "Document IOCs and lessons learned", critical: false }
        ]
      }
    ],
    keyContacts: ["IT Security", "System Administrators", "Help Desk", "CISO"],
    doNot: [
      "Re-connect infected systems before cleaning",
      "Assume single system is only victim",
      "Skip updating security tools",
      "Ignore potential data theft"
    ]
  }
];

export default function IncidentResponsePlaybooks() {
  const [search, setSearch] = useState("");
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);

  const filteredPlaybooks = PLAYBOOKS.filter(playbook =>
    playbook.name.toLowerCase().includes(search.toLowerCase()) ||
    playbook.description.toLowerCase().includes(search.toLowerCase())
  );

  const severityColors = {
    critical: "from-rose-500/20 to-red-500/20 border-rose-500/30",
    high: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    medium: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
  };

  return (
    <div className="space-y-6">
      {!selectedPlaybook ? (
        <>
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Incident Response Playbooks</CardTitle>
              <p className="text-sm text-slate-400 mt-2">
                Step-by-step guidance for common security incidents
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search playbooks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlaybooks.map((playbook) => {
                  const Icon = playbook.icon;
                  return (
                    <Card
                      key={playbook.id}
                      className={`bg-gradient-to-br ${severityColors[playbook.severity]} cursor-pointer hover:scale-105 transition-all`}
                      onClick={() => setSelectedPlaybook(playbook)}
                    >
                      <CardContent className="p-5">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${playbook.color}/20 w-fit mb-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2">{playbook.name}</h3>
                        <p className="text-xs text-slate-400 mb-3">{playbook.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/10 text-white text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {playbook.estimatedTime}
                          </Badge>
                          <Badge className={`text-xs ${playbook.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {playbook.severity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedPlaybook(null)}
                className="border-[#2a3548]"
              >
                ← Back
              </Button>
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {(() => {
                    const Icon = selectedPlaybook.icon;
                    return <Icon className="h-5 w-5 text-rose-400" />;
                  })()}
                  {selectedPlaybook.name} Response Playbook
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">{selectedPlaybook.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="phases" className="space-y-4">
              <TabsList className="bg-[#151d2e] border border-[#2a3548]">
                <TabsTrigger value="phases">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Response Phases
                </TabsTrigger>
                <TabsTrigger value="contacts">
                  <Users className="h-4 w-4 mr-2" />
                  Key Contacts
                </TabsTrigger>
                <TabsTrigger value="donot">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Do Not
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phases">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pr-4">
                    {selectedPlaybook.phases.map((phase, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                              <span className="text-lg font-bold text-indigo-400">{idx + 1}</span>
                            </div>
                            <h3 className="text-base font-semibold text-white">{phase.phase}</h3>
                          </div>
                          <div className="space-y-2">
                            {phase.steps.map((step, stepIdx) => (
                              <div
                                key={stepIdx}
                                className={`flex items-start gap-3 p-3 rounded-lg ${
                                  step.critical ? 'bg-rose-500/5 border border-rose-500/20' : 'bg-[#1a2332]'
                                }`}
                              >
                                <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${step.critical ? 'text-rose-400' : 'text-emerald-400'}`} />
                                <div className="flex-1">
                                  <p className="text-sm text-white">{step.action}</p>
                                  {step.critical && (
                                    <Badge className="mt-1 bg-rose-500/10 text-rose-400 text-xs">
                                      Critical Step
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="contacts">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-400" />
                      Activate These Teams/Roles
                    </h3>
                    <div className="space-y-2">
                      {selectedPlaybook.keyContacts.map((contact, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#1a2332]">
                          <User className="h-4 w-4 text-indigo-400" />
                          <span className="text-sm text-white">{contact}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="donot">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      Critical Mistakes to Avoid
                    </h3>
                    <div className="space-y-2">
                      {selectedPlaybook.doNot.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                          <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}