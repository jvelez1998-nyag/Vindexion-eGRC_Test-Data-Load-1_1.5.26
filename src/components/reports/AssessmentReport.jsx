import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AssessmentReport({ assessments, onDrillDown }) {
  const getRiskLevel = (score) => {
    if (score >= 16) return 'critical';
    if (score >= 9) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  };

  const statusData = assessments.reduce((acc, a) => {
    const status = a.lifecycle_status || 'draft';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  const typeData = assessments.reduce((acc, a) => {
    const type = a.assessment_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(typeData).map(([name, value]) => ({
    name,
    value
  }));

  const highRiskAssessments = assessments.filter(a => {
    const residualScore = (a.residual_likelihood || 0) * (a.residual_impact || 0);
    return residualScore >= 9;
  }).length;

  const approved = assessments.filter(a => a.lifecycle_status === 'approved').length;

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-violet-500/10">
          <Calculator className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Risk Assessments</h3>
          <p className="text-sm text-slate-500">{assessments.length} total assessments</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
          <p className="text-xs text-slate-500 mb-1">High Risk</p>
          <p className="text-2xl font-bold text-rose-400">{highRiskAssessments}</p>
        </div>
        <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
          <p className="text-xs text-slate-500 mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-400">{approved}</p>
        </div>
        <div className="bg-[#151d2e] rounded-lg p-3 border border-[#2a3548]">
          <p className="text-xs text-slate-500 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-white">
            {assessments.filter(a => a.lifecycle_status === 'in_progress').length}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Assessment Status</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Assessments by Type</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}