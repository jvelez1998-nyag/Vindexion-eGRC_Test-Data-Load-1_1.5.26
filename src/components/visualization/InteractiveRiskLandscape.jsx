import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  Shield, 
  ArrowLeft,
  TrendingUp,
  Activity,
  Target,
  Filter,
  X,
  Radio,
  Layers,
  Zap,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ZAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export default function InteractiveRiskLandscape({ risks = [], controls = [] }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showThreatFeed, setShowThreatFeed] = useState(true);
  const [showControlOverlay, setShowControlOverlay] = useState(true);
  const [controlEffectivenessFilter, setControlEffectivenessFilter] = useState('all');

  // Fetch real-time threat intelligence
  const { data: threatFeeds = [] } = useQuery({
    queryKey: ['threat-feeds-live'],
    queryFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide current top 10 cybersecurity and operational threats for enterprise GRC teams. Include:
- Threat name
- Category (cybersecurity, operational, compliance, financial, strategic, reputational)
- Severity (critical, high, medium, low)
- Description (1 sentence)
- Mitigation priority (1-10)

Base this on current 2025 threat landscape.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            threats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "number" }
                }
              }
            }
          }
        }
      });
      return result.threats || [];
    },
    staleTime: 3600000, // 1 hour
    enabled: showThreatFeed
  });

  const categories = useMemo(() => {
    return [...new Set(risks.map(r => r.category).filter(Boolean))];
  }, [risks]);

  const statuses = useMemo(() => {
    return [...new Set(risks.map(r => r.status).filter(Boolean))];
  }, [risks]);

  const filteredRisks = useMemo(() => {
    let filtered = selectedCategory 
      ? risks.filter(r => r.category === selectedCategory)
      : risks;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(r => r.category === filterCategory);
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(r => {
        const score = (r.likelihood || 0) * (r.impact || 0);
        switch (filterSeverity) {
          case 'critical': return score >= 20;
          case 'high': return score >= 15 && score < 20;
          case 'medium': return score >= 6 && score < 15;
          case 'low': return score < 6;
          default: return true;
        }
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (controlEffectivenessFilter !== 'all') {
      filtered = filtered.filter(r => {
        const linkedControls = controls.filter(c => 
          r.linked_controls?.includes(c.id) || c.linked_risks?.includes(r.id)
        );
        const avgEffectiveness = linkedControls.length > 0
          ? linkedControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / linkedControls.length
          : 0;
        
        switch (controlEffectivenessFilter) {
          case 'high': return avgEffectiveness >= 4;
          case 'medium': return avgEffectiveness >= 2.5 && avgEffectiveness < 4;
          case 'low': return avgEffectiveness < 2.5;
          case 'none': return linkedControls.length === 0;
          default: return true;
        }
      });
    }

    return filtered;
  }, [risks, controls, selectedCategory, filterCategory, filterSeverity, filterStatus, controlEffectivenessFilter]);

  const riskMatrix = useMemo(() => {
    return filteredRisks.map(risk => {
      const linkedControls = controls.filter(c => 
        risk.linked_controls?.includes(c.id) || c.linked_risks?.includes(risk.id)
      );
      const avgControlEffectiveness = linkedControls.length > 0
        ? linkedControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / linkedControls.length
        : 0;
      const hasEffectiveControls = linkedControls.some(c => c.status === 'effective' || c.effectiveness >= 4);
      
      return {
        ...risk,
        x: risk.likelihood || 1,
        y: risk.impact || 1,
        z: ((risk.likelihood || 1) * (risk.impact || 1)),
        controlCount: linkedControls.length,
        avgControlEffectiveness,
        hasEffectiveControls,
        color: (risk.likelihood || 1) * (risk.impact || 1) >= 20 ? '#ef4444' :
               (risk.likelihood || 1) * (risk.impact || 1) >= 15 ? '#f59e0b' :
               (risk.likelihood || 1) * (risk.impact || 1) >= 6 ? '#eab308' : '#10b981'
      };
    });
  }, [filteredRisks, controls]);

  const hasActiveFilters = filterCategory !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all';

  const clearFilters = () => {
    setFilterCategory('all');
    setFilterSeverity('all');
    setFilterStatus('all');
  };

  const categoryData = useMemo(() => {
    const categories = {};
    risks.forEach(risk => {
      const cat = risk.category || 'uncategorized';
      if (!categories[cat]) {
        categories[cat] = { category: cat, count: 0, critical: 0, high: 0, medium: 0, low: 0 };
      }
      categories[cat].count++;
      const score = (risk.likelihood || 1) * (risk.impact || 1);
      if (score >= 20) categories[cat].critical++;
      else if (score >= 15) categories[cat].high++;
      else if (score >= 6) categories[cat].medium++;
      else categories[cat].low++;
    });
    return Object.values(categories);
  }, [risks]);

  const controlCoverage = useMemo(() => {
    return categoryData.map(cat => {
      const categoryRisks = risks.filter(r => r.category === cat.category);
      const coveredRisks = categoryRisks.filter(r => 
        r.linked_controls?.length > 0 || 
        controls.some(c => c.linked_risks?.includes(r.id))
      );
      return {
        category: cat.category,
        coverage: categoryRisks.length > 0 ? (coveredRisks.length / categoryRisks.length) * 100 : 0,
        total: categoryRisks.length,
        covered: coveredRisks.length
      };
    });
  }, [risks, controls, categoryData]);

  const threatProfile = useMemo(() => {
    const categories = [...new Set(risks.map(r => r.category || 'Other'))].slice(0, 6);
    return categories.map(cat => {
      const catRisks = risks.filter(r => r.category === cat);
      return {
        category: cat,
        avgLikelihood: catRisks.reduce((sum, r) => sum + (r.likelihood || 0), 0) / (catRisks.length || 1),
        avgImpact: catRisks.reduce((sum, r) => sum + (r.impact || 0), 0) / (catRisks.length || 1),
        count: catRisks.length
      };
    });
  }, [risks]);

  const relatedControls = selectedRisk
    ? controls.filter(c => 
        selectedRisk.linked_controls?.includes(c.id) ||
        c.linked_risks?.includes(selectedRisk.id)
      )
    : [];

  const matchingThreats = selectedRisk && threatFeeds.length > 0
    ? threatFeeds.filter(threat => 
        threat.category?.toLowerCase() === selectedRisk.category?.toLowerCase() ||
        threat.name?.toLowerCase().includes(selectedRisk.title?.toLowerCase().split(' ')[0])
      )
    : [];

  const controlMitigationMap = useMemo(() => {
    const map = {};
    risks.forEach(risk => {
      const linkedControls = controls.filter(c => 
        risk.linked_controls?.includes(c.id) || c.linked_risks?.includes(risk.id)
      );
      linkedControls.forEach(control => {
        if (!map[control.id]) {
          map[control.id] = {
            control,
            risks: [],
            totalRiskScore: 0,
            avgEffectiveness: control.effectiveness || 0
          };
        }
        map[control.id].risks.push(risk);
        map[control.id].totalRiskScore += (risk.likelihood || 0) * (risk.impact || 0);
      });
    });
    return Object.values(map);
  }, [risks, controls]);

  if (selectedRisk) {
    return (
      <div className="space-y-4">
        <Button 
          onClick={() => setSelectedRisk(null)} 
          variant="outline" 
          className="border-[#2a3548]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Landscape
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <CardTitle className="text-base">{selectedRisk.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-4">{selectedRisk.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="text-xs text-slate-500 mb-1">Likelihood</div>
                    <div className="text-2xl font-bold text-white">{selectedRisk.likelihood}/5</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="text-xs text-slate-500 mb-1">Impact</div>
                    <div className="text-2xl font-bold text-white">{selectedRisk.impact}/5</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                    <div className="text-2xl font-bold text-rose-400">
                      {(selectedRisk.likelihood || 0) * (selectedRisk.impact || 0)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="text-xs text-slate-500 mb-1">Category</div>
                    <Badge className="bg-indigo-500/10 text-indigo-400 capitalize">
                      {selectedRisk.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Threat Intelligence Match */}
              {showThreatFeed && matchingThreats.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#2a3548]">
                  <div className="flex items-center gap-2 mb-3">
                    <Radio className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-white">Related Threat Intelligence</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">Live Feed</Badge>
                  </div>
                  <div className="space-y-2">
                    {matchingThreats.map((threat, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-medium text-cyan-300">{threat.name}</span>
                          <Badge className={`text-[9px] ${
                            threat.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                            threat.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {threat.severity}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400">{threat.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  Linked Controls ({relatedControls.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {relatedControls.length === 0 ? (
                      <div className="text-center py-4">
                        <XCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">No controls mitigating this risk</p>
                        <p className="text-[10px] text-rose-400 mt-1">⚠️ Risk exposure is unmitigated</p>
                      </div>
                    ) : (
                      relatedControls.map(control => (
                        <div key={control.id} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-white">{control.name}</h4>
                            {control.effectiveness && (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                control.effectiveness >= 4 ? 'bg-emerald-500/20 text-emerald-400' :
                                control.effectiveness >= 3 ? 'bg-blue-500/20 text-blue-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {control.effectiveness}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge className={`text-[10px] ${
                              control.status === 'effective' ? 'bg-emerald-500/10 text-emerald-400' :
                              control.status === 'implemented' ? 'bg-blue-500/10 text-blue-400' :
                              control.status === 'ineffective' ? 'bg-rose-500/10 text-rose-400' :
                              'bg-slate-500/10 text-slate-400'
                            }`}>
                              {control.status}
                            </Badge>
                            <Badge className="bg-indigo-500/10 text-indigo-400 text-[10px]">
                              {control.domain?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{control.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Mitigation Effectiveness */}
            <Card className={`border-2 ${
              relatedControls.length === 0 ? 'bg-rose-500/10 border-rose-500/30' :
              relatedControls.some(c => c.effectiveness >= 4) ? 'bg-emerald-500/10 border-emerald-500/30' :
              'bg-amber-500/10 border-amber-500/30'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {relatedControls.length === 0 ? (
                    <XCircle className="h-5 w-5 text-rose-400" />
                  ) : relatedControls.some(c => c.effectiveness >= 4) ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  )}
                  <span className="text-sm font-semibold text-white">Mitigation Status</span>
                </div>
                <p className="text-xs text-slate-300">
                  {relatedControls.length === 0 
                    ? '🔴 No controls in place - Risk fully exposed'
                    : relatedControls.some(c => c.effectiveness >= 4)
                    ? `🟢 ${relatedControls.filter(c => c.effectiveness >= 4).length} highly effective control(s) actively mitigating`
                    : `🟡 ${relatedControls.length} control(s) in place but effectiveness needs improvement`
                  }
                </p>
                {relatedControls.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-slate-400">Average Control Effectiveness</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-[#0f1623] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            (relatedControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / relatedControls.length) >= 4 ? 'bg-emerald-500' :
                            (relatedControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / relatedControls.length) >= 3 ? 'bg-blue-500' :
                            'bg-amber-500'
                          }`}
                          style={{ width: `${((relatedControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / relatedControls.length) / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white">
                        {(relatedControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / relatedControls.length).toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedCategory && (
        <Button 
          onClick={() => setSelectedCategory(null)} 
          variant="outline" 
          className="border-[#2a3548]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
      )}

      {/* Filters & Overlays */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Overlay Toggles */}
            <div className="flex items-center gap-4 pb-3 border-b border-[#2a3548]">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-violet-400" />
                <span className="text-sm text-white font-medium">Overlays:</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={showThreatFeed}
                  onCheckedChange={setShowThreatFeed}
                  className="data-[state=checked]:bg-cyan-500"
                />
                <Label className="text-xs text-slate-400 flex items-center gap-1">
                  <Radio className="h-3 w-3 text-cyan-400" />
                  Threat Intelligence
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={showControlOverlay}
                  onCheckedChange={setShowControlOverlay}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <Label className="text-xs text-slate-400 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-400" />
                  Control Effectiveness
                </Label>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Filters:</span>
              </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 h-8 bg-[#151d2e] border-[#2a3548] text-white text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white text-xs">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-white text-xs capitalize">
                    {cat.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40 h-8 bg-[#151d2e] border-[#2a3548] text-white text-xs">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white text-xs">All Severities</SelectItem>
                <SelectItem value="critical" className="text-white text-xs">Critical (20-25)</SelectItem>
                <SelectItem value="high" className="text-white text-xs">High (15-19)</SelectItem>
                <SelectItem value="medium" className="text-white text-xs">Medium (6-14)</SelectItem>
                <SelectItem value="low" className="text-white text-xs">Low (1-5)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 h-8 bg-[#151d2e] border-[#2a3548] text-white text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white text-xs">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status} className="text-white text-xs capitalize">
                    {status.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showControlOverlay && (
              <Select value={controlEffectivenessFilter} onValueChange={setControlEffectivenessFilter}>
                <SelectTrigger className="w-44 h-8 bg-[#151d2e] border-[#2a3548] text-white text-xs">
                  <SelectValue placeholder="Control Coverage" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all" className="text-white text-xs">All Coverage</SelectItem>
                  <SelectItem value="high" className="text-white text-xs">High Effectiveness (≥4)</SelectItem>
                  <SelectItem value="medium" className="text-white text-xs">Medium Effectiveness (2.5-4)</SelectItem>
                  <SelectItem value="low" className="text-white text-xs">Low Effectiveness (&lt;2.5)</SelectItem>
                  <SelectItem value="none" className="text-white text-xs">No Controls</SelectItem>
                </SelectContent>
              </Select>
            )}

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-slate-400 hover:text-white"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}

            <div className="ml-auto">
              <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                {filteredRisks.length} / {risks.length} risks
              </Badge>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="matrix">
            <Activity className="h-4 w-4 mr-2" />
            Risk Matrix
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Target className="h-4 w-4 mr-2" />
            By Category
          </TabsTrigger>
          <TabsTrigger value="coverage">
            <Shield className="h-4 w-4 mr-2" />
            Control Coverage
          </TabsTrigger>
          <TabsTrigger value="profile">
            <TrendingUp className="h-4 w-4 mr-2" />
            Threat Profile
          </TabsTrigger>
          <TabsTrigger value="threats">
            <Radio className="h-4 w-4 mr-2" />
            Threat Intelligence
          </TabsTrigger>
          <TabsTrigger value="mitigation">
            <Zap className="h-4 w-4 mr-2" />
            Mitigation Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Interactive Risk Matrix with Control Overlay</CardTitle>
                  <p className="text-xs text-slate-400">Click on any risk to drill down • Color indicates risk severity • Size indicates control coverage</p>
                </div>
                {showControlOverlay && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-400">High Control Effectiveness</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-slate-400">Low/No Controls</span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Likelihood" 
                    domain={[0, 5.5]}
                    stroke="#94a3b8"
                    label={{ value: 'Likelihood →', position: 'bottom', fill: '#94a3b8', offset: 0 }}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Impact" 
                    domain={[0, 5.5]}
                    stroke="#94a3b8"
                    label={{ value: 'Impact →', angle: -90, position: 'left', fill: '#94a3b8' }}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1a2332] border border-[#2a3548] p-3 rounded-lg">
                            <p className="text-sm font-semibold text-white mb-2">{data.title}</p>
                            <div className="space-y-1">
                              <p className="text-xs text-slate-400">Likelihood: {data.likelihood} • Impact: {data.impact}</p>
                              <p className="text-xs text-rose-400 font-semibold">Risk Score: {data.z}/25</p>
                              {showControlOverlay && (
                                <>
                                  <div className="border-t border-[#2a3548] my-2 pt-2">
                                    <p className="text-xs text-emerald-400">
                                      {data.controlCount > 0 ? (
                                        <>
                                          {data.controlCount} Control{data.controlCount !== 1 ? 's' : ''} • 
                                          Avg Effectiveness: {data.avgControlEffectiveness.toFixed(1)}/5
                                        </>
                                      ) : (
                                        <span className="text-rose-400">⚠️ No controls mitigating</span>
                                      )}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    data={riskMatrix} 
                    onClick={(data) => setSelectedRisk(data)}
                    style={{ cursor: 'pointer' }}
                  >
                    {riskMatrix.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={showControlOverlay && entry.hasEffectiveControls ? '#10b981' : 'transparent'}
                        strokeWidth={showControlOverlay && entry.hasEffectiveControls ? 3 : 0}
                        opacity={showControlOverlay && entry.controlCount === 0 ? 0.5 : 1}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Risks by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="category" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                    <Bar dataKey="critical" stackId="a" fill="#ef4444" />
                    <Bar dataKey="high" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="medium" stackId="a" fill="#eab308" />
                    <Bar dataKey="low" stackId="a" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ category, count }) => `${category}: ${count}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#ef4444', '#f59e0b', '#eab308', '#10b981', '#3b82f6', '#8b5cf6'][index % 6]}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedCategory(entry.category)}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coverage">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Control Coverage by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={controlCoverage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
                  <YAxis dataKey="category" type="category" stroke="#94a3b8" width={150} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1a2332] border border-[#2a3548] p-3 rounded-lg">
                            <p className="text-sm font-semibold text-white mb-1">{data.category}</p>
                            <p className="text-xs text-slate-400">Coverage: {data.coverage.toFixed(1)}%</p>
                            <p className="text-xs text-slate-400">Covered: {data.covered}/{data.total}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="coverage" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Threat Profile Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={threatProfile}>
                  <PolarGrid stroke="#2a3548" />
                  <PolarAngleAxis dataKey="category" stroke="#94a3b8" />
                  <PolarRadiusAxis stroke="#94a3b8" />
                  <Radar name="Avg Likelihood" dataKey="avgLikelihood" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Radar name="Avg Impact" dataKey="avgImpact" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-cyan-400" />
                    <CardTitle className="text-base">Live Threat Intelligence Feed</CardTitle>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">Real-Time</Badge>
                </div>
                <p className="text-xs text-slate-400">Current threats mapped to your risk categories</p>
              </CardHeader>
              <CardContent>
                {threatFeeds.length === 0 ? (
                  <div className="text-center py-8">
                    <Radio className="h-12 w-12 text-slate-600 mx-auto mb-3 animate-pulse" />
                    <p className="text-sm text-slate-400">Loading threat intelligence...</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {threatFeeds.map((threat, idx) => {
                        const relatedRisks = risks.filter(r => 
                          r.category?.toLowerCase() === threat.category?.toLowerCase()
                        );
                        const matchedControls = controls.filter(c => 
                          relatedRisks.some(r => 
                            r.linked_controls?.includes(c.id) || c.linked_risks?.includes(r.id)
                          )
                        );
                        
                        return (
                          <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-white mb-1">{threat.name}</h4>
                                <Badge className="text-[10px] bg-indigo-500/10 text-indigo-400 capitalize">
                                  {threat.category}
                                </Badge>
                              </div>
                              <Badge className={`text-[10px] ${
                                threat.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                threat.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                threat.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              }`}>
                                {threat.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">{threat.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20">
                                <span className="text-slate-400">Related Risks:</span>
                                <span className="text-white font-semibold ml-1">{relatedRisks.length}</span>
                              </div>
                              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-slate-400">Mitigating Controls:</span>
                                <span className="text-white font-semibold ml-1">{matchedControls.length}</span>
                              </div>
                            </div>

                            {matchedControls.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-[#2a3548]">
                                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {matchedControls.filter(c => c.effectiveness >= 4).length} highly effective control(s)
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Threat-Risk Alignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['cybersecurity', 'operational', 'compliance', 'financial'].map(category => {
                    const threats = threatFeeds.filter(t => t.category === category);
                    const categoryRisks = risks.filter(r => r.category === category);
                    const coveredRisks = categoryRisks.filter(r => {
                      const linkedControls = controls.filter(c => 
                        r.linked_controls?.includes(c.id) || c.linked_risks?.includes(r.id)
                      );
                      return linkedControls.some(c => c.effectiveness >= 4);
                    });
                    
                    return (
                      <div key={category} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-white capitalize">{category}</span>
                          <Badge className="text-[9px] bg-cyan-500/20 text-cyan-400">
                            {threats.length} threat{threats.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-slate-400">Your Risks:</span>
                            <span className="text-white ml-1 font-semibold">{categoryRisks.length}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Protected:</span>
                            <span className={`ml-1 font-semibold ${
                              categoryRisks.length > 0 && coveredRisks.length / categoryRisks.length >= 0.8 
                                ? 'text-emerald-400' 
                                : 'text-amber-400'
                            }`}>
                              {categoryRisks.length > 0 ? Math.round((coveredRisks.length / categoryRisks.length) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mitigation">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Real-Time Control Mitigation Map
              </CardTitle>
              <p className="text-xs text-slate-400">See which controls are mitigating which risks and their effectiveness</p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {controlMitigationMap
                    .sort((a, b) => b.totalRiskScore - a.totalRiskScore)
                    .map((item, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Shield className="h-4 w-4 text-emerald-400" />
                              <h4 className="text-sm font-semibold text-white">{item.control.name}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] ${
                                item.control.status === 'effective' ? 'bg-emerald-500/20 text-emerald-400' :
                                item.control.status === 'implemented' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {item.control.status}
                              </Badge>
                              <Badge className="text-[10px] bg-indigo-500/10 text-indigo-400">
                                {item.control.domain?.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              item.avgEffectiveness >= 4 ? 'text-emerald-400' :
                              item.avgEffectiveness >= 3 ? 'text-blue-400' :
                              'text-amber-400'
                            }`}>
                              {item.avgEffectiveness.toFixed(1)}
                            </div>
                            <div className="text-[10px] text-slate-500">Effectiveness</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                          <div className="text-center p-2 rounded bg-rose-500/10 border border-rose-500/20">
                            <div className="font-bold text-rose-400">{item.risks.length}</div>
                            <div className="text-slate-400 text-[10px]">Risks Mitigated</div>
                          </div>
                          <div className="text-center p-2 rounded bg-amber-500/10 border border-amber-500/20">
                            <div className="font-bold text-amber-400">{item.totalRiskScore}</div>
                            <div className="text-slate-400 text-[10px]">Total Risk Score</div>
                          </div>
                          <div className="text-center p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <div className="font-bold text-emerald-400">
                              {item.avgEffectiveness >= 4 ? 'High' : item.avgEffectiveness >= 3 ? 'Medium' : 'Low'}
                            </div>
                            <div className="text-slate-400 text-[10px]">Coverage</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-400 mb-2">Mitigating Risks:</div>
                          <div className="space-y-1">
                            {item.risks.slice(0, 3).map(risk => (
                              <div 
                                key={risk.id} 
                                className="p-2 rounded bg-[#1a2332] border border-[#2a3548] flex items-center justify-between cursor-pointer hover:bg-[#1e2a3d] transition-colors"
                                onClick={() => setSelectedRisk(risk)}
                              >
                                <span className="text-xs text-white">{risk.title}</span>
                                <Badge className="text-[9px] bg-rose-500/20 text-rose-400">
                                  {(risk.likelihood || 0) * (risk.impact || 0)}
                                </Badge>
                              </div>
                            ))}
                            {item.risks.length > 3 && (
                              <p className="text-[10px] text-slate-500 text-center pt-1">
                                + {item.risks.length - 3} more risk{item.risks.length - 3 !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {controlMitigationMap.length === 0 && (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">No control-risk linkages found</p>
                      <p className="text-xs text-slate-500 mt-1">Link controls to risks to see mitigation mapping</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
}