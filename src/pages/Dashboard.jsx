import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

import { Shield, AlertTriangle, FileCheck, ClipboardCheck, Activity, AlertOctagon } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import ComplianceGauge from "@/components/dashboard/ComplianceGauge";
import DrillDownModal from "@/components/ui/drill-down-modal";

import RecentActivity from "@/components/dashboard/RecentActivity";
import DetailDrawer from "@/components/dashboard/DetailDrawer";

import AIRiskTreatmentPlanner from "@/components/ai/AIRiskTreatmentPlanner";
import AIControlEnhancementEngine from "@/components/ai/AIControlEnhancementEngine";
import AIComplianceReportGenerator from "@/components/ai/AIComplianceReportGenerator";
import VendorRiskDashboardWidget from "@/components/vendors/VendorRiskDashboardWidget";
import ControlEffectiveness from "@/components/dashboard/ControlEffectiveness";

import ComplianceTrendChart from "@/components/dashboard/ComplianceTrendChart";
import ControlRiskComplianceNetwork from "@/components/visualization/ControlRiskComplianceNetwork";
import AuditStatusWidget from "@/components/dashboard/AuditStatusWidget";
import IncidentTrendWidget from "@/components/dashboard/IncidentTrendWidget";

import CompactComplianceFramework from "@/components/dashboard/CompactComplianceFramework";
import CompactAuditSummary from "@/components/dashboard/CompactAuditSummary";
import KRIKPILibrary from "@/components/kri/KRIKPILibrary";
import RegExamStats from "@/components/dashboard/RegExamStats";
import ThreatVulnSummary from "@/components/dashboard/ThreatVulnSummary";
import PrivacyAssessmentSummary from "@/components/dashboard/PrivacyAssessmentSummary";
import { DashboardLoader } from "@/components/generic/ModuleLoader";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";
import QueryError from "@/components/ui/query-error";
import DeferredComponent from "@/components/ui/deferred-component";
import { Suspense, lazy } from "react";
import { ShimmerCard, ShimmerChart } from "@/components/ui/shimmer-skeleton";

// Lazy load non-critical and heavy components
const TipOfTheDay = lazy(() => import("@/components/dashboard/TipOfTheDay"));
const RecommendedTraining = lazy(() => import("@/components/dashboard/RecommendedTraining"));
const IntelligenceFeed = lazy(() => import("@/components/dashboard/IntelligenceFeed"));
const ReportSummaryWidget = lazy(() => import("@/components/reports/ReportSummaryWidget"));
const AIInsightsPanel = lazy(() => import("@/components/dashboard/AIInsightsPanel"));
const RiskHeatMap = lazy(() => import("@/components/dashboard/RiskHeatMap"));
const TrendAnalysis = lazy(() => import("@/components/dashboard/TrendAnalysis"));
const CompactKRIPanel = lazy(() => import("@/components/dashboard/CompactKRIPanel"));
const ControlEffectivenessVisualization = lazy(() => import("@/components/dashboard/ControlEffectivenessVisualization"));

