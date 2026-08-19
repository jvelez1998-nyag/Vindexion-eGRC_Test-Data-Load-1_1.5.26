import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Rss, ExternalLink, BookOpen, AlertTriangle, FileText, 
  Clock, TrendingUp, Filter, Search, RefreshCw, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function LiveRegulatoryFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [aiInsights, setAiInsights] = useState(null);

  const categories = [
    { id: 'all', label: 'All Updates' },
    { id: 'banking', label: 'Banking & Finance' },
    { id: 'cybersecurity', label: 'Cybersecurity' },
    { id: 'privacy', label: 'Data Privacy' },
    { id: 'sox', label: 'SOX/Financial' },
    { id: 'international', label: 'International' }
  ];

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search the internet for the latest regulatory updates, compliance news, and examination guidance from the past 30 days. Focus on:
- FFIEC, FDIC, OCC, Federal Reserve banking regulations
- SEC, FINRA financial regulations
- NIST, ISO cybersecurity standards
- GDPR, CCPA privacy regulations
- SOX compliance updates
- Industry best practices

Return structured regulatory updates with source, date, summary, and impact level.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            updates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  source: { type: "string" },
                  category: { type: "string" },
                  date: { type: "string" },
                  summary: { type: "string" },
                  impact_level: { type: "string" },
                  url: { type: "string" },
                  key_changes: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setFeed(result.updates || []);
      toast.success(`Loaded ${result.updates?.length || 0} regulatory updates`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load regulatory feed");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (feed.length === 0) {
      toast.error("Fetch feed first");
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these recent regulatory updates and provide strategic insights:

${JSON.stringify(feed.slice(0, 10), null, 2)}

Provide:
1. Top 3 emerging regulatory trends
2. High-priority actions organizations should take
3. Potential compliance risks on the horizon
4. Recommended preparation steps`,
        response_json_schema: {
          type: "object",
          properties: {
            emerging_trends: { type: "array", items: { type: "string" } },
            priority_actions: { type: "array", items: { type: "string" } },
            compliance_risks: { type: "array", items: { type: "string" } },
            preparation_steps: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAiInsights(result);
      toast.success("AI insights generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  const filteredFeed = feed.filter(item => {
    const matchesSearch = !search || 
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.summary?.toLowerCase().includes(search.toLowerCase()) ||
      item.source?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
      item.category?.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const impactColors = {
    high: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Rss className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Live Regulatory Feed</h2>
              <p className="text-slate-400 text-sm mt-1">
                Real-time updates from regulatory bodies worldwide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={generateInsights}
              disabled={loading || feed.length === 0}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="h-4 w-4" />
              AI Insights
            </Button>
            <Button 
              onClick={fetchFeed}
              disabled={loading}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Feed'}
            </Button>
          </div>
        </div>
      </Card>

      {/* AI Insights Panel */}
      {aiInsights && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Strategic Insights
          </h3>
          <Tabs defaultValue="trends">
            <TabsList className="bg-[#0f1623] border border-[#2a3548]">
              <TabsTrigger value="trends">Emerging Trends</TabsTrigger>
              <TabsTrigger value="actions">Priority Actions</TabsTrigger>
              <TabsTrigger value="risks">Compliance Risks</TabsTrigger>
              <TabsTrigger value="steps">Preparation Steps</TabsTrigger>
            </TabsList>
            <TabsContent value="trends" className="mt-4">
              <ul className="space-y-2">
                {aiInsights.emerging_trends?.map((trend, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <TrendingUp className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    {trend}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="actions" className="mt-4">
              <ul className="space-y-2">
                {aiInsights.priority_actions?.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="risks" className="mt-4">
              <ul className="space-y-2">
                {aiInsights.compliance_risks?.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="steps" className="mt-4">
              <ul className="space-y-2">
                {aiInsights.preparation_steps?.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <FileText className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-[#1a2332] border-[#2a3548] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search updates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full sm:w-auto">
            <TabsList className="bg-[#151d2e] border border-[#2a3548] grid grid-cols-3 sm:inline-flex">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-xs"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Feed Items */}
      <ScrollArea className="h-[700px]">
        {feed.length === 0 ? (
          <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
            <Rss className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Updates Loaded</h3>
            <p className="text-slate-400 mb-6">Click "Refresh Feed" to load the latest regulatory updates</p>
            <Button onClick={fetchFeed} className="bg-emerald-600 hover:bg-emerald-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Feed
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFeed.map((item, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={impactColors[item.impact_level?.toLowerCase()] || 'bg-slate-500/20 text-slate-400'}>
                          {item.impact_level}
                        </Badge>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                          {item.source}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-3">{item.summary}</p>
                      
                      {item.key_changes && item.key_changes.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-slate-500 mb-2">Key Changes:</div>
                          <ul className="space-y-1">
                            {item.key_changes.map((change, cidx) => (
                              <li key={cidx} className="text-xs text-slate-400 flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {item.url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-2 border-[#2a3548] text-indigo-400"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Read More
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}