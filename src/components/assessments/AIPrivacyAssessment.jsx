import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, Brain, Loader2, CheckCircle2, AlertTriangle, 
  TrendingUp, Target, FileText, Lightbulb, Lock, Eye,
  Database, Globe, Users, Award
} from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import ReactMarkdown from "react-markdown";

const privacyQuestionnaire = [
  {
    id: 1,
    category: "Data Collection",
    question: "Does your organization maintain an inventory of all personal data collected?",
    description: "Having a comprehensive data inventory is fundamental to privacy compliance and risk management.",
    options: ["Yes, comprehensive inventory", "Partial inventory exists", "In development", "No inventory"],
    riskWeight: 5,
    regulatoryRef: "GDPR Art. 30, CCPA §1798.100"
  },
  {
    id: 2,
    category: "Data Collection",
    question: "Do you obtain explicit consent before collecting personal data?",
    description: "Consent mechanisms must be clear, specific, and documented.",
    options: ["Always", "Most of the time", "Sometimes", "Rarely or never"],
    riskWeight: 5,
    regulatoryRef: "GDPR Art. 7, CCPA §1798.120"
  },
  {
    id: 3,
    category: "Data Storage",
    question: "Is personal data encrypted at rest and in transit?",
    description: "Encryption is a critical safeguard against data breaches.",
    options: ["Both at rest and in transit", "Only in transit", "Only at rest", "Not encrypted"],
    riskWeight: 5,
    regulatoryRef: "GDPR Art. 32, NIST 800-53"
  },
  {
    id: 4,
    category: "Data Storage",
    question: "How long do you retain personal data?",
    description: "Data retention should be limited to what's necessary and documented.",
    options: ["Defined retention periods", "Reviewed annually", "No formal policy", "Indefinite retention"],
    riskWeight: 4,
    regulatoryRef: "GDPR Art. 5(1)(e), CCPA §1798.105"
  },
  {
    id: 5,
    category: "Access Control",
    question: "Do you implement role-based access controls for personal data?",
    description: "Limiting access reduces the risk of unauthorized disclosure.",
    options: ["Comprehensive RBAC", "Partial implementation", "Basic controls", "No formal controls"],
    riskWeight: 5,
    regulatoryRef: "GDPR Art. 32, HIPAA §164.308"
  },
  {
    id: 6,
    category: "Access Control",
    question: "How frequently do you review and audit access permissions?",
    description: "Regular access reviews help detect and prevent unauthorized access.",
    options: ["Quarterly or more", "Semi-annually", "Annually", "No regular reviews"],
    riskWeight: 3,
    regulatoryRef: "SOC 2, ISO 27001 A.9.2"
  },
  {
    id: 7,
    category: "Data Subject Rights",
    question: "Do you have processes to handle data subject access requests (DSARs)?",
    description: "Timely response to DSARs is a legal requirement under most privacy laws.",
    options: ["Automated process", "Manual process established", "Ad-hoc handling", "No formal process"],
    riskWeight: 5,
    regulatoryRef: "GDPR Art. 15-22, CCPA §1798.100-130"
  },
  {
    id: 8,
    category: "Data Subject Rights",
    question: "Can individuals easily delete or modify their data?",
    description: "Right to erasure and rectification are core privacy rights.",
    options: ["Self-service capability", "Request-based (< 30 days)", "Request-based (> 30 days)", "Not available"],
    riskWeight: 4,
    regulatoryRef: "GDPR Art. 16-17, CCPA §1798.105"
  },
  {
    id: 9,
    category: "Third-Party Sharing",
    question: "Do you have data processing agreements with all third parties?",
    description: "DPAs ensure third parties meet your privacy standards.",
    options: ["All third parties", "Most third parties", "Some third parties", "None"],
    riskWeight: 5,
    regulatoryRef: "GDPR Art. 28, CCPA §1798.140(v)"
  },
  {
    id: 10,
    category: "Third-Party Sharing",
    question: "Do you conduct privacy due diligence on vendors?",
    description: "Vendor assessment helps identify privacy risks in the supply chain.",
    options: ["Comprehensive assessment", "Basic assessment", "Limited assessment", "No assessment"],
    riskWeight: 4,
    regulatoryRef: "CCPA, SOC 2 Trust Principles"
  },
  {
    id: 11,
    category: "Breach Response",
    question: "Do you have a documented data breach response plan?",
    description: "Preparedness reduces response time and regulatory penalties.",
    options: ["Tested annually", "Documented plan exists", "Informal plan", "No plan"],
    riskWeight: 5,
    regulatoryRef: "GDPR Art. 33-34, CCPA §1798.150"
  },
  {
    id: 12,
    category: "Breach Response",
    question: "Can you detect and respond to data breaches within 72 hours?",
    description: "Most regulations require breach notification within 72 hours.",
    options: ["Yes, with monitoring", "Yes, manually", "Uncertain", "No"],
    riskWeight: 5,
    regulatoryRef: "GDPR Art. 33, State Breach Laws"
  },
  {
    id: 13,
    category: "Privacy by Design",
    question: "Are privacy impact assessments (PIAs) conducted for new projects?",
    description: "PIAs help identify and mitigate privacy risks early.",
    options: ["Always", "For high-risk projects", "Sometimes", "Never"],
    riskWeight: 4,
    regulatoryRef: "GDPR Art. 35, ISO 29134"
  },
  {
    id: 14,
    category: "Privacy by Design",
    question: "Is data minimization practiced in system design?",
    description: "Collecting only necessary data reduces privacy risk.",
    options: ["Systematically enforced", "Generally practiced", "Occasionally considered", "Not practiced"],
    riskWeight: 4,
    regulatoryRef: "GDPR Art. 5(1)(c), Privacy by Design"
  },
  {
    id: 15,
    category: "Governance",
    question: "Do you have a designated Data Protection Officer or privacy lead?",
    description: "Dedicated privacy leadership ensures accountability.",
    options: ["Full-time DPO", "Part-time privacy lead", "Shared responsibility", "No designated role"],
    riskWeight: 3,
    regulatoryRef: "GDPR Art. 37-39"
  },
  {
    id: 16,
    category: "Governance",
    question: "How often do you provide privacy training to employees?",
    description: "Regular training reduces human error and builds privacy culture.",
    options: ["Quarterly", "Annually", "At onboarding only", "No formal training"],
    riskWeight: 3,
    regulatoryRef: "ISO 27001, NIST Privacy Framework"
  },
  {
    id: 17,
    category: "Cross-Border Transfers",
    question: "Do you transfer personal data internationally?",
    description: "International transfers require additional safeguards.",
    options: ["No international transfers", "With SCCs/BCRs", "With adequacy decisions", "Without safeguards"],
    riskWeight: 4,
    regulatoryRef: "GDPR Art. 44-50, CCPA"
  },
  {
    id: 18,
    category: "Transparency",
    question: "Do you maintain a clear and accessible privacy policy?",
    description: "Transparency builds trust and ensures regulatory compliance.",
    options: ["Comprehensive & updated", "Basic policy exists", "Outdated policy", "No policy"],
    riskWeight: 4,
    regulatoryRef: "GDPR Art. 13-14, CCPA §1798.100"
  }
];

