import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, TrendingUp, AlertTriangle, Shield, Loader2, CheckCircle2, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AIVendorRiskScoring() {
  const [scoring, setScoring] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const queryClient = useQueryClient();

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date')
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: () => base44.entities.VendorAssessment.list()
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['vendor-documents'],
    queryFn: () => base44.entities.VendorDocument.list()
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vendor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    }
  });

  const calculateRiskScore = async (vendor) => {
    setScoring(true);
    setSelectedVendor(vendor);
    
    try {
      // Gather vendor context
      const vendorAssessments = assessments.filter(a => a.vendor_id === vendor.id);
      const vendorDocs = documents.filter(d => d.vendor_id === vendor.id);
      
      const prompt = `You are an AI risk analyst. Calculate a comprehensive vendor risk score (0-100, where 0 is highest risk, 100 is lowest risk) based on:

VENDOR INFORMATION:
- Name: ${vendor.vendor_name}
- Type: ${vendor.vendor_type}
- Criticality: ${vendor.criticality}
- Current Risk Tier: ${vendor.risk_tier}
- Data Access Level: ${vendor.data_access_level}
- Compliance Status: ${vendor.compliance_status}
- Certifications: ${vendor.certifications?.join(', ') || 'None'}

ASSESSMENT DATA:
- Number of Assessments: ${vendorAssessments.length}
- Latest Assessment Score: ${vendorAssessments[0]?.overall_score || 'N/A'}
- Security Controls Score: ${vendorAssessments[0]?.security_controls_score || 'N/A'}
- Data Protection Score: ${vendorAssessments[0]?.data_protection_score || 'N/A'}
- Incident Response Score: ${vendorAssessments[0]?.incident_response_score || 'N/A'}

DOCUMENTATION:
- Number of Documents: ${vendorDocs.length}
- Has Recent Audit Report: ${vendorDocs.some(d => d.document_type === 'audit_report') ? 'Yes' : 'No'}
- Has Security Policy: ${vendorDocs.some(d => d.document_type === 'security_policy') ? 'Yes' : 'No'}

Provide a JSON response with this exact structure:
{
  "overall_score": <number 0-100>,
  "risk_level": "<critical|high|medium|low>",
  "confidence": <number 0-100>,
  "scoring_breakdown": {
    "security_posture": <number 0-100>,
    "compliance_standing": <number 0-100>,
    "operational_maturity": <number 0-100>,
    "documentation_quality": <number 0-100>,
    "assessment_results": <number 0-100>
  },
  "risk_factors": [
    {"factor": "<factor name>", "severity": "<critical|high|medium|low>", "impact": "<description>"}
  ],
  "strengths": [
    "<strength description>"
  ],
  "score_rationale": "<brief explanation of the score>"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            risk_level: { type: "string" },
            confidence: { type: "number" },
            scoring_breakdown: {
              type: "object",
              properties: {
                security_posture: { type: "number" },
                compliance_standing: { type: "number" },
                operational_maturity: { type: "number" },
                documentation_quality: { type: "number" },
                assessment_results: { type: "number" }
              }
            },
            risk_factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  severity: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            score_rationale: { type: "string" }
          }
        }
      });

      // Update vendor with calculated score
      await updateVendorMutation.mutateAsync({
        id: vendor.id,
        data: {
          security_score: response.overall_score,
          compliance_status: response.risk_level === 'critical' || response.risk_level === 'high' ? 'non_compliant' : 
                           response.risk_level === 'medium' ? 'under_review' : 'compliant'
        }
      });

      toast.success(`Risk score calculated: ${response.overall_score}/100`);
      return response;
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to calculate risk score");
    } finally {
      setScoring(false);
    }
  };

  const scoreAllVendors = async () => {
    setScoring(true);
    let successCount = 0;
    
    for (const vendor of vendors) {
      try {
        await calculateRiskScore(vendor);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
      } catch (error) {
        console.error(`Failed to score ${vendor.vendor_name}:`, error);
      }
    }
    
    setScoring(false);
    toast.success(`Scored ${successCount} of ${vendors.length} vendors`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const vendorsWithScores = vendors.filter(v => v.security_score);
  const avgScore = vendorsWithScores.length > 0 
    ? Math.round(vendorsWithScores.reduce((sum, v) => sum + v.security_score, 0) / vendorsWithScores.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Brain className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">AI Risk Scoring Engine</CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Automated vendor risk scoring based on assessments, documentation, and external data
                </p>
              </div>
            </div>
            <Button 
              onClick={scoreAllVendors} 
              disabled={scoring || vendors.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {scoring ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Scoring...</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" /> Score All Vendors</>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <p className="text-xs text-slate-400">Average Score</p>
            </div>
            <p className="text-2xl font-bold text-white">{avgScore}</p>
            <Progress value={avgScore} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <p className="text-xs text-slate-400">Vendors Scored</p>
            </div>
            <p className="text-2xl font-bold text-white">{vendorsWithScores.length}</p>
            <p className="text-xs text-slate-500 mt-1">of {vendors.length} total</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <p className="text-xs text-slate-400">High Risk</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {vendorsWithScores.filter(v => v.security_score < 60).length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Score &lt; 60</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <p className="text-xs text-slate-400">Low Risk</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {vendorsWithScores.filter(v => v.security_score >= 80).length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Score ≥ 80</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors List */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Vendor Risk Scores</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Click "Score Vendor" to calculate AI-powered risk score for each vendor
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {vendors.map(vendor => {
                const vendorAssessments = assessments.filter(a => a.vendor_id === vendor.id);
                const isScoring = scoring && selectedVendor?.id === vendor.id;
                
                return (
                  <div key={vendor.id} className="p-4 rounded-lg bg-gradient-to-br from-[#151d2e] to-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white">{vendor.vendor_name}</h4>
                          <Badge className={getSeverityColor(vendor.criticality)}>
                            {vendor.criticality}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{vendor.vendor_type}</p>
                      </div>
                      
                      {vendor.security_score ? (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            vendor.security_score >= 80 ? 'text-emerald-400' :
                            vendor.security_score >= 60 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {vendor.security_score}
                          </div>
                          <p className="text-xs text-slate-500">Risk Score</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{vendorAssessments.length} assessments</span>
                        <span>Tier: {vendor.risk_tier?.replace('tier_', '')}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => calculateRiskScore(vendor)}
                        disabled={isScoring}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isScoring ? (
                          <><Loader2 className="h-3 w-3 animate-spin mr-2" /> Scoring...</>
                        ) : vendor.security_score ? (
                          <><RefreshCw className="h-3 w-3 mr-2" /> Rescore</>
                        ) : (
                          <><Brain className="h-3 w-3 mr-2" /> Score Vendor</>
                        )}
                      </Button>
                    </div>

                    {vendor.security_score && (
                      <div className="mt-3 pt-3 border-t border-[#2a3548]">
                        <Progress value={vendor.security_score} className="h-1.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}