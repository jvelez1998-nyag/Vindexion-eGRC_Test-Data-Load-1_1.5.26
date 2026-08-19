import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Search, AlertTriangle, Sparkles, LayoutGrid, List, 
  ArrowUpDown, Download, Trash2, TrendingUp, TrendingDown, FileText, Brain,
  Activity, Target, Shield, Zap, ClipboardList
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RiskCard from "@/components/risks/RiskCard";
import RiskForm from "@/components/risks/RiskForm";
import AIRiskAnalyzer from "@/components/risks/AIRiskAnalyzer";
import AIRiskSuggestions from "@/components/ai/AIRiskSuggestions";
import AIPatternAnalyzer from "@/components/ai/AIPatternAnalyzer";
import EntitySummaryDialog from "@/components/ai/EntitySummaryDialog";
import AdvancedAIRiskAnalytics from "@/components/risks/AdvancedAIRiskAnalytics";
import AIPredictiveRiskIntelligence from "@/components/risks/AIPredictiveRiskIntelligence";
import FloatingChatbot from "@/components/ai/FloatingChatbot";
import RiskRegisterDashboard from "@/components/risks/RiskRegisterDashboard";
import RiskIdentificationEngine from "@/components/risks/RiskIdentificationEngine";
import RiskTreatmentPlanner from "@/components/risks/RiskTreatmentPlanner";
import AutomatedRiskMonitoring from "@/components/risks/AutomatedRiskMonitoring";
import AIControlSuggestionEngine from "@/components/risks/AIControlSuggestionEngine";
import AIPrioritizationEngine from "@/components/risks/AIPrioritizationEngine";
import DynamicThreatScoring from "@/components/risks/DynamicThreatScoring";
import RiskAssessmentUserGuide from "@/components/risks/RiskAssessmentUserGuide";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Risks() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score_desc");
  const [viewMode, setViewMode] = useState("list");
  const [selectedRisks, setSelectedRisks] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  const [aiAnalyzerOpen, setAiAnalyzerOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedRiskForSummary, setSelectedRiskForSummary] = useState(null);
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [selectedRiskForCollab, setSelectedRiskForCollab] = useState(null);
  const [advancedAnalyticsOpen, setAdvancedAnalyticsOpen] = useState(false);
  const [predictiveIntelligenceOpen, setPredictiveIntelligenceOpen] = useState(false);
  const [selectedRiskForControls, setSelectedRiskForControls] = useState(null);
  const [showPrioritization, setShowPrioritization] = useState(false);
  const [showThreatScoring, setShowThreatScoring] = useState(false);

  const queryClient = useQueryClient();

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-created_date')
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Risk.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      setFormOpen(false);
      toast.success("Risk created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Risk.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      setFormOpen(false);
      setEditingRisk(null);
      toast.success("Risk updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Risk.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success("Risk deleted successfully");
    }
  });

  const handleSubmit = (data) => {
    if (editingRisk) {
      updateMutation.mutate({ id: editingRisk.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (risk) => {
    setEditingRisk(risk);
    setFormOpen(true);
  };

  const handleCreateFromSuggestion = (suggestion) => {
    setEditingRisk({
      title: suggestion.title,
      category: suggestion.category,
      description: suggestion.description,
      likelihood: suggestion.likelihood,
      impact: suggestion.impact,
      status: 'identified'
    });
    setFormOpen(true);
  };

  const handleDelete = (risk) => {
    if (confirm(`Are you sure you want to delete "${risk.title}"?`)) {
      deleteMutation.mutate(risk.id);
    }
  };

  const handleWorkflowAction = (risk, action, comment) => {
    const statusMap = {
      submit: 'submitted',
      start_review: 'in_review',
      approve: 'approved',
      reject: 'rejected',
      request_changes: 'changes_requested',
      reopen: 'draft'
    };
    const newStatus = statusMap[action];
    const historyEntry = {
      action,
      to_status: newStatus,
      comment,
      action_by: 'Current User',
      timestamp: new Date().toISOString()
    };
    updateMutation.mutate({
      id: risk.id,
      data: {
        workflow_status: newStatus,
        workflow_history: [...(risk.workflow_history || []), historyEntry]
      }
    });
  };

  const filteredRisks = useMemo(() => {
    let result = risks.filter(risk => {
      const matchesSearch = !search || 
        risk.title?.toLowerCase().includes(search.toLowerCase()) ||
        risk.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || risk.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || risk.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      const scoreA = (a.likelihood || 0) * (a.impact || 0);
      const scoreB = (b.likelihood || 0) * (b.impact || 0);
      switch (sortBy) {
        case 'score_desc': return scoreB - scoreA;
        case 'score_asc': return scoreA - scoreB;
        case 'date_desc': return new Date(b.created_date) - new Date(a.created_date);
        case 'date_asc': return new Date(a.created_date) - new Date(b.created_date);
        case 'title_asc': return (a.title || '').localeCompare(b.title || '');
        case 'title_desc': return (b.title || '').localeCompare(a.title || '');
        default: return 0;
      }
    });
    return result;
  }, [risks, search, categoryFilter, statusFilter, sortBy]);

  const criticalCount = risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 16).length;
  const highCount = risks.filter(r => { const s = (r.likelihood || 0) * (r.impact || 0); return s >= 9 && s < 16; }).length;
  const openCount = risks.filter(r => r.status !== 'closed').length;
  const overdueCount = risks.filter(r => r.due_date && new Date(r.due_date) < new Date() && r.status !== 'closed').length;

  const toggleSelectAll = () => {
    if (selectedRisks.length === filteredRisks.length) {
      setSelectedRisks([]);
    } else {
      setSelectedRisks(filteredRisks.map(r => r.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedRisks(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedRisks.length} selected risks?`)) return;
    for (const id of selectedRisks) {
      await deleteMutation.mutateAsync(id);
    }
    setSelectedRisks([]);
  };

  const exportRisks = () => {
    const data = filteredRisks.map(r => ({
      Title: r.title,
      Category: r.category,
      Status: r.status,
      Likelihood: r.likelihood,
      Impact: r.impact,
      Score: (r.likelihood || 0) * (r.impact || 0),
      Owner: r.owner,
      'Due Date': r.due_date,
      Description: r.description
    }));
    const csv = [Object.keys(data[0] || {}).join(','), ...data.map(row => Object.values(row).map(v => `"${v || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-register-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="h-7 w-7 text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-rose-200 to-orange-300 bg-clip-text text-transparent">
              Risk Register
            </h1>
            <p className="text-slate-400 text-sm mt-1">AI-powered risk identification, assessment and treatment planning</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400">
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="engine" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-rose-400">
              <Target className="h-4 w-4 mr-2" />
              Risk Engine
            </TabsTrigger>
            <TabsTrigger value="treatment" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400">
              <Shield className="h-4 w-4 mr-2" />
              Treatment Planning
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400">
              <Zap className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400">
              <ClipboardList className="h-4 w-4 mr-2" />
              Full Register
            </TabsTrigger>
            <TabsTrigger value="ai_tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-cyan-400">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Tools
            </TabsTrigger>
            <TabsTrigger value="guide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400">
              <FileText className="h-4 w-4 mr-2" />
              User Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <RiskRegisterDashboard
              risks={risks}
              onRiskClick={handleEdit}
              onStartNew={() => setActiveTab('engine')}
            />
          </TabsContent>

          <TabsContent value="engine">
            <RiskIdentificationEngine
              onComplete={(data) => {
                createMutation.mutate(data);
                setActiveTab('register');
              }}
            />
          </TabsContent>

          <TabsContent value="treatment">
            <RiskTreatmentPlanner risks={risks} />
          </TabsContent>

          <TabsContent value="monitoring">
            <AutomatedRiskMonitoring />
          </TabsContent>

          <TabsContent value="ai_tools" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 cursor-pointer hover:border-indigo-500/40 transition-all" onClick={() => setShowPrioritization(!showPrioritization)}>
                <CardContent className="p-6 text-center">
                  <Brain className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">AI Prioritization</h3>
                  <p className="text-sm text-slate-400">Multi-factor priority analysis</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-all" onClick={() => setShowThreatScoring(!showThreatScoring)}>
                <CardContent className="p-6 text-center">
                  <Activity className="h-10 w-10 text-cyan-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Threat Intelligence</h3>
                  <p className="text-sm text-slate-400">Dynamic risk scoring</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 cursor-pointer hover:border-emerald-500/40 transition-all" onClick={() => risks.length > 0 && setSelectedRiskForControls(risks[0])}>
                <CardContent className="p-6 text-center">
                  <Shield className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Control Suggestions</h3>
                  <p className="text-sm text-slate-400">AI-powered controls</p>
                </CardContent>
              </Card>
            </div>

            {showPrioritization && (
              <AIPrioritizationEngine 
                risks={risks}
                onPriorityUpdated={() => queryClient.invalidateQueries({ queryKey: ['risks'] })}
              />
            )}

            {showThreatScoring && (
              <DynamicThreatScoring
                risks={risks}
                onScoresUpdated={() => queryClient.invalidateQueries({ queryKey: ['risks'] })}
              />
            )}

            {selectedRiskForControls && (
              <AIControlSuggestionEngine
                risk={selectedRiskForControls}
                onControlsGenerated={() => {
                  queryClient.invalidateQueries({ queryKey: ['controls'] });
                  toast.success("Controls linked to risk");
                }}
              />
            )}

            {!showPrioritization && !showThreatScoring && !selectedRiskForControls && (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardContent className="p-12 text-center">
                  <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">AI Risk Tools</h3>
                  <p className="text-slate-400">Select a tool above to get started</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="guide">
            <RiskAssessmentUserGuide />
          </TabsContent>

          <TabsContent value="register" className="space-y-6">

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-rose-500/20">
                    <AlertTriangle className="h-5 w-5 text-rose-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-rose-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{criticalCount}</div>
                <div className="text-sm text-slate-400">Critical Risks</div>
                <div className="mt-2 h-1 bg-[#151d2e] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500" style={{ width: `${risks.length ? (criticalCount / risks.length) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </div>
                  <Activity className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{highCount}</div>
                <div className="text-sm text-slate-400">High Risks</div>
                <div className="mt-2 h-1 bg-[#151d2e] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500" style={{ width: `${risks.length ? (highCount / risks.length) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Target className="h-5 w-5 text-blue-400" />
                  </div>
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{openCount}</div>
                <div className="text-sm text-slate-400">Open Risks</div>
                <div className="mt-2 h-1 bg-[#151d2e] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${risks.length ? (openCount / risks.length) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <TrendingDown className="h-5 w-5 text-purple-400" />
                  </div>
                  <AlertTriangle className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{overdueCount}</div>
                <div className="text-sm text-slate-400">Overdue</div>
                <div className="mt-2 h-1 bg-[#151d2e] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${openCount ? (overdueCount / openCount) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => {
                if (filteredRisks.length > 0) {
                  setSelectedRiskForSummary({ title: "Risk Portfolio", risks: filteredRisks });
                  setSummaryOpen(true);
                } else {
                  toast.error("No risks to summarize");
                }
              }} variant="outline" className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                <FileText className="h-4 w-4" />
                Bulk Summary
              </Button>
              <Button onClick={() => setAiAnalyzerOpen(true)} variant="outline" className="gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                <Sparkles className="h-4 w-4" />
                AI Analyzer
              </Button>
              <Button onClick={() => setPredictiveIntelligenceOpen(true)} variant="outline" className="gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                <Sparkles className="h-4 w-4" />
                Predictive
              </Button>
              <Button onClick={() => setAdvancedAnalyticsOpen(true)} variant="outline" className="gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                <Brain className="h-4 w-4" />
                Advanced
              </Button>
              <Button onClick={() => { setEditingRisk(null); setFormOpen(true); }} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus className="h-4 w-4" />
                Add Risk
              </Button>
            </div>

            {/* Enhanced Filters Bar */}
            <div className="flex flex-col gap-4 p-5 rounded-xl bg-gradient-to-r from-[#1a2332] to-[#151d2e] border border-[#2a3548] shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Filters & Search</h3>
                <Badge className="ml-auto bg-indigo-500/10 text-indigo-400">
                  {filteredRisks.length} of {risks.length}
                </Badge>
              </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search risks..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Categories</SelectItem>
                <SelectItem value="operational" className="text-white hover:bg-[#2a3548]">Operational</SelectItem>
                <SelectItem value="financial" className="text-white hover:bg-[#2a3548]">Financial</SelectItem>
                <SelectItem value="strategic" className="text-white hover:bg-[#2a3548]">Strategic</SelectItem>
                <SelectItem value="compliance" className="text-white hover:bg-[#2a3548]">Compliance</SelectItem>
                <SelectItem value="cybersecurity" className="text-white hover:bg-[#2a3548]">Cybersecurity</SelectItem>
                <SelectItem value="reputational" className="text-white hover:bg-[#2a3548]">Reputational</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Status</SelectItem>
                <SelectItem value="identified" className="text-white hover:bg-[#2a3548]">Identified</SelectItem>
                <SelectItem value="assessing" className="text-white hover:bg-[#2a3548]">Assessing</SelectItem>
                <SelectItem value="mitigating" className="text-white hover:bg-[#2a3548]">Mitigating</SelectItem>
                <SelectItem value="monitoring" className="text-white hover:bg-[#2a3548]">Monitoring</SelectItem>
                <SelectItem value="closed" className="text-white hover:bg-[#2a3548]">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 bg-[#151d2e] border-[#2a3548] text-white h-8 text-xs">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="score_desc" className="text-white hover:bg-[#2a3548]">Score (High to Low)</SelectItem>
                  <SelectItem value="score_asc" className="text-white hover:bg-[#2a3548]">Score (Low to High)</SelectItem>
                  <SelectItem value="date_desc" className="text-white hover:bg-[#2a3548]">Newest First</SelectItem>
                  <SelectItem value="date_asc" className="text-white hover:bg-[#2a3548]">Oldest First</SelectItem>
                  <SelectItem value="title_asc" className="text-white hover:bg-[#2a3548]">Title (A-Z)</SelectItem>
                  <SelectItem value="title_desc" className="text-white hover:bg-[#2a3548]">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
              {selectedRisks.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                    {selectedRisks.length} selected
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete} className="h-8 gap-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportRisks} className="h-8 gap-1 border-[#2a3548] text-slate-400 hover:text-white hover:bg-[#2a3548]">
                <Download className="h-3 w-3" /> Export
              </Button>
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList className="h-8 bg-[#151d2e] border border-[#2a3548]">
                  <TabsTrigger value="list" className="h-6 px-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                    <List className="h-3.5 w-3.5" />
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="h-6 px-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Enhanced Content with Better Visuals */}
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-gradient-to-r from-[#1a2332] to-[#151d2e] border border-[#2a3548] animate-pulse" />
            ))}
          </div>
        ) : filteredRisks.length === 0 ? (
          <div className="text-center py-20 rounded-xl bg-gradient-to-br from-[#1a2332] via-[#151d2e] to-[#1a2332] border border-[#2a3548] shadow-xl">
            <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 w-fit mx-auto mb-4">
              <AlertTriangle className="h-12 w-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No risks found</h3>
            <p className="text-slate-400 mb-6">
              {search || categoryFilter !== "all" || statusFilter !== "all" 
                ? "Try adjusting your filters"
                : "Get started by adding your first risk"}
            </p>
            <Button onClick={() => setFormOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Add Risk
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selection Bar */}
            {filteredRisks.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedRisks.length === filteredRisks.length && filteredRisks.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-[#2a3548]"
                  />
                  <span className="text-sm text-slate-400">
                    {selectedRisks.length > 0 ? (
                      <span className="text-indigo-400 font-medium">{selectedRisks.length} selected</span>
                    ) : (
                      <span>Select all ({filteredRisks.length} risks)</span>
                    )}
                  </span>
                </div>
                {selectedRisks.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleBulkDelete} className="gap-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                    <Trash2 className="h-3 w-3" />
                    Delete Selected
                  </Button>
                )}
              </div>
            )}

            {/* Risk Cards with Enhanced Layout */}
            <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-2' : 'grid gap-4'}>
              {filteredRisks.map(risk => (
                <div key={risk.id} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                  <div className="relative flex items-start gap-3 p-1 rounded-xl bg-[#0f1623]">
                    <Checkbox 
                      checked={selectedRisks.includes(risk.id)}
                      onCheckedChange={() => toggleSelect(risk.id)}
                      className="mt-6 ml-2 border-[#2a3548]"
                    />
                    <div className="flex-1">
                      <div className="relative">
                        <RiskCard 
                          risk={risk} 
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onWorkflowAction={handleWorkflowAction}
                          onGenerateSummary={() => {
                            setSelectedRiskForSummary(risk);
                            setSummaryOpen(true);
                          }}
                          userRole="admin"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRiskForControls(risk)}
                          className="absolute bottom-4 right-4 gap-2 bg-[#1a2332] border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 text-xs"
                        >
                          <Sparkles className="h-3 w-3" />
                          Suggest Controls
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <Badge variant="outline" className="text-slate-400 border-[#2a3548]">
                Showing {filteredRisks.length} risk{filteredRisks.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        )}
          </TabsContent>
        </Tabs>
      </div>

      <RiskForm 
        open={formOpen}
        onOpenChange={setFormOpen}
        risk={editingRisk}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AIRiskAnalyzer
        open={aiAnalyzerOpen}
        onOpenChange={setAiAnalyzerOpen}
        existingRisks={risks}
        onCreateRisk={(data) => {
          createMutation.mutate(data);
          setAiAnalyzerOpen(false);
        }}
      />

      <EntitySummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        entity={selectedRiskForSummary}
        entityType="risk"
      />

      <AdvancedAIRiskAnalytics
        open={advancedAnalyticsOpen}
        onOpenChange={setAdvancedAnalyticsOpen}
        risks={risks}
        incidents={incidents}
        controls={controls}
      />

      <AIPredictiveRiskIntelligence
        open={predictiveIntelligenceOpen}
        onOpenChange={setPredictiveIntelligenceOpen}
        risks={risks}
        controls={controls}
        incidents={incidents}
        onUpdateRisk={(id, data) => updateMutation.mutate({ id, data })}
      />

      {selectedRiskForControls && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedRiskForControls(null)}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-[#1a2332] border border-[#2a3548] z-10"
            >
              <span className="text-white">×</span>
            </Button>
            <AIControlSuggestionEngine
              risk={selectedRiskForControls}
              onControlsGenerated={() => {
                queryClient.invalidateQueries({ queryKey: ['controls'] });
                setSelectedRiskForControls(null);
              }}
            />
          </div>
        </div>
      )}

      <FloatingChatbot
        context="risks"
        contextData={{
          totalRisks: risks.length,
          criticalRisks: criticalCount,
          highRisks: highCount,
          openRisks: openCount,
          overdueRisks: overdueCount,
          categories: [...new Set(risks.map(r => r.category))],
          recentRisks: risks.slice(0, 5).map(r => ({
            title: r.title,
            category: r.category,
            status: r.status,
            score: (r.likelihood || 0) * (r.impact || 0)
          }))
        }}
      />
    </div>
  );
}