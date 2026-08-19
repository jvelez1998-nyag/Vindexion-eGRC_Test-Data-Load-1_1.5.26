import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, Upload, FileText, Database, BarChart3, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AIFieldworkAssistant({ audit }) {
  const [activeTask, setActiveTask] = useState('evidence');
  const [loading, setLoading] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [analysisQuery, setAnalysisQuery] = useState("");
  const [results, setResults] = useState(null);

  // Evidence Collection
  const handleEvidenceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEvidenceFile({ name: file.name, url: file_url });

      // AI analysis of uploaded evidence
      const prompt = `Analyze this audit evidence file for audit "${audit?.title || 'Unknown Audit'}".

Provide:
1. Document type and relevance
2. Key data points and metrics extracted
3. Compliance indicators (pass/fail/inconclusive)
4. Potential audit findings or concerns
5. Recommended follow-up procedures
6. Evidence quality assessment

Return structured JSON analysis.`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            document_type: { type: "string" },
            relevance_score: { type: "number" },
            key_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  value: { type: "string" },
                  status: { type: "string" }
                }
              }
            },
            compliance_status: { type: "string" },
            findings: { type: "array", items: { type: "string" } },
            concerns: { type: "array", items: { type: "string" } },
            follow_up_actions: { type: "array", items: { type: "string" } },
            quality_rating: { type: "string" },
            summary: { type: "string" }
          }
        }
      });

      setResults({ type: 'evidence', data: analysis });
      toast.success("Evidence analyzed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process evidence");
    } finally {
      setLoading(false);
    }
  };

  // Data Analysis
  const handleDataAnalysis = async () => {
    if (!analysisQuery) {
      toast.error("Please enter an analysis query");
      return;
    }

    setLoading(true);
    try {
      const prompt = `Perform data analysis for audit fieldwork.

Audit Context: ${audit?.title || 'Unknown'}
Analysis Request: ${analysisQuery}

Available Data:
- Historical control test results
- Risk assessments
- Incident reports
- Previous audit findings

Provide:
1. Statistical analysis summary
2. Key patterns and trends identified
3. Anomalies or outliers detected
4. Risk indicators
5. Compliance gaps
6. Data-driven recommendations
7. Visualization suggestions

Return structured JSON with actionable insights.`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            analysis_summary: { type: "string" },
            statistical_findings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  value: { type: "string" },
                  interpretation: { type: "string" }
                }
              }
            },
            patterns_identified: { type: "array", items: { type: "string" } },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  severity: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            risk_indicators: { type: "array", items: { type: "string" } },
            compliance_gaps: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            visualization_suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResults({ type: 'analysis', data: analysis });
      toast.success("Analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // Generate Testing Checklist
  const handleGenerateChecklist = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a comprehensive audit testing checklist for "${audit?.title || 'audit'}".

Create a detailed fieldwork checklist including:
1. Pre-fieldwork preparation tasks
2. Evidence collection requirements
3. Interview questions for key personnel
4. System and process testing steps
5. Documentation review items
6. Sampling methodology
7. Validation procedures
8. Quality assurance checkpoints

Make it practical and actionable for audit fieldwork.`;

      const checklist = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            checklist_title: { type: "string" },
            total_items: { type: "number" },
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category_name: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task: { type: "string" },
                        priority: { type: "string" },
                        estimated_time: { type: "string" },
                        required_evidence: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setResults({ type: 'checklist', data: checklist });
      toast.success("Checklist generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate checklist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Brain className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Fieldwork Assistant</h3>
            <p className="text-sm text-slate-400">Automate evidence collection and data analysis</p>
          </div>
        </div>

        <Tabs value={activeTask} onValueChange={setActiveTask}>
          <TabsList className="bg-[#151d2e] border border-[#2a3548] mb-6">
            <TabsTrigger value="evidence">Evidence Collection</TabsTrigger>
            <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
            <TabsTrigger value="checklist">Testing Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="evidence" className="space-y-4">
            <div className="border-2 border-dashed border-[#2a3548] rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors">
              <input
                type="file"
                onChange={handleEvidenceUpload}
                className="hidden"
                id="evidence-upload"
                accept=".pdf,.xlsx,.csv,.docx,.txt,.jpg,.png"
                disabled={loading}
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400 mb-1">
                  {loading ? "Processing..." : "Upload audit evidence"}
                </p>
                <p className="text-xs text-slate-600">
                  PDF, Excel, CSV, Word, Images supported
                </p>
              </label>
            </div>

            {evidenceFile && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{evidenceFile.name}</div>
                    <div className="text-xs text-slate-400">Uploaded and analyzed</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">What would you like to analyze?</Label>
              <Textarea
                value={analysisQuery}
                onChange={(e) => setAnalysisQuery(e.target.value)}
                placeholder="E.g., Analyze control testing patterns over the last quarter, identify trends in failed tests, detect anomalies in transaction volumes..."
                className="bg-[#151d2e] border-[#2a3548] text-white min-h-[100px]"
              />
            </div>
            <Button onClick={handleDataAnalysis} disabled={loading || !analysisQuery} className="bg-indigo-600 hover:bg-indigo-700 w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="checklist">
            <Button onClick={handleGenerateChecklist} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Generate Testing Checklist
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Results Display */}
      {results && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h4 className="font-semibold text-white mb-4">AI Analysis Results</h4>
          
          {results.type === 'evidence' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Document Type</div>
                  <div className="text-sm text-white">{results.data.document_type}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Relevance Score</div>
                  <div className="text-sm text-white">{results.data.relevance_score}/10</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Compliance Status</div>
                  <Badge className={results.data.compliance_status?.toLowerCase() === 'pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                    {results.data.compliance_status}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Quality Rating</div>
                  <div className="text-sm text-white">{results.data.quality_rating}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-400 mb-2">Summary</div>
                <p className="text-sm text-slate-300">{results.data.summary}</p>
              </div>

              {results.data.key_metrics?.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-400 mb-2">Key Metrics</div>
                  <div className="space-y-2">
                    {results.data.key_metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[#151d2e] rounded">
                        <span className="text-sm text-slate-300">{metric.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium">{metric.value}</span>
                          <Badge className={metric.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400 text-[10px]' : 'bg-rose-500/20 text-rose-400 text-[10px]'}>
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.data.concerns?.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-rose-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Concerns Identified
                  </div>
                  <ul className="space-y-1">
                    {results.data.concerns.map((concern, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-rose-400">•</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.data.follow_up_actions?.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-400 mb-2">Recommended Follow-up</div>
                  <ul className="space-y-1">
                    {results.data.follow_up_actions.map((action, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {results.type === 'analysis' && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-400 mb-2">Analysis Summary</div>
                <p className="text-sm text-slate-300">{results.data.analysis_summary}</p>
              </div>

              {results.data.anomalies?.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-orange-400 mb-2">Anomalies Detected</div>
                  <div className="space-y-2">
                    {results.data.anomalies.map((anomaly, idx) => (
                      <div key={idx} className="p-3 bg-orange-500/5 border border-orange-500/20 rounded">
                        <div className="flex items-start justify-between mb-1">
                          <div className="text-sm text-white font-medium">{anomaly.description}</div>
                          <Badge className="bg-orange-500/20 text-orange-400 text-[10px]">{anomaly.severity}</Badge>
                        </div>
                        <div className="text-xs text-slate-400">{anomaly.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.data.recommendations?.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-400 mb-2">Recommendations</div>
                  <ul className="space-y-1">
                    {results.data.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {results.type === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-white">{results.data.checklist_title}</h5>
                <Badge className="bg-indigo-500/20 text-indigo-400">{results.data.total_items} items</Badge>
              </div>

              <div className="space-y-4">
                {results.data.categories?.map((category, idx) => (
                  <div key={idx} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                    <h6 className="font-medium text-white mb-3">{category.category_name}</h6>
                    <div className="space-y-2">
                      {category.items?.map((item, i) => (
                        <div key={i} className="p-2 bg-[#1a2332] rounded flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-slate-300">{item.task}</div>
                            <div className="text-xs text-slate-500 mt-1">{item.required_evidence}</div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className="text-[10px] bg-slate-500/10 text-slate-400">{item.estimated_time}</Badge>
                            <Badge className={`text-[10px] ${item.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}