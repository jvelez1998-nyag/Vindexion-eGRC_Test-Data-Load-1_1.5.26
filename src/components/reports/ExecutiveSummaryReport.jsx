import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Shield, FileCheck, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function ExecutiveSummaryReport({ risks, compliance, controls, audits, incidents, assessments }) {
  const getRiskScore = (r) => (r.likelihood || 0) * (r.impact || 0);
  const criticalRisks = risks.filter(r => getRiskScore(r) >= 16).length;
  const highRisks = risks.filter(r => getRiskScore(r) >= 9 && getRiskScore(r) < 16).length;
  const openRisks = risks.filter(r => r.status !== 'closed').length;

  const compliantItems = compliance.filter(c => c.status === 'verified' || c.status === 'implemented').length;
  const complianceRate = compliance.length ? Math.round((compliantItems / compliance.length) * 100) : 0;
  
  const effectiveControls = controls.filter(c => c.status === 'effective').length;
  const controlRate = controls.length ? Math.round((effectiveControls / controls.length) * 100) : 0;

  const criticalIncidents = incidents?.filter(i => i.severity === 'critical').length || 0;
  const openIncidents = incidents?.filter(i => !['closed', 'remediated'].includes(i.status)).length || 0;

  const highRiskAssessments = assessments?.filter(a => {
    const score = (a.residual_likelihood || 0) * (a.residual_impact || 0);
    return score >= 9;
  }).length || 0;

  const getTrendIndicator = (value, threshold) => {
    if (value >= threshold) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Executive Summary</h3>
          <p className="text-sm text-slate-500">Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}</p>
        </div>
        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
          Comprehensive Overview
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <Badge className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20">
                {criticalRisks} Critical
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">{openRisks}</p>
            <p className="text-xs text-slate-500">Open Risks</p>
          </div>

          <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
            <div className="flex items-center justify-between mb-2">
              <FileCheck className="h-5 w-5 text-emerald-400" />
              {getTrendIndicator(complianceRate, 80)}
            </div>
            <p className="text-2xl font-bold text-white">{complianceRate}%</p>
            <p className="text-xs text-slate-500">Compliance Rate</p>
          </div>

          <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-blue-400" />
              {getTrendIndicator(controlRate, 75)}
            </div>
            <p className="text-2xl font-bold text-white">{controlRate}%</p>
            <p className="text-xs text-slate-500">Control Effectiveness</p>
          </div>

          <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-violet-400" />
              <Badge className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                {criticalIncidents} Critical
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">{openIncidents}</p>
            <p className="text-xs text-slate-500">Open Incidents</p>
          </div>
        </div>

        {/* Risk Overview */}
        <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
          <h4 className="text-sm font-semibold text-white mb-3">Risk Posture</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Critical Risks</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-[#0f1623] rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${(criticalRisks / risks.length) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-white w-8">{criticalRisks}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">High Risks</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-[#0f1623] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(highRisks / risks.length) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-white w-8">{highRisks}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Open Risks</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-[#0f1623] rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${(openRisks / risks.length) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-white w-8">{openRisks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
          <h4 className="text-sm font-semibold text-white mb-3">Key Findings & Recommendations</h4>
          <div className="space-y-2">
            {criticalRisks > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">{criticalRisks} critical risks require immediate attention</span>
              </div>
            )}
            {complianceRate < 80 && (
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Compliance rate below target ({complianceRate}% vs 80% target)</span>
              </div>
            )}
            {controlRate >= 75 && (
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Control effectiveness meets target standards</span>
              </div>
            )}
            {highRiskAssessments > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">{highRiskAssessments} assessments identified high residual risk</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
            <p className="text-xs text-slate-500 mb-1">Total Audits</p>
            <p className="text-xl font-bold text-white">{audits.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              {audits.filter(a => a.status === 'completed').length} completed
            </p>
          </div>
          <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
            <p className="text-xs text-slate-500 mb-1">Risk Assessments</p>
            <p className="text-xl font-bold text-white">{assessments?.length || 0}</p>
            <p className="text-xs text-slate-400 mt-1">
              {assessments?.filter(a => a.lifecycle_status === 'approved').length || 0} approved
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}