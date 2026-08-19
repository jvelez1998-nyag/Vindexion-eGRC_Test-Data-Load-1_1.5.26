import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Search, Download, CheckCircle2, Shield, Server, Cloud, Bot, Briefcase, DollarSign, Sparkles, Link2, Upload, Filter } from "lucide-react";
import BulkImportDialog from "@/components/import/BulkImportDialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const technologyRisks = [
  { id: "TR-001", name: "System Outage and Downtime", category: "operational", likelihood: 3, impact: 4, description: "Critical systems experience unplanned outages affecting business operations", mitigation: "Implement high availability architecture, redundant systems, automated failover, comprehensive monitoring, and incident response procedures" },
  { id: "TR-002", name: "Data Breach and Unauthorized Access", category: "cyber", likelihood: 4, impact: 5, description: "Unauthorized individuals gain access to sensitive data or systems", mitigation: "Implement zero-trust architecture, MFA, encryption, DLP, access reviews, and security monitoring" },
  { id: "TR-003", name: "Ransomware Attack", category: "cyber", likelihood: 4, impact: 5, description: "Malicious actors encrypt systems and demand ransom for decryption", mitigation: "Deploy EDR, email filtering, network segmentation, offline backups, patch management, and user training" },
  { id: "TR-004", name: "Legacy System Failure", category: "operational", likelihood: 3, impact: 4, description: "Outdated systems fail or become unsupported creating operational and security risks", mitigation: "Develop modernization roadmap, implement compensating controls, maintain vendor support agreements, and plan migration" },
  { id: "TR-005", name: "Cloud Service Provider Failure", category: "operational", likelihood: 2, impact: 4, description: "Cloud provider experiences outage or security incident affecting services", mitigation: "Multi-cloud strategy, vendor assessment, SLA monitoring, backup strategies, and disaster recovery testing" },
  { id: "TR-006", name: "Inadequate Change Management", category: "operational", likelihood: 3, impact: 3, description: "Poor change control leads to system failures or security vulnerabilities", mitigation: "Implement formal change process, CAB reviews, testing requirements, rollback procedures, and change tracking" },
  { id: "TR-007", name: "Insufficient Patch Management", category: "cyber", likelihood: 4, impact: 4, description: "Systems remain vulnerable due to missing security patches", mitigation: "Automated patch scanning, risk-based prioritization, testing procedures, patch deployment tracking, and compliance reporting" },
  { id: "TR-008", name: "Privileged Account Abuse", category: "cyber", likelihood: 3, impact: 5, description: "Misuse or compromise of privileged administrative accounts", mitigation: "PAM solution, just-in-time access, MFA, session recording, privileged activity monitoring, and regular reviews" },
  { id: "TR-009", name: "Weak Access Controls", category: "cyber", likelihood: 4, impact: 4, description: "Inadequate access management leads to excessive permissions", mitigation: "Implement RBAC, least privilege, quarterly access reviews, automated provisioning/deprovisioning, and SoD controls" },
  { id: "TR-010", name: "Insufficient Backup and Recovery", category: "operational", likelihood: 3, impact: 5, description: "Inability to recover data or systems after incident", mitigation: "Automated backups, offsite storage, regular restoration tests, RTO/RPO definition, and recovery documentation" },
  { id: "TR-011", name: "Third-Party Software Vulnerabilities", category: "cyber", likelihood: 4, impact: 4, description: "Vulnerabilities in third-party components compromise security", mitigation: "Software composition analysis, vulnerability scanning, vendor assessments, update management, and security testing" },
  { id: "TR-012", name: "Inadequate Logging and Monitoring", category: "cyber", likelihood: 3, impact: 3, description: "Insufficient visibility into security events and incidents", mitigation: "Deploy SIEM, centralized logging, real-time alerting, log retention policies, and security operations center" },
  { id: "TR-013", name: "Network Infrastructure Failure", category: "operational", likelihood: 2, impact: 4, description: "Network equipment failure disrupts connectivity and services", mitigation: "Redundant network paths, load balancers, network monitoring, maintenance schedules, and spare equipment inventory" },
  { id: "TR-014", name: "Denial of Service Attack", category: "cyber", likelihood: 3, impact: 4, description: "Attackers overwhelm systems preventing legitimate access", mitigation: "DDoS protection services, rate limiting, WAF, traffic analysis, incident response procedures, and capacity planning" },
  { id: "TR-015", name: "SQL Injection Attack", category: "cyber", likelihood: 3, impact: 5, description: "Attackers exploit database vulnerabilities to access or modify data", mitigation: "Parameterized queries, input validation, WAF, code review, security testing, and least privilege database accounts" }
];

