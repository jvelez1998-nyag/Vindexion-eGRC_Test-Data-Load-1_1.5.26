import { Check } from 'lucide-react';
import { auditStages } from '@/data/mockData';

export default function AuditStagePipeline({ stage }) {
  const currentIndex = auditStages.indexOf(stage);

  return (
    <div className="flex items-center">
      {auditStages.map((s, i) => {
        const done = i < currentIndex || stage === 'Closed';
        const active = i === currentIndex && stage !== 'Closed';
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold border shrink-0 ${
                  done
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_8px_1px_rgba(16,185,129,0.4)]'
                    : active
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-400 shadow-[0_0_8px_1px_rgba(56,130,246,0.45)]'
                    : 'bg-[#0f1623] border-[#2a3548] text-slate-600'
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  done || active ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {s}
              </span>
            </div>
            {i < auditStages.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1.5 rounded-full ${
                  i < currentIndex || stage === 'Closed' ? 'bg-emerald-500/40' : 'bg-[#2a3548]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
