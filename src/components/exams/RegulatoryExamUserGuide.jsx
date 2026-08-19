import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, ClipboardCheck, Calendar, GitBranch, Target, Lightbulb, Sparkles, FileText, Brain,
  CheckCircle2, AlertCircle, Settings, Award, TrendingUp
} from "lucide-react";

const GuideSection = ({ icon: Icon, title, steps }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-violet-500/20">
          <Icon className="h-6 w-6 text-violet-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-8 pb-6 border-l-2 border-violet-500/30 last:border-l-0 last:pb-0">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white text-sm font-bold">{idx + 1}</span>
            </div>
            
            <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2a3548]">
              <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{step.description}</p>
              
              {step.image && (
                <div className="bg-[#0f1623] rounded-lg p-4 border border-[#2a3548] mb-3">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg">
                    <step.image className="h-16 w-16 text-violet-400/30" />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">{step.imageCaption}</p>
                </div>
              )}
              
              {step.tips && (
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-violet-400 mb-1">Pro Tip</p>
                      <p className="text-xs text-slate-300">{step.tips}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {step.warning && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-400 mb-1">Important</p>
                      <p className="text-xs text-slate-300">{step.warning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RegulatoryExamUserGuide() {
  const [activeGuide, setActiveGuide] = useState("dashboard");

  const guides = {
    dashboard: {
      icon: ClipboardCheck,
      title: "Exam Dashboard Overview",
      steps: [
        {
          title: "Understanding Performance Metrics",
          description: "The dashboard displays four key metrics: Average Score, Exams Passed, Total Study Time, and Exams Completed. These track your exam preparation effectiveness.",
          image: Award,
          imageCaption: "Performance metrics cards",
          tips: "Aim for 80%+ average score to ensure strong understanding of regulatory requirements."
        },
        {
          title: "Performance Trend Analysis",
          description: "The line chart shows your exam scores over time. Track improvement trends and identify frameworks where you need additional study.",
          image: TrendingUp,
          imageCaption: "Performance trend chart",
          tips: "Consistent score improvement indicates effective learning - if scores plateau, adjust study methods."
        },
        {
          title: "Exam Status Distribution",
          description: "The pie chart shows breakdown of exams: Passed, Failed, and In Progress. Use this to plan your exam schedule and identify areas needing more practice.",
          image: Brain,
          imageCaption: "Status distribution pie chart"
        },
        {
          title: "Resuming In-Progress Exams",
          description: "View paused or in-progress exams with completion status. Click 'Resume' to continue where you left off - progress is automatically saved.",
          image: ClipboardCheck,
          imageCaption: "In-progress exams list",
          warning: "Complete in-progress exams within 7 days - questions and content may be updated after that period."
        }
      ]
    },
    
    schedule: {
      icon: Calendar,
      title: "Exam Scheduling",
      steps: [
        {
          title: "Creating Exam Schedule",
          description: "Click 'Schedule Exam' to plan upcoming regulatory exams. Select exam type (FFIEC, FDIC, OCC, SEC, etc.), set exam date, and define scope areas.",
          image: Calendar,
          imageCaption: "Exam scheduling form",
          tips: "Schedule practice exams 4-6 weeks before actual regulatory exams for adequate preparation time."
        },
        {
          title: "Setting Team Members",
          description: "Assign lead coordinator and team members for each exam. Define roles and responsibilities to ensure comprehensive exam coverage.",
          image: CheckCircle2,
          imageCaption: "Team assignment interface"
        },
        {
          title: "Defining Scope Areas",
          description: "Specify exam scope: IT controls, cybersecurity, BSA/AML, consumer compliance, etc. Targeted scope helps focus preparation efforts.",
          image: Target,
          imageCaption: "Scope definition checklist",
          tips: "Review prior exam reports to identify historically problematic areas for focused preparation."
        },
        {
          title: "Calendar View",
          description: "View all scheduled exams in calendar format. Color-coded by exam type and status. Identify scheduling conflicts and preparation timeline gaps.",
          image: Calendar,
          imageCaption: "Exam calendar view"
        },
        {
          title: "Automated Reminders",
          description: "System sends automated reminders at key milestones: 90 days out, 30 days out, 7 days out, and day before exam. Customize reminder schedule.",
          image: AlertCircle,
          imageCaption: "Reminder configuration",
          warning: "Critical preparation tasks (document gathering, control testing) should start 60+ days before exam."
        }
      ]
    },
    
    workflow: {
      icon: GitBranch,
      title: "Exam Workflow Management",
      steps: [
        {
          title: "Understanding Workflow Stages",
          description: "Exams progress through stages: Preparation, Documentation, Testing, Final Review, and Exam Ready. Track status and ensure timely progression.",
          image: GitBranch,
          imageCaption: "Workflow stage diagram",
          tips: "Allocate 40% of time to Preparation, 30% to Documentation, 20% to Testing, 10% to Final Review."
        },
        {
          title: "Preparation Stage Activities",
          description: "In Preparation stage: identify scope, assign team, collect prior exam reports, update policies, and conduct gap analysis.",
          image: Target,
          imageCaption: "Preparation checklist"
        },
        {
          title: "Documentation Stage",
          description: "Gather and organize evidence: policies, procedures, control documentation, test results, incident reports, training records.",
          image: FileText,
          imageCaption: "Documentation repository",
          warning: "Documentation gaps discovered during exam cause delays - complete documentation gathering early."
        },
        {
          title: "Testing Stage",
          description: "Perform control testing, validate procedures are followed, test disaster recovery plans, and document test results with evidence.",
          image: CheckCircle2,
          imageCaption: "Testing tracker"
        },
        {
          title: "Tracking Workflow Progress",
          description: "Monitor overall exam readiness score (0-100%) based on stage completion. System calculates readiness using weighted stage progress.",
          image: TrendingUp,
          imageCaption: "Readiness score dashboard",
          tips: "Achieve 90%+ readiness score before scheduling actual exam date for best outcomes."
        }
      ]
    },
    
    readiness: {
      icon: ClipboardCheck,
      title: "Readiness Assessment",
      steps: [
        {
          title: "Running Pre-Exam Assessment",
          description: "Complete comprehensive readiness questionnaire covering all exam scope areas. AI analyzes responses and identifies preparation gaps.",
          image: ClipboardCheck,
          imageCaption: "Readiness questionnaire",
          tips: "Complete readiness assessments monthly during preparation to track improvement."
        },
        {
          title: "Gap Analysis Results",
          description: "Review identified gaps with severity ratings. AI prioritizes gaps by impact on exam outcome and provides remediation recommendations.",
          image: AlertCircle,
          imageCaption: "Gap analysis results"
        },
        {
          title: "Creating Remediation Plans",
          description: "For each identified gap, create action plan with tasks, owners, and deadlines. Link remediation tasks to exam preparation workflow.",
          image: Target,
          imageCaption: "Remediation planning interface",
          warning: "Critical gaps should be remediated 30+ days before exam - last-minute fixes often fail."
        },
        {
          title: "Readiness Score Tracking",
          description: "Monitor readiness score evolution over preparation period. Score increases as gaps are remediated and documentation completed.",
          image: TrendingUp,
          imageCaption: "Readiness score trend"
        },
        {
          title: "Success Story Benchmarking",
          description: "Compare your readiness profile against successful past exams. Identify what high-performing exam teams did differently.",
          image: Award,
          imageCaption: "Benchmarking dashboard",
          tips: "Study success patterns from similar exam types and organizational profiles for proven strategies."
        }
      ]
    },
    
    ai_tips: {
      icon: Lightbulb,
      title: "AI Interactive Tips",
      steps: [
        {
          title: "Personalized Study Recommendations",
          description: "AI analyzes your exam history, weak areas, and time remaining to create personalized study plans. Focus on high-impact topics.",
          image: Brain,
          imageCaption: "AI study recommendations",
          tips: "Follow AI recommendations but supplement with your organization's specific contexts and past exam experiences."
        },
        {
          title: "Real-Time Exam Tips",
          description: "During practice exams, AI provides context-sensitive tips based on your answer patterns, common mistakes, and topic difficulty.",
          image: Lightbulb,
          imageCaption: "Real-time tip delivery"
        },
        {
          title: "Weak Area Identification",
          description: "AI identifies your weakest exam areas by analyzing practice test results, study time distribution, and answer confidence levels.",
          image: AlertCircle,
          imageCaption: "Weak area analysis",
          tips: "Dedicate 60% of study time to weak areas, 30% to moderate areas, 10% to reinforcing strengths."
        },
        {
          title: "Adaptive Learning Path",
          description: "AI adjusts difficulty and topic focus based on your performance. If you master an area, it moves you to more challenging content.",
          image: TrendingUp,
          imageCaption: "Adaptive learning path"
        },
        {
          title: "Confidence Building",
          description: "AI tracks answer confidence and provides extra practice on topics where you're uncertain, even if answers are correct.",
          image: CheckCircle2,
          imageCaption: "Confidence tracking dashboard",
          tips: "Low confidence on correct answers indicates guessing - review those topics for deeper understanding."
        }
      ]
    },
    
    practice: {
      icon: Brain,
      title: "Practice Exams",
      steps: [
        {
          title: "Starting Practice Exam",
          description: "Select exam type and framework, choose question count (25, 50, 100), and set difficulty level (basic, intermediate, advanced, adaptive).",
          image: Brain,
          imageCaption: "Practice exam launcher",
          tips: "Start with shorter exams (25 questions) to build confidence, then progress to full-length exams."
        },
        {
          title: "Exam Interface Navigation",
          description: "Use exam controls: flag questions for review, skip questions, view time remaining, and navigate between questions. All actions are saved automatically.",
          image: ClipboardCheck,
          imageCaption: "Exam interface controls"
        },
        {
          title: "Adaptive Difficulty",
          description: "In adaptive mode, question difficulty adjusts based on your performance. Correct answers lead to harder questions, testing knowledge depth.",
          image: Target,
          imageCaption: "Adaptive difficulty engine",
          warning: "Adaptive exams are more challenging but provide better skill assessment - expect lower scores initially."
        },
        {
          title: "Immediate Feedback",
          description: "After submission, receive instant feedback on each question: correct answer, explanation, regulatory reference, and related study materials.",
          image: Lightbulb,
          imageCaption: "Answer feedback screen"
        },
        {
          title: "Performance Analysis",
          description: "Review detailed performance breakdown: score by topic area, time per question, answer confidence accuracy, and improvement recommendations.",
          image: TrendingUp,
          imageCaption: "Performance analysis report",
          tips: "Review all incorrect AND correct-but-uncertain answers to solidify understanding."
        }
      ]
    },
    
    priorities: {
      icon: Target,
      title: "Exam Prioritization",
      steps: [
        {
          title: "AI Priority Assessment",
          description: "AI analyzes your GRC environment (risks, controls, compliance status) to identify which exam areas are most critical for your organization.",
          image: Target,
          imageCaption: "Priority assessment matrix",
          tips: "Focus 70% of study effort on high-priority areas identified by AI analysis."
        },
        {
          title: "Risk-Based Prioritization",
          description: "System correlates exam topics with your organization's risk profile. Areas with identified risks receive higher study priority.",
          image: AlertCircle,
          imageCaption: "Risk-based priority map"
        },
        {
          title: "Compliance Gap Alignment",
          description: "AI maps exam topics to your compliance gaps. Studying for exams simultaneously addresses real compliance deficiencies.",
          image: CheckCircle2,
          imageCaption: "Gap-exam alignment dashboard",
          tips: "Use exam prep as opportunity to remediate actual compliance gaps - dual benefit approach."
        },
        {
          title: "Time Allocation Recommendations",
          description: "Based on priorities, AI suggests optimal time distribution across exam topics. Accounts for topic difficulty and your current knowledge level.",
          image: Calendar,
          imageCaption: "Study time allocation plan"
        },
        {
          title: "Dynamic Reprioritization",
          description: "As you complete practice exams, AI re-prioritizes based on new performance data. Shifts focus to emerging weak areas.",
          image: TrendingUp,
          imageCaption: "Dynamic priority updates",
          warning: "Don't ignore changing priorities - they reflect your actual preparation needs."
        }
      ]
    },
    
    lessons: {
      icon: Sparkles,
      title: "Post-Exam Lessons Learned",
      steps: [
        {
          title: "Capturing Exam Outcomes",
          description: "After exams, document results: findings count, examiner comments, surprise topics, areas of focus, and overall impression.",
          image: FileText,
          imageCaption: "Outcome documentation form",
          tips: "Document outcomes within 48 hours while details are fresh - memories fade quickly."
        },
        {
          title: "Identifying Improvement Areas",
          description: "Analyze what went well and what needs improvement. Categorize lessons: preparation process, documentation quality, team readiness, or control effectiveness.",
          image: Target,
          imageCaption: "Improvement analysis"
        },
        {
          title: "Creating Action Items",
          description: "Convert lessons into actionable improvements: update policies, enhance controls, improve documentation, or adjust preparation processes.",
          image: CheckCircle2,
          imageCaption: "Action item tracker",
          warning: "Lessons without action items are just observations - they don't improve future outcomes."
        },
        {
          title: "Sharing Knowledge",
          description: "Share lessons learned across teams and with future exam coordinators. Build organizational memory to avoid repeating mistakes.",
          image: BookOpen,
          imageCaption: "Knowledge sharing platform"
        },
        {
          title: "Measuring Improvement",
          description: "Track how implementing lessons learned impacts future exam outcomes. Compare scores, findings count, and examiner feedback year-over-year.",
          image: TrendingUp,
          imageCaption: "Improvement metrics dashboard",
          tips: "Successful organizations show decreasing findings and increasing readiness scores over successive exams."
        }
      ]
    },
    
    reports: {
      icon: FileText,
      title: "Exam Reporting",
      steps: [
        {
          title: "Pre-Exam Reports",
          description: "Generate readiness reports for management showing preparation status, identified gaps, remediation progress, and go/no-go recommendation.",
          image: FileText,
          imageCaption: "Pre-exam readiness report",
          tips: "Present readiness reports to senior leadership 30 days before exam for final preparation approval."
        },
        {
          title: "During-Exam Daily Updates",
          description: "Create daily status updates during multi-day exams: topics covered, preliminary findings, issues encountered, and examiner feedback.",
          image: ClipboardCheck,
          imageCaption: "Daily exam status report"
        },
        {
          title: "Post-Exam Summary Reports",
          description: "Compile comprehensive post-exam reports: final findings, severity breakdown, required remediation, timeline for response, and lessons learned.",
          image: FileText,
          imageCaption: "Post-exam summary report",
          warning: "Post-exam reports often require board presentation - ensure executive summary is clear and actionable."
        },
        {
          title: "Trend Analysis Reports",
          description: "Generate multi-year trend reports showing examination outcomes, findings trends, and preparation effectiveness over time.",
          image: TrendingUp,
          imageCaption: "Multi-year trend analysis"
        },
        {
          title: "Distributing Reports",
          description: "Share exam reports with stakeholders: board, audit committee, senior management, business units. Track report distribution and acknowledgment.",
          image: CheckCircle2,
          imageCaption: "Report distribution tracker",
          tips: "Customize report detail level by audience - executives need summaries, control owners need specifics."
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <BookOpen className="h-7 w-7 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Regulatory Exam User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Complete guide to preparing for, managing, and learning from regulatory examinations
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeGuide} onValueChange={setActiveGuide} className="space-y-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <p className="text-sm text-slate-400">Select a module to view its guide</p>
          </CardHeader>
          <CardContent>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto bg-transparent p-0">
              {Object.entries(guides).map(([key, guide]) => {
                const Icon = guide.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:border-violet-500/50 border border-[#2a3548] rounded-lg h-auto"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{guide.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </CardContent>
        </Card>

        {Object.entries(guides).map(([key, guide]) => (
          <TabsContent key={key} value={key}>
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-6">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="pr-4">
                    <GuideSection
                      icon={guide.icon}
                      title={guide.title}
                      steps={guide.steps}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}