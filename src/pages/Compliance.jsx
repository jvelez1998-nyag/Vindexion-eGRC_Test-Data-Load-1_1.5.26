import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileCheck, Sparkles, FileText, BarChart3, Table as TableIcon, Activity, Target, Eye, HelpCircle, Wand2, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ComplianceTable from "@/components/compliance/ComplianceTable";
import ComplianceForm from "@/components/compliance/ComplianceForm";
import AIComplianceGap from "@/components/compliance/AIComplianceGap";
import ComplianceDashboard from "@/components/compliance/ComplianceDashboard";
import ComplianceOverviewDashboard from "@/components/compliance/ComplianceOverviewDashboard";
import ComplianceAssessmentEngine from "@/components/compliance/ComplianceAssessmentEngine";
import ComplianceMonitoring from "@/components/compliance/ComplianceMonitoring";
import ComplianceUserGuide from "@/components/compliance/ComplianceUserGuide";
import AIPolicyGenerator from "@/components/compliance/AIPolicyGenerator";
import ComplianceAIInsightsPanel from "@/components/compliance/ComplianceAIInsightsPanel";
import ComplianceAutomationEngine from "@/components/compliance/ComplianceAutomationEngine";
import EntitySummaryDialog from "@/components/ai/EntitySummaryDialog";
import FloatingChatbot from "@/components/ai/FloatingChatbot";
import RegulatoryIntelligenceFeed from "@/components/regulatory/RegulatoryIntelligenceFeed";
import { toast } from "sonner";
import { usePermissions } from "@/components/rbac/PermissionProvider";
import PermissionGuard from "@/components/rbac/PermissionGuard";
import SecureActionButton from "@/components/rbac/SecureActionButton";
import AIComplianceChecker from "@/components/compliance/AIComplianceChecker";
import AIComplianceRecommendations from "@/components/compliance/AIComplianceRecommendations";
import AIComplianceReportGenerator from "@/components/compliance/AIComplianceReportGenerator";

