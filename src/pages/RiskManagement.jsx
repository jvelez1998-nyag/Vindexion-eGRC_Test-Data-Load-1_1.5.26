import { useState, lazy, Suspense, memo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { usePermissions } from "@/components/rbac/PermissionProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Brain, Target, Zap, Activity, List, BookOpen, Radio, Download, Network, HelpCircle, Sparkles, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components for better initial load
const RiskManagementDashboard = lazy(() => import("@/components/risks/RiskManagementDashboard"));
const AIRiskAnalysisEngine = lazy(() => import("@/components/risks/AIRiskAnalysisEngine"));
const RiskTreatmentWorkflow = lazy(() => import("@/components/risks/RiskTreatmentWorkflow"));
const RiskVisualizationHub = lazy(() => import("@/components/risks/RiskVisualizationHub"));
const RiskRegisterDashboard = lazy(() => import("@/components/risks/RiskRegisterDashboard"));
const RiskIdentificationEngine = lazy(() => import("@/components/risks/RiskIdentificationEngine"));
const AutomatedRiskMonitoring = lazy(() => import("@/components/risks/AutomatedRiskMonitoring"));
const RiskStudyGuide = lazy(() => import("@/components/risks/RiskStudyGuide"));
const RiskManagementUserGuide = lazy(() => import("@/components/risks/RiskManagementUserGuide"));
const ExternalRiskFeeds = lazy(() => import("@/components/risks/ExternalRiskFeeds"));
const MITREATTACKLibrary = lazy(() => import("@/components/risks/MITREATTACKLibrary"));
const OWASPRiskLibrary = lazy(() => import("@/components/risks/OWASPRiskLibrary"));
const AIScenarioSimulator = lazy(() => import("@/components/risks/AIScenarioSimulator"));
const RiskControlNetwork = lazy(() => import("@/components/visualization/RiskControlNetwork"));
const InteractiveRiskLandscape = lazy(() => import("@/components/visualization/InteractiveRiskLandscape"));
const AutomatedRiskAssessment = lazy(() => import("@/components/risks/AutomatedRiskAssessment"));
const RiskMitigationTracker = lazy(() => import("@/components/risks/RiskMitigationTracker"));
const DynamicRiskScoring = lazy(() => import("@/components/risks/DynamicRiskScoring"));
const RiskAIInsightsPanel = lazy(() => import("@/components/risks/RiskAIInsightsPanel"));
const AIDynamicRiskScoring = lazy(() => import("@/components/risks/AIDynamicRiskScoring"));
const RiskNotificationMonitor = lazy(() => import("@/components/risks/RiskNotificationMonitor"));
const WhatIfScenarioSimulator = lazy(() => import("@/components/risks/WhatIfScenarioSimulator"));
const ComprehensiveRiskRegister = lazy(() => import("@/components/risks/ComprehensiveRiskRegister"));
const AIRiskDiscoveryEngine = lazy(() => import("@/components/risks/AIRiskDiscoveryEngine"));
const AIMitigationAdvisor = lazy(() => import("@/components/risks/AIMitigationAdvisor"));
const AIRiskScoreUpdater = lazy(() => import("@/components/risks/AIRiskScoreUpdater"));
const AIRootCauseAnalyzer = lazy(() => import("@/components/risks/AIRootCauseAnalyzer"));
const AIMitigationStrategies = lazy(() => import("@/components/risks/AIMitigationStrategies"));
const RiskAcceptanceFramework = lazy(() => import("@/components/risks/RiskAcceptanceFramework"));
const RiskLibraryHub = lazy(() => import("@/components/risks/RiskLibraryHub"));
const KRIKPILibrary = lazy(() => import("@/components/kri/KRIKPILibrary"));

const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-48 w-full bg-[#1a2332]" />
    <Skeleton className="h-64 w-full bg-[#1a2332]" />
  </div>
);

export default function RiskManagement() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  const [mitreLibraryOpen, setMitreLibraryOpen] = useState(false);
  const [owaspLibraryOpen, setOwaspLibraryOpen] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [mitigationAdvisorOpen, setMitigationAdvisorOpen] = useState(false);
  const [selectedRiskForMitigation, setSelectedRiskForMitigation] = useState(null);
  const [scoreUpdaterOpen, setScoreUpdaterOpen] = useState(false);
  const { filterAccessibleData, hasPermission } = usePermissions();

  const { data: allRisks = [], isLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 900000,
    gcTime: 1800000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 900000,
    gcTime: 1800000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const data = await base44.entities.Incident.list('-reported_date', 50);
      return data || [];
    },
    staleTime: 900000,
    gcTime: 1800000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const data = await base44.entities.Compliance.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 900000,
    gcTime: 1800000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Apply RBAC filtering
  const risks = filterAccessibleData(allRisks, 'view');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1623] p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-[#1a2332] animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-[#1a2332] animate-pulse rounded" />
            <div className="h-4 w-96 bg-[#1a2332] animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-[#1a2332] animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-[1800px] mx-auto p-3 sm:p-4 space-y-3">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500/10 via-orange-500/10 to-amber-500/10 border border-rose-500/20 p-3 sm:p-4">
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="mb-1.5">
              <h2 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Vindexion eGRC<sup className="text-[6px]">™</sup></h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 shadow-lg shadow-rose-500/20 flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-rose-200 to-orange-300 bg-clip-text text-transparent">
                    Risk Management Center
                  </h1>
                  <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5">AI-powered risk intelligence & treatment workflows</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
                  <div className="text-[10px] text-rose-400">Total Risks</div>
                  <div className="text-lg font-bold text-white">{risks.length}</div>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <div className="text-[10px] text-orange-400">Critical</div>
                  <div className="text-lg font-bold text-white">{risks.filter(r => r.overall_risk_rating === 'critical').length}</div>
                </div>
                <Button onClick={() => setDiscoveryOpen(true)} size="sm" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 h-8">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline text-xs">Discover</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <Suspense fallback={<LoadingFallback />}>
          <RiskAIInsightsPanel 
            risks={risks}
            controls={controls}
            incidents={incidents}
          />
        </Suspense>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-3">
          <div className="sticky top-14 z-40 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 bg-[#0f1623]/95 backdrop-blur-xl border-b border-[#2a3548]">
            <div className="overflow-x-auto scrollbar-thin">
              <TabsList className="inline-flex bg-[#1a2332] border border-[#2a3548] p-0.5 rounded-lg min-w-max">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30 rounded-md whitespace-nowrap px-3 py-1.5 text-xs">
                  <Activity className="h-3.5 w-3.5 mr-1.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400 data-[state=active]:border data-[state=active]:border-amber-500/30 rounded-md whitespace-nowrap px-3 py-1.5 text-xs">
                  <List className="h-3.5 w-3.5 mr-1.5" />
                  Risk Register
                </TabsTrigger>
                <TabsTrigger value="identification" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30 rounded-md whitespace-nowrap px-3 py-1.5 text-xs">
                  <Target className="h-3.5 w-3.5 mr-1.5" />
                  Identification
                </TabsTrigger>
                <TabsTrigger value="treatment" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30 rounded-md whitespace-nowrap px-3 py-1.5 text-xs">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Treatment
                </TabsTrigger>
                <TabsTrigger value="ai-intelligence" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 rounded-md whitespace-nowrap px-3 py-1.5 text-xs">
                  <Brain className="h-3.5 w-3.5 mr-1.5" />
                  AI Tools
                </TabsTrigger>
                <TabsTrigger value="visualization" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30 rounded-md whitespace-nowrap px-3 py-1.5 text-xs">
                  <Network className="h-3.5 w-3.5 mr-1.5" />
                  Visualizations
                </TabsTrigger>
                <TabsTrigger value="workflows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/30 rounded-md whitespace-nowrap px-3 py-1.5 text-xs">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Automation
                </TabsTrigger>
                <TabsTrigger value="guide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30 rounded-md whitespace-nowrap px-3 py-1.5 text-xs">
                  <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                  Help
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-3 overflow-x-auto">
            <div className="min-w-[1200px]">
              <Suspense fallback={<LoadingFallback />}>
                <RiskManagementDashboard
                  risks={risks}
                  controls={controls}
                  onStartNew={() => setFormOpen(true)}
                  onViewRisk={(risk) => {
                    setEditingRisk(risk);
                    setFormOpen(true);
                  }}
                />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-3 overflow-x-auto">
            <div className="min-w-[1200px]">
              <Suspense fallback={<LoadingFallback />}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <AIDynamicRiskScoring 
                  risks={risks}
                  controls={controls}
                  incidents={incidents}
                  onScoreUpdate={() => {}}
                />
                <RiskNotificationMonitor risks={risks} />
              </div>
              <RiskLibraryHub 
                onImportRisk={() => {
                  // Risk imported successfully
                }}
              />
              <KRIKPILibrary onImport={() => {}} />
              <div className="flex gap-2">
                <Button 
                  onClick={() => setMitreLibraryOpen(true)} 
                  className="gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700"
                >
                  <Download className="h-4 w-4" />
                  MITRE ATT&CK
                </Button>
                <Button 
                  onClick={() => setOwaspLibraryOpen(true)} 
                  className="gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                >
                  <Download className="h-4 w-4" />
                  OWASP Top 10
                </Button>
              </div>
              <RiskRegisterDashboard
                risks={risks}
                controls={controls}
                onNewRisk={() => {
                  setEditingRisk(null);
                  setFormOpen(true);
                }}
                onViewRisk={(risk) => {
                  setSelectedRiskForMitigation(risk);
                  setMitigationAdvisorOpen(true);
                }}
              />
              <ComprehensiveRiskRegister 
                onCreateRisk={(riskData) => {}}
              />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="identification" className="space-y-3 overflow-x-auto">
            <div className="min-w-[1200px]">
              <Suspense fallback={<LoadingFallback />}>
                <RiskIdentificationEngine
                  onComplete={(data) => {
                    setFormOpen(false);
                  }}
                />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="treatment" className="space-y-3 overflow-x-auto">
            <div className="min-w-[1200px]">
              <Suspense fallback={<LoadingFallback />}>
                <RiskTreatmentWorkflow />
                <AutomatedRiskMonitoring />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="ai-intelligence" className="space-y-3 overflow-x-auto">
            <div className="min-w-[1200px]">
              <Suspense fallback={<LoadingFallback />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div 
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-3 cursor-pointer hover:border-purple-500/40 transition-all rounded-lg border"
                  onClick={() => setDiscoveryOpen(true)}
                >
                  <Sparkles className="h-5 w-5 text-purple-400 mb-1.5" />
                  <h3 className="font-semibold text-white mb-0.5 text-sm">Risk Discovery</h3>
                  <p className="text-[11px] text-slate-400">Identify emerging risks from incidents</p>
                </div>
                <div 
                  className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20 p-3 cursor-pointer hover:border-indigo-500/40 transition-all rounded-lg border"
                  onClick={() => setScoreUpdaterOpen(true)}
                >
                  <TrendingUp className="h-5 w-5 text-indigo-400 mb-1.5" />
                  <h3 className="font-semibold text-white mb-0.5 text-sm">Dynamic Scoring</h3>
                  <p className="text-[11px] text-slate-400">Auto-update risk scores</p>
                </div>
                <div 
                  className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-3 cursor-pointer hover:border-emerald-500/40 transition-all rounded-lg border"
                  onClick={() => {
                    if (risks.length > 0) {
                      setSelectedRiskForMitigation(risks[0]);
                      setMitigationAdvisorOpen(true);
                    }
                  }}
                >
                  <Target className="h-5 w-5 text-emerald-400 mb-1.5" />
                  <h3 className="font-semibold text-white mb-0.5 text-sm">Mitigation Advisor</h3>
                  <p className="text-[11px] text-slate-400">AI-driven strategies</p>
                </div>
              </div>
              <AIRiskAnalysisEngine risks={risks} controls={controls} />
              <AIScenarioSimulator />
              {risks.filter(r => ['high', 'critical'].includes(r.overall_risk_rating?.toLowerCase())).length > 0 && (
                risks.filter(r => ['high', 'critical'].includes(r.overall_risk_rating?.toLowerCase())).slice(0, 2).map(risk => (
                  <div key={risk.id} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="space-y-3">
                      <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 p-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-rose-400 mt-1" />
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-white mb-1">{risk.title}</h3>
                            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                              {risk.overall_risk_rating}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                      <AIRootCauseAnalyzer risk={risk} incidents={incidents} />
                    </div>
                    <div className="space-y-3">
                      <AIMitigationStrategies risk={risk} />
                    </div>
                  </div>
                ))
              )}
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-3 overflow-x-auto">
            <div className="min-w-[1200px]">
              <Suspense fallback={<LoadingFallback />}>
                <RiskVisualizationHub risks={risks} controls={controls} incidents={incidents} />
                <RiskControlNetwork risks={risks} controls={controls} />
                <InteractiveRiskLandscape risks={risks} controls={controls} />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-3 overflow-x-auto">
            <div className="min-w-[1200px]">
              <Suspense fallback={<LoadingFallback />}>
                <AutomatedRiskAssessment risks={risks} controls={controls} incidents={incidents} />
                {risks.length > 0 && risks.filter(r => r.status !== 'closed').slice(0, 2).map(risk => (
                  <div key={risk.id} className="space-y-3">
                    <div className="flex items-center gap-2 p-2.5 bg-[#1a2332] rounded-lg border border-[#2a3548]">
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                      <div>
                        <h4 className="text-white font-medium text-sm">{risk.title}</h4>
                        <p className="text-xs text-slate-400">{risk.category}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <DynamicRiskScoring risk={risk} controls={controls} incidents={incidents} />
                      <RiskMitigationTracker risk={risk} onUpdate={() => {}} />
                    </div>
                    <WhatIfScenarioSimulator risk={risk} controls={controls} />
                  </div>
                ))}
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-3">
            <Suspense fallback={<LoadingFallback />}>
              <RiskManagementUserGuide />
              <RiskStudyGuide />
              <ExternalRiskFeeds />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={mitreLibraryOpen} onOpenChange={setMitreLibraryOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#0f1623] border-[#2a3548] overflow-hidden p-0 z-50">
          <Suspense fallback={<LoadingFallback />}>
            <MITREATTACKLibrary />
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={owaspLibraryOpen} onOpenChange={setOwaspLibraryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#0f1623] border-[#2a3548] overflow-hidden p-0 z-50">
          <Suspense fallback={<LoadingFallback />}>
            <OWASPRiskLibrary />
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={discoveryOpen} onOpenChange={setDiscoveryOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto p-6 z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              AI Risk Discovery
              <Badge className="bg-purple-500/20 text-purple-400 text-[10px]">INTELLIGENT</Badge>
            </DialogTitle>
          </DialogHeader>
          <Suspense fallback={<LoadingFallback />}>
            <AIRiskDiscoveryEngine
              incidents={incidents}
              controls={controls}
              existingRisks={risks}
            />
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={mitigationAdvisorOpen} onOpenChange={setMitigationAdvisorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto p-6 z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-400" />
              AI Mitigation Advisor: {selectedRiskForMitigation?.title}
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">INTELLIGENT</Badge>
            </DialogTitle>
          </DialogHeader>
          <Suspense fallback={<LoadingFallback />}>
            {selectedRiskForMitigation && (
              <AIMitigationAdvisor
                risk={selectedRiskForMitigation}
                controls={controls}
                onUpdate={() => {
                  setMitigationAdvisorOpen(false);
                }}
              />
            )}
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={scoreUpdaterOpen} onOpenChange={setScoreUpdaterOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto p-6 z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              AI Dynamic Risk Score Updater
              <Badge className="bg-indigo-500/20 text-indigo-400 text-[10px]">INTELLIGENT</Badge>
            </DialogTitle>
          </DialogHeader>
          <Suspense fallback={<LoadingFallback />}>
            <AIRiskScoreUpdater
              risks={risks}
              controls={controls}
              incidents={incidents}
              onScoresUpdated={() => {
                setScoreUpdaterOpen(false);
              }}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
}