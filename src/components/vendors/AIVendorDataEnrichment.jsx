import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AIVendorDataEnrichment({ vendorName, website, onEnrichmentComplete }) {
  const [enriching, setEnriching] = useState(false);

  const enrichVendorData = async () => {
    if (!vendorName && !website) {
      toast.error("Please provide vendor name or website");
      return;
    }

    setEnriching(true);
    
    try {
      const prompt = `You are an AI data enrichment specialist. Research and gather comprehensive information about this vendor:

Vendor Name: ${vendorName || 'N/A'}
Website: ${website || 'N/A'}

Research and provide:
1. Company overview and description
2. Primary business focus and services
3. Industry and vendor type classification
4. Headquarters location
5. Company size (employees, revenue estimates)
6. Key certifications (ISO 27001, SOC 2, GDPR compliance, etc.)
7. Recent news or developments
8. Primary contact information (if publicly available)
9. Data protection and privacy policies
10. Security posture indicators

Provide a JSON response:
{
  "enrichment_success": <boolean>,
  "confidence_score": <number 0-100>,
  "vendor_data": {
    "description": "<comprehensive company description>",
    "vendor_type": "<technology|service|consulting|cloud|saas|infrastructure|data>",
    "primary_contact": "<contact name if found>",
    "contact_email": "<email if found>",
    "contact_phone": "<phone if found>",
    "headquarters_location": "<location>",
    "employee_count": "<estimate or range>",
    "annual_revenue": "<estimate or range>",
    "founded_year": "<year or N/A>",
    "certifications": [
      "<certification name>"
    ],
    "data_access_level": "<none|limited|moderate|extensive>",
    "suggested_criticality": "<low|medium|high|critical>",
    "criticality_rationale": "<why this criticality level>"
  },
  "risk_indicators": [
    {
      "indicator": "<indicator name>",
      "severity": "<critical|high|medium|low>",
      "description": "<detailed description>"
    }
  ],
  "compliance_indicators": {
    "gdpr_compliant": <boolean>,
    "soc2_certified": <boolean>,
    "iso27001_certified": <boolean>,
    "hipaa_compliant": <boolean>,
    "pci_dss_compliant": <boolean>
  },
  "recent_news": [
    {
      "headline": "<headline>",
      "date": "<date>",
      "summary": "<brief summary>",
      "sentiment": "<positive|negative|neutral>"
    }
  ],
  "enrichment_summary": "<summary of findings and confidence level>"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            enrichment_success: { type: "boolean" },
            confidence_score: { type: "number" },
            vendor_data: {
              type: "object",
              properties: {
                description: { type: "string" },
                vendor_type: { type: "string" },
                primary_contact: { type: "string" },
                contact_email: { type: "string" },
                contact_phone: { type: "string" },
                headquarters_location: { type: "string" },
                employee_count: { type: "string" },
                annual_revenue: { type: "string" },
                founded_year: { type: "string" },
                certifications: { type: "array", items: { type: "string" } },
                data_access_level: { type: "string" },
                suggested_criticality: { type: "string" },
                criticality_rationale: { type: "string" }
              }
            },
            risk_indicators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  indicator: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            compliance_indicators: {
              type: "object",
              properties: {
                gdpr_compliant: { type: "boolean" },
                soc2_certified: { type: "boolean" },
                iso27001_certified: { type: "boolean" },
                hipaa_compliant: { type: "boolean" },
                pci_dss_compliant: { type: "boolean" }
              }
            },
            recent_news: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  date: { type: "string" },
                  summary: { type: "string" },
                  sentiment: { type: "string" }
                }
              }
            },
            enrichment_summary: { type: "string" }
          }
        }
      });

      if (response.enrichment_success) {
        toast.success(`Data enrichment complete (${response.confidence_score}% confidence)`);
        onEnrichmentComplete(response);
      } else {
        toast.warning("Limited data found - please verify and complete manually");
        onEnrichmentComplete(response);
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Data enrichment failed");
    } finally {
      setEnriching(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Data Enrichment</p>
              <p className="text-xs text-slate-400">Auto-fill vendor information from web intelligence</p>
            </div>
          </div>
          <Button
            onClick={enrichVendorData}
            disabled={enriching || (!vendorName && !website)}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            {enriching ? (
              <><Loader2 className="h-3 w-3 animate-spin mr-2" /> Enriching...</>
            ) : (
              <><Sparkles className="h-3 w-3 mr-2" /> Enrich Data</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}