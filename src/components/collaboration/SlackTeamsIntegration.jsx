import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slack, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function SlackTeamsIntegration({ entityType, entityId, entityName, eventType }) {
  const [enabled, setEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channel, setChannel] = useState("");
  const [notifyOn, setNotifyOn] = useState({
    comments: true,
    status_change: true,
    assignments: true,
    ai_insights: false
  });
  const [sending, setSending] = useState(false);

  const testNotification = async () => {
    if (!webhookUrl) {
      toast.error("Please configure webhook URL first");
      return;
    }

    setSending(true);
    try {
      const message = {
        text: `🔔 Test notification from Vindexion eGRC Hub™`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Test Notification"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Testing integration for *${entityType}*: ${entityName}`
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Entity Type:*\n${entityType}`
              },
              {
                type: "mrkdwn",
                text: `*Entity Name:*\n${entityName}`
              }
            ]
          }
        ]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        toast.success("Test notification sent successfully");
      } else {
        toast.error("Failed to send notification");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const sendNotification = async (event, data) => {
    if (!enabled || !webhookUrl) return;

    try {
      let message = {};
      
      if (event === 'comment') {
        message = {
          text: `💬 New comment on ${entityType}`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `💬 New Comment`
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${entityType}:* ${entityName}\n*From:* ${data.author}\n*Comment:* ${data.comment}`
              }
            }
          ]
        };
      } else if (event === 'status_change') {
        message = {
          text: `📊 Status changed for ${entityType}`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "📊 Status Update"
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${entityType}:* ${entityName}\n*Status:* ${data.oldStatus} → ${data.newStatus}`
              }
            }
          ]
        };
      } else if (event === 'assignment') {
        message = {
          text: `👤 Task assigned`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "👤 New Assignment"
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${entityType}:* ${entityName}\n*Assigned to:* ${data.assignee}\n*Due:* ${data.dueDate}`
              }
            }
          ]
        };
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.error("Failed to send Slack notification", error);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Slack className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-sm">Slack/Teams Integration</CardTitle>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </CardHeader>
      <CardContent>
        {!enabled ? (
          <p className="text-xs text-slate-500 text-center py-4">Enable to configure notifications</p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-slate-400">Webhook URL</Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="bg-[#0f1623] border-[#2a3548] text-white mt-1"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Get from Slack: Workspace Settings → Apps → Incoming Webhooks
              </p>
            </div>

            <div>
              <Label className="text-xs text-slate-400">Channel (optional)</Label>
              <Input
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="#grc-notifications"
                className="bg-[#0f1623] border-[#2a3548] text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Notify On</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-[#0f1623] rounded">
                  <span className="text-xs text-white">New Comments</span>
                  <Switch
                    checked={notifyOn.comments}
                    onCheckedChange={(checked) => setNotifyOn({...notifyOn, comments: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0f1623] rounded">
                  <span className="text-xs text-white">Status Changes</span>
                  <Switch
                    checked={notifyOn.status_change}
                    onCheckedChange={(checked) => setNotifyOn({...notifyOn, status_change: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0f1623] rounded">
                  <span className="text-xs text-white">Task Assignments</span>
                  <Switch
                    checked={notifyOn.assignments}
                    onCheckedChange={(checked) => setNotifyOn({...notifyOn, assignments: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0f1623] rounded">
                  <span className="text-xs text-white">AI Insights</span>
                  <Switch
                    checked={notifyOn.ai_insights}
                    onCheckedChange={(checked) => setNotifyOn({...notifyOn, ai_insights: checked})}
                  />
                </div>
              </div>
            </div>

            <Button onClick={testNotification} disabled={sending || !webhookUrl} className="w-full">
              {sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-2" />
                  Send Test Notification
                </>
              )}
            </Button>

            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400">
              <CheckCircle2 className="h-3 w-3 inline mr-1" />
              Configured for {entityType}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}