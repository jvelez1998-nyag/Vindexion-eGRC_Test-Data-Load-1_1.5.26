import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileBarChart, Calendar, FileText, Download, Clock, 
  TrendingUp, CheckCircle2, AlertCircle, Eye, MoreHorizontal, Plus 
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, formatDistanceToNow } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function ReportSummaryWidget() {
  const [timeRange, setTimeRange] = useState("month");

  const { data: templates = [] } = useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => {
      const data = await base44.entities.ReportTemplate.filter({ status: 'active' });
      return data || [];
    },
    staleTime: 600000,
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const data = await base44.entities.ScheduledReport.filter({ status: 'active' });
      return data || [];
    },
    staleTime: 600000,
  });

  const safeTemplates = Array.isArray(templates) ? templates.filter(t => t) : [];
  const safeSchedules = Array.isArray(schedules) ? schedules.filter(s => s) : [];

  const activeSchedules = safeSchedules.filter(s => s.status === 'active');
  const recentRuns = safeSchedules
    .filter(s => s.last_run)
    .sort((a, b) => new Date(b.last_run) - new Date(a.last_run))
    .slice(0, 3);

  const upcomingSchedules = safeSchedules
    .filter(s => s.next_run && new Date(s.next_run) > new Date())
    .sort((a, b) => new Date(a.next_run) - new Date(b.next_run))
    .slice(0, 3);

  const stats = [
    {
      label: "Active Templates",
      value: safeTemplates.length,
      icon: FileText,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10"
    },
    {
      label: "Scheduled Reports",
      value: activeSchedules.length,
      icon: Calendar,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      label: "Reports This Month",
      value: safeSchedules.filter(s => {
        if (!s.last_run) return false;
        const lastRun = new Date(s.last_run);
        const now = new Date();
        return lastRun.getMonth() === now.getMonth() && 
               lastRun.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548] shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <FileBarChart className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-white">Reports & Automation</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Scheduled reports and templates</p>
            </div>
          </div>
          <Link to={createPageUrl('Reports')}>
            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs">
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-xl bg-[#0f1623] border border-[#2a3548] hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {stat.value}
                </span>
              </div>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Runs */}
        {recentRuns.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Reports</h4>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                Generated
              </Badge>
            </div>
            <div className="space-y-1.5">
              {recentRuns.map((schedule) => (
                <div 
                  key={schedule.id}
                  className="group flex items-center gap-3 p-2.5 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate group-hover:text-indigo-300 transition-colors">
                      {schedule.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(schedule.last_run), { addSuffix: true })}
                      </span>
                      <Badge className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-1.5 py-0">
                        {schedule.format.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-slate-500 hover:text-white hover:bg-[#2a3548]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                      <DropdownMenuItem className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-[#2a3548] focus:bg-[#2a3548]">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Schedules */}
        {upcomingSchedules.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming</h4>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px]">
                <Calendar className="h-2.5 w-2.5 mr-1" />
                Scheduled
              </Badge>
            </div>
            <div className="space-y-1.5">
              {upcomingSchedules.map((schedule) => (
                <div 
                  key={schedule.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0f1623] border border-[#2a3548]"
                >
                  <div className="p-1.5 rounded bg-amber-500/10">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{schedule.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {schedule.next_run ? format(new Date(schedule.next_run), 'MMM d, yyyy h:mm a') : 'Not scheduled'}
                    </p>
                  </div>
                  <Badge className="text-[9px] bg-slate-500/10 text-slate-400 border-slate-500/20 px-1.5 py-0">
                    {schedule.frequency}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recentRuns.length === 0 && upcomingSchedules.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
              <FileBarChart className="h-6 w-6 text-indigo-400" />
            </div>
            <p className="text-sm text-slate-400 mb-2">No scheduled reports yet</p>
            <Link to={createPageUrl('Reports')}>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create Schedule
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-3 border-t border-[#2a3548]">
          <div className="grid grid-cols-2 gap-2">
            <Link to={createPageUrl('Reports') + '?tab=templates'}>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-xs justify-start"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Templates
              </Button>
            </Link>
            <Link to={createPageUrl('Reports') + '?tab=scheduled'}>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs justify-start"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Schedules
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}