import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Shield, AlertTriangle, DollarSign, Cog, Lock, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const QUESTIONNAIRES = {
  ai: {
    title: "AI & Machine Learning Risk Assessment",
    icon: Brain,
    color: "from-indigo-500 to-purple-500",
    questions: [
      { id: 1, question: "Does your organization have a documented AI governance framework?", category: "Governance" },
      { id: 2, question: "Are AI models regularly tested for bias and fairness?", category: "Ethics" },
      { id: 3, question: "Is there a process to validate AI model outputs before deployment?", category: "Quality" },
      { id: 4, question: "Are AI training datasets properly vetted and secured?", category: "Data Security" },
      { id: 5, question: "Do you have explainability mechanisms for AI decision-making?", category: "Transparency" },
      { id: 6, question: "Are third-party AI models assessed for security risks?", category: "Third Party" },
      { id: 7, question: "Is there monitoring for adversarial attacks on AI systems?", category: "Security" },
      { id: 8, question: "Are AI system failures and anomalies tracked and analyzed?", category: "Monitoring" },
      { id: 9, question: "Do you have rollback procedures for problematic AI deployments?", category: "Operations" },
      { id: 10, question: "Are privacy implications of AI processing documented and mitigated?", category: "Privacy" },
      { id: 11, question: "Is there human oversight for critical AI decisions?", category: "Oversight" },
      { id: 12, question: "Are AI algorithms tested against regulatory requirements?", category: "Compliance" },
      { id: 13, question: "Do you assess the environmental impact of AI model training?", category: "Sustainability" },
      { id: 14, question: "Are AI vendors contractually required to meet security standards?", category: "Vendor Management" },
      { id: 15, question: "Is sensitive data anonymized before AI processing?", category: "Data Protection" },
      { id: 16, question: "Do you have incident response plans for AI system failures?", category: "Incident Response" },
      { id: 17, question: "Are AI models versioned and change-controlled?", category: "Version Control" },
      { id: 18, question: "Is there regular retraining to prevent model drift?", category: "Model Maintenance" },
      { id: 19, question: "Are AI use cases evaluated for ethical implications?", category: "Ethics" },
      { id: 20, question: "Do you maintain an inventory of all AI systems in use?", category: "Asset Management" }
    ]
  },
  cyber: {
    title: "Cybersecurity Risk Assessment",
    icon: Shield,
    color: "from-blue-500 to-cyan-500",
    questions: [
      { id: 1, question: "Is multi-factor authentication enforced for all user accounts?", category: "Access Control" },
      { id: 2, question: "Are security patches applied within 30 days of release?", category: "Patch Management" },
      { id: 3, question: "Do you conduct regular vulnerability scans?", category: "Vulnerability Management" },
      { id: 4, question: "Is data encrypted both in transit and at rest?", category: "Encryption" },
      { id: 5, question: "Are security logs monitored 24/7?", category: "Monitoring" },
      { id: 6, question: "Do you have an incident response plan that is tested annually?", category: "Incident Response" },
      { id: 7, question: "Are privileged accounts managed separately from standard accounts?", category: "Access Control" },
      { id: 8, question: "Is network segmentation implemented to limit lateral movement?", category: "Network Security" },
      { id: 9, question: "Are backups encrypted and stored offline?", category: "Backup & Recovery" },
      { id: 10, question: "Do you conduct penetration testing at least annually?", category: "Testing" },
      { id: 11, question: "Are employees trained on security awareness quarterly?", category: "Training" },
      { id: 12, question: "Is endpoint detection and response (EDR) deployed?", category: "Endpoint Security" },
      { id: 13, question: "Do you have a data loss prevention (DLP) solution?", category: "Data Protection" },
      { id: 14, question: "Are wireless networks secured with WPA3 encryption?", category: "Network Security" },
      { id: 15, question: "Is there a formal process for deprovisioning user access?", category: "Access Management" },
      { id: 16, question: "Are third-party security assessments conducted before integration?", category: "Third Party" },
      { id: 17, question: "Do you maintain an asset inventory with security classifications?", category: "Asset Management" },
      { id: 18, question: "Is there a security operations center (SOC) or equivalent?", category: "Security Operations" },
      { id: 19, question: "Are API endpoints secured with authentication and rate limiting?", category: "Application Security" },
      { id: 20, question: "Do you have cyber insurance coverage?", category: "Risk Transfer" }
    ]
  },
  threat: {
    title: "Threat & Vulnerability Assessment",
    icon: AlertTriangle,
    color: "from-rose-500 to-red-500",
    questions: [
      { id: 1, question: "Do you subscribe to threat intelligence feeds?", category: "Threat Intelligence" },
      { id: 2, question: "Are critical vulnerabilities remediated within 7 days?", category: "Vulnerability Management" },
      { id: 3, question: "Is threat modeling performed for new systems and applications?", category: "Threat Modeling" },
      { id: 4, question: "Do you conduct regular threat hunting exercises?", category: "Threat Hunting" },
      { id: 5, question: "Are indicators of compromise (IOCs) shared with industry peers?", category: "Information Sharing" },
      { id: 6, question: "Is there a process to assess zero-day vulnerabilities?", category: "Emerging Threats" },
      { id: 7, question: "Are attack surface reduction measures implemented?", category: "Attack Surface" },
      { id: 8, question: "Do you track advanced persistent threats (APTs) relevant to your industry?", category: "APT Monitoring" },
      { id: 9, question: "Is red team testing conducted to simulate real attacks?", category: "Testing" },
      { id: 10, question: "Are supply chain vulnerabilities assessed?", category: "Supply Chain" },
      { id: 11, question: "Do you have a vulnerability disclosure program?", category: "Disclosure" },
      { id: 12, question: "Are threat actors tracked and profiled?", category: "Threat Actor Analysis" },
      { id: 13, question: "Is there automated correlation of security events with threats?", category: "Automation" },
      { id: 14, question: "Are exploit kits and malware families monitored?", category: "Malware Intelligence" },
      { id: 15, question: "Do you assess risks from nation-state actors?", category: "Geopolitical Threats" },
      { id: 16, question: "Are vulnerability scans performed weekly or more frequently?", category: "Scanning" },
      { id: 17, question: "Is there a threat and vulnerability management committee?", category: "Governance" },
      { id: 18, question: "Are dark web monitoring services used?", category: "Dark Web Monitoring" },
      { id: 19, question: "Do you maintain a database of past security incidents?", category: "Historical Analysis" },
      { id: 20, question: "Are threat scenarios documented and regularly updated?", category: "Scenario Planning" }
    ]
  },
  financial: {
    title: "Financial Risk Assessment",
    icon: DollarSign,
    color: "from-emerald-500 to-green-500",
    questions: [
      { id: 1, question: "Are financial controls documented and tested annually?", category: "Internal Controls" },
      { id: 2, question: "Is segregation of duties enforced in financial processes?", category: "Segregation of Duties" },
      { id: 3, question: "Are financial transactions reconciled daily?", category: "Reconciliation" },
      { id: 4, question: "Do you have fraud detection mechanisms in place?", category: "Fraud Prevention" },
      { id: 5, question: "Are financial systems access controls regularly reviewed?", category: "Access Control" },
      { id: 6, question: "Is there insurance coverage for financial losses?", category: "Risk Transfer" },
      { id: 7, question: "Are budget variances analyzed and explained?", category: "Budget Management" },
      { id: 8, question: "Do you conduct regular financial audits?", category: "Audit" },
      { id: 9, question: "Are payment authorization workflows automated and logged?", category: "Payment Controls" },
      { id: 10, question: "Is there a whistleblower hotline for financial misconduct?", category: "Ethics" },
      { id: 11, question: "Are foreign exchange risks hedged appropriately?", category: "Currency Risk" },
      { id: 12, question: "Do you assess credit risk for customers and partners?", category: "Credit Risk" },
      { id: 13, question: "Are investment portfolios diversified to minimize risk?", category: "Investment Risk" },
      { id: 14, question: "Is there monitoring for unusual financial transactions?", category: "Monitoring" },
      { id: 15, question: "Are cash flow projections regularly updated?", category: "Cash Management" },
      { id: 16, question: "Do you have contingency reserves for unexpected expenses?", category: "Contingency Planning" },
      { id: 17, question: "Are third-party financial service providers assessed?", category: "Third Party Risk" },
      { id: 18, question: "Is there a disaster recovery plan for financial systems?", category: "Business Continuity" },
      { id: 19, question: "Are financial reports reviewed by independent parties?", category: "Independent Review" },
      { id: 20, question: "Do you comply with SOX or equivalent financial regulations?", category: "Compliance" }
    ]
  },
  operational: {
    title: "Operational Risk Assessment",
    icon: Cog,
    color: "from-amber-500 to-orange-500",
    questions: [
      { id: 1, question: "Are business continuity plans tested at least annually?", category: "Business Continuity" },
      { id: 2, question: "Is there redundancy for critical operational systems?", category: "Redundancy" },
      { id: 3, question: "Are standard operating procedures documented and accessible?", category: "Documentation" },
      { id: 4, question: "Do you have backup personnel for key operational roles?", category: "Personnel" },
      { id: 5, question: "Are operational risks regularly assessed and documented?", category: "Risk Assessment" },
      { id: 6, question: "Is there a process for escalating operational issues?", category: "Escalation" },
      { id: 7, question: "Are service level agreements monitored and enforced?", category: "SLA Management" },
      { id: 8, question: "Do you conduct post-incident reviews for operational failures?", category: "Lessons Learned" },
      { id: 9, question: "Are change management processes followed for system updates?", category: "Change Management" },
      { id: 10, question: "Is operational performance tracked with KPIs?", category: "Performance Management" },
      { id: 11, question: "Are suppliers and vendors regularly evaluated?", category: "Vendor Management" },
      { id: 12, question: "Do you have disaster recovery sites for critical operations?", category: "Disaster Recovery" },
      { id: 13, question: "Are operational dependencies mapped and documented?", category: "Dependency Mapping" },
      { id: 14, question: "Is there capacity planning for future operational growth?", category: "Capacity Planning" },
      { id: 15, question: "Are operational risks included in strategic planning?", category: "Strategic Integration" },
      { id: 16, question: "Do you have insurance for operational disruptions?", category: "Risk Transfer" },
      { id: 17, question: "Are employees cross-trained to handle multiple roles?", category: "Cross-Training" },
      { id: 18, question: "Is there monitoring for operational anomalies?", category: "Monitoring" },
      { id: 19, question: "Are critical systems maintained with regular updates?", category: "Maintenance" },
      { id: 20, question: "Do you have a crisis management team and communication plan?", category: "Crisis Management" }
    ]
  },
  security: {
    title: "Physical & Information Security Assessment",
    icon: Lock,
    color: "from-purple-500 to-pink-500",
    questions: [
      { id: 1, question: "Are facilities protected with access control systems?", category: "Physical Access" },
      { id: 2, question: "Is there 24/7 surveillance of critical areas?", category: "Surveillance" },
      { id: 3, question: "Are visitors required to sign in and be escorted?", category: "Visitor Management" },
      { id: 4, question: "Do you conduct background checks on employees?", category: "Personnel Security" },
      { id: 5, question: "Are data centers protected with biometric access?", category: "Data Center Security" },
      { id: 6, question: "Is there a process for secure disposal of sensitive materials?", category: "Data Disposal" },
      { id: 7, question: "Are security guards trained and certified?", category: "Guard Services" },
      { id: 8, question: "Do you have intrusion detection systems installed?", category: "Intrusion Detection" },
      { id: 9, question: "Are fire suppression systems tested regularly?", category: "Fire Safety" },
      { id: 10, question: "Is there emergency lighting and exit signage?", category: "Emergency Preparedness" },
      { id: 11, question: "Are sensitive documents stored in locked cabinets?", category: "Document Security" },
      { id: 12, question: "Do you have a clean desk policy enforced?", category: "Clean Desk Policy" },
      { id: 13, question: "Are badge systems updated to revoke access immediately upon termination?", category: "Access Revocation" },
      { id: 14, question: "Is perimeter fencing secure and well-maintained?", category: "Perimeter Security" },
      { id: 15, question: "Are loading docks and service entrances secured?", category: "Loading Area Security" },
      { id: 16, question: "Do you conduct regular security drills?", category: "Security Training" },
      { id: 17, question: "Is there a process to report security incidents?", category: "Incident Reporting" },
      { id: 18, question: "Are portable devices encrypted and tracked?", category: "Device Security" },
      { id: 19, question: "Do you have environmental controls to protect equipment?", category: "Environmental Controls" },
      { id: 20, question: "Are security policies reviewed and updated annually?", category: "Policy Management" }
    ]
  }
};

