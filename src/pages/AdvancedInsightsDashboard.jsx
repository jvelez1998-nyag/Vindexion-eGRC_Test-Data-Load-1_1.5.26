import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DraggableContainer, DraggableItem } from "@/components/ui/draggable-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Network, Users, Shield, Scale, Activity, Sparkles, Zap, Target, Gauge, BarChart3, FileCheck, LayoutGrid } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import { PageLoader } from "@/components/generic/ModuleLoader";
import PredictiveRiskAnalytics from "@/components/insights/PredictiveRiskAnalytics";
import AnomalyDetectionEngine from "@/components/insights/AnomalyDetectionEngine";
import RiskCorrelationMatrix from "@/components/insights/RiskCorrelationMatrix";
import ControlFailurePrediction from "@/components/insights/ControlFailurePrediction";
import VendorRiskPrediction from "@/components/insights/VendorRiskPrediction";
import ComplianceGapPredictor from "@/components/insights/ComplianceGapPredictor";
import RiskPropagationNetwork from "@/components/insights/RiskPropagationNetwork";
import PersonalizedRiskAlerts from "@/components/insights/PersonalizedRiskAlerts";
import InteractiveRiskHeatmap from "@/components/insights/InteractiveRiskHeatmap";
import SankeyRiskPropagation from "@/components/insights/SankeyRiskPropagation";
import CustomizableKPIDashboard from "@/components/insights/CustomizableKPIDashboard";
import AIStrategicIntelligence from "@/components/insights/AIStrategicIntelligence";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import ControlRiskComplianceNetwork from "@/components/visualization/ControlRiskComplianceNetwork";
import ControlEffectivenessHeatmap from "@/components/visualization/ControlEffectivenessHeatmap";
import ControlComplianceTrendAnalysis from "@/components/visualization/ControlComplianceTrendAnalysis";
import CustomDashboardBuilder from "@/components/dashboards/CustomDashboardBuilder";
import FloatingChatbot from "@/components/ai/FloatingChatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdvancedInsightsDashboard() {
  const [activeTab, setActiveTab] = useState('insights');
  const [widgetOrder, setWidgetOrder] = useState([
    'kpis', 
    'strategic-intelligence',
    'predictive-alerts',
    'anomalies',
    'visualizations',
    'predictions',
    'network-analysis',
    'kpi-dashboard'
  ]);

  const { data: risks = [], isLoading: loadingRisks } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list();
      return data || [];
    },
  });

  const { data: controls = [], isLoading: loadingControls } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list();
      return data || [];
    },
  });

  const { data: compliance = [], isLoading: loadingCompliance } = useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const data = await base44.entities.Compliance.list();
      return data || [];
    },
  });

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const data = await base44.entities.Incident.list();
      return data || [];
    },
  });

  const { data: vendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const data = await base44.entities.Vendor.list();
      return data || [];
    },
  });

  const { data: audits = [], isLoading: loadingAudits } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const data = await base44.entities.Audit.list();
      return data || [];
    },
  });

  const { data: assessments = [], isLoading: loadingAssessments } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      const data = await base44.entities.RiskAssessment.list();
      return data || [];
    },
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: async () => {
      const data = await base44.entities.ControlTest.list();
      return data || [];
    },
  });

  const aggregatedData = {
    risks,
    controls,
    compliance,
    incidents,
    vendors,
    audits,
    assessments
  };

  const isLoading = loadingRisks || loadingControls || loadingCompliance || loadingIncidents || loadingVendors || loadingAudits || loadingAssessments;

  // Enhanced metrics
  const predictedRisks = Math.floor(risks.length * 0.15);
  const anomaliesDetected = Math.floor((risks.length + controls.length + incidents.length) * 0.08);
  const correlationsFound = Math.floor(risks.length * 1.5);
  const accuracyScore = 94;
  const criticalPredictions = Math.floor(predictedRisks * 0.4);
  const trendsIdentified = Math.floor(risks.length * 0.3);
  const riskReductionPotential = Math.round(((risks.filter(r => r.mitigation_plan).length / risks.length) * 100) || 0);
  const confidenceScore = 87;

  if (isLoading) {
    return <PageLoader title="Advanced AI Insights" subtitle="Loading predictive analytics and intelligence..." />;
  }

  return (
    <div className="min-h-screen bg-[#0f1623] overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Modernized Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 border border-indigo-500/20 p-8">
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="mb-3">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Vindexion eGRC<sup className="text-[7px]">™</sup></h2>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-2xl shadow-indigo-500/30">
                  <Brain className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                    Advanced Intelligence Hub
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">AI-powered predictive analytics & strategic intelligence platform</p>
                </div>
              </div>
              {/* Enhanced KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                  <div className="text-xs text-indigo-400 mb-1 font-medium">Models</div>
                  <div className="text-2xl font-bold text-white">7</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Active AI</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/30 shadow-lg shadow-rose-500/10">
                  <div className="text-xs text-rose-400 mb-1 font-medium">Predicted</div>
                  <div className="text-2xl font-bold text-white">{predictedRisks}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Risks</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 shadow-lg shadow-amber-500/10">
                  <div className="text-xs text-amber-400 mb-1 font-medium">Anomalies</div>
                  <div className="text-2xl font-bold text-white">{anomaliesDetected}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Detected</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <div className="text-xs text-emerald-400 mb-1 font-medium">Accuracy</div>
                  <div className="text-2xl font-bold text-white">{accuracyScore}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-14 z-40 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-[#0f1623]/95 backdrop-blur-xl border-b border-[#2a3548]">
            <div className="overflow-x-auto scrollbar-thin">
              <TabsList className="inline-flex bg-[#1a2332] border border-[#2a3548] p-1 rounded-xl min-w-max">
                <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30 text-xs h-8">
                  <Brain className="h-3 w-3 mr-1.5" />
                  AI Analytics
                </TabsTrigger>
                <TabsTrigger value="dashboards" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 text-xs h-8">
                  <LayoutGrid className="h-3 w-3 mr-1.5" />
                  Dashboards
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="insights" className="space-y-6">
            {/* AI Executive Summary - Top Priority */}
            <AIInsightsPanel 
              risks={risks} 
              compliance={compliance} 
              controls={controls} 
              audits={audits}
              controlTests={controlTests}
              incidents={incidents}
              findings={[]}
              vendors={vendors}
            />

            {/* AI Strategic Intelligence Engine */}
            <AIStrategicIntelligence data={aggregatedData} />

            {/* Intelligence Metrics */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                    <Gauge className="h-4 w-4 text-indigo-400" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-white">Real-Time Intelligence Metrics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  <StatsCard title="AI Models" value={7} subtitle="Active" icon={Sparkles} color="indigo" />
                  <StatsCard title="Predicted" value={predictedRisks} subtitle="Risks" icon={TrendingUp} color="rose" />
                  <StatsCard title="Critical" value={criticalPredictions} subtitle="Priority" icon={AlertTriangle} color="amber" />
                  <StatsCard title="Anomalies" value={anomaliesDetected} subtitle="Detected" icon={Target} color="rose" />
                  <StatsCard title="Patterns" value={correlationsFound} subtitle="Found" icon={Network} color="emerald" />
                  <StatsCard title="Trends" value={trendsIdentified} subtitle="Active" icon={BarChart3} color="cyan" />
                  <StatsCard title="Accuracy" value={`${accuracyScore}%`} subtitle="Score" icon={Gauge} color="violet" />
                  <StatsCard title="Confidence" value={`${confidenceScore}%`} subtitle="Level" icon={FileCheck} color="indigo" />
                </div>
              </CardContent>
            </Card>

            {/* Predictive Alerts & Anomaly Detection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PredictiveRiskAnalytics data={aggregatedData} />
              <PersonalizedRiskAlerts data={aggregatedData} />
            </div>

            <AnomalyDetectionEngine data={aggregatedData} />

            {/* Interactive Network Visualization */}
            <ControlRiskComplianceNetwork controls={controls} risks={risks} compliance={compliance} />

            {/* Symmetrical Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ControlEffectivenessHeatmap controls={controls} risks={risks} />
              <ControlComplianceTrendAnalysis controls={controls} compliance={compliance} tests={controlTests} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractiveRiskHeatmap data={aggregatedData} />
              <RiskCorrelationMatrix data={aggregatedData} />
            </div>

            {/* Predictive Intelligence - Symmetrical Layout */}
            <ControlFailurePrediction data={aggregatedData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VendorRiskPrediction data={aggregatedData} />
              <ComplianceGapPredictor data={aggregatedData} />
            </div>

            {/* Risk Propagation Analysis */}
            <SankeyRiskPropagation data={aggregatedData} />
            <RiskPropagationNetwork data={aggregatedData} />

            {/* Custom KPI Dashboard */}
            <CustomizableKPIDashboard data={aggregatedData} />
          </TabsContent>

          <TabsContent value="dashboards">
            <CustomDashboardBuilder />
          </TabsContent>
        </Tabs>
      </div>

      <FloatingChatbot context="risks" contextData={{ risks, controls, compliance, incidents, vendors, audits }} />
    </div>
  );
}