import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Plus, Search, Shield, Sparkles, LayoutGrid, List, 
  ArrowUpDown, Download, Trash2, CheckCircle2, XCircle, Clock, FileText,
  Activity, Target, Zap, ClipboardList, HelpCircle, Brain, BookOpen
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ControlCard from "@/components/controls/ControlCard";
import ControlForm from "@/components/controls/ControlForm";
import ControlDashboard from "@/components/controls/ControlDashboard";
import ControlDesignEngine from "@/components/controls/ControlDesignEngine";
import ControlTestingScheduler from "@/components/controls/ControlTestingScheduler";
import ControlTestingEngine from "@/components/controls/ControlTestingEngine";
import ControlAutomationEngine from "@/components/controls/ControlAutomationEngine";
import AIControlOptimizationEngine from "@/components/controls/AIControlOptimizationEngine";
import AutomatedControlTesting from "@/components/controls/AutomatedControlTesting";
import AIControlRemediationPlanner from "@/components/controls/AIControlRemediationPlanner";
import AIControlTestingEngine from "@/components/controls/AIControlTestingEngine";
import AIControlGapAnalysis from "@/components/controls/AIControlGapAnalysis";
import AIControlAdvisor from "@/components/controls/AIControlAdvisor";
import AIControlTesting from "@/components/controls/AIControlTesting";
import AIControlOptimization from "@/components/controls/AIControlOptimization";
import AIRiskControlNetwork from "@/components/controls/AIRiskControlNetwork";
import ControlWorkflowManager from "@/components/controls/ControlWorkflowManager";
import AutomatedTestingScheduler from "@/components/controls/AutomatedTestingScheduler";
import ControlNotificationEngine from "@/components/controls/ControlNotificationEngine";
import EntitySummaryDialog from "@/components/ai/EntitySummaryDialog";
import FloatingChatbot from "@/components/ai/FloatingChatbot";
import NISTControlLibrary from "@/components/controls/NISTControlLibrary";
import ITGCLibrary from "@/components/controls/ITGCLibrary";
import CISControlLibrary from "@/components/controls/CISControlLibrary";
import CollaborationPanel from "@/components/collaboration/CollaborationPanel";
import ControlManagementUserGuide from "@/components/controls/ControlManagementUserGuide";
import ControlStudyGuide from "@/components/controls/ControlStudyGuide";
import ControlDeepDive from "@/components/controls/ControlDeepDive";
import ControlLearningPath from "@/components/controls/ControlLearningPath";
import ControlExternalFeeds from "@/components/controls/ControlExternalFeeds";
import ControlVisualizationHub from "@/components/controls/ControlVisualizationHub";
import ControlsAIInsightsPanel from "@/components/controls/ControlsAIInsightsPanel";
import AIDynamicControlScoring from "@/components/controls/AIDynamicControlScoring";
import ControlNotificationMonitor from "@/components/controls/ControlNotificationMonitor";
import WhatIfControlOptimizer from "@/components/controls/WhatIfControlOptimizer";
import AIControlRiskCorrelation from "@/components/controls/AIControlRiskCorrelation";
import CollaborativeEntityView from "@/components/collaboration/CollaborativeEntityView";
import AIControlInventoryEngine from "@/components/controls/AIControlInventoryEngine";
import ControlLibraryHub from "@/components/controls/ControlLibraryHub";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { usePermissions } from "@/components/rbac/PermissionProvider";
import PermissionGuard from "@/components/rbac/PermissionGuard";
import SecureActionButton from "@/components/rbac/SecureActionButton";

