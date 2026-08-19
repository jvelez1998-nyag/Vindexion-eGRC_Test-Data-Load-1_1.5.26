import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { FileText, Download, Loader2, CheckCircle2, Package, Shield, Lock, AlertTriangle, Users } from "lucide-react";

// Source questionnaire templates from various modules
const QUESTIONNAIRE_SOURCES = [
  {
    id: 'client_security',
    name: 'Client Security Assessment',
    module: 'Client Management',
    icon: Shield,
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    framework: 'ISO27001',
    difficulty: 'advanced',
    questionCount: 42,
    questions: [
      {
        question_text: "What is the primary purpose of implementing a Security Operations Center (SOC)?",
        options: ["A) To monitor and respond to security incidents in real-time", "B) To develop security policies", "C) To train employees", "D) To backup data"],
        correct_answer: "A",
        explanation: "A SOC's primary purpose is continuous monitoring and incident response to detect and mitigate security threats in real-time.",
        question_type: "conceptual",
        control_domain: "security_operations",
        risk_level: "high",
        tags: ["SOC", "monitoring", "incident-response"]
      },
      {
        question_text: "Which encryption standard is recommended for protecting sensitive data at rest?",
        options: ["A) AES-256", "B) MD5", "C) SHA-1", "D) DES"],
        correct_answer: "A",
        explanation: "AES-256 is the industry-standard encryption algorithm for protecting data at rest, offering robust security.",
        question_type: "technical",
        control_domain: "data_protection",
        risk_level: "critical",
        tags: ["encryption", "data-protection", "AES"]
      }
    ]
  },
  {
    id: 'client_compliance',
    name: 'Compliance Readiness Assessment',
    module: 'Client Management',
    icon: CheckCircle2,
    color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
    framework: 'SOX',
    difficulty: 'intermediate',
    questionCount: 38,
    questions: [
      {
        question_text: "What is the primary objective of SOX Section 404?",
        options: ["A) Management assessment of internal controls over financial reporting", "B) Audit committee independence", "C) CEO/CFO certification", "D) Whistleblower protection"],
        correct_answer: "A",
        explanation: "Section 404 requires management to assess and report on the effectiveness of internal controls over financial reporting.",
        question_type: "definition",
        control_domain: "financial_controls",
        risk_level: "high",
        tags: ["SOX", "section-404", "internal-controls"]
      },
      {
        question_text: "How often must SOX 404 assessments be performed?",
        options: ["A) Annually", "B) Quarterly", "C) Monthly", "D) As needed"],
        correct_answer: "A",
        explanation: "SOX 404 assessments must be performed and reported annually in the company's annual report.",
        question_type: "conceptual",
        control_domain: "compliance_monitoring",
        risk_level: "medium",
        tags: ["SOX", "assessment-frequency", "reporting"]
      }
    ]
  },
  {
    id: 'client_risk',
    name: 'Enterprise Risk Assessment',
    module: 'Client Management',
    icon: AlertTriangle,
    color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    framework: 'COSO',
    difficulty: 'advanced',
    questionCount: 35,
    questions: [
      {
        question_text: "Which COSO component focuses on identifying and analyzing relevant risks?",
        options: ["A) Risk Assessment", "B) Control Activities", "C) Information & Communication", "D) Monitoring"],
        correct_answer: "A",
        explanation: "The Risk Assessment component of COSO's framework specifically addresses identifying, analyzing, and responding to risks.",
        question_type: "definition",
        control_domain: "risk_management",
        risk_level: "high",
        tags: ["COSO", "risk-assessment", "framework"]
      }
    ]
  },
  {
    id: 'client_privacy',
    name: 'Data Privacy & Protection',
    module: 'Client Management',
    icon: Lock,
    color: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    framework: 'GDPR',
    difficulty: 'intermediate',
    questionCount: 29,
    questions: [
      {
        question_text: "What is the maximum fine for GDPR non-compliance?",
        options: ["A) €20 million or 4% of global turnover, whichever is higher", "B) €10 million flat", "C) 2% of revenue", "D) €5 million"],
        correct_answer: "A",
        explanation: "GDPR imposes fines up to €20 million or 4% of annual global turnover for the most serious infringements.",
        question_type: "definition",
        control_domain: "privacy",
        risk_level: "critical",
        tags: ["GDPR", "penalties", "compliance"]
      }
    ]
  },
  {
    id: 'vendor_assessment',
    name: 'Third-Party Vendor Assessment',
    module: 'Vendor Risk Management',
    icon: Users,
    color: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20',
    framework: 'SOC2',
    difficulty: 'advanced',
    questionCount: 45,
    questions: [
      {
        question_text: "What is the primary purpose of a SOC 2 Type II report?",
        options: ["A) To provide assurance on the operational effectiveness of controls over time", "B) To certify security compliance", "C) To evaluate design of controls at a point in time", "D) To audit financial statements"],
        correct_answer: "A",
        explanation: "SOC 2 Type II reports assess the operational effectiveness of controls over a specified period, typically 6-12 months.",
        question_type: "conceptual",
        control_domain: "vendor_management",
        risk_level: "high",
        tags: ["SOC2", "type-2", "assurance"]
      }
    ]
  },
  {
    id: 'regulatory_sox',
    name: 'SOX Regulatory Exam Questions',
    module: 'Regulatory Exam Simulation',
    icon: FileText,
    color: 'from-rose-500/10 to-red-500/10 border-rose-500/20',
    framework: 'SOX',
    difficulty: 'advanced',
    questionCount: 50,
    questions: [
      {
        question_text: "Which section of SOX addresses corporate responsibility for financial reports?",
        options: ["A) Section 302", "B) Section 404", "C) Section 802", "D) Section 906"],
        correct_answer: "A",
        explanation: "Section 302 requires the CEO and CFO to personally certify the accuracy of financial reports.",
        question_type: "definition",
        control_domain: "financial_controls",
        risk_level: "critical",
        tags: ["SOX", "section-302", "certification"]
      }
    ]
  }
];

