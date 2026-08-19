import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ClipboardCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  FileText,
  Shield,
  Building2,
  AlertTriangle,
  Loader2,
  Upload,
  Sparkles,
  X
} from "lucide-react";
import { toast } from "sonner";
import AIQuestionnaireAnalyzer from "./AIQuestionnaireAnalyzer";

const questionSections = {
  basicInfo: {
    title: "Basic Information",
    icon: Building2,
    questions: [
      { id: "company_name", label: "Company Name", type: "text", required: true },
      { id: "vendor_type", label: "Vendor Type", type: "select", options: ["technology", "service", "consulting", "cloud", "saas", "infrastructure", "data", "other"], required: true },
      { id: "website", label: "Website", type: "text", required: true },
      { id: "primary_contact", label: "Primary Contact Name", type: "text", required: true },
      { id: "contact_email", label: "Contact Email", type: "email", required: true },
      { id: "contact_phone", label: "Contact Phone", type: "tel", required: false },
      { id: "business_description", label: "Business Description", type: "textarea", required: true },
      { id: "years_in_business", label: "Years in Business", type: "number", required: true },
      { id: "employee_count", label: "Number of Employees", type: "number", required: false },
      { id: "service_description", label: "Services/Products Provided", type: "textarea", required: true }
    ]
  },
  security: {
    title: "Security & Compliance",
    icon: Shield,
    questions: [
      { id: "iso_27001", label: "ISO 27001 Certified", type: "checkbox", required: false },
      { id: "soc2", label: "SOC 2 Certified", type: "checkbox", required: false },
      { id: "gdpr_compliant", label: "GDPR Compliant", type: "checkbox", required: false },
      { id: "hipaa_compliant", label: "HIPAA Compliant", type: "checkbox", required: false, conditional: { field: "vendor_type", values: ["technology", "cloud", "saas", "data"] } },
      { id: "pci_dss", label: "PCI DSS Compliant", type: "checkbox", required: false, conditional: { field: "vendor_type", values: ["technology", "cloud", "saas"] } },
      { id: "security_framework", label: "Primary Security Framework Used", type: "select", options: ["NIST", "ISO 27001", "CIS Controls", "Other"], required: true },
      { id: "incident_response_plan", label: "Has Incident Response Plan", type: "checkbox", required: false },
      { id: "disaster_recovery", label: "Has Disaster Recovery Plan", type: "checkbox", required: false },
      { id: "last_pentest_date", label: "Last Penetration Test Date", type: "date", required: false, conditional: { field: "business_criticality", values: ["high", "critical"] } },
      { id: "vulnerability_scanning", label: "Regular Vulnerability Scanning", type: "checkbox", required: false, conditional: { field: "business_criticality", values: ["high", "critical"] } },
      { id: "document_upload_section", label: "Upload Compliance Certificates", type: "file_upload", required: false }
    ]
  },
  dataHandling: {
    title: "Data Handling",
    icon: FileText,
    questions: [
      { id: "data_access_level", label: "Data Access Level Required", type: "select", options: ["none", "limited", "moderate", "extensive"], required: true },
      { id: "data_types", label: "Types of Data to be Accessed", type: "multiselect", options: ["PII", "Financial", "Health", "Customer", "Employee", "Intellectual Property"], required: true },
      { id: "data_storage_location", label: "Data Storage Location(s)", type: "text", required: true, conditional: { field: "data_access_level", values: ["limited", "moderate", "extensive"] } },
      { id: "data_encryption", label: "Data Encryption at Rest", type: "checkbox", required: false, conditional: { field: "data_access_level", values: ["moderate", "extensive"] } },
      { id: "data_encryption_transit", label: "Data Encryption in Transit", type: "checkbox", required: false, conditional: { field: "data_access_level", values: ["moderate", "extensive"] } },
      { id: "data_backup_frequency", label: "Data Backup Frequency", type: "select", options: ["Daily", "Weekly", "Monthly", "Real-time"], required: true, conditional: { field: "data_access_level", values: ["moderate", "extensive"] } },
      { id: "data_retention_policy", label: "Data Retention Policy", type: "textarea", required: true, conditional: { field: "data_access_level", values: ["limited", "moderate", "extensive"] } },
      { id: "third_party_sharing", label: "Shares Data with Third Parties", type: "checkbox", required: false },
      { id: "third_party_list", label: "List Third Party Data Recipients", type: "textarea", required: false, conditional: { field: "third_party_sharing", values: [true] } }
    ]
  },
  risk: {
    title: "Risk Assessment",
    icon: AlertTriangle,
    questions: [
      { id: "business_criticality", label: "Business Criticality", type: "select", options: ["low", "medium", "high", "critical"], required: true },
      { id: "service_impact", label: "Impact if Service Unavailable", type: "select", options: ["minimal", "moderate", "significant", "severe"], required: true },
      { id: "geographic_risk", label: "Geographic Location(s)", type: "text", required: true },
      { id: "regulatory_risk", label: "Regulatory Requirements Applicable", type: "multiselect", options: ["SOX", "GDPR", "HIPAA", "PCI-DSS", "CCPA", "None"], required: true },
      { id: "access_controls", label: "User Access Control Measures", type: "textarea", required: true },
      { id: "background_checks", label: "Conducts Background Checks", type: "checkbox", required: false },
      { id: "insurance_coverage", label: "Cybersecurity Insurance Coverage", type: "checkbox", required: false },
      { id: "insurance_amount", label: "Insurance Coverage Amount", type: "text", required: false },
      { id: "past_incidents", label: "Past Security Incidents (Last 3 Years)", type: "textarea", required: false }
    ]
  },
  contractual: {
    title: "Contractual & Legal",
    icon: FileText,
    questions: [
      { id: "contract_type", label: "Proposed Contract Type", type: "select", options: ["MSA", "SOW", "Fixed Term", "Ongoing"], required: true },
      { id: "contract_duration", label: "Contract Duration (months)", type: "number", required: true },
      { id: "auto_renewal", label: "Auto-Renewal", type: "checkbox", required: false },
      { id: "notice_period", label: "Notice Period (days)", type: "number", required: true },
      { id: "sla_commitment", label: "SLA Commitments", type: "textarea", required: true },
      { id: "liability_limit", label: "Liability Limitation Acceptable", type: "checkbox", required: false },
      { id: "indemnification", label: "Indemnification Clause", type: "checkbox", required: false },
      { id: "right_to_audit", label: "Accepts Right to Audit Clause", type: "checkbox", required: false },
      { id: "data_ownership", label: "Data Ownership Terms", type: "textarea", required: true }
    ]
  }
};

