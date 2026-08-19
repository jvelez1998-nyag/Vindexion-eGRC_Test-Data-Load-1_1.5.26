import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { generateBRD } from "./FeatureExporter";
import { base44 } from "@/api/base44Client";

export default function BRDModeDialog({ open, onOpenChange, features }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: "",
    projectName: "Vindexion eGRC Hub™ Implementation",
    companyName: "",
    includeSummary: true,
    includeMetrics: true,
    includeSignoff: true,
    customNotes: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Get current user email
      const user = await base44.auth.me();
      
      await generateBRD(features, formData.recipientEmail, {
        projectName: formData.projectName,
        companyName: formData.companyName,
        senderEmail: user?.email,
        includeSummary: formData.includeSummary,
        includeMetrics: formData.includeMetrics,
        includeSignoff: formData.includeSignoff,
        customNotes: formData.customNotes
      });

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setFormData({
          recipientEmail: "",
          projectName: "Vindexion eGRC Hub™ Implementation",
          companyName: "",
          includeSummary: true,
          includeMetrics: true,
          includeSignoff: true,
          customNotes: ""
        });
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2332] border-[#2a3548] max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <FileText className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-white">BRD Mode - Generate Business Requirements Document</DialogTitle>
              <DialogDescription>
                Create and email a professionally formatted BRD with all platform features
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientEmail" className="text-white">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                required
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                placeholder="stakeholder@company.com"
                className="bg-[#0f1623] border-[#2a3548] text-white mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectName" className="text-white">Project Name</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="bg-[#0f1623] border-[#2a3548] text-white mt-2"
                />
              </div>

              <div>
                <Label htmlFor="companyName" className="text-white">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Your Company Inc."
                  className="bg-[#0f1623] border-[#2a3548] text-white mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customNotes" className="text-white">Custom Notes (Optional)</Label>
              <Textarea
                id="customNotes"
                value={formData.customNotes}
                onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                placeholder="Add any additional context or requirements..."
                className="bg-[#0f1623] border-[#2a3548] text-white mt-2 h-20"
              />
            </div>

            <div className="space-y-3 p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <Label className="text-white text-sm font-semibold">Include in BRD:</Label>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="includeSummary" className="text-slate-300 text-sm">Executive Summary</Label>
                <Switch
                  id="includeSummary"
                  checked={formData.includeSummary}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeSummary: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="includeMetrics" className="text-slate-300 text-sm">Success Metrics</Label>
                <Switch
                  id="includeMetrics"
                  checked={formData.includeMetrics}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeMetrics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="includeSignoff" className="text-slate-300 text-sm">Approval Sign-off Section</Label>
                <Switch
                  id="includeSignoff"
                  checked={formData.includeSignoff}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeSignoff: checked })}
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-white font-medium">Document Preview</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-indigo-500/20 text-indigo-400">
                      {features.length} Features
                    </Badge>
                    <Badge className="bg-indigo-500/20 text-indigo-400">
                      {new Set(features.map(f => f.category)).size} Categories
                    </Badge>
                    <Badge className="bg-indigo-500/20 text-indigo-400">
                      Professional Format
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a3548]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-[#2a3548] hover:bg-[#2a3548]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.recipientEmail}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating & Sending...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Sent Successfully!
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Generate & Email BRD
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}