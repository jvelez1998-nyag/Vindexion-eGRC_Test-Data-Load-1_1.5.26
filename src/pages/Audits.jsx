import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, ClipboardCheck, Sparkles, Calendar, FileText, Paperclip, TestTube, Brain, Clock, Users, Trash2, MoreVertical, AlertTriangle, Link2, Wrench, BookOpen, GraduationCap, Lightbulb, HelpCircle, LayoutList, Wand2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AuditCard from "@/components/audits/AuditCard";
import AuditForm from "@/components/audits/AuditForm";
import AuditDashboard from "@/components/audits/AuditDashboard";
import AuditFrameworkLibrary from "@/components/audits/AuditFrameworkLibrary";
import AuditStudyGuide from "@/components/audits/AuditStudyGuide";
import AuditAIGuidance from "@/components/audits/AuditAIGuidance";
import AuditUserGuide from "@/components/audits/AuditUserGuide";
import AuditAIInsightsPanel from "@/components/audits/AuditAIInsightsPanel";
import AIAuditPrep from "@/components/audits/AIAuditPrep";
import AIAuditScopeGenerator from "@/components/audits/AIAuditScopeGenerator";
import AuditScheduler from "@/components/audits/AuditScheduler";
import AuditTesting from "@/components/audits/AuditTesting";
import AuditArtifacts from "@/components/audits/AuditArtifacts";
import AuditReportWriter from "@/components/audits/AuditReportWriter";
import AIAuditAreaSuggestions from "@/components/audits/AIAuditAreaSuggestions";
import ControlTestingEngine from "@/components/controls/ControlTestingEngine";
import AIAuditPlanner from "@/components/audits/AIAuditPlanner";
import AIAuditPlanGenerator from "@/components/audits/AIAuditPlanGenerator";
import AIFieldworkAssistant from "@/components/audits/AIFieldworkAssistant";
import AIReportDrafter from "@/components/audits/AIReportDrafter";
import AIAuditProgramBuilder from "@/components/audits/AIAuditProgramBuilder";
import FloatingChatbot from "@/components/ai/FloatingChatbot";
import AuditReportingDashboard from "@/components/audits/AuditReportingDashboard";
import AITrendAnalysis from "@/components/ai/AITrendAnalysis";
import AutomatedReportGenerator from "@/components/audits/AutomatedReportGenerator";
import AuditProgramBuilder from "@/components/audits/AuditProgramBuilder";
import WorkpaperManager from "@/components/audits/WorkpaperManager";
import FindingsTracker from "@/components/audits/FindingsTracker";
import FindingsLibrary from "@/components/audits/FindingsLibrary";
import AuditProgramDetail from "@/components/audits/AuditProgramDetail";
import EntitySummaryDialog from "@/components/ai/EntitySummaryDialog";
import FindingRiskLinker from "@/components/audits/FindingRiskLinker";
import AIRiskScoring from "@/components/audits/AIRiskScoring";
import RiskAuditNetwork from "@/components/audits/RiskAuditNetwork";
import AIRemediationPlanner from "@/components/remediation/AIRemediationPlanner";
import RemediationTaskManager from "@/components/remediation/RemediationTaskManager";
import RemediationProgressMonitor from "@/components/remediation/RemediationProgressMonitor";
import RemediationReportGenerator from "@/components/remediation/RemediationReportGenerator";
import AIFindingAnalyzer from "@/components/audits/AIFindingAnalyzer";
import AITemplateBuilder from "@/components/audits/AITemplateBuilder";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { usePermissions } from "@/components/rbac/PermissionProvider";
import PermissionGuard from "@/components/rbac/PermissionGuard";
import SecureActionButton from "@/components/rbac/SecureActionButton";

