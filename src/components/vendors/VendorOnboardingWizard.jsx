import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Upload, Loader2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import AIVendorDataEnrichment from "./AIVendorDataEnrichment";
import AIOnboardingChecklistGenerator from "./AIOnboardingChecklistGenerator";
import AIOnboardingAssistant from "./AIOnboardingAssistant";

const ONBOARDING_TASKS = {
  technology: {
    critical: ["Security Architecture Review", "Data Access Audit", "Infrastructure Assessment", "Compliance Verification"],
    high: ["Security Controls Review", "Data Protection Assessment", "Access Management Review"],
    medium: ["Basic Security Review", "Data Handling Assessment"],
    low: ["Standard Security Checklist"]
  },
  saas: {
    critical: ["SaaS Security Assessment", "Data Residency Review", "API Security Review", "Vendor SOC 2 Verification"],
    high: ["Application Security Review", "Data Encryption Verification", "Access Controls Assessment"],
    medium: ["Basic SaaS Security Review", "Data Processing Agreement"],
    low: ["Standard SaaS Checklist"]
  },
  cloud: {
    critical: ["Cloud Security Posture Assessment", "Infrastructure Security Review", "Data Protection Assessment", "Compliance Certification Review"],
    high: ["Cloud Configuration Review", "Access Management Assessment", "Encryption Standards Review"],
    medium: ["Basic Cloud Security Assessment", "Data Storage Review"],
    low: ["Standard Cloud Security Checklist"]
  },
  service: {
    critical: ["Service Security Assessment", "Data Handling Review", "Physical Security Audit"],
    high: ["Service Level Review", "Security Controls Assessment"],
    medium: ["Basic Service Assessment", "Security Questionnaire"],
    low: ["Standard Service Checklist"]
  },
  default: {
    critical: ["Comprehensive Security Assessment", "Data Protection Review", "Compliance Verification"],
    high: ["Security Controls Assessment", "Risk Evaluation"],
    medium: ["Basic Security Assessment"],
    low: ["Standard Security Checklist"]
  }
};