const cyberSecurityRisks = [
  { id: "CS-001", name: "Phishing and Social Engineering", category: "cyber", likelihood: 5, impact: 4, description: "Employees fall victim to phishing attacks compromising credentials", mitigation: "Security awareness training, phishing simulations, email filtering, MFA, and incident reporting procedures" },
  { id: "CS-002", name: "Insider Threat", category: "cyber", likelihood: 3, impact: 5, description: "Malicious or negligent insiders compromise security or data", mitigation: "Background checks, access controls, user activity monitoring, DLP, exit procedures, and security culture" },
  { id: "CS-003", name: "Advanced Persistent Threat", category: "cyber", likelihood: 3, impact: 5, description: "Sophisticated attackers maintain long-term unauthorized access", mitigation: "Threat intelligence, EDR, network segmentation, anomaly detection, threat hunting, and incident response" },
  { id: "CS-004", name: "Supply Chain Attack", category: "cyber", likelihood: 3, impact: 5, description: "Attackers compromise systems through trusted vendors or suppliers", mitigation: "Vendor security assessments, code signing, software verification, supply chain monitoring, and incident response" },
  { id: "CS-005", name: "Zero-Day Vulnerability Exploitation", category: "cyber", likelihood: 2, impact: 5, description: "Attackers exploit unknown vulnerabilities before patches available", mitigation: "Virtual patching, IPS, behavioral monitoring, threat intelligence, network segmentation, and rapid response" },
  { id: "CS-006", name: "Cryptojacking", category: "cyber", likelihood: 3, impact: 2, description: "Unauthorized use of computing resources for cryptocurrency mining", mitigation: "Endpoint protection, network monitoring, application whitelisting, and resource utilization alerts" },
  { id: "CS-007", name: "Mobile Device Compromise", category: "cyber", likelihood: 4, impact: 3, description: "Mobile devices infected with malware or stolen with sensitive data", mitigation: "MDM solution, remote wipe capabilities, device encryption, app vetting, and BYOD policies" },
  { id: "CS-008", name: "IoT Device Vulnerabilities", category: "cyber", likelihood: 4, impact: 3, description: "Insecure IoT devices provide network entry points", mitigation: "IoT inventory, network segmentation, default credential changes, firmware updates, and monitoring" },
  { id: "CS-009", name: "API Security Breach", category: "cyber", likelihood: 4, impact: 4, description: "Insecure APIs expose data or functionality to attackers", mitigation: "API gateway, authentication, rate limiting, input validation, security testing, and API monitoring" },
  { id: "CS-010", name: "Shadow IT", category: "cyber", likelihood: 4, impact: 3, description: "Unapproved applications and services create security gaps", mitigation: "CASB, approved software catalog, user education, discovery tools, and governance policies" }
];

