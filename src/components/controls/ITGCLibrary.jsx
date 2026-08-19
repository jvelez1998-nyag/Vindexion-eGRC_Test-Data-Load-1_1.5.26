import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Loader2, Search, Download, CheckCircle2, Cpu, Lock, Server, Cloud, Bot, Upload, Filter } from "lucide-react";
import BulkImportDialog from "@/components/import/BulkImportDialog";
import { toast } from "sonner";

const itGeneralControls = [
  // Access Controls
  { id: "AC-001", name: "User Access Management", category: "preventive", domain: "access_control", description: "Establish procedures for granting, modifying, and revoking user access rights", procedures: "1. Implement formal access request process\n2. Obtain manager approval for all access requests\n3. Provision access based on job role\n4. Document all access changes\n5. Revoke access immediately upon termination", testing: "Sample user access requests and verify approval workflow" },
  { id: "AC-002", name: "Privileged Access Management", category: "preventive", domain: "access_control", description: "Control and monitor privileged administrative access to systems", procedures: "1. Maintain inventory of privileged accounts\n2. Implement just-in-time access\n3. Require MFA for privileged access\n4. Log all privileged activities\n5. Review privileged access quarterly", testing: "Review privileged account listing and access logs" },
  { id: "AC-003", name: "Password Policy Enforcement", category: "preventive", domain: "access_control", description: "Enforce strong password requirements across all systems", procedures: "1. Minimum 12 characters\n2. Complexity requirements (upper, lower, number, special)\n3. 90-day password expiration\n4. Password history of 12\n5. Account lockout after 5 failed attempts", testing: "Review password policy configuration and test enforcement" },
  { id: "AC-004", name: "Multi-Factor Authentication", category: "preventive", domain: "access_control", description: "Implement MFA for all remote and privileged access", procedures: "1. Deploy MFA solution\n2. Enforce for VPN access\n3. Require for admin accounts\n4. Implement for cloud applications\n5. Provide user training", testing: "Test MFA requirement for remote access scenarios" },
  { id: "AC-005", name: "Access Reviews and Recertification", category: "detective", domain: "access_control", description: "Perform quarterly reviews of user access rights", procedures: "1. Generate access reports by system\n2. Distribute to application owners\n3. Review and approve access\n4. Remediate inappropriate access\n5. Document review completion", testing: "Review evidence of quarterly access reviews and remediation" },

  // Change Management
  { id: "CM-001", name: "Change Request Management", category: "preventive", domain: "network_security", description: "Control and authorize all changes to production systems", procedures: "1. Submit formal change request\n2. Complete impact assessment\n3. Obtain change approval board authorization\n4. Schedule change window\n5. Execute change with validation", testing: "Sample changes and verify approval evidence" },
  { id: "CM-002", name: "Emergency Change Procedures", category: "corrective", domain: "incident_response", description: "Define and control emergency changes to systems", procedures: "1. Document emergency change criteria\n2. Obtain emergency approvals\n3. Implement change quickly\n4. Conduct post-implementation review\n5. Update change records", testing: "Review emergency changes for proper authorization" },
  { id: "CM-003", name: "Change Testing and Validation", category: "preventive", domain: "network_security", description: "Test all changes before production deployment", procedures: "1. Define test plan\n2. Execute in test environment\n3. Document test results\n4. Obtain test approval\n5. Proceed to production", testing: "Review test evidence for production changes" },
  { id: "CM-004", name: "Version Control", category: "preventive", domain: "network_security", description: "Maintain version control for all code and configurations", procedures: "1. Use centralized repository\n2. Require peer review for commits\n3. Tag releases appropriately\n4. Maintain change history\n5. Implement branch strategy", testing: "Review version control logs and branching strategy" },
  { id: "CM-005", name: "Configuration Management Database", category: "detective", domain: "network_security", description: "Maintain accurate inventory of IT assets and configurations", procedures: "1. Document all IT assets\n2. Track configuration items\n3. Map dependencies\n4. Update on changes\n5. Reconcile quarterly", testing: "Verify CMDB accuracy through sampling" },

  // Systems Operations
  { id: "SO-001", name: "Job Scheduling and Monitoring", category: "detective", domain: "network_security", description: "Schedule, execute, and monitor automated batch jobs", procedures: "1. Define job schedule\n2. Configure job dependencies\n3. Set up alerting\n4. Monitor execution\n5. Review failed jobs daily", testing: "Review job logs and failure resolution" },
  { id: "SO-002", name: "System Performance Monitoring", category: "detective", domain: "network_security", description: "Monitor system performance and capacity", procedures: "1. Define performance thresholds\n2. Configure monitoring tools\n3. Generate performance reports\n4. Investigate anomalies\n5. Plan capacity upgrades", testing: "Review performance monitoring dashboards and alerts" },
  { id: "SO-003", name: "Patch Management", category: "preventive", domain: "network_security", description: "Apply security patches in a timely manner", procedures: "1. Subscribe to security advisories\n2. Assess patch criticality\n3. Test patches in dev\n4. Deploy to production\n5. Verify patch installation", testing: "Review patch compliance reports" },
  { id: "SO-004", name: "Antivirus and Anti-Malware", category: "detective", domain: "network_security", description: "Deploy and maintain antivirus protection", procedures: "1. Install AV on all endpoints\n2. Update signatures daily\n3. Configure real-time scanning\n4. Review quarantined items\n5. Generate compliance reports", testing: "Verify AV deployment and definition currency" },
  { id: "SO-005", name: "System Hardening", category: "preventive", domain: "network_security", description: "Implement secure baseline configurations", procedures: "1. Define hardening standards\n2. Remove unnecessary services\n3: Disable unused accounts\n4. Configure firewalls\n5. Document baselines", testing: "Scan systems against hardening benchmarks" },

  // Data Management
  { id: "DM-001", name: "Backup and Recovery", category: "preventive", domain: "business_continuity", description: "Perform regular backups and test restoration", procedures: "1. Schedule automated backups\n2. Store backups offsite\n3. Encrypt backup data\n4. Test restores monthly\n5. Document recovery procedures", testing: "Review backup logs and restoration test results" },
  { id: "DM-002", name: "Data Classification", category: "directive", domain: "data_protection", description: "Classify data based on sensitivity and criticality", procedures: "1. Define classification scheme\n2. Assign data owners\n3. Label data appropriately\n4. Apply protection controls\n5. Review classifications annually", testing: "Sample data and verify classification" },
  { id: "DM-003", name: "Data Retention and Disposal", category: "corrective", domain: "data_protection", description: "Retain data according to policy and dispose securely", procedures: "1. Define retention periods\n2. Archive data per schedule\n3. Securely delete expired data\n4. Sanitize storage media\n5. Document disposal", testing: "Review data disposal logs and certificates" },
  { id: "DM-004", name: "Database Access Controls", category: "preventive", domain: "data_protection", description: "Control access to production databases", procedures: "1. Implement role-based access\n2. Restrict direct database access\n3. Require approval for changes\n4. Audit database activities\n5. Review access quarterly", testing: "Review database user privileges and audit logs" },
  { id: "DM-005", name: "Data Encryption", category: "preventive", domain: "data_protection", description: "Encrypt sensitive data at rest and in transit", procedures: "1. Identify sensitive data\n2. Implement encryption standards\n3. Encrypt databases and files\n4. Use TLS for transmission\n5. Manage encryption keys", testing: "Verify encryption implementation on sample systems" },

  // Segregation of Duties
  { id: "SD-001", name: "Development and Production Separation", category: "preventive", domain: "network_security", description: "Segregate development, test, and production environments", procedures: "1. Maintain separate environments\n2. Control migration between environments\n3. Restrict production access\n4. Use production data masking in lower environments\n5. Document environment boundaries", testing: "Review environment architecture and access controls" },
  { id: "SD-002", name: "System Administration Segregation", category: "preventive", domain: "access_control", description: "Separate duties among system administrators", procedures: "1. Define admin roles\n2. Limit individual privileges\n3. Require dual authorization for sensitive actions\n4. Rotate responsibilities\n5. Monitor admin activities", testing: "Review admin role assignments and approval workflows" },
  { id: "SD-003", name: "Application Security Roles", category: "preventive", domain: "access_control", description: "Implement segregation within applications", procedures: "1. Design role-based permissions\n2. Prevent conflicting roles\n3. Detect SoD violations\n4. Report exceptions\n5. Remediate conflicts", testing: "Run SoD analysis reports and review violations" }
];

