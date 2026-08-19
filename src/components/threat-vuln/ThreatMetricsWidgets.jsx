import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, AlertTriangle, TrendingUp, Activity, 
  Target, Zap, Clock, CheckCircle2 
} from "lucide-react";

export default function ThreatMetricsWidgets({ threats = [], vulnerabilities = [] }) {
  const criticalVulns = vulnerabilities.filter(v => (v.cvss_score || 0) >= 9).length;
  const highVulns = vulnerabilities.filter(v => (v.cvss_score || 0) >= 7 && (v.cvss_score || 0) < 9).length;
  const patchedRate = vulnerabilities.length ? 
    Math.round((vulnerabilities.filter(v => v.status === 'patched').length / vulnerabilities.length) * 100) : 0;
  
  const avgResponseTime = 48; // hours
  const mttr = 72; // hours
  const threatCoverage = 85; // percentage
  const detectionRate = 92; // percentage

  const widgets = [
    {
      title: "Critical Vulnerabilities",
      value: criticalVulns,
      subtitle: `${highVulns} high severity`,
      icon: AlertTriangle,
      color: "rose",
      gradient: "from-rose-500/20 to-red-500/20",
      border: "border-rose-500/30"
    },
    {
      title: "Patch Coverage",
      value: `${patchedRate}%`,
      subtitle: `${vulnerabilities.filter(v => v.status === 'patched').length} of ${vulnerabilities.length} patched`,
      icon: Shield,
      color: "emerald",
      gradient: "from-emerald-500/20 to-green-500/20",
      border: "border-emerald-500/30",
      progress: patchedRate
    },
    {
      title: "Avg Response Time",
      value: `${avgResponseTime}h`,
      subtitle: "Target: < 24h",
      icon: Clock,
      color: "amber",
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/30"
    },
    {
      title: "MTTR",
      value: `${mttr}h`,
      subtitle: "Mean time to remediate",
      icon: Activity,
      color: "blue",
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30"
    },
    {
      title: "Threat Coverage",
      value: `${threatCoverage}%`,
      subtitle: "Known threats monitored",
      icon: Target,
      color: "violet",
      gradient: "from-violet-500/20 to-purple-500/20",
      border: "border-violet-500/30",
      progress: threatCoverage
    },
    {
      title: "Detection Rate",
      value: `${detectionRate}%`,
      subtitle: "Real-time detection",
      icon: Zap,
      color: "cyan",
      gradient: "from-cyan-500/20 to-teal-500/20",
      border: "border-cyan-500/30",
      progress: detectionRate
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {widgets.map((widget, idx) => {
        const Icon = widget.icon;
        return (
          <Card 
            key={idx} 
            className={`bg-gradient-to-br ${widget.gradient} ${widget.border} border hover:scale-[1.02] transition-all cursor-pointer`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg bg-[#1a2332]/50`}>
                  <Icon className={`h-4 w-4 text-${widget.color}-400`} />
                </div>
                {widget.progress && (
                  <Badge className={`text-[8px] bg-${widget.color}-500/20 text-${widget.color}-400 border-${widget.color}-500/30`}>
                    {widget.progress}%
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {widget.value}
              </div>
              <div className="text-[10px] text-slate-500 mb-2">
                {widget.title}
              </div>
              {widget.progress && (
                <Progress value={widget.progress} className="h-1.5 mb-2" />
              )}
              <div className="text-[9px] text-slate-400">
                {widget.subtitle}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}