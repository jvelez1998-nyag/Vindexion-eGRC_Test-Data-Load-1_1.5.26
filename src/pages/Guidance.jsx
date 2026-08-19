import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  BookOpen, Search, Filter, Plus, ChevronRight, 
  FileText, Shield, Lock, AlertTriangle, Users,
  Database, RefreshCw, Globe, Scale, Building2, Bot, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import GuidanceCard from "@/components/guidance/GuidanceCard";
import GuidanceForm from "@/components/guidance/GuidanceForm";
import GuidanceDetailDrawer from "@/components/guidance/GuidanceDetailDrawer";
import GuidanceAISuggestions from "@/components/guidance/GuidanceAISuggestions";
import GuidanceAIAssistant from "@/components/guidance/GuidanceAIAssistant";
import GuidanceStudyGuide from "@/components/guidance/GuidanceStudyGuide";
import GuidanceExternalFeeds from "@/components/guidance/GuidanceExternalFeeds";
import FloatingChatbot from "@/components/ai/FloatingChatbot";
import RegulatoryIntelligenceFeed from "@/components/regulatory/RegulatoryIntelligenceFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const frameworks = [
  { id: 'all', label: 'All Frameworks', icon: BookOpen },
  { id: 'SOX', label: 'SOX', icon: Scale },
  { id: 'SOC2', label: 'SOC 2', icon: Shield },
  { id: 'ISO27001', label: 'ISO 27001', icon: Lock },
  { id: 'GDPR', label: 'GDPR', icon: Globe },
  { id: 'PCI-DSS', label: 'PCI-DSS', icon: Lock },
  { id: 'HIPAA', label: 'HIPAA', icon: FileText },
  { id: 'NIST', label: 'NIST', icon: Shield },
  { id: 'COBIT', label: 'COBIT', icon: Building2 },
  { id: 'FFIEC', label: 'FFIEC', icon: Building2 },
  { id: 'DORA', label: 'DORA', icon: Globe },
  { id: 'EU AI Act', label: 'EU AI Act', icon: Globe },
  { id: 'CCPA', label: 'CCPA', icon: Globe },
  { id: 'COSO', label: 'COSO', icon: Scale },
  { id: 'Basel III', label: 'Basel III', icon: Building2 },
];

const categories = [
  { id: 'all', label: 'All Categories', icon: Filter },
  { id: 'access_control', label: 'Access Control', icon: Lock },
  { id: 'data_protection', label: 'Data Protection', icon: Database },
  { id: 'risk_management', label: 'Risk Management', icon: AlertTriangle },
  { id: 'incident_response', label: 'Incident Response', icon: AlertTriangle },
  { id: 'business_continuity', label: 'Business Continuity', icon: RefreshCw },
  { id: 'vendor_management', label: 'Vendor Management', icon: Users },
  { id: 'audit_assurance', label: 'Audit & Assurance', icon: FileText },
  { id: 'governance', label: 'Governance', icon: Building2 },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'security_operations', label: 'Security Operations', icon: Shield },
  { id: 'compliance_monitoring', label: 'Compliance Monitoring', icon: FileText },
  { id: 'change_management', label: 'Change Management', icon: RefreshCw },
  { id: 'asset_management', label: 'Asset Management', icon: Database },
  { id: 'hr_security', label: 'HR Security', icon: Users },
];

