import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Database, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_DATA_OPTIONS = [
  {
    id: "risks",
    label: "Sample Risks",
    description: "5 common risks across different categories",
    count: 5,
    entity: "Risk"
  },
  {
    id: "controls",
    label: "Sample Controls",
    description: "10 security controls mapped to frameworks",
    count: 10,
    entity: "Control"
  },
  {
    id: "compliance",
    label: "Compliance Requirements",
    description: "15 requirements from SOX, GDPR, ISO 27001",
    count: 15,
    entity: "Compliance"
  },
  {
    id: "assessments",
    label: "Risk Assessments",
    description: "3 completed risk assessment examples",
    count: 3,
    entity: "RiskAssessment"
  },
  {
    id: "audits",
    label: "Audit Programs",
    description: "2 audit program templates",
    count: 2,
    entity: "AuditProgram"
  }
];

const SAMPLE_DATA = {
  risks: [
    { title: "Ransomware Attack", category: "cybersecurity", description: "Risk of ransomware encrypting critical systems", likelihood: 4, impact: 5, status: "open" },
    { title: "Data Breach", category: "cybersecurity", description: "Unauthorized access to customer data", likelihood: 3, impact: 5, status: "open" },
    { title: "Regulatory Non-Compliance", category: "compliance", description: "Failure to comply with GDPR requirements", likelihood: 3, impact: 4, status: "open" },
    { title: "Third-Party Vendor Failure", category: "third_party", description: "Critical vendor service disruption", likelihood: 2, impact: 4, status: "open" },
    { title: "Insider Threat", category: "operational", description: "Malicious or negligent employee actions", likelihood: 2, impact: 4, status: "open" }
  ],
  controls: [
    { name: "Multi-Factor Authentication", category: "preventive", domain: "access_control", status: "implemented", effectiveness: 4 },
    { name: "Encryption at Rest", category: "preventive", domain: "data_protection", status: "implemented", effectiveness: 5 },
    { name: "Security Awareness Training", category: "preventive", domain: "hr_security", status: "implemented", effectiveness: 3 },
    { name: "SIEM Monitoring", category: "detective", domain: "network_security", status: "implemented", effectiveness: 4 },
    { name: "Incident Response Plan", category: "corrective", domain: "incident_response", status: "implemented", effectiveness: 4 },
    { name: "Access Reviews", category: "detective", domain: "access_control", status: "implemented", effectiveness: 4 },
    { name: "Backup & Recovery", category: "corrective", domain: "business_continuity", status: "implemented", effectiveness: 5 },
    { name: "Vulnerability Scanning", category: "detective", domain: "network_security", status: "implemented", effectiveness: 4 },
    { name: "Patch Management", category: "preventive", domain: "network_security", status: "implemented", effectiveness: 4 },
    { name: "Firewall Rules", category: "preventive", domain: "network_security", status: "implemented", effectiveness: 5 }
  ],
  compliance: [
    { framework: "SOX", requirement: "Internal Controls over Financial Reporting", status: "implemented" },
    { framework: "SOX", requirement: "IT General Controls", status: "in_progress" },
    { framework: "GDPR", requirement: "Data Protection Impact Assessment", status: "implemented" },
    { framework: "GDPR", requirement: "Right to Access", status: "implemented" },
    { framework: "GDPR", requirement: "Right to Erasure", status: "implemented" },
    { framework: "ISO27001", requirement: "Information Security Policy", status: "implemented" },
    { framework: "ISO27001", requirement: "Asset Management", status: "in_progress" },
    { framework: "ISO27001", requirement: "Access Control", status: "implemented" },
    { framework: "ISO27001", requirement: "Cryptography", status: "implemented" },
    { framework: "ISO27001", requirement: "Incident Management", status: "implemented" },
    { framework: "PCI-DSS", requirement: "Install and Maintain Firewall", status: "implemented" },
    { framework: "PCI-DSS", requirement: "Encrypt Transmission of Data", status: "implemented" },
    { framework: "HIPAA", requirement: "Access Controls", status: "not_started" },
    { framework: "HIPAA", requirement: "Audit Controls", status: "not_started" },
    { framework: "NIST", requirement: "Identify Assets", status: "in_progress" }
  ],
  assessments: [
    { title: "Q1 2025 IT Risk Assessment", assessment_type: "it", risk_category: "technology", status: "pending_review", inherent_likelihood: 4, inherent_impact: 4 },
    { title: "Cloud Infrastructure Assessment", assessment_type: "security", risk_category: "cyber", status: "approved", inherent_likelihood: 3, inherent_impact: 5 },
    { title: "Vendor Risk Assessment - AWS", assessment_type: "operational", risk_category: "third_party", status: "in_progress", inherent_likelihood: 2, inherent_impact: 4 }
  ],
  audits: [
    { name: "SOX 404 IT General Controls Audit", audit_type: "internal", is_template: true, status: "template", objectives: ["Test ITGC effectiveness", "Validate access controls", "Review change management"] },
    { name: "ISO 27001 Certification Audit", audit_type: "external", is_template: true, status: "template", objectives: ["Verify ISMS implementation", "Test security controls", "Review documentation"] }
  ]
};

export default function SampleDataGenerator() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const toggleOption = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  const generateSampleData = async () => {
    if (selectedOptions.length === 0) {
      toast.error("Please select at least one data type");
      return;
    }

    setGenerating(true);
    try {
      for (const optionId of selectedOptions) {
        const option = SAMPLE_DATA_OPTIONS.find(o => o.id === optionId);
        const data = SAMPLE_DATA[optionId];

        if (data && option.entity) {
          for (const record of data) {
            await base44.entities[option.entity].create(record);
          }
          
          queryClient.invalidateQueries({ queryKey: [option.entity.toLowerCase() + 's'] });
          queryClient.invalidateQueries({ queryKey: [option.id] });
        }
      }

      toast.success(`Successfully generated sample data!`);
      setSelectedOptions([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate sample data");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Database className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Sample Data Generator</h3>
              <p className="text-sm text-slate-400">
                Populate your environment with realistic sample data to explore features
              </p>
            </div>
          </div>

          <Card className="bg-blue-500/10 border border-blue-500/20 mt-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-300">
                  <strong>Note:</strong> Sample data is for learning purposes only. You can delete it anytime. 
                  It won't affect your production data.
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_DATA_OPTIONS.map((option) => (
          <Card 
            key={option.id}
            className={`bg-[#1a2332] border-2 transition-all cursor-pointer ${
              selectedOptions.includes(option.id)
                ? "border-indigo-500/50 bg-indigo-500/10"
                : "border-[#2a3548] hover:border-indigo-500/30"
            }`}
            onClick={() => toggleOption(option.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={() => toggleOption(option.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <Label className="text-base font-semibold text-white cursor-pointer">
                      {option.label}
                    </Label>
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                      {option.count} items
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{option.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold text-white mb-1">Ready to Generate?</h4>
              <p className="text-sm text-slate-400">
                {selectedOptions.length === 0 
                  ? "Select data types above to get started" 
                  : `${selectedOptions.length} data type(s) selected`}
              </p>
            </div>
            <Button
              onClick={generateSampleData}
              disabled={generating || selectedOptions.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Generate Sample Data</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
        <CardContent className="p-5">
          <h4 className="text-sm font-semibold text-white mb-2">What Happens Next?</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Sample data will be created in your environment</li>
            <li>• You can view, edit, or delete any sample records</li>
            <li>• Use this data to explore features and workflows</li>
            <li>• When ready, delete sample data and add your real data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}