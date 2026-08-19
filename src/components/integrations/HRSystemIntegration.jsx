import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, CheckCircle2, Clock, UserCheck } from "lucide-react";

const hrSystems = [
  {
    name: "Workday",
    type: "HRIS",
    status: "connected",
    employees: 1243,
    lastSync: "15 minutes ago",
    features: ["Employee data", "Org structure", "Access reviews", "Policy attestations"]
  },
  {
    name: "BambooHR",
    type: "HR Management",
    status: "disconnected",
    employees: 0,
    lastSync: "Never",
    features: ["Employee records", "Onboarding", "Time off", "Performance"]
  },
  {
    name: "ADP Workforce",
    type: "Payroll & HR",
    status: "disconnected",
    employees: 0,
    lastSync: "Never",
    features: ["Payroll", "Benefits", "Compliance", "Time tracking"]
  },
  {
    name: "SAP SuccessFactors",
    type: "HCM Suite",
    status: "disconnected",
    employees: 0,
    lastSync: "Never",
    features: ["Core HR", "Talent management", "Learning", "Analytics"]
  }
];

const complianceActivities = [
  {
    activity: "Annual Security Awareness Training",
    dueDate: "2025-12-31",
    completionRate: 87,
    total: 1243,
    completed: 1081,
    status: "In Progress"
  },
  {
    activity: "Code of Conduct Attestation",
    dueDate: "2025-12-15",
    completionRate: 100,
    total: 1243,
    completed: 1243,
    status: "Complete"
  },
  {
    activity: "Acceptable Use Policy Review",
    dueDate: "2026-01-15",
    completionRate: 45,
    total: 1243,
    completed: 559,
    status: "In Progress"
  },
  {
    activity: "Data Privacy Training",
    dueDate: "2025-12-20",
    completionRate: 92,
    total: 1243,
    completed: 1144,
    status: "In Progress"
  }
];

const accessReviews = [
  {
    review: "Q4 2025 Access Certification",
    dueDate: "2025-12-31",
    reviewers: 45,
    completed: 32,
    status: "In Progress"
  },
  {
    review: "SOD Conflict Review",
    dueDate: "2025-12-15",
    reviewers: 12,
    completed: 12,
    status: "Complete"
  },
  {
    review: "Privileged Access Review",
    dueDate: "2026-01-10",
    reviewers: 8,
    completed: 3,
    status: "In Progress"
  }
];

export default function HRSystemIntegration() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-violet-400" />
            <div>
              <CardTitle className="text-white">HR Systems Integration</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Sync employee data for compliance, attestations, and access reviews</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-400" />
              Policy Attestations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {complianceActivities.map((activity, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-white text-sm">{activity.activity}</div>
                  <Badge className={
                    activity.status === "Complete" ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-blue-500/20 text-blue-400"
                  }>
                    {activity.status}
                  </Badge>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{activity.completed} / {activity.total}</span>
                    <span>{activity.completionRate}%</span>
                  </div>
                  <div className="h-2 bg-[#2a3548] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        activity.completionRate === 100 ? "bg-emerald-500" :
                        activity.completionRate >= 80 ? "bg-blue-500" :
                        "bg-amber-500"
                      }`}
                      style={{ width: `${activity.completionRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-500">Due: {activity.dueDate}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-400" />
              Access Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accessReviews.map((review, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-white text-sm">{review.review}</div>
                  <Badge className={
                    review.status === "Complete" ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-amber-500/20 text-amber-400"
                  }>
                    {review.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-slate-500">Reviewers:</span>
                    <span className="text-slate-300 ml-2">{review.reviewers}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Completed:</span>
                    <span className="text-slate-300 ml-2">{review.completed}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">Due: {review.dueDate}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {hrSystems.map((system, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white">{system.name}</h3>
                    <Badge className={
                      system.status === "connected" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-slate-500/20 text-slate-400"
                    }>
                      {system.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{system.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-xs">
                  <span className="text-slate-500">Employees Synced:</span>
                  <span className="text-slate-300 ml-2">{system.employees.toLocaleString()}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500">Last Sync:</span>
                  <span className="text-slate-300 ml-2">{system.lastSync}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">Integrated Features:</div>
                <div className="flex flex-wrap gap-1">
                  {system.features.map((feature, fIdx) => (
                    <Badge key={fIdx} className="bg-purple-500/20 text-purple-400 text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">HR Integration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-sync employee data</Label>
              <p className="text-xs text-slate-400">Sync employee records daily</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Trigger onboarding workflows</Label>
              <p className="text-xs text-slate-400">Auto-create onboarding tasks for new hires</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Sync org structure changes</Label>
              <p className="text-xs text-slate-400">Update reporting relationships automatically</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Automate access reviews</Label>
              <p className="text-xs text-slate-400">Create access review tasks based on role changes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Track policy attestations</Label>
              <p className="text-xs text-slate-400">Monitor policy acknowledgments and training completion</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}