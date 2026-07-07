import { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  ClipboardList,
  ListChecks,
  FileText,
  CalendarDays,
  User,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { Badge, ProgressBar } from '@/components/ui';
import { GlossPanel, GlossStat, StatusRibbon, SegmentedTabs } from '@/components/gloss';
import AuditStagePipeline from '@/components/AuditStagePipeline';
import {
  auditStages,
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

const tabOptions = ['All', ...auditStages];

export default function Audits() {
  const [tab, setTab] = useState('All');
  const [selectedId, setSelectedId] = useState(auditEngagements[0].id);

  const filtered = useMemo(
    () => (tab === 'All' ? auditEngagements : auditEngagements.filter((e) => e.stage === tab)),
    [tab]
  );

  const selected = filtered.find((e) => e.id === selectedId) || filtered[0];
  const selectedFindings = selected ? auditFindings.filter((f) => f.engagement === selected.id) : [];

  const activeCount = auditEngagements.filter((e) => e.stage !== 'Closed').length;
  const fieldworkCount = auditEngagements.filter((e) => e.stage === 'Fieldwork').length;
  const openFindingsCount = auditFindings.filter((f) => f.status !== 'Closed').length;
  const avgProgress = Math.round(
    auditEngagements.reduce((s, e) => s + e.progress, 0) / auditEngagements.length
  );

  return (
    <div>
      <StatusRibbon
        title="Audit Suite"
        icon={ClipboardCheck}
        items={[
          { label: 'Audit Engine Active', dot: 'bg-emerald-400 text-emerald-400' },
          { label: `${auditEngagements.length} Engagements Tracked`, dot: 'bg-sky-400 text-sky-400' },
          { label: `${openFindingsCount} Open Findings`, dot: 'bg-amber-400 text-amber-400' },
          { label: 'System Health: Optimal', dot: 'bg-emerald-400 text-emerald-400' },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GlossStat label="Active Engagements" value={activeCount} icon={ClipboardList} accent="sky" />
        <GlossStat label="In Fieldwork" value={fieldworkCount} icon={ClipboardCheck} accent="amber" />
        <GlossStat label="Open Findings" value={openFindingsCount} icon={FileText} accent="red" />
        <GlossStat label="Avg. Completion" value={`${avgProgress}%`} icon={CheckCircle2} accent="emerald" />
      </div>

      <SegmentedTabs options={tabOptions} value={tab} onChange={setTab} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Engagement list */}
        <GlossPanel
          title="Engagements"
          icon={ListChecks}
          subtitle={`${filtered.length} shown`}
          className="lg:col-span-2 h-fit"
        >
          <div className="space-y-3 -m-1">
            {filtered.map((e) => {
              const isSelected = selected && e.id === selected.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className={`relative w-full text-left rounded-lg border overflow-hidden transition-colors ${
                    isSelected
                      ? 'border-sky-500/50 bg-gradient-to-b from-sky-500/10 to-[#141b28] shadow-[0_0_0_1px_rgba(56,130,246,0.15)]'
                      : 'border-[#2a3548] bg-[#141b28] hover:border-[#3a4558]'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sky-400 font-mono text-xs">{e.id}</span>
                      <Badge className={auditStageColor[e.stage]}>{e.stage}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug mb-2">{e.title}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>{e.framework}</span>
                      <span>{e.progress}%</span>
                    </div>
                    <ProgressBar value={e.progress} />
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No engagements in this stage.</p>
            )}
          </div>
        </GlossPanel>

        {/* Detail panel */}
        {selected && (
          <GlossPanel
            icon={ClipboardCheck}
            title={selected.id}
            subtitle={selected.title}
            glow
            action={<Badge className={auditRiskRatingColor[selected.riskRating]}>{selected.riskRating} Risk</Badge>}
            className="lg:col-span-3 h-fit"
          >
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-5">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {selected.lead}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> {selected.startDate} &rarr; {selected.endDate}
              </span>
              <Badge className="text-slate-300 bg-slate-500/10 border-slate-500/30">{selected.type}</Badge>
              <Badge className="text-slate-300 bg-slate-500/10 border-slate-500/30">{selected.framework}</Badge>
            </div>

            <div className="rounded-lg border border-[#2a3548] bg-[#0f1623] p-4 mb-5">
              <AuditStagePipeline stage={selected.stage} />
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Scope</p>
              <p className="text-sm text-slate-300 leading-relaxed">{selected.scope}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#2a3548] bg-[#0f1623] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
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

              <div className="rounded-lg border border-[#2a3548] bg-[#0f1623] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
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
          </GlossPanel>
        )}
      </div>
    </div>
  );
}
