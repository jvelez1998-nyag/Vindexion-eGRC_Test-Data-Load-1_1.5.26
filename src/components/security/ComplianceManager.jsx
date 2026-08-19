import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Trash2, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ComplianceManager() {
  const [retentionPeriod, setRetentionPeriod] = useState(90);
  const [autoDelete, setAutoDelete] = useState(false);
  const [consentTracking, setConsentTracking] = useState(true);
  const [dataMinimization, setDataMinimization] = useState(true);

  const saveSettings = () => {
    localStorage.setItem('data_retention_days', retentionPeriod.toString());
    localStorage.setItem('auto_delete_enabled', autoDelete.toString());
    localStorage.setItem('consent_tracking', consentTracking.toString());
    localStorage.setItem('data_minimization', dataMinimization.toString());
    toast.success("Compliance settings saved");
  };

  const executeRightToErasure = () => {
    if (confirm("This will permanently delete all user data. Continue?")) {
      // In production, this would call backend API
      toast.success("Data erasure request queued");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            Data Retention Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-slate-400">Retention Period (days)</Label>
            <Input
              type="number"
              value={retentionPeriod}
              onChange={(e) => setRetentionPeriod(parseInt(e.target.value) || 0)}
              className="bg-[#0f1623] border-[#2a3548] text-white mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Data older than {retentionPeriod} days will be flagged for deletion
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-white">Auto-Delete Old Data</Label>
              <p className="text-xs text-slate-500">Automatically delete expired data</p>
            </div>
            <Switch checked={autoDelete} onCheckedChange={setAutoDelete} />
          </div>

          <Button onClick={saveSettings} className="w-full bg-blue-600 hover:bg-blue-700">
            Save Retention Policy
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            GDPR Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-white">Consent Tracking</Label>
              <p className="text-xs text-slate-500">Track user consent for data processing</p>
            </div>
            <Switch checked={consentTracking} onCheckedChange={setConsentTracking} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-white">Data Minimization</Label>
              <p className="text-xs text-slate-500">Collect only necessary data</p>
            </div>
            <Switch checked={dataMinimization} onCheckedChange={setDataMinimization} />
          </div>

          <div className="pt-2 border-t border-[#2a3548]">
            <Button 
              onClick={executeRightToErasure} 
              variant="outline" 
              className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Execute Right to Erasure
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm">Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-400">Data Encryption</p>
              <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 text-xs">Active</Badge>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-400">Audit Logging</p>
              <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 text-xs">Active</Badge>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-400 mb-2" />
              <p className="text-xs text-slate-400">MFA Enforcement</p>
              <Badge className="mt-1 bg-amber-500/20 text-amber-400 text-xs">Optional</Badge>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-400">Access Controls</p>
              <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 text-xs">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}