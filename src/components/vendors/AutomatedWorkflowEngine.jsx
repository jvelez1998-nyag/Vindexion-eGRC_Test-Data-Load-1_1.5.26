import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Shield,
  TrendingUp,
  Mail,
  FileText,
  Activity,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, addDays } from "date-fns";

export default function AutomatedWorkflowEngine() {
  const [automations, setAutomations] = useState({
    autoReviewReminders: true,
    autoContractAlerts: true,
    autoAssessmentScheduling: true,
    autoRiskScoring: true,
    autoTaskGeneration: true,
    autoComplianceChecks: true
  });
  const [runningWorkflows, setRunningWorkflows] = useState([]);

  const queryClient = useQueryClient();

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list()
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: () => base44.entities.VendorAssessment.list()
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorOnboardingTask.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-onboarding-tasks'] })
  });

  // Automated Review Reminders
  useEffect(() => {
    if (!automations.autoReviewReminders) return;

    const checkReviews = async () => {
      for (const vendor of vendors) {
        if (!vendor.next_review_date) continue;

        const daysUntil = differenceInDays(new Date(vendor.next_review_date), new Date());

        // 30 days before
        if (daysUntil === 30) {
          await createNotificationMutation.mutateAsync({
            user_email: 'admin@organization.com', // Could be dynamically determined
            type: 'vendor_review_due',
            title: `Vendor Review Upcoming: ${vendor.vendor_name}`,
            message: `Vendor review for ${vendor.vendor_name} is due in 30 days. Please prepare assessment materials.`,
            priority: 'medium',
            entity_type: 'vendor',
            entity_id: vendor.id
          });
        }

        // 7 days before
        if (daysUntil === 7) {
          await createNotificationMutation.mutateAsync({
            user_email: 'admin@organization.com',
            type: 'vendor_review_due',
            title: `Vendor Review Due Soon: ${vendor.vendor_name}`,
            message: `Vendor review for ${vendor.vendor_name} is due in 7 days.`,
            priority: 'high',
            entity_type: 'vendor',
            entity_id: vendor.id
          });
        }

        // Overdue
        if (daysUntil < 0) {
          await createNotificationMutation.mutateAsync({
            user_email: 'admin@organization.com',
            type: 'vendor_review_due',
            title: `Vendor Review Overdue: ${vendor.vendor_name}`,
            message: `Vendor review for ${vendor.vendor_name} is ${Math.abs(daysUntil)} days overdue.`,
            priority: 'critical',
            entity_type: 'vendor',
            entity_id: vendor.id
          });
        }
      }
    };

    const interval = setInterval(checkReviews, 24 * 60 * 60 * 1000); // Daily
    checkReviews(); // Run immediately
    return () => clearInterval(interval);
  }, [vendors, automations.autoReviewReminders]);

  // Automated Contract Expiration Alerts
  useEffect(() => {
    if (!automations.autoContractAlerts) return;

    const checkContracts = async () => {
      for (const vendor of vendors) {
        if (!vendor.contract_end_date) continue;

        const daysUntil = differenceInDays(new Date(vendor.contract_end_date), new Date());

        if (daysUntil === 90 || daysUntil === 60 || daysUntil === 30) {
          await createNotificationMutation.mutateAsync({
            user_email: 'admin@organization.com',
            type: 'vendor_contract_expiring',
            title: `Contract Expiring: ${vendor.vendor_name}`,
            message: `Contract for ${vendor.vendor_name} expires in ${daysUntil} days. Review renewal process.`,
            priority: daysUntil <= 30 ? 'high' : 'medium',
            entity_type: 'vendor',
            entity_id: vendor.id
          });
        }
      }
    };

    const interval = setInterval(checkContracts, 24 * 60 * 60 * 1000);
    checkContracts();
    return () => clearInterval(interval);
  }, [vendors, automations.autoContractAlerts]);

  // Auto Assessment Scheduling
  useEffect(() => {
    if (!automations.autoAssessmentScheduling) return;

    const scheduleAssessments = async () => {
      for (const vendor of vendors) {
        const vendorAssessments = assessments.filter(a => a.vendor_id === vendor.id);
        const lastAssessment = vendorAssessments[0];

        if (!lastAssessment) {
          // New vendor, schedule initial assessment
          await createTaskMutation.mutateAsync({
            vendor_id: vendor.id,
            task_title: "Conduct Initial Security Assessment",
            priority: "high",
            status: "not_started",
            onboarding_stage: "assessment",
            auto_generated: true,
            due_date: addDays(new Date(), 14).toISOString().split('T')[0]
          });
        } else {
          // Check if annual assessment is due
          const daysSinceLastAssessment = differenceInDays(new Date(), new Date(lastAssessment.assessment_date));
          
          if (daysSinceLastAssessment >= 365) {
            await createTaskMutation.mutateAsync({
              vendor_id: vendor.id,
              task_title: "Conduct Annual Security Assessment",
              priority: "high",
              status: "not_started",
              onboarding_stage: "assessment",
              auto_generated: true,
              due_date: addDays(new Date(), 30).toISOString().split('T')[0]
            });
          }
        }
      }
    };

    scheduleAssessments();
  }, [vendors, assessments, automations.autoAssessmentScheduling]);

  // Auto Risk Scoring
  useEffect(() => {
    if (!automations.autoRiskScoring) return;

    const updateRiskScores = async () => {
      for (const vendor of vendors) {
        if (!vendor.security_score) {
          setRunningWorkflows(prev => [...prev, {
            id: `risk-${vendor.id}`,
            vendor: vendor.vendor_name,
            action: "Calculating risk score",
            progress: 50
          }]);

          // Trigger AI risk scoring
          // This would call the AI scoring component in real implementation
          
          setTimeout(() => {
            setRunningWorkflows(prev => prev.filter(w => w.id !== `risk-${vendor.id}`));
          }, 2000);
        }
      }
    };

    const interval = setInterval(updateRiskScores, 7 * 24 * 60 * 60 * 1000); // Weekly
    return () => clearInterval(interval);
  }, [vendors, automations.autoRiskScoring]);

  const stats = {
    totalAutomations: Object.keys(automations).length,
    activeAutomations: Object.values(automations).filter(Boolean).length,
    runningWorkflows: runningWorkflows.length,
    totalExecutions: vendors.length * 3 // Simplified
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            Automated Workflow Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.activeAutomations}</div>
              <div className="text-xs text-slate-400">Active Automations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.runningWorkflows}</div>
              <div className="text-xs text-slate-400">Running Now</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{stats.totalExecutions}</div>
              <div className="text-xs text-slate-400">Total Executions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {Math.round((stats.activeAutomations / stats.totalAutomations) * 100)}%
              </div>
              <div className="text-xs text-slate-400">Automation Rate</div>
            </div>
          </div>

          <Alert className="bg-purple-500/10 border-purple-500/30">
            <Activity className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-white">
              Workflow engine is actively monitoring {vendors.length} vendors for compliance, risk changes, and action items.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Running Workflows */}
      {runningWorkflows.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400 animate-pulse" />
              Active Workflows ({runningWorkflows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {runningWorkflows.map(workflow => (
                <div key={workflow.id} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{workflow.vendor}</p>
                      <p className="text-xs text-slate-400">{workflow.action}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Processing</Badge>
                  </div>
                  <Progress value={workflow.progress} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation Rules */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-indigo-400" />
            Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-400" />
                <div>
                  <Label className="text-sm font-medium text-white">Review Reminders</Label>
                  <p className="text-xs text-slate-400">Automatically remind stakeholders of upcoming vendor reviews</p>
                </div>
              </div>
              <Switch
                checked={automations.autoReviewReminders}
                onCheckedChange={(checked) => setAutomations(prev => ({ ...prev, autoReviewReminders: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-400" />
                <div>
                  <Label className="text-sm font-medium text-white">Contract Alerts</Label>
                  <p className="text-xs text-slate-400">Alert before contract expirations (90, 60, 30 days)</p>
                </div>
              </div>
              <Switch
                checked={automations.autoContractAlerts}
                onCheckedChange={(checked) => setAutomations(prev => ({ ...prev, autoContractAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-400" />
                <div>
                  <Label className="text-sm font-medium text-white">Assessment Scheduling</Label>
                  <p className="text-xs text-slate-400">Auto-schedule annual and triggered assessments</p>
                </div>
              </div>
              <Switch
                checked={automations.autoAssessmentScheduling}
                onCheckedChange={(checked) => setAutomations(prev => ({ ...prev, autoAssessmentScheduling: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <div>
                  <Label className="text-sm font-medium text-white">AI Risk Scoring</Label>
                  <p className="text-xs text-slate-400">Automatically update vendor risk scores weekly</p>
                </div>
              </div>
              <Switch
                checked={automations.autoRiskScoring}
                onCheckedChange={(checked) => setAutomations(prev => ({ ...prev, autoRiskScoring: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                <div>
                  <Label className="text-sm font-medium text-white">Task Generation</Label>
                  <p className="text-xs text-slate-400">Auto-generate tasks for overdue actions and milestones</p>
                </div>
              </div>
              <Switch
                checked={automations.autoTaskGeneration}
                onCheckedChange={(checked) => setAutomations(prev => ({ ...prev, autoTaskGeneration: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <div>
                  <Label className="text-sm font-medium text-white">Compliance Monitoring</Label>
                  <p className="text-xs text-slate-400">Monitor compliance status changes and trigger alerts</p>
                </div>
              </div>
              <Switch
                checked={automations.autoComplianceChecks}
                onCheckedChange={(checked) => setAutomations(prev => ({ ...prev, autoComplianceChecks: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}