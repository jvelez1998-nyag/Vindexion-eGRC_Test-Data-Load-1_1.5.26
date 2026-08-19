import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function PersonalizedRiskAlerts({ data }) {
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;

    const generateAlerts = () => {
      const newAlerts = [];

      // High-risk items alert
      const criticalRisks = data.risks.filter(r => 
        ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 16
      );
      if (criticalRisks.length > 0) {
        newAlerts.push({
          id: 'critical-risks',
          type: 'critical',
          title: `${criticalRisks.length} Critical Risks Require Attention`,
          message: `You have ${criticalRisks.length} risks with severity ≥16 that need immediate review`,
          action: 'Review Risks',
          priority: 'high'
        });
      }

      // Control testing overdue
      const overdueControls = data.controls.filter(c => {
        if (!c.last_test_date) return true;
        const daysSinceTest = Math.floor((new Date() - new Date(c.last_test_date)) / (1000 * 60 * 60 * 24));
        return daysSinceTest > 90;
      });
      if (overdueControls.length > 0) {
        newAlerts.push({
          id: 'overdue-controls',
          type: 'warning',
          title: `${overdueControls.length} Controls Require Testing`,
          message: `Control testing is overdue for ${overdueControls.length} controls (>90 days)`,
          action: 'Schedule Tests',
          priority: 'medium'
        });
      }

      // Compliance gaps
      const nonCompliant = data.compliance.filter(c => 
        c.compliance_status === 'non_compliant' || c.compliance_status === 'partially_compliant'
      );
      if (nonCompliant.length > 0) {
        newAlerts.push({
          id: 'compliance-gaps',
          type: 'critical',
          title: `${nonCompliant.length} Compliance Requirements At Risk`,
          message: `Action needed on non-compliant or partially compliant requirements`,
          action: 'View Compliance',
          priority: 'high'
        });
      }

      // Recent high-severity incidents
      const recentIncidents = data.incidents.filter(i => {
        const daysAgo = Math.floor((new Date() - new Date(i.occurrence_date)) / (1000 * 60 * 60 * 24));
        return daysAgo <= 30 && (i.severity === 'critical' || i.severity === 'high');
      });
      if (recentIncidents.length > 0) {
        newAlerts.push({
          id: 'recent-incidents',
          type: 'warning',
          title: `${recentIncidents.length} Recent High-Severity Incidents`,
          message: `Review and learn from ${recentIncidents.length} incidents in the past 30 days`,
          action: 'Review Incidents',
          priority: 'medium'
        });
      }

      // High-risk vendors
      const highRiskVendors = data.vendors.filter(v => 
        v.criticality === 'critical' || v.criticality === 'high'
      ).filter(v => {
        if (!v.last_assessment_date) return true;
        const daysSinceAssessment = Math.floor((new Date() - new Date(v.last_assessment_date)) / (1000 * 60 * 60 * 24));
        return daysSinceAssessment > 180;
      });
      if (highRiskVendors.length > 0) {
        newAlerts.push({
          id: 'vendor-assessments',
          type: 'info',
          title: `${highRiskVendors.length} Critical Vendors Need Assessment`,
          message: `High-criticality vendors haven't been assessed in >6 months`,
          action: 'Schedule Assessments',
          priority: 'medium'
        });
      }

      // Pending audits
      const upcomingAudits = data.audits.filter(a => {
        if (!a.due_date || a.status === 'completed') return false;
        const daysUntilDue = Math.floor((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 30 && daysUntilDue >= 0;
      });
      if (upcomingAudits.length > 0) {
        newAlerts.push({
          id: 'upcoming-audits',
          type: 'info',
          title: `${upcomingAudits.length} Audits Due Within 30 Days`,
          message: `Prepare for upcoming audits and ensure all evidence is ready`,
          action: 'View Audits',
          priority: 'high'
        });
      }

      setAlerts(newAlerts);
    };

    generateAlerts();
  }, [data, user]);

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
    toast.success("Alert dismissed");
  };

  const priorityColors = {
    high: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
    medium: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    low: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
  };

  const typeIcons = {
    critical: AlertTriangle,
    warning: AlertTriangle,
    info: Bell
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-400" />
          Personalized Risk Alerts
          {alerts.length > 0 && (
            <Badge className="bg-rose-500/20 text-rose-400 ml-2">{alerts.length} Active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No active alerts - your risk posture looks good!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => {
              const Icon = typeIcons[alert.type];
              return (
                <Card key={alert.id} className={`bg-gradient-to-br ${priorityColors[alert.priority]}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-black/20">
                        <Icon className={`h-4 w-4 ${
                          alert.type === 'critical' ? 'text-rose-400' :
                          alert.type === 'warning' ? 'text-amber-400' :
                          'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-1">{alert.title}</h4>
                            <p className="text-xs text-slate-300">{alert.message}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dismissAlert(alert.id)}
                            className="h-6 w-6 text-slate-400 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button size="sm" className="mt-2 h-7 text-xs bg-white/10 hover:bg-white/20">
                          {alert.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}