import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Search, Plus, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CIS_CONTROLS = [
  {
    id: "CIS-1",
    title: "Inventory and Control of Enterprise Assets",
    description: "Actively manage (inventory, track, and correct) all enterprise assets (end-user devices, including portable and mobile; network devices; non-computing/Internet of Things (IoT) devices; and servers) connected to the infrastructure physically, virtually, remotely, and those within cloud environments, to accurately know the totality of assets that need to be monitored and protected within the enterprise.",
    implementation_group: "IG1",
    asset_type: "Devices",
    security_function: "Identify"
  },
  {
    id: "CIS-2",
    title: "Inventory and Control of Software Assets",
    description: "Actively manage (inventory, track, and correct) all software (operating systems and applications) on the network so that only authorized software is installed and can execute, and that unauthorized and unmanaged software is found and prevented from installation or execution.",
    implementation_group: "IG1",
    asset_type: "Applications",
    security_function: "Identify"
  },
  {
    id: "CIS-3",
    title: "Data Protection",
    description: "Develop processes and technical controls to identify, classify, securely handle, retain, and dispose of data.",
    implementation_group: "IG1",
    asset_type: "Data",
    security_function: "Protect"
  },
  {
    id: "CIS-4",
    title: "Secure Configuration of Enterprise Assets and Software",
    description: "Establish and maintain the secure configuration of enterprise assets (end-user devices, including portable and mobile; network devices; non-computing/IoT devices; and servers) and software (operating systems and applications).",
    implementation_group: "IG1",
    asset_type: "Devices",
    security_function: "Protect"
  },
  {
    id: "CIS-5",
    title: "Account Management",
    description: "Use processes and tools to assign and manage authorization to credentials for user accounts, including administrator accounts, as well as service accounts, to enterprise assets and software.",
    implementation_group: "IG1",
    asset_type: "Users",
    security_function: "Protect"
  },
  {
    id: "CIS-6",
    title: "Access Control Management",
    description: "Use processes and tools to create, assign, manage, and revoke access credentials and privileges for user, administrator, and service accounts for enterprise assets and software.",
    implementation_group: "IG1",
    asset_type: "Users",
    security_function: "Protect"
  },
  {
    id: "CIS-7",
    title: "Continuous Vulnerability Management",
    description: "Develop a plan to continuously assess and track vulnerabilities on all enterprise assets within the enterprise's infrastructure, in order to remediate, and minimize, the window of opportunity for attackers.",
    implementation_group: "IG1",
    asset_type: "Devices",
    security_function: "Detect"
  },
  {
    id: "CIS-8",
    title: "Audit Log Management",
    description: "Collect, alert, review, and retain audit logs of events that could help detect, understand, or recover from an attack.",
    implementation_group: "IG1",
    asset_type: "Network",
    security_function: "Detect"
  },
  {
    id: "CIS-9",
    title: "Email and Web Browser Protections",
    description: "Improve protections and detections of threats from email and web vectors, as these are opportunities for attackers to manipulate human behavior through direct engagement.",
    implementation_group: "IG1",
    asset_type: "Network",
    security_function: "Protect"
  },
  {
    id: "CIS-10",
    title: "Malware Defenses",
    description: "Prevent or control the installation, spread, and execution of malicious applications, code, or scripts on enterprise assets.",
    implementation_group: "IG1",
    asset_type: "Devices",
    security_function: "Protect"
  },
  {
    id: "CIS-11",
    title: "Data Recovery",
    description: "Establish and maintain data recovery practices sufficient to restore in-scope enterprise assets to a pre-incident and trusted state.",
    implementation_group: "IG1",
    asset_type: "Data",
    security_function: "Recover"
  },
  {
    id: "CIS-12",
    title: "Network Infrastructure Management",
    description: "Establish, implement, and actively manage (track, report, correct) network devices, in order to prevent attackers from exploiting vulnerable network services and access points.",
    implementation_group: "IG2",
    asset_type: "Network",
    security_function: "Protect"
  },
  {
    id: "CIS-13",
    title: "Network Monitoring and Defense",
    description: "Operate processes and tooling to establish and maintain comprehensive network monitoring and defense against security threats across the enterprise's network infrastructure and user base.",
    implementation_group: "IG2",
    asset_type: "Network",
    security_function: "Detect"
  },
  {
    id: "CIS-14",
    title: "Security Awareness and Skills Training",
    description: "Establish and maintain a security awareness program to influence behavior among the workforce to be security conscious and properly skilled to reduce cybersecurity risks to the enterprise.",
    implementation_group: "IG1",
    asset_type: "Users",
    security_function: "Protect"
  },
  {
    id: "CIS-15",
    title: "Service Provider Management",
    description: "Develop a process to evaluate service providers who hold sensitive data, or are responsible for an enterprise's critical IT platforms or processes, to ensure these providers are protecting those platforms and data appropriately.",
    implementation_group: "IG2",
    asset_type: "Devices",
    security_function: "Identify"
  },
  {
    id: "CIS-16",
    title: "Application Software Security",
    description: "Manage the security life cycle of in-house developed, hosted, or acquired software to prevent, detect, and remediate security weaknesses before they can impact the enterprise.",
    implementation_group: "IG2",
    asset_type: "Applications",
    security_function: "Protect"
  },
  {
    id: "CIS-17",
    title: "Incident Response Management",
    description: "Establish a program to develop and maintain an incident response capability (e.g., policies, plans, procedures, defined roles, training, and communications) to prepare, detect, and quickly respond to an attack.",
    implementation_group: "IG1",
    asset_type: "Network",
    security_function: "Respond"
  },
  {
    id: "CIS-18",
    title: "Penetration Testing",
    description: "Test the effectiveness and resiliency of enterprise assets through identifying and exploiting weaknesses in controls (people, processes, and technology), and simulating the objectives and actions of an attacker.",
    implementation_group: "IG3",
    asset_type: "Network",
    security_function: "Detect"
  }
];

