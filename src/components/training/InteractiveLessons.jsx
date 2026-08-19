import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PlayCircle, CheckCircle2, Lock, BookOpen, 
  ArrowRight, Clock, Target, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function InteractiveLessons({ userEmail, progress = [] }) {
  const [selectedModule, setSelectedModule] = useState('risk_management');
  const [activeLesson, setActiveLesson] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: (data) => {
      const existing = progress.find(p => p.user_email === userEmail && p.module === data.module && p.lesson_id === data.lesson_id);
      if (existing) {
        return base44.entities.TrainingProgress.update(existing.id, data);
      }
      return base44.entities.TrainingProgress.create({ ...data, user_email: userEmail });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-progress'] });
    }
  });

  const lessons = {
    risk_management: [
      {
        id: 'risk-101',
        title: 'Risk Fundamentals',
        duration: '15 min',
        difficulty: 'Beginner',
        pages: [
          { title: 'What is Risk?', content: '## Understanding Risk\n\nRisk is the **possibility of an event** that could impact your organization\'s ability to achieve its objectives.\n\n### Key Components:\n- **Threat**: Potential cause of unwanted incident\n- **Vulnerability**: Weakness that can be exploited\n- **Impact**: Consequence if risk materializes\n- **Likelihood**: Probability of occurrence\n\n### Example:\nA cyber attack (threat) on outdated systems (vulnerability) could result in data breach (impact) with medium probability (likelihood).' },
          { title: 'Risk Categories', content: '## Types of Risks\n\n### Strategic Risks\n- Business model changes\n- Market competition\n- Mergers & acquisitions\n\n### Operational Risks\n- Process failures\n- Human errors\n- System outages\n\n### Financial Risks\n- Market volatility\n- Credit risk\n- Liquidity issues\n\n### Compliance Risks\n- Regulatory violations\n- Policy non-compliance\n- Legal penalties' },
          { title: 'Risk Assessment Process', content: '## How to Assess Risks\n\n### Step 1: Identify\nList all potential risks to your organization\n\n### Step 2: Analyze\nEvaluate likelihood and impact (1-5 scale)\n\n### Step 3: Evaluate\nCalculate risk score: **Likelihood × Impact**\n\n### Step 4: Treat\nChoose strategy: Avoid, Reduce, Transfer, or Accept\n\n### Step 5: Monitor\nContinuously track and reassess risks' }
        ]
      },
      {
        id: 'risk-202',
        title: 'Advanced Risk Analysis',
        duration: '20 min',
        difficulty: 'Intermediate',
        pages: [
          { title: 'Inherent vs Residual Risk', content: '## Understanding Risk Scores\n\n### Inherent Risk\n**Risk BEFORE controls** are applied\n- Pure exposure\n- Worst-case scenario\n- Used for prioritization\n\n### Residual Risk\n**Risk AFTER controls** are implemented\n- Remaining exposure\n- Actual risk level\n- Basis for treatment decisions\n\n**Formula**: Residual Risk = Inherent Risk - Control Effectiveness' },
          { title: 'Risk Treatment Strategies', content: '## The 4 T\'s of Risk Treatment\n\n### 1. Avoid (Terminate)\nEliminate the activity causing risk\n- Stop offering risky product\n- Exit high-risk market\n\n### 2. Reduce (Treat)\nImplement controls to lower risk\n- Add security controls\n- Improve processes\n\n### 3. Transfer\nShift risk to third party\n- Insurance\n- Outsourcing\n\n### 4. Accept\nKnowingly retain the risk\n- Cost of mitigation > potential loss\n- Document decision' }
        ]
      }
    ],
    controls: [
      {
        id: 'controls-101',
        title: 'Control Fundamentals',
        duration: '15 min',
        difficulty: 'Beginner',
        pages: [
          { title: 'What are Controls?', content: '## Understanding Controls\n\nControls are **safeguards or countermeasures** to avoid, detect, counteract, or minimize security risks.\n\n### Why Controls Matter:\n- Reduce likelihood of risk occurring\n- Minimize impact if risk materializes\n- Ensure compliance with regulations\n- Protect organizational assets\n\n### Real Example:\nMandatory password rotation (control) reduces risk of unauthorized access (risk).' },
          { title: 'Types of Controls', content: '## Control Categories\n\n### Preventive Controls\nStop incidents before they happen\n- Password requirements\n- Access restrictions\n- Training programs\n\n### Detective Controls\nIdentify incidents after occurrence\n- Log monitoring\n- Audit trails\n- Reconciliations\n\n### Corrective Controls\nFix issues after detection\n- Incident response\n- Backup restoration\n- Patching processes' },
          { title: 'Control Effectiveness', content: '## Measuring Control Effectiveness\n\n### Effectiveness Scale (1-5):\n1. **Not Effective**: Control failed\n2. **Partially Effective**: Some gaps\n3. **Mostly Effective**: Minor issues\n4. **Effective**: Working as designed\n5. **Highly Effective**: Exceeds expectations\n\n### Testing Methods:\n- **Design Testing**: Is control properly designed?\n- **Operating Testing**: Does it work consistently?\n- **Evidence Review**: Documented proof of operation' }
        ]
      }
    ],
    compliance: [
      {
        id: 'compliance-101',
        title: 'Compliance Basics',
        duration: '15 min',
        difficulty: 'Beginner',
        pages: [
          { title: 'Understanding Compliance', content: '## What is Compliance?\n\nCompliance means **conforming to established guidelines, regulations, and laws** relevant to your business.\n\n### Why It Matters:\n- Avoid legal penalties and fines\n- Maintain customer trust\n- Ensure market access\n- Protect reputation\n\n### Common Frameworks:\n- **SOX**: Financial reporting\n- **GDPR**: Data privacy\n- **ISO 27001**: Information security\n- **HIPAA**: Healthcare privacy' },
          { title: 'Compliance Frameworks', content: '## Major Compliance Frameworks\n\n### SOX (Sarbanes-Oxley)\n- Financial controls\n- Internal control certification\n- Audit requirements\n\n### GDPR (General Data Protection Regulation)\n- Personal data protection\n- Privacy rights\n- Breach notification\n\n### ISO 27001\n- Information security management\n- Risk-based approach\n- Certification process' }
        ]
      }
    ]
  };

  const moduleLessons = lessons[selectedModule] || [];
  const completedLessons = progress.filter(p => p.module === selectedModule && (p.status === 'completed' || p.status === 'mastered')).map(p => p.lesson_id);

  const startLesson = (lesson) => {
    setActiveLesson(lesson);
    setCurrentPage(0);
    
    updateProgressMutation.mutate({
      module: selectedModule,
      lesson_id: lesson.id,
      lesson_title: lesson.title,
      status: 'in_progress',
      last_accessed: new Date().toISOString()
    });
  };

  const completeLesson = () => {
    updateProgressMutation.mutate({
      module: selectedModule,
      lesson_id: activeLesson.id,
      lesson_title: activeLesson.title,
      status: 'completed',
      last_accessed: new Date().toISOString()
    });
    
    toast.success("Lesson completed! 🎉");
    setActiveLesson(null);
  };

  if (activeLesson) {
    const page = activeLesson.pages[currentPage];
    const isLastPage = currentPage === activeLesson.pages.length - 1;

    return (
      <div className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
              <p className="text-sm text-slate-400">{page.title}</p>
            </div>
            <Button onClick={() => setActiveLesson(null)} variant="outline" className="border-[#2a3548]">
              Exit Lesson
            </Button>
          </div>
          <Progress value={((currentPage + 1) / activeLesson.pages.length) * 100} className="h-2" />
          <div className="text-xs text-slate-400 mt-2">
            Page {currentPage + 1} of {activeLesson.pages.length}
          </div>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-8">
            <ScrollArea className="h-[500px] pr-4">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-semibold text-white mb-3 mt-6">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-medium text-white mb-2 mt-4">{children}</h3>,
                    p: ({ children }) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                    li: ({ children }) => <li className="text-slate-300">{children}</li>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>
                  }}
                >
                  {page.content}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            variant="outline"
            className="border-[#2a3548]"
          >
            Previous
          </Button>
          
          {isLastPage ? (
            <Button onClick={completeLesson} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Lesson
            </Button>
          ) : (
            <Button onClick={() => setCurrentPage(currentPage + 1)} className="bg-indigo-600 hover:bg-indigo-700">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548] p-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {Object.keys(lessons).map(moduleId => (
            <Button
              key={moduleId}
              onClick={() => setSelectedModule(moduleId)}
              variant={selectedModule === moduleId ? "default" : "outline"}
              className={selectedModule === moduleId ? "bg-indigo-600" : "border-[#2a3548]"}
            >
              {moduleId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moduleLessons.map((lesson, idx) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isLocked = idx > 0 && !completedLessons.includes(moduleLessons[idx - 1]?.id);

          return (
            <Card 
              key={lesson.id}
              className={`bg-[#1a2332] border-[#2a3548] ${isLocked ? 'opacity-50' : 'hover:border-indigo-500/40 cursor-pointer'} transition-all`}
              onClick={() => !isLocked && startLesson(lesson)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-[10px] ${
                        lesson.difficulty === 'Beginner' ? 'bg-blue-500/20 text-blue-400' :
                        lesson.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {lesson.difficulty}
                      </Badge>
                      <Badge className="bg-slate-500/10 text-slate-400 text-[10px]">
                        <Clock className="h-3 w-3 mr-1" />
                        {lesson.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-base text-white">{lesson.title}</CardTitle>
                  </div>
                  {isLocked ? (
                    <Lock className="h-5 w-5 text-slate-600" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <PlayCircle className="h-5 w-5 text-indigo-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-400 mb-3">
                  {lesson.pages.length} pages • {lesson.pages.map(p => p.title).join(' → ')}
                </div>
                {!isLocked && (
                  <Button 
                    onClick={() => startLesson(lesson)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLocked}
                  >
                    {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {isLocked && (
                  <p className="text-xs text-slate-500 text-center">
                    Complete previous lesson to unlock
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}