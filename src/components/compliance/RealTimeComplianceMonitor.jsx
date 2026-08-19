import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { toast } from "sonner";

export default function RealTimeComplianceMonitor({ controls, compliance, securityEvents, onRefresh }) {
  const [monitoringData, setMonitoringData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Calculate real-time compliance metrics
    const frameworks = ['SOC2', 'ISO27001', 'NIST', 'PCI-DSS', 'HIPAA'];
    const data = frameworks.map(framework => {
      const frameworkCompliance = compliance.filter(c => c.framework === framework);
      const total = frameworkCompliance.length;
      const compliant = frameworkCompliance.filter(c => 
        c.status === 'verified' || c.status === 'implemented'
      ).length;
      const percentage = total ? Math.round((compliant / total) * 100) : 0;

      // Check for controls mapped to this framework
      const mappedControls = controls.filter(c => 
        c.framework_mappings && c.framework_mappings[framework]?.length > 0
      );
      const effectiveControls = mappedControls.filter(c => 
        c.effectiveness >= 4 && (c.status === 'effective' || c.status === 'implemented')
      );

      return {
        framework,
        percentage,
        total,
        compliant,
        mappedControls: mappedControls.length,
        effectiveControls: effectiveControls.length,
        trend: percentage >= 80 ? 'good' : percentage >= 60 ? 'warning' : 'critical'
      };
    });

    setMonitoringData(data);

    // Generate alerts based on monitoring
    const newAlerts = [];
    
    // Framework compliance alerts
    data.forEach(d => {
      if (d.percentage < 60) {
        newAlerts.push({
          type: 'critical',
          framework: d.framework,
          message: `${d.framework} compliance below 60% (${d.percentage}%)`,
          timestamp: new Date()
        });
      } else if (d.percentage < 80) {
        newAlerts.push({
          type: 'warning',
          framework: d.framework,
          message: `${d.framework} compliance needs attention (${d.percentage}%)`,
          timestamp: new Date()
        });
      }
    });

    // Control effectiveness alerts
    const ineffectiveControls = controls.filter(c => c.effectiveness < 3);
    if (ineffectiveControls.length > 0) {
      newAlerts.push({
        type: 'warning',
        message: `${ineffectiveControls.length} controls have low effectiveness`,
        timestamp: new Date()
      });
    }

    // Security event alerts
    const criticalEvents = securityEvents.filter(e => 
      e.severity === 'critical' && !e.resolved
    );
    if (criticalEvents.length > 0) {
      newAlerts.push({
        type: 'critical',
        message: `${criticalEvents.length} unresolved critical security events`,
        timestamp: new Date()
      });
    }

    setAlerts(newAlerts);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (onRefresh) onRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [controls, compliance, securityEvents, onRefresh]);

  return (
    <div className="space-y-4">
      {/* Real-Time Status */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            Real-Time Compliance Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {monitoringData.map(data => (
              <div key={data.framework} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-white">{data.framework}</h4>
                  <Badge className={`${
                    data.trend === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                    data.trend === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  } text-xs`}>
                    {data.percentage}%
                  </Badge>
                </div>
                <Progress value={data.percentage} className="h-2 mb-2" />
                <div className="text-xs text-slate-500">
                  {data.compliant}/{data.total} requirements
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {data.effectiveControls}/{data.mappedControls} controls effective
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No active alerts</p>
                  </div>
                ) : (
                  alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        alert.type === 'critical' 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : 'bg-amber-500/10 border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                          alert.type === 'critical' ? 'text-red-400' : 'text-amber-400'
                        }`} />
                        <div className="flex-1">
                          {alert.framework && (
                            <Badge className="mb-1 text-xs">{alert.framework}</Badge>
                          )}
                          <p className="text-sm text-white">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Control Effectiveness Monitoring */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Control Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {controls.slice(0, 10).map(control => {
                  const effectiveness = control.effectiveness || 0;
                  const effectivenessPercentage = (effectiveness / 5) * 100;
                  return (
                    <div key={control.id} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-semibold text-white truncate flex-1">
                          {control.name}
                        </h5>
                        <Badge className={`${
                          effectiveness >= 4 ? 'bg-emerald-500/20 text-emerald-400' :
                          effectiveness >= 3 ? 'bg-blue-500/20 text-blue-400' :
                          effectiveness >= 2 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        } text-xs`}>
                          {effectiveness}/5
                        </Badge>
                      </div>
                      <Progress value={effectivenessPercentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}