const cyberSecurityControls = [
  { id: "CS-001", name: "Firewall Management", category: "preventive", domain: "network_security", description: "Configure and maintain network firewalls", procedures: "1. Define firewall rule standards\n2. Implement default-deny policy\n3. Review rules quarterly\n4. Remove unused rules\n5. Document all changes", testing: "Review firewall ruleset and change logs" },
  { id: "CS-002", name: "Intrusion Detection/Prevention", category: "detective", domain: "network_security", description: "Deploy IDS/IPS to detect malicious activity", procedures: "1. Deploy sensors at network boundaries\n2. Configure detection signatures\n3. Tune to reduce false positives\n4. Monitor alerts 24/7\n5. Investigate incidents promptly", testing: "Review IDS/IPS alerts and response procedures" },
  { id: "CS-003", name: "Security Information and Event Management", category: "detective", domain: "network_security", description: "Aggregate and correlate security logs", procedures: "1. Collect logs from all systems\n2. Configure correlation rules\n3. Set up alerting\n4. Investigate anomalies\n5. Retain logs per policy", testing: "Review SIEM configuration and alert response" },
  { id: "CS-004", name: "Vulnerability Scanning", category: "detective", domain: "network_security", description: "Scan systems for security vulnerabilities", procedures: "1. Schedule monthly scans\n2. Scan all internet-facing systems\n3. Generate vulnerability reports\n4. Prioritize by risk\n5. Track remediation", testing: "Review scan results and remediation tracking" },
  { id: "CS-005", name: "Penetration Testing", category: "detective", domain: "network_security", description: "Conduct annual penetration tests", procedures: "1. Define test scope\n2. Engage qualified testers\n3. Execute testing\n4. Review findings\n5. Remediate vulnerabilities", testing: "Review penetration test reports and remediation" },
  { id: "CS-006", name: "Security Awareness Training", category: "directive", domain: "access_control", description: "Train users on security best practices", procedures: "1. Develop training content\n2. Deliver annual training\n3. Conduct phishing simulations\n4. Track completion rates\n5. Update content regularly", testing: "Review training records and completion rates" },
  { id: "CS-007", name: "Incident Response Plan", category: "corrective", domain: "incident_response", description: "Maintain and test incident response procedures", procedures: "1. Document response procedures\n2. Define roles and responsibilities\n3. Establish communication protocols\n4. Conduct annual tabletop exercises\n5. Update plan based on lessons learned", testing: "Review incident response plan and test results" },
  { id: "CS-008", name: "Endpoint Detection and Response", category: "detective", domain: "network_security", description: "Deploy EDR on all endpoints", procedures: "1. Install EDR agents\n2. Configure detection policies\n3. Monitor for threats\n4. Investigate alerts\n5. Contain and remediate", testing: "Verify EDR deployment and threat response" },
  { id: "CS-009", name: "Network Segmentation", category: "preventive", domain: "network_security", description: "Segment network to limit lateral movement", procedures: "1. Design network zones\n2. Implement VLANs\n3. Configure inter-zone firewalls\n4. Control zone access\n5. Monitor zone traffic", testing: "Review network architecture and zone controls" },
  { id: "CS-010", name: "Data Loss Prevention", category: "preventive", domain: "data_protection", description: "Prevent unauthorized data exfiltration", procedures: "1. Deploy DLP solution\n2. Define data policies\n3. Monitor data movement\n4. Block policy violations\n5. Investigate incidents", testing: "Review DLP policies and incident logs" },
  { id: "CS-011", name: "Web Application Firewall", category: "preventive", domain: "network_security", description: "Protect web applications from attacks", procedures: "1. Deploy WAF\n2. Configure OWASP rules\n3. Tune for applications\n4. Monitor attacks\n5. Update rules regularly", testing: "Review WAF configuration and attack logs" },
  { id: "CS-012", name: "Email Security Gateway", category: "preventive", domain: "network_security", description: "Filter malicious emails", procedures: "1. Deploy email gateway\n2. Configure spam filters\n3. Block malicious attachments\n4. Implement anti-phishing\n5. Quarantine suspicious emails", testing: "Review email filtering statistics" },
  { id: "CS-013", name: "Zero Trust Architecture", category: "preventive", domain: "access_control", description: "Implement zero trust principles", procedures: "1. Verify every access request\n2. Implement least privilege\n3. Assume breach mentality\n4. Inspect and log all traffic\n5. Continuously validate trust", testing: "Review zero trust implementation" },
  { id: "CS-014", name: "Threat Intelligence", category: "detective", domain: "network_security", description: "Consume threat intelligence feeds", procedures: "1. Subscribe to threat feeds\n2. Integrate with security tools\n3. Analyze indicators of compromise\n4. Hunt for threats proactively\n5. Share intelligence", testing: "Review threat intelligence usage" },
  { id: "CS-015", name: "Security Orchestration and Automation", category: "corrective", domain: "incident_response", description: "Automate security response", procedures: "1. Define automation playbooks\n2. Integrate security tools\n3. Automate common responses\n4. Reduce response time\n5. Measure effectiveness", testing: "Review automation playbooks and metrics" }
];