const aiMLRisks = [
  { id: "AI-001", name: "AI Model Bias and Discrimination", category: "compliance", likelihood: 4, impact: 4, description: "AI models produce biased or discriminatory outcomes", mitigation: "Bias testing, diverse training data, fairness metrics, model monitoring, human oversight, and documentation" },
  { id: "AI-002", name: "AI Model Drift and Degradation", category: "operational", likelihood: 4, impact: 3, description: "AI model performance degrades over time affecting accuracy", mitigation: "Continuous monitoring, performance baselines, automated retraining, version control, and rollback procedures" },
  { id: "AI-003", name: "Training Data Poisoning", category: "cyber", likelihood: 3, impact: 4, description: "Malicious actors manipulate training data to compromise models", mitigation: "Data validation, source verification, anomaly detection, data lineage tracking, and secure pipelines" },
  { id: "AI-004", name: "Model Inversion Attack", category: "cyber", likelihood: 3, impact: 4, description: "Attackers extract sensitive training data from deployed models", mitigation: "Differential privacy, model access controls, query rate limiting, and monitoring for extraction attempts" },
  { id: "AI-005", name: "Adversarial ML Attacks", category: "cyber", likelihood: 3, impact: 4, description: "Manipulated inputs cause AI models to produce incorrect outputs", mitigation: "Adversarial testing, input validation, model hardening, anomaly detection, and human review for critical decisions" },
  { id: "AI-006", name: "AI Hallucination and Misinformation", category: "operational", likelihood: 4, impact: 3, description: "AI generates false or misleading information", mitigation: "Output validation, confidence scoring, human review, citation requirements, and disclosure of AI usage" },
  { id: "AI-007", name: "AI Intellectual Property Theft", category: "cyber", likelihood: 3, impact: 4, description: "Proprietary AI models or data stolen by competitors", mitigation: "Access controls, model encryption, watermarking, usage monitoring, NDAs, and legal protections" },
  { id: "AI-008", name: "Lack of AI Explainability", category: "compliance", likelihood: 4, impact: 3, description: "Inability to explain AI decisions creates regulatory and trust issues", mitigation: "Interpretable models, decision logging, documentation, explainability tools, and human oversight" },
  { id: "AI-009", name: "AI Privacy Violations", category: "compliance", likelihood: 4, impact: 5, description: "AI systems process personal data without consent or inappropriately", mitigation: "Privacy by design, data minimization, consent management, anonymization, and privacy impact assessments" },
  { id: "AI-010", name: "Unethical AI Use", category: "compliance", likelihood: 3, impact: 4, description: "AI used for surveillance, manipulation, or other unethical purposes", mitigation: "AI ethics framework, use case review, stakeholder consultation, transparency, and governance oversight" }
];

const operationalRisks = [
  { id: "OR-001", name: "Key Person Dependency", category: "operational", likelihood: 3, impact: 4, description: "Critical business knowledge concentrated in few individuals", mitigation: "Knowledge documentation, cross-training, succession planning, process automation, and team redundancy" },
  { id: "OR-002", name: "Process Inefficiency and Errors", category: "operational", likelihood: 4, impact: 3, description: "Manual processes prone to errors and delays", mitigation: "Process automation, standard operating procedures, quality checks, error tracking, and continuous improvement" },
  { id: "OR-003", name: "Business Continuity Failure", category: "operational", likelihood: 2, impact: 5, description: "Inability to maintain operations during disruption", mitigation: "BCP development, annual testing, crisis management, alternate sites, and employee communication plans" },
  { id: "OR-004", name: "Vendor Service Failure", category: "operational", likelihood: 3, impact: 4, description: "Critical vendor fails to deliver services", mitigation: "Vendor risk assessments, SLA monitoring, backup vendors, exit strategies, and vendor performance reviews" },
  { id: "OR-005", name: "Capacity Constraints", category: "operational", likelihood: 3, impact: 3, description: "Infrastructure unable to handle growth or peak demand", mitigation: "Capacity planning, performance monitoring, scalability design, load testing, and resource forecasting" },
  { id: "OR-006", name: "Data Quality Issues", category: "operational", likelihood: 4, impact: 3, description: "Poor data quality affects decision-making and reporting", mitigation: "Data governance, quality checks, master data management, data stewards, and remediation procedures" },
  { id: "OR-007", name: "Project Delivery Failure", category: "operational", likelihood: 3, impact: 3, description: "IT projects fail to deliver on time, budget, or scope", mitigation: "Project governance, stage gates, resource allocation, risk management, and lessons learned" },
  { id: "OR-008", name: "Inadequate Disaster Recovery", category: "operational", likelihood: 2, impact: 5, description: "Inability to recover IT systems after major incident", mitigation: "DR plan, annual testing, recovery procedures, RTO/RPO targets, and documentation" },
  { id: "OR-009", name: "Third-Party Concentration Risk", category: "operational", likelihood: 3, impact: 4, description: "Over-reliance on single vendor creates dependency", mitigation: "Vendor diversification, exit planning, alternative solutions, and risk assessments" },
  { id: "OR-010", name: "Skills Gap and Talent Shortage", category: "operational", likelihood: 4, impact: 3, description: "Lack of skilled IT personnel affects operations", mitigation: "Training programs, competitive compensation, knowledge transfer, contractor relationships, and recruitment" }
];