export default function VendorOnboardingQuestionnaire({ open, onOpenChange, onComplete }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({});
  const [createdVendor, setCreatedVendor] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [conditionalQuestions, setConditionalQuestions] = useState({});
  const queryClient = useQueryClient();

  const sections = Object.keys(questionSections);
  const currentSectionKey = sections[currentSection];
  const currentSectionData = questionSections[currentSectionKey];
  const progress = ((currentSection + 1) / sections.length) * 100;

  const createVendorMutation = useMutation({
    mutationFn: async (data) => {
      // Create vendor
      const vendor = await base44.entities.Vendor.create({
        vendor_name: data.company_name,
        vendor_type: data.vendor_type || "saas",
        description: data.business_description,
        website: data.website,
        primary_contact: data.primary_contact,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        criticality: data.business_criticality || "medium",
        data_access_level: data.data_access_level || "limited",
        status: "under_review",
        certifications: [
          data.iso_27001 && "ISO 27001",
          data.soc2 && "SOC 2",
          data.gdpr_compliant && "GDPR",
          data.hipaa_compliant && "HIPAA",
          data.pci_dss && "PCI DSS"
        ].filter(Boolean),
        contract_start_date: new Date().toISOString().split('T')[0],
        contract_value: null,
        auto_renewal: data.auto_renewal || false,
        notice_period_days: data.notice_period || 30
      });

      // Upload vendor documents
      if (uploadedDocuments.length > 0) {
        await Promise.all(uploadedDocuments.map(doc =>
          base44.entities.VendorDocument.create({
            vendor_id: vendor.id,
            document_name: doc.name,
            document_type: doc.type,
            file_url: doc.url,
            uploaded_by: data.contact_email
          })
        ));
      }

      // Create initial onboarding tasks
      const tasks = [
        { title: "Review Security Questionnaire Responses", priority: "high", onboarding_stage: "document_collection" },
        { title: "Conduct Background Check", priority: "high", onboarding_stage: "assessment" },
        { title: "Review Certifications", priority: "medium", onboarding_stage: "document_collection" },
        { title: "Schedule Security Assessment", priority: "high", onboarding_stage: "assessment" },
        { title: "Legal Review of Contract Terms", priority: "critical", onboarding_stage: "approval" },
        { title: "Verify Insurance Coverage", priority: "medium", onboarding_stage: "document_collection" }
      ];

      await Promise.all(tasks.map(task => 
        base44.entities.VendorOnboardingTask.create({
          vendor_id: vendor.id,
          task_title: task.title,
          priority: task.priority,
          status: "not_started",
          onboarding_stage: task.onboarding_stage,
          auto_generated: true,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      ));

      // Create initial assessment
      await base44.entities.VendorAssessment.create({
        vendor_id: vendor.id,
        assessment_date: new Date().toISOString().split('T')[0],
        assessment_type: "initial",
        status: "in_progress",
        notes: `Questionnaire submitted. ${Object.keys(data).length} data points collected.`
      });

      return vendor;
    },
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-onboarding-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-assessments'] });
      setCreatedVendor(vendor);
      setShowAIAnalysis(true);
      toast.success("Questionnaire submitted - Starting AI analysis");
    },
    onError: () => {
      toast.error("Failed to initiate onboarding");
    }
  });

  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelectChange = (questionId, option) => {
    const current = formData[questionId] || [];
    const updated = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option];
    setFormData(prev => ({ ...prev, [questionId]: updated }));
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const document = {
        name: file.name,
        type: docType,
        url: file_url,
        uploaded_at: new Date().toISOString()
      };

      setUploadedDocuments(prev => [...prev, document]);
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload document");
    } finally {
      setUploadingFile(false);
    }
  };

  const removeDocument = (index) => {
    setUploadedDocuments(prev => prev.filter((_, idx) => idx !== index));
    toast.success("Document removed");
  };

  const generateAISuggestions = async () => {
    if (!formData.business_description && !formData.service_description) {
      toast.error("Please provide business description first");
      return;
    }

    setLoadingSuggestions(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this vendor information, suggest 5-8 additional critical assessment questions:

Vendor Type: ${formData.vendor_type || 'Not specified'}
Business Description: ${formData.business_description || 'Not provided'}
Services: ${formData.service_description || 'Not provided'}
Data Access: ${formData.data_access_level || 'Not specified'}
Criticality: ${formData.business_criticality || 'Not specified'}

Generate specific, actionable questions that would help assess this vendor's risk profile. Focus on:
- Industry-specific risks
- Service-specific security concerns
- Compliance requirements based on data handling
- Operational resilience questions

Return questions with their type and rationale.`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  type: { type: "string" },
                  rationale: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiSuggestions(result.questions || []);
      toast.success("AI suggestions generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const addAISuggestion = (suggestion, index) => {
    const questionId = `ai_suggested_${index}`;
    setConditionalQuestions(prev => ({
      ...prev,
      [questionId]: suggestion
    }));
    setAiSuggestions(prev => prev.filter((_, idx) => idx !== index));
    toast.success("Question added to assessment");
  };

  const shouldShowQuestion = (question) => {
    if (!question.conditional) return true;
    
    const { field, values } = question.conditional;
    const fieldValue = formData[field];
    
    return values.includes(fieldValue);
  };

  const isSectionComplete = () => {
    const visibleQuestions = currentSectionData.questions.filter(shouldShowQuestion);
    const requiredQuestions = visibleQuestions.filter(q => q.required);
    return requiredQuestions.every(q => {
      const value = formData[q.id];
      if (q.type === 'multiselect') return value && value.length > 0;
      return value !== undefined && value !== null && value !== '';
    });
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    createVendorMutation.mutate(formData);
  };

  const renderQuestion = (question) => {
    const value = formData[question.id];

    switch (question.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
        return (
          <Input
            type={question.type}
            value={value || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="bg-[#151d2e] border-[#2a3548] text-white"
            required={question.required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="bg-[#151d2e] border-[#2a3548] text-white"
            rows={3}
            required={question.required}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(v) => handleInputChange(question.id, v)}>
            <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
              {question.options.map(opt => (
                <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options.map(opt => (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  checked={(value || []).includes(opt)}
                  onCheckedChange={() => handleMultiSelectChange(question.id, opt)}
                  className="border-[#2a3548]"
                />
                <Label className="text-sm text-slate-300">{opt}</Label>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) => handleInputChange(question.id, checked)}
              className="border-[#2a3548]"
            />
            <Label className="text-sm text-slate-300">Yes</Label>
          </div>
        );
      
      case 'file_upload':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {['certification', 'security_policy', 'audit_report', 'insurance'].map(docType => (
                <div key={docType}>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, docType)}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    <div className="p-3 rounded-lg border-2 border-dashed border-[#2a3548] hover:border-indigo-500/50 transition-all text-center">
                      <Upload className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400 capitalize">{docType.replace(/_/g, ' ')}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Uploaded Documents:</p>
                {uploadedDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs text-white">{doc.name}</span>
                      <Badge className="bg-slate-500/20 text-slate-400 text-xs">{doc.type}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument(idx)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-rose-400"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {uploadingFile && (
              <div className="flex items-center gap-2 text-sm text-indigo-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const SectionIcon = currentSectionData.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-4 border-b border-[#2a3548]">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ClipboardCheck className="h-6 w-6 text-indigo-400" />
            Vendor Onboarding Questionnaire
          </DialogTitle>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Section {currentSection + 1} of {sections.length}</span>
              <span className="text-sm text-slate-400">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        {/* Section Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sections.map((key, idx) => {
              const section = questionSections[key];
              const Icon = section.icon;
              const isActive = idx === currentSection;
              const isComplete = idx < currentSection;
              
              return (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentSection(idx)}
                  className={`flex items-center gap-2 ${
                    isActive ? 'bg-indigo-500/20 text-indigo-400' : 
                    isComplete ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  <span className="text-xs whitespace-nowrap">{section.title}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <ScrollArea className="h-[50vh] px-6">
          <Card className="bg-[#151d2e] border-[#2a3548] mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <SectionIcon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{currentSectionData.title}</h3>
              </div>

              <div className="space-y-5">
                {currentSectionData.questions.filter(shouldShowQuestion).map(question => (
                  <div key={question.id} className="space-y-2">
                    <Label className="text-sm text-slate-300">
                      {question.label}
                      {question.required && <span className="text-rose-400 ml-1">*</span>}
                    </Label>
                    {renderQuestion(question)}
                  </div>
                ))}

                {/* AI-Suggested Questions */}
                {Object.values(conditionalQuestions).map((suggestion, idx) => (
                  <div key={`ai_${idx}`} className="space-y-2 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-start justify-between">
                      <Label className="text-sm text-violet-300 flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        {suggestion.question}
                      </Label>
                      <Badge className="bg-violet-500/20 text-violet-400 text-xs">{suggestion.priority}</Badge>
                    </div>
                    <Textarea
                      value={formData[`ai_${idx}`] || ''}
                      onChange={(e) => handleInputChange(`ai_${idx}`, e.target.value)}
                      className="bg-[#151d2e] border-[#2a3548] text-white"
                      rows={2}
                      placeholder={suggestion.rationale}
                    />
                  </div>
                ))}

                {/* AI Suggestion Button */}
                {currentSectionKey === 'basicInfo' && formData.service_description && (
                  <Button
                    onClick={generateAISuggestions}
                    disabled={loadingSuggestions}
                    variant="outline"
                    className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                  >
                    {loadingSuggestions ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get AI-Suggested Questions
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* AI Suggestions Panel */}
              {aiSuggestions.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <h4 className="text-sm font-semibold text-violet-300 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI-Recommended Questions ({aiSuggestions.length})
                  </h4>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm text-white">{suggestion.question}</p>
                          <Badge className="bg-violet-500/20 text-violet-400 text-xs ml-2">{suggestion.priority}</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{suggestion.rationale}</p>
                        <Button
                          size="sm"
                          onClick={() => addAISuggestion(suggestion, idx)}
                          className="bg-violet-600 hover:bg-violet-700 h-7 text-xs"
                        >
                          Add to Assessment
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollArea>

        <div className="p-6 pt-4 border-t border-[#2a3548] flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="border-[#2a3548] hover:bg-[#2a3548]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#2a3548] hover:bg-[#2a3548]"
            >
              Save Draft
            </Button>

            {currentSection < sections.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isSectionComplete()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isSectionComplete() || createVendorMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {createVendorMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Submit & Initiate Onboarding</>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {showAIAnalysis && createdVendor && (
        <AIQuestionnaireAnalyzer
          open={showAIAnalysis}
          onOpenChange={setShowAIAnalysis}
          questionnaireData={formData}
          vendor={createdVendor}
          onComplete={(analysis) => {
            toast.success("Vendor onboarding completed with AI risk assessment");
            onComplete?.(createdVendor);
            onOpenChange(false);
            setShowAIAnalysis(false);
          }}
        />
      )}
    </Dialog>
  );
}