export default function Controls() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [sortBy, setSortBy] = useState("effectiveness_desc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedControls, setSelectedControls] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingControl, setEditingControl] = useState(null);
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedControlForSummary, setSelectedControlForSummary] = useState(null);
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [selectedControlForCollab, setSelectedControlForCollab] = useState(null);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [selectedControlForWorkflow, setSelectedControlForWorkflow] = useState(null);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [nistLibraryOpen, setNistLibraryOpen] = useState(false);
  const [itgcLibraryOpen, setItgcLibraryOpen] = useState(false);
  const [cisLibraryOpen, setCisLibraryOpen] = useState(false);
  const [remediationOpen, setRemediationOpen] = useState(false);
  const [selectedControlForRemediation, setSelectedControlForRemediation] = useState(null);

  const queryClient = useQueryClient();
  const { filterAccessibleData, hasPermission } = usePermissions();

  const { data: allControls = [], isLoading } = useQuery({
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

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: async () => {
      const data = await base44.entities.ControlTest.list('-test_date', 50);
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

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Control.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      setFormOpen(false);
      toast.success("Control created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Control.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      setFormOpen(false);
      setEditingControl(null);
      toast.success("Control updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Control.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      toast.success("Control deleted successfully");
    }
  });

  const handleSubmit = (data) => {
    if (editingControl) {
      updateMutation.mutate({ id: editingControl.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (control) => {
    setEditingControl(control);
    setFormOpen(true);
  };

  const handleDelete = (control) => {
    if (confirm(`Are you sure you want to delete "${control.name}"?`)) {
      deleteMutation.mutate(control.id);
    }
  };

  const handleWorkflowAction = (control, action, comment) => {
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
      id: control.id,
      data: {
        workflow_status: newStatus,
        workflow_history: [...(control.workflow_history || []), historyEntry]
      }
    });
  };

  // Apply RBAC filtering
  const controls = filterAccessibleData(allControls, 'view');

  const filteredControls = useMemo(() => {
    let result = controls.filter(control => {
      const matchesSearch = !search || 
        control.name?.toLowerCase().includes(search.toLowerCase()) ||
        control.description?.toLowerCase().includes(search.toLowerCase());
      const matchesDomain = domainFilter === "all" || control.domain === domainFilter;
      const matchesStatus = statusFilter === "all" || control.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || control.category === categoryFilter;
      const matchesFramework = frameworkFilter === "all" || 
        (control.framework_mappings && control.framework_mappings[frameworkFilter]?.length > 0);
      return matchesSearch && matchesDomain && matchesStatus && matchesCategory && matchesFramework;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'effectiveness_desc': return (b.effectiveness || 0) - (a.effectiveness || 0);
        case 'effectiveness_asc': return (a.effectiveness || 0) - (b.effectiveness || 0);
        case 'date_desc': return new Date(b.created_date) - new Date(a.created_date);
        case 'date_asc': return new Date(a.created_date) - new Date(b.created_date);
        case 'name_asc': return (a.name || '').localeCompare(b.name || '');
        case 'name_desc': return (b.name || '').localeCompare(a.name || '');
        default: return 0;
      }
    });
    return result;
  }, [controls, search, domainFilter, statusFilter, categoryFilter, frameworkFilter, sortBy]);

  const effectiveCount = controls.filter(c => c.status === 'effective').length;
  const implementedCount = controls.filter(c => c.status === 'implemented').length;
  const plannedCount = controls.filter(c => c.status === 'planned').length;
  const ineffectiveCount = controls.filter(c => c.status === 'ineffective').length;
  const avgEffectiveness = controls.length ? (controls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / controls.filter(c => c.effectiveness).length).toFixed(1) : 0;

  const toggleSelectAll = () => {
    if (selectedControls.length === filteredControls.length) {
      setSelectedControls([]);
    } else {
      setSelectedControls(filteredControls.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedControls(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedControls.length} selected controls?`)) return;
    for (const id of selectedControls) {
      await deleteMutation.mutateAsync(id);
    }
    setSelectedControls([]);
  };

  const exportControls = () => {
    const data = filteredControls.map(c => ({
      Name: c.name,
      Category: c.category,
      Domain: c.domain,
      Status: c.status,
      Effectiveness: c.effectiveness,
      Owner: c.owner,
      'Review Frequency': c.review_frequency,
      'Last Tested': c.last_tested_date,
      Description: c.description
    }));
    const csv = [Object.keys(data[0] || {}).join(','), ...data.map(row => Object.values(row).map(v => `"${v || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control-register-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-blue-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <Shield className="h-7 w-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              Control Management Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">Control design, testing and effectiveness monitoring</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto scrollbar-thin">
            <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1 inline-flex gap-1">
              {/* Dashboard & Overview */}
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30">
                <Activity className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <BookOpen className="h-4 w-4 mr-2" />
                Control Library
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400 data-[state=active]:border data-[state=active]:border-amber-500/30">
                <ClipboardList className="h-4 w-4 mr-2" />
                Full Register
              </TabsTrigger>
              
              {/* Core Control Management */}
              <TabsTrigger value="design" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <Target className="h-4 w-4 mr-2" />
                Design Engine
              </TabsTrigger>
              <TabsTrigger value="testing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Testing
              </TabsTrigger>
              <TabsTrigger value="remediation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30">
                <Zap className="h-4 w-4 mr-2" />
                Remediation
              </TabsTrigger>
              
              {/* AI & Intelligence */}
              <TabsTrigger value="ai-testing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Testing
              </TabsTrigger>
              <TabsTrigger value="optimization" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <Brain className="h-4 w-4 mr-2" />
                AI Optimization
              </TabsTrigger>
              <TabsTrigger value="gap-analysis" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30">
                <Target className="h-4 w-4 mr-2" />
                Gap Analysis
              </TabsTrigger>
              <TabsTrigger value="correlation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30">
                <Target className="h-4 w-4 mr-2" />
                Risk Correlation
              </TabsTrigger>
              <TabsTrigger value="ai-inventory" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <Brain className="h-4 w-4 mr-2" />
                AI Inventory
              </TabsTrigger>
              
              {/* Automation & Analytics */}
              <TabsTrigger value="automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30">
                <Zap className="h-4 w-4 mr-2" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="automated-testing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30">
                <Clock className="h-4 w-4 mr-2" />
                Auto Testing
              </TabsTrigger>
              <TabsTrigger value="visualization" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/20 data-[state=active]:to-rose-500/20 data-[state=active]:text-pink-400 data-[state=active]:border data-[state=active]:border-pink-500/30">
                <Activity className="h-4 w-4 mr-2" />
                Visualizations
              </TabsTrigger>
              
              {/* Learning & Resources */}
              <TabsTrigger value="study" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-teal-400 data-[state=active]:border data-[state=active]:border-teal-500/30">
                <FileText className="h-4 w-4 mr-2" />
                Study Guide
              </TabsTrigger>
              <TabsTrigger value="deepdive" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30">
                <Target className="h-4 w-4 mr-2" />
                Deep Dive
              </TabsTrigger>
              <TabsTrigger value="learning" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30">
                <Sparkles className="h-4 w-4 mr-2" />
                Learning Path
              </TabsTrigger>
              <TabsTrigger value="feeds" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-amber-500/20 data-[state=active]:text-orange-400 data-[state=active]:border data-[state=active]:border-orange-500/30">
                <Activity className="h-4 w-4 mr-2" />
                External Feeds
              </TabsTrigger>
              <TabsTrigger value="guide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <HelpCircle className="h-4 w-4 mr-2" />
                User Guide
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4">
            <ControlsAIInsightsPanel 
              controls={controls}
              risks={risks}
              tests={controlTests}
              compliance={compliance}
            />
            <ControlDashboard
              controls={controls}
              controlTests={controlTests}
              onControlClick={handleEdit}
              onStartNew={() => setActiveTab('design')}
            />
          </TabsContent>

          <TabsContent value="library">
            <ControlLibraryHub 
              onImportControl={(libraryControl) => {
                const newControl = {
                  name: libraryControl.name,
                  description: libraryControl.description,
                  category: libraryControl.control_type,
                  domain: libraryControl.domain,
                  control_procedures: libraryControl.testing_procedure,
                  status: 'planned',
                  regulatory_mappings: libraryControl.regulatory_mappings || []
                };
                createMutation.mutate(newControl);
                toast.success("Control imported from library");
              }}
            />
          </TabsContent>

          <TabsContent value="design">
            <ControlDesignEngine
              onComplete={(data) => {
                createMutation.mutate(data);
                setActiveTab('register');
              }}
            />
          </TabsContent>

          <TabsContent value="testing">
            <ControlTestingEngine />
          </TabsContent>

          <TabsContent value="ai-testing">
            <AIControlTestingEngine controls={controls} />
          </TabsContent>

          <TabsContent value="gap-analysis">
            <AIControlGapAnalysis controls={controls} />
          </TabsContent>

          <TabsContent value="optimization">
            <AIControlOptimizationEngine 
              controls={controls}
              onOptimizationsApplied={(analysis, selected) => {
                queryClient.invalidateQueries({ queryKey: ['controls'] });
              }}
            />
          </TabsContent>

          <TabsContent value="correlation">
            <AIControlRiskCorrelation 
              controls={controls}
              risks={risks}
              tests={controlTests}
              onUpdateLinks={() => {
                queryClient.invalidateQueries({ queryKey: ['controls'] });
                queryClient.invalidateQueries({ queryKey: ['risks'] });
              }}
            />
          </TabsContent>

          <TabsContent value="ai-inventory">
            <AIControlInventoryEngine 
              controls={controls}
              risks={risks}
              compliance={compliance}
              onControlCreate={() => {
                queryClient.invalidateQueries({ queryKey: ['controls'] });
              }}
            />
          </TabsContent>

          <TabsContent value="automation">
            <ControlAutomationEngine />
          </TabsContent>

          <TabsContent value="automated-testing">
            <AutomatedControlTesting controls={controls} />
          </TabsContent>

          <TabsContent value="remediation">
            <div className="space-y-4">
              <Card className="bg-[#1a2332] border-[#2a3548] p-4">
                <p className="text-sm text-slate-400 mb-3">Select a control to generate remediation plan:</p>
                <Select value={selectedControlForRemediation?.id || ""} onValueChange={(id) => {
                  const control = controls.find(c => c.id === id);
                  setSelectedControlForRemediation(control);
                }}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue placeholder="Choose control..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    {controls
                      .filter(c => c.status === 'ineffective' || (c.effectiveness && c.effectiveness < 3))
                      .map(control => (
                        <SelectItem key={control.id} value={control.id} className="text-white hover:bg-[#2a3548]">
                          {control.name} - Effectiveness: {control.effectiveness || 'N/A'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Card>
              <AIControlRemediationPlanner 
                control={selectedControlForRemediation}
                controlTests={controlTests}
                risks={risks}
              />
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-6">
            {/* Hero Stats Section */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10" />
              <div className="relative p-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {controls.length}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Total Controls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400">
                      {effectiveCount}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Effective</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400">
                      {implementedCount}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Implemented</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rose-400">
                      {ineffectiveCount}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Ineffective</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-400">
                      {avgEffectiveness}/5
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Avg Effectiveness</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Intelligence Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AIDynamicControlScoring 
                controls={controls}
                risks={risks}
                tests={controlTests}
                onScoreUpdate={() => queryClient.invalidateQueries({ queryKey: ['controls'] })}
              />
              <ControlNotificationMonitor controls={controls} />
            </div>
            
            {/* What-If Optimizer */}
            {selectedControls.length === 1 && (
              <WhatIfControlOptimizer 
                control={controls.find(c => c.id === selectedControls[0])}
                risks={risks}
              />
            )}

            {/* Action Bar */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <SecureActionButton 
                      resource="controls" 
                      action="create" 
                      onClick={() => { setEditingControl(null); setFormOpen(true); }} 
                      className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20 h-10 px-5"
                    >
                      <Plus className="h-4 w-4" />
                      New Control
                    </SecureActionButton>
                    <Button 
                      onClick={() => setActiveTab('design')} 
                      className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 h-10 px-5"
                    >
                      <Target className="h-4 w-4" />
                      Design Control
                    </Button>
                    <Button onClick={() => setAiAdvisorOpen(true)} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-10 px-4">
                      <Sparkles className="h-4 w-4" />
                      AI Advisor
                    </Button>
                    <Button onClick={() => {
                      if (filteredControls.length > 0) {
                        setSelectedControlForSummary({ name: "Controls Portfolio", controls: filteredControls });
                        setSummaryOpen(true);
                      }
                    }} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10 px-4">
                      <FileText className="h-4 w-4" />
                      Summary
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setNistLibraryOpen(true)} size="sm" className="gap-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-9">
                      <Download className="h-3 w-3" />
                      NIST
                    </Button>
                    <Button onClick={() => setItgcLibraryOpen(true)} size="sm" className="gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-9">
                      <Download className="h-3 w-3" />
                      ITGC
                    </Button>
                    <Button onClick={() => setCisLibraryOpen(true)} size="sm" className="gap-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-9">
                      <Download className="h-3 w-3" />
                      CIS
                    </Button>
                    <Button onClick={exportControls} size="sm" className="gap-1 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 h-9">
                      <Download className="h-3 w-3" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Advanced Filters */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-400" />
                    Search & Filter Controls
                  </h3>
                  {(search || domainFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all' || frameworkFilter !== 'all') && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setSearch('');
                        setDomainFilter('all');
                        setStatusFilter('all');
                        setCategoryFilter('all');
                        setFrameworkFilter('all');
                      }}
                      className="h-7 text-xs text-slate-400 hover:text-white"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                      placeholder="Search by name..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-[#0f1623] border-[#2a3548] text-white placeholder:text-slate-500 focus:border-blue-500 h-10"
                    />
                  </div>
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white h-10">
                      <SelectValue placeholder="Domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="all" className="text-white">All Domains</SelectItem>
                      <SelectItem value="access_control" className="text-white">Access Control</SelectItem>
                      <SelectItem value="data_protection" className="text-white">Data Protection</SelectItem>
                      <SelectItem value="network_security" className="text-white">Network Security</SelectItem>
                      <SelectItem value="incident_response" className="text-white">Incident Response</SelectItem>
                      <SelectItem value="business_continuity" className="text-white">Business Continuity</SelectItem>
                      <SelectItem value="vendor_management" className="text-white">Vendor Management</SelectItem>
                      <SelectItem value="physical_security" className="text-white">Physical Security</SelectItem>
                      <SelectItem value="hr_security" className="text-white">HR Security</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white h-10">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="all" className="text-white">All Types</SelectItem>
                      <SelectItem value="preventive" className="text-white">Preventive</SelectItem>
                      <SelectItem value="detective" className="text-white">Detective</SelectItem>
                      <SelectItem value="corrective" className="text-white">Corrective</SelectItem>
                      <SelectItem value="directive" className="text-white">Directive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white h-10">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="all" className="text-white">All Status</SelectItem>
                      <SelectItem value="planned" className="text-white">Planned</SelectItem>
                      <SelectItem value="implemented" className="text-white">Implemented</SelectItem>
                      <SelectItem value="effective" className="text-white">Effective</SelectItem>
                      <SelectItem value="ineffective" className="text-white">Ineffective</SelectItem>
                      <SelectItem value="retired" className="text-white">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                    <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white h-10">
                      <SelectValue placeholder="Framework" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="all" className="text-white">All Frameworks</SelectItem>
                      <SelectItem value="COSO" className="text-white">COSO</SelectItem>
                      <SelectItem value="COBIT" className="text-white">COBIT</SelectItem>
                      <SelectItem value="ISO27001" className="text-white">ISO 27001</SelectItem>
                      <SelectItem value="NIST" className="text-white">NIST</SelectItem>
                      <SelectItem value="SOX" className="text-white">SOX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2a3548]">
                  <div className="flex items-center gap-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-52 bg-[#0f1623] border-[#2a3548] text-white h-9">
                        <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="effectiveness_desc" className="text-white">Effectiveness (High→Low)</SelectItem>
                        <SelectItem value="effectiveness_asc" className="text-white">Effectiveness (Low→High)</SelectItem>
                        <SelectItem value="date_desc" className="text-white">Newest First</SelectItem>
                        <SelectItem value="date_asc" className="text-white">Oldest First</SelectItem>
                        <SelectItem value="name_asc" className="text-white">Name (A→Z)</SelectItem>
                        <SelectItem value="name_desc" className="text-white">Name (Z→A)</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedControls.length > 0 && (
                      <>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {selectedControls.length} selected
                        </Badge>
                        <Button size="sm" onClick={handleBulkDelete} className="h-9 gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Selected
                        </Button>
                      </>
                    )}
                  </div>
                  <Tabs value={viewMode} onValueChange={setViewMode}>
                    <TabsList className="h-9 bg-[#0f1623] border border-[#2a3548]">
                      <TabsTrigger value="list" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30">
                        <List className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger value="grid" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                        <LayoutGrid className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </Card>

            {/* Results Section */}
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-[#1a2332] border-[#2a3548]">
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-6 w-3/4 bg-[#2a3548]" />
                      <Skeleton className="h-4 w-full bg-[#2a3548]" />
                      <Skeleton className="h-4 w-2/3 bg-[#2a3548]" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredControls.length === 0 ? (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <div className="text-center py-20">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
                    <Shield className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Controls Found</h3>
                  <p className="text-slate-400 mb-6">
                    {search || domainFilter !== 'all' || statusFilter !== 'all' ? 
                      'Try adjusting your filters or search term' : 
                      'Get started by creating your first control'
                    }
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {(search || domainFilter !== 'all' || statusFilter !== 'all') && (
                      <Button 
                        onClick={() => {
                          setSearch('');
                          setDomainFilter('all');
                          setStatusFilter('all');
                          setCategoryFilter('all');
                          setFrameworkFilter('all');
                        }} 
                        className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button onClick={() => setFormOpen(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Control
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedControls.length === filteredControls.length && filteredControls.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-[#2a3548]"
                    />
                    <span className="text-sm text-slate-400">
                      {filteredControls.length} control{filteredControls.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                </div>
                
                <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-2' : 'space-y-3'}>
                  {filteredControls.map(control => (
                    <div key={control.id} className="flex items-start gap-3">
                      <Checkbox 
                        checked={selectedControls.includes(control.id)}
                        onCheckedChange={() => toggleSelect(control.id)}
                        className="mt-6 border-[#2a3548]"
                      />
                      <div className="flex-1">
                        <ControlCard 
                          control={control} 
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onWorkflowAction={handleWorkflowAction}
                          onPlanRemediation={(control) => {
                            setSelectedControlForRemediation(control);
                            setActiveTab('remediation');
                          }}
                          userRole="admin"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="visualization">
            <ControlVisualizationHub controls={controls} controlTests={controlTests} />
          </TabsContent>

          <TabsContent value="study">
            <ControlStudyGuide />
          </TabsContent>

          <TabsContent value="deepdive">
            <ControlDeepDive controls={controls} controlTests={controlTests} />
          </TabsContent>

          <TabsContent value="learning">
            <ControlLearningPath />
          </TabsContent>

          <TabsContent value="feeds">
            <ControlExternalFeeds />
          </TabsContent>

          <TabsContent value="guide">
            <ControlManagementUserGuide />
          </TabsContent>
        </Tabs>
      </div>

      <ControlForm 
        open={formOpen}
        onOpenChange={setFormOpen}
        control={editingControl}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AIControlAdvisor
        open={aiAdvisorOpen}
        onOpenChange={setAiAdvisorOpen}
        existingControls={controls}
        onCreateControl={(data) => {
          createMutation.mutate(data);
          setAiAdvisorOpen(false);
        }}
      />

      <EntitySummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        entity={selectedControlForSummary}
        entityType="control"
      />

      <ControlWorkflowManager
        open={workflowOpen}
        onOpenChange={setWorkflowOpen}
        control={selectedControlForWorkflow}
      />

      <AutomatedTestingScheduler
        open={schedulerOpen}
        onOpenChange={setSchedulerOpen}
        controls={controls}
      />

      <NISTControlLibrary
        open={nistLibraryOpen}
        onOpenChange={setNistLibraryOpen}
      />

      <ITGCLibrary
        open={itgcLibraryOpen}
        onOpenChange={setItgcLibraryOpen}
      />

      <Dialog open={cisLibraryOpen} onOpenChange={setCisLibraryOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#0f1623] border-[#2a3548] overflow-hidden p-0">
          <CISControlLibrary />
        </DialogContent>
      </Dialog>

      <Dialog open={collaborationOpen} onOpenChange={setCollaborationOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedControlForCollab?.name}</DialogTitle>
            <p className="text-sm text-slate-400">Collaborate on this control</p>
          </DialogHeader>
          {selectedControlForCollab && (
            <CollaborationPanel 
              entityType="control"
              entityId={selectedControlForCollab.id}
              entityTitle={selectedControlForCollab.name}
            />
          )}
        </DialogContent>
      </Dialog>

      <FloatingChatbot
        context="controls"
        contextData={{
          totalControls: controls.length,
          effectiveControls: effectiveCount,
          ineffectiveControls: ineffectiveCount,
          avgEffectiveness: avgEffectiveness,
          domains: [...new Set(controls.map(c => c.domain))],
          recentControls: controls.slice(0, 5).map(c => ({
            name: c.name,
            domain: c.domain,
            category: c.category,
            status: c.status,
            effectiveness: c.effectiveness
          }))
        }}
      />
    </div>
  );
}