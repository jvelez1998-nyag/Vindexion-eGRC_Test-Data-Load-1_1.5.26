import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function KRIForm({ kri, risks, controls, onClose, onSave }) {
  const [formData, setFormData] = useState(kri || {
    name: "",
    indicator_type: "kri",
    description: "",
    metric: "",
    unit: "",
    current_value: 0,
    target_value: 0,
    threshold_green: 0,
    threshold_amber: 0,
    threshold_red: 0,
    direction: "lower_better",
    frequency: "monthly",
    data_source: "",
    calculation_method: "",
    linked_risks: [],
    linked_controls: [],
    owner: "",
    alert_enabled: true,
    alert_recipients: [],
    status: "active"
  });

  const [selectedRisks, setSelectedRisks] = useState(kri?.linked_risks || []);
  const [selectedControls, setSelectedControls] = useState(kri?.linked_controls || []);
  const [alertEmail, setAlertEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        linked_risks: selectedRisks,
        linked_controls: selectedControls,
        traffic_light_status: calculateStatus(formData.current_value)
      };

      if (kri?.id) {
        await base44.entities.KeyIndicator.update(kri.id, data);
        toast.success("KRI updated successfully");
      } else {
        await base44.entities.KeyIndicator.create(data);
        toast.success("KRI created successfully");
      }
      onSave();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save KRI");
    }
  };

  const calculateStatus = (value) => {
    const { threshold_green, threshold_amber, threshold_red, direction } = formData;
    if (direction === "lower_better") {
      if (value <= threshold_green) return "green";
      if (value <= threshold_amber) return "amber";
      return "red";
    } else {
      if (value >= threshold_green) return "green";
      if (value >= threshold_amber) return "amber";
      return "red";
    }
  };

  const addAlertRecipient = () => {
    if (alertEmail && !formData.alert_recipients?.includes(alertEmail)) {
      setFormData({
        ...formData,
        alert_recipients: [...(formData.alert_recipients || []), alertEmail]
      });
      setAlertEmail("");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a2332] border-[#2a3548] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{kri ? "Edit" : "Add"} Key Indicator</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-[#0f1623] border-[#2a3548] text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-400">Type *</Label>
              <Select value={formData.indicator_type} onValueChange={(value) => setFormData({...formData, indicator_type: value})}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kri">KRI (Risk)</SelectItem>
                  <SelectItem value="kci">KCI (Control)</SelectItem>
                  <SelectItem value="kpi">KPI (Performance)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-slate-400">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-[#0f1623] border-[#2a3548] text-white"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Metric *</Label>
              <Input
                value={formData.metric}
                onChange={(e) => setFormData({...formData, metric: e.target.value})}
                placeholder="e.g., Number of incidents"
                className="bg-[#0f1623] border-[#2a3548] text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-400">Unit</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="e.g., count, %, $"
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Current Value</Label>
              <Input
                type="number"
                value={formData.current_value}
                onChange={(e) => setFormData({...formData, current_value: parseFloat(e.target.value)})}
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <div>
              <Label className="text-slate-400">Target Value</Label>
              <Input
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData({...formData, target_value: parseFloat(e.target.value)})}
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548] space-y-3">
            <Label className="text-white">Thresholds</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-emerald-400 text-xs">Green (Safe)</Label>
                <Input
                  type="number"
                  value={formData.threshold_green}
                  onChange={(e) => setFormData({...formData, threshold_green: parseFloat(e.target.value)})}
                  className="bg-[#1a2332] border-emerald-500/30 text-white"
                />
              </div>
              <div>
                <Label className="text-amber-400 text-xs">Amber (Warning)</Label>
                <Input
                  type="number"
                  value={formData.threshold_amber}
                  onChange={(e) => setFormData({...formData, threshold_amber: parseFloat(e.target.value)})}
                  className="bg-[#1a2332] border-amber-500/30 text-white"
                />
              </div>
              <div>
                <Label className="text-rose-400 text-xs">Red (Critical)</Label>
                <Input
                  type="number"
                  value={formData.threshold_red}
                  onChange={(e) => setFormData({...formData, threshold_red: parseFloat(e.target.value)})}
                  className="bg-[#1a2332] border-rose-500/30 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-400 text-xs">Direction</Label>
              <Select value={formData.direction} onValueChange={(value) => setFormData({...formData, direction: value})}>
                <SelectTrigger className="bg-[#1a2332] border-[#2a3548]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lower_better">Lower is Better</SelectItem>
                  <SelectItem value="higher_better">Higher is Better</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">Data Source</Label>
              <Input
                value={formData.data_source}
                onChange={(e) => setFormData({...formData, data_source: e.target.value})}
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-400">Calculation Method</Label>
            <Textarea
              value={formData.calculation_method}
              onChange={(e) => setFormData({...formData, calculation_method: e.target.value})}
              className="bg-[#0f1623] border-[#2a3548] text-white"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Linked Risks</Label>
            <Select onValueChange={(value) => !selectedRisks.includes(value) && setSelectedRisks([...selectedRisks, value])}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                <SelectValue placeholder="Select risks..." />
              </SelectTrigger>
              <SelectContent>
                {risks.map(risk => (
                  <SelectItem key={risk.id} value={risk.id}>{risk.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedRisks.map(riskId => {
                const risk = risks.find(r => r.id === riskId);
                return risk ? (
                  <Badge key={riskId} className="bg-rose-500/20 text-rose-400">
                    {risk.title}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedRisks(selectedRisks.filter(id => id !== riskId))} />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Linked Controls</Label>
            <Select onValueChange={(value) => !selectedControls.includes(value) && setSelectedControls([...selectedControls, value])}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                <SelectValue placeholder="Select controls..." />
              </SelectTrigger>
              <SelectContent>
                {controls.map(control => (
                  <SelectItem key={control.id} value={control.id}>{control.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedControls.map(controlId => {
                const control = controls.find(c => c.id === controlId);
                return control ? (
                  <Badge key={controlId} className="bg-blue-500/20 text-blue-400">
                    {control.name}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedControls(selectedControls.filter(id => id !== controlId))} />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0f1623] rounded-lg">
            <Label className="text-slate-400">Enable Threshold Alerts</Label>
            <Switch
              checked={formData.alert_enabled}
              onCheckedChange={(checked) => setFormData({...formData, alert_enabled: checked})}
            />
          </div>

          {formData.alert_enabled && (
            <div>
              <Label className="text-slate-400">Alert Recipients</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="Email address"
                  className="bg-[#0f1623] border-[#2a3548] text-white"
                />
                <Button type="button" onClick={addAlertRecipient}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.alert_recipients?.map((email, idx) => (
                  <Badge key={idx} className="bg-indigo-500/20 text-indigo-400">
                    {email}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setFormData({
                      ...formData,
                      alert_recipients: formData.alert_recipients.filter((_, i) => i !== idx)
                    })} />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600">
              {kri ? "Update" : "Create"} KRI
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}