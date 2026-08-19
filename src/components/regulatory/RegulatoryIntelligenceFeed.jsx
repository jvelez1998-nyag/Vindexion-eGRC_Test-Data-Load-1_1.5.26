import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileCheck, Loader2, Calendar, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function RegulatoryIntelligenceFeed({ onIntelligenceReceived }) {
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState(null);

  const fetchRegulatoryIntelligence = async () => {
    setLoading(true);
    try {
      const prompt = `Provide the latest GRC regulatory and compliance intelligence for ${new Date().toLocaleDateString()}. Focus on:

1. **Recent Regulatory Changes** (5-7 updates):
   - Framework/regulation name
   - Change description
   - Effective date
   - Jurisdiction
   - Impact severity (Low/Medium/High/Critical)
   - Affected industries
   - Key compliance requirements

2. **Upcoming Compliance Deadlines** (5-7 deadlines):
   - Regulation
   - Deadline date
   - Requirement description
   - Penalties for non-compliance
   - Preparation recommendations

3. **New Regulatory Frameworks** (2-4):
   - Framework name
   - Purpose and scope
   - Applicable to (industries/regions)
   - Key control areas
   - Implementation timeline

4. **Regulatory Enforcement Actions** (3-5):
   - Regulator/authority
   - Violation type
   - Penalty amount
   - Key lessons learned
   - Prevention measures

5. **Framework Updates** (4-6):
   - Framework (ISO 27001, NIST, SOC 2, etc.)
   - Version changes
   - New requirements
   - Migration guidance

6. **Industry Guidance** (3-5):
   - Industry sector
   - Compliance best practices
   - Common pitfalls
   - Recommended actions

Provide current, accurate regulatory intelligence.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            last_updated: { type: "string" },
            regulatory_changes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  change: { type: "string" },
                  effective_date: { type: "string" },
                  jurisdiction: { type: "string" },
                  impact_severity: { type: "string" },
                  affected_industries: { type: "array", items: { type: "string" } },
                  requirements: { type: "array", items: { type: "string" } }
                }
              }
            },
            compliance_deadlines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  regulation: { type: "string" },
                  deadline: { type: "string" },
                  requirement: { type: "string" },
                  penalties: { type: "string" },
                  preparation: { type: "array", items: { type: "string" } }
                }
              }
            },
            new_frameworks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  purpose: { type: "string" },
                  applicable_to: { type: "array", items: { type: "string" } },
                  control_areas: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" }
                }
              }
            },
            enforcement_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  regulator: { type: "string" },
                  violation_type: { type: "string" },
                  penalty: { type: "string" },
                  lessons: { type: "array", items: { type: "string" } },
                  prevention: { type: "array", items: { type: "string" } }
                }
              }
            },
            framework_updates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  version: { type: "string" },
                  new_requirements: { type: "array", items: { type: "string" } },
                  migration_guidance: { type: "string" }
                }
              }
            },
            industry_guidance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  industry: { type: "string" },
                  best_practices: { type: "array", items: { type: "string" } },
                  pitfalls: { type: "array", items: { type: "string" } },
                  actions: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setIntelligence(response);
      if (onIntelligenceReceived) {
        onIntelligenceReceived(response);
      }
      toast.success("Regulatory intelligence updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch regulatory intelligence");
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    Critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-white">Regulatory Intelligence Feed</h3>
        </div>
        <Button 
          onClick={fetchRegulatoryIntelligence}
          disabled={loading}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {loading ? "Fetching..." : "Fetch Updates"}
        </Button>
      </div>

      {!intelligence && !loading && (
        <Alert className="bg-indigo-500/10 border-indigo-500/30">
          <FileCheck className="h-4 w-4 text-indigo-400" />
          <AlertDescription className="text-white">
            Click "Fetch Updates" to retrieve the latest regulatory changes and compliance intelligence.
          </AlertDescription>
        </Alert>
      )}

      {intelligence && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="text-sm font-medium text-white">Last Updated</div>
                  <div className="text-xs text-slate-400">{intelligence.last_updated}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {/* Regulatory Changes */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-indigo-400" />
                    Recent Regulatory Changes ({intelligence.regulatory_changes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {intelligence.regulatory_changes.map((change, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-semibold text-white text-sm">{change.framework}</h5>
                          <p className="text-xs text-slate-400 mt-1">{change.change}</p>
                        </div>
                        <Badge className={severityColors[change.impact_severity]}>
                          {change.impact_severity}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                          {change.jurisdiction}
                        </Badge>
                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                          {change.effective_date}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500">
                        <strong className="text-slate-400">Industries:</strong> {change.affected_industries.join(', ')}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Compliance Deadlines */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    Upcoming Compliance Deadlines ({intelligence.compliance_deadlines.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {intelligence.compliance_deadlines.map((deadline, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-semibold text-white text-sm">{deadline.regulation}</h5>
                          <p className="text-xs text-slate-400 mt-1">{deadline.requirement}</p>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          {deadline.deadline}
                        </Badge>
                      </div>
                      <div className="p-2 bg-rose-500/5 rounded text-xs text-rose-400 mb-2">
                        <strong>Penalties:</strong> {deadline.penalties}
                      </div>
                      <div className="text-xs text-slate-400">
                        <strong className="text-slate-300">Preparation:</strong>
                        <ul className="mt-1 space-y-0.5">
                          {deadline.preparation.map((prep, i) => (
                            <li key={i}>• {prep}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Framework Updates */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    Framework Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {intelligence.framework_updates.map((update, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="font-semibold text-white text-sm">{update.framework}</h5>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                          {update.version}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400 mb-2">
                        <strong className="text-slate-300">New Requirements:</strong>
                        <ul className="mt-1 space-y-0.5">
                          {update.new_requirements.map((req, i) => (
                            <li key={i}>• {req}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-slate-500">{update.migration_guidance}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}