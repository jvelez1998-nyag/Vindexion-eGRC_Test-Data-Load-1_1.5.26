import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAIPersonalization } from "@/components/personalization/AIPersonalizationEngine";
import PersonalizedSuggestions from "@/components/personalization/PersonalizedSuggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, ClipboardList, Library, Activity, Calculator, Sparkles, Brain, Shield, TrendingUp, AlertTriangle, CheckCircle2, Clock, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import AssessmentListOverhauled from "@/components/assessments/AssessmentListOverhauled";
import AssessmentForm from "@/components/assessments/AssessmentForm";
import RiskLibraryPanel from "@/components/assessments/RiskLibraryPanel";
import ComprehensiveRiskLibrary from "@/components/assessments/ComprehensiveRiskLibrary";
import RiskHeatmap from "@/components/assessments/RiskHeatmap";
import ControlLibraryPanel from "@/components/assessments/ControlLibraryPanel";
import KeyIndicatorsPanel from "@/components/assessments/KeyIndicatorsPanel";
import AIRiskAssessor from "@/components/assessments/AIRiskAssessor";
import AssessmentWorkflowPanel from "@/components/assessments/AssessmentWorkflowPanel";
import AIAssessmentIntelligence from "@/components/assessments/AIAssessmentIntelligence";
import AISummaryGenerator from "@/components/ai/AISummaryGenerator";
import AIPrivacyAssessment from "@/components/assessments/AIPrivacyAssessment";
import AITrendAnalysis from "@/components/ai/AITrendAnalysis";
import AIRiskInsightsDashboard from "@/components/assessments/AIRiskInsightsDashboard";
import RiskAssessmentDashboard from "@/components/assessments/RiskAssessmentDashboard";
import RiskAssessmentEngine from "@/components/assessments/RiskAssessmentEngine";
import RiskScenarioBuilder from "@/components/assessments/RiskScenarioBuilder";
import PredictiveRiskModeling from "@/components/assessments/PredictiveRiskModeling";
import AutomatedRiskWorkflow from "@/components/assessments/AutomatedRiskWorkflow";
import RiskAssessmentQuestionnaires from "@/components/assessments/RiskAssessmentQuestionnaires";
import AIAssessmentSimulator from "@/components/assessments/AIAssessmentSimulator";
import RiskStudyGuide from "@/components/risks/RiskStudyGuide";
import RiskMappingHubOverhauled from "@/components/assessments/RiskMappingHubOverhauled";
import RiskAssessmentUserGuide from "@/components/risks/RiskAssessmentUserGuide";
import RiskAssessmentAIInsightsPanel from "@/components/assessments/RiskAssessmentAIInsightsPanel";
import AIRiskIdentificationEngine from "@/components/assessments/AIRiskIdentificationEngine";
import AIRiskScoringEngine from "@/components/assessments/AIRiskScoringEngine";
import AIMitigationStrategyEngine from "@/components/assessments/AIMitigationStrategyEngine";
import AITreatmentPlanGenerator from "@/components/assessments/AITreatmentPlanGenerator";
import AIDynamicRiskPrioritization from "@/components/assessments/AIDynamicRiskPrioritization";

