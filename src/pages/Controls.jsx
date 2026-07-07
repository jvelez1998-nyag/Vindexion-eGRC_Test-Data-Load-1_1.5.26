import { Card, Badge, PageHeader } from '@/components/ui';
import { controls, effectivenessColor } from '@/data/mockData';

export default function Controls() {
  return (
    <div>
      <PageHeader title="Controls Library" subtitle={`${controls.length} controls tracked across frameworks`} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a3548] text-left text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Control</th>
                <th className="px-5 py-3 font-medium">Framework</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Effectiveness</th>
                <th className="px-5 py-3 font-medium">Last Tested</th>
              </tr>
            </thead>
            <tbody>
              {controls.map((c) => (
                <tr key={c.id} className="border-b border-[#2a3548] last:border-0 hover:bg-[#1e293b]/40 transition-colors">
                  <td className="px-5 py-3.5 text-indigo-400 font-mono text-xs">{c.id}</td>
                  <td className="px-5 py-3.5 text-slate-200 max-w-md">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-400">{c.framework}</td>
                  <td className="px-5 py-3.5 text-slate-400">{c.type}</td>
                  <td className="px-5 py-3.5 text-slate-400">{c.owner}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={effectivenessColor[c.effectiveness]}>{c.effectiveness}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{c.lastTested}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