export default function CISControlLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIG, setSelectedIG] = useState("all");
  const queryClient = useQueryClient();

  const importControlMutation = useMutation({
    mutationFn: (control) => base44.entities.Control.create({
      control_id: control.id,
      title: control.title,
      description: control.description,
      category: "technical",
      control_type: "preventive",
      implementation_status: "not_started",
      framework: "CIS Controls v8",
      frequency: "continuous",
      owner: "",
      control_objective: control.description,
      testing_procedure: `Verify implementation of ${control.title}`,
      evidence_required: "Documentation, system configuration, audit logs"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['controls']);
      toast.success("CIS Control imported successfully");
    },
    onError: () => {
      toast.error("Failed to import control");
    }
  });

  const importAllMutation = useMutation({
    mutationFn: async () => {
      const filtered = filteredControls;
      for (const control of filtered) {
        await base44.entities.Control.create({
          control_id: control.id,
          title: control.title,
          description: control.description,
          category: "technical",
          control_type: "preventive",
          implementation_status: "not_started",
          framework: "CIS Controls v8",
          frequency: "continuous",
          owner: "",
          control_objective: control.description,
          testing_procedure: `Verify implementation of ${control.title}`,
          evidence_required: "Documentation, system configuration, audit logs"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['controls']);
      toast.success("All CIS Controls imported successfully");
    },
    onError: () => {
      toast.error("Failed to import controls");
    }
  });

  const filteredControls = CIS_CONTROLS.filter(control => {
    const matchesSearch = control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIG = selectedIG === "all" || control.implementation_group === selectedIG;
    return matchesSearch && matchesIG;
  });

  const igColors = {
    "IG1": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "IG2": "bg-blue-500/10 text-blue-400 border-blue-500/30",
    "IG3": "bg-purple-500/10 text-purple-400 border-purple-500/30"
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base">CIS Controls v8 Library</CardTitle>
              <p className="text-xs text-slate-400 mt-1">18 Critical Security Controls</p>
            </div>
          </div>
          <Button
            onClick={() => importAllMutation.mutate()}
            disabled={importAllMutation.isPending || filteredControls.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Import All ({filteredControls.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search CIS controls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedIG === "all" ? "default" : "outline"}
              onClick={() => setSelectedIG("all")}
              className={selectedIG === "all" ? "bg-indigo-600" : "border-[#2a3548]"}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedIG === "IG1" ? "default" : "outline"}
              onClick={() => setSelectedIG("IG1")}
              className={selectedIG === "IG1" ? "bg-emerald-600" : "border-[#2a3548]"}
              size="sm"
            >
              IG1
            </Button>
            <Button
              variant={selectedIG === "IG2" ? "default" : "outline"}
              onClick={() => setSelectedIG("IG2")}
              className={selectedIG === "IG2" ? "bg-blue-600" : "border-[#2a3548]"}
              size="sm"
            >
              IG2
            </Button>
            <Button
              variant={selectedIG === "IG3" ? "default" : "outline"}
              onClick={() => setSelectedIG("IG3")}
              className={selectedIG === "IG3" ? "bg-purple-600" : "border-[#2a3548]"}
              size="sm"
            >
              IG3
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-4">
            {filteredControls.map((control) => (
              <Card key={control.id} className="bg-[#151d2e] border-[#2a3548] hover:border-blue-500/40 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500/20 text-blue-400 font-mono text-xs">
                          {control.id}
                        </Badge>
                        <Badge className={igColors[control.implementation_group]}>
                          {control.implementation_group}
                        </Badge>
                        <Badge className="bg-slate-500/10 text-slate-400 text-xs">
                          {control.security_function}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-2">{control.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{control.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-indigo-500/10 text-indigo-400 text-xs">
                          {control.asset_type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => importControlMutation.mutate(control)}
                      disabled={importControlMutation.isPending}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
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
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-slate-400 mb-1">IG1 Controls</div>
              <div className="text-lg font-bold text-emerald-400">
                {CIS_CONTROLS.filter(c => c.implementation_group === "IG1").length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-xs text-slate-400 mb-1">IG2 Controls</div>
              <div className="text-lg font-bold text-blue-400">
                {CIS_CONTROLS.filter(c => c.implementation_group === "IG2").length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-xs text-slate-400 mb-1">IG3 Controls</div>
              <div className="text-lg font-bold text-purple-400">
                {CIS_CONTROLS.filter(c => c.implementation_group === "IG3").length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-xs text-slate-400 mb-1">Total</div>
              <div className="text-lg font-bold text-indigo-400">{CIS_CONTROLS.length}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}