const aiMLControls = [
  { id: "AI-001", name: "AI Model Governance", category: "directive", domain: "data_protection", description: "Establish governance for AI/ML model development and deployment", procedures: "1. Define AI governance framework\n2. Establish model approval process\n3. Document model inventory\n4. Assign model owners\n5. Review models annually", testing: "Review AI governance documentation and model inventory" },
  { id: "AI-002", name: "Data Quality for AI", category: "preventive", domain: "data_protection", description: "Ensure training data quality and representativeness", procedures: "1. Validate data sources\n2. Check for bias\n3. Document data lineage\n4. Test data quality\n5. Maintain data versioning", testing: "Review data quality assessments and validation" },
  { id: "AI-003", name: "Model Bias Testing", category: "detective", domain: "data_protection", description: "Test AI models for bias and fairness", procedures: "1. Define fairness metrics\n2. Test across demographics\n3. Identify bias patterns\n4. Document findings\n5. Remediate bias issues", testing: "Review bias testing reports and remediation" },
  { id: "AI-004", name: "AI Model Explainability", category: "directive", domain: "data_protection", description: "Document how AI models make decisions", procedures: "1. Select interpretable models where possible\n2. Document model logic\n3. Provide decision explanations\n4. Enable human review\n5. Maintain audit trails", testing: "Review model documentation and explainability features" },
  { id: "AI-005", name: "AI Model Monitoring", category: "detective", domain: "network_security", description: "Monitor AI model performance and drift", procedures: "1. Define performance baselines\n2. Monitor accuracy metrics\n3. Detect model drift\n4. Alert on degradation\n5. Retrain as needed", testing: "Review model monitoring dashboards" },
  { id: "AI-006", name: "AI Security and Adversarial Testing", category: "detective", domain: "network_security", description: "Test AI models against adversarial attacks", procedures: "1. Identify attack vectors\n2. Conduct adversarial testing\n3. Implement defenses\n4. Monitor for attacks\n5. Update models", testing: "Review adversarial testing results" },
  { id: "AI-007", name: "AI Privacy and Data Protection", category: "preventive", domain: "data_protection", description: "Protect privacy in AI systems", procedures: "1. Implement data minimization\n2. Use privacy-preserving techniques\n3. Anonymize training data\n4. Control model access\n5. Respect data subject rights", testing: "Review privacy controls in AI systems" },
  { id: "AI-008", name: "AI Model Versioning and Rollback", category: "preventive", domain: "business_continuity", description: "Maintain version control for AI models", procedures: "1. Version all model artifacts\n2. Track model changes\n3. Document deployments\n4. Enable quick rollback\n5. Test rollback procedures", testing: "Review model versioning and rollback capabilities" },
  { id: "AI-009", name: "AI Transparency and Disclosure", category: "directive", domain: "data_protection", description: "Disclose AI usage to stakeholders", procedures: "1. Identify AI-driven processes\n2. Disclose to users\n3. Provide opt-out options\n4. Document AI usage\n5. Update disclosures", testing: "Review AI transparency disclosures" },
  { id: "AI-010", name: "Third-Party AI Risk Management", category: "preventive", domain: "vendor_management", description: "Assess risks of third-party AI services", procedures: "1. Inventory third-party AI\n2. Assess vendor controls\n3. Review AI documentation\n4. Test AI outputs\n5. Monitor vendor risk", testing: "Review third-party AI risk assessments" }
];

