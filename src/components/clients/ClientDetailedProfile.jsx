import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase,
  Shield, TrendingUp, AlertTriangle, CheckCircle2,
  FileText, Link2, Clock, Users
} from "lucide-react";
import { format } from "date-fns";

export default function ClientDetailedProfile({ client, risks = [], audits = [], incidents = [] }) {
  const linkedRisks = risks.filter(r => client.linked_risks?.includes(r.id));
  const linkedAudits = audits.filter(a => client.linked_audits?.includes(a.id));
  const linkedIncidents = incidents.filter(i => client.linked_incidents?.includes(i.id));

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{client.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${
                    client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    client.status === 'at_risk' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}>
                    {client.status?.replace(/_/g, ' ')}
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {client.client_type?.replace(/_/g, ' ')}
                  </Badge>
                  {client.risk_level && (
                    <Badge className={`${
                      client.risk_level === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      client.risk_level === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {client.risk_level} risk
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-400">
                {Math.round((client.compliance_score || 0) + (100 - (client.risk_score || 0))) / 2}
              </div>
              <div className="text-xs text-slate-400">Health Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#151d2e] border border-[#2a3548]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="linked">Linked Entities</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <Shield className="h-4 w-4 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">{client.compliance_score || 0}</div>
                <div className="text-xs text-slate-400">Compliance</div>
                <Progress value={client.compliance_score || 0} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <AlertTriangle className="h-4 w-4 text-rose-400 mb-2" />
                <div className="text-2xl font-bold text-white">{client.risk_score || 0}</div>
                <div className="text-xs text-slate-400">Risk Score</div>
                <Progress value={client.risk_score || 0} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mb-2" />
                <div className="text-2xl font-bold text-white">{client.control_maturity || 0}</div>
                <div className="text-xs text-slate-400">Controls</div>
                <Progress value={client.control_maturity || 0} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <Shield className="h-4 w-4 text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-white">{client.security_posture || 0}</div>
                <div className="text-xs text-slate-400">Security</div>
                <Progress value={client.security_posture || 0} className="mt-2 h-1" />
              </CardContent>
            </Card>
          </div>

          {/* Industry & Frameworks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Industry Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400">Industry:</span>
                  <span className="text-white font-medium">{client.industry}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400">Data Classification:</span>
                  <span className="text-white font-medium">{client.data_classification}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Regulatory Frameworks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.regulatory_frameworks?.length > 0 ? (
                    client.regulatory_frameworks.map((fw, idx) => (
                      <Badge key={idx} className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {fw}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No frameworks specified</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues Summary */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white">Issues Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div className="text-2xl font-bold text-rose-400">{client.critical_issues || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Critical Issues</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="text-2xl font-bold text-amber-400">{client.finding_count || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Findings</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <div className="text-2xl font-bold text-violet-400">{client.incident_count || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Incidents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.contact_name && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Name:</span>
                  <span className="text-sm text-white font-medium">{client.contact_name}</span>
                </div>
              )}
              {client.contact_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Email:</span>
                  <span className="text-sm text-white font-medium">{client.contact_email}</span>
                </div>
              )}
              {client.contact_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Phone:</span>
                  <span className="text-sm text-white font-medium">{client.contact_phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                  <span className="text-sm text-slate-400">Address:</span>
                  <span className="text-sm text-white font-medium">{client.address}</span>
                </div>
              )}
              {client.relationship_manager && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Manager:</span>
                  <span className="text-sm text-white font-medium">{client.relationship_manager}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linked" className="space-y-4 mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Link2 className="h-4 w-4 text-cyan-400" />
                Linked Risks ({linkedRisks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedRisks.length > 0 ? (
                <div className="space-y-2">
                  {linkedRisks.map(risk => (
                    <div key={risk.id} className="p-2 rounded bg-[#151d2e] border border-[#2a3548] text-sm">
                      <div className="font-medium text-white">{risk.title}</div>
                      <Badge className="mt-1 text-[9px] bg-rose-500/20 text-rose-400">{risk.category}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No linked risks</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Linked Audits ({linkedAudits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedAudits.length > 0 ? (
                <div className="space-y-2">
                  {linkedAudits.map(audit => (
                    <div key={audit.id} className="p-2 rounded bg-[#151d2e] border border-[#2a3548] text-sm">
                      <div className="font-medium text-white">{audit.title}</div>
                      <Badge className="mt-1 text-[9px] bg-blue-500/20 text-blue-400">{audit.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No linked audits</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Linked Incidents ({linkedIncidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedIncidents.length > 0 ? (
                <div className="space-y-2">
                  {linkedIncidents.map(incident => (
                    <div key={incident.id} className="p-2 rounded bg-[#151d2e] border border-[#2a3548] text-sm">
                      <div className="font-medium text-white">{incident.title}</div>
                      <Badge className="mt-1 text-[9px] bg-amber-500/20 text-amber-400">{incident.severity}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No linked incidents</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                Assessment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.assessment_history?.length > 0 ? (
                <div className="space-y-3">
                  {client.assessment_history.map((assessment, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">
                          {format(new Date(assessment.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <div className="text-[10px] text-slate-500">Risk</div>
                          <div className="text-sm font-semibold text-white">{assessment.risk_score}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Compliance</div>
                          <div className="text-sm font-semibold text-white">{assessment.compliance_score}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Controls</div>
                          <div className="text-sm font-semibold text-white">{assessment.control_maturity}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Security</div>
                          <div className="text-sm font-semibold text-white">{assessment.security_posture}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No assessment history</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {client.onboarding_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Onboarded:</span>
                  <span className="text-white">{format(new Date(client.onboarding_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              {client.last_assessment_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Last Assessment:</span>
                  <span className="text-white">{format(new Date(client.last_assessment_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              {client.next_review_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Next Review:</span>
                  <span className="text-white">{format(new Date(client.next_review_date), 'MMM d, yyyy')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}