export default function QuestionBankImporter({ onImportComplete }) {
  const [selectedSources, setSelectedSources] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState(null);

  const toggleSource = (sourceId) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const selectAll = () => {
    setSelectedSources(QUESTIONNAIRE_SOURCES.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedSources([]);
  };

  const totalQuestions = QUESTIONNAIRE_SOURCES
    .filter(s => selectedSources.includes(s.id))
    .reduce((sum, s) => sum + s.questionCount, 0);

  const importQuestions = async () => {
    if (selectedSources.length === 0) {
      toast.error("Please select at least one source");
      return;
    }

    setImporting(true);
    setImportProgress(0);
    let imported = 0;
    let skipped = 0;

    try {
      // Get existing questions to avoid duplicates
      const existingQuestions = await base44.entities.QuestionBank.list();
      const existingTexts = new Set(existingQuestions.map(q => q.question_text.toLowerCase()));

      const sourcesToImport = QUESTIONNAIRE_SOURCES.filter(s => selectedSources.includes(s.id));
      let processedCount = 0;
      const totalToProcess = sourcesToImport.reduce((sum, s) => sum + s.questions.length, 0);

      for (const source of sourcesToImport) {
        for (const question of source.questions) {
          // Check for duplicate
          if (existingTexts.has(question.question_text.toLowerCase())) {
            skipped++;
          } else {
            // Import question
            await base44.entities.QuestionBank.create({
              ...question,
              framework: source.framework,
              difficulty: source.difficulty,
              source_module: source.module,
              linked_compliance: [],
              linked_controls: [],
              linked_risks: [],
              usage_count: 0,
              is_verified: false,
              status: 'active'
            });
            imported++;
            existingTexts.add(question.question_text.toLowerCase());
          }

          processedCount++;
          setImportProgress(Math.round((processedCount / totalToProcess) * 100));
        }
      }

      setImportStats({ imported, skipped, total: imported + skipped });
      toast.success(`Imported ${imported} questions successfully!`);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to import questions");
    } finally {
      setImporting(false);
    }
  };

  if (importStats) {
    return (
      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Import Complete!</h3>
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400">
                {importStats.imported} Imported
              </Badge>
              {importStats.skipped > 0 && (
                <Badge className="bg-amber-500/20 text-amber-400">
                  {importStats.skipped} Skipped (Duplicates)
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400">
              Total processed: {importStats.total} questions
            </p>
          </div>
          <Button onClick={() => setImportStats(null)} className="bg-emerald-600 hover:bg-emerald-700">
            Import More
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-400" />
            Import Questions from Platform Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Import existing questionnaire questions from various platform modules into the centralized Question Bank.
            Questions are tagged with their source module for traceability.
          </p>
          
          <div className="flex gap-2 mb-4">
            <Button onClick={selectAll} size="sm" variant="outline" className="border-violet-500/30 text-violet-400">
              Select All
            </Button>
            <Button onClick={deselectAll} size="sm" variant="outline" className="border-violet-500/30 text-violet-400">
              Deselect All
            </Button>
          </div>

          {selectedSources.length > 0 && (
            <div className="mb-4 p-3 bg-[#1a2332] rounded-lg border border-violet-500/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-300">
                  <strong className="text-violet-400">{selectedSources.length}</strong> sources selected
                </div>
                <Badge className="bg-violet-500/20 text-violet-400">
                  ~{totalQuestions} questions
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {QUESTIONNAIRE_SOURCES.map(source => {
            const Icon = source.icon;
            const isSelected = selectedSources.includes(source.id);

            return (
              <Card 
                key={source.id} 
                className={`bg-gradient-to-br ${source.color} cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-violet-500 scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
                onClick={() => toggleSource(source.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleSource(source.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-violet-400" />
                          <h4 className="text-sm font-semibold text-white">{source.name}</h4>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-slate-500/20 text-slate-400 text-[9px]">
                          {source.module}
                        </Badge>
                        <Badge className="bg-indigo-500/20 text-indigo-400 text-[9px]">
                          {source.framework}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{source.questionCount} Questions</span>
                        <Badge className={`text-[9px] ${
                          source.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                          source.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {source.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {importing && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
              <span className="text-sm text-white">Importing questions...</span>
            </div>
            <Progress value={importProgress} className="h-2" />
            <p className="text-xs text-slate-400 mt-2">{importProgress}% complete</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button 
          onClick={importQuestions}
          disabled={selectedSources.length === 0 || importing}
          className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Import Selected Questions
            </>
          )}
        </Button>
      </div>
    </div>
  );
}