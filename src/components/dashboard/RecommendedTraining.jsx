import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock } from "lucide-react";

export default function RecommendedTraining({ risks, compliance, incidents }) {
  const recommendations = [];

  const safeRisks = Array.isArray(risks) ? risks.filter(r => r) : [];
  const safeCompliance = Array.isArray(compliance) ? compliance.filter(c => c) : [];
  const safeIncidents = Array.isArray(incidents) ? incidents.filter(i => i) : [];

  if (safeRisks.filter(r => r.risk_category === 'cybersecurity' || r.category === 'cybersecurity').length > 5) {
    recommendations.push({ title: "Cybersecurity Fundamentals", duration: "2 hrs", priority: "high" });
  }
  if (safeCompliance.filter(c => c.framework === 'GDPR' && c.status !== 'implemented').length > 3) {
    recommendations.push({ title: "GDPR Compliance Essentials", duration: "90 min", priority: "critical" });
  }
  if (safeIncidents.filter(i => i.incident_type === 'phishing').length > 2) {
    recommendations.push({ title: "Phishing Awareness Training", duration: "45 min", priority: "high" });
  }
  
  if (recommendations.length === 0) {
    recommendations.push(
      { title: "Advanced Risk Assessment", duration: "3 hrs", priority: "medium" },
      { title: "Control Testing Best Practices", duration: "2 hrs", priority: "medium" }
    );
  }

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-indigo-400" />
          Recommended Training
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#0f1623] hover:bg-[#151d2e] transition-colors cursor-pointer">
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{rec.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{rec.duration}</span>
                </div>
              </div>
              <Badge className={`${
                rec.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                rec.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                'bg-blue-500/20 text-blue-400'
              } text-xs`}>
                {rec.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}