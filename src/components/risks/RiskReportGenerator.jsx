import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import SecureExport from "@/components/security/SecureExport";

export default function RiskReportGenerator({ risks, controls }) {
  const [includeHeatmap, setIncludeHeatmap] = useState(true);
  const [includeControls, setIncludeControls] = useState(true);
  const [includeMitigation, setIncludeMitigation] = useState(true);

  const generateReport = () => {
    const reportData = risks.map(risk => {
      const score = (risk.residual_likelihood || 0) * (risk.residual_impact || 0);
      const linkedControls = (risk.linked_controls || [])
        .map(id => controls.find(c => c.id === id)?.name)
        .filter(Boolean);

      return {
        'Risk ID': risk.id,
        'Title': risk.title,
        'Category': risk.category,
        'Status': risk.status,
        'Likelihood': risk.residual_likelihood,
        'Impact': risk.residual_impact,
        'Risk Score': score,
        'Rating': score >= 16 ? 'Critical' : score >= 9 ? 'High' : score >= 4 ? 'Medium' : 'Low',
        'Owner': risk.owner || 'Unassigned',
        'Linked Controls': linkedControls.join('; '),
        'Mitigation Progress': `${risk.mitigation_progress || 0}%`,
        'Date Identified': risk.date_identified || 'N/A'
      };
    });

    return reportData;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="heatmap" 
                checked={includeHeatmap} 
                onCheckedChange={setIncludeHeatmap}
              />
              <Label htmlFor="heatmap" className="text-sm text-white cursor-pointer">
                Include Risk Heatmap
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="controls" 
                checked={includeControls} 
                onCheckedChange={setIncludeControls}
              />
              <Label htmlFor="controls" className="text-sm text-white cursor-pointer">
                Include Control Mappings
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="mitigation" 
                checked={includeMitigation} 
                onCheckedChange={setIncludeMitigation}
              />
              <Label htmlFor="mitigation" className="text-sm text-white cursor-pointer">
                Include Mitigation Progress
              </Label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2a3548]">
            <SecureExport
              data={generateReport()}
              filename={`risk-register-${format(new Date(), 'yyyy-MM-dd')}.csv`}
              entityType="Risk"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm">Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Total Risks</span>
                <Badge className="bg-indigo-500/20 text-indigo-400">{risks.length}</Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Critical Risks</span>
                <Badge className="bg-red-500/20 text-red-400">
                  {risks.filter(r => (r.residual_likelihood || 0) * (r.residual_impact || 0) >= 16).length}
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">High Risks</span>
                <Badge className="bg-amber-500/20 text-amber-400">
                  {risks.filter(r => {
                    const score = (r.residual_likelihood || 0) * (r.residual_impact || 0);
                    return score >= 9 && score < 16;
                  }).length}
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Controls Referenced</span>
                <Badge className="bg-blue-500/20 text-blue-400">{controls.length}</Badge>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2a3548]">
              <p className="text-xs text-slate-500">
                Report generated on {format(new Date(), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}