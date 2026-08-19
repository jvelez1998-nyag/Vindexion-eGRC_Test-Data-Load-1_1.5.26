import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Search,
  AlertCircle,
  FileText,
  TrendingUp,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UATAIInsights from "./UATAIInsights";

export default function UATChecklist({ features }) {
  const [uatStatus, setUatStatus] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featurePriorities, setFeaturePriorities] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('uat_status');
    if (saved) {
      setUatStatus(JSON.parse(saved));
    }
    
    const savedPriorities = localStorage.getItem('uat_priorities');
    if (savedPriorities) {
      setFeaturePriorities(JSON.parse(savedPriorities));
    } else {
      // Auto-calculate initial priorities
      const calculated = {};
      features.forEach(f => {
        calculated[f.name] = calculateRiskPriority(f);
      });
      setFeaturePriorities(calculated);
      localStorage.setItem('uat_priorities', JSON.stringify(calculated));
    }
  }, [features]);

  const calculateRiskPriority = (feature) => {
    // Risk-based priority calculation
    const criticalModules = ['Risk Management', 'Compliance', 'Controls', 'Audits'];
    const highRiskKeywords = ['security', 'audit', 'compliance', 'critical', 'regulatory', 'financial'];
    
    let score = 0;
    
    // Module criticality
    if (criticalModules.includes(feature.module)) score += 3;
    
    // Description keywords
    const desc = (feature.description + ' ' + feature.name).toLowerCase();
    highRiskKeywords.forEach(keyword => {
      if (desc.includes(keyword)) score += 1;
    });
    
    // Capability count (more capabilities = higher impact)
    if (feature.capabilities?.length > 5) score += 2;
    else if (feature.capabilities?.length > 3) score += 1;
    
    // Integrations (more integration points = higher risk)
    if (feature.integrations?.length > 2) score += 2;
    else if (feature.integrations?.length > 0) score += 1;
    
    // Determine priority level
    if (score >= 7) return 'critical';
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  };

  const updatePriority = (featureName, priority) => {
    const updated = { ...featurePriorities, [featureName]: priority };
    setFeaturePriorities(updated);
    localStorage.setItem('uat_priorities', JSON.stringify(updated));
    toast.success(`Priority updated to ${priority}`);
  };

  const updateStatus = (featureName, status, notes = "") => {
    const newStatus = {
      ...uatStatus,
      [featureName]: {
        status,
        notes,
        testedBy: "Current User",
        testedDate: new Date().toISOString()
      }
    };
    setUatStatus(newStatus);
    localStorage.setItem('uat_status', JSON.stringify(newStatus));
  };

  const getStatusStats = () => {
    const total = features.length;
    const passed = Object.values(uatStatus).filter(s => s.status === 'passed').length;
    const failed = Object.values(uatStatus).filter(s => s.status === 'failed').length;
    const pending = total - passed - failed;
    const completion = Math.round((passed / total) * 100);
    
    return { total, passed, failed, pending, completion };
  };

  const exportUATReport = () => {
    const stats = getStatusStats();
    let report = `UAT Report - Vindexion eGRC Hub™\nGenerated: ${new Date().toLocaleString()}\n\n`;
    report += `=== Summary ===\n`;
    report += `Total Features: ${stats.total}\n`;
    report += `Passed: ${stats.passed}\n`;
    report += `Failed: ${stats.failed}\n`;
    report += `Pending: ${stats.pending}\n`;
    report += `Completion: ${stats.completion}%\n\n`;
    report += `=== Detailed Results ===\n\n`;
    
    features.forEach(feature => {
      const status = uatStatus[feature.name];
      report += `Feature: ${feature.name}\n`;
      report += `Module: ${feature.module}\n`;
      report += `Status: ${status?.status || 'pending'}\n`;
      if (status?.notes) report += `Notes: ${status.notes}\n`;
      if (status?.testedDate) report += `Tested: ${new Date(status.testedDate).toLocaleString()}\n`;
      report += `\n`;
    });
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uat-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFeatures = features
    .filter(feature => {
      const matchesSearch = search === "" || 
        feature.name.toLowerCase().includes(search.toLowerCase()) ||
        feature.module.toLowerCase().includes(search.toLowerCase());
      
      const status = uatStatus[feature.name]?.status || 'pending';
      const matchesFilter = filterStatus === 'all' || status === filterStatus;
      
      const priority = featurePriorities[feature.name] || 'medium';
      const matchesPriority = filterPriority === 'all' || priority === filterPriority;
      
      return matchesSearch && matchesFilter && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aPriority = priorityOrder[featurePriorities[a.name] || 'medium'];
        const bPriority = priorityOrder[featurePriorities[b.name] || 'medium'];
        return aPriority - bPriority;
      } else if (sortBy === 'status') {
        const statusOrder = { failed: 0, pending: 1, passed: 2 };
        const aStatus = statusOrder[uatStatus[a.name]?.status || 'pending'];
        const bStatus = statusOrder[uatStatus[b.name]?.status || 'pending'];
        return aStatus - bStatus;
      } else if (sortBy === 'module') {
        return a.module.localeCompare(b.module);
      }
      return 0;
    });

  const stats = getStatusStats();

  const statusColors = {
    passed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    failed: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    pending: "bg-slate-500/20 text-slate-400 border-slate-500/30"
  };

  const priorityColors = {
    critical: "bg-rose-500 text-white",
    high: "bg-amber-500 text-white",
    medium: "bg-blue-500 text-white",
    low: "bg-slate-500 text-white"
  };

  const priorityIcons = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "⚪"
  };

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <UATAIInsights features={features} uatStatus={uatStatus} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Features</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Passed</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.passed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Failed</p>
                <p className="text-2xl font-bold text-rose-400">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-rose-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-500/10 to-slate-600/10 border-slate-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-slate-400">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Completion</p>
                <p className="text-2xl font-bold text-blue-400">{stats.completion}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-white font-semibold">{stats.completion}%</span>
            </div>
            <div className="h-3 bg-[#0f1623] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completion}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search features..."
                className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40 bg-[#0f1623] border-[#2a3548]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-40 bg-[#0f1623] border-[#2a3548]">
                <AlertCircle className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">🔴 Critical</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="low">⚪ Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 bg-[#0f1623] border-[#2a3548]">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="priority">Sort: Priority</SelectItem>
                <SelectItem value="status">Sort: Status</SelectItem>
                <SelectItem value="module">Sort: Module</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportUATReport} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UAT Checklist */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-white">UAT Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredFeatures.map((feature, idx) => {
                const status = uatStatus[feature.name];
                const priority = featurePriorities[feature.name] || 'medium';
                const isSelected = selectedFeature === feature.name;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <Card className={`bg-[#0f1623] border-[#2a3548] hover:border-indigo-500/30 transition-all ${
                      isSelected ? 'ring-2 ring-indigo-500/50' : ''
                    } ${priority === 'critical' ? 'border-l-4 border-l-rose-500' : priority === 'high' ? 'border-l-4 border-l-amber-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Feature Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge className={`text-xs ${priorityColors[priority]} font-semibold`}>
                                  {priorityIcons[priority]} {priority.toUpperCase()}
                                </Badge>
                                <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                                  {feature.module}
                                </Badge>
                                <Badge className={`text-xs border ${statusColors[status?.status || 'pending']}`}>
                                  {status?.status || 'pending'}
                                </Badge>
                              </div>
                              <h4 className="text-sm font-semibold text-white mb-1">{feature.name}</h4>
                              <p className="text-xs text-slate-400 line-clamp-2">{feature.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Select value={priority} onValueChange={(val) => updatePriority(feature.name, val)}>
                                <SelectTrigger className="w-24 h-8 text-xs bg-[#1a2332] border-[#2a3548]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                                  <SelectItem value="critical">🔴 Critical</SelectItem>
                                  <SelectItem value="high">🟠 High</SelectItem>
                                  <SelectItem value="medium">🟡 Medium</SelectItem>
                                  <SelectItem value="low">⚪ Low</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFeature(isSelected ? null : feature.name)}
                                className="text-indigo-400 hover:text-indigo-300"
                              >
                                {isSelected ? 'Hide' : 'Test'}
                              </Button>
                            </div>
                          </div>

                          {/* Testing Interface */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4 pt-4 border-t border-[#2a3548]"
                            >
                              <div>
                                <Label className="text-white text-xs mb-2 block">Test Capabilities:</Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {feature.capabilities.map((cap, capIdx) => (
                                    <div key={capIdx} className="flex items-start gap-2 text-xs text-slate-300 p-2 bg-[#1a2332] rounded">
                                      <Checkbox className="mt-0.5" />
                                      <span>{cap}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <Label htmlFor={`notes-${idx}`} className="text-white text-xs mb-2 block">Test Notes:</Label>
                                <Textarea
                                  id={`notes-${idx}`}
                                  defaultValue={status?.notes || ""}
                                  placeholder="Add testing notes, observations, or issues..."
                                  className="bg-[#1a2332] border-[#2a3548] text-white text-xs h-20"
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    const notes = document.getElementById(`notes-${idx}`).value;
                                    updateStatus(feature.name, 'passed', notes);
                                  }}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                  size="sm"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Pass
                                </Button>
                                <Button
                                  onClick={() => {
                                    const notes = document.getElementById(`notes-${idx}`).value;
                                    updateStatus(feature.name, 'failed', notes);
                                  }}
                                  className="flex-1 bg-rose-600 hover:bg-rose-700"
                                  size="sm"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Fail
                                </Button>
                                <Button
                                  onClick={() => {
                                    updateStatus(feature.name, 'pending', '');
                                    setSelectedFeature(null);
                                  }}
                                  variant="outline"
                                  className="border-[#2a3548]"
                                  size="sm"
                                >
                                  Reset
                                </Button>
                              </div>

                              {status?.testedDate && (
                                <p className="text-xs text-slate-500">
                                  Last tested: {new Date(status.testedDate).toLocaleString()}
                                </p>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}