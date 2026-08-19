import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle2, AlertTriangle, Bell } from "lucide-react";

const regulatoryServices = [
  { 
    name: "Federal Register (US)", 
    status: "active", 
    jurisdictions: ["United States"],
    changesTracked: 47,
    lastUpdate: "6 hours ago",
    frameworks: ["FFIEC", "SOX", "GLBA", "FCRA"]
  },
  { 
    name: "EUR-Lex (EU)", 
    status: "active", 
    jurisdictions: ["European Union"],
    changesTracked: 23,
    lastUpdate: "4 hours ago",
    frameworks: ["GDPR", "NIS2", "DORA", "AI Act"]
  },
  { 
    name: "FCA Handbook (UK)", 
    status: "active", 
    jurisdictions: ["United Kingdom"],
    changesTracked: 15,
    lastUpdate: "8 hours ago",
    frameworks: ["FCA Rules", "PRA Standards"]
  },
  { 
    name: "APRA Updates (AU)", 
    status: "inactive", 
    jurisdictions: ["Australia"],
    changesTracked: 0,
    lastUpdate: "Never",
    frameworks: ["APRA CPS", "Privacy Act"]
  }
];

const recentChanges = [
  {
    date: "2025-12-10",
    framework: "GDPR",
    change: "EU Commission issues new guidance on AI transparency requirements",
    impact: "High",
    affectedControls: 12
  },
  {
    date: "2025-12-08",
    framework: "FFIEC",
    change: "Updated cybersecurity assessment tool v2024",
    impact: "Medium",
    affectedControls: 8
  },
  {
    date: "2025-12-05",
    framework: "SEC",
    change: "New cybersecurity disclosure rules effective date announced",
    impact: "High",
    affectedControls: 15
  }
];

export default function RegulatoryMonitoring() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-400" />
            <div>
              <CardTitle className="text-white">Regulatory Change Monitoring</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Track regulatory updates and assess impact on compliance programs</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Recent Regulatory Changes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentChanges.map((change, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-500/20 text-indigo-400">{change.framework}</Badge>
                  <Badge className={
                    change.impact === "High" ? "bg-rose-500/20 text-rose-400" :
                    change.impact === "Medium" ? "bg-amber-500/20 text-amber-400" :
                    "bg-blue-500/20 text-blue-400"
                  }>
                    {change.impact} Impact
                  </Badge>
                </div>
                <span className="text-xs text-slate-500">{change.date}</span>
              </div>
              <p className="text-sm text-white mb-2">{change.change}</p>
              <div className="text-xs text-slate-400">
                Affects {change.affectedControls} controls in your framework
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {regulatoryServices.map((service, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    <Badge className={
                      service.status === "active" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-slate-500/20 text-slate-400"
                    }>
                      {service.status === "active" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                    <div>
                      <span className="text-slate-500">Jurisdictions:</span>
                      <span className="text-slate-300 ml-2">{service.jurisdictions.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Changes Tracked:</span>
                      <span className="text-slate-300 ml-2">{service.changesTracked}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Last Update:</span>
                      <span className="text-slate-300 ml-2">{service.lastUpdate}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {service.frameworks.map((fw, fIdx) => (
                      <Badge key={fIdx} className="bg-blue-500/20 text-blue-400 text-xs">
                        {fw}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Monitoring Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Email alerts for high-impact changes</Label>
              <p className="text-xs text-slate-400">Notify compliance team via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-update framework requirements</Label>
              <p className="text-xs text-slate-400">Update compliance mappings automatically</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Create assessment tasks for changes</Label>
              <p className="text-xs text-slate-400">Auto-create impact assessment tasks</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}