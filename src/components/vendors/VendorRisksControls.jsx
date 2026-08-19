import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield } from "lucide-react";

export default function VendorRisksControls() {
  const commonRisks = [
    { risk: "Data Breach", severity: "critical", controls: ["Encryption requirements", "Access controls", "Audit rights"] },
    { risk: "Service Interruption", severity: "high", controls: ["SLA agreements", "Backup vendors", "Monitoring"] },
    { risk: "Compliance Violation", severity: "high", controls: ["Regular audits", "Certifications", "Training"] },
    { risk: "Financial Instability", severity: "medium", controls: ["Financial reviews", "Insurance", "Exit strategy"] }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-rose-500/10 to-red-500/10 border-rose-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Vendor Risks & Recommended Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">
            Common vendor risks and corresponding control frameworks
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {commonRisks.map((item, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${
                    item.severity === 'critical' ? 'text-rose-400' :
                    item.severity === 'high' ? 'text-amber-400' :
                    'text-yellow-400'
                  }`} />
                  <div>
                    <h3 className="text-base font-semibold text-white">{item.risk}</h3>
                  </div>
                </div>
                <Badge className={`${
                  item.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                  item.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {item.severity}
                </Badge>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  Recommended Controls
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.controls.map((control, cIdx) => (
                    <Badge key={cIdx} className="bg-emerald-500/20 text-emerald-400">
                      {control}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}