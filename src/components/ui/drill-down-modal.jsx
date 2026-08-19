import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ExternalLink, Download, FileText, Calendar, User, 
  TrendingUp, Target, AlertCircle, CheckCircle2, Maximize2
} from "lucide-react";
import { format } from "date-fns";

export default function DrillDownModal({ open, onClose, title, data, type }) {
  if (!data) return null;

  const renderContent = () => {
    switch (type) {
      case 'risk':
        return <RiskDrillDown items={data} />;
      case 'control':
        return <ControlDrillDown items={data} />;
      case 'compliance':
        return <ComplianceDrillDown items={data} />;
      case 'audit':
        return <AuditDrillDown items={data} />;
      case 'incident':
        return <IncidentDrillDown items={data} />;
      case 'vendor':
        return <VendorDrillDown items={data} />;
      case 'exam':
        return <ExamDrillDown items={data} />;
      case 'assessment':
        return <AssessmentDrillDown items={data} />;
      default:
        return <GenericDrillDown items={data} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a2332] border-[#2a3548] max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Maximize2 className="h-5 w-5 text-violet-400" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function RiskDrillDown({ items }) {
  return (
    <div className="space-y-3">
      {items.map((risk, idx) => (
        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">{risk.title}</h4>
                <p className="text-xs text-slate-400">{risk.description}</p>
              </div>
              <Badge className={`${
                (risk.residual_likelihood || 0) * (risk.residual_impact || 0) >= 15 ? 'bg-rose-500/20 text-rose-400' :
                (risk.residual_likelihood || 0) * (risk.residual_impact || 0) >= 9 ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                Score: {(risk.residual_likelihood || 0) * (risk.residual_impact || 0)}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Category:</span>
                <span className="text-white ml-2">{risk.category}</span>
              </div>
              <div>
                <span className="text-slate-400">Owner:</span>
                <span className="text-white ml-2">{risk.owner}</span>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <Badge className="ml-2 text-[10px]">{risk.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ControlDrillDown({ items }) {
  return (
    <div className="space-y-3">
      {items.map((control, idx) => (
        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">{control.name}</h4>
              <Badge className={`${
                control.effectiveness >= 4 ? 'bg-emerald-500/20 text-emerald-400' :
                control.effectiveness >= 3 ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {control.effectiveness}/5
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mb-3">{control.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Type:</span>
                <span className="text-white">{control.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Domain:</span>
                <span className="text-white">{control.domain}</span>
              </div>
              {control.last_tested_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-400">Last tested:</span>
                  <span className="text-white">{format(new Date(control.last_tested_date), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ComplianceDrillDown({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Badge className="text-[10px] mb-1">{item.framework}</Badge>
                <h4 className="text-sm font-semibold text-white">{item.requirement}</h4>
              </div>
              <Badge className={`${
                item.status === 'verified' || item.status === 'implemented' ? 'bg-emerald-500/20 text-emerald-400' :
                item.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {item.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mb-2">{item.description}</p>
            {item.owner && (
              <div className="text-xs text-slate-300">
                <User className="h-3 w-3 inline mr-1" />
                {item.owner}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AuditDrillDown({ items }) {
  return (
    <div className="space-y-3">
      {items.map((audit, idx) => (
        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">{audit.title}</h4>
              <Badge className={`${
                audit.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                audit.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {audit.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <span className="text-slate-400">Type:</span>
                <span className="text-white ml-2">{audit.type}</span>
              </div>
              <div>
                <span className="text-slate-400">Findings:</span>
                <span className="text-white ml-2">{audit.findings_count || 0}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">{audit.scope}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function IncidentDrillDown({ items }) {
  return (
    <div className="space-y-3">
      {items.map((incident, idx) => (
        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">{incident.title}</h4>
              <Badge className={`${
                incident.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                incident.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                incident.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {incident.severity}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mb-3">{incident.description}</p>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-400" />
                <span className="text-slate-400">Type:</span>
                <span className="text-white">{incident.incident_type}</span>
              </div>
              {incident.reported_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span className="text-white">{format(new Date(incident.reported_date), 'MMM d')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function VendorDrillDown({ items }) {
  return (
    <div className="space-y-3">
      {items.map((vendor, idx) => (
        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">{vendor.vendor_name}</h4>
              <Badge className={`${
                vendor.overall_risk_score <= 20 ? 'bg-emerald-500/20 text-emerald-400' :
                vendor.overall_risk_score <= 40 ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                Risk: {vendor.overall_risk_score}
              </Badge>
            </div>
            <div className="text-xs space-y-1">
              <div>
                <span className="text-slate-400">Services:</span>
                <span className="text-white ml-2">{vendor.services_provided}</span>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-slate-400">Tier:</span>
                  <span className="text-white ml-2">{vendor.risk_tier}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <Badge className="ml-2 text-[10px]">{vendor.compliance_status}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ExamDrillDown({ items }) {
  return (
    <div className="space-y-3">
      {items.map((exam, idx) => (
        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-white">{exam.exam_title}</h4>
                <Badge className="text-[10px] mt-1">{exam.exam_type}</Badge>
              </div>
              {exam.readiness_score && (
                <Badge className={`${
                  exam.readiness_score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                  exam.readiness_score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {exam.readiness_score}%
                </Badge>
              )}
            </div>
            {exam.exam_date && (
              <div className="text-xs text-slate-400 mb-2">
                <Calendar className="h-3 w-3 inline mr-1" />
                {format(new Date(exam.exam_date), 'MMM d, yyyy')}
              </div>
            )}
            <div className="text-xs">
              <span className="text-slate-400">Status:</span>
              <Badge className="ml-2 text-[10px]">{exam.status}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AssessmentDrillDown({ items }) {
  return (
    <div className="space-y-3">
      {items.map((assessment, idx) => (
        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">{assessment.title}</h4>
              <Badge>{assessment.assessment_type}</Badge>
            </div>
            <p className="text-xs text-slate-400 mb-2">{assessment.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Inherent:</span>
                <span className="text-rose-400 ml-2">{(assessment.inherent_likelihood || 0) * (assessment.inherent_impact || 0)}</span>
              </div>
              <div>
                <span className="text-slate-400">Residual:</span>
                <span className="text-emerald-400 ml-2">{(assessment.residual_likelihood || 0) * (assessment.residual_impact || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GenericDrillDown({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
          <CardContent className="p-4">
            <pre className="text-xs text-white overflow-auto">
              {JSON.stringify(item, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}