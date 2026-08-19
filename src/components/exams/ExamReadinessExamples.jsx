import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Eye, Download, CheckCircle2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function ExamReadinessExamples() {
  const [selectedExample, setSelectedExample] = useState(null);

  const examples = [
    {
      id: 1,
      title: "FFIEC Cybersecurity Assessment - Regional Bank",
      examType: "FFIEC",
      organization: "Regional Bank ($5B assets)",
      readinessScore: 92,
      outcome: "Successful - No major findings",
      preparationTime: "12 weeks",
      keySuccessFactors: [
        "Established cross-functional exam team 10 weeks before exam",
        "Conducted 3 internal mock exams with external consultants",
        "Created centralized documentation repository with version control",
        "Assigned dedicated exam coordinator with daily status updates",
        "Performed gap analysis against FFIEC CAT 6 weeks in advance"
      ],
      criticalActivities: [
        "Week 1-2: Team formation, scope definition, initial gap analysis",
        "Week 3-6: Documentation remediation, policy updates, control testing",
        "Week 7-9: Mock exam #1, remediation of gaps, vendor assessment reviews",
        "Week 10-11: Mock exam #2, final documentation review, request list prep",
        "Week 12: Mock exam #3, final briefings, war room setup"
      ],
      documentationPrepared: [
        "Information Security Program & Policies (15 documents)",
        "Vendor Management Program & Due Diligence Reports (23 vendors)",
        "Incident Response Plan & Testing Evidence",
        "Business Continuity Plan & DR Test Results",
        "Board Minutes & Risk Committee Reports (12 months)",
        "Penetration Test & Vulnerability Scan Reports",
        "Security Awareness Training Records & Phishing Results",
        "Change Management Logs & Approval Records"
      ],
      lessonsLearned: [
        "Start preparation minimum 12 weeks in advance for comprehensive readiness",
        "Mock exams revealed 40% of actual exam questions - invaluable practice",
        "Daily stand-ups kept team aligned and issues surfaced quickly",
        "Pre-organized document repository saved 20+ hours during exam",
        "Dedicated exam coordinator was critical for managing parallel workstreams"
      ],
      metrics: {
        documentsPrepared: 87,
        mockExamsCompleted: 3,
        gapsRemediated: 23,
        teamMembers: 12,
        hoursInvested: 450
      }
    },
    {
      id: 2,
      title: "OCC Safety & Soundness - Community Bank",
      examType: "OCC",
      organization: "Community Bank ($850M assets)",
      readinessScore: 88,
      outcome: "Successful - 2 minor findings",
      preparationTime: "10 weeks",
      keySuccessFactors: [
        "Leveraged OCC exam handbook to predict focus areas",
        "Engaged third-party consultant for pre-exam assessment",
        "Created issue tracking system for all remediation items",
        "Conducted weekly C-suite briefings on readiness status",
        "Prepared concise executive summaries for all major programs"
      ],
      criticalActivities: [
        "Week 1-2: Scope analysis, resource allocation, consultant engagement",
        "Week 3-5: Risk assessment refresh, loan review sampling, credit quality analysis",
        "Week 6-8: BSA/AML program review, compliance testing, policy updates",
        "Week 9: Mock fieldwork, practice interviews, final gap remediation",
        "Week 10: War game scenarios, final document review, team briefings"
      ],
      documentationPrepared: [
        "Loan Portfolio Analysis & Credit Risk Reports",
        "BSA/AML Program & SAR Filing Documentation",
        "Capital Adequacy Analysis & Stress Testing Results",
        "Interest Rate Risk Models & Analysis",
        "Internal Audit Reports & Management Responses (24 months)",
        "Board Risk Appetite Statements & Limit Monitoring",
        "Vendor Management & Third-Party Risk Assessments",
        "IT Risk Assessment & Cybersecurity Program"
      ],
      lessonsLearned: [
        "OCC focused heavily on governance - board minutes were critical",
        "Having a 'document concierge' to quickly locate files saved hours",
        "Practice interviews with senior management reduced anxiety and improved clarity",
        "Pre-built data queries for loan sampling accelerated fieldwork",
        "Minor findings were in areas we didn't mock test - test everything"
      ],
      metrics: {
        documentsPrepared: 112,
        mockExamsCompleted: 2,
        gapsRemediated: 18,
        teamMembers: 9,
        hoursInvested: 380
      }
    },
    {
      id: 3,
      title: "NCUA Safety & Soundness - Credit Union",
      examType: "NCUA",
      organization: "Credit Union ($1.2B assets)",
      readinessScore: 85,
      outcome: "Satisfactory - 1 Matter Requiring Attention",
      preparationTime: "8 weeks",
      keySuccessFactors: [
        "Focused on NCUA Letter to Credit Unions (LTCUs) from past year",
        "Created exam response playbook with role assignments",
        "Held tabletop exercises simulating exam scenarios",
        "Prepared talking points for all executives and managers",
        "Established secure exam workspace with controlled access"
      ],
      criticalActivities: [
        "Week 1-2: LTCU review, risk assessment update, scope prediction",
        "Week 3-4: Member service quality testing, loan underwriting review",
        "Week 5-6: Financial performance analysis, ALM documentation prep",
        "Week 7: Mock exam scenarios, practice document requests",
        "Week 8: Final readiness assessment, team dry runs, workspace setup"
      ],
      documentationPrepared: [
        "Strategic Plan & Annual Budget Documentation",
        "Member Service Quality Metrics & Complaint Tracking",
        "Loan Underwriting Guidelines & Exception Reports",
        "Investment Portfolio & ALM Analysis",
        "Operational Loss Events & Insurance Coverage",
        "Continuity of Operations Plan & Testing Results",
        "Supervisory Committee Audit Reports",
        "Fair Lending Analysis & HMDA Data"
      ],
      lessonsLearned: [
        "NCUA examiners appreciated concise executive summaries upfront",
        "Having backup personnel for key roles prevented bottlenecks",
        "Member service quality metrics should be readily available - examiners asked frequently",
        "The one MRA was preventable - we should have tested member complaint resolution process",
        "Tabletop exercises built confidence and revealed process gaps"
      ],
      metrics: {
        documentsPrepared: 68,
        mockExamsCompleted: 2,
        gapsRemediated: 12,
        teamMembers: 7,
        hoursInvested: 290
      }
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-400" />
            Exam Readiness Success Stories & Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Learn from real-world exam preparation examples. These case studies show proven approaches, timelines, and key success factors.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {examples.map(example => (
          <Card key={example.id} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/40 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">{example.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {example.examType}
                    </Badge>
                    <Badge className="bg-slate-500/20 text-slate-400">
                      {example.organization}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {example.preparationTime} prep
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Readiness Score</div>
                  <div className="text-2xl font-bold text-emerald-400">{example.readinessScore}%</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Outcome</span>
                </div>
                <p className="text-sm text-slate-300">{example.outcome}</p>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="text-lg font-bold text-white">{example.metrics.documentsPrepared}</div>
                  <div className="text-xs text-slate-500">Docs</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="text-lg font-bold text-white">{example.metrics.mockExamsCompleted}</div>
                  <div className="text-xs text-slate-500">Mocks</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="text-lg font-bold text-white">{example.metrics.gapsRemediated}</div>
                  <div className="text-xs text-slate-500">Gaps Fixed</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="text-lg font-bold text-white">{example.metrics.teamMembers}</div>
                  <div className="text-xs text-slate-500">Team</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <div className="text-lg font-bold text-white">{example.metrics.hoursInvested}</div>
                  <div className="text-xs text-slate-500">Hours</div>
                </div>
              </div>

              <Button
                onClick={() => setSelectedExample(selectedExample?.id === example.id ? null : example)}
                variant="outline"
                className="w-full border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <Eye className="h-4 w-4 mr-2" />
                {selectedExample?.id === example.id ? 'Hide' : 'View'} Full Details
              </Button>

              {selectedExample?.id === example.id && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <h4 className="text-sm font-semibold text-indigo-400 mb-3">Key Success Factors</h4>
                    <ul className="space-y-2">
                      {example.keySuccessFactors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <h4 className="text-sm font-semibold text-purple-400 mb-3">Week-by-Week Timeline</h4>
                    <ul className="space-y-2">
                      {example.criticalActivities.map((activity, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <Clock className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <h4 className="text-sm font-semibold text-blue-400 mb-3">Documentation Checklist</h4>
                    <div className="grid gap-2">
                      {example.documentationPrepared.map((doc, idx) => (
                        <div key={idx} className="text-sm text-slate-300 flex items-start gap-2 p-2 rounded bg-[#151d2e]">
                          <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Lessons Learned
                    </h4>
                    <ul className="space-y-2">
                      {example.lessonsLearned.map((lesson, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Case Study Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}