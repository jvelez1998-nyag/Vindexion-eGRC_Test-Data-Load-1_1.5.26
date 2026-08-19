import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, ClipboardCheck, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import VendorAuditForm from "./VendorAuditForm";
import VendorAuditDetail from "./VendorAuditDetail";

export default function VendorAuditWorkflow({ open, onOpenChange, vendor }) {
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  const { data: audits = [] } = useQuery({
    queryKey: ['vendor-audits', vendor?.id],
    queryFn: () => base44.entities.VendorAudit.filter({ vendor_id: vendor.id }, '-created_date'),
    enabled: !!vendor
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['vendor-audit-templates'],
    queryFn: () => base44.entities.VendorAuditTemplate.list()
  });

  if (!vendor) return null;

  const statusColors = {
    planned: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    under_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-rose-500/20 text-rose-400 border-rose-500/30"
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-indigo-400" />
              Vendor Audits - {vendor.vendor_name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="audits" className="space-y-4">
            <TabsList className="bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="audits">Audits ({audits.length})</TabsTrigger>
              <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="audits" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">
                  {audits.filter(a => a.status === 'in_progress').length} in progress
                </p>
                <Button onClick={() => setShowAuditForm(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Audit
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-4">
                  {audits.length === 0 ? (
                    <Card className="bg-[#151d2e] border-[#2a3548] p-12 text-center">
                      <ClipboardCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No audits yet</p>
                    </Card>
                  ) : (
                    audits.map(audit => (
                      <Card 
                        key={audit.id} 
                        className="bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558] cursor-pointer transition-all"
                        onClick={() => setSelectedAudit(audit)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{audit.audit_title}</h4>
                              <p className="text-xs text-slate-400">{audit.audit_type.replace('_', ' ').toUpperCase()}</p>
                            </div>
                            <Badge className={statusColors[audit.status]}>
                              {audit.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-slate-500">Lead</p>
                              <p className="text-xs text-white">{audit.lead_auditor?.split('@')[0] || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Due Date</p>
                              <p className="text-xs text-white">
                                {audit.due_date ? format(new Date(audit.due_date), 'MMM d, yyyy') : 'Not set'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Progress</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-[#1a2332] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 transition-all"
                                    style={{ width: `${audit.progress_percentage || 0}%` }}
                                  />
                                </div>
                                <span className="text-xs text-white">{audit.progress_percentage || 0}%</span>
                              </div>
                            </div>
                          </div>

                          {audit.overall_rating && audit.overall_rating !== 'not_rated' && (
                            <Badge className={
                              audit.overall_rating === 'satisfactory' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                              audit.overall_rating === 'needs_improvement' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }>
                              {audit.overall_rating.replace('_', ' ')}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-4">
                  {templates.length === 0 ? (
                    <Card className="bg-[#151d2e] border-[#2a3548] p-12 text-center">
                      <p className="text-slate-400">No templates available</p>
                    </Card>
                  ) : (
                    templates.map(template => (
                      <Card key={template.id} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-white">{template.template_name}</h4>
                              <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setShowAuditForm(true);
                                // Will pre-fill with template
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              Use
                            </Button>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Badge className="bg-slate-500/10 text-slate-400 text-[10px]">
                              {template.audit_type}
                            </Badge>
                            {template.task_templates?.length > 0 && (
                              <Badge className="bg-blue-500/10 text-blue-400 text-[10px]">
                                {template.task_templates.length} tasks
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <VendorAuditForm
        open={showAuditForm}
        onOpenChange={setShowAuditForm}
        vendor={vendor}
        templates={templates}
        onSuccess={() => setShowAuditForm(false)}
      />

      <VendorAuditDetail
        open={!!selectedAudit}
        onOpenChange={(open) => !open && setSelectedAudit(null)}
        audit={selectedAudit}
        vendor={vendor}
      />
    </>
  );
}