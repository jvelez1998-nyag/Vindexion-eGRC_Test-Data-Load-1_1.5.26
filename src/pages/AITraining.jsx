import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, Target, TrendingUp, BookOpen, Award, 
  BarChart3, Users, Zap
} from "lucide-react";
import PersonalizedTrainingDashboard from "@/components/training/PersonalizedTrainingDashboard";
import InteractiveLessons from "@/components/training/InteractiveLessons";
import AdaptiveQuizEngine from "@/components/training/AdaptiveQuizEngine";
import TrainingAnalytics from "@/components/training/TrainingAnalytics";
import LearningPath from "@/components/training/LearningPath";
import FloatingChatbot from "@/components/ai/FloatingChatbot";

export default function AITraining() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: trainingProgress = [] } = useQuery({
    queryKey: ['training-progress', user?.email],
    queryFn: () => base44.entities.TrainingProgress.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  return (
    <div className="min-h-screen bg-[#0f1623] p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-indigo-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
            <Brain className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              AI-Powered Training Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Personalized learning with adaptive AI guidance and real-time feedback
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-3">
              <div className="overflow-x-auto scrollbar-thin">
                <TabsList className="bg-[#0f1623] border border-[#2a3548] p-1 inline-flex gap-1">
                  <TabsTrigger value="dashboard">
                    <Target className="h-4 w-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="lessons">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Interactive Lessons
                  </TabsTrigger>
                  <TabsTrigger value="quizzes">
                    <Zap className="h-4 w-4 mr-2" />
                    Adaptive Quizzes
                  </TabsTrigger>
                  <TabsTrigger value="learning-path">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Learning Paths
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    My Progress
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="dashboard">
            <PersonalizedTrainingDashboard userEmail={user?.email} progress={trainingProgress} />
          </TabsContent>

          <TabsContent value="lessons">
            <InteractiveLessons userEmail={user?.email} progress={trainingProgress} />
          </TabsContent>

          <TabsContent value="quizzes">
            <AdaptiveQuizEngine userEmail={user?.email} progress={trainingProgress} />
          </TabsContent>

          <TabsContent value="learning-path">
            <LearningPath userEmail={user?.email} progress={trainingProgress} />
          </TabsContent>

          <TabsContent value="analytics">
            <TrainingAnalytics userEmail={user?.email} progress={trainingProgress} />
          </TabsContent>
        </Tabs>
      </div>

      <FloatingChatbot context="training" />
    </div>
  );
}