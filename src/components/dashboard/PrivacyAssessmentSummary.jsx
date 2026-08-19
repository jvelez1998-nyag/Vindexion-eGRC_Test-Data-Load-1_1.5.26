import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PrivacyAssessmentSummary() {
  // Mock data - replace with actual queries
  const stats = {
    totalAssessments: 8,
    completed: 5,
    inProgress: 2,
    overdue: 1,
    averageScore: 78,
    topRisks: ["Data Retention", "Consent Management", "Third-Party Transfers"]
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-400" />
          Privacy Assessments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{stats.completed}</p>
              <p className="text-xs text-slate-400">Complete</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="h-4 w-4 rounded-full bg-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{stats.inProgress}</p>
              <p className="text-xs text-slate-400">In Progress</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="h-4 w-4 text-rose-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{stats.overdue}</p>
              <p className="text-xs text-slate-400">Overdue</p>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-slate-400 mb-1">Average Score</p>
            <p className="text-2xl font-bold text-white">{stats.averageScore}%</p>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">Top Privacy Risks</p>
            <div className="space-y-1">
              {stats.topRisks.slice(0, 3).map((risk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1 h-1 rounded-full bg-purple-400" />
                  {risk}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}