import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, BarChart3, Calendar, Activity, Sparkles, 
  BookOpen, Target, FileText, TrendingUp, Award, Eye, Layers,
  PlayCircle, Rss, Library, Wand2
} from "lucide-react";
import { toast } from "sonner";
import UnifiedExamDashboard from "@/components/regulatory/UnifiedExamDashboard";
import EnhancedRegulatoryFeed from "@/components/regulatory/EnhancedRegulatoryFeed";
import ExamAnalyticsDashboard from "@/components/regulatory/ExamAnalyticsDashboard";
import AdvancedResourceLibrary from "@/components/regulatory/AdvancedResourceLibrary";
import PerformanceVisualization from "@/components/regulatory/PerformanceVisualization";
import AIExamBuilder from "@/components/regulatory/AIExamBuilder";
import RegulatoryExamInsights from "@/components/regulatory/RegulatoryExamInsights";
import ExamStudyGuide from "@/components/regulatory/ExamStudyGuide";
import ExamSimulator from "@/components/regulatory/ExamSimulator";
import LiveRegulatoryFeed from "@/components/regulatory/LiveRegulatoryFeed";
import ExamReferenceLibrary from "@/components/regulatory/ExamReferenceLibrary";
import ExamDeepDive from "@/components/regulatory/ExamDeepDive";
import AdvancedAIExamBuilder from "@/components/regulatory/AdvancedAIExamBuilder";
import ExamInventoryListing from "@/components/regulatory/ExamInventoryListing";

export default function RegulatoryExamSimulation() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const queryClient = useQueryClient();

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['regulatory-exams'],
    queryFn: async () => {
      const data = await base44.entities.RegulatoryExam.list('-exam_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: userProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const data = await base44.entities.UserProgress.list('-updated_date', 100);
      return data || [];
    },
    staleTime: 300000,
    cacheTime: 600000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const completedExams = exams.filter(e => e.status === 'completed');
  const scheduledExams = exams.filter(e => e.status === 'scheduled');
  const avgScore = completedExams.length > 0 && !isNaN(completedExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / completedExams.length)
    ? Math.round(completedExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / completedExams.length)
    : 0;

  if (examsLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-[#0f1623] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Regulatory Exam Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-violet-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/20">
            <Brain className="h-7 w-7 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
              Regulatory Exam Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              AI-Powered Compliance Certification Preparation Platform
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Award className="h-4 w-4 text-violet-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{exams.length}</div>
              <div className="text-xs text-slate-400">Total Exams</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{avgScore}%</div>
              <div className="text-xs text-slate-400">Avg Score</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548] hover:border-blue-500/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Target className="h-4 w-4 text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{completedExams.length}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548] hover:border-amber-500/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Calendar className="h-4 w-4 text-amber-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{scheduledExams.length}</div>
              <div className="text-xs text-slate-400">Scheduled</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Executive Insights */}
        <RegulatoryExamInsights exams={exams} userProgress={userProgress} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-3">
              <div className="overflow-x-auto scrollbar-thin">
                <TabsList className="bg-[#0f1623] border border-[#2a3548] p-1 inline-flex gap-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30">
                <Activity className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="study-guide" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <BookOpen className="h-4 w-4 mr-2" />
                Study Guide
              </TabsTrigger>
              <TabsTrigger value="simulator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-500/30">
                <PlayCircle className="h-4 w-4 mr-2" />
                Simulator
              </TabsTrigger>
              <TabsTrigger value="live-feed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30">
                <Rss className="h-4 w-4 mr-2" />
                Live Feed
              </TabsTrigger>
              <TabsTrigger value="reference" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30">
                <Library className="h-4 w-4 mr-2" />
                Reference Library
              </TabsTrigger>
              <TabsTrigger value="deep-dive" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/30">
                <Target className="h-4 w-4 mr-2" />
                Deep Dives
              </TabsTrigger>
              <TabsTrigger value="feed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30">
                <Sparkles className="h-4 w-4 mr-2" />
                Intelligence
              </TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-500/30">
                <FileText className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="visualization" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/20 data-[state=active]:to-rose-500/20 data-[state=active]:text-pink-300 data-[state=active]:border data-[state=active]:border-pink-500/30">
                <Eye className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/30">
                <Layers className="h-4 w-4 mr-2" />
                Exam Inventory
              </TabsTrigger>
              <TabsTrigger value="builder" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-rose-300 data-[state=active]:border data-[state=active]:border-rose-500/30">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Exam Builder
              </TabsTrigger>
                </TabsList>
              </div>
              </CardContent>
              </Card>

          <TabsContent value="dashboard">
            <UnifiedExamDashboard exams={exams} userProgress={userProgress} onNavigate={setActiveTab} />
          </TabsContent>

          <TabsContent value="analytics">
            <ExamAnalyticsDashboard exams={exams} userProgress={userProgress} />
          </TabsContent>

          <TabsContent value="feed">
            <EnhancedRegulatoryFeed />
          </TabsContent>

          <TabsContent value="resources">
            <AdvancedResourceLibrary />
          </TabsContent>

          <TabsContent value="visualization">
            <PerformanceVisualization exams={exams} userProgress={userProgress} />
          </TabsContent>

          <TabsContent value="study-guide">
            <ExamStudyGuide />
          </TabsContent>

          <TabsContent value="simulator">
            <ExamSimulator />
          </TabsContent>

          <TabsContent value="live-feed">
            <LiveRegulatoryFeed />
          </TabsContent>

          <TabsContent value="reference">
            <ExamReferenceLibrary />
          </TabsContent>

          <TabsContent value="deep-dive">
            <ExamDeepDive />
          </TabsContent>

          <TabsContent value="inventory">
            <ExamInventoryListing 
              onViewExam={(exam) => console.log('View exam:', exam)}
              onEditExam={(exam) => console.log('Edit exam:', exam)}
              onCreateNew={() => console.log('Create new exam')}
            />
          </TabsContent>

          <TabsContent value="builder">
            <AdvancedAIExamBuilder />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}