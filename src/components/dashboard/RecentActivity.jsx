import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { AlertTriangle, FileCheck, Shield, ClipboardCheck, ArrowRight, Activity, Clock, TrendingUp } from "lucide-react";
import DrillDownModal from "@/components/ui/drill-down-modal";
import { Button } from "@/components/ui/button";

export default function RecentActivity({ risks, compliance, controls, audits, onItemClick }) {
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });
  
  const allActivities = [
    ...(Array.isArray(risks) ? risks.filter(r => r).slice(0, 3).map(r => ({ 
      type: 'risk', 
      title: r.title || 'Untitled', 
      status: r.status, 
      date: r.updated_date || r.created_date,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      item: r
    })) : []),
    ...(Array.isArray(compliance) ? compliance.filter(c => c).slice(0, 3).map(c => ({ 
      type: 'compliance', 
      title: c.requirement || 'Untitled', 
      status: c.status, 
      date: c.updated_date || c.created_date,
      icon: FileCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      item: c
    })) : []),
    ...(Array.isArray(controls) ? controls.filter(c => c).slice(0, 3).map(c => ({ 
      type: 'controls', 
      title: c.name || 'Untitled', 
      status: c.status, 
      date: c.updated_date || c.created_date,
      icon: Shield,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      item: c
    })) : []),
    ...(Array.isArray(audits) ? audits.filter(a => a).slice(0, 3).map(a => ({ 
      type: 'audits', 
      title: a.title || 'Untitled', 
      status: a.status, 
      date: a.updated_date || a.created_date,
      icon: ClipboardCheck,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      item: a
    })) : [])
  ].filter(item => item && item.date).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const statusStyles = {
    identified: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    assessing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    mitigating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    monitoring: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    not_started: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    implemented: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    non_compliant: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    planned: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    effective: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ineffective: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    follow_up: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  // Calculate summary
  const summary = {
    risks: Array.isArray(risks) ? risks.filter(r => r && r.status !== 'closed').length : 0,
    compliance: Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'in_progress').length : 0,
    controls: Array.isArray(controls) ? controls.filter(c => c && c.status === 'effective').length : 0,
    audits: Array.isArray(audits) ? audits.filter(a => a && a.status === 'in_progress').length : 0
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#1a2332] to-indigo-950/20 border-[#2a3548]">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
      
      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-white">Recent Activity Stream</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Real-time updates across all GRC modules</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>

        {/* Enhanced Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
          <button 
            className="group relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all text-left"
            onClick={() => setDrillDown({ open: true, title: 'Open Risks', data: Array.isArray(risks) ? risks.filter(r => r && r.status !== 'closed') : [], type: 'risk' })}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <ArrowRight className="h-3 w-3 text-rose-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-2xl font-bold text-rose-400">{summary.risks}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Open Risks</p>
            </div>
          </button>

          <button 
            className="group relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left"
            onClick={() => setDrillDown({ open: true, title: 'In Progress Compliance', data: Array.isArray(compliance) ? compliance.filter(c => c && c.status === 'in_progress') : [], type: 'compliance' })}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <FileCheck className="h-4 w-4 text-emerald-400" />
                <ArrowRight className="h-3 w-3 text-emerald-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{summary.compliance}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">In Progress</p>
            </div>
          </button>

          <button 
            className="group relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all text-left"
            onClick={() => setDrillDown({ open: true, title: 'Effective Controls', data: Array.isArray(controls) ? controls.filter(c => c && c.status === 'effective') : [], type: 'control' })}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <Shield className="h-4 w-4 text-blue-400" />
                <ArrowRight className="h-3 w-3 text-blue-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-2xl font-bold text-blue-400">{summary.controls}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Effective</p>
            </div>
          </button>

          <button 
            className="group relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all text-left"
            onClick={() => setDrillDown({ open: true, title: 'Active Audits', data: Array.isArray(audits) ? audits.filter(a => a && a.status === 'in_progress') : [], type: 'audit' })}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/10 rounded-full blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <ClipboardCheck className="h-4 w-4 text-violet-400" />
                <ArrowRight className="h-3 w-3 text-violet-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-2xl font-bold text-violet-400">{summary.audits}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Active Audits</p>
            </div>
          </button>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {allActivities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div 
                  key={`${activity.type}-${index}`}
                  className="group relative overflow-hidden flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#151d2e] to-[#151d2e]/50 hover:from-[#1e2a3d] hover:to-[#1e2a3d]/80 cursor-pointer transition-all border border-[#2a3548] hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5"
                  onClick={() => onItemClick && onItemClick(activity.type, activity.item)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className={`relative p-2 rounded-lg ${activity.bgColor} border border-transparent group-hover:border-current transition-colors`}>
                    <Icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-[10px] px-2 py-0.5 border ${statusStyles[activity.status] || 'bg-slate-500/10 text-slate-400'}`}>
                        {activity.status?.replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: true }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className="text-[9px] bg-slate-800/50 text-slate-400 border-slate-700 px-1.5 py-0.5">
                      {activity.type}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
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