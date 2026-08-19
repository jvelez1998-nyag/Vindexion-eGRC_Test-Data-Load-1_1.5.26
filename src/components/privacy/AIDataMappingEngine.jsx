import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, Database, AlertTriangle, Shield, Globe, Clock, FileText, Sparkles, CheckCircle2, Link as LinkIcon, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function AIDataMappingEngine() {
  const [step, setStep] = useState("discover");
  const [systemInput, setSystemInput] = useState({
    system_name: "",
    system_type: "database",
    description: "",
    data_fields: ""
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [mappingResults, setMappingResults] = useState(null);
  const [selectedRegulation, setSelectedRegulation] = useState("GDPR");

  const queryClient = useQueryClient();

  const { data: processingActivities = [] } = useQuery({
    queryKey: ['processing-activities'],
    queryFn: () => base44.entities.DataProcessingActivity.list('-created_date', 100),
    staleTime: 600000,
    cacheTime: 900000
  });

  const { data: privacyAssessments = [] } = useQuery({
    queryKey: ['privacy-assessments'],
    queryFn: () => base44.entities.PrivacyAssessment.list('-created_date', 100),
    staleTime: 600000,
    cacheTime: 900000
  });

  const createActivityMutation = useMutation({
    mutationFn: (data) => base44.entities.DataProcessingActivity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-activities'] });
      toast.success("Processing activity created");
    }
  });

  const analyzeDataSources = async () => {
    if (!systemInput.system_name || !systemInput.data_fields) {
      toast.error("Please provide system name and data fields");
      return;
    }

    setAnalyzing(true);
    try {
      const prompt = `You are a data privacy expert. Analyze this system and its data to map personal data for ${selectedRegulation} compliance.

SYSTEM INFORMATION:
- System Name: ${systemInput.system_name}
- System Type: ${systemInput.system_type}
- Description: ${systemInput.description}
- Data Fields: ${systemInput.data_fields}

ANALYSIS TASKS:
1. IDENTIFY & CLASSIFY each data field as:
   - Personal Data (GDPR Art. 4): any information relating to identified/identifiable person
   - Special Category Data (GDPR Art. 9): racial origin, health, biometric, etc.
   - Regular Data: non-personal information
   - Children's Data: if applicable

2. DETERMINE PROCESSING ACTIVITIES:
   - What processing activities does this system perform?
   - What are the purposes of processing?
   - Who are the data subjects?

3. SUGGEST RETENTION PERIODS:
   - Based on ${selectedRegulation} requirements
   - Consider data type and purpose
   - Provide legal justification

4. IDENTIFY RISKS & REQUIREMENTS:
   - Does this require a DPIA? (high risk processing)
   - Cross-border transfer implications?
   - Recommended lawful basis
   - Security measures needed

5. LINK TO COMPLIANCE:
   - Which processing activities should be created?
   - Which controls are recommended?
   - Regulatory articles applicable

Provide comprehensive analysis with actionable recommendations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            system_summary: { type: "string" },
            data_classification: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field_name: { type: "string" },
                  data_type: { type: "string" },
                  classification: { type: "string" },
                  is_special_category: { type: "boolean" },
                  gdpr_article: { type: "string" },
                  sensitivity_level: { type: "string" },
                  retention_recommendation: { type: "string" },
                  retention_justification: { type: "string" }
                }
              }
            },
            processing_activities_identified: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  activity_name: { type: "string" },
                  description: { type: "string" },
                  purposes: { type: "array", items: { type: "string" } },
                  lawful_basis_suggestion: { type: "string" },
                  data_subjects: { type: "array", items: { type: "string" } },
                  data_categories_used: { type: "array", items: { type: "string" } },
                  retention_period: { type: "string" },
                  requires_dpia: { type: "boolean" },
                  dpia_reason: { type: "string" }
                }
              }
            },
            privacy_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  affected_rights: { type: "array", items: { type: "string" } }
                }
              }
            },
            recommended_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  regulatory_reference: { type: "string" }
                }
              }
            },
            cross_border_analysis: {
              type: "object",
              properties: {
                involves_transfers: { type: "boolean" },
                transfer_mechanisms_needed: { type: "array", items: { type: "string" } },
                countries_identified: { type: "array", items: { type: "string" } }
              }
            },
            compliance_summary: {
              type: "object",
              properties: {
                dpia_required: { type: "boolean" },
                dpo_consultation_needed: { type: "boolean" },
                high_risk_processing: { type: "boolean" },
                key_articles: { type: "array", items: { type: "string" } },
                overall_risk_level: { type: "string" }
              }
            },
            next_steps: { type: "array", items: { type: "string" } }
          }
        }
      });

      setMappingResults(result);
      setStep("results");
      toast.success("Data mapping analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze data sources");
    } finally {
      setAnalyzing(false);
    }
  };

  const createProcessingActivity = async (activity) => {
    const activityData = {
      activity_name: activity.activity_name,
      description: activity.description,
      lawful_basis: activity.lawful_basis_suggestion?.toLowerCase().replace(/ /g, '_') || 'consent',
      processing_purposes: activity.purposes,
      data_subjects: activity.data_subjects,
      data_categories: activity.data_categories_used,
      retention_period: activity.retention_period,
      dpia_required: activity.requires_dpia,
      status: "active"
    };

    await createActivityMutation.mutateAsync(activityData);
  };

  const createAllActivities = async () => {
    if (!mappingResults?.processing_activities_identified) return;
    
    for (const activity of mappingResults.processing_activities_identified) {
      await createProcessingActivity(activity);
    }
    toast.success(`Created ${mappingResults.processing_activities_identified.length} processing activities`);
  };

  const getClassificationColor = (classification) => {
    if (classification?.toLowerCase().includes('special')) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (classification?.toLowerCase().includes('personal')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getSensitivityColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'low': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/5 border border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Data Mapping & Discovery Engine</h3>
                <p className="text-sm text-slate-400">Automated personal data classification and compliance mapping</p>
              </div>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              {selectedRegulation}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs value={step} onValueChange={setStep} className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548] w-full grid grid-cols-2">
          <TabsTrigger value="discover" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
            1. Discover
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400" disabled={!mappingResults}>
            2. Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">System & Data Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>System Name *</Label>
                  <Input
                    value={systemInput.system_name}
                    onChange={(e) => setSystemInput({ ...systemInput, system_name: e.target.value })}
                    placeholder="e.g., Customer CRM Database"
                    className="bg-[#151d2e] border-[#2a3548] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>System Type</Label>
                  <Select value={systemInput.system_type} onValueChange={(v) => setSystemInput({ ...systemInput, system_type: v })}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="file_system">File System</SelectItem>
                      <SelectItem value="cloud_storage">Cloud Storage</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="third_party">Third-Party Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>System Description</Label>
                <Textarea
                  value={systemInput.description}
                  onChange={(e) => setSystemInput({ ...systemInput, description: e.target.value })}
                  placeholder="Describe what this system does and how it processes data..."
                  className="bg-[#151d2e] border-[#2a3548] text-white h-20"
                />
              </div>

              <div className="space-y-2">
                <Label>Data Fields/Attributes *</Label>
                <Textarea
                  value={systemInput.data_fields}
                  onChange={(e) => setSystemInput({ ...systemInput, data_fields: e.target.value })}
                  placeholder="List all data fields, one per line or comma-separated:&#10;e.g., first_name, last_name, email, phone, address, date_of_birth, health_condition, payment_info"
                  className="bg-[#151d2e] border-[#2a3548] text-white h-32 font-mono text-xs"
                />
                <p className="text-xs text-slate-500">Provide field names and descriptions for best results</p>
              </div>

              <div className="space-y-2">
                <Label>Target Regulation</Label>
                <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="GDPR">GDPR (EU)</SelectItem>
                    <SelectItem value="CCPA">CCPA (California)</SelectItem>
                    <SelectItem value="PIPEDA">PIPEDA (Canada)</SelectItem>
                    <SelectItem value="LGPD">LGPD (Brazil)</SelectItem>
                    <SelectItem value="PDPA_Singapore">PDPA (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={analyzeDataSources}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {analyzing ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing Data Sources...</>
                ) : (
                  <><Brain className="h-4 w-4 mr-2" /> Analyze & Map Data</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {mappingResults && (
            <>
              {/* Summary Card */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                    <div>
                      <h3 className="text-base font-semibold text-white">AI Mapping Summary</h3>
                      <p className="text-sm text-slate-400">{mappingResults.system_summary}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#1a2332] rounded-lg border border-blue-500/20">
                      <div className="text-xs text-slate-400 mb-1">Data Fields</div>
                      <div className="text-xl font-bold text-blue-400">{mappingResults.data_classification?.length || 0}</div>
                    </div>
                    <div className="p-3 bg-[#1a2332] rounded-lg border border-rose-500/20">
                      <div className="text-xs text-slate-400 mb-1">Special Categories</div>
                      <div className="text-xl font-bold text-rose-400">
                        {mappingResults.data_classification?.filter(d => d.is_special_category).length || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-[#1a2332] rounded-lg border border-emerald-500/20">
                      <div className="text-xs text-slate-400 mb-1">Activities Found</div>
                      <div className="text-xl font-bold text-emerald-400">
                        {mappingResults.processing_activities_identified?.length || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-[#1a2332] rounded-lg border border-amber-500/20">
                      <div className="text-xs text-slate-400 mb-1">DPIA Required</div>
                      <div className="text-xl font-bold text-amber-400">
                        {mappingResults.compliance_summary?.dpia_required ? 'YES' : 'NO'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Summary */}
              <Card className={`bg-gradient-to-br ${
                mappingResults.compliance_summary?.high_risk_processing 
                  ? 'from-rose-500/10 to-orange-500/10 border-rose-500/20' 
                  : 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
              }`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {mappingResults.compliance_summary?.high_risk_processing ? (
                      <AlertTriangle className="h-6 w-6 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    )}
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-white mb-2">Compliance Assessment</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={mappingResults.compliance_summary?.dpia_required ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}>
                            DPIA: {mappingResults.compliance_summary?.dpia_required ? 'Required' : 'Not Required'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={mappingResults.compliance_summary?.dpo_consultation_needed ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}>
                            DPO: {mappingResults.compliance_summary?.dpo_consultation_needed ? 'Consult' : 'Optional'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSensitivityColor(mappingResults.compliance_summary?.overall_risk_level)}>
                            Risk: {mappingResults.compliance_summary?.overall_risk_level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={mappingResults.cross_border_analysis?.involves_transfers ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}>
                            Cross-Border: {mappingResults.cross_border_analysis?.involves_transfers ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                      {mappingResults.compliance_summary?.key_articles?.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-slate-500">Key Articles: </span>
                          <span className="text-xs text-indigo-400">{mappingResults.compliance_summary.key_articles.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for detailed results */}
              <Tabs defaultValue="classification" className="space-y-4">
                <TabsList className="bg-[#1a2332] border border-[#2a3548]">
                  <TabsTrigger value="classification">
                    <Database className="h-4 w-4 mr-2" />
                    Data Classification
                  </TabsTrigger>
                  <TabsTrigger value="activities">
                    <FileText className="h-4 w-4 mr-2" />
                    Processing Activities
                  </TabsTrigger>
                  <TabsTrigger value="risks">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Privacy Risks
                  </TabsTrigger>
                  <TabsTrigger value="controls">
                    <Shield className="h-4 w-4 mr-2" />
                    Controls
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="classification">
                  <Card className="bg-[#1a2332] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-base">Data Field Classification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                          {mappingResults.data_classification?.map((field, idx) => (
                            <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="text-sm font-semibold text-white font-mono">{field.field_name}</h4>
                                      {field.is_special_category && (
                                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                                          Art. 9
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge className={getClassificationColor(field.classification)}>
                                        {field.classification}
                                      </Badge>
                                      <Badge className={getSensitivityColor(field.sensitivity_level)}>
                                        {field.sensitivity_level}
                                      </Badge>
                                      {field.gdpr_article && (
                                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-xs">
                                          {field.gdpr_article}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-start gap-2">
                                    <Clock className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="text-slate-500">Retention: </span>
                                      <span className="text-slate-300">{field.retention_recommendation}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <FileText className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="text-slate-500">Justification: </span>
                                      <span className="text-slate-300">{field.retention_justification}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activities">
                  <Card className="bg-[#1a2332] border-[#2a3548]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Identified Processing Activities (RoPA)</CardTitle>
                        <Button
                          onClick={createAllActivities}
                          disabled={createActivityMutation.isPending}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Create All Activities
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4">
                          {mappingResults.processing_activities_identified?.map((activity, idx) => (
                            <Card key={idx} className={`bg-[#151d2e] border-2 ${
                              activity.requires_dpia ? 'border-rose-500/30' : 'border-[#2a3548]'
                            }`}>
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="text-base font-semibold text-white mb-2">{activity.activity_name}</h4>
                                    <p className="text-sm text-slate-400 mb-3">{activity.description}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                        {activity.lawful_basis_suggestion}
                                      </Badge>
                                      {activity.requires_dpia && (
                                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                                          <Shield className="h-3 w-3 mr-1" />
                                          DPIA Required
                                        </Badge>
                                      )}
                                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {activity.retention_period}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => createProcessingActivity(activity)}
                                    disabled={createActivityMutation.isPending}
                                    size="sm"
                                    variant="outline"
                                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Register
                                  </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-slate-500">Purposes:</span>
                                    <ul className="mt-1 space-y-0.5">
                                      {activity.purposes?.map((purpose, i) => (
                                        <li key={i} className="text-slate-300 flex items-start gap-1">
                                          <span className="text-indigo-400">•</span> {purpose}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">Data Subjects:</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {activity.data_subjects?.map((subject, i) => (
                                        <Badge key={i} variant="outline" className="text-xs border-slate-600">
                                          {subject}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {activity.requires_dpia && activity.dpia_reason && (
                                  <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded">
                                    <div className="text-xs text-rose-400 font-semibold mb-1">DPIA Rationale:</div>
                                    <p className="text-xs text-slate-300">{activity.dpia_reason}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="risks">
                  <Card className="bg-[#1a2332] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-base">Privacy Risks Identified</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                          {mappingResults.privacy_risks?.map((risk, idx) => (
                            <Card key={idx} className="bg-[#151d2e] border-rose-500/30">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3 mb-2">
                                  <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-white mb-1">{risk.risk_title}</h4>
                                    <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      <Badge className={getSensitivityColor(risk.severity)}>
                                        {risk.severity}
                                      </Badge>
                                      {risk.affected_rights?.map((right, i) => (
                                        <Badge key={i} variant="outline" className="text-xs border-rose-500/30 text-rose-400">
                                          {right}
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="controls">
                  <Card className="bg-[#1a2332] border-[#2a3548]">
                    <CardHeader>
                      <CardTitle className="text-base">Recommended Privacy Controls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                          {mappingResults.recommended_controls?.map((control, idx) => (
                            <Card key={idx} className="bg-[#151d2e] border-emerald-500/30">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <Shield className="h-5 w-5 text-emerald-400 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-sm font-semibold text-white">{control.control_name}</h4>
                                      <Badge className={
                                        control.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                                        control.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-blue-500/20 text-blue-400'
                                      }>
                                        {control.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2">{control.description}</p>
                                    {control.regulatory_reference && (
                                      <div className="text-xs text-indigo-400">
                                        📋 {control.regulatory_reference}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Next Steps */}
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mappingResults.next_steps?.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button onClick={() => setStep("discover")} variant="outline" className="flex-1 border-[#2a3548]">
                  Analyze Another System
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}