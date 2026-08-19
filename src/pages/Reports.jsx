import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FileBarChart, Brain, Sparkles, LayoutDashboard as LayoutDashboardIcon, FileText, Calendar, TrendingUp, HelpCircle, BookOpen, Target, BarChart3, Layers, Zap, Activity, Wand2, LayoutDashboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportingDashboard from "@/components/reports/ReportingDashboard";
import ModernReportingOverview from "@/components/reports/ModernReportingOverview";
import AIReportingEngine from "@/components/reports/AIReportingEngine";
import CustomReportBuilder from "@/components/reports/CustomReportBuilder";
import ScheduledReportsManager from "@/components/reports/ScheduledReportsManager";
import AdvancedCustomReportBuilder from "@/components/reports/AdvancedCustomReportBuilder";
import InteractiveDashboardBuilder from "@/components/reports/InteractiveDashboardBuilder";
import EnhancedAIReportEngine from "@/components/reports/EnhancedAIReportEngine";
import ReportAnalytics from "@/components/reports/ReportAnalytics";
import ReportsUserGuide from "@/components/reports/ReportsUserGuide";
import CannedReportTemplates from "@/components/reports/CannedReportTemplates";
import ReportsLearningPath from "@/components/reports/ReportsLearningPath";
import ReportsDeepDive from "@/components/reports/ReportsDeepDive";
import AdvancedReportVisualizations from "@/components/reports/AdvancedReportVisualizations";
import FloatingChatbot from "@/components/ai/FloatingChatbot";
import PredictiveAnalytics from "@/components/reports/PredictiveAnalytics";
import AnomalyDetection from "@/components/reports/AnomalyDetection";
import CustomAIReportBuilder from "@/components/reports/CustomAIReportBuilder";
import AIExecutiveSummaryGenerator from "@/components/reports/AIExecutiveSummaryGenerator";
import AdvancedTemplateBuilder from "@/components/reports/AdvancedTemplateBuilder";
import AutomatedReportScheduler from "@/components/reports/AutomatedReportScheduler";
import AdvancedReportEngine from "@/components/reports/AdvancedReportEngine";

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all data with optimized caching
  const { data: risks = [], isLoading: risksLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-created_date', 100),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: compliance = [], isLoading: complianceLoading } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-created_date', 100),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: controls = [], isLoading: controlsLoading } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-created_date', 100),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list('-created_date', 50),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 50),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.RiskAssessment.list('-created_date', 100),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: () => base44.entities.AuditFinding.list('-created_date', 100),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date', 50),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const isLoading = risksLoading || complianceLoading || controlsLoading || auditsLoading;

  const allData = {
    risks,
    compliance,
    controls,
    audits,
    incidents,
    assessments,
    findings,
    vendors
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1623] p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-[#1a2332] animate-pulse" />
          <div className="space-y-2">
            <div className="h-10 w-96 bg-[#1a2332] animate-pulse rounded" />
            <div className="h-4 w-72 bg-[#1a2332] animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-[#1a2332] animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 border border-indigo-500/20 p-4 sm:p-6 lg:p-8">
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="mb-2">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Vindexion eGRC<sup className="text-[7px]">™</sup></h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 flex-shrink-0">
                  <FileBarChart className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                    Reports & Analytics Hub
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">AI-powered reporting & comprehensive GRC insights</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                  <div className="text-xs text-indigo-400">Data Points</div>
                  <div className="text-xl font-bold text-white">{risks.length + compliance.length + controls.length + audits.length}</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="text-xs text-purple-400">Sources</div>
                  <div className="text-xl font-bold text-white">8</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="sticky top-14 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#0f1623]/95 backdrop-blur-xl border-b border-[#2a3548]">
            <div className="overflow-x-auto scrollbar-thin">
              <TabsList className="inline-flex bg-[#1a2332] border border-[#2a3548] p-1 rounded-xl min-w-max">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 rounded-lg whitespace-nowrap">
                  <LayoutDashboardIcon className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 rounded-lg whitespace-nowrap">
                  <Layers className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="ai-engine" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 rounded-lg whitespace-nowrap">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Reports
                </TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 rounded-lg whitespace-nowrap">
                  <FileText className="h-4 w-4 mr-2" />
                  Custom Builder
                </TabsTrigger>
                <TabsTrigger value="visualizations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/20 rounded-lg whitespace-nowrap">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visualizations
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 rounded-lg whitespace-nowrap">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-amber-400 data-[state=active]:border data-[state=active]:border-amber-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 rounded-lg whitespace-nowrap">
                  <Calendar className="h-4 w-4 mr-2" />
                  Automation
                </TabsTrigger>
                <TabsTrigger value="guide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/20 rounded-lg whitespace-nowrap">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <ModernReportingOverview data={allData} />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 sm:space-y-6">
            <AdvancedTemplateBuilder data={allData} />
          </TabsContent>

          <TabsContent value="ai-engine" className="space-y-4 sm:space-y-6">
            <AIExecutiveSummaryGenerator data={allData} />
            <EnhancedAIReportEngine data={allData} />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 sm:space-y-6">
            <AdvancedCustomReportBuilder data={allData} />
            <CustomAIReportBuilder data={allData} />
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-4 sm:space-y-6">
            <AdvancedReportVisualizations data={allData} />
            <InteractiveDashboardBuilder data={allData} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <ReportAnalytics data={allData} />
            <PredictiveAnalytics data={allData} />
            <AnomalyDetection data={allData} />
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4 sm:space-y-6">
            <AutomatedReportScheduler />
          </TabsContent>

          <TabsContent value="guide" className="space-y-4 sm:space-y-6">
            <ReportsUserGuide />
            <ReportsLearningPath />
          </TabsContent>
        </Tabs>
      </div>

      <FloatingChatbot
        context="reports"
        contextData={{
          totalRisks: risks.length,
          totalCompliance: compliance.length,
          totalControls: controls.length,
          totalAudits: audits.length
        }}
      />
    </div>
  );
}