export default function Compliance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [aiGapOpen, setAiGapOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedItemForSummary, setSelectedItemForSummary] = useState(null);

  const queryClient = useQueryClient();
  const { filterAccessibleData, hasPermission } = usePermissions();

  const { data: allCompliance = [], isLoading } = useQuery({
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

  const { data: audits = [] } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const data = await base44.entities.Audit.list('-created_date', 50);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Compliance.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      setFormOpen(false);
      toast.success("Requirement created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Compliance.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      setFormOpen(false);
      setEditingItem(null);
      toast.success("Requirement updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Compliance.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      toast.success("Requirement deleted successfully");
    }
  });

  const handleSubmit = (data) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item) => {
    if (confirm(`Are you sure you want to delete "${item.requirement}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleWorkflowAction = (item, action, comment) => {
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
      id: item.id,
      data: {
        workflow_status: newStatus,
        workflow_history: [...(item.workflow_history || []), historyEntry]
      }
    });
  };

  // Apply RBAC filtering
  const compliance = filterAccessibleData(allCompliance, 'view');

  const frameworks = [...new Set(compliance.map(c => c.framework).filter(Boolean))];

  const filteredCompliance = compliance.filter(item => {
    const matchesSearch = !search || 
      item.requirement?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.requirement_id?.toLowerCase().includes(search.toLowerCase());
    const matchesFramework = frameworkFilter === "all" || item.framework === frameworkFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesFramework && matchesStatus;
  });

  const compliantCount = compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length;
  const complianceRate = compliance.length ? Math.round((compliantCount / compliance.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-emerald-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <FileCheck className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-200 to-green-300 bg-clip-text text-transparent">
                Policy Compliance
              </h1>
              <p className="text-slate-400 text-sm mt-1">Framework requirements and compliance tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Card className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{complianceRate}%</div>
                <div className="text-[10px] text-slate-400">Compliant</div>
              </div>
            </Card>
            <Button onClick={() => {
              if (filteredCompliance.length > 0) {
                setSelectedItemForSummary({ requirement: "Compliance Portfolio", items: filteredCompliance });
                setSummaryOpen(true);
              } else {
                toast.error("No compliance items to summarize");
              }
            }} className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <FileText className="h-4 w-4" />
              Bulk Summary
            </Button>
            <Button onClick={() => setAiGapOpen(true)} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Sparkles className="h-4 w-4" />
              Gap Analysis
            </Button>
            <SecureActionButton resource="compliance" action="create" onClick={() => { setEditingItem(null); setFormOpen(true); }} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 transition-all">
              <Plus className="h-4 w-4" />
              Add Requirement
            </SecureActionButton>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto scrollbar-thin">
            <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1 inline-flex gap-1">
              {/* Dashboard & Overview */}
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30">
                <Activity className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="table" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <TableIcon className="h-4 w-4 mr-2" />
                All Requirements
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400 data-[state=active]:border data-[state=active]:border-amber-500/30">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              
              {/* Core Compliance Management */}
              <TabsTrigger value="assessment" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30">
                <Target className="h-4 w-4 mr-2" />
                Assessment Engine
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30">
                <Eye className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/30">
                <Zap className="h-4 w-4 mr-2" />
                Automation
              </TabsTrigger>
              
              {/* AI & Intelligence */}
              <TabsTrigger value="ai-checker" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Checker
              </TabsTrigger>
              <TabsTrigger value="policy-generator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Policy Generator
              </TabsTrigger>
              
              {/* Help & Resources */}
              <TabsTrigger value="guide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <HelpCircle className="h-4 w-4 mr-2" />
                User Guide
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <ComplianceAIInsightsPanel 
              compliance={compliance}
              controls={controls}
            />
            <ComplianceOverviewDashboard
              compliance={compliance}
              onStartNew={() => { setEditingItem(null); setFormOpen(true); }}
            />
          </TabsContent>

          <TabsContent value="assessment">
            <ComplianceAssessmentEngine
              onComplete={(data) => {
                createMutation.mutate(data);
              }}
            />
          </TabsContent>

          <TabsContent value="monitoring">
            <ComplianceMonitoring />
          </TabsContent>

          <TabsContent value="table" className="space-y-4">
            {/* Filters */}
            <Card className="bg-[#1a2332] border-[#2a3548] p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    placeholder="Search requirements by framework, requirement ID, or description..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-[#0f1623] border-[#2a3548] text-white placeholder:text-slate-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                  <SelectTrigger className="w-full sm:w-44 bg-[#0f1623] border-[#2a3548] text-white hover:border-[#3a4558] transition-colors">
                    <SelectValue placeholder="Framework" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Frameworks</SelectItem>
                    {frameworks.map(f => (
                      <SelectItem key={f} value={f} className="text-white hover:bg-[#2a3548]">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-[#0f1623] border-[#2a3548] text-white hover:border-[#3a4558] transition-colors">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Status</SelectItem>
                    <SelectItem value="not_started" className="text-white hover:bg-[#2a3548]">Not Started</SelectItem>
                    <SelectItem value="in_progress" className="text-white hover:bg-[#2a3548]">In Progress</SelectItem>
                    <SelectItem value="implemented" className="text-white hover:bg-[#2a3548]">Implemented</SelectItem>
                    <SelectItem value="verified" className="text-white hover:bg-[#2a3548]">Verified</SelectItem>
                    <SelectItem value="non_compliant" className="text-white hover:bg-[#2a3548]">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(search || frameworkFilter !== 'all' || statusFilter !== 'all') && (
                <div className="mt-3 pt-3 border-t border-[#2a3548]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      Showing {filteredCompliance.length} of {compliance.length} requirements
                    </span>
                    {(search || frameworkFilter !== 'all' || statusFilter !== 'all') && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSearch("");
                          setFrameworkFilter("all");
                          setStatusFilter("all");
                        }}
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-7"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Content */}
            {isLoading ? (
              <Skeleton className="h-64 bg-[#1a2332]" />
            ) : filteredCompliance.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-[#1a2332] border border-[#2a3548]">
                <FileCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No requirements found</h3>
                <p className="text-slate-500 mt-1">Get started by adding your first compliance requirement</p>
                <Button onClick={() => setFormOpen(true)} className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </Button>
              </div>
            ) : (
              <ComplianceTable 
                items={filteredCompliance}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onWorkflowAction={handleWorkflowAction}
                onGenerateSummary={(item) => {
                  setSelectedItemForSummary(item);
                  setSummaryOpen(true);
                }}
                userRole="admin"
              />
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <ComplianceDashboard compliance={compliance} />
          </TabsContent>

          <TabsContent value="automation">
            <ComplianceAutomationEngine />
          </TabsContent>

          <TabsContent value="policy-generator">
            <AIPolicyGenerator />
          </TabsContent>

          <TabsContent value="ai-checker" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIComplianceChecker
                complianceItems={compliance}
                controls={controls}
                risks={risks}
                incidents={incidents}
              />
              <AIComplianceRecommendations
                complianceItems={compliance}
                controls={controls}
                risks={risks}
              />
            </div>
            <AIComplianceReportGenerator
              complianceItems={compliance}
              controls={controls}
              risks={risks}
              audits={audits}
            />
          </TabsContent>

          <TabsContent value="guide">
            <ComplianceUserGuide />
          </TabsContent>
        </Tabs>
      </div>

      <ComplianceForm 
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AIComplianceGap
        open={aiGapOpen}
        onOpenChange={setAiGapOpen}
        compliance={compliance}
        onCreateRequirement={(data) => {
          createMutation.mutate(data);
          setAiGapOpen(false);
        }}
      />

      <EntitySummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        entity={selectedItemForSummary}
        entityType="compliance"
      />

      <FloatingChatbot
        context="compliance"
        contextData={{
          totalRequirements: compliance.length,
          implemented: compliance.filter(c => c.status === 'implemented').length,
          verified: compliance.filter(c => c.status === 'verified').length,
          nonCompliant: compliance.filter(c => c.status === 'non_compliant').length,
          complianceRate: complianceRate,
          frameworks: [...new Set(compliance.map(c => c.framework))],
          recentItems: compliance.slice(0, 5).map(c => ({
            framework: c.framework,
            requirement: c.requirement,
            status: c.status
          }))
        }}
      />
    </div>
  );
}