export default function RiskAssessments() {
  const [activeTab, setActiveTab] = useState("assessments");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [aiAssessorOpen, setAiAssessorOpen] = useState(false);
  const [aiIntelligenceOpen, setAiIntelligenceOpen] = useState(false);
  const [workflowPanelOpen, setWorkflowPanelOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [privacyAssessmentOpen, setPrivacyAssessmentOpen] = useState(false);
  const [riskLibraryDialogOpen, setRiskLibraryDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setUserEmail(user?.email || null);
      } catch (err) {
        setUserEmail(null);
      }
    };
    loadUser();
  }, []);

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      const data = await base44.entities.RiskAssessment.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: riskLibrary = [], isLoading: riskLibLoading } = useQuery({
    queryKey: ['risk-library'],
    queryFn: async () => {
      const data = await base44.entities.RiskLibrary.list(null, 50);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: controlLibrary = [], isLoading: controlLibLoading } = useQuery({
    queryKey: ['control-library'],
    queryFn: async () => {
      const data = await base44.entities.ControlLibrary.list(null, 50);
      return data || [];
    },
    staleTime: 600000,
    cacheTime: 900000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: indicators = [], isLoading: indicatorsLoading } = useQuery({
    queryKey: ['key-indicators'],
    queryFn: async () => {
      const data = await base44.entities.KeyIndicator.list(null, 30);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: async () => {
      const data = await base44.entities.ControlTest.list('-test_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const data = await base44.entities.Incident.list('-reported_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: threats = [] } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const data = await base44.entities.SecurityEvent.list('-detected_date', 50);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const aggregatedData = {
    assessments,
    risks,
    controls,
    riskLibrary,
    controlLibrary
  };

  const {
    preferences,
    loading: personalizationLoading,
    trackInteraction,
    getPrioritizedData
  } = useAIPersonalization(userEmail, aggregatedData);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.RiskAssessment.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      setFormOpen(false);
      toast.success("Assessment created");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.RiskAssessment.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      setFormOpen(false);
      setEditingAssessment(null);
      toast.success("Assessment updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.RiskAssessment.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      toast.success("Assessment deleted");
    }
  });

  const handleSubmit = (data) => {
    if (editingAssessment) {
      updateMutation.mutate({ id: editingAssessment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (assessment) => {
    setEditingAssessment(assessment);
    setFormOpen(true);
    trackInteraction('assessment', assessment.risk_category, assessment.lifecycle_status, assessment.id);
  };

  const handleDelete = (assessment) => {
    if (confirm(`Delete "${assessment.title}"?`)) {
      deleteMutation.mutate(assessment.id);
    }
  };

  const handleOpenWorkflow = (assessment) => {
    setSelectedAssessment(assessment);
    setWorkflowPanelOpen(true);
  };

  const handleOpenSummary = (assessment) => {
    setSelectedAssessment(assessment);
    setSummaryOpen(true);
  };

  const handleWorkflowAction = async (assessment, action, comment) => {
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
    
    await updateMutation.mutateAsync({
      id: assessment.id,
      data: {
        workflow_status: newStatus,
        lifecycle_status: action === 'approve' ? 'approved' : action === 'reject' ? 'closed' : assessment.lifecycle_status,
        workflow_history: [...(assessment.workflow_history || []), historyEntry],
        version: (assessment.version || 1) + (action === 'approve' ? 1 : 0)
      }
    });
    
    setWorkflowPanelOpen(false);
    toast.success(`Assessment ${action.replace(/_/g, ' ')}ed`);
  };

  const prioritizedAssessments = preferences ? getPrioritizedData(assessments, 'assessment') : assessments;

  const filteredAssessments = prioritizedAssessments.filter(a => {
    const matchesSearch = !search || 
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || a.assessment_type === typeFilter;
    const matchesStatus = statusFilter === "all" || a.lifecycle_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const totalAssessments = assessments.length;
  const pendingReview = assessments.filter(a => a.lifecycle_status === 'pending_review').length;
  const highRiskCount = assessments.filter(a => {
    const residualRisk = (a.residual_likelihood || 0) * (a.residual_impact || 0);
    return residualRisk >= 16;
  }).length;
  const avgControlEffectiveness = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + (a.control_effectiveness || 0), 0) / assessments.length)
    : 0;

  const isLoading = assessmentsLoading || riskLibLoading || controlLibLoading || indicatorsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1623] p-6">
        <Skeleton className="h-10 w-64 bg-[#1a2332] mb-6" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 bg-[#1a2332]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623] overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-bold text-cyan-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <Calculator className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                Risk Assessments
              </h1>
              <p className="text-slate-400 text-sm mt-1">RCSA lifecycle management with comprehensive risk intelligence</p>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <RiskAssessmentAIInsightsPanel 
          assessments={assessments}
          risks={risks}
          controls={controls}
        />

        {/* AI Personalized Suggestions */}
        {preferences?.ai_suggestions && preferences.ai_suggestions.length > 0 && (
          <div className="-mb-2">
            <PersonalizedSuggestions 
              suggestions={preferences.ai_suggestions.filter(s => s.entity_type === 'assessment' || s.entity_type === 'risk' || !s.entity_type)}
              onAction={(suggestion) => {
                if (suggestion.entity_type === 'assessment') {
                  setActiveTab('engine');
                }
              }}
            />
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-4 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <ClipboardList className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalAssessments}</div>
            </div>
            <div className="text-xs text-slate-400">Total Assessments</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Active RCSA cycle</div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-4 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{pendingReview}</div>
            </div>
            <div className="text-xs text-slate-400">Pending Review</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Requires attention</div>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 p-4 hover:border-rose-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{highRiskCount}</div>
            </div>
            <div className="text-xs text-slate-400">High Risk Items</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Risk score ≥ 16</div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 p-4 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{avgControlEffectiveness}/5</div>
            </div>
            <div className="text-xs text-slate-400">Avg Control Rating</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Effectiveness score</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="sticky top-14 z-40 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-[#0f1623]/95 backdrop-blur-xl border-b border-[#2a3548]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="overflow-x-auto scrollbar-thin">
                <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1 inline-flex gap-1 h-auto min-w-max">
                <TabsTrigger value="assessments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30 text-xs h-8">
                  <ClipboardList className="h-3 w-3 mr-1.5" />
                  Register
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30 text-xs h-8">
                  <Activity className="h-3 w-3 mr-1.5" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="engine" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30 text-xs h-8">
                  <Calculator className="h-3 w-3 mr-1.5" />
                  Engine
                </TabsTrigger>
                <TabsTrigger value="ai-tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 text-xs h-8">
                  <Brain className="h-3 w-3 mr-1.5" />
                  AI Tools
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30 text-xs h-8">
                  <Shield className="h-3 w-3 mr-1.5" />
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="predictive" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 text-xs h-8">
                  <TrendingUp className="h-3 w-3 mr-1.5" />
                  Predictive
                </TabsTrigger>
                <TabsTrigger value="automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30 text-xs h-8">
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  Automation
                </TabsTrigger>
                <TabsTrigger value="questionnaires" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-amber-400 data-[state=active]:border data-[state=active]:border-amber-500/30 text-xs h-8">
                  <Library className="h-3 w-3 mr-1.5" />
                  Questionnaires
                </TabsTrigger>
                <TabsTrigger value="mapping" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/30 text-xs h-8">
                  <TrendingUp className="h-3 w-3 mr-1.5" />
                  Mapping
                </TabsTrigger>
                <TabsTrigger value="learning" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 text-xs h-8">
                  <Library className="h-3 w-3 mr-1.5" />
                  Study
                </TabsTrigger>
                <TabsTrigger value="userguide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30 text-xs h-8">
                  <Library className="h-3 w-3 mr-1.5" />
                  Guide
                </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeTab === "assessments" && (
                  <>
                    <Button 
                      onClick={() => setPrivacyAssessmentOpen(true)} 
                      size="sm"
                      className="gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 h-8 text-xs"
                    >
                      <Shield className="h-3 w-3" />
                      <span className="hidden sm:inline">Privacy</span>
                    </Button>
                    <Button 
                      onClick={() => setAiIntelligenceOpen(true)} 
                      size="sm"
                      className="gap-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 h-8 text-xs"
                    >
                      <Brain className="h-3 w-3" />
                      <span className="hidden sm:inline">Intelligence</span>
                    </Button>
                    <Button 
                      onClick={() => setAiAssessorOpen(true)} 
                      size="sm"
                      className="gap-1.5 bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30 h-8 text-xs"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span className="hidden sm:inline">Assessor</span>
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => { setEditingAssessment(null); setFormOpen(true); }} 
                  size="sm"
                  className="gap-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 shadow-lg shadow-indigo-500/20 transition-all h-8 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  New
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="dashboard">
            <RiskAssessmentDashboard 
              assessments={assessments}
              onAssessmentClick={handleEdit}
              onStartNew={() => setActiveTab('engine')}
            />
          </TabsContent>

          <TabsContent value="engine">
            <RiskAssessmentEngine 
              onComplete={(data) => {
                createMutation.mutate(data);
                setActiveTab('assessments');
              }}
            />
          </TabsContent>

          <TabsContent value="scenarios">
            <RiskScenarioBuilder 
              onScenarioCreated={(scenario) => {
                toast.success("Scenario created");
              }}
            />
          </TabsContent>

          <TabsContent value="predictive">
            <PredictiveRiskModeling assessments={assessments} />
          </TabsContent>

          <TabsContent value="automation">
            <AutomatedRiskWorkflow />
          </TabsContent>

          <TabsContent value="questionnaires">
            <RiskAssessmentQuestionnaires 
              onComplete={(assessment) => {
                queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
                setActiveTab('assessments');
              }}
            />
          </TabsContent>

          <TabsContent value="learning">
            <RiskStudyGuide />
          </TabsContent>

          <TabsContent value="mapping">
            <RiskMappingHubOverhauled assessments={assessments} />
          </TabsContent>

          <TabsContent value="userguide">
            <RiskAssessmentUserGuide />
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20 p-5 hover:border-purple-500/40 transition-all cursor-pointer group" onClick={() => setActiveTab('simulator')}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">AI Simulator</h3>
                    <p className="text-xs text-slate-400">Simulate risk scenarios</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20 p-5 hover:border-indigo-500/40 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20">
                    <TrendingUp className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Prioritization</h3>
                    <p className="text-xs text-slate-400">AI-driven risk priority</p>
                  </div>
                </div>
                <AIDynamicRiskPrioritization risks={risks} />
              </Card>

              <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 p-5 hover:border-violet-500/40 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Brain className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Identification</h3>
                    <p className="text-xs text-slate-400">Discover emerging risks</p>
                  </div>
                </div>
                <AIRiskIdentificationEngine
                  controlTests={controlTests}
                  incidents={incidents}
                  externalThreats={threats}
                />
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 p-5 hover:border-cyan-500/40 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Calculator className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Scoring Engine</h3>
                    <p className="text-xs text-slate-400">Dynamic risk calculation</p>
                  </div>
                </div>
                <AIRiskScoringEngine
                  risks={risks}
                  controlTests={controlTests}
                  incidents={incidents}
                  controls={controls}
                />
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-5 hover:border-emerald-500/40 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Mitigation</h3>
                    <p className="text-xs text-slate-400">Strategy recommendations</p>
                  </div>
                </div>
                <AIMitigationStrategyEngine
                  risks={risks}
                  controls={controls}
                />
              </Card>

              <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20 p-5 hover:border-rose-500/40 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-rose-500/20">
                    <Shield className="h-5 w-5 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Treatment Plans</h3>
                    <p className="text-xs text-slate-400">Generate action plans</p>
                  </div>
                </div>
                <AITreatmentPlanGenerator risks={risks} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="simulator">
            <AIAssessmentSimulator 
              onSimulationComplete={(assessment) => {
                queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
              }}
            />
          </TabsContent>

          <TabsContent value="assessments" className="space-y-3">
            {/* Enhanced Filters */}
            <Card className="bg-[#1a2332] border-[#2a3548] p-5">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <Input 
                    placeholder="Search assessments..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm bg-[#0f1623] border-[#2a3548] text-white placeholder:text-slate-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-[#0f1623] border-[#2a3548] text-white hover:border-[#3a4558] transition-colors">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Types</SelectItem>
                    <SelectItem value="it" className="text-white hover:bg-[#2a3548]">IT</SelectItem>
                    <SelectItem value="operational" className="text-white hover:bg-[#2a3548]">Operational</SelectItem>
                    <SelectItem value="security" className="text-white hover:bg-[#2a3548]">Security</SelectItem>
                    <SelectItem value="financial" className="text-white hover:bg-[#2a3548]">Financial</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-[#0f1623] border-[#2a3548] text-white hover:border-[#3a4558] transition-colors">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Status</SelectItem>
                    <SelectItem value="draft" className="text-white hover:bg-[#2a3548]">Draft</SelectItem>
                    <SelectItem value="pending_review" className="text-white hover:bg-[#2a3548]">Pending Review</SelectItem>
                    <SelectItem value="approved" className="text-white hover:bg-[#2a3548]">Approved</SelectItem>
                    <SelectItem value="in_progress" className="text-white hover:bg-[#2a3548]">In Progress</SelectItem>
                    <SelectItem value="monitoring" className="text-white hover:bg-[#2a3548]">Monitoring</SelectItem>
                    <SelectItem value="closed" className="text-white hover:bg-[#2a3548]">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
                <div className="mt-2 pt-2 border-t border-[#2a3548]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {filteredAssessments.length} of {totalAssessments} assessments
                    </span>
                    {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSearch("");
                          setTypeFilter("all");
                          setStatusFilter("all");
                        }}
                        className="bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 h-6 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>

            <AssessmentListOverhauled 
              assessments={filteredAssessments}
              onEdit={handleEdit}
              onDelete={handleDelete}
              controlLibrary={controlLibrary}
              onOpenWorkflow={handleOpenWorkflow}
              onOpenSummary={handleOpenSummary}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AssessmentForm 
        open={formOpen}
        onOpenChange={setFormOpen}
        assessment={editingAssessment}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        riskLibrary={riskLibrary}
        controlLibrary={controlLibrary}
      />

      <AIRiskAssessor
        open={aiAssessorOpen}
        onOpenChange={setAiAssessorOpen}
        onApplyAssessment={(data) => {
          setEditingAssessment(null);
          createMutation.mutate(data);
        }}
      />

      <AssessmentWorkflowPanel
        open={workflowPanelOpen}
        onOpenChange={setWorkflowPanelOpen}
        assessment={selectedAssessment}
        onWorkflowAction={handleWorkflowAction}
        userRole="admin"
      />

      <AIAssessmentIntelligence
        open={aiIntelligenceOpen}
        onOpenChange={setAiIntelligenceOpen}
        onApplyInsights={(insights) => {
          toast.success("AI insights generated");
        }}
      />

      {selectedAssessment && summaryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1623] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Assessment Summary</h2>
                <Button variant="ghost" onClick={() => setSummaryOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-700/50">✕</Button>
              </div>
              <AISummaryGenerator data={selectedAssessment} type="assessment" />
            </div>
          </div>
        </div>
      )}

      <ComprehensiveRiskLibrary
        open={riskLibraryDialogOpen}
        onOpenChange={setRiskLibraryDialogOpen}
      />

      <AIPrivacyAssessment
        open={privacyAssessmentOpen}
        onOpenChange={setPrivacyAssessmentOpen}
        onComplete={(assessment) => {
          createMutation.mutate({
            title: `Privacy Assessment - ${new Date().toLocaleDateString()}`,
            assessment_type: 'security',
            risk_category: 'cyber',
            description: `AI-powered data privacy assessment completed with score: ${assessment.overallScore}/100`,
            inherent_likelihood: assessment.overallScore < 50 ? 4 : assessment.overallScore < 70 ? 3 : 2,
            inherent_impact: 4,
            control_effectiveness: Math.round(assessment.overallScore / 20),
            residual_likelihood: assessment.overallScore < 50 ? 3 : assessment.overallScore < 70 ? 2 : 1,
            residual_impact: 3,
            lifecycle_status: 'pending_review',
            notes: assessment.insights
          });
          setPrivacyAssessmentOpen(false);
          toast.success("Privacy assessment saved as risk assessment");
        }}
      />
    </div>
  );
}