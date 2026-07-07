import { useState } from 'react';
import {
  ClipboardCheck,
  ClipboardList,
  FileText,
  CalendarDays,
  User,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, Badge, ProgressBar, StatCard, PageHeader } from '@/components/ui';
import AuditStagePipeline from '@/components/AuditStagePipeline';
import {
  auditEngagements,
  auditFindings,
  auditStageColor,
  auditRiskRatingColor,
  workpaperStatusColor,
  severityColor,
  statusColor,
} from '@/data/mockData';

const workpaperIcon = {
  Complete: CheckCircle2,
  'In Progress': Clock,
  'Not Started': Circle,
};

export default function Audits() {
  const [selectedId, setSelectedId] = useState(auditEngagements[0].id);
  const selected = auditEngagements.find((e) => e.id === selectedId);
  const selectedFindings = auditFindings.filter((f) => f.engagement === selectedId);

  const activeCount = auditEngagements.filter((e) => e.stage !== 'Closed').length;
  const fieldworkCount = auditEngagements.filter((e) => e.stage === 'Fieldwork').length;
  const openFindingsCount = auditFindings.filter((f) => f.status !== 'Closed').length;
  const avgProgress = Math.round(
    auditEngagements.reduce((s, e) => s + e.progress, 0) / auditEngagements.length
  );

  return (
    <div>
      <PageHeader
        title="Audit Suite"
        subtitle={`${auditEngagements.length} engagements · ${activeCount} active this quarter`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Engagements" value={activeCount} icon={ClipboardList} accent="indigo" />
        <StatCard label="In Fieldwork" value={fieldworkCount} icon={ClipboardCheck} accent="amber" />
        <StatCard label="Open Findings" value={openFindingsCount} icon={FileText} accent="red" />
        <StatCard label="Avg. Completion" value={`${avgProgress}%`} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Engagement list */}
        <div className="lg:col-span-2 space-y-3">
          {auditEngagements.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${
                selectedId === e.id
                  ? 'bg-indigo-500/10 border-indigo-500/40'
                  : 'bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-indigo-400 font-mono text-xs">{e.id}</span>
                <Badge className={auditStageColor[e.stage]}>{e.stage}</Badge>
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug mb-2">{e.title}</h3>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{e.framework}</span>
                <span>{e.progress}%</span>
              </div>
              <ProgressBar value={e.progress} />
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <Card className="lg:col-span-3 h-fit">
          <div className="p-5 pb-4 border-b border-[#2a3548]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-indigo-400 font-mono text-xs">{selected.id}</span>
                <h2 className="text-lg font-bold text-white mt-1">{selected.title}</h2>
              </div>
              <Badge className={auditRiskRatingColor[selected.riskRating]}>
                {selected.riskRating} Risk
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-4">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {selected.lead}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> {selected.startDate} &rarr; {selected.endDate}
              </span>
              <Badge className="text-slate-300 bg-slate-500/10 border-slate-500/30">{selected.type}</Badge>
              <Badge className="text-slate-300 bg-slate-500/10 border-slate-500/30">{selected.framework}</Badge>
            </div>
            <AuditStagePipeline stage={selected.stage} />
          </div>

          <div className="p-5 border-b border-[#2a3548]">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Scope</p>
            <p className="text-sm text-slate-300 leading-relaxed">{selected.scope}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:divide-x divide-[#2a3548]">
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Workpapers ({selected.workpapers.length})
              </p>
              <div className="space-y-2.5">
                {selected.workpapers.map((wp) => {
                  const Icon = workpaperIcon[wp.status];
                  return (
                    <div key={wp.name} className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 ${workpaperStatusColor[wp.status]}`} />
                      <span className="text-sm text-slate-300 flex-1">{wp.name}</span>
                      <span className={`text-xs ${workpaperStatusColor[wp.status]}`}>{wp.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Findings ({selectedFindings.length})
              </p>
              {selectedFindings.length === 0 ? (
                <p className="text-sm text-slate-500">No findings recorded for this engagement.</p>
              ) : (
                <div className="space-y-3">
                  {selectedFindings.map((f) => (
                    <div key={f.id} className="text-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-slate-300 leading-snug">{f.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={severityColor[f.severity]}>{f.severity}</Badge>
                        <Badge className={statusColor[f.status] || 'text-slate-300 bg-slate-500/10 border-slate-500/30'}>
                          {f.status}
                        </Badge>
                        <span className="text-xs text-slate-500 ml-auto">Due {f.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
