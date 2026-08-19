import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Shield, AlertTriangle, FileText, Calendar, TrendingUp, Link2, CheckCircle2, Plus } from "lucide-react";
import { format } from "date-fns";
import VendorAssessmentForm from "./VendorAssessmentForm";
import AIVendorRiskScoring from "./AIVendorRiskScoring";
import VendorAuditWorkflow from "./VendorAuditWorkflow";
import VendorPerformanceTracking from "./VendorPerformanceTracking";
import VendorPerformanceReport from "./VendorPerformanceReport";
import VendorKPIManager from "./VendorKPIManager";
import VendorSLAManager from "./VendorSLAManager";
import VendorReviewManager from "./VendorReviewManager";
import AIPerformanceScorecard from "./AIPerformanceScorecard";
import VendorDocumentManager from "./VendorDocumentManager";
import AutomatedDueDiligenceEngine from "./AutomatedDueDiligenceEngine";

export default function VendorDetailView({ open, onOpenChange, vendor, assessments }) {
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showAuditWorkflow, setShowAuditWorkflow] = useState(false);
  const queryClient = useQueryClient();

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list(),
    enabled: !!vendor
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list(),
    enabled: !!vendor
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['vendor-documents', vendor?.id],
    queryFn: () => base44.entities.VendorDocument.filter({ vendor_id: vendor.id }),
    enabled: !!vendor
  });

  if (!vendor) return null;

  const linkedRisks = risks.filter(r => vendor.linked_risks?.includes(r.id));
  const linkedControls = controls.filter(c => vendor.linked_controls?.includes(c.id));
  const latestAssessment = assessments?.[0];

  const criticalityColors = {
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    critical: "bg-rose-500/20 text-rose-400 border-rose-500/30"
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-indigo-400" />
              {vendor.vendor_name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-[#151d2e] border border-[#2a3548]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="assessments">Assessments ({assessments?.length || 0})</TabsTrigger>
              <TabsTrigger value="audits">Audits</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="linked">Linked Items</TabsTrigger>
              <TabsTrigger value="contract">Contract</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <AIVendorRiskScoring 
                vendor={vendor} 
                assessments={assessments}
                onScoreUpdate={() => queryClient.invalidateQueries({ queryKey: ['vendors'] })}
              />

              <VendorDocumentManager vendor={vendor} />

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="h-5 w-5 text-purple-400" />
                      <Badge className={criticalityColors[vendor.criticality]}>
                        {vendor.criticality}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {vendor.security_score || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400">Security Score</div>
                  </CardContent>
                </Card>

                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {vendor.risk_tier?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white capitalize">
                      {vendor.compliance_status?.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-slate-400">Compliance Status</div>
                  </CardContent>
                </Card>

                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-lg font-bold text-white">
                      {vendor.next_review_date ? format(new Date(vendor.next_review_date), 'MMM d, yyyy') : 'Not Set'}
                    </div>
                    <div className="text-xs text-slate-400">Next Review</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-lg">Vendor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Type</div>
                      <p className="text-white">{vendor.vendor_type}</p>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Status</div>
                      <p className="text-white capitalize">{vendor.status?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Data Access Level</div>
                      <p className="text-white capitalize">{vendor.data_access_level || 'N/A'}</p>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Website</div>
                      <p className="text-white">{vendor.website || 'N/A'}</p>
                    </div>
                  </div>

                  {vendor.description && (
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Description</div>
                      <p className="text-white text-sm mt-1">{vendor.description}</p>
                    </div>
                  )}

                  {vendor.certifications?.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-400 mb-2">Certifications</div>
                      <div className="flex flex-wrap gap-2">
                        {vendor.certifications.map((cert, i) => (
                          <Badge key={i} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {vendor.primary_contact && (
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Contact</div>
                      <p className="text-white">{vendor.primary_contact}</p>
                      {vendor.contact_email && <p className="text-sm text-slate-400">{vendor.contact_email}</p>}
                      {vendor.contact_phone && <p className="text-sm text-slate-400">{vendor.contact_phone}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <AIPerformanceScorecard vendor={vendor} />

              <div className="grid md:grid-cols-2 gap-4">
                <VendorKPIManager vendor={vendor} />
                <VendorSLAManager vendor={vendor} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <VendorPerformanceTracking vendor={vendor} />
                <VendorReviewManager vendor={vendor} />
              </div>

              <VendorPerformanceReport vendor={vendor} />
            </TabsContent>

            <TabsContent value="assessments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Security Assessments</h3>
                <Button onClick={() => setShowAssessmentForm(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-4">
                  {assessments?.length === 0 ? (
                    <Card className="bg-[#151d2e] border-[#2a3548] p-12 text-center">
                      <Shield className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No assessments yet</p>
                    </Card>
                  ) : (
                    assessments?.map(assessment => (
                      <Card key={assessment.id} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-white mb-1">
                                {assessment.assessment_type.replace('_', ' ').toUpperCase()}
                              </h4>
                              <p className="text-xs text-slate-400">
                                {format(new Date(assessment.assessment_date), 'MMMM d, yyyy')}
                              </p>
                            </div>
                            <Badge className={`${
                              assessment.risk_rating === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                              assessment.risk_rating === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                              assessment.risk_rating === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {assessment.risk_rating}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                            {assessment.security_controls_score && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{assessment.security_controls_score}</div>
                                <div className="text-[10px] text-slate-400">Security</div>
                              </div>
                            )}
                            {assessment.data_protection_score && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{assessment.data_protection_score}</div>
                                <div className="text-[10px] text-slate-400">Data</div>
                              </div>
                            )}
                            {assessment.incident_response_score && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{assessment.incident_response_score}</div>
                                <div className="text-[10px] text-slate-400">IR</div>
                              </div>
                            )}
                            {assessment.business_continuity_score && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{assessment.business_continuity_score}</div>
                                <div className="text-[10px] text-slate-400">BC</div>
                              </div>
                            )}
                            {assessment.overall_score && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-emerald-400">{assessment.overall_score}</div>
                                <div className="text-[10px] text-slate-400">Overall</div>
                              </div>
                            )}
                          </div>

                          {assessment.recommendations?.length > 0 && (
                            <div className="bg-amber-500/5 rounded p-2">
                              <p className="text-xs text-amber-400 font-medium mb-1">Recommendations:</p>
                              <ul className="text-xs text-slate-300 space-y-1">
                                {assessment.recommendations.slice(0, 3).map((rec, i) => (
                                  <li key={i}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="audits" className="space-y-4">
              <Card className="bg-[#151d2e] border-[#2a3548] p-8 text-center">
                <Shield className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Vendor Audit Management</h3>
                <p className="text-slate-400 mb-4">
                  Initiate and manage structured audits for this vendor
                </p>
                <Button onClick={() => setShowAuditWorkflow(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Audits
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <VendorDocumentManager vendor={vendor} />

              <AutomatedDueDiligenceEngine 
                vendor={vendor}
                documents={documents}
                questionnaireData={null}
              />
            </TabsContent>

            <TabsContent value="linked" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                      Linked Risks ({linkedRisks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2 pr-4">
                        {linkedRisks.length === 0 ? (
                          <p className="text-slate-400 text-sm">No linked risks</p>
                        ) : (
                          linkedRisks.map(risk => (
                            <Card key={risk.id} className="bg-[#1a2332] border-[#2a3548] p-3">
                              <h4 className="text-sm font-medium text-white">{risk.title}</h4>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{risk.description}</p>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-400" />
                      Linked Controls ({linkedControls.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2 pr-4">
                        {linkedControls.length === 0 ? (
                          <p className="text-slate-400 text-sm">No linked controls</p>
                        ) : (
                          linkedControls.map(control => (
                            <Card key={control.id} className="bg-[#1a2332] border-[#2a3548] p-3">
                              <h4 className="text-sm font-medium text-white">{control.name}</h4>
                              <Badge className="mt-1 text-[10px] bg-slate-500/10 text-slate-400">
                                {control.domain}
                              </Badge>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contract" className="space-y-4">
              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-lg">Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Start Date</div>
                      <p className="text-white">
                        {vendor.contract_start_date ? format(new Date(vendor.contract_start_date), 'MMMM d, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">End Date</div>
                      <p className="text-white">
                        {vendor.contract_end_date ? format(new Date(vendor.contract_end_date), 'MMMM d, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Annual Value</div>
                      <p className="text-white">
                        {vendor.contract_value ? `$${vendor.contract_value.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Notice Period</div>
                      <p className="text-white">
                        {vendor.notice_period_days ? `${vendor.notice_period_days} days` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={vendor.auto_renewal ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400'}>
                      {vendor.auto_renewal ? 'Auto-Renewal Enabled' : 'Manual Renewal'}
                    </Badge>
                  </div>

                  {vendor.notes && (
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Notes</div>
                      <p className="text-white text-sm mt-1">{vendor.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <VendorAssessmentForm
        open={showAssessmentForm}
        onOpenChange={setShowAssessmentForm}
        vendorId={vendor?.id}
        onSuccess={() => setShowAssessmentForm(false)}
      />

      <VendorAuditWorkflow
        open={showAuditWorkflow}
        onOpenChange={setShowAuditWorkflow}
        vendor={vendor}
      />
    </>
  );
}