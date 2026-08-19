import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, Brain, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function PreExamQuestionnaire({ examType, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const questions = [
    {
      id: 'documentation_complete',
      question: 'How complete is your exam documentation repository?',
      type: 'radio',
      options: [
        { value: '90-100', label: '90-100% Complete - All documents ready' },
        { value: '70-89', label: '70-89% Complete - Most documents ready' },
        { value: '50-69', label: '50-69% Complete - Significant gaps remain' },
        { value: '<50', label: 'Less than 50% Complete - Major work needed' }
      ]
    },
    {
      id: 'mock_exams',
      question: 'Have you conducted mock exams with external validation?',
      type: 'radio',
      options: [
        { value: 'multiple', label: 'Yes, multiple mock exams completed' },
        { value: 'one', label: 'Yes, one mock exam completed' },
        { value: 'planned', label: 'Planned but not yet completed' },
        { value: 'no', label: 'No mock exams planned' }
      ]
    },
    {
      id: 'team_readiness',
      question: 'How prepared is your exam response team?',
      type: 'radio',
      options: [
        { value: 'excellent', label: 'Excellent - Team trained, roles clear, practiced responses' },
        { value: 'good', label: 'Good - Team assigned, some training completed' },
        { value: 'fair', label: 'Fair - Team forming, minimal training' },
        { value: 'poor', label: 'Poor - Team not yet assembled or trained' }
      ]
    },
    {
      id: 'critical_gaps',
      question: 'Have all critical gaps from previous exams been remediated?',
      type: 'radio',
      options: [
        { value: 'yes_all', label: 'Yes, all gaps fully remediated with evidence' },
        { value: 'mostly', label: 'Mostly - 1-2 gaps remain in progress' },
        { value: 'partial', label: 'Partial - Several gaps still open' },
        { value: 'no', label: 'No, significant gaps remain unaddressed' }
      ]
    },
    {
      id: 'vendor_assessments',
      question: 'Are your critical vendor due diligence assessments current?',
      type: 'radio',
      options: [
        { value: 'all_current', label: 'Yes, all critical vendors assessed within 12 months' },
        { value: 'most_current', label: 'Most current, 1-2 vendors need refresh' },
        { value: 'some_outdated', label: 'Several outdated assessments (>12 months)' },
        { value: 'significantly_outdated', label: 'Many assessments outdated or missing' }
      ]
    },
    {
      id: 'board_reporting',
      question: 'Do you have comprehensive board reporting on key risk areas?',
      type: 'radio',
      options: [
        { value: 'comprehensive', label: 'Comprehensive reporting with clear minutes' },
        { value: 'adequate', label: 'Adequate reporting, some gaps' },
        { value: 'limited', label: 'Limited reporting, significant gaps' },
        { value: 'insufficient', label: 'Insufficient or missing board reporting' }
      ]
    },
    {
      id: 'incident_response',
      question: 'Is your incident response plan tested and current?',
      type: 'radio',
      options: [
        { value: 'tested_current', label: 'Tested within 6 months and fully documented' },
        { value: 'documented', label: 'Documented but not recently tested' },
        { value: 'outdated', label: 'Exists but needs updating' },
        { value: 'missing', label: 'No formal incident response plan' }
      ]
    },
    {
      id: 'change_management',
      question: 'How mature is your change management process?',
      type: 'radio',
      options: [
        { value: 'mature', label: 'Mature - Documented, enforced, with evidence' },
        { value: 'established', label: 'Established - Process in place, some gaps' },
        { value: 'developing', label: 'Developing - Basic process, not fully enforced' },
        { value: 'ad_hoc', label: 'Ad-hoc - No formal process' }
      ]
    },
    {
      id: 'access_controls',
      question: 'Are access control reviews performed regularly?',
      type: 'radio',
      options: [
        { value: 'quarterly', label: 'Yes, quarterly with documented results' },
        { value: 'semi_annual', label: 'Yes, semi-annually' },
        { value: 'annual', label: 'Yes, annually only' },
        { value: 'irregular', label: 'Irregular or not documented' }
      ]
    },
    {
      id: 'data_classification',
      question: 'Is your data classified and inventoried?',
      type: 'radio',
      options: [
        { value: 'complete', label: 'Complete classification with inventory' },
        { value: 'partial', label: 'Partial classification, inventory in progress' },
        { value: 'basic', label: 'Basic classification only' },
        { value: 'none', label: 'No formal data classification' }
      ]
    },
    {
      id: 'business_continuity',
      question: 'When was your business continuity plan last tested?',
      type: 'radio',
      options: [
        { value: 'recent', label: 'Within last 6 months with documented results' },
        { value: 'year', label: 'Within last 12 months' },
        { value: 'older', label: 'More than 12 months ago' },
        { value: 'never', label: 'Never tested or no plan exists' }
      ]
    },
    {
      id: 'security_awareness',
      question: 'What is the status of security awareness training?',
      type: 'radio',
      options: [
        { value: 'comprehensive', label: 'Comprehensive - Annual training with phishing tests' },
        { value: 'basic', label: 'Basic annual training provided' },
        { value: 'ad_hoc', label: 'Ad-hoc training, no formal program' },
        { value: 'minimal', label: 'Minimal or no security training' }
      ]
    },
    {
      id: 'vulnerability_management',
      question: 'How frequently are vulnerability scans performed?',
      type: 'radio',
      options: [
        { value: 'continuous', label: 'Continuous or weekly scanning' },
        { value: 'monthly', label: 'Monthly scanning' },
        { value: 'quarterly', label: 'Quarterly only' },
        { value: 'irregular', label: 'Irregular or no scanning' }
      ]
    },
    {
      id: 'audit_trail',
      question: 'Are audit logs collected, reviewed, and retained appropriately?',
      type: 'radio',
      options: [
        { value: 'comprehensive', label: 'Comprehensive - Automated monitoring and retention' },
        { value: 'adequate', label: 'Adequate - Logs collected with periodic review' },
        { value: 'basic', label: 'Basic - Logs collected, minimal review' },
        { value: 'insufficient', label: 'Insufficient - Gaps in collection or retention' }
      ]
    },
    {
      id: 'policy_review',
      question: 'When were your security policies last reviewed and updated?',
      type: 'radio',
      options: [
        { value: 'current', label: 'Within last 6 months - Fully current' },
        { value: 'recent', label: 'Within last 12 months' },
        { value: 'outdated', label: 'More than 12 months ago' },
        { value: 'very_old', label: 'More than 2 years or never' }
      ]
    },
    {
      id: 'network_segmentation',
      question: 'Is your network properly segmented with controls?',
      type: 'radio',
      options: [
        { value: 'extensive', label: 'Extensive segmentation with monitoring' },
        { value: 'moderate', label: 'Moderate segmentation in place' },
        { value: 'minimal', label: 'Minimal segmentation' },
        { value: 'none', label: 'Flat network, no segmentation' }
      ]
    },
    {
      id: 'encryption',
      question: 'What is the status of data encryption (at rest and in transit)?',
      type: 'radio',
      options: [
        { value: 'comprehensive', label: 'Comprehensive - All sensitive data encrypted' },
        { value: 'most', label: 'Most data encrypted, some gaps' },
        { value: 'partial', label: 'Partial encryption implementation' },
        { value: 'minimal', label: 'Minimal or no encryption' }
      ]
    },
    {
      id: 'compliance_monitoring',
      question: 'Do you have continuous compliance monitoring?',
      type: 'radio',
      options: [
        { value: 'automated', label: 'Automated monitoring with dashboards' },
        { value: 'manual_regular', label: 'Regular manual monitoring' },
        { value: 'periodic', label: 'Periodic assessments only' },
        { value: 'reactive', label: 'Reactive, no proactive monitoring' }
      ]
    },
    {
      id: 'concern_areas',
      question: 'What areas are you most concerned about for this exam?',
      type: 'textarea',
      placeholder: 'Describe your top 3-5 areas of concern...'
    },
    {
      id: 'time_available',
      question: 'How much time can your team dedicate to exam prep weekly?',
      type: 'radio',
      options: [
        { value: '40+', label: '40+ hours - Dedicated team' },
        { value: '20-40', label: '20-40 hours - Part-time focus' },
        { value: '10-20', label: '10-20 hours - Limited availability' },
        { value: '<10', label: 'Less than 10 hours - Severely constrained' }
      ]
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeResponses();
    }
  };

  const analyzeResponses = async () => {
    setAnalyzing(true);
    try {
      const prompt = `Analyze this pre-exam questionnaire and provide a comprehensive readiness assessment with actionable recommendations.

EXAM TYPE: ${examType}
DAYS UNTIL EXAM: ${exam?.exam_date ? Math.ceil((new Date(exam.exam_date) - new Date()) / (1000 * 60 * 60 * 24)) : 'TBD'}

QUESTIONNAIRE RESPONSES:
${JSON.stringify(answers, null, 2)}

Provide:
1. Overall readiness score (0-100)
2. Category scores (documentation, team, compliance, risk, governance)
3. Top 5 critical actions needed (priority ordered)
4. Estimated hours needed for full readiness
5. Risk assessment (high/medium/low risks for exam)
6. Personalized preparation roadmap

Return structured JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_readiness: { type: "number" },
            category_scores: { type: "object" },
            critical_actions: { type: "array" },
            estimated_hours: { type: "number" },
            risk_areas: { type: "array" },
            roadmap: { type: "array" }
          }
        }
      });

      setAnalysis(response);
      if (onComplete) onComplete(response);
      toast.success("Assessment complete");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const currentQ = questions[currentQuestion];

  if (analysis) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            AI Readiness Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="text-5xl font-bold text-white mb-2">{analysis.overall_readiness}%</div>
            <div className="text-sm text-slate-400">Overall Readiness Score</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(analysis.category_scores || {}).map(([category, score]) => (
              <div key={category} className="text-center p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="text-xl font-bold text-white mb-1">{score}%</div>
                <div className="text-xs text-slate-500">{category.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Actions Required
            </h4>
            <ul className="space-y-2">
              {(analysis.critical_actions || []).map((action, idx) => (
                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-rose-400 font-bold">{idx + 1}.</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="text-sm text-slate-400 mb-1">Estimated Prep Hours</div>
              <div className="text-2xl font-bold text-white">{analysis.estimated_hours}h</div>
            </div>
            <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="text-sm text-slate-400 mb-1">High Risk Areas</div>
              <div className="text-2xl font-bold text-rose-400">{analysis.risk_areas?.length || 0}</div>
            </div>
          </div>

          <Button onClick={() => { setAnalysis(null); setCurrentQuestion(0); setAnswers({}); }} className="w-full" variant="outline">
            Retake Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-indigo-400" />
          Pre-Exam Readiness Questionnaire
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-sm text-white">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">{currentQ.question}</h3>
          
          {currentQ.type === 'radio' ? (
            <RadioGroup value={answers[currentQ.id]} onValueChange={handleAnswer}>
              <div className="space-y-3">
                {currentQ.options.map(option => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg bg-[#0f1623] border border-[#2a3548] hover:border-indigo-500/40 transition-all cursor-pointer">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm text-slate-300 cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <Textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={currentQ.placeholder}
              className="bg-[#0f1623] border-[#2a3548] text-white h-32"
            />
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[#2a3548]">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="border-[#2a3548]"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQ.id] || analyzing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {analyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : currentQuestion === questions.length - 1 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Assessment
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}