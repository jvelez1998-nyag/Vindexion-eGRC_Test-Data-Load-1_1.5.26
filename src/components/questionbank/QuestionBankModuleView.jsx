import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Shield, Users, AlertTriangle, FileCheck, Activity,
  ClipboardCheck, Calculator, BookOpen, Brain, Lock
} from "lucide-react";

// Module configuration with embedded questions
const MODULE_CONFIG = {
  'Client Management': {
    icon: Users,
    color: 'cyan',
    questionnaires: [
      'Client Risk Assessment',
      'Client Onboarding',
      'Client Security Review',
      'Client Compliance Check'
    ]
  },
  'Risk Management': {
    icon: AlertTriangle,
    color: 'rose',
    questionnaires: [
      'Risk Identification',
      'Risk Assessment',
      'Risk Mitigation Planning',
      'Residual Risk Evaluation'
    ]
  },
  'Compliance': {
    icon: FileCheck,
    color: 'emerald',
    questionnaires: [
      'SOX Compliance Check',
      'GDPR Compliance',
      'ISO 27001 Gap Analysis',
      'PCI-DSS Assessment'
    ]
  },
  'Audit': {
    icon: ClipboardCheck,
    color: 'purple',
    questionnaires: [
      'Internal Audit Planning',
      'Control Testing',
      'Audit Evidence Collection',
      'Finding Documentation'
    ]
  },
  'Vendor Management': {
    icon: Shield,
    color: 'blue',
    questionnaires: [
      'Vendor Risk Assessment',
      'Vendor Security Review',
      'Vendor Onboarding',
      'Vendor Performance Review'
    ]
  },
  'Privacy': {
    icon: Lock,
    color: 'indigo',
    questionnaires: [
      'Privacy Impact Assessment',
      'Data Protection Review',
      'Consent Management',
      'Privacy Breach Assessment'
    ]
  },
  'Regulatory Exams': {
    icon: BookOpen,
    color: 'amber',
    questionnaires: [
      'Exam Readiness Assessment',
      'Regulatory Knowledge Check',
      'Compliance Evidence Review',
      'Exam Preparation Quiz'
    ]
  },
  'Incident Management': {
    icon: Activity,
    color: 'orange',
    questionnaires: [
      'Incident Classification',
      'Impact Assessment',
      'Response Effectiveness',
      'Lessons Learned'
    ]
  }
};

export default function QuestionBankModuleView({ questions, isLoading, onQuestionClick }) {
  const [selectedModule, setSelectedModule] = useState(null);

  if (isLoading) {
    return <Skeleton className="h-96 bg-[#1a2332]" />;
  }

  // Group questions by module
  const questionsByModule = questions.reduce((acc, q) => {
    const module = q.source_module || 'General';
    if (!acc[module]) acc[module] = [];
    acc[module].push(q);
    return acc;
  }, {});

  const colorClasses = {
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    rose: { bg: 'bg-rose-500/20', border: 'border-rose-500/30', text: 'text-rose-400' },
    emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
    blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    indigo: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' },
    amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
    orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  };

  if (selectedModule) {
    const moduleQuestions = questionsByModule[selectedModule] || [];
    const config = MODULE_CONFIG[selectedModule] || {};
    const colors = colorClasses[config.color] || colorClasses.cyan;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setSelectedModule(null)}
            variant="outline"
            size="sm"
            className="border-[#2a3548]"
          >
            ← Back to Modules
          </Button>
          <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border}`}>
            {config.icon ? <config.icon className={`h-5 w-5 ${colors.text}`} /> : <Brain className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{selectedModule}</h2>
            <p className="text-sm text-slate-400">{moduleQuestions.length} questions available</p>
          </div>
        </div>

        {/* Questionnaire Sections */}
        {config.questionnaires && (
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">Available Questionnaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {config.questionnaires.map((questionnaire, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <h4 className="text-sm font-semibold text-white mb-1">{questionnaire}</h4>
                    <p className="text-xs text-slate-400">
                      {Math.floor(Math.random() * 20) + 5} questions
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {moduleQuestions.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No questions available for this module yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {moduleQuestions.map((question) => (
                  <div 
                    key={question.id}
                    onClick={() => onQuestionClick(question)}
                    className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-violet-500/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-violet-500/10 text-violet-400 text-[10px]">
                        {question.framework}
                      </Badge>
                      <Badge className="bg-amber-500/10 text-amber-400 text-[10px] capitalize">
                        {question.difficulty}
                      </Badge>
                    </div>
                    <h4 className="text-sm text-white line-clamp-2">{question.question_text}</h4>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 p-6">
        <h2 className="text-lg font-bold text-white mb-2">📚 Module-Organized Questions</h2>
        <p className="text-sm text-slate-400">
          Questions organized by platform module. Each module contains questionnaires and assessments
          used throughout the system.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(MODULE_CONFIG).map(([moduleName, config]) => {
          const count = questionsByModule[moduleName]?.length || 0;
          const colors = colorClasses[config.color];
          const Icon = config.icon;

          return (
            <Card 
              key={moduleName}
              onClick={() => setSelectedModule(moduleName)}
              className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/40 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border} shadow-lg`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div className="text-3xl font-bold text-white">{count}</div>
                </div>
                <h3 className="text-white font-semibold mb-1">{moduleName}</h3>
                <p className="text-xs text-slate-400">{config.questionnaires.length} questionnaires</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* General/Uncategorized */}
      {questionsByModule['General'] && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white">General Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-3">
              {questionsByModule['General'].length} questions not categorized by module
            </p>
            <Button
              onClick={() => setSelectedModule('General')}
              variant="outline"
              className="border-[#2a3548]"
            >
              View General Questions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}