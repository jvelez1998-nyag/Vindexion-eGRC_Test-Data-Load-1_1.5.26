import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Search, Plus, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const MITRE_TECHNIQUES = [
  // Initial Access
  {
    id: "T1078",
    name: "Valid Accounts",
    tactic: "Initial Access",
    description: "Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion. Compromised credentials may be used to bypass access controls placed on various resources.",
    likelihood: 4,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1190",
    name: "Exploit Public-Facing Application",
    tactic: "Initial Access",
    description: "Adversaries may attempt to exploit a weakness in an Internet-facing host or system to initially access a network. The weakness in the system can be a software bug, a temporary glitch, or a misconfiguration.",
    likelihood: 4,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1566",
    name: "Phishing",
    tactic: "Initial Access",
    description: "Adversaries may send phishing messages to gain access to victim systems. Phishing is a form of social engineering where adversaries attempt to acquire information such as usernames, passwords, or other sensitive data.",
    likelihood: 5,
    impact: 4,
    category: "cybersecurity"
  },
  // Execution
  {
    id: "T1059",
    name: "Command and Scripting Interpreter",
    tactic: "Execution",
    description: "Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries. These interfaces and languages provide ways of interacting with computer systems and are common features across many platforms.",
    likelihood: 4,
    impact: 4,
    category: "cybersecurity"
  },
  {
    id: "T1203",
    name: "Exploitation for Client Execution",
    tactic: "Execution",
    description: "Adversaries may exploit software vulnerabilities in client applications to execute code. Vulnerabilities can exist in software due to unsecure coding practices that can lead to unanticipated behavior.",
    likelihood: 3,
    impact: 5,
    category: "cybersecurity"
  },
  // Persistence
  {
    id: "T1098",
    name: "Account Manipulation",
    tactic: "Persistence",
    description: "Adversaries may manipulate accounts to maintain access to victim systems. Account manipulation may consist of any action that preserves adversary access to a compromised account, such as modifying credentials or permission groups.",
    likelihood: 3,
    impact: 4,
    category: "cybersecurity"
  },
  {
    id: "T1136",
    name: "Create Account",
    tactic: "Persistence",
    description: "Adversaries may create an account to maintain access to victim systems. With a sufficient level of access, creating such accounts may be used to establish secondary credentialed access that do not require persistent remote access tools.",
    likelihood: 3,
    impact: 4,
    category: "cybersecurity"
  },
  {
    id: "T1547",
    name: "Boot or Logon Autostart Execution",
    tactic: "Persistence",
    description: "Adversaries may configure system settings to automatically execute a program during system boot or logon to maintain persistence or gain higher-level privileges on compromised systems.",
    likelihood: 3,
    impact: 4,
    category: "cybersecurity"
  },
  // Privilege Escalation
  {
    id: "T1068",
    name: "Exploitation for Privilege Escalation",
    tactic: "Privilege Escalation",
    description: "Adversaries may exploit software vulnerabilities in an attempt to elevate privileges. Exploitation of a software vulnerability occurs when an adversary takes advantage of a programming error in a program, service, or within the operating system.",
    likelihood: 3,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1548",
    name: "Abuse Elevation Control Mechanism",
    tactic: "Privilege Escalation",
    description: "Adversaries may circumvent mechanisms designed to control elevate privileges to gain higher-level permissions. Most modern systems contain native elevation control mechanisms that are intended to limit privileges.",
    likelihood: 3,
    impact: 5,
    category: "cybersecurity"
  },
  // Defense Evasion
  {
    id: "T1055",
    name: "Process Injection",
    tactic: "Defense Evasion",
    description: "Adversaries may inject code into processes in order to evade process-based defenses as well as possibly elevate privileges. Process injection is a method of executing arbitrary code in the address space of a separate live process.",
    likelihood: 3,
    impact: 4,
    category: "cybersecurity"
  },
  {
    id: "T1070",
    name: "Indicator Removal",
    tactic: "Defense Evasion",
    description: "Adversaries may delete or modify artifacts generated within systems to remove evidence of their presence or hinder defenses. Various artifacts may be created by an adversary or something that can be attributed to an adversary's actions.",
    likelihood: 4,
    impact: 3,
    category: "cybersecurity"
  },
  {
    id: "T1036",
    name: "Masquerading",
    tactic: "Defense Evasion",
    description: "Adversaries may attempt to manipulate features of their artifacts to make them appear legitimate or benign to users and/or security tools. Masquerading occurs when the name or location of an object is manipulated to evade defenses.",
    likelihood: 4,
    impact: 3,
    category: "cybersecurity"
  },
  // Credential Access
  {
    id: "T1110",
    name: "Brute Force",
    tactic: "Credential Access",
    description: "Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained. Without knowledge of the password for an account or set of accounts, an adversary may systematically guess.",
    likelihood: 5,
    impact: 4,
    category: "cybersecurity"
  },
  {
    id: "T1003",
    name: "OS Credential Dumping",
    tactic: "Credential Access",
    description: "Adversaries may attempt to dump credentials to obtain account login and credential material, normally in the form of a hash or a clear text password, from the operating system and software.",
    likelihood: 3,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1056",
    name: "Input Capture",
    tactic: "Credential Access",
    description: "Adversaries may use methods of capturing user input to obtain credentials or collect information. During normal system usage, users often provide credentials to various locations, such as login pages/portals or system dialog boxes.",
    likelihood: 3,
    impact: 4,
    category: "cybersecurity"
  },
  // Discovery
  {
    id: "T1083",
    name: "File and Directory Discovery",
    tactic: "Discovery",
    description: "Adversaries may enumerate files and directories or may search in specific locations of a host or network share for certain information within a file system.",
    likelihood: 4,
    impact: 2,
    category: "cybersecurity"
  },
  {
    id: "T1087",
    name: "Account Discovery",
    tactic: "Discovery",
    description: "Adversaries may attempt to get a listing of valid accounts, usernames, or email addresses on a system or within a compromised environment.",
    likelihood: 4,
    impact: 3,
    category: "cybersecurity"
  },
  {
    id: "T1018",
    name: "Remote System Discovery",
    tactic: "Discovery",
    description: "Adversaries may attempt to get a listing of other systems by IP address, hostname, or other logical identifier on a network that may be used for Lateral Movement from the current system.",
    likelihood: 4,
    impact: 3,
    category: "cybersecurity"
  },
  // Lateral Movement
  {
    id: "T1021",
    name: "Remote Services",
    tactic: "Lateral Movement",
    description: "Adversaries may use Valid Accounts to log into a service specifically designed to accept remote connections, such as telnet, SSH, and VNC. The adversary may then perform actions as the logged-on user.",
    likelihood: 4,
    impact: 4,
    category: "cybersecurity"
  },
  {
    id: "T1080",
    name: "Taint Shared Content",
    tactic: "Lateral Movement",
    description: "Adversaries may deliver payloads to remote systems by adding content to shared storage locations, such as network drives or internal code repositories.",
    likelihood: 3,
    impact: 4,
    category: "cybersecurity"
  },
  // Collection
  {
    id: "T1560",
    name: "Archive Collected Data",
    tactic: "Collection",
    description: "An adversary may compress and/or encrypt data that is collected prior to exfiltration. Compressing the data can help to obfuscate the collected data and minimize the amount of data sent over the network.",
    likelihood: 3,
    impact: 3,
    category: "cybersecurity"
  },
  {
    id: "T1114",
    name: "Email Collection",
    tactic: "Collection",
    description: "Adversaries may target user email to collect sensitive information. Emails may contain sensitive data, including trade secrets or personal information, that can prove valuable to adversaries.",
    likelihood: 4,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1005",
    name: "Data from Local System",
    tactic: "Collection",
    description: "Adversaries may search local system sources, such as file systems and configuration files or local databases, to find files of interest and sensitive data prior to exfiltration.",
    likelihood: 4,
    impact: 4,
    category: "cybersecurity"
  },
  // Command and Control
  {
    id: "T1071",
    name: "Application Layer Protocol",
    tactic: "Command and Control",
    description: "Adversaries may communicate using OSI application layer protocols to avoid detection/network filtering by blending in with existing traffic. Commands to the remote system may blend in with normal, expected traffic.",
    likelihood: 4,
    impact: 3,
    category: "cybersecurity"
  },
  {
    id: "T1573",
    name: "Encrypted Channel",
    tactic: "Command and Control",
    description: "Adversaries may employ a known encryption algorithm to conceal command and control traffic rather than relying on any inherent protections provided by a communication protocol.",
    likelihood: 4,
    impact: 3,
    category: "cybersecurity"
  },
  {
    id: "T1090",
    name: "Proxy",
    tactic: "Command and Control",
    description: "Adversaries may use a connection proxy to direct network traffic between systems or act as an intermediary for network communications to a command and control server.",
    likelihood: 3,
    impact: 3,
    category: "cybersecurity"
  },
  // Exfiltration
  {
    id: "T1041",
    name: "Exfiltration Over C2 Channel",
    tactic: "Exfiltration",
    description: "Adversaries may steal data by exfiltrating it over an existing command and control channel. Stolen data is encoded into the normal communications channel using the same protocol as command and control communications.",
    likelihood: 3,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1567",
    name: "Exfiltration Over Web Service",
    tactic: "Exfiltration",
    description: "Adversaries may use an existing, legitimate external Web service to exfiltrate data rather than their primary command and control channel.",
    likelihood: 4,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1052",
    name: "Exfiltration Over Physical Medium",
    tactic: "Exfiltration",
    description: "Adversaries may attempt to exfiltrate data via a physical medium, such as a removable drive. In certain circumstances, such as an air-gapped network compromise, exfiltration could occur via a physical medium.",
    likelihood: 2,
    impact: 5,
    category: "cybersecurity"
  },
  // Impact
  {
    id: "T1486",
    name: "Data Encrypted for Impact",
    tactic: "Impact",
    description: "Adversaries may encrypt data on target systems or on large numbers of systems in a network to interrupt availability to system and network resources. They can attempt to render stored data inaccessible by encrypting files.",
    likelihood: 4,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1485",
    name: "Data Destruction",
    tactic: "Impact",
    description: "Adversaries may destroy data and files on specific systems or in large numbers on a network to interrupt availability to systems, services, and network resources.",
    likelihood: 2,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1490",
    name: "Inhibit System Recovery",
    tactic: "Impact",
    description: "Adversaries may delete or remove built-in data and turn off services designed to aid in the recovery of a corrupted system to prevent recovery.",
    likelihood: 3,
    impact: 5,
    category: "cybersecurity"
  },
  {
    id: "T1498",
    name: "Network Denial of Service",
    tactic: "Impact",
    description: "Adversaries may perform Network Denial of Service (DoS) attacks to degrade or block the availability of targeted resources to users.",
    likelihood: 4,
    impact: 4,
    category: "cybersecurity"
  }
];