const operationalControls = [
  { id: "OP-001", name: "IT Service Continuity Planning", category: "preventive", domain: "business_continuity", description: "Develop and test IT continuity plans", procedures: "1. Identify critical services\n2. Define recovery objectives\n3. Document recovery procedures\n4. Test annually\n5. Update based on changes", testing: "Review BCP documentation and test results" },
  { id: "OP-002", name: "Capacity Planning", category: "preventive", domain: "network_security", description: "Monitor and plan for system capacity", procedures: "1. Define capacity thresholds\n2. Monitor resource utilization\n3. Forecast future needs\n4. Plan upgrades proactively\n5. Review quarterly", testing: "Review capacity reports and upgrade plans" },
  { id: "OP-003", name: "Problem Management", category: "corrective", domain: "incident_response", description: "Identify and resolve recurring issues", procedures: "1. Track incidents and problems\n2. Perform root cause analysis\n3. Implement permanent fixes\n4. Document known errors\n5. Close problem records", testing: "Review problem management records" },
  { id: "OP-004", name: "Vendor Management", category: "preventive", domain: "vendor_management", description: "Assess and monitor third-party vendors", procedures: "1. Conduct vendor due diligence\n2. Review vendor controls\n3. Execute contracts\n4. Monitor performance\n5. Review risks annually", testing: "Review vendor assessments and contracts" },
  { id: "OP-005", name: "Service Level Management", category: "directive", domain: "network_security", description: "Define and monitor service level agreements", procedures: "1. Define service levels\n2. Document SLAs\n3. Monitor compliance\n4. Report performance\n5. Review and adjust", testing: "Review SLA documentation and performance reports" },
  { id: "OP-006", name: "Availability Management", category: "preventive", domain: "business_continuity", description: "Ensure high availability of critical systems", procedures: "1. Define availability targets\n2. Implement redundancy\n3. Monitor uptime\n4. Plan maintenance windows\n5. Report availability", testing: "Review availability metrics and reports" },
  { id: "OP-007", name: "IT Asset Lifecycle Management", category: "directive", domain: "physical_security", description: "Manage IT assets from procurement to disposal", procedures: "1. Procure approved assets\n2. Tag and track assets\n3. Maintain inventory\n4. Plan replacements\n5. Dispose securely", testing: "Review asset inventory and disposal records" },
  { id: "OP-008", name: "Physical Security Controls", category: "preventive", domain: "physical_security", description: "Secure physical access to IT facilities", procedures: "1. Control building access\n2. Secure data centers\n3. Monitor with cameras\n4. Escort visitors\n5. Review access logs", testing: "Inspect physical controls and review access logs" },
  { id: "OP-009", name: "Environmental Controls", category: "preventive", domain: "physical_security", description: "Protect systems from environmental hazards", procedures: "1. Maintain HVAC systems\n2. Implement fire suppression\n3. Protect from water damage\n4. Monitor environmental conditions\n5. Plan for disasters", testing: "Inspect environmental controls" },
  { id: "OP-010", name: "Documentation Management", category: "directive", domain: "network_security", description: "Maintain accurate IT documentation", procedures: "1. Document all systems\n2. Maintain network diagrams\n3. Update on changes\n4. Control document versions\n5. Review annually", testing: "Review IT documentation for currency" }
];

