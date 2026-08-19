import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, AlertTriangle, Clock, PieChart, BarChart3 } from "lucide-react";
import DrillDownModal from "@/components/ui/drill-down-modal";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function CompactAuditSummary({ audits, onAuditClick }) {
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });
  const [activeChart, setActiveChart] = useState('status'); // 'status' or 'findings'
  
  const allFindings = Array.isArray(audits) ? audits.filter(a => a).flatMap(a => a.findings || []).filter(f => f) : [];
  const criticalFindings = allFindings.filter(f => f && f.severity === 'critical').length;
  const highFindings = allFindings.filter(f => f && f.severity === 'high').length;
  const openFindings = allFindings.filter(f => f && f.status !== 'resolved').length;

  const statusCounts = {
    planned: Array.isArray(audits) ? audits.filter(a => a && a.status === 'planned').length : 0,
    inProgress: Array.isArray(audits) ? audits.filter(a => a && a.status === 'in_progress').length : 0,
    completed: Array.isArray(audits) ? audits.filter(a => a && a.status === 'completed').length : 0
  };

  const completionRate = Array.isArray(audits) && audits.length > 0 
    ? Math.round((statusCounts.completed / audits.length) * 100)
    : 0;

  // Chart data
  const statusChartData = [
    { name: 'Planned', value: statusCounts.planned, color: '#3b82f6' },
    { name: 'In Progress', value: statusCounts.inProgress, color: '#f59e0b' },
    { name: 'Completed', value: statusCounts.completed, color: '#10b981' }
  ].filter(item => item.value > 0);

  const findingsChartData = [
    { name: 'Critical', value: criticalFindings, color: '#ef4444' },
    { name: 'High', value: highFindings, color: '#f59e0b' },
    { name: 'Open', value: openFindings, color: '#3b82f6' }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f1623] border border-[#2a3548] rounded-lg p-2 shadow-lg">
          <p className="text-xs text-white font-semibold">{payload[0].name}</p>
          <p className="text-xs text-slate-400">{payload[0].value} items</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-amber-400" />
          Audit Program Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* AI-Style Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Total Audits</p>
                  <p className="text-2xl font-bold text-white">{Array.isArray(audits) ? audits.length : 0}</p>
                </div>
                <ClipboardCheck className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Total Findings</p>
                  <p className="text-2xl font-bold text-white">{allFindings.length}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-rose-400" />
              </div>
            </div>
          </div>

          {/* Interactive Chart Toggle */}
          {audits.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setActiveChart('status')}
                className={`flex-1 h-8 text-xs transition-all ${
                  activeChart === 'status' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                    : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500'
                }`}
              >
                <PieChart className="h-3 w-3 mr-1.5" />
                Status Distribution
              </Button>
              <Button
                size="sm"
                onClick={() => setActiveChart('findings')}
                className={`flex-1 h-8 text-xs transition-all ${
                  activeChart === 'findings' 
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700' 
                    : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500'
                }`}
              >
                <BarChart3 className="h-3 w-3 mr-1.5" />
                Findings Breakdown
              </Button>
            </div>
          )}

          {/* Interactive Infographic */}
          {audits.length > 0 && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-[#2a3548] p-4">
              <ResponsiveContainer width="100%" height={180}>
                {activeChart === 'status' ? (
                  <RechartsPie>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setDrillDown({
                            open: true,
                            title: `${entry.name} Audits`,
                            data: Array.isArray(audits) ? audits.filter(a => 
                              a && ((entry.name === 'Planned' && a.status === 'planned') ||
                              (entry.name === 'In Progress' && a.status === 'in_progress') ||
                              (entry.name === 'Completed' && a.status === 'completed'))
                            ) : [],
                            type: 'audit'
                          })}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPie>
                ) : (
                  <BarChart data={findingsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={10}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      radius={[6, 6, 0, 0]}
                      className="cursor-pointer"
                    >
                      {findingsChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="text-[9px] bg-[#0f1623]/80 border-[#2a3548]">
                  Click to explore
                </Badge>
              </div>
            </div>
          )}

          {/* Real-Time Executive Summary */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-500/10 border border-amber-500/20 p-3 space-y-2">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-amber-500/20">
                    <Clock className="h-3 w-3 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Real-Time Insights</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-[9px] text-green-400">Live</span>
                </div>
              </div>

              {!Array.isArray(audits) || audits.length === 0 ? (
                <p className="text-xs text-slate-300">No audits scheduled. Plan your audit program to begin tracking.</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Active Audits</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-white">{statusCounts.inProgress}</span>
                      <span className="text-[10px] text-slate-500">of {audits.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Critical Findings</span>
                    <span className={`text-xs font-semibold ${criticalFindings > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {criticalFindings}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">High Priority Findings</span>
                    <span className={`text-xs font-semibold ${highFindings > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {highFindings}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Open Items</span>
                    <span className="text-xs font-semibold text-blue-400">{openFindings}</span>
                  </div>

                  <div className="pt-2 mt-2 border-t border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Program Health</span>
                      <span className={`text-xs font-bold ${completionRate >= 80 ? 'text-emerald-400' : completionRate >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {completionRate >= 80 ? 'Excellent' : completionRate >= 50 ? 'Good' : 'Needs Attention'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audit Status Distribution */}
          <div className="grid grid-cols-3 gap-2">
            <div 
              className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 cursor-pointer hover:bg-blue-500/15 transition-colors"
              onClick={() => setDrillDown({ open: true, title: 'Planned Audits', data: Array.isArray(audits) ? audits.filter(a => a && a.status === 'planned') : [], type: 'audit' })}
            >
              <p className="text-base font-bold text-white">{statusCounts.planned}</p>
              <p className="text-[10px] text-slate-400">Planned</p>
            </div>
            <div 
              className="text-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer hover:bg-amber-500/15 transition-colors"
              onClick={() => setDrillDown({ open: true, title: 'Active Audits', data: Array.isArray(audits) ? audits.filter(a => a && a.status === 'in_progress') : [], type: 'audit' })}
            >
              <p className="text-base font-bold text-white">{statusCounts.inProgress}</p>
              <p className="text-[10px] text-slate-400">Active</p>
            </div>
            <div 
              className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/15 transition-colors"
              onClick={() => setDrillDown({ open: true, title: 'Completed Audits', data: Array.isArray(audits) ? audits.filter(a => a && a.status === 'completed') : [], type: 'audit' })}
            >
              <p className="text-base font-bold text-white">{statusCounts.completed}</p>
              <p className="text-[10px] text-slate-400">Complete</p>
            </div>
          </div>

          {/* Completion Rate */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Completion Rate</span>
              <span className="text-xs font-semibold text-white">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-1.5 [&>div]:bg-indigo-500" />
          </div>
        </div>
      </CardContent>

      <DrillDownModal 
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null, type: '' })}
        title={drillDown.title}
        data={drillDown.data}
        type={drillDown.type}
      />
    </Card>
  );
}