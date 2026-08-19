import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Users, Brain, BarChart3, Activity, FileText, Sparkles, Calculator } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ClientDashboard from "@/components/clients/ClientDashboard";
import ClientCard from "@/components/clients/ClientCard";
import { usePagination } from "@/components/ui/use-pagination";
import { Pagination } from "@/components/ui/pagination";
import ClientForm from "@/components/clients/ClientForm";
import ClientScorecard from "@/components/clients/ClientScorecard";
import ClientAssessmentEngine from "@/components/clients/ClientAssessmentEngine";
import ClientMonitoring from "@/components/clients/ClientMonitoring";
import ClientAIAnalysis from "@/components/clients/ClientAIAnalysis";
import ClientOnboardingWizard from "@/components/clients/ClientOnboardingWizard";
import ClientQuestionnaireLibrary from "@/components/clients/ClientQuestionnaireLibrary";
import ClientDetailedProfile from "@/components/clients/ClientDetailedProfile";
import ClientVisualizationHub from "@/components/clients/ClientVisualizationHub";
import ClientReportingEngine from "@/components/clients/ClientReportingEngine";
import ClientEngagementScenarios from "@/components/clients/ClientEngagementScenarios";
import ClientStudyGuide from "@/components/clients/ClientStudyGuide";
import ClientLearningPath from "@/components/clients/ClientLearningPath";
import ClientDeepDive from "@/components/clients/ClientDeepDive";
import ClientUserGuide from "@/components/clients/ClientUserGuide";
import ClientAIInsightsPanel from "@/components/clients/ClientAIInsightsPanel";
import AdvancedClientRiskAssessment from "@/components/clients/AdvancedClientRiskAssessment";
import ClientOffboardingWizard from "@/components/clients/ClientOffboardingWizard";
import ClientAdvancedVisualizations from "@/components/clients/ClientAdvancedVisualizations";
import AIChurnPredictor from "@/components/clients/AIChurnPredictor";
import AIComplianceGapAnalyzer from "@/components/clients/AIComplianceGapAnalyzer";
import AIExecutiveSummaryGenerator from "@/components/clients/AIExecutiveSummaryGenerator";
import AIContextualAssistant from "@/components/clients/AIContextualAssistant";
import AIComprehensiveRiskEngine from "@/components/clients/AIComprehensiveRiskEngine";
import AIClientReportGenerator from "@/components/clients/AIClientReportGenerator";
import FloatingChatbot from "@/components/ai/FloatingChatbot";