export default function VendorOnboardingWizard({ open, onOpenChange, onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_type: "technology",
    description: "",
    criticality: "medium",
    primary_contact: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    contract_start_date: "",
    contract_end_date: "",
    data_access_level: "limited",
    certifications: []
  });
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);
  const [generatedChecklist, setGeneratedChecklist] = useState(null);

  const queryClient = useQueryClient();

  const onboardVendorMutation = useMutation({
    mutationFn: async (data) => {
      // Create vendor
      const vendor = await base44.entities.Vendor.create({
        ...data,
        status: 'under_review',
        compliance_status: 'not_assessed'
      });

      // Upload documents
      const documentUrls = await Promise.all(
        documents.map(doc => doc.url)
      );

      if (documentUrls.length > 0) {
        await base44.entities.Vendor.update(vendor.id, {
          contract_url: documentUrls[0] // Store first doc as contract
        });
      }

      // Auto-create assessment tasks based on vendor type and criticality
      const taskTemplates = ONBOARDING_TASKS[data.vendor_type] || ONBOARDING_TASKS.default;
      const tasks = taskTemplates[data.criticality] || taskTemplates.medium;

      const assessmentTasks = tasks.map((taskTitle, index) => ({
        vendor_id: vendor.id,
        task_title: taskTitle,
        description: `Onboarding assessment task for ${data.vendor_name}`,
        task_type: 'assessment',
        priority: data.criticality,
        status: 'not_started',
        due_date: new Date(Date.now() + (14 + index * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

      // Create initial assessment
      const assessment = await base44.entities.VendorAssessment.create({
        vendor_id: vendor.id,
        assessment_type: 'initial',
        assessment_date: new Date().toISOString().split('T')[0],
        status: 'in_progress',
        assessor: data.contact_email
      });

      // Send onboarding notification
      try {
        const user = await base44.auth.me();
        await base44.entities.Notification.create({
          user_email: user.email,
          type: 'vendor_risk_change',
          title: 'Vendor Onboarding Started',
          message: `${data.vendor_name} onboarding initiated with ${tasks.length} assessment tasks`,
          priority: data.criticality === 'critical' ? 'high' : 'medium',
          entity_type: 'Vendor',
          entity_id: vendor.id,
          action_url: '/ThirdPartyRiskManagement'
        });
      } catch (e) {
        console.error('Failed to create notification:', e);
      }

      return { vendor, assessment, tasks: assessmentTasks };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success("Vendor onboarding initiated successfully");
      onSuccess?.();
      resetWizard();
    },
    onError: () => {
      toast.error("Failed to onboard vendor");
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file }).then(result => ({
          name: file.name,
          url: result.file_url
        }))
      );
      const uploaded = await Promise.all(uploadPromises);
      setDocuments([...documents, ...uploaded]);
      toast.success(`Uploaded ${files.length} document(s)`);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const resetWizard = () => {
    setStep(1);
    setFormData({
      vendor_name: "",
      vendor_type: "technology",
      description: "",
      criticality: "medium",
      primary_contact: "",
      contact_email: "",
      contact_phone: "",
      website: "",
      contract_start_date: "",
      contract_end_date: "",
      data_access_level: "limited",
      certifications: []
    });
    setDocuments([]);
    setEnrichedData(null);
    setGeneratedChecklist(null);
  };

  const handleEnrichmentComplete = (enrichmentData) => {
    if (enrichmentData.enrichment_success && enrichmentData.vendor_data) {
      const data = enrichmentData.vendor_data;
      setFormData(prev => ({
        ...prev,
        description: data.description || prev.description,
        vendor_type: data.vendor_type || prev.vendor_type,
        primary_contact: data.primary_contact || prev.primary_contact,
        contact_email: data.contact_email || prev.contact_email,
        contact_phone: data.contact_phone || prev.contact_phone,
        criticality: data.suggested_criticality || prev.criticality,
        data_access_level: data.data_access_level || prev.data_access_level,
        certifications: data.certifications || prev.certifications
      }));
      setEnrichedData(enrichmentData);
    }
  };

  const handleSubmit = () => {
    onboardVendorMutation.mutate(formData);
  };

  const taskPreview = ONBOARDING_TASKS[formData.vendor_type]?.[formData.criticality] || 
                       ONBOARDING_TASKS.default[formData.criticality];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle>Vendor Onboarding Wizard</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-600 text-slate-400'
              }`}>
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-indigo-600' : 'bg-slate-600'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Vendor Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor Name *</Label>
                <Input
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* AI Data Enrichment */}
            {(formData.vendor_name || formData.website) && !enrichedData && (
              <AIVendorDataEnrichment
                vendorName={formData.vendor_name}
                website={formData.website}
                onEnrichmentComplete={handleEnrichmentComplete}
              />
            )}

            {enrichedData && (
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-400">
                      Data Enrichment Complete ({enrichedData.confidence_score}% confidence)
                    </p>
                  </div>
                  <p className="text-xs text-slate-300">{enrichedData.enrichment_summary}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor Type *</Label>
                <Select value={formData.vendor_type} onValueChange={(value) => setFormData({ ...formData, vendor_type: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="cloud">Cloud</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Criticality *</Label>
                <Select value={formData.criticality} onValueChange={(value) => setFormData({ ...formData, criticality: value })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                rows={3}
              />
            </div>

            <Button onClick={() => setStep(2)} disabled={!formData.vendor_name} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Next: Contact Information
            </Button>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>

            <div className="space-y-2">
              <Label>Primary Contact Name *</Label>
              <Input
                value={formData.primary_contact}
                onChange={(e) => setFormData({ ...formData, primary_contact: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email *</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1 border-[#2a3548]">
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!formData.primary_contact || !formData.contact_email} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Next: Documents
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Documents & Checklist */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Onboarding Checklist & Documents</h3>

            {/* AI Checklist Generator */}
            <AIOnboardingChecklistGenerator
              vendorType={formData.vendor_type}
              criticality={formData.criticality}
              dataAccessLevel={formData.data_access_level}
              onChecklistGenerated={(checklist) => setGeneratedChecklist(checklist)}
            />

            <p className="text-sm text-slate-400">Upload vendor contracts, certifications, and compliance documents</p>

            <Card className="bg-[#151d2e] border-[#2a3548] border-dashed">
              <CardContent className="p-6">
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="bg-[#1a2332] border-[#2a3548] text-white"
                />
                {uploading && (
                  <p className="text-xs text-blue-400 mt-2">
                    <Loader2 className="h-3 w-3 animate-spin inline mr-2" />
                    Uploading...
                  </p>
                )}
              </CardContent>
            </Card>

            {documents.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Documents ({documents.length})</Label>
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#151d2e] p-3 rounded border border-[#2a3548]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-white">{doc.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument(i)}
                      className="h-7 text-rose-400 hover:text-rose-300"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1 border-[#2a3548]">
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Next: Review & Submit
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: AI Assistant & Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">AI Assistant & Review</h3>

            {/* AI Onboarding Assistant */}
            <AIOnboardingAssistant
              vendorName={formData.vendor_name}
              vendorType={formData.vendor_type}
              criticality={formData.criticality}
              currentPhase="Final Review"
            />

            <Card className="bg-[#151d2e] border-[#2a3548]">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label>Vendor Name</Label>
                  <p className="text-white">{formData.vendor_name}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <p className="text-white">{formData.vendor_type}</p>
                  </div>
                  <div>
                    <Label>Criticality</Label>
                    <Badge className={
                      formData.criticality === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                      formData.criticality === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }>
                      {formData.criticality}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Contact</Label>
                  <p className="text-white">{formData.primary_contact} ({formData.contact_email})</p>
                </div>
                <div>
                  <Label>Documents</Label>
                  <p className="text-white">{documents.length} document(s) uploaded</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-500/10 border-emerald-500/30">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-2">Auto-Generated Assessment Tasks</h4>
                <p className="text-sm text-slate-300 mb-3">
                  Based on vendor type and criticality, the following {taskPreview.length} assessment tasks will be created:
                </p>
                <ul className="space-y-1">
                  {taskPreview.map((task, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      {task}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => setStep(3)} variant="outline" className="flex-1 border-[#2a3548]">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={onboardVendorMutation.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {onboardVendorMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Onboarding...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Complete Onboarding</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}