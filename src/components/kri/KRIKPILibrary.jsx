import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, TrendingUp, Shield, Activity, AlertTriangle, CheckCircle2, Target, Brain, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const KRI_KPI_LIBRARY = {
  cybersecurity: [
    {
      name: "Mean Time to Detect (MTTD)",
      type: "kri",
      category: "cybersecurity",
      description: "Average time taken to detect security incidents",
      metric: "Hours from incident occurrence to detection",
      unit: "hours",
      direction: "lower_better",
      threshold_green: 2,
      threshold_amber: 8,
      threshold_red: 24,
      calculation_method: "Average time between incident timestamp and detection timestamp"
    },
    {
      name: "Mean Time to Respond (MTTR)",
      type: "kri",
      category: "cybersecurity",
      description: "Average time to respond to and contain security incidents",
      metric: "Hours from detection to containment",
      unit: "hours",
      direction: "lower_better",
      threshold_green: 4,
      threshold_amber: 12,
      threshold_red: 48,
      calculation_method: "Average time from detection to incident containment"
    },
    {
      name: "Unpatched Critical Vulnerabilities",
      type: "kri",
      category: "cybersecurity",
      description: "Number of critical vulnerabilities not yet patched",
      metric: "Count of unpatched CVE with CVSS >= 7.0",
      unit: "count",
      direction: "lower_better",
      threshold_green: 0,
      threshold_amber: 5,
      threshold_red: 10,
      calculation_method: "Count of vulnerabilities with severity >= critical and patch_status = pending"
    },
    {
      name: "Phishing Click Rate",
      type: "kri",
      category: "cybersecurity",
      description: "Percentage of employees clicking phishing simulation links",
      metric: "Phishing test failures",
      unit: "percentage",
      direction: "lower_better",
      threshold_green: 5,
      threshold_amber: 15,
      threshold_red: 25,
      calculation_method: "(Failed phishing tests / Total tests sent) × 100"
    },
    {
      name: "Security Awareness Training Completion",
      type: "kpi",
      category: "cybersecurity",
      description: "Percentage of employees who completed security training",
      metric: "Training completion rate",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 95,
      threshold_amber: 80,
      threshold_red: 70,
      calculation_method: "(Completed trainings / Total employees) × 100"
    },
    {
      name: "Failed Login Attempts",
      type: "kri",
      category: "cybersecurity",
      description: "Number of failed authentication attempts indicating potential attacks",
      metric: "Failed logins per day",
      unit: "count",
      direction: "lower_better",
      threshold_green: 50,
      threshold_amber: 200,
      threshold_red: 500,
      calculation_method: "Daily count of authentication failures across all systems"
    },
    {
      name: "Privileged Access Review Compliance",
      type: "kci",
      category: "cybersecurity",
      description: "Percentage of privileged accounts reviewed on schedule",
      metric: "Access review completion",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 100,
      threshold_amber: 90,
      threshold_red: 80,
      calculation_method: "(Reviewed privileged accounts / Total privileged accounts) × 100"
    }
  ],
  operational: [
    {
      name: "Control Testing Coverage",
      type: "kci",
      category: "operational",
      description: "Percentage of controls tested within the defined period",
      metric: "Control testing completion rate",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 95,
      threshold_amber: 85,
      threshold_red: 75,
      calculation_method: "(Tested controls / Total active controls) × 100"
    },
    {
      name: "Control Failure Rate",
      type: "kri",
      category: "operational",
      description: "Percentage of controls that failed during testing",
      metric: "Failed control tests",
      unit: "percentage",
      direction: "lower_better",
      threshold_green: 2,
      threshold_amber: 5,
      threshold_red: 10,
      calculation_method: "(Failed control tests / Total control tests) × 100"
    },
    {
      name: "Incident Response Time",
      type: "kpi",
      category: "operational",
      description: "Average time to close operational incidents",
      metric: "Incident resolution time",
      unit: "hours",
      direction: "lower_better",
      threshold_green: 24,
      threshold_amber: 72,
      threshold_red: 168,
      calculation_method: "Average hours from incident creation to closure"
    },
    {
      name: "Process Deviation Rate",
      type: "kri",
      category: "operational",
      description: "Percentage of instances where standard processes were not followed",
      metric: "Process compliance violations",
      unit: "percentage",
      direction: "lower_better",
      threshold_green: 1,
      threshold_amber: 3,
      threshold_red: 5,
      calculation_method: "(Process deviations / Total process executions) × 100"
    },
    {
      name: "System Availability",
      type: "kpi",
      category: "operational",
      description: "Percentage of time critical systems are available",
      metric: "System uptime",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 99.9,
      threshold_amber: 99.5,
      threshold_red: 99,
      calculation_method: "(Available time / Total time) × 100"
    },
    {
      name: "Change Success Rate",
      type: "kpi",
      category: "operational",
      description: "Percentage of changes implemented without issues",
      metric: "Successful changes",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 95,
      threshold_amber: 90,
      threshold_red: 85,
      calculation_method: "(Successful changes / Total changes) × 100"
    }
  ],
  compliance: [
    {
      name: "Regulatory Findings Closure Rate",
      type: "kpi",
      category: "compliance",
      description: "Percentage of regulatory findings closed on time",
      metric: "On-time finding remediation",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 95,
      threshold_amber: 85,
      threshold_red: 75,
      calculation_method: "(Findings closed on time / Total findings) × 100"
    },
    {
      name: "Overdue Compliance Actions",
      type: "kri",
      category: "compliance",
      description: "Number of compliance actions past their due date",
      metric: "Late compliance tasks",
      unit: "count",
      direction: "lower_better",
      threshold_green: 0,
      threshold_amber: 3,
      threshold_red: 10,
      calculation_method: "Count of compliance actions where current_date > due_date"
    },
    {
      name: "Policy Exception Rate",
      type: "kri",
      category: "compliance",
      description: "Percentage of policy exceptions granted",
      metric: "Policy deviations",
      unit: "percentage",
      direction: "lower_better",
      threshold_green: 1,
      threshold_amber: 3,
      threshold_red: 5,
      calculation_method: "(Policy exceptions / Total policy reviews) × 100"
    },
    {
      name: "Audit Readiness Score",
      type: "kpi",
      category: "compliance",
      description: "Overall readiness score for upcoming audits",
      metric: "Audit preparedness",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 90,
      threshold_amber: 75,
      threshold_red: 60,
      calculation_method: "Weighted average of documentation, testing, and remediation completion"
    },
    {
      name: "Compliance Framework Coverage",
      type: "kpi",
      category: "compliance",
      description: "Percentage of framework requirements addressed",
      metric: "Framework implementation",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 95,
      threshold_amber: 85,
      threshold_red: 75,
      calculation_method: "(Implemented controls / Total framework requirements) × 100"
    },
    {
      name: "Data Privacy Incidents",
      type: "kri",
      category: "compliance",
      description: "Number of data privacy incidents requiring notification",
      metric: "Privacy breaches",
      unit: "count",
      direction: "lower_better",
      threshold_green: 0,
      threshold_amber: 1,
      threshold_red: 3,
      calculation_method: "Count of incidents involving PII/PHI requiring regulatory notification"
    }
  ],
  financial: [
    {
      name: "Budget Variance",
      type: "kri",
      category: "financial",
      description: "Percentage deviation from approved budget",
      metric: "Budget deviation",
      unit: "percentage",
      direction: "lower_better",
      threshold_green: 5,
      threshold_amber: 10,
      threshold_red: 15,
      calculation_method: "|(Actual spend - Budgeted amount) / Budgeted amount| × 100"
    },
    {
      name: "Revenue Recognition Accuracy",
      type: "kpi",
      category: "financial",
      description: "Accuracy of revenue recognition processes",
      metric: "Recognition accuracy",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 99,
      threshold_amber: 97,
      threshold_red: 95,
      calculation_method: "(Correct recognitions / Total recognitions) × 100"
    },
    {
      name: "Days Sales Outstanding (DSO)",
      type: "kpi",
      category: "financial",
      description: "Average days to collect accounts receivable",
      metric: "Collection period",
      unit: "days",
      direction: "lower_better",
      threshold_green: 30,
      threshold_amber: 45,
      threshold_red: 60,
      calculation_method: "(Accounts receivable / Total credit sales) × Number of days"
    },
    {
      name: "Financial Close Cycle Time",
      type: "kpi",
      category: "financial",
      description: "Days required to complete financial close",
      metric: "Close duration",
      unit: "days",
      direction: "lower_better",
      threshold_green: 5,
      threshold_amber: 7,
      threshold_red: 10,
      calculation_method: "Days from period end to financial statements completion"
    },
    {
      name: "Restatement Risk Indicator",
      type: "kri",
      category: "financial",
      description: "Number of significant accounting adjustments post-close",
      metric: "Post-close adjustments",
      unit: "count",
      direction: "lower_better",
      threshold_green: 0,
      threshold_amber: 2,
      threshold_red: 5,
      calculation_method: "Count of material adjustments after financial statement issuance"
    }
  ],
  third_party: [
    {
      name: "Vendor Risk Assessment Completion",
      type: "kci",
      category: "third_party",
      description: "Percentage of vendors with completed risk assessments",
      metric: "Assessment coverage",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 100,
      threshold_amber: 90,
      threshold_red: 80,
      calculation_method: "(Assessed vendors / Total active vendors) × 100"
    },
    {
      name: "High-Risk Vendor Count",
      type: "kri",
      category: "third_party",
      description: "Number of vendors classified as high risk",
      metric: "High-risk vendors",
      unit: "count",
      direction: "lower_better",
      threshold_green: 2,
      threshold_amber: 5,
      threshold_red: 10,
      calculation_method: "Count of vendors with risk_score >= high"
    },
    {
      name: "Vendor SLA Compliance",
      type: "kpi",
      category: "third_party",
      description: "Percentage of vendors meeting SLA requirements",
      metric: "SLA adherence",
      unit: "percentage",
      direction: "higher_better",
      threshold_green: 95,
      threshold_amber: 90,
      threshold_red: 85,
      calculation_method: "(Vendors meeting SLA / Total vendors with SLA) × 100"
    },
    {
      name: "Vendor Contract Renewals Pending",
      type: "kri",
      category: "third_party",
      description: "Number of vendor contracts requiring renewal within 90 days",
      metric: "Contracts expiring soon",
      unit: "count",
      direction: "lower_better",
      threshold_green: 0,
      threshold_amber: 3,
      threshold_red: 10,
      calculation_method: "Count of contracts where expiry_date - current_date <= 90 days"
    },
    {
      name: "Vendor Incident Rate",
      type: "kri",
      category: "third_party",
      description: "Number of incidents caused by third-party vendors",
      metric: "Vendor-caused incidents",
      unit: "count",
      direction: "lower_better",
      threshold_green: 0,
      threshold_amber: 1,
      threshold_red: 3,
      calculation_method: "Monthly count of incidents where root_cause = vendor"
    }
  ]
};

