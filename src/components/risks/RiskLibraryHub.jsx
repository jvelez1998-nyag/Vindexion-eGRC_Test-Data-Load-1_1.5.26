import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Plus, Download, Upload, AlertTriangle, Zap, Target, Shield, Filter, Copy, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function RiskLibraryHub({ onImportRisk }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: riskLibrary = [], isLoading } = useQuery({
    queryKey: ['risk-library'],
    queryFn: async () => {
      const data = await base44.entities.RiskLibrary.list();
      return data || [];
    },
  });

  const createFromLibraryMutation = useMutation({
    mutationFn: async (libraryRisk) => {
      const riskData = {
        title: libraryRisk.name,
        description: libraryRisk.description,
        category: libraryRisk.category,
        subcategory: libraryRisk.subcategory,
        risk_source: libraryRisk.typical_causes,
        mitigation_plan: libraryRisk.suggested_controls?.join(', '),
        related_regulations: libraryRisk.regulatory_relevance || [],
        status: 'identified'
      };
      return await base44.entities.Risk.create(riskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success("Risk created from library");
      if (onImportRisk) onImportRisk();
    },
  });

  const filteredRisks = riskLibrary.filter(risk => {
    const searchMatch = !searchTerm || 
      risk.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.typical_causes?.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = categoryFilter === "all" || risk.category === categoryFilter;
    const typeMatch = typeFilter === "all" || risk.risk_type === typeFilter;
    return searchMatch && categoryMatch && typeMatch && risk.status === 'active';
  });

  const categories = [...new Set(riskLibrary.map(r => r.category))].filter(Boolean);
  const types = [...new Set(riskLibrary.map(r => r.risk_type))].filter(Boolean);

  const categoryGroups = categories.reduce((acc, cat) => {
    acc[cat] = filteredRisks.filter(r => r.category === cat);
    return acc;
  }, {});

  const handleViewDetails = (risk) => {
    setSelectedRisk(risk);
    setDetailsOpen(true);
  };

  const handleImportRisk = (risk) => {
    createFromLibraryMutation.mutate(risk);
  };

  const categoryColors = {
    strategic: "from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400",
    operational: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
    financial: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
    compliance: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-400",
    technology: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
    cyber: "from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400",
    third_party: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
    reputational: "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400"
  };

  const categoryIcons = {
    strategic: Target,
    operational: Zap,
    financial: Shield,
    compliance: BookOpen,
    technology: Zap,
    cyber: AlertTriangle,
    third_party: Shield,
    reputational: Target
  };

  return (
    <>
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 shadow-lg">
                <BookOpen className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Risk Library</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-defined risk scenarios and templates
                </p>
              </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              {filteredRisks.length} risks
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="space-y-3 p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Search & Filter</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search risk library..."
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

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 h-9 text-sm text-white hover:from-blue-500/30 hover:to-cyan-500/30">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Risk Library Grid */}
          <Tabs defaultValue={categories[0]} className="w-full">
            <div className="overflow-x-auto scrollbar-thin pb-2">
              <TabsList className="inline-flex bg-[#0f1623] border border-[#2a3548] p-1 rounded-xl min-w-max">
                {categories.slice(0, 8).map((cat) => {
                  const Icon = categoryIcons[cat] || AlertTriangle;
                  const colorClass = categoryColors[cat] || categoryColors.operational;
                  return (
                    <TabsTrigger 
                      key={cat} 
                      value={cat}
                      className={`data-[state=active]:bg-gradient-to-r data-[state=active]:${colorClass} rounded-lg text-xs whitespace-nowrap`}
                    >
                      <Icon className="h-3 w-3 mr-1.5" />
                      {cat}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {categoryGroups[category]?.map((risk) => {
                    const Icon = categoryIcons[risk.category] || AlertTriangle;
                    const colorClass = categoryColors[risk.category] || categoryColors.operational;
                    
                    return (
                      <Card
                        key={risk.id}
                        className={`bg-gradient-to-br ${colorClass} border hover:shadow-lg transition-all cursor-pointer group`}
                        onClick={() => handleViewDetails(risk)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} flex-shrink-0`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1 group-hover:text-amber-300 transition-colors">
                                {risk.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge className="text-[9px] h-4 px-1.5 bg-slate-500/20 text-slate-300 border-slate-500/30">
                                  {risk.risk_id}
                                </Badge>
                                {risk.subcategory && (
                                  <Badge className="text-[9px] h-4 px-1.5 bg-slate-500/10 text-slate-400 border-slate-500/20">
                                    {risk.subcategory}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                            {risk.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {risk.regulatory_relevance?.slice(0, 2).map((reg, i) => (
                                <Badge key={i} className="text-[8px] h-4 px-1.5 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                                  {reg}
                                </Badge>
                              ))}
                              {risk.regulatory_relevance?.length > 2 && (
                                <span className="text-[8px] text-slate-500">+{risk.regulatory_relevance.length - 2}</span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImportRisk(risk);
                              }}
                              disabled={createFromLibraryMutation.isPending}
                              className="h-6 px-2 text-[10px] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Import
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {categoryGroups[category]?.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No risks found in this category</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Risk Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              {selectedRisk?.name}
              <Badge className="bg-amber-500/20 text-amber-400 text-[10px] border-amber-500/30">
                {selectedRisk?.risk_id}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedRisk && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                  {selectedRisk.category}
                </Badge>
                {selectedRisk.subcategory && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {selectedRisk.subcategory}
                  </Badge>
                )}
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                  {selectedRisk.risk_type}
                </Badge>
              </div>

              <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <h4 className="text-sm font-semibold text-amber-400 mb-2">Description</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedRisk.description}</p>
              </div>

              {selectedRisk.typical_causes && (
                <div className="p-4 bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-lg border border-rose-500/20">
                  <h4 className="text-sm font-semibold text-rose-400 mb-2">Typical Causes</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedRisk.typical_causes}</p>
                </div>
              )}

              {selectedRisk.typical_impacts && (
                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-lg border border-orange-500/20">
                  <h4 className="text-sm font-semibold text-orange-400 mb-2">Typical Impacts</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedRisk.typical_impacts}</p>
                </div>
              )}

              {selectedRisk.suggested_controls && selectedRisk.suggested_controls.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3">Suggested Controls</h4>
                  <div className="space-y-2">
                    {selectedRisk.suggested_controls.map((control, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{control}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRisk.regulatory_relevance && selectedRisk.regulatory_relevance.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-lg border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-400 mb-2">Regulatory Relevance</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRisk.regulatory_relevance.map((reg, i) => (
                      <Badge key={i} className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                        {reg}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleImportRisk(selectedRisk)}
                  disabled={createFromLibraryMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Import to Risk Register
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                  className="border-[#2a3548] hover:bg-[#2a3548]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}