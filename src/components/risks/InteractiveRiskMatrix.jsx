import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, SlidersHorizontal, Grid3x3, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import DrillDownModal from "@/components/ui/drill-down-modal";

export default function InteractiveRiskMatrix({ risks = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [viewMode, setViewMode] = useState("inherent");
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null });

  // Advanced filtering
  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      const searchMatch = !searchTerm || 
        risk.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = categoryFilter === "all" || risk.category === categoryFilter;
      const ownerMatch = ownerFilter === "all" || risk.owner === ownerFilter;
      return searchMatch && categoryMatch && ownerMatch;
    });
  }, [risks, searchTerm, categoryFilter, ownerFilter]);

  // Categorize by risk level
  const riskCategories = useMemo(() => {
    const scoreField = viewMode === "inherent" ? "inherent_risk_score" : "residual_risk_score";
    const likelihoodField = viewMode === "inherent" ? "inherent_likelihood" : "residual_likelihood";
    const impactField = viewMode === "inherent" ? "inherent_impact" : "residual_impact";

    return {
      critical: filteredRisks.filter(r => {
        const score = r[scoreField] || ((r[likelihoodField] || 0) * (r[impactField] || 0));
        return score >= 16;
      }),
      high: filteredRisks.filter(r => {
        const score = r[scoreField] || ((r[likelihoodField] || 0) * (r[impactField] || 0));
        return score >= 12 && score < 16;
      }),
      medium: filteredRisks.filter(r => {
        const score = r[scoreField] || ((r[likelihoodField] || 0) * (r[impactField] || 0));
        return score >= 6 && score < 12;
      }),
      low: filteredRisks.filter(r => {
        const score = r[scoreField] || ((r[likelihoodField] || 0) * (r[impactField] || 0));
        return score < 6;
      })
    };
  }, [filteredRisks, viewMode]);

  const handleExportCSV = () => {
    const csv = [
      ['Risk Title', 'Category', 'Owner', 'Status', 'Inherent Score', 'Residual Score', 'Treatment Strategy'].join(','),
      ...filteredRisks.map(risk => [
        `"${risk.title || ''}"`,
        risk.category || '',
        risk.owner || '',
        risk.status || '',
        risk.inherent_risk_score || ((risk.inherent_likelihood || 0) * (risk.inherent_impact || 0)),
        risk.residual_risk_score || ((risk.residual_likelihood || 0) * (risk.residual_impact || 0)),
        risk.risk_treatment_strategy || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Risk matrix exported to CSV");
  };

  const categories = [...new Set(risks.map(r => r.category))].filter(Boolean);
  const owners = [...new Set(risks.map(r => r.owner))].filter(Boolean);

  const RiskCard = ({ risk }) => {
    const scoreField = viewMode === "inherent" ? "inherent_risk_score" : "residual_risk_score";
    const likelihoodField = viewMode === "inherent" ? "inherent_likelihood" : "residual_likelihood";
    const impactField = viewMode === "inherent" ? "inherent_impact" : "residual_impact";
    const score = risk[scoreField] || ((risk[likelihoodField] || 0) * (risk[impactField] || 0));

    return (
      <div 
        className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548] hover:border-indigo-500/40 transition-all cursor-pointer group"
        onClick={() => setDrillDown({ open: true, title: risk.title, data: [risk], type: 'risk' })}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {risk.title}
          </h4>
          <Badge className="text-xs bg-indigo-500/20 text-indigo-400 flex-shrink-0">
            {score}
          </Badge>
        </div>
        <p className="text-xs text-slate-400 line-clamp-2 mb-2">{risk.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">{risk.category}</Badge>
          {risk.owner && (
            <span className="text-[10px] text-slate-500">{risk.owner}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <Grid3x3 className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Risk Matrix View</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  {filteredRisks.length} risks organized by severity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleExportCSV}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="space-y-3 p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">Filters & Controls</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search risks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-[#1a2332] border-[#2a3548] text-sm h-9"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 h-9 text-sm text-white hover:from-violet-500/30 hover:to-purple-500/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 h-9 text-sm text-white hover:from-blue-500/30 hover:to-cyan-500/30">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all">All Owners</SelectItem>
                  {owners.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 h-9 text-sm text-white hover:from-indigo-500/30 hover:to-purple-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="inherent">Inherent Risk</SelectItem>
                  <SelectItem value="residual">Residual Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-gradient-to-br from-rose-500/20 to-rose-500/10 rounded-lg border border-rose-500/30">
              <div className="text-2xl font-bold text-white mb-1">{riskCategories.critical.length}</div>
              <div className="text-xs text-rose-400">Critical</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-lg border border-orange-500/30">
              <div className="text-2xl font-bold text-white mb-1">{riskCategories.high.length}</div>
              <div className="text-xs text-orange-400">High</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-lg border border-amber-500/30">
              <div className="text-2xl font-bold text-white mb-1">{riskCategories.medium.length}</div>
              <div className="text-xs text-amber-400">Medium</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-lg border border-emerald-500/30">
              <div className="text-2xl font-bold text-white mb-1">{riskCategories.low.length}</div>
              <div className="text-xs text-emerald-400">Low</div>
            </div>
          </div>

          {/* Risk Lists by Category */}
          <Tabs defaultValue="critical" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#0f1623] p-1">
              <TabsTrigger value="critical" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30">Critical</TabsTrigger>
              <TabsTrigger value="high" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-amber-500/20 data-[state=active]:text-orange-400 data-[state=active]:border data-[state=active]:border-orange-500/30">High</TabsTrigger>
              <TabsTrigger value="medium" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-amber-400 data-[state=active]:border data-[state=active]:border-amber-500/30">Medium</TabsTrigger>
              <TabsTrigger value="low" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30">Low</TabsTrigger>
            </TabsList>

            <TabsContent value="critical" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {riskCategories.critical.length > 0 ? (
                  riskCategories.critical.map(risk => <RiskCard key={risk.id} risk={risk} />)
                ) : (
                  <div className="col-span-2 text-center py-8 text-slate-400">
                    No critical risks found
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="high" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {riskCategories.high.length > 0 ? (
                  riskCategories.high.map(risk => <RiskCard key={risk.id} risk={risk} />)
                ) : (
                  <div className="col-span-2 text-center py-8 text-slate-400">
                    No high risks found
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="medium" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {riskCategories.medium.length > 0 ? (
                  riskCategories.medium.map(risk => <RiskCard key={risk.id} risk={risk} />)
                ) : (
                  <div className="col-span-2 text-center py-8 text-slate-400">
                    No medium risks found
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="low" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {riskCategories.low.length > 0 ? (
                  riskCategories.low.map(risk => <RiskCard key={risk.id} risk={risk} />)
                ) : (
                  <div className="col-span-2 text-center py-8 text-slate-400">
                    No low risks found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DrillDownModal
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null })}
        title={drillDown.title}
        data={drillDown.data}
        type="risk"
      />
    </>
  );
}