export default function KRIKPILibrary({ onImport }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (indicator) => {
      return await base44.entities.KeyIndicator.create({
        name: indicator.name,
        indicator_type: indicator.type,
        description: indicator.description,
        metric: indicator.metric,
        unit: indicator.unit,
        direction: indicator.direction,
        threshold_green: indicator.threshold_green,
        threshold_amber: indicator.threshold_amber,
        threshold_red: indicator.threshold_red,
        calculation_method: indicator.calculation_method,
        status: "active"
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['key-indicators'] });
      toast.success(`Imported: ${variables.name}`);
      onImport?.(data);
    }
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (indicators) => {
      const promises = indicators.map(ind => 
        base44.entities.KeyIndicator.create({
          name: ind.name,
          indicator_type: ind.type,
          description: ind.description,
          metric: ind.metric,
          unit: ind.unit,
          direction: ind.direction,
          threshold_green: ind.threshold_green,
          threshold_amber: ind.threshold_amber,
          threshold_red: ind.threshold_red,
          calculation_method: ind.calculation_method,
          status: "active"
        })
      );
      return await Promise.all(promises);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['key-indicators'] });
      toast.success(`Imported ${data.length} indicators`);
    }
  });

  const allIndicators = Object.values(KRI_KPI_LIBRARY).flat();

  const filteredIndicators = allIndicators.filter(ind => {
    const matchesSearch = ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ind.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ind.category === selectedCategory;
    const matchesType = selectedType === "all" || ind.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(allIndicators.map(i => i.category))];

  const getTypeIcon = (type) => {
    switch(type) {
      case 'kri': return <AlertTriangle className="h-4 w-4" />;
      case 'kpi': return <TrendingUp className="h-4 w-4" />;
      case 'kci': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'kri': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'kpi': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'kci': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const categoryStats = categories.map(cat => ({
    name: cat,
    count: allIndicators.filter(i => i.category === cat).length,
    kri: allIndicators.filter(i => i.category === cat && i.type === 'kri').length,
    kpi: allIndicators.filter(i => i.category === cat && i.type === 'kpi').length,
    kci: allIndicators.filter(i => i.category === cat && i.type === 'kci').length
  }));

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <Brain className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">KRI/KPI/KCI Library</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Industry-standard indicators ready to import</p>
              </div>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              {allIndicators.length} Indicators
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{allIndicators.filter(i => i.type === 'kri').length}</div>
                  <div className="text-xs text-rose-400">Key Risk Indicators</div>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{allIndicators.filter(i => i.type === 'kpi').length}</div>
                  <div className="text-xs text-blue-400">Key Performance Indicators</div>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <Shield className="h-5 w-5 text-emerald-400" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{allIndicators.filter(i => i.type === 'kci').length}</div>
                  <div className="text-xs text-emerald-400">Key Control Indicators</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Category Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryStats.map(cat => (
              <div key={cat.name} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <h4 className="text-sm font-semibold text-white capitalize mb-2">{cat.name.replace(/_/g, ' ')}</h4>
                <div className="flex items-center gap-2 text-xs">
                  <Badge className="bg-rose-500/20 text-rose-400 text-[10px]">KRI: {cat.kri}</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">KPI: {cat.kpi}</Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">KCI: {cat.kci}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search indicators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#151d2e] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-white capitalize">
                    {cat.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-32 bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#151d2e] border-[#2a3548]">
                <SelectItem value="all" className="text-white">All Types</SelectItem>
                <SelectItem value="kri" className="text-white">KRI</SelectItem>
                <SelectItem value="kpi" className="text-white">KPI</SelectItem>
                <SelectItem value="kci" className="text-white">KCI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">{filteredIndicators.length} indicators found</p>
            <Button
              onClick={() => bulkImportMutation.mutate(filteredIndicators)}
              disabled={bulkImportMutation.isPending || filteredIndicators.length === 0}
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Import All ({filteredIndicators.length})
            </Button>
          </div>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredIndicators.map((indicator, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/40 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-lg ${getTypeColor(indicator.type)}`}>
                            {getTypeIcon(indicator.type)}
                          </div>
                          <h4 className="text-sm font-semibold text-white">{indicator.name}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{indicator.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="text-[9px] bg-slate-500/20 text-slate-400 capitalize">
                            {indicator.category.replace(/_/g, ' ')}
                          </Badge>
                          <Badge className={`text-[9px] ${getTypeColor(indicator.type)} uppercase`}>
                            {indicator.type}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => importMutation.mutate(indicator)}
                        disabled={importMutation.isPending}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 ml-3"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Import
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Metric:</span>
                        <p className="text-white text-[10px]">{indicator.metric}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Unit:</span>
                        <p className="text-white text-[10px]">{indicator.unit}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Direction:</span>
                        <p className="text-white text-[10px] capitalize">{indicator.direction.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Thresholds:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="flex items-center gap-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-[9px] text-white">{indicator.threshold_green}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-[9px] text-white">{indicator.threshold_amber}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <div className="w-2 h-2 rounded-full bg-rose-400" />
                            <span className="text-[9px] text-white">{indicator.threshold_red}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}