const complianceRisks = [
  { id: "CR-001", name: "GDPR Non-Compliance", category: "compliance", likelihood: 3, impact: 5, description: "Failure to comply with EU data protection requirements", mitigation: "Privacy by design, consent management, data mapping, DPO appointment, DPIA process, and breach procedures" },
  { id: "CR-002", name: "SOX Control Deficiency", category: "compliance", likelihood: 3, impact: 4, description: "Material weakness in internal controls over financial reporting", mitigation: "Control documentation, testing procedures, remediation tracking, management review, and external audit" },
  { id: "CR-003", name: "PCI-DSS Violation", category: "compliance", likelihood: 3, impact: 5, description: "Non-compliance with payment card security standards", mitigation: "Network segmentation, encryption, access controls, vulnerability management, and quarterly ASV scans" },
  { id: "CR-004", name: "HIPAA Privacy Breach", category: "compliance", likelihood: 3, impact: 5, description: "Unauthorized disclosure of protected health information", mitigation: "Access controls, encryption, training, BAAs with vendors, breach notification procedures, and audits" },
  { id: "CR-005", name: "Regulatory Reporting Failure", category: "compliance", likelihood: 2, impact: 4, description: "Failure to submit required regulatory reports", mitigation: "Reporting calendar, automated workflows, data validation, management review, and compliance tracking" },
  { id: "CR-006", name: "Data Retention Policy Violation", category: "compliance", likelihood: 3, impact: 3, description: "Data retained or destroyed contrary to requirements", mitigation: "Retention schedules, automated archival, legal holds, disposal procedures, and policy training" },
  { id: "CR-007", name: "E-Discovery Failure", category: "compliance", likelihood: 2, impact: 4, description: "Inability to produce required data for legal proceedings", mitigation: "Document management, litigation hold process, search capabilities, chain of custody, and legal consultation" },
  { id: "CR-008", name: "Cross-Border Data Transfer Violation", category: "compliance", likelihood: 3, impact: 4, description: "Inappropriate transfer of data across jurisdictions", mitigation: "Data mapping, transfer agreements, standard clauses, transfer impact assessments, and monitoring" },
  { id: "CR-009", name: "Audit Finding Remediation Delay", category: "compliance", likelihood: 3, impact: 3, description: "Failure to remediate audit findings in timely manner", mitigation: "Remediation tracking, management oversight, resource allocation, progress reporting, and escalation" },
  { id: "CR-010", name: "Licensing Non-Compliance", category: "compliance", likelihood: 4, impact: 3, description: "Software used without proper licensing", mitigation: "Software asset management, license tracking, usage monitoring, vendor negotiations, and compliance audits" }
];

const financialRisks = [
  { id: "FR-001", name: "Budget Overrun", category: "financial", likelihood: 3, impact: 3, description: "IT spending exceeds approved budget", mitigation: "Budget monitoring, approval workflows, variance analysis, forecasting, and cost control measures" },
  { id: "FR-002", name: "ROI Failure on IT Investments", category: "financial", likelihood: 3, impact: 3, description: "IT investments fail to deliver expected business value", mitigation: "Business case development, benefit tracking, post-implementation reviews, and portfolio management" },
  { id: "FR-003", name: "Hidden IT Costs", category: "financial", likelihood: 4, impact: 2, description: "Unexpected costs from shadow IT or poor planning", mitigation: "IT chargeback, cost allocation, spend visibility tools, and financial planning" },
  { id: "FR-004", name: "Vendor Lock-In Costs", category: "financial", likelihood: 3, impact: 3, description: "Excessive switching costs prevent moving to better solutions", mitigation: "Multi-vendor strategy, standard interfaces, exit planning, and TCO analysis" },
  { id: "FR-005", name: "Technology Debt Accumulation", category: "financial", likelihood: 4, impact: 3, description: "Deferred maintenance and upgrades increase long-term costs", mitigation: "Debt tracking, modernization roadmap, refactoring priorities, and investment planning" }
];

