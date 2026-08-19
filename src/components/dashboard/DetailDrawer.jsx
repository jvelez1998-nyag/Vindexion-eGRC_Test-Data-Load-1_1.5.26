import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { AlertTriangle, FileCheck, Shield, ClipboardCheck, User, Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  identified: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  assessing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  mitigating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  monitoring: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  not_started: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  implemented: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  non_compliant: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  planned: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  effective: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ineffective: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  follow_up: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
};

function RiskItem({ risk }) {
  const score = (risk.likelihood || 0) * (risk.impact || 0);
  const getScoreColor = () => {
    if (score >= 16) return "bg-rose-500";
    if (score >= 9) return "bg-amber-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="p-4 bg-[#151d2e] rounded-xl border border-[#2a3548] hover:border-[#3a4558] transition-all">
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 ${getScoreColor()}`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white">{risk.title}</h4>
          {risk.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{risk.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge className={`text-[10px] border ${statusColors[risk.status]}`}>{risk.status?.replace(/_/g, ' ')}</Badge>
            <span className="text-[10px] text-slate-500 bg-[#1a2332] px-2 py-1 rounded-md border border-[#2a3548]">
              L:{risk.likelihood} × I:{risk.impact} = {score}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            {risk.owner && <span className="flex items-center gap-1"><User className="h-3 w-3" />{risk.owner}</span>}
            {risk.due_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(risk.due_date), 'MMM d, yyyy')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceItem({ item }) {
  return (
    <div className="p-4 bg-[#151d2e] rounded-xl border border-[#2a3548] hover:border-[#3a4558] transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{item.framework}</Badge>
            {item.requirement_id && <span className="text-[10px] text-slate-500">{item.requirement_id}</span>}
          </div>
          <h4 className="font-medium text-white">{item.requirement}</h4>
          {item.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Badge className={`text-[10px] border ${statusColors[item.status]}`}>{item.status?.replace(/_/g, ' ')}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            {item.owner && <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.owner}</span>}
            {item.due_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(item.due_date), 'MMM d, yyyy')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlItem({ control }) {
  return (
    <div className="p-4 bg-[#151d2e] rounded-xl border border-[#2a3548] hover:border-[#3a4558] transition-all">
      <h4 className="font-medium text-white">{control.name}</h4>
      {control.description && (
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{control.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">{control.category}</Badge>
        <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20">{control.domain?.replace(/_/g, ' ')}</Badge>
        <Badge className={`text-[10px] border ${statusColors[control.status]}`}>{control.status}</Badge>
      </div>
      {control.effectiveness && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-slate-500">Effectiveness:</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(n => (
              <div key={n} className={`w-3 h-1.5 rounded-full ${n <= control.effectiveness ? 'bg-emerald-500' : 'bg-[#2a3548]'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AuditItem({ audit }) {
  return (
    <div className="p-4 bg-[#151d2e] rounded-xl border border-[#2a3548] hover:border-[#3a4558] transition-all">
      <h4 className="font-medium text-white">{audit.title}</h4>
      {audit.scope && (
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{audit.scope}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20 capitalize">{audit.type}</Badge>
        <Badge className={`text-[10px] border ${statusColors[audit.status]}`}>{audit.status?.replace(/_/g, ' ')}</Badge>
        {audit.findings_count > 0 && (
          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">{audit.findings_count} findings</Badge>
        )}
        {audit.critical_findings > 0 && (
          <Badge className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20">{audit.critical_findings} critical</Badge>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
        {audit.auditor && <span>{audit.auditor}</span>}
        {audit.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(audit.start_date), 'MMM d, yyyy')}</span>}
      </div>
    </div>
  );
}

const typeConfig = {
  risks: { icon: AlertTriangle, color: 'text-rose-400', bgColor: 'bg-rose-500/10', page: 'Risks', label: 'Risks' },
  compliance: { icon: FileCheck, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', page: 'Compliance', label: 'Compliance' },
  controls: { icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-500/10', page: 'Controls', label: 'Controls' },
  audits: { icon: ClipboardCheck, color: 'text-violet-400', bgColor: 'bg-violet-500/10', page: 'Audits', label: 'Audits' }
};

export default function DetailDrawer({ open, onOpenChange, type, title, items }) {
  const safeItems = Array.isArray(items) ? items.filter(i => i) : [];
  const config = typeConfig[type] || {};
  const Icon = config.icon;

  const renderItem = (item) => {
    if (!item) return null;
    switch (type) {
      case 'risks': return <RiskItem key={item.id} risk={item} />;
      case 'compliance': return <ComplianceItem key={item.id} item={item} />;
      case 'controls': return <ControlItem key={item.id} control={item} />;
      case 'audits': return <AuditItem key={item.id} audit={item} />;
      default: return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 bg-[#0f1623] border-[#2a3548]">
        <SheetHeader className="p-6 border-b border-[#2a3548] bg-[#151d2e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
              )}
              <div>
                <SheetTitle className="text-base text-white">{title}</SheetTitle>
                <p className="text-xs text-slate-500 mt-0.5">{safeItems.length} items</p>
              </div>
            </div>
            {config.page && (
              <Link 
                to={createPageUrl(config.page)} 
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
              >
                View All <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-4 space-y-3">
            {safeItems.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No items to display</p>
            ) : (
              safeItems.map(item => renderItem(item))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}