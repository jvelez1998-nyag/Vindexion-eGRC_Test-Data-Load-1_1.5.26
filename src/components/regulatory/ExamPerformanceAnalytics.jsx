import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { 
  Brain, Loader2, TrendingUp, AlertCircle, Target, 
  Award, BarChart3, Activity, Zap 
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function ExamPerformanceAnalytics({ exam, allExams }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);

  const generateInsights = async () => {
    setAnalyzing(true);
    try {
      // Aggregate data for this exam
      const topicPerformance = {};
      const timePerQuestion = [];
      
      exam.responses?.forEach((resp, idx) => {
        const topic = resp.reference || 'General';
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correct: 0, total: 0, topics: new Set() };
        }
        topicPerformance[topic].total++;
        if (resp.is_correct) topicPerformance[topic].correct++;
        topicPerformance[topic].topics.add(resp.regulation_section);
      });

      const topicData = Object.entries(topicPerformance).map(([topic, data]) => ({
        topic,
        accuracy: Math.round((data.correct / data.total) * 100),
        correct: data.correct,
        total: data.total
      })).sort((a, b) => a.accuracy - b.accuracy);

      // Historical comparison
      const sameFrameworkExams = allExams.filter(e => 
        e.framework === exam.framework && 
        (e.status === 'passed' || e.status === 'failed') &&
        e.id !== exam.id
      );

      const prompt = `You are an expert GRC performance analyst. Analyze this exam performance and provide actionable insights.

EXAM DETAILS:
Framework: ${exam.framework}
Exam Type: ${exam.exam_type}
Score: ${exam.score_percentage}%
Status: ${exam.status}
Time Spent: ${exam.time_spent_minutes} minutes
Correct: ${exam.correct_answers}/${exam.total_questions}

TOPIC PERFORMANCE:
${JSON.stringify(topicData, null, 2)}

HISTORICAL PERFORMANCE (${exam.framework}):
${sameFrameworkExams.map(e => `- ${e.exam_type}: ${e.score_percentage}% (${e.status})`).join('\n') || 'No previous exams'}

PROVIDE:

1. **Performance Summary**
   - Overall assessment of this exam performance
   - Comparison to typical scores for this framework
   - Notable strengths demonstrated

2. **Topic Analysis**
   - Strongest areas (topics with >80% accuracy)
   - Weak areas requiring review (topics with <70% accuracy)
   - Critical gaps (topics with <50% accuracy)

3. **Historical Comparison**
   - How this compares to previous attempts
   - Improvement areas
   - Persistent weak spots

4. **Actionable Recommendations**
   - Immediate study priorities (next 48 hours)
   - Medium-term focus (next 2 weeks)
   - Specific regulation sections to review
   - Practice question areas

5. **Exam Strategy Insights**
   - Time management observations
   - Question types that were challenging
   - Pattern in incorrect answers

6. **Readiness Assessment**
   - Are they ready for the real exam? (Yes/No with reasoning)
   - Estimated study time needed
   - Confidence level for certification

Format as clear, structured markdown. Be specific with section numbers and topics.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setInsights({
        analysis: response,
        topicData,
        sameFrameworkCount: sameFrameworkExams.length
      });

      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate insights");
    } finally {
      setAnalyzing(false);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Advanced Performance Analytics
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            AI-powered insights and personalized recommendations
          </p>
        </div>
        {!insights && (
          <Button
            onClick={generateInsights}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        )}
      </div>

      {!insights ? (
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Generate AI insights for detailed performance analysis</p>
        </div>
      ) : (
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="bg-[#151d2e] border border-[#2a3548]">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="charts">Visual Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-6">
            <ScrollArea className="h-[600px]">
              <div className="pr-4">
                <ReactMarkdown 
                  className="prose prose-sm prose-invert max-w-none text-slate-300"
                  components={{
                    h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 mt-6 first:mt-0 border-b border-[#2a3548] pb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-5">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed text-sm">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1.5">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1.5">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 text-blue-300 italic bg-blue-500/5 py-2 rounded-r">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {insights.analysis}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="charts" className="mt-6 space-y-6">
            {/* Topic Performance Radar */}
            {insights.topicData.length > 0 && (
              <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                <h4 className="font-semibold text-white mb-4">Topic Mastery Radar</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={insights.topicData.slice(0, 8)}>
                    <PolarGrid stroke="#2a3548" />
                    <PolarAngleAxis dataKey="topic" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar name="Accuracy %" dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Topic Performance Bars */}
            {insights.topicData.length > 0 && (
              <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                <h4 className="font-semibold text-white mb-4">Detailed Topic Breakdown</h4>
                <div className="space-y-3">
                  {insights.topicData.map((topic, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300">{topic.topic}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {topic.correct}/{topic.total}
                          </span>
                          <Badge className={`text-xs ${
                            topic.accuracy >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                            topic.accuracy >= 60 ? 'bg-blue-500/10 text-blue-400' :
                            topic.accuracy >= 40 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {topic.accuracy}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={topic.accuracy} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
}