export default function ComprehensiveRiskLibrary({ open, onOpenChange }) {
  const [selectedRisks, setSelectedRisks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("technology");
  const [aiScoring, setAiScoring] = useState(false);
  const [scoringContext, setScoringContext] = useState("");
  const [suggestedControls, setSuggestedControls] = useState([]);
  const [loadingControls, setLoadingControls] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const queryClient = useQueryClient();

  // Fetch control library
  const { data: controlLibrary = [] } = useQuery({
    queryKey: ['control-library'],
    queryFn: () => base44.entities.ControlLibrary.list()
  });

  const importMutation = useMutation({
    mutationFn: (risksData) => base44.entities.RiskLibrary.bulkCreate(risksData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['risk-library'] });
      toast.success(`Imported ${data.length} risks to library`);
      setSelectedRisks([]);
      setSuggestedControls([]);
      onOpenChange(false);
    }
  });

  // AI-driven risk scoring
  const performAIScoring = async () => {
    if (selectedRisks.length === 0) {
      toast.error("Please select risks first");
      return;
    }

    setAiScoring(true);
    try {
      const risksData = selectedRisks.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        currentLikelihood: r.likelihood,
        currentImpact: r.impact
      }));

      const prompt = `You are a risk assessment expert. Given the following risks and business context, provide refined likelihood and impact scores (1-5) based on current threat landscape and industry best practices.

BUSINESS CONTEXT:
${scoringContext || "General enterprise environment with standard risk appetite"}

RISKS TO SCORE:
${JSON.stringify(risksData, null, 2)}

For each risk, provide:
1. Refined likelihood score (1-5) with justification
2. Refined impact score (1-5) with justification
3. Brief rationale for any changes

Return a JSON array with this structure for each risk:
{
  "risk_id": "string",
  "likelihood": number (1-5),
  "impact": number (1-5),
  "rationale": "string"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            scored_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_id: { type: "string" },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  rationale: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Update selected risks with AI scores
      const updatedRisks = selectedRisks.map(risk => {
        const scored = response.scored_risks.find(s => s.risk_id === risk.id);
        if (scored) {
          return {
            ...risk,
            likelihood: scored.likelihood,
            impact: scored.impact,
            aiRationale: scored.rationale
          };
        }
        return risk;
      });

      setSelectedRisks(updatedRisks);
      toast.success("AI scoring completed");
    } catch (error) {
      console.error(error);
      toast.error("AI scoring failed");
    } finally {
      setAiScoring(false);
    }
  };

  // Auto-suggest controls
  useEffect(() => {
    if (selectedRisks.length > 0 && controlLibrary.length > 0) {
      suggestControls();
    }
  }, [selectedRisks.length]);

  const suggestControls = async () => {
    if (selectedRisks.length === 0) return;

    setLoadingControls(true);
    try {
      const risksData = selectedRisks.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        description: r.description
      }));

      const controlsData = controlLibrary.map(c => ({
        id: c.control_id,
        name: c.control_name,
        category: c.control_category,
        description: c.description
      }));

      const prompt = `You are a controls mapping expert. Match the following risks to the most relevant controls from the control library.

RISKS:
${JSON.stringify(risksData, null, 2)}

AVAILABLE CONTROLS:
${JSON.stringify(controlsData, null, 2)}