export default function RiskAssessmentQuestionnaires({ onComplete }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);

  const questionnaire = selectedCategory ? QUESTIONNAIRES[selectedCategory] : null;

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNote = (questionId, note) => {
    setNotes({ ...notes, [questionId]: note });
  };

  const handleNext = () => {
    if (currentQuestion < questionnaire.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    const totalQuestions = questionnaire.questions.length;
    const yesAnswers = Object.values(answers).filter(a => a === 'yes').length;
    const partialAnswers = Object.values(answers).filter(a => a === 'partial').length;
    
    return Math.round(((yesAnswers + (partialAnswers * 0.5)) / totalQuestions) * 100);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const score = calculateScore();
      const answeredQuestions = questionnaire.questions.filter(q => answers[q.id]);
      
      const assessmentData = {
        assessment_name: questionnaire.title,
        assessment_type: selectedCategory,
        completion_date: new Date().toISOString().split('T')[0],
        overall_score: score,
        status: 'completed',
        questions_answered: answeredQuestions.length,
        total_questions: questionnaire.questions.length,
        questionnaire_data: {
          questions: questionnaire.questions.map(q => ({
            ...q,
            answer: answers[q.id],
            notes: notes[q.id]
          }))
        }
      };

      await base44.entities.RiskAssessment.create(assessmentData);
      toast.success('Assessment completed successfully');
      
      if (onComplete) {
        onComplete(assessmentData);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save assessment');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Preloaded Risk Assessment Questionnaires</CardTitle>
            <p className="text-sm text-slate-400 mt-2">Select a comprehensive questionnaire to assess your organization's risk posture</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(QUESTIONNAIRES).map(([key, q]) => {
                const Icon = q.icon;
                return (
                  <Card
                    key={key}
                    className="bg-[#151d2e] border-[#2a3548] cursor-pointer hover:border-indigo-500/40 transition-all"
                    onClick={() => setSelectedCategory(key)}
                  >
                    <CardContent className="p-5">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${q.color}/20 w-fit mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-white mb-2">{q.title}</h3>
                      <Badge className="bg-indigo-500/20 text-indigo-400 mb-3">
                        {q.questions.length} questions
                      </Badge>
                      <p className="text-xs text-slate-400">Comprehensive assessment covering key risk areas</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = questionnaire.icon;
  const question = questionnaire.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questionnaire.questions.length) * 100;

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${questionnaire.color}/20`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">{questionnaire.title}</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Question {currentQuestion + 1} of {questionnaire.questions.length}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedCategory(null)} className="border-[#2a3548]">
              Change Questionnaire
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-full bg-[#151d2e] rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${questionnaire.color}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6 rounded-lg bg-[#151d2e] border border-[#2a3548]">
            <Badge className="bg-indigo-500/20 text-indigo-400 mb-3">{question.category}</Badge>
            <h3 className="text-lg font-semibold text-white mb-4">{question.question}</h3>

            <RadioGroup value={answers[question.id]} onValueChange={(value) => handleAnswer(question.id, value)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-[#1a2332] hover:bg-[#2a3548] transition-colors">
                  <RadioGroupItem value="yes" id={`yes-${question.id}`} />
                  <Label htmlFor={`yes-${question.id}`} className="text-white cursor-pointer flex-1">
                    Yes - Fully Implemented
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-[#1a2332] hover:bg-[#2a3548] transition-colors">
                  <RadioGroupItem value="partial" id={`partial-${question.id}`} />
                  <Label htmlFor={`partial-${question.id}`} className="text-white cursor-pointer flex-1">
                    Partial - In Progress
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-[#1a2332] hover:bg-[#2a3548] transition-colors">
                  <RadioGroupItem value="no" id={`no-${question.id}`} />
                  <Label htmlFor={`no-${question.id}`} className="text-white cursor-pointer flex-1">
                    No - Not Implemented
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-[#1a2332] hover:bg-[#2a3548] transition-colors">
                  <RadioGroupItem value="na" id={`na-${question.id}`} />
                  <Label htmlFor={`na-${question.id}`} className="text-white cursor-pointer flex-1">
                    N/A - Not Applicable
                  </Label>
                </div>
              </div>
            </RadioGroup>

            <div className="mt-4">
              <Label className="text-sm text-slate-400 mb-2 block">Notes (Optional)</Label>
              <Textarea
                value={notes[question.id] || ''}
                onChange={(e) => handleNote(question.id, e.target.value)}
                placeholder="Add any additional context or comments..."
                className="bg-[#1a2332] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-[#2a3548]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-slate-400">
              {Object.keys(answers).length} of {questionnaire.questions.length} answered
            </div>

            {currentQuestion < questionnaire.questions.length - 1 ? (
              <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || Object.keys(answers).length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Complete Assessment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}