import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Sparkles, Filter, ArrowRight, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function KnowledgeSearch({ knowledgeData, onSearchComplete }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [filterModule, setFilterModule] = useState("all");

  const exampleQueries = [
    "What are my critical risks?",
    "Show me incomplete compliance requirements",
    "Which controls are ineffective?",
    "Recent security incidents",
    "Vendors with high risk scores",
    "Audit findings summary",
    "GDPR compliance status",
    "Incidents related to data breaches"
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    try {
      const context = {
        risks: knowledgeData.risks.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          status: r.status,
          likelihood: r.likelihood,
          impact: r.impact,
          owner: r.owner
        })),
        incidents: knowledgeData.incidents.map(i => ({
          id: i.id,
          title: i.title,
          description: i.description,
          type: i.incident_type,
          severity: i.severity,
          status: i.status,
          occurred_date: i.occurred_date
        })),
        controls: knowledgeData.controls.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          domain: c.domain,
          status: c.status,
          effectiveness: c.effectiveness
        })),
        compliance: knowledgeData.compliance.map(c => ({
          id: c.id,
          framework: c.framework,
          requirement: c.requirement,
          status: c.status,
          owner: c.owner
        })),
        assessments: knowledgeData.assessments.map(a => ({
          id: a.id,
          title: a.title,
          type: a.assessment_type,
          category: a.risk_category,
          status: a.lifecycle_status
        })),
        audits: knowledgeData.audits.map(a => ({
          id: a.id,
          title: a.title,
          type: a.type,
          status: a.status
        })),
        vendors: knowledgeData.vendors.map(v => ({
          id: v.id,
          name: v.name,
          criticality: v.criticality,
          risk_score: v.risk_score
        })),
        guidance: knowledgeData.guidance.map(g => ({
          id: g.id,
          title: g.title,
          framework: g.framework,
          category: g.category
        }))
      };

      const filterContext = filterModule !== "all" ? { [filterModule]: context[filterModule] } : context;

      const prompt = `You are an AI-powered GRC Knowledge Base assistant. Analyze the user's natural language query and search across all available GRC data to provide relevant, actionable results.

USER QUERY: "${query}"

AVAILABLE DATA:
${JSON.stringify(filterContext, null, 2)}

INSTRUCTIONS:
1. Understand the user's intent and what they're looking for
2. Search across all relevant modules (risks, incidents, controls, compliance, etc.)
3. Return ONLY the most relevant results (max 20 items)
4. Provide a brief summary of what was found
5. Include relevance scores for each result
6. Suggest follow-up queries or actions

Return results in this JSON format:
{
  "summary": "Brief overview of what was found",
  "total_matches": number,
  "results": [
    {
      "module": "risks|incidents|controls|compliance|assessments|audits|vendors|guidance",
      "id": "item_id",
      "title": "item title or name",
      "relevance": 0-100,
      "snippet": "why this is relevant",
      "details": {object with key item details}
    }
  ],
  "follow_up_queries": ["suggestion 1", "suggestion 2"],
  "recommended_actions": ["action 1", "action 2"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            total_matches: { type: "number" },
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  module: { type: "string" },
                  id: { type: "string" },
                  title: { type: "string" },
                  relevance: { type: "number" },
                  snippet: { type: "string" },
                  details: { type: "object" }
                }
              }
            },
            follow_up_queries: { type: "array", items: { type: "string" } },
            recommended_actions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResults(response);
      onSearchComplete?.(query, response.results);
      toast.success(`Found ${response.total_matches} results`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getModuleColor = (module) => {
    const colors = {
      risks: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      incidents: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      controls: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      compliance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      assessments: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      audits: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      vendors: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      guidance: "bg-teal-500/10 text-teal-400 border-teal-500/20"
    };
    return colors[module] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const getModulePage = (module) => {
    const pages = {
      risks: "Risks",
      incidents: "Incidents",
      controls: "Controls",
      compliance: "Compliance",
      assessments: "RiskAssessments",
      audits: "Audits",
      vendors: "ThirdPartyRiskManagement",
      guidance: "Guidance"
    };
    return pages[module];
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            Natural Language Search
          </CardTitle>
          <p className="text-xs text-slate-500">Ask questions in plain English across all GRC modules</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask anything... e.g., 'Show me all critical risks with no mitigation plan'"
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-36 bg-[#151d2e] border-[#2a3548] text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Modules</SelectItem>
                <SelectItem value="risks" className="text-white">Risks</SelectItem>
                <SelectItem value="incidents" className="text-white">Incidents</SelectItem>
                <SelectItem value="controls" className="text-white">Controls</SelectItem>
                <SelectItem value="compliance" className="text-white">Compliance</SelectItem>
                <SelectItem value="assessments" className="text-white">Assessments</SelectItem>
                <SelectItem value="audits" className="text-white">Audits</SelectItem>
                <SelectItem value="vendors" className="text-white">Vendors</SelectItem>
                <SelectItem value="guidance" className="text-white">Guidance</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Example Queries */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Try these example queries:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-indigo-500/10 border-[#2a3548] text-slate-400 hover:text-indigo-400 transition-colors"
                  onClick={() => setQuery(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Search Results</CardTitle>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {results.total_matches} matches
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-2">{results.summary}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Results List */}
            <div className="space-y-3">
              {results.results.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-[#151d2e] border border-[#2a3548] rounded-lg p-4 hover:border-indigo-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Badge className={`text-xs ${getModuleColor(result.module)}`}>
                        {result.module}
                      </Badge>
                      <h3 className="font-medium text-white text-sm">{result.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                        {result.relevance}% match
                      </Badge>
                      <Link to={createPageUrl(getModulePage(result.module))}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{result.snippet}</p>
                  {result.details && Object.keys(result.details).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.details).slice(0, 4).map(([key, value], i) => (
                        <span key={i} className="text-xs text-slate-500">
                          <span className="text-slate-600">{key}:</span> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Follow-up Queries */}
            {results.follow_up_queries?.length > 0 && (
              <div className="pt-4 border-t border-[#2a3548]">
                <p className="text-xs text-slate-500 mb-2">Suggested follow-up queries:</p>
                <div className="flex flex-wrap gap-2">
                  {results.follow_up_queries.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(suggestion)}
                      className="border-[#2a3548] text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30"
                    >
                      {suggestion}
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {results.recommended_actions?.length > 0 && (
              <div className="pt-4 border-t border-[#2a3548]">
                <p className="text-xs text-slate-500 mb-2">Recommended actions:</p>
                <div className="space-y-2">
                  {results.recommended_actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-emerald-400">
                      <ArrowRight className="h-3 w-3" />
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}