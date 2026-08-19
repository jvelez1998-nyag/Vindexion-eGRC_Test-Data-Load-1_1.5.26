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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Loader2, Search, Download, CheckCircle2, Upload, Filter, SlidersHorizontal } from "lucide-react";
import BulkImportDialog from "@/components/import/BulkImportDialog";
import { toast } from "sonner";

export default function NISTControlLibrary({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [controls, setControls] = useState(null);
  const [selectedControls, setSelectedControls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFunction, setFilterFunction] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

  const fetchNISTControls = async () => {
    setLoading(true);
    try {
      // Hardcoded NIST CSF 2.0 controls for reliability
      const nistControls = [
        // IDENTIFY Function
        { function: "Identify", category_id: "ID.AM", category_name: "Asset Management", subcategory_id: "ID.AM-1", subcategory_description: "Physical devices and systems within the organization are inventoried", implementation_guidance: "Maintain comprehensive asset inventory including hardware, software, data, and facilities", references: ["CIS CSC 1", "COBIT 5 BAI09.01", "ISA 62443-2-1:2009"] },
        { function: "Identify", category_id: "ID.AM", category_name: "Asset Management", subcategory_id: "ID.AM-2", subcategory_description: "Software platforms and applications within the organization are inventoried", implementation_guidance: "Track all software assets including operating systems, applications, and firmware versions", references: ["CIS CSC 2", "COBIT 5 BAI09.01"] },
        { function: "Identify", category_id: "ID.AM", category_name: "Asset Management", subcategory_id: "ID.AM-3", subcategory_description: "Organizational communication and data flows are mapped", implementation_guidance: "Document how data flows between systems, applications, and external parties", references: ["IEC 62443-2-1:2009", "ISO/IEC 27001:2013"] },
        { function: "Identify", category_id: "ID.AM", category_name: "Asset Management", subcategory_id: "ID.AM-4", subcategory_description: "External information systems are catalogued", implementation_guidance: "Maintain inventory of third-party systems that connect to or process organizational data", references: ["CIS CSC 12", "COBIT 5 APO09.01"] },
        { function: "Identify", category_id: "ID.AM", category_name: "Asset Management", subcategory_id: "ID.AM-5", subcategory_description: "Resources are prioritized based on their classification, criticality, and business value", implementation_guidance: "Classify assets based on criticality and establish priority levels for protection", references: ["COBIT 5 APO03.03", "ISO/IEC 27001:2013"] },
        
        { function: "Identify", category_id: "ID.BE", category_name: "Business Environment", subcategory_id: "ID.BE-1", subcategory_description: "The organization's role in the supply chain is identified and communicated", implementation_guidance: "Document your organization's position and dependencies in the supply chain", references: ["COBIT 5 APO08.04", "ISO/IEC 27001:2013"] },
        { function: "Identify", category_id: "ID.BE", category_name: "Business Environment", subcategory_id: "ID.BE-2", subcategory_description: "The organization's place in critical infrastructure and its industry sector is identified and communicated", implementation_guidance: "Understand your role in critical infrastructure and sector-specific requirements", references: ["COBIT 5 APO02.06", "ISO/IEC 27001:2013"] },
        { function: "Identify", category_id: "ID.BE", category_name: "Business Environment", subcategory_id: "ID.BE-3", subcategory_description: "Priorities for organizational mission, objectives, and activities are established and communicated", implementation_guidance: "Define and communicate business priorities that guide cybersecurity decisions", references: ["COBIT 5 APO02.01", "ISA 62443-2-1:2009"] },
        { function: "Identify", category_id: "ID.BE", category_name: "Business Environment", subcategory_id: "ID.BE-4", subcategory_description: "Dependencies and critical functions for delivery of critical services are established", implementation_guidance: "Identify business processes and their dependencies on technology and services", references: ["COBIT 5 APO10.01", "ISO/IEC 27001:2013"] },
        
        { function: "Identify", category_id: "ID.GV", category_name: "Governance", subcategory_id: "ID.GV-1", subcategory_description: "Organizational cybersecurity policy is established and communicated", implementation_guidance: "Develop comprehensive cybersecurity policies approved by leadership", references: ["COBIT 5 EDM01.01", "ISO/IEC 27001:2013"] },
        { function: "Identify", category_id: "ID.GV", category_name: "Governance", subcategory_id: "ID.GV-2", subcategory_description: "Cybersecurity roles and responsibilities are coordinated and aligned with internal roles and external partners", implementation_guidance: "Define clear roles and responsibilities for cybersecurity across the organization", references: ["COBIT 5 APO01.02", "ISO/IEC 27001:2013"] },
        { function: "Identify", category_id: "ID.GV", category_name: "Governance", subcategory_id: "ID.GV-3", subcategory_description: "Legal and regulatory requirements regarding cybersecurity are understood and managed", implementation_guidance: "Maintain awareness of applicable legal and regulatory cybersecurity requirements", references: ["COBIT 5 MEA03.01", "ISO/IEC 27001:2013"] },
        
        { function: "Identify", category_id: "ID.RA", category_name: "Risk Assessment", subcategory_id: "ID.RA-1", subcategory_description: "Asset vulnerabilities are identified and documented", implementation_guidance: "Regularly scan and assess systems for vulnerabilities and maintain documentation", references: ["CIS CSC 4", "COBIT 5 APO12.01", "ISO/IEC 27001:2013"] },
        { function: "Identify", category_id: "ID.RA", category_name: "Risk Assessment", subcategory_id: "ID.RA-2", subcategory_description: "Cyber threat intelligence is received from information sharing forums and sources", implementation_guidance: "Subscribe to threat intelligence feeds and participate in information sharing", references: ["CIS CSC 8", "COBIT 5 APO12.01"] },
        { function: "Identify", category_id: "ID.RA", category_name: "Risk Assessment", subcategory_id: "ID.RA-3", subcategory_description: "Threats, both internal and external, are identified and documented", implementation_guidance: "Identify potential threat sources and attack vectors specific to your organization", references: ["COBIT 5 APO12.02", "ISO/IEC 27001:2013"] },
        { function: "Identify", category_id: "ID.RA", category_name: "Risk Assessment", subcategory_id: "ID.RA-4", subcategory_description: "Potential business impacts and likelihoods are identified", implementation_guidance: "Assess business impact and likelihood for identified threats and vulnerabilities", references: ["COBIT 5 DSS04.02", "ISO/IEC 27001:2013"] },
        { function: "Identify", category_id: "ID.RA", category_name: "Risk Assessment", subcategory_id: "ID.RA-5", subcategory_description: "Threats, vulnerabilities, likelihoods, and impacts are used to determine risk", implementation_guidance: "Calculate risk levels by combining threat, vulnerability, and impact assessments", references: ["COBIT 5 APO12.02", "ISO/IEC 27001:2013"] },
        
        // PROTECT Function
        { function: "Protect", category_id: "PR.AC", category_name: "Access Control", subcategory_id: "PR.AC-1", subcategory_description: "Identities and credentials are issued, managed, verified, revoked for authorized devices and users", implementation_guidance: "Implement identity and access management system with lifecycle management", references: ["CIS CSC 16", "COBIT 5 DSS05.04", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.AC", category_name: "Access Control", subcategory_id: "PR.AC-2", subcategory_description: "Physical access to assets is managed and protected", implementation_guidance: "Control physical access to facilities and assets through badges, locks, and monitoring", references: ["COBIT 5 DSS05.05", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.AC", category_name: "Access Control", subcategory_id: "PR.AC-3", subcategory_description: "Remote access is managed", implementation_guidance: "Implement secure remote access with MFA and VPN for all remote connections", references: ["CIS CSC 12", "COBIT 5 APO13.01", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.AC", category_name: "Access Control", subcategory_id: "PR.AC-4", subcategory_description: "Access permissions and authorizations are managed, incorporating principles of least privilege", implementation_guidance: "Grant minimum necessary access rights and regularly review permissions", references: ["CIS CSC 14", "COBIT 5 DSS05.04", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.AC", category_name: "Access Control", subcategory_id: "PR.AC-5", subcategory_description: "Network integrity is protected (e.g., network segregation, network segmentation)", implementation_guidance: "Segment networks to limit lateral movement and protect critical assets", references: ["CIS CSC 12", "COBIT 5 DSS05.02", "ISA 62443-3-3:2013"] },
        
        { function: "Protect", category_id: "PR.AT", category_name: "Awareness and Training", subcategory_id: "PR.AT-1", subcategory_description: "All users are informed and trained", implementation_guidance: "Provide regular cybersecurity awareness training to all personnel", references: ["CIS CSC 17", "COBIT 5 APO07.03", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.AT", category_name: "Awareness and Training", subcategory_id: "PR.AT-2", subcategory_description: "Privileged users understand their roles and responsibilities", implementation_guidance: "Provide specialized training for privileged users and administrators", references: ["CIS CSC 5", "COBIT 5 APO07.02", "ISO/IEC 27001:2013"] },
        
        { function: "Protect", category_id: "PR.DS", category_name: "Data Security", subcategory_id: "PR.DS-1", subcategory_description: "Data-at-rest is protected", implementation_guidance: "Encrypt sensitive data stored on systems using approved encryption standards", references: ["CIS CSC 13", "COBIT 5 APO01.06", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.DS", category_name: "Data Security", subcategory_id: "PR.DS-2", subcategory_description: "Data-in-transit is protected", implementation_guidance: "Use TLS/SSL and other encryption protocols for data transmission", references: ["CIS CSC 13", "COBIT 5 APO01.06", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.DS", category_name: "Data Security", subcategory_id: "PR.DS-3", subcategory_description: "Assets are formally managed throughout removal, transfers, and disposition", implementation_guidance: "Implement secure asset disposal procedures including data sanitization", references: ["COBIT 5 BAI09.03", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.DS", category_name: "Data Security", subcategory_id: "PR.DS-5", subcategory_description: "Protections against data leaks are implemented", implementation_guidance: "Deploy data loss prevention (DLP) tools and policies", references: ["CIS CSC 13", "COBIT 5 APO01.06", "ISO/IEC 27001:2013"] },
        
        { function: "Protect", category_id: "PR.IP", category_name: "Information Protection Processes", subcategory_id: "PR.IP-1", subcategory_description: "A baseline configuration of information technology/industrial control systems is created and maintained", implementation_guidance: "Establish and maintain secure baseline configurations for all systems", references: ["CIS CSC 5", "COBIT 5 BAI10.01", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.IP", category_name: "Information Protection Processes", subcategory_id: "PR.IP-2", subcategory_description: "A System Development Life Cycle to manage systems is implemented", implementation_guidance: "Integrate security into all phases of system development lifecycle", references: ["COBIT 5 APO13.01", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.IP", category_name: "Information Protection Processes", subcategory_id: "PR.IP-3", subcategory_description: "Configuration change control processes are in place", implementation_guidance: "Implement formal change management processes with security reviews", references: ["CIS CSC 3", "COBIT 5 BAI06.01", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.IP", category_name: "Information Protection Processes", subcategory_id: "PR.IP-4", subcategory_description: "Backups of information are conducted, maintained, and tested", implementation_guidance: "Perform regular backups and test restoration procedures", references: ["CIS CSC 11", "COBIT 5 APO13.01", "ISO/IEC 27001:2013"] },
        
        { function: "Protect", category_id: "PR.PT", category_name: "Protective Technology", subcategory_id: "PR.PT-1", subcategory_description: "Audit/log records are determined, documented, implemented, and reviewed", implementation_guidance: "Configure comprehensive logging and regularly review audit logs", references: ["CIS CSC 8", "COBIT 5 APO11.04", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.PT", category_name: "Protective Technology", subcategory_id: "PR.PT-3", subcategory_description: "The principle of least functionality is incorporated", implementation_guidance: "Disable unnecessary services, ports, and features on all systems", references: ["CIS CSC 9", "COBIT 5 DSS05.02", "ISO/IEC 27001:2013"] },
        { function: "Protect", category_id: "PR.PT", category_name: "Protective Technology", subcategory_id: "PR.PT-4", subcategory_description: "Communications and control networks are protected", implementation_guidance: "Implement firewalls, network segmentation, and monitoring", references: ["CIS CSC 12", "COBIT 5 DSS05.02", "ISA 62443-3-3:2013"] },
        
        // DETECT Function
        { function: "Detect", category_id: "DE.AE", category_name: "Anomalies and Events", subcategory_id: "DE.AE-1", subcategory_description: "A baseline of network operations and expected data flows is established and managed", implementation_guidance: "Establish network baseline to identify deviations and anomalies", references: ["CIS CSC 13", "COBIT 5 DSS03.01", "ISA 62443-2-1:2009"] },
        { function: "Detect", category_id: "DE.AE", category_name: "Anomalies and Events", subcategory_id: "DE.AE-2", subcategory_description: "Detected events are analyzed to understand attack targets and methods", implementation_guidance: "Perform analysis of security events to identify patterns and threats", references: ["CIS CSC 8", "COBIT 5 APO12.06", "ISO/IEC 27001:2013"] },
        { function: "Detect", category_id: "DE.AE", category_name: "Anomalies and Events", subcategory_id: "DE.AE-3", subcategory_description: "Event data are collected and correlated from multiple sources and sensors", implementation_guidance: "Aggregate logs from multiple sources into SIEM for correlation", references: ["CIS CSC 8", "COBIT 5 APO11.04", "ISO/IEC 27001:2013"] },
        
        { function: "Detect", category_id: "DE.CM", category_name: "Continuous Monitoring", subcategory_id: "DE.CM-1", subcategory_description: "The network is monitored to detect potential cybersecurity events", implementation_guidance: "Deploy network monitoring tools to detect suspicious activity", references: ["CIS CSC 13", "COBIT 5 DSS05.07", "ISA 62443-3-3:2013"] },
        { function: "Detect", category_id: "DE.CM", category_name: "Continuous Monitoring", subcategory_id: "DE.CM-2", subcategory_description: "The physical environment is monitored to detect potential cybersecurity events", implementation_guidance: "Monitor physical access points with cameras and sensors", references: ["COBIT 5 DSS01.04", "ISO/IEC 27001:2013"] },
        { function: "Detect", category_id: "DE.CM", category_name: "Continuous Monitoring", subcategory_id: "DE.CM-3", subcategory_description: "Personnel activity is monitored to detect potential cybersecurity events", implementation_guidance: "Monitor user activities for insider threats and policy violations", references: ["CIS CSC 16", "COBIT 5 DSS05.07", "ISO/IEC 27001:2013"] },
        { function: "Detect", category_id: "DE.CM", category_name: "Continuous Monitoring", subcategory_id: "DE.CM-4", subcategory_description: "Malicious code is detected", implementation_guidance: "Deploy and maintain antivirus and anti-malware solutions", references: ["CIS CSC 8", "COBIT 5 DSS05.01", "ISO/IEC 27001:2013"] },
        { function: "Detect", category_id: "DE.CM", category_name: "Continuous Monitoring", subcategory_id: "DE.CM-7", subcategory_description: "Monitoring for unauthorized personnel, connections, devices, and software is performed", implementation_guidance: "Monitor for rogue devices, unauthorized access, and shadow IT", references: ["CIS CSC 1", "COBIT 5 DSS05.02", "ISO/IEC 27001:2013"] },
        { function: "Detect", category_id: "DE.CM", category_name: "Continuous Monitoring", subcategory_id: "DE.CM-8", subcategory_description: "Vulnerability scans are performed", implementation_guidance: "Conduct regular vulnerability scans and prioritize remediation", references: ["CIS CSC 4", "COBIT 5 BAI03.10", "ISO/IEC 27001:2013"] },
        
        { function: "Detect", category_id: "DE.DP", category_name: "Detection Processes", subcategory_id: "DE.DP-1", subcategory_description: "Roles and responsibilities for detection are well defined", implementation_guidance: "Define clear roles for security monitoring and incident detection", references: ["CIS CSC 19", "COBIT 5 APO01.02", "ISO/IEC 27001:2013"] },
        { function: "Detect", category_id: "DE.DP", category_name: "Detection Processes", subcategory_id: "DE.DP-2", subcategory_description: "Detection activities comply with all applicable requirements", implementation_guidance: "Ensure monitoring activities comply with legal and regulatory requirements", references: ["COBIT 5 MEA03.03", "ISO/IEC 27001:2013"] },
        { function: "Detect", category_id: "DE.DP", category_name: "Detection Processes", subcategory_id: "DE.DP-4", subcategory_description: "Event detection information is communicated", implementation_guidance: "Establish communication protocols for detected security events", references: ["COBIT 5 APO08.04", "ISO/IEC 27001:2013"] },
        
        // RESPOND Function
        { function: "Respond", category_id: "RS.RP", category_name: "Response Planning", subcategory_id: "RS.RP-1", subcategory_description: "Response plan is executed during or after an incident", implementation_guidance: "Develop and maintain incident response plans with defined procedures", references: ["CIS CSC 19", "COBIT 5 APO12.06", "ISO/IEC 27001:2013"] },
        
        { function: "Respond", category_id: "RS.CO", category_name: "Communications", subcategory_id: "RS.CO-1", subcategory_description: "Personnel know their roles and order of operations when a response is needed", implementation_guidance: "Train response team on roles, responsibilities, and escalation procedures", references: ["CIS CSC 19", "COBIT 5 EDM03.02", "ISO/IEC 27001:2013"] },
        { function: "Respond", category_id: "RS.CO", category_name: "Communications", subcategory_id: "RS.CO-2", subcategory_description: "Incidents are reported consistent with established criteria", implementation_guidance: "Establish incident classification and reporting thresholds", references: ["CIS CSC 19", "COBIT 5 DSS02.07", "ISO/IEC 27001:2013"] },
        { function: "Respond", category_id: "RS.CO", category_name: "Communications", subcategory_id: "RS.CO-3", subcategory_description: "Information is shared consistent with response plans", implementation_guidance: "Share incident information with internal stakeholders per response plan", references: ["COBIT 5 APO08.04", "ISO/IEC 27001:2013"] },
        
        { function: "Respond", category_id: "RS.AN", category_name: "Analysis", subcategory_id: "RS.AN-1", subcategory_description: "Notifications from detection systems are investigated", implementation_guidance: "Investigate all security alerts to determine legitimacy and severity", references: ["CIS CSC 8", "COBIT 5 DSS02.04", "ISO/IEC 27001:2013"] },
        { function: "Respond", category_id: "RS.AN", category_name: "Analysis", subcategory_id: "RS.AN-2", subcategory_description: "The impact of the incident is understood", implementation_guidance: "Assess scope and business impact of security incidents", references: ["COBIT 5 DSS02.02", "ISO/IEC 27001:2013"] },
        { function: "Respond", category_id: "RS.AN", category_name: "Analysis", subcategory_id: "RS.AN-3", subcategory_description: "Forensics are performed", implementation_guidance: "Collect and preserve evidence for incident investigation", references: ["COBIT 5 APO12.06", "ISO/IEC 27001:2013"] },
        
        { function: "Respond", category_id: "RS.MI", category_name: "Mitigation", subcategory_id: "RS.MI-1", subcategory_description: "Incidents are contained", implementation_guidance: "Implement containment measures to limit incident spread", references: ["CIS CSC 19", "COBIT 5 DSS02.01", "ISO/IEC 27001:2013"] },
        { function: "Respond", category_id: "RS.MI", category_name: "Mitigation", subcategory_id: "RS.MI-2", subcategory_description: "Incidents are mitigated", implementation_guidance: "Execute mitigation actions to neutralize threats and restore systems", references: ["CIS CSC 19", "COBIT 5 DSS02.01", "ISO/IEC 27001:2013"] },
        { function: "Respond", category_id: "RS.MI", category_name: "Mitigation", subcategory_id: "RS.MI-3", subcategory_description: "Newly identified vulnerabilities are mitigated or documented as accepted risks", implementation_guidance: "Remediate or accept vulnerabilities discovered during incident response", references: ["COBIT 5 APO12.06", "ISO/IEC 27001:2013"] },
        
        { function: "Respond", category_id: "RS.IM", category_name: "Improvements", subcategory_id: "RS.IM-1", subcategory_description: "Response plans incorporate lessons learned", implementation_guidance: "Update response plans based on lessons learned from incidents", references: ["COBIT 5 APO12.06", "ISO/IEC 27001:2013"] },
        { function: "Respond", category_id: "RS.IM", category_name: "Improvements", subcategory_id: "RS.IM-2", subcategory_description: "Response strategies are updated", implementation_guidance: "Continuously improve incident response based on new threats and learnings", references: ["COBIT 5 BAI01.13", "ISO/IEC 27001:2013"] },
        
        // RECOVER Function
        { function: "Recover", category_id: "RC.RP", category_name: "Recovery Planning", subcategory_id: "RC.RP-1", subcategory_description: "Recovery plan is executed during or after a cybersecurity incident", implementation_guidance: "Develop and test recovery procedures for systems and data", references: ["CIS CSC 11", "COBIT 5 DSS02.05", "ISO/IEC 27001:2013"] },
        
        { function: "Recover", category_id: "RC.IM", category_name: "Improvements", subcategory_id: "RC.IM-1", subcategory_description: "Recovery plans incorporate lessons learned", implementation_guidance: "Update recovery plans based on actual recovery experiences", references: ["COBIT 5 APO12.06", "ISO/IEC 27001:2013"] },
        { function: "Recover", category_id: "RC.IM", category_name: "Improvements", subcategory_id: "RC.IM-2", subcategory_description: "Recovery strategies are updated", implementation_guidance: "Continuously improve recovery capabilities and procedures", references: ["COBIT 5 BAI01.13", "ISO/IEC 27001:2013"] },
        
        { function: "Recover", category_id: "RC.CO", category_name: "Communications", subcategory_id: "RC.CO-1", subcategory_description: "Public relations are managed", implementation_guidance: "Establish communication protocols for external stakeholders during recovery", references: ["COBIT 5 EDM03.02"] },
        { function: "Recover", category_id: "RC.CO", category_name: "Communications", subcategory_id: "RC.CO-2", subcategory_description: "Reputation is repaired after an incident", implementation_guidance: "Execute reputation management and stakeholder communication plans", references: ["COBIT 5 MEA03.02"] },
        { function: "Recover", category_id: "RC.CO", category_name: "Communications", subcategory_id: "RC.CO-3", subcategory_description: "Recovery activities are communicated to internal and external stakeholders", implementation_guidance: "Keep stakeholders informed of recovery progress and timeline", references: ["COBIT 5 APO08.04", "ISO/IEC 27001:2013"] }
      ];

      setControls(nistControls);
      toast.success(`Loaded ${nistControls.length} NIST CSF controls`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load NIST controls");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (selectedControls.length === 0) {
      toast.error("Please select at least one control to import");
      return;
    }

    const controlsToImport = selectedControls.map(control => ({
      name: `${control.subcategory_id}: ${control.category_name}`,
      description: control.subcategory_description,
      control_objective: control.subcategory_description,
      control_procedures: control.implementation_guidance,
      category: mapNISTFunctionToCategory(control.function),
      domain: mapNISTCategoryToDomain(control.category_id),
      status: "planned",
      framework_mappings: {
        NIST: [control.subcategory_id]
      },
      regulatory_mappings: [`NIST CSF ${control.function} - ${control.category_id}`]
    }));

    importMutation.mutate(controlsToImport);
  };

  const mapNISTFunctionToCategory = (func) => {
    const mapping = {
      "Identify": "directive",
      "Protect": "preventive",
      "Detect": "detective",
      "Respond": "corrective",
      "Recover": "corrective"
    };
    return mapping[func] || "preventive";
  };

  const mapNISTCategoryToDomain = (categoryId) => {
    if (categoryId.startsWith("ID.AM") || categoryId.startsWith("ID.RA")) return "business_continuity";
    if (categoryId.startsWith("PR.AC")) return "access_control";
    if (categoryId.startsWith("PR.DS")) return "data_protection";
    if (categoryId.startsWith("PR.IP") || categoryId.startsWith("PR.MA")) return "physical_security";
    if (categoryId.startsWith("DE.")) return "network_security";
    if (categoryId.startsWith("RS.")) return "incident_response";
    if (categoryId.startsWith("RC.")) return "business_continuity";
    return "network_security";
  };

  const toggleControl = (control) => {
    setSelectedControls(prev => {
      const exists = prev.find(c => c.subcategory_id === control.subcategory_id);
      if (exists) {
        return prev.filter(c => c.subcategory_id !== control.subcategory_id);
      } else {
        return [...prev, control];
      }
    });
  };

  const toggleAll = () => {
    if (selectedControls.length === filteredControls.length) {
      setSelectedControls([]);
    } else {
      setSelectedControls([...filteredControls]);
    }
  };

  const filteredControls = controls?.filter(control => {
    const matchesSearch = searchQuery === "" || 
      control.subcategory_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.subcategory_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.implementation_guidance.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFunction = filterFunction === "all" || control.function === filterFunction;
    const matchesCategory = filterCategory === "all" || control.category_id.startsWith(filterCategory);
    
    return matchesSearch && matchesFunction && matchesCategory;
  }) || [];

  const functionColors = {
    "Identify": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Protect": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Detect": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "Respond": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Recover": "bg-purple-500/20 text-purple-400 border-purple-500/30"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            NIST CSF Control Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!controls ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">NIST Cybersecurity Framework</h3>
              <p className="text-sm text-slate-400 mb-6">Import industry-standard controls from NIST CSF 2.0</p>
              <Button 
                onClick={fetchNISTControls}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading Controls...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Load NIST CSF Controls
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="border-[#2a3548]"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button
                    onClick={() => setShowBulkImport(true)}
                    variant="outline"
                    size="sm"
                    className="border-[#2a3548]"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk
                  </Button>
                </div>

                {showAdvancedFilters && (
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {["all", "Identify", "Protect", "Detect", "Respond", "Recover"].map(func => (
                        <Button
                          key={func}
                          variant={filterFunction === func ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterFunction(func)}
                          className={filterFunction === func ? "bg-indigo-600" : "border-[#2a3548]"}
                        >
                          {func}
                        </Button>
                      ))}
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="ID">Identify</SelectItem>
                        <SelectItem value="PR">Protect</SelectItem>
                        <SelectItem value="DE">Detect</SelectItem>
                        <SelectItem value="RS">Respond</SelectItem>
                        <SelectItem value="RC">Recover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <BulkImportDialog
                open={showBulkImport}
                onOpenChange={setShowBulkImport}
                entityType="control"
                onImportComplete={() => {
                  queryClient.invalidateQueries({ queryKey: ['controls'] });
                }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedControls.length === filteredControls.length && filteredControls.length > 0}
                    onCheckedChange={toggleAll}
                  />
                  <span className="text-sm text-slate-400">
                    {selectedControls.length} of {filteredControls.length} selected
                  </span>
                </div>
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

              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                  {filteredControls.map((control, idx) => (
                    <Card
                      key={idx}
                      className={`bg-[#151d2e] border-[#2a3548] cursor-pointer hover:border-[#3a4558] transition-all ${
                        selectedControls.find(c => c.subcategory_id === control.subcategory_id) ? 'border-indigo-500/50' : ''
                      }`}
                      onClick={() => toggleControl(control)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={!!selectedControls.find(c => c.subcategory_id === control.subcategory_id)}
                            onCheckedChange={() => toggleControl(control)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-white text-sm">
                                  {control.subcategory_id}: {control.category_name}
                                </h4>
                                <p className="text-xs text-slate-400 mt-1">{control.subcategory_description}</p>
                              </div>
                              <Badge className={`ml-2 text-[10px] border ${functionColors[control.function]}`}>
                                {control.function}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{control.implementation_guidance}</p>
                            <div className="flex flex-wrap gap-1">
                              <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                                {control.category_id}
                              </Badge>
                              {control.references?.slice(0, 2).map((ref, i) => (
                                <Badge key={i} className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                                  {ref}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}