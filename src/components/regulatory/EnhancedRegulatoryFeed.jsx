import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radio, Globe, TrendingUp, AlertCircle, FileText, Calendar, 
  Building2, MapPin, Search, Filter, Sparkles, Brain, Loader2,
  RefreshCw, Clock, Target, ExternalLink, Bell, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EnhancedRegulatoryFeed() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingImpact, setGeneratingImpact] = useState(null);
  const [impactAnalysis, setImpactAnalysis] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);

  const frameworks = ["SOX", "FFIEC", "SOC2", "ISO27001", "GDPR", "PCI-DSS", "NIST", "HIPAA", "DORA", "Basel III"];
  const domains = [
    "Cybersecurity", "Data Privacy", "Operational Resilience", "Third-Party Risk",
    "Model Risk", "Consumer Protection", "Financial Crime", "Climate Risk", "AI Governance"
  ];
  const regions = ["USA", "UK", "EMEA", "UAE", "APAC", "LATAM"];

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchRegulatoryFeed, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchRegulatoryFeed = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a comprehensive regulatory intelligence feed for ${format(new Date(), 'MMMM d, yyyy')}:

**REGULATORY CHANGES** (10-12 items):
- Framework/regulation name
- Title and summary of change
- Effective date
- Impact level (Critical/High/Medium/Low)
- Affected frameworks/exam types
- Geographic scope
- Industry sectors impacted
- Key compliance requirements
- Potential consequences

**UPCOMING DEADLINES** (8-10 items):
- Regulation/framework
- Deadline date
- Requirement description
- Preparation recommendations
- Penalties for non-compliance

**INDUSTRY NEWS** (6-8 items):
- Title
- Summary
- Source
- Relevance to GRC/compliance
- Date

**ENFORCEMENT ACTIONS** (5-7 items):
- Regulator
- Company/entity
- Violation type
- Penalty/outcome
- Key lessons
- Prevention strategies

**EMERGING TRENDS** (4-6 items):
- Trend name
- Description
- Impact on compliance landscape
- Recommended actions

Focus on recent, verifiable regulatory updates across global jurisdictions.`;

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
                  title: { type: "string" },
                  summary: { type: "string" },
                  effective_date: { type: "string" },
                  impact_level: { type: "string" },
                  affected_frameworks: { type: "array", items: { type: "string" } },
                  geographic_scope: { type: "array", items: { type: "string" } },
                  industries: { type: "array", items: { type: "string" } },
                  key_requirements: { type: "array", items: { type: "string" } },
                  consequences: { type: "string" }
                }
              }
            },
            upcoming_deadlines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  regulation: { type: "string" },
                  deadline_date: { type: "string" },
                  requirement: { type: "string" },
                  preparation: { type: "array", items: { type: "string" } },
                  penalties: { type: "string" }
                }
              }
            },
            industry_news: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  source: { type: "string" },
                  relevance: { type: "string" },
                  date: { type: "string" }
                }
              }
            },
            enforcement_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  regulator: { type: "string" },
                  entity: { type: "string" },
                  violation_type: { type: "string" },
                  penalty: { type: "string" },
                  lessons: { type: "array", items: { type: "string" } },
                  prevention: { type: "array", items: { type: "string" } }
                }
              }
            },
            emerging_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  actions: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setFeedData(response);
      toast.success("Regulatory feed updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch regulatory feed");
    } finally {
      setLoading(false);
    }
  };

  const generateImpactAnalysis = async (item, itemType) => {
    setGeneratingImpact(item.title || item.regulation || item.trend);
    try {
      const prompt = `Analyze the potential impact of this regulatory update on different business areas and exam types:

${itemType === 'change' ? `
Framework: ${item.framework}
Title: ${item.title}
Summary: ${item.summary}
Effective Date: ${item.effective_date}
Impact Level: ${item.impact_level}
Affected Frameworks: ${item.affected_frameworks?.join(', ')}
Geographic Scope: ${item.geographic_scope?.join(', ')}
` : itemType === 'deadline' ? `
Regulation: ${item.regulation}
Deadline: ${item.deadline_date}
Requirement: ${item.requirement}
Penalties: ${item.penalties}
` : `
Trend: ${item.trend}
Description: ${item.description}
`}

