import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Settings, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function NotificationPreferencesPanel({ userEmail }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: existingPrefs, isLoading } = useQuery({
    queryKey: ['notification-preferences', userEmail],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ user_email: userEmail });
      return prefs[0];
    },
    enabled: !!userEmail
  });

  useEffect(() => {
    if (existingPrefs) {
      setPreferences(existingPrefs);
    } else if (!isLoading) {
      // Set defaults
      setPreferences({
        user_email: userEmail,
        audit_upcoming: true,
        audit_upcoming_days: 7,
        risk_overdue: true,
        risk_review_due: true,
        risk_review_days: 14,
        control_review_due: true,
        control_implementation_due: true,
        control_due_days: 14,
        assessment_review_due: true,
        framework_compliance_change: true,
        ai_insights: true,
        ai_recommendations: true,
        import_export_operations: true,
        compliance_status_change: true,
        guidance_update: true,
        vendor_review_due: true,
        vendor_contract_expiring: true,
        vendor_contract_days: 60,
        vendor_risk_change: true,
        email_notifications: false,
        email_frequency: 'daily'
      });
    }
  }, [existingPrefs, isLoading, userEmail]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingPrefs) {
        return base44.entities.NotificationPreference.update(existingPrefs.id, data);
      } else {
        return base44.entities.NotificationPreference.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setHasChanges(false);
      toast.success('Notification preferences saved');
    },
    onError: () => {
      toast.error('Failed to save preferences');
    }
  });

  const handleChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  if (!preferences) {
    return <div className="text-center py-8 text-slate-400">Loading preferences...</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                Notification Preferences
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Configure when and how you want to be notified about critical events
              </p>
            </div>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || saveMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Email Notifications</h3>
            </div>
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">Enable Email Notifications</Label>
                  <p className="text-xs text-slate-400">Receive notifications via email</p>
                </div>
                <Switch 
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => handleChange('email_notifications', checked)}
                />
              </div>

              {preferences.email_notifications && (
                <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <Label className="text-sm text-white mb-2 block">Email Digest Frequency</Label>
                  <Select 
                    value={preferences.email_frequency}
                    onValueChange={(value) => handleChange('email_frequency', value)}
                  >
                    <SelectTrigger className="bg-[#1a2332] border-[#2a3548]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="immediate">Immediate (as events occur)</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400 mt-2">
                    {preferences.email_frequency === 'immediate' && '⚡ Get emails immediately when critical events occur'}
                    {preferences.email_frequency === 'daily' && '📧 Receive a daily summary of all notifications'}
                    {preferences.email_frequency === 'weekly' && '📬 Receive a weekly summary every Monday'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-[#2a3548]" />

          {/* Critical Events */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white">Critical Events</h3>
              <Badge className="bg-rose-500/20 text-rose-400 text-[10px]">Real-time</Badge>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">High-Priority Risks</Label>
                  <p className="text-xs text-slate-400">Risks with score ≥ 16/25</p>
                </div>
                <Switch 
                  checked={preferences.risk_overdue}
                  onCheckedChange={(checked) => handleChange('risk_overdue', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">Non-Compliance Alerts</Label>
                  <p className="text-xs text-slate-400">Items marked as non-compliant</p>
                </div>
                <Switch 
                  checked={preferences.compliance_status_change}
                  onCheckedChange={(checked) => handleChange('compliance_status_change', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">Failed Control Tests</Label>
                  <p className="text-xs text-slate-400">Control tests that have failed</p>
                </div>
                <Switch 
                  checked={preferences.control_review_due}
                  onCheckedChange={(checked) => handleChange('control_review_due', checked)}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3548]" />

          {/* Audit & Assessment */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Audit & Assessment</h3>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex-1">
                  <Label className="text-sm text-white">Upcoming Audits</Label>
                  <p className="text-xs text-slate-400">Alert me</p>
                </div>
                <Input 
                  type="number"
                  value={preferences.audit_upcoming_days}
                  onChange={(e) => handleChange('audit_upcoming_days', parseInt(e.target.value))}
                  className="w-16 h-8 bg-[#1a2332] border-[#2a3548] text-white text-sm"
                />
                <span className="text-xs text-slate-400 ml-2">days before</span>
                <Switch 
                  checked={preferences.audit_upcoming}
                  onCheckedChange={(checked) => handleChange('audit_upcoming', checked)}
                  className="ml-3"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">Assessment Reviews</Label>
                  <p className="text-xs text-slate-400">Due assessment reviews</p>
                </div>
                <Switch 
                  checked={preferences.assessment_review_due}
                  onCheckedChange={(checked) => handleChange('assessment_review_due', checked)}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3548]" />

          {/* Risk Management */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Risk Management</h3>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex-1">
                  <Label className="text-sm text-white">Risk Reviews</Label>
                  <p className="text-xs text-slate-400">Alert me</p>
                </div>
                <Input 
                  type="number"
                  value={preferences.risk_review_days}
                  onChange={(e) => handleChange('risk_review_days', parseInt(e.target.value))}
                  className="w-16 h-8 bg-[#1a2332] border-[#2a3548] text-white text-sm"
                />
                <span className="text-xs text-slate-400 ml-2">days before</span>
                <Switch 
                  checked={preferences.risk_review_due}
                  onCheckedChange={(checked) => handleChange('risk_review_due', checked)}
                  className="ml-3"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3548]" />

          {/* Control Management */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Control Management</h3>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex-1">
                  <Label className="text-sm text-white">Control Implementation</Label>
                  <p className="text-xs text-slate-400">Alert me</p>
                </div>
                <Input 
                  type="number"
                  value={preferences.control_due_days}
                  onChange={(e) => handleChange('control_due_days', parseInt(e.target.value))}
                  className="w-16 h-8 bg-[#1a2332] border-[#2a3548] text-white text-sm"
                />
                <span className="text-xs text-slate-400 ml-2">days before</span>
                <Switch 
                  checked={preferences.control_implementation_due}
                  onCheckedChange={(checked) => handleChange('control_implementation_due', checked)}
                  className="ml-3"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3548]" />

          {/* Vendor Management */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Vendor Management</h3>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">Vendor Reviews</Label>
                  <p className="text-xs text-slate-400">Upcoming vendor reviews</p>
                </div>
                <Switch 
                  checked={preferences.vendor_review_due}
                  onCheckedChange={(checked) => handleChange('vendor_review_due', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex-1">
                  <Label className="text-sm text-white">Contract Expiration</Label>
                  <p className="text-xs text-slate-400">Alert me</p>
                </div>
                <Input 
                  type="number"
                  value={preferences.vendor_contract_days}
                  onChange={(e) => handleChange('vendor_contract_days', parseInt(e.target.value))}
                  className="w-16 h-8 bg-[#1a2332] border-[#2a3548] text-white text-sm"
                />
                <span className="text-xs text-slate-400 ml-2">days before</span>
                <Switch 
                  checked={preferences.vendor_contract_expiring}
                  onCheckedChange={(checked) => handleChange('vendor_contract_expiring', checked)}
                  className="ml-3"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">Risk Score Changes</Label>
                  <p className="text-xs text-slate-400">Critical vendor risk changes</p>
                </div>
                <Switch 
                  checked={preferences.vendor_risk_change}
                  onCheckedChange={(checked) => handleChange('vendor_risk_change', checked)}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a3548]" />

          {/* AI & System Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">AI & System</h3>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">AI Insights</Label>
                  <p className="text-xs text-slate-400">AI-generated insights and analysis</p>
                </div>
                <Switch 
                  checked={preferences.ai_insights}
                  onCheckedChange={(checked) => handleChange('ai_insights', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">AI Recommendations</Label>
                  <p className="text-xs text-slate-400">AI-powered recommendations</p>
                </div>
                <Switch 
                  checked={preferences.ai_recommendations}
                  onCheckedChange={(checked) => handleChange('ai_recommendations', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">Import/Export Operations</Label>
                  <p className="text-xs text-slate-400">Success/failure notifications</p>
                </div>
                <Switch 
                  checked={preferences.import_export_operations}
                  onCheckedChange={(checked) => handleChange('import_export_operations', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">Framework Compliance Changes</Label>
                  <p className="text-xs text-slate-400">Status changes in compliance frameworks</p>
                </div>
                <Switch 
                  checked={preferences.framework_compliance_change}
                  onCheckedChange={(checked) => handleChange('framework_compliance_change', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div>
                  <Label className="text-sm text-white">Guidance Updates</Label>
                  <p className="text-xs text-slate-400">New guidance library updates</p>
                </div>
                <Switch 
                  checked={preferences.guidance_update}
                  onCheckedChange={(checked) => handleChange('guidance_update', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="bg-indigo-600 border-indigo-500 shadow-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-white" />
              <p className="text-sm text-white">You have unsaved changes</p>
              <Button 
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-white text-indigo-600 hover:bg-slate-100"
              >
                Save Now
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}