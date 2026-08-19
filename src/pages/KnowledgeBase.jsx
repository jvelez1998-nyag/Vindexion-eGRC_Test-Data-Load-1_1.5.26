import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brain, Search, Lightbulb, BookOpen, TrendingUp, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import KnowledgeSearch from "@/components/knowledge/KnowledgeSearch";
import ProactiveSuggestions from "@/components/knowledge/ProactiveSuggestions";
import KnowledgeCategories from "@/components/knowledge/KnowledgeCategories";
import KnowledgeInsights from "@/components/knowledge/KnowledgeInsights";
import RecentQueries from "@/components/knowledge/RecentQueries";
import KnowledgeAnalytics from "@/components/knowledge/KnowledgeAnalytics";

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState("search");
  const [userEmail, setUserEmail] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

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
    const saved = localStorage.getItem('kb_search_history');
    if (saved) setSearchHistory(JSON.parse(saved));
  }, []);

  const { data: risks = [], isLoading: risksLoading } = useQuery({
    queryKey: ['risks'],
    queryFn: async () => {
      const data = await base44.entities.Risk.list();
      return data || [];
    }
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const data = await base44.entities.Incident.list();
      return data || [];
    }
  });

  const { data: controls = [], isLoading: controlsLoading } = useQuery({
    queryKey: ['controls'],
    queryFn: async () => {
      const data = await base44.entities.Control.list();
      return data || [];
    }
  });

  const { data: compliance = [], isLoading: complianceLoading } = useQuery({
    queryKey: ['compliance'],
    queryFn: async () => {
      const data = await base44.entities.Compliance.list();
      return data || [];
    }
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const data = await base44.entities.RiskAssessment.list();
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

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const data = await base44.entities.Vendor.list();
      return data || [];
    }
  });

  const { data: guidance = [] } = useQuery({
    queryKey: ['guidance'],
    queryFn: async () => {
      const data = await base44.entities.Guidance.list();
      return data || [];
    }
  });

  const knowledgeData = {
    risks,
    incidents,
    controls,
    compliance,
    assessments,
    audits,
    vendors,
    guidance
  };

  const isLoading = risksLoading || incidentsLoading || controlsLoading || complianceLoading;

  const addToHistory = (query, results) => {
    const newHistory = [
      { query, timestamp: new Date().toISOString(), resultCount: results?.length || 0 },
      ...searchHistory.slice(0, 19)
    ];
    setSearchHistory(newHistory);
    localStorage.setItem('kb_search_history', JSON.stringify(newHistory));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1623] p-6">
        <Skeleton className="h-10 w-64 bg-[#1a2332] mb-6" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 bg-[#1a2332]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <Brain className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              AI Knowledge Base
            </h1>
            <p className="text-slate-400 text-sm mt-1">Natural language querying across all GRC data with intelligent insights</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Knowledge Sources</p>
            <p className="text-2xl font-bold text-indigo-400">8</p>
            <p className="text-[10px] text-slate-600">Active modules</p>
          </div>
          <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Total Records</p>
            <p className="text-2xl font-bold text-white">
              {risks.length + incidents.length + controls.length + compliance.length + assessments.length + audits.length + vendors.length + guidance.length}
            </p>
            <p className="text-[10px] text-slate-600">Searchable items</p>
          </div>
          <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Recent Queries</p>
            <p className="text-2xl font-bold text-purple-400">{searchHistory.length}</p>
            <p className="text-[10px] text-slate-600">Search history</p>
          </div>
          <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">AI Status</p>
            <p className="text-2xl font-bold text-emerald-400">●</p>
            <p className="text-[10px] text-slate-600">Online & ready</p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1">
            <TabsTrigger value="search" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400">
              <Lightbulb className="h-4 w-4 mr-2" />
              Proactive Insights
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-400">
              <BookOpen className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends & Insights
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400">
              <FileText className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="space-y-6">
              <KnowledgeSearch 
                knowledgeData={knowledgeData}
                onSearchComplete={addToHistory}
              />
              {searchHistory.length > 0 && (
                <RecentQueries 
                  history={searchHistory}
                  onReplay={(query) => {
                    setActiveTab("search");
                  }}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions">
            <ProactiveSuggestions 
              knowledgeData={knowledgeData}
              userEmail={userEmail}
            />
          </TabsContent>

          <TabsContent value="categories">
            <KnowledgeCategories knowledgeData={knowledgeData} />
          </TabsContent>

          <TabsContent value="insights">
            <KnowledgeInsights knowledgeData={knowledgeData} />
          </TabsContent>

          <TabsContent value="analytics">
            <KnowledgeAnalytics 
              knowledgeData={knowledgeData}
              searchHistory={searchHistory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}