export default function Dashboard() {
  const [drawer, setDrawer] = useState({ open: false, type: '', title: '', items: [] });
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });
  const [userEmail, setUserEmail] = useState(null);
  const [error, setError] = useState(null);
  
  const widgetOrder = [
    'insights', 'kpis', 'kri-library', 'heatmap-trends', 'controls-effectiveness', 
    'analytics', 'status', 'threats-privacy', 'compliance-detail',
    'activity', 'intelligence', 'training'
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setUserEmail(user?.email || null);
      } catch (error) {
        console.log("User auth:", error);
        setUserEmail(null);
      }
    };
    loadUser();
  }, []);
  const { data: risks = [], isLoading: risksLoading, error: risksError } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-updated_date', 100),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: compliance = [], isLoading: complianceLoading, error: complianceError } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-updated_date', 100),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: controls = [], isLoading: controlsLoading, error: controlsError } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: audits = [], isLoading: auditsLoading, error: auditsError } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list('-updated_date', 50),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: indicators = [], error: indicatorsError } = useQuery({
    queryKey: ['key-indicators'],
    queryFn: () => base44.entities.KeyIndicator.list(null, 30),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: incidents = [], error: incidentsError } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-reported_date', 50),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: controlTests = [], error: controlTestsError } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list('-test_date', 50),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: findings = [], error: findingsError } = useQuery({
    queryKey: ['findings'],
    queryFn: () => base44.entities.AuditFinding.list('-created_date', 50),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const { data: vendors = [], error: vendorsError } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-updated_date', 50),
    staleTime: 600000,
    cacheTime: 900000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const hasError = risksError || complianceError || controlsError || auditsError;
  const isLoading = risksLoading || complianceLoading || controlsLoading || auditsLoading;

  const safeRisks = Array.isArray(risks) ? risks.filter(r => r) : [];
  const safeCompliance = Array.isArray(compliance) ? compliance.filter(c => c) : [];
  const safeControls = Array.isArray(controls) ? controls.filter(c => c) : [];
  const safeAudits = Array.isArray(audits) ? audits.filter(a => a) : [];
  const safeIncidents = Array.isArray(incidents) ? incidents.filter(i => i) : [];

  const openRisks = safeRisks.filter(risk => risk && risk.status !== 'closed').length;
  const criticalRisks = safeRisks.filter(risk => {
    if (!risk) return false;
    const likelihood = risk.residual_likelihood || risk.likelihood || 0;
    const impact = risk.residual_impact || risk.impact || 0;
    return likelihood * impact >= 16;
  }).length;

  const effectiveControls = safeControls.filter(ctrl => ctrl && ctrl.status === 'effective').length;
  const compliantItems = safeCompliance.filter(comp => comp && (comp.status === 'implemented' || comp.status === 'verified')).length;
  const complianceRate = safeCompliance.length && !isNaN(compliantItems / safeCompliance.length) ? Math.round((compliantItems / safeCompliance.length) * 100) : 0;

  const openDrawer = (type, title, items) => {
    setDrawer({ open: true, type, title, items });
  };

  const handleRiskHeatmapClick = (cellRisks, impact, likelihood) => {
    const impactLabels = ["Very Low", "Low", "Medium", "High", "Critical"];
    const likelihoodLabels = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
    openDrawer('risks', `Risks (Impact: ${impactLabels[impact-1]}, Likelihood: ${likelihoodLabels[likelihood-1]})`, cellRisks);
  };

  const handleComplianceClick = (segmentName) => {
    const statusMap = {
      'Compliant': ['implemented', 'verified'],
      'In Progress': ['in_progress'],
      'Not Started': ['not_started'],
      'Non-Compliant': ['non_compliant']
    };
    const statuses = statusMap[segmentName] || [];
    const filtered = safeCompliance.filter(comp => comp && comp.status && statuses.includes(comp.status));
    openDrawer('compliance', `${segmentName} Requirements`, filtered);
  };



  const handleActivityClick = (type, item) => {
    const typeMap = { risk: 'risks', compliance: 'compliance', controls: 'controls', audits: 'audits' };
    openDrawer(typeMap[type] || type, item.title || item.name || item.requirement, [item]);
  };

  const handleFrameworkClick = (framework) => {
    const filtered = safeCompliance.filter(comp => comp && comp.framework === framework);
    openDrawer('compliance', `${framework} Requirements`, filtered);
  };

  const handleAuditClick = (audit) => {
    openDrawer('audits', audit.title, [audit]);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#0f1623] p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {risksError && <QueryError error={risksError} entityName="risks" />}
          {complianceError && <QueryError error={complianceError} entityName="compliance" />}
          {controlsError && <QueryError error={controlsError} entityName="controls" />}
          {auditsError && <QueryError error={auditsError} entityName="audits" />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623] overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Modernized Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 border border-indigo-500/20 p-8">
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="mb-3">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Vindexion eGRC<sup className="text-[7px]">™</sup></h2>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-2xl shadow-indigo-500/30">
                  <Activity className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                    GRC Command Center
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">AI-powered Governance, Risk & Compliance Intelligence Platform</p>
                </div>
              </div>
              {/* Enhanced KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/30 shadow-lg shadow-rose-500/10">
                  <div className="text-xs text-rose-400 mb-1 font-medium">Critical Risks</div>
                  <div className="text-2xl font-bold text-white">{criticalRisks}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Active</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 shadow-lg shadow-amber-500/10">
                  <div className="text-xs text-amber-400 mb-1 font-medium">Open Risks</div>
                  <div className="text-2xl font-bold text-white">{openRisks}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Monitored</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <div className="text-xs text-emerald-400 mb-1 font-medium">Compliance</div>
                  <div className="text-2xl font-bold text-white">{complianceRate}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Verified</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                  <div className="text-xs text-blue-400 mb-1 font-medium">Controls</div>
                  <div className="text-2xl font-bold text-white">{effectiveControls}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Effective</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-6">
          {widgetOrder.map((widgetId) => (
            <div key={widgetId}>


                {widgetId === 'insights' && (
                  <Suspense fallback={<ShimmerCard className="h-96" />}>
                    <AIInsightsPanel 
                      risks={safeRisks} 
                      compliance={safeCompliance} 
                      controls={safeControls} 
                      audits={safeAudits}
                      controlTests={controlTests || []}
                      incidents={safeIncidents}
                      findings={findings || []}
                      vendors={vendors || []}
                    />
                  </Suspense>
                )}

                {widgetId === 'heatmap-trends' && (
                  <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><ShimmerCard className="h-96" /><ShimmerChart height="h-96" /></div>}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <RiskHeatMap 
                        risks={safeRisks}
                        controls={safeControls}
                        onCellClick={(cellRisks) => setDrillDown({ open: true, title: 'Risks in Cell', data: cellRisks, type: 'risk' })} 
                      />
                      <TrendAnalysis risks={safeRisks} compliance={safeCompliance} controls={safeControls} incidents={safeIncidents} />
                    </div>
                  </Suspense>
                )}

                {widgetId === 'intelligence' && (
                  <DeferredComponent fallback={<ShimmerCard className="h-64" />} delay={500}>
                    <Suspense fallback={<ShimmerCard className="h-64" />}>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          <IntelligenceFeed />
                        </div>
                        <TipOfTheDay />
                      </div>
                    </Suspense>
                  </DeferredComponent>
                )}

                {widgetId === 'kpis' && (
                  <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">{[1,2,3,4].map(i => <ShimmerCard key={i} />)}</div>}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                      <CompactKRIPanel indicators={indicators || []} risks={safeRisks} />
                      <CompactComplianceFramework compliance={safeCompliance} onFrameworkClick={handleFrameworkClick} />
                      <CompactAuditSummary audits={safeAudits} onAuditClick={handleAuditClick} />
                      <VendorRiskDashboardWidget />
                    </div>
                  </Suspense>
                )}

                {widgetId === 'kri-library' && (
                  <DeferredComponent fallback={<ShimmerCard className="h-96" />} delay={1000}>
                    <KRIKPILibrary onImport={() => {}} />
                  </DeferredComponent>
                )}

                {widgetId === 'threats-privacy' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ThreatVulnSummary />
                    <PrivacyAssessmentSummary />
                    <RegExamStats />
                  </div>
                )}

                {widgetId === 'controls-effectiveness' && (
                  <ControlEffectiveness controls={safeControls} />
                )}

                {widgetId === 'activity' && (
                  <RecentActivity risks={safeRisks} compliance={safeCompliance} controls={safeControls} audits={safeAudits} onItemClick={handleActivityClick} />
                )}

                {widgetId === 'analytics' && (
                  <DeferredComponent fallback={<ShimmerCard className="h-96" />} delay={700}>
                    <Suspense fallback={<ShimmerCard className="h-96" />}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <ControlEffectivenessVisualization controls={safeControls} />
                          <ComplianceTrendChart compliance={safeCompliance} />
                        </div>
                        <ControlRiskComplianceNetwork 
                          controls={safeControls} 
                          risks={safeRisks} 
                          compliance={safeCompliance} 
                        />
                      </div>
                    </Suspense>
                  </DeferredComponent>
                )}

                {widgetId === 'status' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <AuditStatusWidget audits={safeAudits} />
                    <IncidentTrendWidget incidents={safeIncidents} />
                  </div>
                )}

                {widgetId === 'compliance-detail' && (
                  <Suspense fallback={<ShimmerCard className="h-96" />}>
                    <ComplianceGauge compliance={safeCompliance} onSegmentClick={handleComplianceClick} />
                  </Suspense>
                )}

                {widgetId === 'training' && (
                  <DeferredComponent fallback={<div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><ShimmerCard /><ShimmerCard /></div>} delay={800}>
                    <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><ShimmerCard /><ShimmerCard /></div>}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <RecommendedTraining risks={safeRisks} compliance={safeCompliance} incidents={safeIncidents} />
                        <ReportSummaryWidget />
                      </div>
                    </Suspense>
                  </DeferredComponent>
                )}

                {widgetId === 'ai-tools' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <AIControlEnhancementEngine 
                      controls={safeControls}
                      risks={safeRisks}
                      incidents={safeIncidents}
                    />
                    <AIComplianceReportGenerator 
                      risks={safeRisks}
                      controls={safeControls}
                      compliance={safeCompliance}
                      incidents={safeIncidents}
                      audits={safeAudits}
                    />
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      <div className="z-50">
        <DetailDrawer 
          open={drawer.open}
          onOpenChange={(open) => setDrawer(prev => ({ ...prev, open }))}
          type={drawer.type}
          title={drawer.title}
          items={drawer.items}
        />
      </div>

      <div className="z-50">
        <DrillDownModal 
          open={drillDown.open}
          onClose={() => setDrillDown({ open: false, title: '', data: null, type: '' })}
          title={drillDown.title}
          data={drillDown.data}
          type={drillDown.type}
        />
      </div>
    </div>
  );
}