export default function ITGCLibrary({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [selectedControls, setSelectedControls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("itgc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showBulkImport, setShowBulkImport] = useState(false);

  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (controlsData) => base44.entities.Control.bulkCreate(controlsData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      toast.success(`Imported ${data.length} controls successfully`);
      setSelectedControls([]);
      onOpenChange(false);
    }
  });

  const handleImport = () => {
    if (selectedControls.length === 0) {
      toast.error("Please select at least one control to import");
      return;
    }

    const controlsToImport = selectedControls.map(control => ({
      name: `${control.id}: ${control.name}`,
      description: control.description,
      control_objective: control.description,
      control_procedures: control.procedures,
      category: control.category,
      domain: control.domain,
      status: "planned",
      framework_mappings: {
        ITGC: [control.id]
      },
      regulatory_mappings: [`IT General Controls - ${control.domain}`]
    }));

    importMutation.mutate(controlsToImport);
  };

  const toggleControl = (control) => {
    setSelectedControls(prev => {
      const exists = prev.find(c => c.id === control.id);
      if (exists) {
        return prev.filter(c => c.id !== control.id);
      } else {
        return [...prev, control];
      }
    });
  };

  const toggleAll = (controls) => {
    const filteredControls = getFilteredControls(controls);
    if (selectedControls.length === filteredControls.length) {
      setSelectedControls([]);
    } else {
      setSelectedControls([...filteredControls]);
    }
  };

  const getFilteredControls = (controls) => {
    return controls.filter(control => {
      const matchesSearch = searchQuery === "" ||
        control.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        control.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        control.procedures.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || control.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  };

  const renderControlsList = (controls, icon, iconColor) => {
    const filteredControls = getFilteredControls(controls);
    
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedControls.length === filteredControls.length && filteredControls.length > 0}
              onCheckedChange={() => toggleAll(controls)}
            />
            <span className="text-sm text-slate-400">
              {selectedControls.filter(sc => filteredControls.find(fc => fc.id === sc.id)).length} of {filteredControls.length} selected
            </span>
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-2 pr-4">
            {filteredControls.map((control, idx) => (
              <Card
                key={idx}
                className={`bg-[#151d2e] border-[#2a3548] cursor-pointer hover:border-[#3a4558] transition-all ${
                  selectedControls.find(c => c.id === control.id) ? 'border-indigo-500/50' : ''
                }`}
                onClick={() => toggleControl(control)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={!!selectedControls.find(c => c.id === control.id)}
                      onCheckedChange={() => toggleControl(control)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {icon}
                            <h4 className="font-semibold text-white text-sm">
                              {control.id}: {control.name}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{control.description}</p>
                        </div>
                      </div>
                      <div className="bg-[#1a2332] rounded p-2 mb-2">
                        <p className="text-[10px] text-slate-500 font-medium mb-1">CONTROL PROCEDURES:</p>
                        <p className="text-xs text-slate-300 whitespace-pre-line">{control.procedures}</p>
                      </div>
                      {control.testing && (
                        <div className="bg-blue-500/5 rounded p-2">
                          <p className="text-[10px] text-blue-400 font-medium mb-1">TESTING APPROACH:</p>
                          <p className="text-xs text-slate-300">{control.testing}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                          {control.category}
                        </Badge>
                        <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                          {control.domain}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-emerald-400" />
            IT General Controls Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search controls..."
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="detective">Detective</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
                <SelectItem value="directive">Directive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowBulkImport(true)}
              variant="outline"
              className="border-[#2a3548]"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedControls.length === 0 || importMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Import Selected ({selectedControls.length})
                </>
              )}
            </Button>
          </div>

          <BulkImportDialog
            open={showBulkImport}
            onOpenChange={setShowBulkImport}
            entityType="control"
            onImportComplete={() => {
              queryClient.invalidateQueries({ queryKey: ['controls'] });
            }}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#151d2e] border border-[#2a3548] w-full justify-start">
              <TabsTrigger value="itgc" className="gap-2">
                <Server className="h-4 w-4" />
                IT General Controls ({itGeneralControls.length})
              </TabsTrigger>
              <TabsTrigger value="cyber" className="gap-2">
                <Shield className="h-4 w-4" />
                Cybersecurity ({cyberSecurityControls.length})
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Bot className="h-4 w-4" />
                AI/ML Controls ({aiMLControls.length})
              </TabsTrigger>
              <TabsTrigger value="operational" className="gap-2">
                <Cpu className="h-4 w-4" />
                Operational ({operationalControls.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="itgc">
              {renderControlsList(itGeneralControls, <Lock className="h-4 w-4 text-blue-400" />, "text-blue-400")}
            </TabsContent>

            <TabsContent value="cyber">
              {renderControlsList(cyberSecurityControls, <Shield className="h-4 w-4 text-red-400" />, "text-red-400")}
            </TabsContent>

            <TabsContent value="ai">
              {renderControlsList(aiMLControls, <Bot className="h-4 w-4 text-purple-400" />, "text-purple-400")}
            </TabsContent>

            <TabsContent value="operational">
              {renderControlsList(operationalControls, <Cpu className="h-4 w-4 text-emerald-400" />, "text-emerald-400")}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}