export default function ClientProfile() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [offboardingOpen, setOffboardingOpen] = useState(false);
  const [offboardingClient, setOffboardingClient] = useState(null);

  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const data = await base44.entities.Client.list('-created_date');
      return data || [];
    }
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list();
      return data || [];
    }
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const data = await base44.entities.Incident.list();
      return data || [];
    }
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const data = await base44.entities.Audit.list();
      return data || [];
    }
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: async () => {
      const data = await base44.entities.AuditFinding.list();
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Client.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setFormOpen(false);
      toast.success("Client created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Client.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setFormOpen(false);
      setEditingClient(null);
      setDetailOpen(false);
      toast.success("Client updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Client.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Client deleted successfully");
    }
  });

  const handleSubmit = (data) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  const handleDelete = (client) => {
    if (confirm(`Are you sure you want to delete "${client.name}"?`)) {
      deleteMutation.mutate(client.id);
    }
  };

  const handleOffboard = (client) => {
    setOffboardingClient(client);
    setOffboardingOpen(true);
  };

  const handleOffboardingComplete = (data) => {
    if (offboardingClient) {
      updateMutation.mutate({ 
        id: offboardingClient.id, 
        data 
      });
      setOffboardingOpen(false);
      setOffboardingClient(null);
    }
  };

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setDetailOpen(true);
  };

  const handleAssessmentComplete = (assessmentData) => {
    if (selectedClient) {
      updateMutation.mutate({ 
        id: selectedClient.id, 
        data: assessmentData 
      });
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = !search || 
      client.name?.toLowerCase().includes(search.toLowerCase()) ||
      client.industry?.toLowerCase().includes(search.toLowerCase()) ||
      client.contact_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesRisk = riskFilter === "all" || client.risk_level === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Users className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Client Management</h1>
              <p className="text-slate-500 text-sm">Track and manage client risk profiles</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-400">{clients.filter(c => c.status === 'active').length}</span>
                <span className="text-slate-400">Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="font-bold text-amber-400">{clients.filter(c => c.status === 'at_risk').length}</span>
                <span className="text-slate-400">At Risk</span>
              </div>
            </div>
            <Button onClick={() => setOnboardingOpen(true)} variant="outline" className="gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
              <Sparkles className="h-4 w-4" />
              AI Onboarding
            </Button>
            <Button onClick={() => { setEditingClient(null); setFormOpen(true); }} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-[#1a2332] border border-[#2a3548]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#151d2e] border-[#2a3548] text-white placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Status</SelectItem>
              <SelectItem value="active" className="text-white hover:bg-[#2a3548]">Active</SelectItem>
              <SelectItem value="at_risk" className="text-white hover:bg-[#2a3548]">At Risk</SelectItem>
              <SelectItem value="prospect" className="text-white hover:bg-[#2a3548]">Prospect</SelectItem>
              <SelectItem value="inactive" className="text-white hover:bg-[#2a3548]">Inactive</SelectItem>
              <SelectItem value="churned" className="text-white hover:bg-[#2a3548]">Churned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Risks</SelectItem>
              <SelectItem value="low" className="text-white hover:bg-[#2a3548]">Low</SelectItem>
              <SelectItem value="medium" className="text-white hover:bg-[#2a3548]">Medium</SelectItem>
              <SelectItem value="high" className="text-white hover:bg-[#2a3548]">High</SelectItem>
              <SelectItem value="critical" className="text-white hover:bg-[#2a3548]">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients">All Clients</TabsTrigger>
            <TabsTrigger value="questionnaires">
              <FileText className="h-4 w-4 mr-2" />
              Questionnaires
            </TabsTrigger>
            <TabsTrigger value="visualizations">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="study-guide">
              <Brain className="h-4 w-4 mr-2" />
              Study Guide
            </TabsTrigger>
            <TabsTrigger value="learning">
              <Activity className="h-4 w-4 mr-2" />
              Learning Path
            </TabsTrigger>
            <TabsTrigger value="user-guide">
              <Brain className="h-4 w-4 mr-2" />
              User Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ClientAIInsightsPanel 
              clients={clients}
              risks={risks}
              audits={audits}
              incidents={incidents}
              findings={findings}
            />
            <ClientDashboard 
              clients={clients}
              onClientClick={handleClientClick}
              onAddNew={() => setFormOpen(true)}
            />
          </TabsContent>

          <TabsContent value="questionnaires">
            <ClientQuestionnaireLibrary 
              onSelect={(template) => {
                toast.success(`Template "${template.name}" ready to send`);
                setQuestionnaireOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="visualizations">
            <ClientVisualizationHub clients={clients} />
          </TabsContent>

          <TabsContent value="study-guide">
            <ClientStudyGuide />
          </TabsContent>

          <TabsContent value="learning">
            <ClientLearningPath />
          </TabsContent>

          <TabsContent value="user-guide">
            <ClientUserGuide />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 bg-[#1a2332]" />)}
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-[#1a2332] border border-[#2a3548]">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No clients found</h3>
                <p className="text-slate-500 mt-1">Get started by adding your first client</p>
                <Button onClick={() => setFormOpen(true)} className="mt-4 bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClients.map(client => (
                  <ClientCard 
                    key={client.id}
                    client={client}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClick={handleClientClick}
                    onOffboard={handleOffboard}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ClientForm 
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{selectedClient?.name}</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <Tabs defaultValue="scorecard" className="mt-4">
              <TabsList className="bg-transparent border-b border-[#2a3548] w-full justify-start rounded-none overflow-x-auto">
                <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                  <Users className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="scorecard" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Scorecard
                </TabsTrigger>
                <TabsTrigger value="assessment" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Assessment
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                  <Activity className="h-4 w-4 mr-2" />
                  Monitoring
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Analysis
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                  <Users className="h-4 w-4 mr-2" />
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="deep-dive" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                  <Brain className="h-4 w-4 mr-2" />
                  Deep Dive
                </TabsTrigger>
                <TabsTrigger value="visualizations" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visualizations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <ClientDetailedProfile 
                  client={selectedClient}
                  risks={risks}
                  audits={audits}
                  incidents={incidents}
                />
              </TabsContent>

              <TabsContent value="scorecard" className="mt-6">
                <ClientScorecard client={selectedClient} />
              </TabsContent>

              <TabsContent value="assessment" className="mt-6">
                <div className="space-y-4">
                  <AIComprehensiveRiskEngine
                    client={selectedClient}
                    allClients={clients}
                    onApplyRecommendations={handleAssessmentComplete}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ClientAssessmentEngine 
                      client={selectedClient}
                      onAssessmentComplete={handleAssessmentComplete}
                    />
                    <AIContextualAssistant 
                      context="client_assessment"
                      contextData={{ client: selectedClient }}
                    />
                  </div>
                  <AdvancedClientRiskAssessment 
                    client={selectedClient}
                    onAssessmentComplete={handleAssessmentComplete}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <AIChurnPredictor 
                      client={selectedClient}
                      allClients={clients}
                    />
                    <AIComplianceGapAnalyzer 
                      client={selectedClient}
                    />
                  </div>
                  <AIExecutiveSummaryGenerator 
                    client={selectedClient}
                    risks={risks.filter(r => selectedClient.linked_risks?.includes(r.id))}
                    audits={audits.filter(a => selectedClient.linked_audits?.includes(a.id))}
                    incidents={incidents.filter(i => selectedClient.linked_incidents?.includes(i.id))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="mt-6">
                <ClientMonitoring client={selectedClient} />
              </TabsContent>

              <TabsContent value="analysis" className="mt-6">
                <ClientAIAnalysis 
                  client={selectedClient}
                  allClients={clients}
                  risks={risks}
                  incidents={incidents}
                  audits={audits}
                />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <div className="space-y-4">
                  <AIClientReportGenerator
                    client={selectedClient}
                    risks={risks}
                    audits={audits}
                    incidents={incidents}
                    findings={findings}
                    allClients={clients}
                  />
                  <ClientReportingEngine 
                    client={selectedClient}
                    allClients={clients}
                  />
                </div>
              </TabsContent>

              <TabsContent value="scenarios" className="mt-6">
                <ClientEngagementScenarios client={selectedClient} />
              </TabsContent>

              <TabsContent value="deep-dive" className="mt-6">
                <ClientDeepDive 
                  client={selectedClient}
                  allClients={clients}
                  risks={risks}
                  audits={audits}
                  incidents={incidents}
                  findings={findings}
                />
              </TabsContent>

              <TabsContent value="visualizations" className="mt-6">
                <ClientAdvancedVisualizations client={selectedClient} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <ClientOnboardingWizard
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onComplete={(data) => {
          createMutation.mutate(data);
          setOnboardingOpen(false);
        }}
      />

      <ClientOffboardingWizard
        open={offboardingOpen}
        onOpenChange={setOffboardingOpen}
        client={offboardingClient}
        onComplete={handleOffboardingComplete}
      />

      <FloatingChatbot
        context="clients"
        contextData={{
          totalClients: clients.length,
          active: clients.filter(c => c.status === 'active').length,
          atRisk: clients.filter(c => c.status === 'at_risk').length,
          highRisk: clients.filter(c => c.risk_level === 'high' || c.risk_level === 'critical').length,
          industries: [...new Set(clients.map(c => c.industry))],
          avgRisk: clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.risk_score || 0), 0) / clients.length) : 0,
          avgCompliance: clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / clients.length) : 0
        }}
      />
    </div>
  );
}