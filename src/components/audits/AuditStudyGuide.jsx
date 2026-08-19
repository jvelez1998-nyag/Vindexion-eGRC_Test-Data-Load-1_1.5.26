import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, CheckCircle2, Circle, Sparkles, Loader2, 
  Download, Brain, Target, FileText, Award
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const STUDY_TOPICS = [
  {
    id: 'audit-planning',
    title: 'Audit Planning',
    icon: '📋',
    sections: [
      'Understanding the Entity',
      'Risk Assessment',
      'Materiality Determination',
      'Audit Strategy',
      'Resource Allocation'
    ]
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    icon: '⚠️',
    sections: [
      'Inherent Risk',
      'Control Risk',
      'Detection Risk',
      'Fraud Risk',
      'Business Risk'
    ]
  },
  {
    id: 'internal-controls',
    title: 'Internal Controls',
    icon: '🛡️',
    sections: [
      'Control Environment',
      'Risk Assessment Process',
      'Control Activities',
      'Information Systems',
      'Monitoring Activities'
    ]
  },
  {
    id: 'testing',
    title: 'Testing Procedures',
    icon: '🔬',
    sections: [
      'Test of Controls',
      'Substantive Testing',
      'Analytical Procedures',
      'Sampling Methods',
      'Evidence Evaluation'
    ]
  },
  {
    id: 'documentation',
    title: 'Audit Documentation',
    icon: '📄',
    sections: [
      'Workpaper Requirements',
      'Documentation Standards',
      'Evidence Collection',
      'Review Notes',
      'File Organization'
    ]
  },
  {
    id: 'reporting',
    title: 'Audit Reporting',
    icon: '📊',
    sections: [
      'Finding Classification',
      'Report Structure',
      'Management Letter',
      'Opinion Formation',
      'Communication Requirements'
    ]
  }
];

export default function AuditStudyGuide() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [completedSections, setCompletedSections] = useState({});

  const generateStudyMaterial = async (topic) => {
    setLoadingMaterial(true);
    try {
      const prompt = `You are an audit training expert. Create comprehensive study material for: ${topic.title}

Topic: ${topic.title}
Sections: ${topic.sections.join(', ')}

Generate a detailed study guide including:
1. Overview - What this topic covers and why it matters
2. Key Concepts - Essential definitions and principles
3. Practical Examples - Real-world scenarios and applications
4. Best Practices - Industry standards and recommendations
5. Common Pitfalls - Mistakes to avoid
6. Interview Questions - Questions auditors might face
7. Quick Reference - Bullet points for review

Format in clear, engaging markdown suitable for studying.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setStudyMaterial(response);
      toast.success("Study material generated");
    } catch (error) {
      toast.error("Failed to generate material");
    } finally {
      setLoadingMaterial(false);
    }
  };

  const toggleSection = (topicId, section) => {
    setCompletedSections(prev => ({
      ...prev,
      [`${topicId}-${section}`]: !prev[`${topicId}-${section}`]
    }));
  };

  const getTopicProgress = (topicId) => {
    const topic = STUDY_TOPICS.find(t => t.id === topicId);
    if (!topic) return 0;
    const completed = topic.sections.filter(s => completedSections[`${topicId}-${s}`]).length;
    return Math.round((completed / topic.sections.length) * 100);
  };

  const overallProgress = Math.round(
    (Object.keys(completedSections).filter(k => completedSections[k]).length / 
    STUDY_TOPICS.reduce((sum, t) => sum + t.sections.length, 0)) * 100
  );

  const downloadStudyGuide = () => {
    if (!studyMaterial || !selectedTopic) return;
    const blob = new Blob([studyMaterial], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-study-guide-${selectedTopic.id}.md`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-indigo-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Study Progress</h3>
                <p className="text-xs text-slate-400">Track your audit training completion</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{overallProgress}%</div>
              <div className="text-xs text-slate-400">Complete</div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Study Topics & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics List */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Study Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {STUDY_TOPICS.map(topic => {
                  const progress = getTopicProgress(topic.id);
                  
                  return (
                    <Card
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopic(topic);
                        setStudyMaterial(null);
                      }}
                      className={`cursor-pointer transition-all ${
                        selectedTopic?.id === topic.id
                          ? 'bg-indigo-500/10 border-indigo-500/40'
                          : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{topic.icon}</div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white mb-2">{topic.title}</h4>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="h-1.5 flex-1" />
                              <span className="text-xs text-slate-400">{progress}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Topic Content */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedTopic ? (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a Study Topic</h3>
                <p className="text-slate-400">Choose a topic to begin studying</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{selectedTopic.icon}</div>
                      <div>
                        <CardTitle className="text-lg mb-1">{selectedTopic.title}</CardTitle>
                        <p className="text-sm text-slate-400">
                          {selectedTopic.sections.length} sections
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => generateStudyMaterial(selectedTopic)}
                      disabled={loadingMaterial}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                      {loadingMaterial ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4 mr-2" />
                      )}
                      Generate Study Guide
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-[#1a2332] border-[#2a3548]">
                <Tabs defaultValue="sections">
                  <CardHeader>
                    <TabsList className="bg-[#151d2e] border border-[#2a3548]">
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                      <TabsTrigger value="material">Study Material</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="sections">
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-2">
                          {selectedTopic.sections.map((section, idx) => {
                            const isCompleted = completedSections[`${selectedTopic.id}-${section}`];
                            
                            return (
                              <Card 
                                key={idx} 
                                className="bg-[#151d2e] border-[#2a3548] cursor-pointer hover:border-[#3a4558] transition-all"
                                onClick={() => toggleSection(selectedTopic.id, section)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-slate-600" />
                                      )}
                                      <span className={`text-sm ${isCompleted ? 'text-white font-medium' : 'text-slate-400'}`}>
                                        {section}
                                      </span>
                                    </div>
                                    {isCompleted && (
                                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                                        Completed
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="material">
                      <ScrollArea className="h-[500px] pr-4">
                        {!studyMaterial ? (
                          <div className="text-center py-12">
                            <Brain className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 mb-4">Generate AI-powered study material</p>
                            <Button 
                              onClick={() => generateStudyMaterial(selectedTopic)}
                              disabled={loadingMaterial}
                              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                            >
                              {loadingMaterial ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Brain className="h-4 w-4 mr-2" />
                              )}
                              Generate Material
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-end mb-4">
                              <Button 
                                onClick={downloadStudyGuide}
                                variant="outline"
                                size="sm"
                                className="border-[#2a3548] hover:bg-[#2a3548]"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Guide
                              </Button>
                            </div>
                            <div className="bg-[#151d2e] border border-[#2a3548] rounded-xl p-6">
                              <ReactMarkdown 
                                className="prose prose-sm prose-invert max-w-none text-slate-300"
                                components={{
                                  h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 mt-0">{children}</h1>,
                                  h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-6 first:mt-0">{children}</h2>,
                                  h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                                  p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                                  ul: ({children}) => <ul className="list-disc ml-5 mb-4 space-y-1">{children}</ul>,
                                  ol: ({children}) => <ol className="list-decimal ml-5 mb-4 space-y-1">{children}</ol>,
                                  li: ({children}) => <li className="text-slate-300">{children}</li>,
                                  strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                                  blockquote: ({children}) => (
                                    <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 text-slate-400 italic">
                                      {children}
                                    </blockquote>
                                  ),
                                }}
                              >
                                {studyMaterial}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}