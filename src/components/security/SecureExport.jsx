import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Shield, AlertTriangle } from "lucide-react";
import { dataProtection } from "./DataProtection";
import { auditLogger } from "./AuditLogger";
import { accessControl } from "./AccessControl";
import { toast } from "sonner";

export default function SecureExport({ data, filename, entityType, userRole = 'user', onExport }) {
  const [open, setOpen] = useState(false);
  const [addWatermark, setAddWatermark] = useState(true);
  const [maskPII, setMaskPII] = useState(true);
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExport = async () => {
    try {
      // Validate export request
      if (!accessControl.validateExportRequest(data.length, userRole)) {
        return;
      }

      // Check rate limit
      if (!accessControl.checkRateLimit(`export_${userRole}`, 10, 60000)) {
        return;
      }

      let exportData = [...data];

      // Add watermark if enabled
      if (addWatermark) {
        const userEmail = 'current_user@company.com'; // Get from auth context
        exportData = [dataProtection.addWatermark({}, userEmail), ...exportData];
      }

      // Mask PII if enabled
      if (maskPII) {
        exportData = exportData.map(item => {
          const masked = { ...item };
          Object.keys(masked).forEach(key => {
            if (typeof masked[key] === 'string') {
              masked[key] = dataProtection.autoMaskPII(masked[key]);
            }
          });
          return masked;
        });
      }

      // Generate export
      const csv = [
        Object.keys(exportData[0] || {}).join(','),
        ...exportData.map(row => 
          Object.values(row).map(v => `"${v || ''}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `export_${Date.now()}.csv`;
      a.click();

      // Log export
      await auditLogger.logExport(entityType, data.length, exportFormat);

      toast.success(`Exported ${data.length} records securely`);
      setOpen(false);
      if (onExport) onExport();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Secure Export
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Secure Data Export
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-400">Security Notice</p>
                  <p className="text-xs text-slate-400 mt-1">
                    This export will be logged and tracked. Ensure data is handled according to company policies.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="watermark" 
                  checked={addWatermark} 
                  onCheckedChange={setAddWatermark}
                />
                <Label htmlFor="watermark" className="text-sm text-white cursor-pointer">
                  Add watermark with user details
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mask-pii" 
                  checked={maskPII} 
                  onCheckedChange={setMaskPII}
                />
                <Label htmlFor="mask-pii" className="text-sm text-white cursor-pointer">
                  Mask PII (emails, phones, SSN)
                </Label>
              </div>
            </div>

            <div className="bg-[#0f1623] border border-[#2a3548] rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-2">Export Summary:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Records:</span>
                  <span className="text-white ml-2">{data.length}</span>
                </div>
                <div>
                  <span className="text-slate-500">Format:</span>
                  <span className="text-white ml-2">CSV</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 border-[#2a3548]">
                Cancel
              </Button>
              <Button onClick={handleExport} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Download className="h-4 w-4 mr-2" />
                Export Securely
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}