export default function AIPrivacyAssessment({ open, onOpenChange, onComplete }) {
  const [currentStep, setCurrentStep] = useState("questionnaire");
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const progress = (Object.keys(answers).length / privacyQuestionnaire.length) * 100;

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    privacyQuestionnaire.forEach(q => {
      maxScore += q.riskWeight * 3; // max 3 points per question
      const answerIndex = answers[q.id] || 0;
      const points = (3 - answerIndex) * q.riskWeight;
      totalScore += points;
    });

    return Math.round((totalScore / maxScore) * 100);
  };

  const analyzeCategoryRisks = () => {
    const categories = {};
    
    privacyQuestionnaire.forEach(q => {
      if (!categories[q.category]) {
        categories[q.category] = { total: 0, answered: 0, score: 0, maxScore: 0 };
      }
      categories[q.category].total++;
      
      if (answers[q.id] !== undefined) {
        categories[q.category].answered++;
        const answerIndex = answers[q.id];
        const points = (3 - answerIndex) * q.riskWeight;
        categories[q.category].score += points;
      }
      categories[q.category].maxScore += q.riskWeight * 3;
    });

    return Object.entries(categories).map(([name, data]) => ({
      name,
      score: data.answered > 0 ? Math.round((data.score / data.maxScore) * 100) : 0,
      answered: data.answered,
      total: data.total
    }));
  };

  const generateAIInsights = async () => {
    setAnalyzing(true);
    try {
      const categoryData = analyzeCategoryRisks();
      const overallScore = calculateScore();
      
      const answeredQuestions = privacyQuestionnaire.filter(q => answers[q.id] !== undefined);
      const criticalIssues = answeredQuestions.filter(q => answers[q.id] >= 2 && q.riskWeight >= 4);

      const prompt = `You are a data privacy expert conducting a comprehensive privacy assessment. Analyze this privacy posture and provide detailed insights.

ASSESSMENT RESULTS:
Overall Privacy Score: ${overallScore}/100
Total Questions: ${privacyQuestionnaire.length}
Questions Answered: ${Object.keys(answers).length}

CATEGORY BREAKDOWN:
${categoryData.map(cat => `- ${cat.name}: ${cat.score}/100 (${cat.answered}/${cat.total} questions)`).join('\n')}

CRITICAL ISSUES IDENTIFIED:
${criticalIssues.map((q, i) => `${i + 1}. ${q.question} - Answer: ${q.options[answers[q.id]]} (${q.category})`).join('\n')}

DETAILED ANSWERS:
${answeredQuestions.map(q => `Q: ${q.question}\nCategory: ${q.category}\nAnswer: ${q.options[answers[q.id]]}\nRegulatory Reference: ${q.regulatoryRef}\n`).join('\n')}

Please provide:

1. **Executive Summary** (2-3 sentences on overall privacy maturity)

2. **Risk Level Assessment**
   - Overall risk rating (Critical/High/Medium/Low)
   - Justification for rating

3. **Strengths** (areas where privacy controls are strong)

4. **Critical Gaps** (must-address privacy weaknesses with regulatory implications)

5. **Category-Specific Analysis**
   For each weak category:
   - Specific risks identified
   - Regulatory exposure
   - Business impact

6. **Predictive Analysis**
   - Likelihood of privacy incidents in next 12 months
   - Potential breach scenarios
   - Estimated impact and costs

7. **Compliance Posture**
   - GDPR readiness assessment
   - CCPA compliance status
   - Other relevant frameworks

8. **Actionable Recommendations** (prioritized)
   - Immediate actions (0-30 days)
   - Short-term improvements (1-3 months)
   - Long-term initiatives (3-12 months)

9. **Industry Benchmark**
   - How this compares to industry standards
   - Peer comparison insights

10. **Investment Recommendations**
    - Required tools/technologies
    - Staffing needs
    - Estimated budget requirements

Format in detailed, professional markdown with specific examples and references to regulations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      const resultData = {
        overallScore,
        categoryData,
        insights: response,
        criticalIssues,
        timestamp: new Date().toISOString()
      };
      
      setResults(resultData);
      setTimeout(() => setCurrentStep("results"), 100);
      toast.success("Privacy assessment completed!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze assessment");
    } finally {
      setAnalyzing(false);
    }
  };

  const exportResults = () => {
    if (!results) return;

    const assessment = {
      timestamp: results.timestamp,
      overallScore: results.overallScore,
      categories: results.categoryData,
      answers: privacyQuestionnaire.map(q => ({
        question: q.question,
        category: q.category,
        answer: q.options[answers[q.id]],
        notes: notes[q.id],
        regulatoryRef: q.regulatoryRef
      })),
      insights: results.insights
    };

    if (onComplete) {
      onComplete(assessment);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];
  
  const riskLevelColor = results ? 
    results.overallScore >= 80 ? 'text-emerald-400' :
    results.overallScore >= 60 ? 'text-blue-400' :
    results.overallScore >= 40 ? 'text-amber-400' : 'text-rose-400' : 'text-slate-400';

  const riskLevel = results ?
    results.overallScore >= 80 ? 'Low Risk' :
    results.overallScore >= 60 ? 'Medium Risk' :
    results.overallScore >= 40 ? 'High Risk' : 'Critical Risk' : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0 border-b border-[#2a3548]">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            AI-Powered Data Privacy Assessment
          </DialogTitle>
          <div className="flex items-center gap-4 mt-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-xs text-slate-400">{Math.round(progress)}% Complete</span>
          </div>
        </DialogHeader>

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="flex-1">
          <TabsList className="px-6 bg-transparent border-b border-[#2a3548] rounded-none">
            <TabsTrigger value="questionnaire" disabled={currentStep === "results"} className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
              Questionnaire
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!results} className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
              Results & Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questionnaire" className="px-6 pb-6 m-0">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 py-4">
                {privacyQuestionnaire.map((q, idx) => (
                  <Card key={q.id} className="bg-[#151d2e] border-[#2a3548] p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                        {q.category}
                      </Badge>
                      {answers[q.id] !== undefined && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <h4 className="font-semibold text-white mb-2">{idx + 1}. {q.question}</h4>
                    <p className="text-sm text-slate-400 mb-3">{q.description}</p>
                    <p className="text-xs text-blue-400 mb-4">📋 {q.regulatoryRef}</p>
                    
                    <RadioGroup value={answers[q.id]?.toString()} onValueChange={(v) => setAnswers({...answers, [q.id]: parseInt(v)})}>
                      {q.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={optIdx.toString()} id={`q${q.id}-${optIdx}`} className="border-[#2a3548]" />
                          <Label htmlFor={`q${q.id}-${optIdx}`} className="text-sm text-slate-300 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <Textarea
                      placeholder="Add notes or context (optional)..."
                      value={notes[q.id] || ''}
                      onChange={(e) => setNotes({...notes, [q.id]: e.target.value})}
                      className="mt-3 bg-[#1a2332] border-[#2a3548] text-white text-xs h-16"
                    />
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t border-[#2a3548]">
              <div className="text-sm text-slate-400">
                {Object.keys(answers).length} of {privacyQuestionnaire.length} questions answered
                {Object.keys(answers).length < privacyQuestionnaire.length && (
                  <span className="text-amber-400 ml-2">(partial analysis available)</span>
                )}
              </div>
              <Button
                onClick={generateAIInsights}
                disabled={Object.keys(answers).length === 0 || analyzing}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate AI Insights
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="px-6 pb-6 m-0">
            {results && (
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6 py-4">
                  {/* Score Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Overall Score</span>
                        <Award className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className={`text-4xl font-bold ${riskLevelColor}`}>
                        {results.overallScore}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">out of 100</div>
                    </Card>

                    <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Risk Level</span>
                        <AlertTriangle className={`h-5 w-5 ${riskLevelColor}`} />
                      </div>
                      <div className={`text-2xl font-bold ${riskLevelColor}`}>
                        {riskLevel}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Current posture</div>
                    </Card>

                    <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Critical Issues</span>
                        <Target className="h-5 w-5 text-rose-400" />
                      </div>
                      <div className="text-4xl font-bold text-rose-400">
                        {results.criticalIssues.length}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Require attention</div>
                    </Card>
                  </div>

                  {/* Category Breakdown */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-blue-400" />
                      Category Risk Analysis
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={results.categoryData}>
                          <PolarGrid stroke="#2a3548" />
                          <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                          <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                          <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                        </RadarChart>
                      </ResponsiveContainer>

                      <div className="space-y-3">
                        {results.categoryData.sort((a, b) => a.score - b.score).map((cat, idx) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-300">{cat.name}</span>
                              <span className={`text-sm font-semibold ${
                                cat.score >= 80 ? 'text-emerald-400' :
                                cat.score >= 60 ? 'text-blue-400' :
                                cat.score >= 40 ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {cat.score}%
                              </span>
                            </div>
                            <Progress value={cat.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* AI Insights */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      AI-Generated Insights & Recommendations
                    </h3>
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
                          <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 text-indigo-300 italic bg-indigo-500/5 py-2 rounded-r">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {results.insights}
                    </ReactMarkdown>
                  </Card>
                </div>
              </ScrollArea>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#2a3548]">
              <Button variant="outline" onClick={() => setCurrentStep("questionnaire")} className="border-[#2a3548] text-slate-300 hover:bg-[#2a3548]">
                Review Answers
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))} className="border-[#2a3548] text-slate-300 hover:bg-[#2a3548]">
                  Copy Results
                </Button>
                <Button onClick={exportResults} className="bg-indigo-600 hover:bg-indigo-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Risk Assessment
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}