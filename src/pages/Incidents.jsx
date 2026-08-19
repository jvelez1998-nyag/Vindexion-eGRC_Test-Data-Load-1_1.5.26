import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAIPersonalization } from "@/components/personalization/AIPersonalizationEngine";
import PersonalizedSuggestions from "@/components/personalization/PersonalizedSuggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Search, AlertOctagon, ArrowUpDown, Download, 
  TrendingUp, Clock, CheckCircle2, AlertTriangle, FileText, Target,
  Activity, Shield, Zap, ClipboardList, BookOpen, Book, Brain, HelpCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import IncidentCard from "@/components/incidents/IncidentCard";
import IncidentForm from "@/components/incidents/IncidentForm";
import IncidentDashboard from "@/components/incidents/IncidentDashboard";
import IncidentReportingEngine from "@/components/incidents/IncidentReportingEngine";
import IncidentResponsePlanner from "@/components/incidents/IncidentResponsePlanner";
import IncidentAutomation from "@/components/incidents/IncidentAutomation";
import EntitySummaryDialog from "@/components/ai/EntitySummaryDialog";
import FloatingChatbot from "@/components/ai/FloatingChatbot";
import AIIncidentAnalyzer from "@/components/incidents/AIIncidentAnalyzer";
import PredictiveIncidentAnalysis from "@/components/incidents/PredictiveIncidentAnalysis";
import AIThreatHunting from "@/components/threat-intel/AIThreatHunting";
import ThreatIntelligenceFeed from "@/components/threat-intel/ThreatIntelligenceFeed";
import CollaborationPanel from "@/components/collaboration/CollaborationPanel";
import IncidentStudyGuide from "@/components/incidents/IncidentStudyGuide";
import IncidentResponsePlaybooks from "@/components/incidents/IncidentResponsePlaybooks";
import AIIncidentSimulator from "@/components/incidents/AIIncidentSimulator";
import IncidentUserGuide from "@/components/incidents/IncidentUserGuide";
import AIIncidentWorkflowEngine from "@/components/incidents/AIIncidentWorkflowEngine";
import IncidentAIInsightsPanel from "@/components/incidents/IncidentAIInsightsPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Incidents() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [formOpen, setFormOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedIncidentForSummary, setSelectedIncidentForSummary] = useState(null);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [analyzingIncident, setAnalyzingIncident] = useState(null);
  const [threatIntel, setThreatIntel] = useState(null);
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [selectedIncidentForCollab, setSelectedIncidentForCollab] = useState(null);
  const [workflowAnalysisOpen, setWorkflowAnalysisOpen] = useState(false);
  const [selectedIncidentForWorkflow, setSelectedIncidentForWorkflow] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setUserEmail(user?.email || null);
      } catch (err) {
        setUserEmail(null);
      }
    };
    loadUser();
  }, []);

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const data = await base44.entities.Incident.list('-reported_date', 100);
      return data || [];
    },
    staleTime: 60000
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 120000
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 120000
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const data = await base44.entities.Compliance.list('-updated_date', 50);
      return data || [];
    },
    staleTime: 120000
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: async () => {
      const data = await base44.entities.AuditFinding.list('-created_date', 50);
      return data || [];
    },
    staleTime: 120000
  });

  const aggregatedData = {
    incidents,
    risks,
    controls,
    compliance
  };

  const {
    preferences,
    loading: personalizationLoading,
    trackInteraction,
    getPrioritizedData
  } = useAIPersonalization(userEmail, aggregatedData);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Incident.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setFormOpen(false);
      toast.success("Incident reported");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Incident.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setFormOpen(false);
      setEditingIncident(null);
      toast.success("Incident updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Incident.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success("Incident deleted");
    }
  });

  const handleSubmit = (data) => {
    if (editingIncident) {
      updateMutation.mutate({ id: editingIncident.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (incident) => {
    setEditingIncident(incident);
    setFormOpen(true);
  };

  const handleDelete = (incident) => {
    if (confirm(`Delete incident "${incident.title}"?`)) {
      deleteMutation.mutate(incident.id);
    }
  };

  const handleAnalyze = (incident) => {
    setAnalyzingIncident(incident);
    setAnalyzerOpen(true);
    trackInteraction('incident', incident.incident_type, incident.severity, incident.id);
  };

  const handleApplyAISuggestions = (suggestions) => {
    if (analyzingIncident) {
      const updatedData = { ...analyzingIncident, ...suggestions };
      updateMutation.mutate({ id: analyzingIncident.id, data: updatedData });
    }
  };

  const prioritizedIncidents = preferences ? getPrioritizedData(incidents, 'incident') : incidents;

  const filteredIncidents = useMemo(() => {
    let result = prioritizedIncidents.filter(incident => {
      const matchesSearch = !search || 
        incident.title?.toLowerCase().includes(search.toLowerCase()) ||
        incident.description?.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(incident.affected_systems) && incident.affected_systems.some(sys => sys?.toLowerCase().includes(search.toLowerCase())));
      const matchesType = typeFilter === "all" || incident.incident_type === typeFilter;
      const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': return new Date(b.occurred_date || b.created_date) - new Date(a.occurred_date || a.created_date);
        case 'date_asc': return new Date(a.occurred_date || a.created_date) - new Date(b.occurred_date || b.created_date);
        case 'severity_desc': {
          const order = { critical: 4, high: 3, medium: 2, low: 1 };
          return (order[b.severity] || 0) - (order[a.severity] || 0);
        }
        case 'severity_asc': {
          const order = { critical: 4, high: 3, medium: 2, low: 1 };
          return (order[a.severity] || 0) - (order[b.severity] || 0);
        }
        default: return 0;
      }
    });
    return result;
    }, [prioritizedIncidents, search, typeFilter, severityFilter, statusFilter, sortBy]);

  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const highCount = incidents.filter(i => i.severity === 'high').length;
  const openCount = incidents.filter(i => !['closed', 'remediated'].includes(i.status)).length;
  const avgResolutionTime = (() => {
    const closed = incidents.filter(i => i.status === 'closed' && i.resolution_date && i.occurred_date);
    if (closed.length === 0) return 'N/A';
    const totalDays = closed.reduce((sum, i) => sum + (new Date(i.resolution_date) - new Date(i.occurred_date)) / (1000 * 60 * 60 * 24), 0);
    return `${Math.round(totalDays / closed.length)}d`;
  })();

  const exportIncidents = () => {
    const data = filteredIncidents.map(i => ({
      Title: i.title,
      Type: i.incident_type,
      Severity: i.severity,
      Status: i.status,
      Priority: i.priority,
      'Occurred Date': i.occurred_date,
      'Assigned To': i.assigned_to,
      'Regulatory Reportable': i.regulatory_reportable ? 'Yes' : 'No',
      Description: i.description
    }));
    const csv = [Object.keys(data[0] || {}).join(','), ...data.map(row => Object.values(row).map(v => `"${v || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1623] p-6">
        <Skeleton className="h-10 w-64 bg-[#1a2332] mb-6" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 bg-[#1a2332]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623] overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/10 via-red-500/10 to-orange-500/10 border border-rose-500/20 p-6">
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="mb-3">
              <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Vindexion eGRC<sup className="text-[7px]">™</sup></h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30 shadow-lg shadow-rose-500/20">
                  <AlertOctagon className="h-7 w-7 text-rose-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-rose-200 to-red-300 bg-clip-text text-transparent">
                    Incident Management Center
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">AI-powered reporting, response & analysis</p>
                </div>
              </div>
              {/* KPIs in Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 text-center">
                  <div className="text-xs text-slate-400">Critical</div>
                  <div className="text-lg font-bold text-rose-400">{criticalCount}</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                  <div className="text-xs text-slate-400">High</div>
                  <div className="text-lg font-bold text-amber-400">{highCount}</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                  <div className="text-xs text-slate-400">Open</div>
                  <div className="text-lg font-bold text-blue-400">{openCount}</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-center">
                  <div className="text-xs text-slate-400">Avg Time</div>
                  <div className="text-lg font-bold text-emerald-400">{avgResolutionTime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <IncidentAIInsightsPanel 
          incidents={incidents}
          risks={risks}
          controls={controls}
        />

        {/* AI Personalized Suggestions */}
        {preferences?.ai_suggestions && preferences.ai_suggestions.length > 0 && (
          <div className="-mb-2">
            <PersonalizedSuggestions 
              suggestions={preferences.ai_suggestions.filter(s => s.entity_type === 'incident' || !s.entity_type)}
              onAction={(suggestion) => {
                if (suggestion.entity_type === 'incident') {
                  setActiveTab('reporting');
                }
              }}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-14 z-40 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-[#0f1623]/95 backdrop-blur-xl border-b border-[#2a3548]">
            <div className="overflow-x-auto scrollbar-thin">
              <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1 inline-flex gap-1 min-w-max">
              <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30 text-xs h-8">
                <ClipboardList className="h-3 w-3 mr-1.5" />
                Register
              </TabsTrigger>
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30 text-xs h-8">
                <Activity className="h-3 w-3 mr-1.5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="reporting" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400 data-[state=active]:border data-[state=active]:border-amber-500/30 text-xs h-8">
                <AlertTriangle className="h-3 w-3 mr-1.5" />
                Report
              </TabsTrigger>
              <TabsTrigger value="response" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30 text-xs h-8">
                <Shield className="h-3 w-3 mr-1.5" />
                Response
              </TabsTrigger>
              <TabsTrigger value="simulator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-fuchsia-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 text-xs h-8">
                <Brain className="h-3 w-3 mr-1.5" />
                AI Tools
              </TabsTrigger>
              <TabsTrigger value="playbooks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/30 text-xs h-8">
                <Book className="h-3 w-3 mr-1.5" />
                Playbooks
              </TabsTrigger>
              <TabsTrigger value="automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30 text-xs h-8">
                <Zap className="h-3 w-3 mr-1.5" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="study" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30 text-xs h-8">
                <BookOpen className="h-3 w-3 mr-1.5" />
                Study
              </TabsTrigger>
              <TabsTrigger value="guide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-teal-400 data-[state=active]:border data-[state=active]:border-teal-500/30 text-xs h-8">
                <HelpCircle className="h-3 w-3 mr-1.5" />
                Guide
              </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview">
            <IncidentDashboard
              incidents={incidents}
              onIncidentClick={handleEdit}
              onStartNew={() => setActiveTab('reporting')}
            />
          </TabsContent>

          <TabsContent value="reporting">
            <IncidentReportingEngine
              onComplete={(data) => {
                createMutation.mutate(data);
                setActiveTab('register');
              }}
            />
          </TabsContent>

          <TabsContent value="response">
            <IncidentResponsePlanner incidents={incidents} />
          </TabsContent>

          <TabsContent value="automation">
            <IncidentAutomation />
          </TabsContent>

          <TabsContent value="simulator">
            <AIIncidentSimulator />
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            {/* Header Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => { setEditingIncident(null); setFormOpen(true); }} size="sm" className="gap-1.5 bg-gradient-to-r from-rose-500/20 to-red-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 shadow-lg shadow-rose-500/20">
                <Plus className="h-3 w-3" />
                Report
              </Button>
              <Button onClick={() => {
                if (filteredIncidents.length > 0) {
                  setSelectedIncidentForSummary({ title: "Incidents Portfolio", incidents: filteredIncidents });
                  setSummaryOpen(true);
                } else {
                  toast.error("No incidents to summarize");
                }
              }} size="sm" className="gap-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30">
                <FileText className="h-3 w-3" />
                Summary
              </Button>
              <Button size="sm" onClick={exportIncidents} className="gap-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30">
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>

            {/* Filters */}
            <Card className="bg-[#1a2332] border-[#2a3548] p-5">
              <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search incidents..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#151d2e] border-[#2a3548] text-slate-300 placeholder:text-slate-500"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-[#151d2e] border-[#2a3548] text-slate-300">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-slate-300 hover:bg-[#2a3548]">All Types</SelectItem>
                <SelectItem value="security_breach" className="text-slate-300 hover:bg-[#2a3548]">Security Breach</SelectItem>
                <SelectItem value="data_leak" className="text-slate-300 hover:bg-[#2a3548]">Data Leak</SelectItem>
                <SelectItem value="system_outage" className="text-slate-300 hover:bg-[#2a3548]">System Outage</SelectItem>
                <SelectItem value="policy_violation" className="text-slate-300 hover:bg-[#2a3548]">Policy Violation</SelectItem>
                <SelectItem value="compliance_breach" className="text-slate-300 hover:bg-[#2a3548]">Compliance Breach</SelectItem>
                <SelectItem value="fraud" className="text-slate-300 hover:bg-[#2a3548]">Fraud</SelectItem>
                <SelectItem value="other" className="text-slate-300 hover:bg-[#2a3548]">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-36 bg-[#151d2e] border-[#2a3548] text-slate-300">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-slate-300 hover:bg-[#2a3548]">All Severity</SelectItem>
                <SelectItem value="critical" className="text-slate-300 hover:bg-[#2a3548]">Critical</SelectItem>
                <SelectItem value="high" className="text-slate-300 hover:bg-[#2a3548]">High</SelectItem>
                <SelectItem value="medium" className="text-slate-300 hover:bg-[#2a3548]">Medium</SelectItem>
                <SelectItem value="low" className="text-slate-300 hover:bg-[#2a3548]">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-[#151d2e] border-[#2a3548] text-slate-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all" className="text-slate-300 hover:bg-[#2a3548]">All Status</SelectItem>
                <SelectItem value="reported" className="text-slate-300 hover:bg-[#2a3548]">Reported</SelectItem>
                <SelectItem value="triaging" className="text-slate-300 hover:bg-[#2a3548]">Triaging</SelectItem>
                <SelectItem value="investigating" className="text-slate-300 hover:bg-[#2a3548]">Investigating</SelectItem>
                <SelectItem value="contained" className="text-slate-300 hover:bg-[#2a3548]">Contained</SelectItem>
                <SelectItem value="remediated" className="text-slate-300 hover:bg-[#2a3548]">Remediated</SelectItem>
                <SelectItem value="closed" className="text-slate-300 hover:bg-[#2a3548]">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a3548]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 bg-[#151d2e] border-[#2a3548] text-slate-300 h-8 text-xs">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="date_desc" className="text-slate-300 hover:bg-[#2a3548] text-xs">Newest First</SelectItem>
                <SelectItem value="date_asc" className="text-slate-300 hover:bg-[#2a3548] text-xs">Oldest First</SelectItem>
                <SelectItem value="severity_desc" className="text-slate-300 hover:bg-[#2a3548] text-xs">Severity ↓</SelectItem>
                <SelectItem value="severity_asc" className="text-slate-300 hover:bg-[#2a3548] text-xs">Severity ↑</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-500">{filteredIncidents.length} of {incidents.length} incidents</span>
          </div>
            </Card>

            {/* Content */}
            {filteredIncidents.length === 0 ? (
          <div className="text-center py-16 rounded-xl bg-[#1a2332] border border-[#2a3548]">
            <AlertOctagon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No incidents found</h3>
            <p className="text-slate-500 mt-1">Report your first incident to get started</p>
            <Button onClick={() => setFormOpen(true)} className="mt-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredIncidents.map(incident => (
              <IncidentCard 
                key={incident.id} 
                incident={incident} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAnalyze={handleAnalyze}
                onGenerateSummary={() => {
                  setSelectedIncidentForSummary(incident);
                  setSummaryOpen(true);
                }}
                onCollaborate={(incident) => {
                  setSelectedIncidentForCollab(incident);
                  setCollaborationOpen(true);
                }}
                onWorkflowAnalysis={(incident) => {
                  setSelectedIncidentForWorkflow(incident);
                  setWorkflowAnalysisOpen(true);
                }}
              />
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="playbooks">
            <IncidentResponsePlaybooks />
          </TabsContent>

          <TabsContent value="study">
            <IncidentStudyGuide />
          </TabsContent>

          <TabsContent value="guide">
            <IncidentUserGuide />
          </TabsContent>
        </Tabs>
      </div>

      <IncidentForm 
        open={formOpen}
        onOpenChange={setFormOpen}
        incident={editingIncident}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        risks={risks}
        controls={controls}
        compliance={compliance}
      />

      <EntitySummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        entity={selectedIncidentForSummary}
        entityType="incident"
      />

      <Dialog open={collaborationOpen} onOpenChange={setCollaborationOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-slate-300 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-200">{selectedIncidentForCollab?.title}</DialogTitle>
            <p className="text-sm text-slate-400">Collaborate on this incident</p>
          </DialogHeader>
          {selectedIncidentForCollab && (
            <CollaborationPanel 
              entityType="incident"
              entityId={selectedIncidentForCollab.id}
              entityTitle={selectedIncidentForCollab.title}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={workflowAnalysisOpen} onOpenChange={setWorkflowAnalysisOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-slate-300 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl text-slate-200">{selectedIncidentForWorkflow?.title}</DialogTitle>
            <p className="text-sm text-slate-400">AI-powered root cause analysis, remediation, and impact prediction</p>
          </DialogHeader>
          {selectedIncidentForWorkflow && (
            <div className="p-6 pt-0">
              <AIIncidentWorkflowEngine
                incident={selectedIncidentForWorkflow}
                risks={risks}
                controls={controls}
                onUpdate={() => {
                  queryClient.invalidateQueries({ queryKey: ['incidents'] });
                  setWorkflowAnalysisOpen(false);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FloatingChatbot
        context="incidents"
        contextData={{
          totalIncidents: incidents.length,
          critical: criticalCount,
          high: highCount,
          open: openCount,
          avgResolutionTime: avgResolutionTime,
          types: [...new Set(incidents.map(i => i.incident_type))],
          recentIncidents: incidents.slice(0, 5).map(i => ({
            title: i.title,
            type: i.incident_type,
            severity: i.severity,
            status: i.status
          }))
        }}
      />
    </div>
  );
}