export default function MITREATTACKLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTactic, setSelectedTactic] = useState("all");
  const queryClient = useQueryClient();

  const importRiskMutation = useMutation({
    mutationFn: (technique) => base44.entities.Risk.create({
      title: `${technique.id}: ${technique.name}`,
      description: technique.description,
      category: technique.category,
      likelihood: technique.likelihood,
      impact: technique.impact,
      status: "open",
      source: "MITRE ATT&CK",
      risk_owner: "",
      mitigation_status: "identified",
      treatment_plan: `Implement controls to mitigate ${technique.tactic} tactic: ${technique.name}`
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['risks']);
      toast.success("MITRE technique imported as risk");
    },
    onError: () => {
      toast.error("Failed to import technique");
    }
  });

  const importAllMutation = useMutation({
    mutationFn: async () => {
      const filtered = filteredTechniques;
      for (const technique of filtered) {
        await base44.entities.Risk.create({
          title: `${technique.id}: ${technique.name}`,
          description: technique.description,
          category: technique.category,
          likelihood: technique.likelihood,
          impact: technique.impact,
          status: "open",
          source: "MITRE ATT&CK",
          risk_owner: "",
          mitigation_status: "identified",
          treatment_plan: `Implement controls to mitigate ${technique.tactic} tactic: ${technique.name}`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['risks']);
      toast.success("All MITRE techniques imported successfully");
    },
    onError: () => {
      toast.error("Failed to import techniques");
    }
  });

  const filteredTechniques = MITRE_TECHNIQUES.filter(technique => {
    const matchesSearch = technique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technique.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technique.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technique.tactic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTactic = selectedTactic === "all" || technique.tactic === selectedTactic;
    return matchesSearch && matchesTactic;
  });

  const tactics = [...new Set(MITRE_TECHNIQUES.map(t => t.tactic))];

  const tacticColors = {
    "Initial Access": "bg-rose-500/10 text-rose-400 border-rose-500/30",
    "Execution": "bg-orange-500/10 text-orange-400 border-orange-500/30",
    "Persistence": "bg-amber-500/10 text-amber-400 border-amber-500/30",
    "Privilege Escalation": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    "Defense Evasion": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "Credential Access": "bg-teal-500/10 text-teal-400 border-teal-500/30",
    "Discovery": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    "Lateral Movement": "bg-blue-500/10 text-blue-400 border-blue-500/30",
    "Collection": "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    "Command and Control": "bg-violet-500/10 text-violet-400 border-violet-500/30",
    "Exfiltration": "bg-purple-500/10 text-purple-400 border-purple-500/30",
    "Impact": "bg-pink-500/10 text-pink-400 border-pink-500/30"
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <CardTitle className="text-base">MITRE ATT&CK Framework</CardTitle>
              <p className="text-xs text-slate-400 mt-1">{MITRE_TECHNIQUES.length} Adversarial Techniques</p>
            </div>
          </div>
          <Button
            onClick={() => importAllMutation.mutate()}
            disabled={importAllMutation.isPending || filteredTechniques.length === 0}
            className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Import All ({filteredTechniques.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search MITRE ATT&CK techniques..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedTactic("all")}
            className={selectedTactic === "all" 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg" 
              : "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:from-indigo-500/30 hover:to-purple-500/30"}
            size="sm"
          >
            All Tactics
          </Button>
          {tactics.map(tactic => (
            <Button
              key={tactic}
              onClick={() => setSelectedTactic(tactic)}
              className={selectedTactic === tactic 
                ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg" 
                : "bg-gradient-to-r from-rose-500/20 to-red-500/20 border border-rose-500/30 hover:from-rose-500/30 hover:to-red-500/30"}
              size="sm"
            >
              {tactic}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredTechniques.map((technique) => (
              <Card key={technique.id} className="bg-[#151d2e] border-[#2a3548] hover:border-rose-500/40 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-rose-500/20 text-rose-400 font-mono text-xs">
                          {technique.id}
                        </Badge>
                        <Badge className={tacticColors[technique.tactic]}>
                          {technique.tactic}
                        </Badge>
                        <Badge className="bg-amber-500/10 text-amber-400 text-xs">
                          L: {technique.likelihood} × I: {technique.impact}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-2">{technique.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{technique.description}</p>
                    </div>
                    <Button
                      onClick={() => importRiskMutation.mutate(technique)}
                      disabled={importRiskMutation.isPending}
                      size="sm"
                      className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Import
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-[#2a3548]">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <div className="text-xs text-slate-400 mb-1">Total Techniques</div>
              <div className="text-lg font-bold text-rose-400">{MITRE_TECHNIQUES.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs text-slate-400 mb-1">Tactics</div>
              <div className="text-lg font-bold text-amber-400">{tactics.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="text-xs text-slate-400 mb-1">High Impact</div>
              <div className="text-lg font-bold text-orange-400">
                {MITRE_TECHNIQUES.filter(t => t.impact >= 5).length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-xs text-slate-400 mb-1">Critical</div>
              <div className="text-lg font-bold text-red-400">
                {MITRE_TECHNIQUES.filter(t => t.likelihood >= 4 && t.impact >= 4).length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}