For each risk, suggest 2-3 most relevant controls with rationale. Return JSON array:
{
  "risk_id": "string",
  "suggested_controls": [
    {
      "control_id": "string",
      "control_name": "string",
      "relevance_rationale": "string"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risk_control_mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_id: { type: "string" },
                  suggested_controls: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        control_id: { type: "string" },
                        control_name: { type: "string" },
                        relevance_rationale: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setSuggestedControls(response.risk_control_mappings || []);
      toast.success("Control suggestions generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to suggest controls");
    } finally {
      setLoadingControls(false);
    }
  };

  const handleImport = () => {
    if (selectedRisks.length === 0) {
      toast.error("Please select at least one risk to import");
      return;
    }

    const risksToImport = selectedRisks.map(risk => {
      const controlSuggestions = suggestedControls.find(s => s.risk_id === risk.id);
      const suggestedControlIds = controlSuggestions?.suggested_controls.map(c => c.control_id) || [];
      
      return {
        risk_id: risk.id,
        risk_name: risk.name,
        risk_category: risk.category,
        likelihood: risk.likelihood,
        impact: risk.impact,
        description: risk.description,
        mitigation_strategies: risk.mitigation,
        regulatory_references: [`Technology Risk - ${risk.category}`],
        ai_rationale: risk.aiRationale || null,
        suggested_controls: suggestedControlIds,
        control_mapping_rationale: controlSuggestions?.suggested_controls.map(c => 
          `${c.control_name}: ${c.relevance_rationale}`
        ).join('\n') || null
      };
    });

    importMutation.mutate(risksToImport);
  };

  const toggleRisk = (risk) => {
    setSelectedRisks(prev => {
      const exists = prev.find(r => r.id === risk.id);
      if (exists) {
        return prev.filter(r => r.id !== risk.id);
      } else {
        return [...prev, risk];
      }
    });
  };

  const toggleAll = (risks) => {
    const filteredRisks = getFilteredRisks(risks);
    if (selectedRisks.length === filteredRisks.length) {
      setSelectedRisks([]);
    } else {
      setSelectedRisks([...filteredRisks]);
    }
  };

  const getFilteredRisks = (risks) => {
    return risks.filter(risk => {
      const matchesSearch = searchQuery === "" ||
        risk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || risk.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  };

  const renderRisksList = (risks, icon, iconColor) => {
    const filteredRisks = getFilteredRisks(risks);
    
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedRisks.length === filteredRisks.length && filteredRisks.length > 0}
              onCheckedChange={() => toggleAll(risks)}
            />
            <span className="text-sm text-slate-400">
              {selectedRisks.filter(sr => filteredRisks.find(fr => fr.id === sr.id)).length} of {filteredRisks.length} selected
            </span>
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-2 pr-4">
            {filteredRisks.map((risk, idx) => {
              const riskScore = risk.likelihood * risk.impact;
              const riskLevel = riskScore >= 20 ? 'critical' : riskScore >= 15 ? 'high' : riskScore >= 10 ? 'medium' : 'low';
              const riskColors = {
                critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              };

              const isSelected = !!selectedRisks.find(r => r.id === risk.id);
              const controlSuggestions = suggestedControls.find(s => s.risk_id === risk.id);
              const hasAiRationale = risk.aiRationale;

              return (
                <Card
                  key={idx}
                  className={`bg-[#151d2e] border-[#2a3548] cursor-pointer hover:border-[#3a4558] transition-all ${
                    isSelected ? 'border-rose-500/50' : ''
                  }`}
                  onClick={() => toggleRisk(risk)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={!!selectedRisks.find(r => r.id === risk.id)}
                        onCheckedChange={() => toggleRisk(risk)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {icon}
                              <h4 className="font-semibold text-white text-sm">
                                {risk.id}: {risk.name}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
                          </div>
                          <div className="ml-2 flex flex-col items-end gap-1">
                            <Badge className={`text-[10px] border ${riskColors[riskLevel]}`}>
                              {riskLevel.toUpperCase()}
                            </Badge>
                            <div className="text-xs text-slate-500">Score: {riskScore}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-[#1a2332] rounded p-2">
                            <p className="text-[10px] text-slate-500 font-medium mb-1">LIKELIHOOD</p>
                            <p className="text-sm font-bold text-white">{risk.likelihood}/5</p>
                          </div>
                          <div className="bg-[#1a2332] rounded p-2">
                            <p className="text-[10px] text-slate-500 font-medium mb-1">IMPACT</p>
                            <p className="text-sm font-bold text-white">{risk.impact}/5</p>
                          </div>
                        </div>

                        <div className="bg-emerald-500/5 rounded p-2">
                          <p className="text-[10px] text-emerald-400 font-medium mb-1">MITIGATION STRATEGIES:</p>
                          <p className="text-xs text-slate-300">{risk.mitigation}</p>
                        </div>

                        {hasAiRationale && (
                          <div className="bg-purple-500/5 rounded p-2 mt-2">
                            <p className="text-[10px] text-purple-400 font-medium mb-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI SCORING RATIONALE:
                            </p>
                            <p className="text-xs text-slate-300">{risk.aiRationale}</p>
                          </div>
                        )}

                        {isSelected && controlSuggestions && controlSuggestions.suggested_controls.length > 0 && (
                          <div className="bg-blue-500/5 rounded p-2 mt-2">
                            <p className="text-[10px] text-blue-400 font-medium mb-1 flex items-center gap-1">
                              <Link2 className="h-3 w-3" />
                              SUGGESTED CONTROLS:
                            </p>
                            <div className="space-y-1">
                              {controlSuggestions.suggested_controls.slice(0, 2).map((ctrl, i) => (
                                <div key={i} className="text-xs text-slate-300">
                                  <span className="font-medium">{ctrl.control_name}</span>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{ctrl.relevance_rationale}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                            {risk.category}
                          </Badge>
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                            L:{risk.likelihood} × I:{risk.impact}
                          </Badge>
                          {hasAiRationale && (
                            <Badge className="text-[10px] bg-purple-500/20 text-purple-400 border-purple-500/30">
                              <Sparkles className="h-2 w-2 mr-1" />
                              AI Scored
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Comprehensive Risk Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Features Panel */}
          {selectedRisks.length > 0 && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold text-white">AI-Enhanced Risk Assessment</span>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {selectedRisks.length} risks selected
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Business Context (optional - for better AI scoring)</Label>
                  <Textarea
                    placeholder="E.g., Financial services company with high regulatory requirements, operating in cloud-first environment..."
                    value={scoringContext}
                    onChange={(e) => setScoringContext(e.target.value)}
                    className="bg-[#151d2e] border-[#2a3548] text-white placeholder:text-slate-500 text-xs"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={performAIScoring}
                    disabled={aiScoring}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {aiScoring ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        Scoring...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-2" />
                        AI Risk Scoring
                      </>
                    )}
                  </Button>

                  {suggestedControls.length > 0 && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      <Link2 className="h-3 w-3 mr-1" />
                      {suggestedControls.reduce((sum, s) => sum + s.suggested_controls.length, 0)} controls suggested
                    </Badge>
                  )}

                  {loadingControls && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Analyzing controls...
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search risks..."
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="cyber">Cyber</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
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
              disabled={selectedRisks.length === 0 || importMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Import ({selectedRisks.length})
                </>
              )}
            </Button>
          </div>

          <BulkImportDialog
            open={showBulkImport}
            onOpenChange={setShowBulkImport}
            entityType="risk"
            onImportComplete={() => {
              queryClient.invalidateQueries({ queryKey: ['risk-library'] });
            }}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#151d2e] border border-[#2a3548] w-full justify-start">
              <TabsTrigger value="technology" className="gap-2">
                <Server className="h-4 w-4" />
                Technology ({technologyRisks.length})
              </TabsTrigger>
              <TabsTrigger value="cyber" className="gap-2">
                <Shield className="h-4 w-4" />
                Cybersecurity ({cyberSecurityRisks.length})
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Bot className="h-4 w-4" />
                AI/ML ({aiMLRisks.length})
              </TabsTrigger>
              <TabsTrigger value="operational" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Operational ({operationalRisks.length})
              </TabsTrigger>
              <TabsTrigger value="compliance" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Compliance ({complianceRisks.length})
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Financial ({financialRisks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="technology">
              {renderRisksList(technologyRisks, <Server className="h-4 w-4 text-blue-400" />, "text-blue-400")}
            </TabsContent>

            <TabsContent value="cyber">
              {renderRisksList(cyberSecurityRisks, <Shield className="h-4 w-4 text-red-400" />, "text-red-400")}
            </TabsContent>

            <TabsContent value="ai">
              {renderRisksList(aiMLRisks, <Bot className="h-4 w-4 text-purple-400" />, "text-purple-400")}
            </TabsContent>

            <TabsContent value="operational">
              {renderRisksList(operationalRisks, <Briefcase className="h-4 w-4 text-amber-400" />, "text-amber-400")}
            </TabsContent>

            <TabsContent value="compliance">
              {renderRisksList(complianceRisks, <AlertTriangle className="h-4 w-4 text-orange-400" />, "text-orange-400")}
            </TabsContent>

            <TabsContent value="financial">
              {renderRisksList(financialRisks, <DollarSign className="h-4 w-4 text-emerald-400" />, "text-emerald-400")}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}