export default function Guidance() {
  const [search, setSearch] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedGuidance, setSelectedGuidance] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: guidance = [], isLoading } = useQuery({
    queryKey: ['guidance'],
    queryFn: async () => {
      const data = await base44.entities.Guidance.list('-created_date', 100);
      return data || [];
    },
    staleTime: 300000
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Guidance.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidance'] });
      toast.success('Guidance created');
      setFormOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Guidance.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidance'] });
      toast.success('Guidance updated');
      setFormOpen(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Guidance.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidance'] });
      toast.success('Guidance deleted');
    }
  });

  const filteredGuidance = guidance.filter(item => {
    const matchesSearch = !search || 
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesFramework = selectedFramework === 'all' || item.framework === selectedFramework;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesFramework && matchesCategory;
  });

  const frameworkCounts = guidance.reduce((acc, item) => {
    acc[item.framework] = (acc[item.framework] || 0) + 1;
    return acc;
  }, {});

  const categoryCounts = guidance.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleView = (item) => {
    setSelectedGuidance(item);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar Navigation */}
        <div className="w-72 bg-[#151d2e] border-r border-[#2a3548] flex flex-col">
          <div className="p-4 border-b border-[#2a3548]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <BookOpen className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Guidance</h1>
                <p className="text-xs text-slate-500">{guidance.length} items</p>
              </div>
            </div>
            <Button 
              onClick={() => { setEditingItem(null); setFormOpen(true); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Guidance
            </Button>
            <Button 
              onClick={() => setAiAssistantOpen(true)}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2"
            >
              <Bot className="h-4 w-4" />
              AI Assistant
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium px-2 mb-2">Frameworks</p>
              <div className="space-y-0.5">
                {frameworks.map(fw => {
                  const Icon = fw.icon;
                  const count = fw.id === 'all' ? guidance.length : (frameworkCounts[fw.id] || 0);
                  const isActive = selectedFramework === fw.id;
                  return (
                    <button
                      key={fw.id}
                      onClick={() => setSelectedFramework(fw.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'text-slate-400 hover:bg-[#1a2332] hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left truncate">{fw.label}</span>
                      {count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#2a3548] text-slate-500'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium px-2 mb-2 mt-6">Categories</p>
              <div className="space-y-0.5">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const count = cat.id === 'all' ? guidance.length : (categoryCounts[cat.id] || 0);
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'text-slate-400 hover:bg-[#1a2332] hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left truncate">{cat.label}</span>
                      {count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#2a3548] text-slate-500'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-[#2a3548] bg-[#151d2e]">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search guidance by title, reference, description, or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-[#1a2332] border-[#2a3548] text-white placeholder:text-slate-500"
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedFramework !== 'all' && (
                  <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {selectedFramework}
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    {selectedCategory.replace(/_/g, ' ')}
                  </Badge>
                )}
                {(selectedFramework !== 'all' || selectedCategory !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => { setSelectedFramework('all'); setSelectedCategory('all'); }}
                    className="text-slate-400 hover:text-white"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Guidance Content */}
          <div className="flex-1">
            <Tabs defaultValue="guidance" className="h-full flex flex-col">
              <div className="px-6 pt-4 border-b border-[#2a3548]">
                <TabsList className="bg-[#1a2332] border border-[#2a3548]">
                  <TabsTrigger value="guidance">All Guidance</TabsTrigger>
                  <TabsTrigger value="study">Study Guide</TabsTrigger>
                  <TabsTrigger value="feeds">External Feeds</TabsTrigger>
                  <TabsTrigger value="regulatory-intel">Regulatory Intel</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="study" className="flex-1 p-6">
                <GuidanceStudyGuide />
              </TabsContent>

              <TabsContent value="feeds" className="flex-1 p-6">
                <GuidanceExternalFeeds />
              </TabsContent>

              <TabsContent value="regulatory-intel" className="flex-1 p-6">
                <RegulatoryIntelligenceFeed />
              </TabsContent>

              <TabsContent value="guidance" className="flex-1">
                <ScrollArea className="h-full p-6">
                  {/* AI Suggestions Panel */}
                  {!isLoading && guidance.length > 0 && (
                    <div className="mb-6">
                      <GuidanceAISuggestions 
                        guidance={guidance} 
                        onSelectGuidance={handleView}
                      />
                    </div>
                  )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 bg-[#1a2332]" />
                ))}
              </div>
            ) : filteredGuidance.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">No guidance found</h3>
                <p className="text-slate-500 mt-1 mb-4">
                  {search || selectedFramework !== 'all' || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Add your first guidance item to get started'}
                </p>
                <Button onClick={() => { setEditingItem(null); setFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Guidance
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredGuidance.map(item => (
                  <GuidanceCard
                    key={item.id}
                    guidance={item}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={(item) => deleteMutation.mutate(item.id)}
                  />
                ))}
              </div>
            )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <GuidanceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        guidance={editingItem}
        onSubmit={(data) => {
          if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <GuidanceDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        guidance={selectedGuidance}
        onEdit={handleEdit}
      />

      <GuidanceAIAssistant
        open={aiAssistantOpen}
        onOpenChange={setAiAssistantOpen}
        guidance={guidance}
      />

      <FloatingChatbot
        context="guidance"
        contextData={{
          totalGuidance: guidance.length,
          frameworks: [...new Set(guidance.map(g => g.framework))],
          categories: [...new Set(guidance.map(g => g.category))],
          recentGuidance: guidance.slice(0, 5).map(g => ({
            title: g.title,
            framework: g.framework,
            category: g.category
          }))
        }}
      />
    </div>
  );
}