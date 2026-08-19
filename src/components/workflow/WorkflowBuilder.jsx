import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, Zap, Settings, Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WorkflowBuilder({ open, onOpenChange, workflow, onSubmit, users, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'high_probability_risk',
    trigger_conditions: {},
    action_type: 'create_task',
    action_config: {},
    priority_level: 'high',
    auto_assign_to: '',
    notification_emails: [],
    is_enabled: true
  });

  const [emailInput, setEmailInput] = useState('');
  const [conditionKey, setConditionKey] = useState('');
  const [conditionValue, setConditionValue] = useState('');

  useEffect(() => {
    if (workflow) {
      setFormData({
        name: workflow.name || '',
        description: workflow.description || '',
        trigger_type: workflow.trigger_type || 'high_probability_risk',
        trigger_conditions: workflow.trigger_conditions || {},
        action_type: workflow.action_type || 'create_task',
        action_config: workflow.action_config || {},
        priority_level: workflow.priority_level || 'high',
        auto_assign_to: workflow.auto_assign_to || '',
        notification_emails: workflow.notification_emails || [],
        is_enabled: workflow.is_enabled !== false
      });
    }
  }, [workflow, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addEmail = () => {
    if (emailInput && !formData.notification_emails.includes(emailInput)) {
      setFormData({ ...formData, notification_emails: [...formData.notification_emails, emailInput] });
      setEmailInput('');
    }
  };

  const removeEmail = (email) => {
    setFormData({ ...formData, notification_emails: formData.notification_emails.filter(e => e !== email) });
  };

  const addCondition = () => {
    if (conditionKey && conditionValue) {
      setFormData({
        ...formData,
        trigger_conditions: { ...formData.trigger_conditions, [conditionKey]: conditionValue }
      });
      setConditionKey('');
      setConditionValue('');
    }
  };

  const removeCondition = (key) => {
    const { [key]: removed, ...rest } = formData.trigger_conditions;
    setFormData({ ...formData, trigger_conditions: rest });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            {workflow ? 'Edit Workflow' : 'Build New Workflow'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="trigger">Trigger</TabsTrigger>
              <TabsTrigger value="action">Action</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px]">
              <TabsContent value="basic" className="px-6 space-y-4 mt-4">
                <div>
                  <Label className="text-slate-400">Workflow Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label className="text-slate-400">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5 h-24"
                    placeholder="Describe what this workflow does..."
                  />
                </div>

                <div>
                  <Label className="text-slate-400">Priority Level</Label>
                  <Select value={formData.priority_level} onValueChange={(value) => setFormData({ ...formData, priority_level: value })}>
                    <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="low" className="text-white">Low</SelectItem>
                      <SelectItem value="medium" className="text-white">Medium</SelectItem>
                      <SelectItem value="high" className="text-white">High</SelectItem>
                      <SelectItem value="critical" className="text-white">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="trigger" className="px-6 space-y-4 mt-4">
                <div>
                  <Label className="text-slate-400">Trigger Event *</Label>
                  <Select value={formData.trigger_type} onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}>
                    <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="high_probability_risk" className="text-white">High Probability Risk</SelectItem>
                      <SelectItem value="critical_knowledge_gap" className="text-white">Critical Knowledge Gap</SelectItem>
                      <SelectItem value="control_failure" className="text-white">Control Failure</SelectItem>
                      <SelectItem value="compliance_breach" className="text-white">Compliance Breach</SelectItem>
                      <SelectItem value="critical_finding" className="text-white">Critical Finding</SelectItem>
                      <SelectItem value="emerging_risk" className="text-white">Emerging Risk</SelectItem>
                      <SelectItem value="predicted_incident" className="text-white">Predicted Incident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-400 mb-3 block">Trigger Conditions (Optional)</Label>
                  <Card className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="Condition key (e.g., severity)"
                          value={conditionKey}
                          onChange={(e) => setConditionKey(e.target.value)}
                          className="bg-[#151d2e] border-[#2a3548] text-white flex-1"
                        />
                        <Input
                          placeholder="Value (e.g., critical)"
                          value={conditionValue}
                          onChange={(e) => setConditionValue(e.target.value)}
                          className="bg-[#151d2e] border-[#2a3548] text-white flex-1"
                        />
                        <Button type="button" onClick={addCondition} size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(formData.trigger_conditions || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                            <span className="text-sm text-slate-300">
                              <span className="text-purple-400">{key}</span> = {String(value)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCondition(key)}
                              className="h-6 w-6 text-slate-400 hover:text-rose-400"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <p className="text-xs text-slate-500 mt-2">Example: severity = critical, probability &gt; 70</p>
                </div>
              </TabsContent>

              <TabsContent value="action" className="px-6 space-y-4 mt-4">
                <div>
                  <Label className="text-slate-400">Action Type *</Label>
                  <Select value={formData.action_type} onValueChange={(value) => setFormData({ ...formData, action_type: value })}>
                    <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="create_task" className="text-white">Create Task</SelectItem>
                      <SelectItem value="initiate_assessment" className="text-white">Initiate Assessment</SelectItem>
                      <SelectItem value="assign_review" className="text-white">Assign Review</SelectItem>
                      <SelectItem value="send_notification" className="text-white">Send Notification</SelectItem>
                      <SelectItem value="create_documentation_request" className="text-white">Create Documentation Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-400">Auto-assign To</Label>
                  <Select value={formData.auto_assign_to} onValueChange={(value) => setFormData({ ...formData, auto_assign_to: value })}>
                    <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white mt-1.5">
                      <SelectValue placeholder="Select user..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value={null} className="text-white">Unassigned</SelectItem>
                      {users?.map(user => (
                        <SelectItem key={user.id} value={user.email} className="text-white">
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">Leave empty for manual assignment</p>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="px-6 space-y-4 mt-4">
                <div>
                  <Label className="text-slate-400 mb-3 block flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </Label>
                  <Card className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex gap-2 mb-3">
                        <Input
                          type="email"
                          placeholder="user@example.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
                          className="bg-[#151d2e] border-[#2a3548] text-white"
                        />
                        <Button type="button" onClick={addEmail} size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.notification_emails.map((email, idx) => (
                          <Badge key={idx} className="bg-[#151d2e] text-slate-300 border-[#2a3548] gap-1">
                            {email}
                            <X className="h-3 w-3 cursor-pointer hover:text-rose-400" onClick={() => removeEmail(email)} />
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <p className="text-xs text-slate-500 mt-2">Add email addresses to notify when workflow is triggered</p>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex items-center justify-between p-6 pt-4 border-t border-[#2a3548]">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
              />
              <Label className="text-slate-400">Enable workflow immediately</Label>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#2a3548]">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                {workflow ? 'Update' : 'Create'} Workflow
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}