import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, FileText, AlertTriangle, Shield, CheckCircle2, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function AISearchEngine({ onArticleSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-updated_date', 100)
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-updated_date', 100)
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100)
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list('-updated_date', 50)
  });

  const { data: guidance = [] } = useQuery({
    queryKey: ['guidance'],
    queryFn: () => base44.entities.Guidance.list('-updated_date', 100)
  });

  const performAISearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setSearching(true);
    try {
      const prompt = `You are a GRC knowledge search engine. Analyze the user's query and search across all GRC data.

**USER QUERY:** "${query}"

**AVAILABLE DATA:**
- Risks: ${risks.length} entries
- Compliance: ${compliance.length} entries
- Controls: ${controls.length} entries
- Audits: ${audits.length} entries
- Guidance: ${guidance.length} entries

**Sample Data:**
Risks: ${risks.slice(0, 3).map(r => `${r.title} (${r.category})`).join(', ')}
Compliance: ${compliance.slice(0, 3).map(c => `${c.requirement} (${c.framework})`).join(', ')}
Controls: ${controls.slice(0, 3).map(c => `${c.name} (${c.domain})`).join(', ')}
Guidance: ${guidance.slice(0, 3).map(g => `${g.title} (${g.framework})`).join(', ')}

Provide intelligent search results:
1. **Direct Matches** - Exact or close matches to the query
2. **Related Content** - Semantically related GRC information
3. **Best Practices** - Relevant best practices and recommendations
4. **Regulatory References** - Related regulations and frameworks`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            search_summary: { type: "string" },
            direct_matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  relevance_score: { type: "number" },
                  module: { type: "string" }
                }
              }
            },
            related_content: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  relationship: { type: "string" }
                }
              }
            },
            best_practices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  practice: { type: "string" },
                  category: { type: "string" },
                  implementation: { type: "string" }
                }
              }
            },
            regulatory_references: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  requirement: { type: "string" },
                  relevance: { type: "string" }
                }
              }
            }
          }
        }
      });

      setResults(result);
      toast.success("Search complete");
    } catch (error) {
      console.error(error);
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const getModuleIcon = (module) => {
    switch(module?.toLowerCase()) {
      case 'risk': return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'compliance': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'control': return <Shield className="h-4 w-4 text-blue-400" />;
      case 'audit': return <FileText className="h-4 w-4 text-purple-400" />;
      case 'guidance': return <BookOpen className="h-4 w-4 text-indigo-400" />;
      default: return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performAISearch()}
                placeholder="Search for risks, controls, compliance requirements, best practices..."
                className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <Button
              onClick={performAISearch}
              disabled={searching}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          {/* Search Summary */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 p-4">
            <p className="text-sm text-slate-300">{results.search_summary}</p>
          </Card>

          {/* Direct Matches */}
          {results.direct_matches?.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Direct Matches</h3>
              <div className="space-y-2">
                {results.direct_matches.map((match, idx) => (
                  <Card key={idx} className="bg-[#0f1623] border-[#2a3548] p-3 hover:border-indigo-500/30 cursor-pointer transition-all" onClick={() => onArticleSelect?.(match)}>
                    <div className="flex items-start gap-3">
                      {getModuleIcon(match.module)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-white">{match.title}</h4>
                          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
                            {match.relevance_score}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{match.description}</p>
                        <Badge className="text-xs bg-slate-500/20 text-slate-400 border-slate-500/30">
                          {match.module} • {match.type}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Related Content */}
          {results.related_content?.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Related Content</h3>
              <div className="space-y-2">
                {results.related_content.map((content, idx) => (
                  <div key={idx} className="p-2 bg-[#0f1623] rounded border border-[#2a3548]">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-white">{content.title}</h5>
                        <p className="text-xs text-slate-400 mb-1">{content.description}</p>
                        <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {content.relationship}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Best Practices */}
          {results.best_practices?.length > 0 && (
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Best Practices</h3>
              <div className="space-y-2">
                {results.best_practices.map((practice, idx) => (
                  <div key={idx} className="p-3 bg-[#0f1623] rounded">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-white">{practice.practice}</h5>
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mt-1">
                          {practice.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 ml-6">{practice.implementation}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Regulatory References */}
          {results.regulatory_references?.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548] p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Regulatory References</h3>
              <div className="space-y-2">
                {results.regulatory_references.map((ref, idx) => (
                  <div key={idx} className="p-2 bg-[#0f1623] rounded border border-amber-500/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30 mb-1">
                          {ref.framework}
                        </Badge>
                        <p className="text-xs text-white">{ref.requirement}</p>
                        <p className="text-xs text-slate-400 mt-1">{ref.relevance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}