Provide detailed analysis including:
1. Impact on specific exam types (FFIEC, SOX, SOC2, etc.)
2. Affected business areas (IT, Operations, Finance, Legal, etc.)
3. Risk implications
4. Recommended action items
5. Preparation timeline
6. Resource requirements`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            exam_type_impacts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exam_type: { type: "string" },
                  impact_description: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            business_area_impacts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  business_area: { type: "string" },
                  impact_description: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            risk_implications: { type: "array", items: { type: "string" } },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" },
                  owner: { type: "string" }
                }
              }
            },
            preparation_timeline: { type: "string" },
            resource_requirements: { type: "array", items: { type: "string" } }
          }
        }
      });

      setImpactAnalysis(prev => ({
        ...prev,
        [item.title || item.regulation || item.trend]: analysis
      }));
      toast.success("Impact analysis generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate impact analysis");
    } finally {
      setGeneratingImpact(null);
    }
  };

  const filterItems = (items) => {
    if (!items) return [];
    
    return items.filter(item => {
      const matchesSearch = searchQuery === "" || 
        JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFramework = selectedFramework === "all" || 
        (item.framework === selectedFramework || 
         item.affected_frameworks?.includes(selectedFramework) ||
         item.regulation?.includes(selectedFramework));
      
      const matchesDomain = selectedDomain === "all" ||
        JSON.stringify(item).toLowerCase().includes(selectedDomain.toLowerCase());
      
      const matchesRegion = selectedRegion === "all" ||
        item.geographic_scope?.includes(selectedRegion) ||
        JSON.stringify(item).includes(selectedRegion);

      return matchesSearch && matchesFramework && matchesDomain && matchesRegion;
    });
  };

  const impactColors = {
    Critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/5 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                  <Radio className="h-6 w-6 text-indigo-400" />
                </div>
                {autoRefresh && (
                  <>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"></div>
                  </>
                )}
              </div>
              <div>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  Real-Time Regulatory Intelligence Feed
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  AI-powered insights on regulations, compliance requirements & industry news
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto' : 'Manual'}
              </Button>
              <Button
                onClick={fetchRegulatoryFeed}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Loading...' : 'Fetch Latest'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      {feedData && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search feed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#0f1623] border-[#2a3548] text-white"
                />
              </div>

              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all">All Frameworks</SelectItem>
                  {frameworks.map(fw => (
                    <SelectItem key={fw} value={fw}>{fw}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFramework("all");
                  setSelectedDomain("all");
                  setSelectedRegion("all");
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feed Content */}
      {!feedData && !loading && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-12 text-center">
            <Radio className="h-16 w-16 mx-auto mb-4 text-indigo-400 opacity-50" />
            <p className="text-slate-400 mb-2">Click "Fetch Latest" to load the regulatory intelligence feed</p>
            <p className="text-slate-500 text-sm">Get real-time updates on regulations, deadlines, and industry news</p>
          </CardContent>
        </Card>
      )}

      {feedData && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="all">
              All Updates
              <Badge className="ml-2 text-xs">
                {(feedData.regulatory_changes?.length || 0) + 
                 (feedData.upcoming_deadlines?.length || 0) +
                 (feedData.industry_news?.length || 0) +
                 (feedData.enforcement_actions?.length || 0) +
                 (feedData.emerging_trends?.length || 0)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="changes">
              <AlertCircle className="h-4 w-4 mr-1.5" />
              Changes
              <Badge className="ml-2 text-xs">{feedData.regulatory_changes?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="deadlines">
              <Calendar className="h-4 w-4 mr-1.5" />
              Deadlines
              <Badge className="ml-2 text-xs">{feedData.upcoming_deadlines?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="news">
              <FileText className="h-4 w-4 mr-1.5" />
              News
              <Badge className="ml-2 text-xs">{feedData.industry_news?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="enforcement">
              <Building2 className="h-4 w-4 mr-1.5" />
              Enforcement
              <Badge className="ml-2 text-xs">{feedData.enforcement_actions?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendingUp className="h-4 w-4 mr-1.5" />
              Trends
              <Badge className="ml-2 text-xs">{feedData.emerging_trends?.length || 0}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Regulatory Changes */}
          <TabsContent value="all" className="space-y-3">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filterItems(feedData.regulatory_changes || []).map((change, idx) => (
                  <Card key={`change-${idx}`} className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-indigo-400" />
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                              {change.framework}
                            </Badge>
                            <Badge className={impactColors[change.impact_level]}>
                              {change.impact_level}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-2">{change.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{change.summary}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {change.geographic_scope?.map((geo, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {geo}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {change.effective_date}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-[#2a3548]">
                        <Button
                          size="sm"
                          onClick={() => generateImpactAnalysis(change, 'change')}
                          disabled={generatingImpact === change.title}
                          className="text-xs h-7 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {generatingImpact === change.title ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Brain className="h-3 w-3 mr-1" />
                          )}
                          AI Impact Analysis
                        </Button>
                        {impactAnalysis[change.title] && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                            Analysis Ready
                          </Badge>
                        )}
                      </div>

                      {impactAnalysis[change.title] && (
                        <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 space-y-3">
                          <div>
                            <h5 className="text-xs font-semibold text-blue-400 mb-2">Exam Type Impacts</h5>
                            <div className="space-y-1.5">
                              {impactAnalysis[change.title].exam_type_impacts?.map((impact, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <Badge className="text-[10px]">{impact.exam_type}</Badge>
                                  <span className="text-slate-300">{impact.impact_description}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-xs font-semibold text-purple-400 mb-2">Action Items</h5>
                            <div className="space-y-1">
                              {impactAnalysis[change.title].action_items?.slice(0, 3).map((action, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                  <Target className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span>{action.action}</span>
                                    <Badge className="ml-2 text-[10px]">{action.timeline}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="changes">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filterItems(feedData.regulatory_changes || []).map((change, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardContent className="p-4">
                      {/* Same content as in "all" tab */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                              {change.framework}
                            </Badge>
                            <Badge className={impactColors[change.impact_level]}>
                              {change.impact_level}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-2">{change.title}</h4>
                          <p className="text-xs text-slate-400">{change.summary}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="deadlines">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filterItems(feedData.upcoming_deadlines || []).map((deadline, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-amber-400" />
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                              {deadline.deadline_date}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-2">{deadline.regulation}</h4>
                          <p className="text-xs text-slate-400 mb-2">{deadline.requirement}</p>
                          {deadline.penalties && (
                            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20">
                              <p className="text-xs text-rose-400">
                                <strong>Penalties:</strong> {deadline.penalties}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="news">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filterItems(feedData.industry_news || []).map((news, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white flex-1">{news.title}</h4>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{news.summary}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#2a3548]">
                        <Badge variant="outline" className="text-xs">{news.source}</Badge>
                        <span className="text-xs text-slate-500">{news.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="enforcement">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filterItems(feedData.enforcement_actions || []).map((action, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4 text-rose-400" />
                        <Badge className="bg-rose-500/20 text-rose-400">{action.regulator}</Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-2">{action.entity}</h4>
                      <p className="text-xs text-slate-400 mb-2">{action.violation_type}</p>
                      <Badge className="bg-amber-500/20 text-amber-400 mb-3">{action.penalty}</Badge>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-semibold text-emerald-400">Key Lessons:</span>
                          <ul className="text-xs text-slate-400 mt-1 space-y-0.5">
                            {action.lessons?.map((lesson, i) => (
                              <li key={i}>• {lesson}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trends">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filterItems(feedData.emerging_trends || []).map((trend, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <h4 className="text-sm font-semibold text-white">{trend.trend}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{trend.description}</p>
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-slate-300 mb-2">
                          <strong className="text-blue-400">Impact:</strong> {trend.impact}
                        </p>
                        <div className="space-y-1">
                          {trend.actions?.map((action, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <Target className="h-3 w-3 text-blue-400 mt-0.5" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}