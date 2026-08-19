import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function VendorRiskPrediction({ data }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictVendorRisks = async () => {
    setLoading(true);
    try {
      const vendorData = data.vendors.map(v => ({
        name: v.vendor_name,
        type: v.vendor_type,
        criticality: v.criticality,
        risk_tier: v.risk_tier,
        security_score: v.security_score || 0,
        compliance_status: v.compliance_status,
        last_assessment: v.last_assessment_date,
        days_since_assessment: v.last_assessment_date ? Math.floor((new Date() - new Date(v.last_assessment_date)) / (1000 * 60 * 60 * 24)) : 999,
        data_access: v.data_access_level,
        contract_end: v.contract_end_date
      }));

      const prompt = `You are an AI third-party risk analyzer. Predict vendor-related risks based on security scores, assessment history, and criticality.

VENDOR DATA (n=${vendorData.length}):
${JSON.stringify(vendorData, null, 2)}

PREDICT VENDOR RISKS:
1. Identify 6-8 high-risk vendors requiring immediate attention
2. For each: vendor_name, risk_score (0-100), risk_level (critical/high/medium), key_concerns (array), predicted_issues, recommended_actions (array)
3. Consider: security score trends, assessment gaps, criticality, data access, compliance status
4. Flag vendors likely to cause incidents in next 6 months

Return JSON:
{
  "high_risk_vendors": [{"vendor": "...", "risk_score": 85, "risk_level": "high", "concerns": ["...", "..."], "predicted_issues": "...", "actions": ["...", "..."]}],
  "summary": {"total_high_risk": 8, "critical": 2, "assessment_overdue": 5}
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            high_risk_vendors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vendor: { type: "string" },
                  risk_score: { type: "number" },
                  risk_level: { type: "string" },
                  concerns: { type: "array", items: { type: "string" } },
                  predicted_issues: { type: "string" },
                  actions: { type: "array", items: { type: "string" } }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_high_risk: { type: "number" },
                critical: { type: "number" },
                assessment_overdue: { type: "number" }
              }
            }
          }
        }
      });

      setPredictions(response);
      toast.success(`Identified ${response.summary?.total_high_risk || 0} high-risk vendors`);
    } catch (error) {
      console.error(error);
      toast.error("Vendor risk prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-400" />
              AI Vendor Risk Intelligence
            </CardTitle>
            <Button 
              onClick={predictVendorRisks}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
              Analyze Vendors
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Machine learning analyzes vendor security scores, assessment gaps, and historical patterns to identify high-risk third parties
          </p>
        </CardContent>
      </Card>

      {predictions && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white mb-1">{predictions.summary?.total_high_risk || 0}</div>
                <div className="text-xs text-slate-400">High-Risk Vendors</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-rose-400 mb-1">{predictions.summary?.critical || 0}</div>
                <div className="text-xs text-slate-400">Critical Risk Level</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-400 mb-1">{predictions.summary?.assessment_overdue || 0}</div>
                <div className="text-xs text-slate-400">Assessments Overdue</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {predictions.high_risk_vendors?.map((vendor, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      vendor.risk_level === 'critical' ? 'bg-rose-500/20' :
                      vendor.risk_level === 'high' ? 'bg-amber-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <Users className={`h-5 w-5 ${
                        vendor.risk_level === 'critical' ? 'text-rose-400' :
                        vendor.risk_level === 'high' ? 'text-amber-400' :
                        'text-yellow-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base font-semibold text-white mb-2">{vendor.vendor}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              vendor.risk_level === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                              vendor.risk_level === 'high' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {vendor.risk_level} Risk
                            </Badge>
                            <Badge className="bg-violet-500/20 text-violet-400">
                              Score: {vendor.risk_score}/100
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs font-semibold text-slate-400 mb-2">Key Concerns:</div>
                          <ul className="space-y-1">
                            {vendor.concerns?.map((concern, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-rose-400">⚠</span>
                                <span>{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="text-xs font-semibold text-emerald-400 mb-2">Recommended Actions:</div>
                          <ul className="space-y-1">
                            {vendor.actions?.map((action, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-400">→</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="text-xs font-semibold text-amber-400 mb-1">Predicted Issues:</div>
                        <div className="text-sm text-slate-300">{vendor.predicted_issues}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}