export default function Audits() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [aiPrepOpen, setAiPrepOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditDetailOpen, setAuditDetailOpen] = useState(false);
  const [programBuilderOpen, setProgramBuilderOpen] = useState(false);
  const [workpaperOpen, setWorkpaperOpen] = useState(false);
  const [findingsOpen, setFindingsOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programDetailOpen, setProgramDetailOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedFindingForSummary, setSelectedFindingForSummary] = useState(null);
  const [riskLinkerOpen, setRiskLinkerOpen] = useState(false);
  const [selectedFindingForLink, setSelectedFindingForLink] = useState(null);
  const [remediationOpen, setRemediationOpen] = useState(false);
  const [selectedFindingForRemediation, setSelectedFindingForRemediation] = useState(null);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [selectedFindingForAnalysis, setSelectedFindingForAnalysis] = useState(null);
  const [scopeGeneratorOpen, setScopeGeneratorOpen] = useState(false);
  const [templateBuilderOpen, setTemplateBuilderOpen] = useState(false);

  const queryClient = useQueryClient();
  const { filterAccessibleData, hasPermission } = usePermissions();

  const { data: allAudits = [], isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const data = await base44.entities.Audit.list('-updated_date', 50);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const data = await base44.entities.Compliance.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const data = await base44.entities.Incident.list('-reported_date', 50);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: async () => {
      const data = await base44.entities.AuditFinding.list('-created_date', 100);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['audit-programs'],
    queryFn: async () => {
      const data = await base44.entities.AuditProgram.list('-created_date', 50);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: workpapers = [] } = useQuery({
    queryKey: ['audit-workpapers'],
    queryFn: async () => {
      const data = await base44.entities.AuditWorkpaper.list('-created_date', 50);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Audit.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      setFormOpen(false);
      toast.success("Audit created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Audit.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      setFormOpen(false);
      setEditingAudit(null);
      toast.success("Audit updated successfully");
    }
  });

  const updateFindingMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.AuditFinding.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      toast.success("Finding updated with AI recommendations");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Audit.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success("Audit deleted successfully");
    }
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.AuditProgram.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-programs'] });
      toast.success("Program deleted");
    }
  });

  const deleteWorkpaperMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.AuditWorkpaper.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-workpapers'] });
      toast.success("Workpaper deleted");
    }
  });

  const deleteFindingMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.AuditFinding.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      toast.success("Finding deleted");
    }
  });

  const handleSubmit = (data) => {
    if (editingAudit) {
      updateMutation.mutate({ id: editingAudit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (audit) => {
    setEditingAudit(audit);
    setFormOpen(true);
  };

  const handleDelete = (audit) => {
    if (confirm(`Are you sure you want to delete "${audit.title}"?`)) {
      deleteMutation.mutate(audit.id);
    }
  };

  // Apply RBAC filtering
  const audits = filterAccessibleData(allAudits, 'view');

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = !search || 
      audit.title?.toLowerCase().includes(search.toLowerCase()) ||
      audit.scope?.toLowerCase().includes(search.toLowerCase()) ||
      audit.auditor?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || audit.type === typeFilter;
    const matchesStatus = statusFilter === "all" || audit.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredPrograms = programs.filter(p => 
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWorkpapers = selectedAudit 
    ? workpapers.filter(w => w.audit_id === selectedAudit.id)
    : workpapers;

  const filteredFindings = selectedAudit
    ? findings.filter(f => f.audit_id === selectedAudit.id)
    : findings;

  const inProgressCount = audits.filter(a => a.status === 'in_progress').length;
  const totalFindings = findings.length;

  const typeColors = {
    internal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    external: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    regulatory: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    it: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    financial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    operational: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  const handleViewAudit = (audit) => {
    setSelectedAudit(audit);
    setAuditDetailOpen(true);
  };

  const handleSelectAuditArea = (area) => {
    setFormOpen(true);
    // Pre-fill form with AI suggestion
    setEditingAudit(null);
  };

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-violet-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10">
              <ClipboardCheck className="h-7 w-7 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
                Audit Management Center
              </h1>
              <p className="text-slate-400 text-sm mt-1">Track internal, external, and regulatory audits</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="font-bold text-blue-400">{inProgressCount}</span>
                <span className="text-slate-400">In Progress</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="font-bold text-amber-400">{totalFindings}</span>
                <span className="text-slate-400">Findings</span>
              </div>
            </div>
            <Button onClick={() => setScopeGeneratorOpen(true)} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Brain className="h-4 w-4" />
              AI Scope Generator
            </Button>
            <Button onClick={() => setAiPrepOpen(true)} className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
              <Sparkles className="h-4 w-4" />
              AI Prep Guide
            </Button>
            <SecureActionButton resource="audits" action="create" onClick={() => { setEditingAudit(null); setFormOpen(true); }} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
              <Plus className="h-4 w-4" />
              Add Audit
            </SecureActionButton>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-[#1a2332] border border-[#2a3548]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search audits..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#151d2e] border-[#2a3548] text-white placeholder:text-slate-500 focus:border-indigo-500"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Types</SelectItem>
              <SelectItem value="internal" className="text-white hover:bg-[#2a3548]">Internal</SelectItem>
              <SelectItem value="external" className="text-white hover:bg-[#2a3548]">External</SelectItem>
              <SelectItem value="regulatory" className="text-white hover:bg-[#2a3548]">Regulatory</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Status</SelectItem>
              <SelectItem value="planned" className="text-white hover:bg-[#2a3548]">Planned</SelectItem>
              <SelectItem value="in_progress" className="text-white hover:bg-[#2a3548]">In Progress</SelectItem>
              <SelectItem value="completed" className="text-white hover:bg-[#2a3548]">Completed</SelectItem>
              <SelectItem value="follow_up" className="text-white hover:bg-[#2a3548]">Follow Up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto scrollbar-thin">
            <TabsList className="bg-[#0f1623] border border-[#2a3548] p-1 inline-flex">
              {/* Dashboard & Overview */}
              <TabsTrigger value="overview" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              
              {/* Core Audit Management */}
              <TabsTrigger value="audits" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                All Audits
              </TabsTrigger>
              <TabsTrigger value="programs" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30">
                <FileText className="h-4 w-4 mr-2" />
                Programs
              </TabsTrigger>
              <TabsTrigger value="findings" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Findings
              </TabsTrigger>
              
              {/* AI & Intelligence */}
              <TabsTrigger value="ai-guidance" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30">
                <Lightbulb className="h-4 w-4 mr-2" />
                AI Guidance
              </TabsTrigger>
              
              {/* Learning & Resources */}
              <TabsTrigger value="frameworks" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30">
                <BookOpen className="h-4 w-4 mr-2" />
                Frameworks
              </TabsTrigger>
              <TabsTrigger value="study-guide" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30">
                <GraduationCap className="h-4 w-4 mr-2" />
                Study Guide
              </TabsTrigger>
              <TabsTrigger value="guide" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <HelpCircle className="h-4 w-4 mr-2" />
                User Guide
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <AuditAIInsightsPanel 
              audits={audits}
              findings={findings}
              controls={controls}
              risks={risks}
            />
            <AuditDashboard 
              audits={audits}
              findings={findings}
              onAuditClick={handleViewAudit}
              onStartNew={() => setFormOpen(true)}
            />
          </TabsContent>

          <TabsContent value="ai-guidance">
            <AuditAIGuidance />
          </TabsContent>

          <TabsContent value="frameworks">
            <AuditFrameworkLibrary />
          </TabsContent>

          <TabsContent value="study-guide">
            <AuditStudyGuide />
          </TabsContent>

          <TabsContent value="guide">
            <AuditUserGuide />
          </TabsContent>

          <TabsContent value="dashboard">
            <AuditReportingDashboard 
              audits={audits}
              findings={findings}
              workpapers={workpapers}
            />
          </TabsContent>

          <TabsContent value="report-generator">
            <AutomatedReportGenerator 
              audits={audits}
              findings={findings}
            />
          </TabsContent>

          <TabsContent value="trend-analysis">
            <AITrendAnalysis 
              dataType="audits"
              historicalData={audits.map(a => ({
                ...a,
                findings_count: findings.filter(f => f.audit_id === a.id).length,
                critical_findings: findings.filter(f => f.audit_id === a.id && f.severity === 'critical').length
              }))}
              onInsightsGenerated={(insights) => {
                console.log('Audit trend insights:', insights);
              }}
            />
          </TabsContent>

          <TabsContent value="audits" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 bg-[#1a2332]" />)}
              </div>
            ) : filteredAudits.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-[#1a2332] border border-[#2a3548]">
                <ClipboardCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No audits found</h3>
                <p className="text-slate-500 mt-1">Get started by adding your first audit</p>
                <Button onClick={() => setFormOpen(true)} className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Audit
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredAudits.map(audit => (
                  <div key={audit.id} onClick={() => handleViewAudit(audit)} className="cursor-pointer">
                    <AuditCard 
                      audit={audit} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="programs" className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button onClick={() => setProgramBuilderOpen(true)} className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg">
                <Plus className="h-4 w-4" />New Program
              </Button>
              <Button onClick={() => setTemplateBuilderOpen(true)} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Wand2 className="h-4 w-4" />
                AI Template
              </Button>
            </div>
            {filteredPrograms.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-[#1a2332] border border-[#2a3548]">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No audit programs</h3>
                <p className="text-slate-500 mt-1">Create a program to define audit procedures</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrograms.map(program => (
                  <Card key={program.id} className="bg-[#1a2332] border-[#2a3548] p-5 hover:border-[#3a4558] transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white flex-1 cursor-pointer" onClick={() => { setSelectedProgram(program); setProgramDetailOpen(true); }}>{program.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                          <DropdownMenuItem onClick={() => { setSelectedProgram(program); setProgramDetailOpen(true); }} className="text-white hover:bg-[#2a3548]">
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            if (confirm(`Delete program "${program.name}"?`)) {
                              deleteProgramMutation.mutate(program.id);
                            }
                          }} className="text-rose-400 hover:bg-rose-500/10">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-slate-400 text-xs mb-3 line-clamp-2">{program.description}</p>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className={`text-[10px] border ${typeColors[program.audit_type]}`}>{program.audit_type}</Badge>
                      {program.is_template && <Badge className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20">Template</Badge>}
                      {program.ai_generated && <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">AI</Badge>}
                      {program.version && <Badge className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">v{program.version}</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{program.estimated_hours || 0}h</div>
                      <div>{program.procedures?.length || 0} procedures</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workpapers" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setWorkpaperOpen(true)} className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg" disabled={!selectedAudit}>
                <Plus className="h-4 w-4 mr-2" />New Workpaper
              </Button>
            </div>
            {!selectedAudit && (
              <div className="text-center py-12 rounded-xl bg-[#1a2332] border border-[#2a3548]">
                <Paperclip className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Select an audit from the dropdown above to view workpapers</p>
              </div>
            )}
            {selectedAudit && filteredWorkpapers.length === 0 && (
              <div className="text-center py-12 rounded-xl bg-[#1a2332] border border-[#2a3548]">
                <Paperclip className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No workpapers for this audit</p>
              </div>
            )}
            {selectedAudit && filteredWorkpapers.length > 0 && (
              <div className="space-y-3">
                {filteredWorkpapers.map(wp => (
                  <Card key={wp.id} className="bg-[#1a2332] border-[#2a3548] p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{wp.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">{wp.workpaper_type}</Badge>
                          <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">{wp.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {wp.prepared_by && <div className="flex items-center gap-1"><Users className="h-3 w-3" />{wp.prepared_by}</div>}
                          {wp.time_spent_hours && <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{wp.time_spent_hours}h</div>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-rose-400" onClick={() => {
                        if (confirm(`Delete workpaper "${wp.title}"?`)) {
                          deleteWorkpaperMutation.mutate(wp.id);
                        }
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="findings">
            <FindingsLibrary />
          </TabsContent>

          <TabsContent value="program-builder">
            <AIAuditProgramBuilder />
          </TabsContent>

          <TabsContent value="ai-plan">
            <AIAuditPlanGenerator />
          </TabsContent>

          <TabsContent value="fieldwork">
            <AIFieldworkAssistant audit={selectedAudit} />
          </TabsContent>

          <TabsContent value="report-draft">
            <AIReportDrafter audit={selectedAudit} />
          </TabsContent>

          <TabsContent value="risk-scoring">
            <AIRiskScoring findings={findings} controls={controls} />
          </TabsContent>

          <TabsContent value="network">
            <RiskAuditNetwork 
              audits={audits}
              findings={findings}
              risks={risks}
              controls={controls}
            />
          </TabsContent>

          <TabsContent value="remediation" className="space-y-6">
            <RemediationProgressMonitor />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RemediationTaskManager findingId={selectedAudit?.id} findingTitle={selectedAudit?.title} />
              <RemediationReportGenerator />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AuditForm 
        open={formOpen}
        onOpenChange={setFormOpen}
        audit={editingAudit}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AIAuditPrep
        open={aiPrepOpen}
        onOpenChange={setAiPrepOpen}
        controls={controls}
        compliance={compliance}
        risks={risks}
        incidents={incidents}
        findings={findings}
      />

      <Dialog open={scopeGeneratorOpen} onOpenChange={setScopeGeneratorOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Brain className="h-6 w-6 text-violet-400" />
              AI Audit Scope Generator
              <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">INTELLIGENT</Badge>
            </DialogTitle>
          </DialogHeader>
          <AIAuditScopeGenerator
            controls={controls}
            risks={risks}
            findings={findings}
            incidents={incidents}
            onScopeGenerated={(scope) => {
              console.log('Generated scope:', scope);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={auditDetailOpen} onOpenChange={setAuditDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{selectedAudit?.title}</DialogTitle>
          </DialogHeader>
          {selectedAudit && (
            <Tabs defaultValue="testing" className="mt-4">
              <TabsList className="bg-[#0f1623] border border-[#2a3548] p-1 w-full justify-start">
                <TabsTrigger value="testing" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                  <TestTube className="h-4 w-4 mr-2" />
                  Testing
                </TabsTrigger>
                <TabsTrigger value="artifacts" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Artifacts
                </TabsTrigger>
                <TabsTrigger value="report" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30">
                  <FileText className="h-4 w-4 mr-2" />
                  Report
                </TabsTrigger>
              </TabsList>

              <TabsContent value="testing" className="mt-6">
                <Tabs defaultValue="audit" className="w-full">
                  <TabsList className="bg-[#0f1623] border border-[#2a3548] p-1">
                    <TabsTrigger value="audit" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30">Audit Testing</TabsTrigger>
                    <TabsTrigger value="control" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30">Control Testing</TabsTrigger>
                  </TabsList>
                  <TabsContent value="audit" className="mt-4">
                    <AuditTesting audit={selectedAudit} />
                  </TabsContent>
                  <TabsContent value="control" className="mt-4">
                    <ControlTestingEngine auditMode={true} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="artifacts" className="mt-6">
                <AuditArtifacts audit={selectedAudit} />
              </TabsContent>

              <TabsContent value="report" className="mt-6">
                <AuditReportWriter audit={selectedAudit} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <AuditProgramBuilder open={programBuilderOpen} onOpenChange={setProgramBuilderOpen} />
      <WorkpaperManager open={workpaperOpen} onOpenChange={setWorkpaperOpen} auditId={selectedAudit?.id} />
      <FindingsTracker open={findingsOpen} onOpenChange={setFindingsOpen} auditId={selectedAudit?.id} />
      <AuditProgramDetail 
        open={programDetailOpen} 
        onOpenChange={setProgramDetailOpen} 
        program={selectedProgram}
        controls={controls}
        risks={risks}
      />

      <Dialog open={templateBuilderOpen} onOpenChange={setTemplateBuilderOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-400" />
              AI Template Builder
              <Badge className="bg-purple-500/20 text-purple-400 text-[10px]">INTELLIGENT</Badge>
            </DialogTitle>
          </DialogHeader>
          <AITemplateBuilder open={templateBuilderOpen} onOpenChange={setTemplateBuilderOpen} />
        </DialogContent>
      </Dialog>

      <EntitySummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        entity={selectedFindingForSummary}
        entityType="finding"
      />

      <FindingRiskLinker
        open={riskLinkerOpen}
        onOpenChange={setRiskLinkerOpen}
        finding={selectedFindingForLink}
      />

      <Dialog open={remediationOpen} onOpenChange={setRemediationOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-indigo-400" />
              Remediation Planning
            </DialogTitle>
          </DialogHeader>
          {selectedFindingForRemediation && (
            <div className="grid gap-6">
              <AIRemediationPlanner 
                finding={selectedFindingForRemediation}
                onPlanCreated={() => {
                  queryClient.invalidateQueries({ queryKey: ['remediation-tasks'] });
                }}
              />
              <RemediationTaskManager 
                findingId={selectedFindingForRemediation.id}
                findingTitle={selectedFindingForRemediation.title}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={aiAnalysisOpen} onOpenChange={setAiAnalysisOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-400" />
              AI Finding Analysis
              <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">INTELLIGENT</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedFindingForAnalysis && (
            <AIFindingAnalyzer 
              finding={selectedFindingForAnalysis}
              allFindings={findings}
              onUpdate={(updates) => {
                updateFindingMutation.mutate({ 
                  id: selectedFindingForAnalysis.id, 
                  data: updates 
                });
                setAiAnalysisOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <FloatingChatbot
        context="audits"
        contextData={{
          totalAudits: audits.length,
          planned: audits.filter(a => a.status === 'planned').length,
          inProgress: inProgressCount,
          completed: audits.filter(a => a.status === 'completed').length,
          totalFindings: totalFindings,
          types: [...new Set(audits.map(a => a.type))],
          recentAudits: audits.slice(0, 5).map(a => ({
            title: a.title,
            type: a.type,
            status: a.status
          }))
        }}
      />
    </div>
  );
}