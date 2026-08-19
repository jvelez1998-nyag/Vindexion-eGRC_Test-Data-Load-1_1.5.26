import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, User, Calendar, Link2, AlertTriangle, Shield, FileCheck, Brain, Radio, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import ThreatIntelligenceEnrichment from "./ThreatIntelligenceEnrichment";

const severityColors = {
  critical: { bg: 'bg-rose-500', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  high: { bg: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  medium: { bg: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  low: { bg: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
};

const statusColors = {
  reported: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  triaging: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  investigating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  contained: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  remediated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
};

const typeLabels = {
  security_breach: 'Security Breach',
  data_leak: 'Data Leak',
  system_outage: 'System Outage',
  policy_violation: 'Policy Violation',
  fraud: 'Fraud',
  compliance_breach: 'Compliance Breach',
  operational_failure: 'Operational Failure',
  third_party: 'Third Party',
  physical_security: 'Physical Security',
  other: 'Other'
};

const priorityColors = {
  p1: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  p2: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  p3: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  p4: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
};

export default function IncidentCard({ incident, onEdit, onDelete, onAnalyze, onGenerateSummary, onCollaborate, onWorkflowAnalysis }) {
  const [showThreatIntel, setShowThreatIntel] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState(null);
  const severity = severityColors[incident.severity] || severityColors.medium;
  const linkedCount = (incident.linked_risks?.length || 0) + (incident.linked_controls?.length || 0) + (incident.linked_compliance?.length || 0);

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all overflow-hidden">
      <div className="flex">
        <div className={`w-1 ${severity.bg}`} />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
               <h3 className="font-semibold text-slate-200 text-lg truncate">{incident.title}</h3>
               {incident.regulatory_reportable && (
                 <Badge className="text-[10px] bg-rose-500/20 text-rose-400 border-rose-500/30">
                   Regulatory
                 </Badge>
               )}
              </div>

              {incident.description && (
               <p className="text-slate-400 text-sm line-clamp-2 mb-3">{incident.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={`text-[10px] border capitalize ${severity.badge}`}>
                  {incident.severity}
                </Badge>
                <Badge className={`text-[10px] border ${statusColors[incident.status]}`}>
                  {incident.status?.replace(/_/g, ' ')}
                </Badge>
                <Badge className="text-[10px] border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  {typeLabels[incident.incident_type] || incident.incident_type}
                </Badge>
                {incident.priority && (
                  <Badge className={`text-[10px] border uppercase ${priorityColors[incident.priority]}`}>
                    {incident.priority}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                {incident.assigned_to && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {incident.assigned_to}
                  </span>
                )}
                {incident.occurred_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(incident.occurred_date), 'MMM d, yyyy HH:mm')}
                  </span>
                )}
                {linkedCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" />
                    {linkedCount} linked items
                  </span>
                )}
              </div>

              {linkedCount > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {incident.linked_risks?.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-400">
                      <AlertTriangle className="h-3 w-3" />
                      {incident.linked_risks.length} risks
                    </div>
                  )}
                  {incident.linked_controls?.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-400">
                      <Shield className="h-3 w-3" />
                      {incident.linked_controls.length} controls
                    </div>
                  )}
                  {incident.linked_compliance?.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <FileCheck className="h-3 w-3" />
                      {incident.linked_compliance.length} compliance
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <Button
                  onClick={() => setShowThreatIntel(!showThreatIntel)}
                  size="sm"
                  className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 text-xs"
                >
                  <Radio className="h-3 w-3 mr-2" />
                  Threat Intelligence
                  {showThreatIntel ? <ChevronUp className="h-3 w-3 ml-2" /> : <ChevronDown className="h-3 w-3 ml-2" />}
                </Button>
                {onWorkflowAnalysis && (
                  <Button
                    onClick={() => onWorkflowAnalysis(incident)}
                    size="sm"
                    className="bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 text-xs"
                  >
                    <Brain className="h-3 w-3 mr-2" />
                    AI Workflow
                  </Button>
                )}
                {enrichmentData && (
                  <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                    Score: {enrichmentData.threat_score}/100
                  </Badge>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#2a3548]">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
                <DropdownMenuItem onClick={() => onAnalyze(incident)} className="text-purple-400 hover:bg-purple-500/10">
                  <Brain className="h-4 w-4 mr-2" /> AI Analysis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(incident)} className="text-slate-300 hover:bg-[#2a3548]">
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(incident)} className="text-rose-400 hover:bg-rose-500/10">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {showThreatIntel && (
        <div className="p-5 border-t border-[#2a3548] bg-[#151d2e]">
          <ThreatIntelligenceEnrichment 
            incident={incident}
            onEnrichmentComplete={setEnrichmentData}
          />
        </div>
      )}
    </Card>
  );
}