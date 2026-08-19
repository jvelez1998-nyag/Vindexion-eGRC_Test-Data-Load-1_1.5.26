import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Target, CheckCircle2, AlertTriangle, Lightbulb, 
  BookOpen, FileText, Users, Clock, TrendingUp
} from "lucide-react";

export default function ExamDeepDive() {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const deepDiveTopics = [
    {
      id: 'it-governance',
      title: 'IT Governance & Strategy',
      framework: 'FFIEC',
      duration: '2 hours',
      level: 'Advanced',
      description: 'Deep dive into IT governance frameworks, strategic alignment, and board oversight requirements',
      sections: [
        {
          title: 'Governance Framework Components',
          content: [
            'Strategic alignment with business objectives',
            'Risk management integration',
            'Value delivery mechanisms',
            'Performance measurement',
            'Resource optimization'
          ]
        },
        {
          title: 'Board & Executive Responsibilities',
          content: [
            'Fiduciary duties and oversight',
            'Technology investment decisions',
            'Risk appetite determination',
            'Regulatory compliance accountability',
            'Crisis management and business continuity'
          ]
        },
        {
          title: 'Common Exam Findings',
          content: [
            'Insufficient board reporting on cyber risks',
            'Lack of strategic IT planning alignment',
            'Inadequate third-party risk oversight',
            'Missing governance documentation',
            'Unclear escalation procedures'
          ]
        },
        {
          title: 'Best Practices',
          content: [
            'Implement formal governance charter',
            'Quarterly board technology briefings',
            'Written risk appetite statements',
            'Independent IT audit function',
            'Regular governance framework reviews'
          ]
        }
      ],
      caseStudies: [
        { title: 'Regional Bank Governance Overhaul', scenario: 'How a $5B bank restructured IT governance post-exam', outcome: 'Improved from "needs improvement" to "satisfactory" rating' },
        { title: 'Credit Union Board Education', scenario: 'Implementing effective cyber risk reporting to board', outcome: 'Enhanced board understanding and strategic decision-making' }
      ]
    },
    {
      id: 'sox-itgc',
      title: 'SOX IT General Controls',
      framework: 'SOX',
      duration: '2.5 hours',
      level: 'Advanced',
      description: 'Comprehensive coverage of IT general controls for financial reporting',
      sections: [
        {
          title: 'Access Controls',
          content: [
            'Logical access management',
            'Segregation of duties',
            'Privileged access controls',
            'Access provisioning and deprovisioning',
            'Password policies and MFA'
          ]
        },
        {
          title: 'Change Management',
          content: [
            'Change request and approval process',
            'Testing requirements (dev, QA, UAT)',
            'Emergency change procedures',
            'Version control and release management',
            'Backout procedures'
          ]
        },
        {
          title: 'IT Operations',
          content: [
            'Job scheduling and monitoring',
            'Backup and recovery procedures',
            'Batch processing controls',
            'Data center operations',
            'Incident management'
          ]
        },
        {
          title: 'Testing Approach',
          content: [
            'Sampling methodologies',
            'Test of design vs. test of effectiveness',
            'Documentation requirements',
            'Deficiency evaluation',
            'Remediation verification'
          ]
        }
      ],
      caseStudies: [
        { title: 'SaaS Application SOX Compliance', scenario: 'Implementing ITGC for cloud-based ERP', outcome: 'Successful SOX certification with no material weaknesses' },
        { title: 'Access Control Remediation', scenario: 'Addressing SOD violations in financial systems', outcome: 'Reduced control deficiencies from 15 to 0 in one cycle' }
      ]
    },
    {
      id: 'iso-isms',
      title: 'ISO 27001 ISMS Implementation',
      framework: 'ISO 27001',
      duration: '3 hours',
      level: 'Advanced',
      description: 'End-to-end ISMS implementation and certification preparation',
      sections: [
        {
          title: 'ISMS Scope & Context',
          content: [
            'Defining organizational context',
            'Understanding stakeholder needs',
            'Determining ISMS scope boundaries',
            'Leadership commitment and policy',
            'Risk assessment methodology'
          ]
        },
        {
          title: 'Annex A Control Selection',
          content: [
            '114 controls overview and categorization',
            'Risk-based control selection',
            'Statement of Applicability (SoA)',
            'Control customization and tailoring',
            'Gap analysis and remediation planning'
          ]
        },
        {
          title: 'Certification Process',
          content: [
            'Stage 1: Documentation review',
            'Stage 2: Implementation audit',
            'Non-conformity management',
            'Surveillance audit preparation',
            'Continuous improvement cycle'
          ]
        },
        {
          title: 'Common Pitfalls',
          content: [
            'Overly broad ISMS scope',
            'Insufficient risk assessment',
            'Poor documentation quality',
            'Lack of management review',
            'Inadequate internal audit program'
          ]
        }
      ],
      caseStudies: [
        { title: 'Global Tech Company Certification', scenario: 'Multi-site ISO 27001 certification in 12 months', outcome: 'Successful certification across 5 locations' },
        { title: 'MSP ISO 27001 Journey', scenario: 'Managed service provider certification', outcome: 'Improved customer confidence and contract wins' }
      ]
    },
    {
      id: 'vendor-risk',
      title: 'Third-Party Risk Management',
      framework: 'FFIEC',
      duration: '2 hours',
      level: 'Intermediate',
      description: 'Comprehensive third-party lifecycle risk management',
      sections: [
        {
          title: 'Due Diligence Process',
          content: [
            'Vendor risk assessment questionnaires',
            'Financial stability analysis',
            'Security and compliance certifications',
            'References and reputation checks',
            'Contract negotiation and SLAs'
          ]
        },
        {
          title: 'Ongoing Monitoring',
          content: [
            'Continuous monitoring requirements',
            'Performance metrics and KPIs',
            'Periodic risk reassessments',
            'Incident and breach notification',
            'Right-to-audit provisions'
          ]
        },
        {
          title: 'Fourth-Party Risk',
          content: [
            'Subcontractor identification',
            'Cascading risk assessment',
            'Contractual flow-down provisions',
            'Monitoring sub-vendors',
            'Concentration risk management'
          ]
        },
        {
          title: 'Exam Focus Areas',
          content: [
            'Board reporting on vendor risks',
            'Critical vendor identification',
            'Risk rating methodologies',
            'Vendor inventory completeness',
            'Exit strategy planning'
          ]
        }
      ],
      caseStudies: [
        { title: 'Cloud Provider Risk Assessment', scenario: 'Evaluating major cloud infrastructure provider', outcome: 'Comprehensive risk framework implementation' },
        { title: 'Payment Processor Failure', scenario: 'Managing vendor incident and transition', outcome: 'Successful migration with minimal business impact' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Exam Deep Dives</h2>
            <p className="text-slate-400 text-sm mt-1">
              In-depth exploration of critical exam topics with case studies
            </p>
          </div>
        </div>
      </Card>

      {!selectedTopic ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deepDiveTopics.map(topic => (
            <Card 
              key={topic.id}
              className="bg-[#1a2332] border-[#2a3548] hover:border-violet-500/40 transition-all cursor-pointer group"
              onClick={() => setSelectedTopic(topic)}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px]">
                    {topic.framework}
                  </Badge>
                  <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                    {topic.level}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-white group-hover:text-violet-400 transition-colors">
                  {topic.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-400">{topic.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {topic.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {topic.sections.length} sections
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                    {selectedTopic.framework}
                  </Badge>
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                    {selectedTopic.level}
                  </Badge>
                  <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedTopic.duration}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedTopic.title}</h2>
                <p className="text-slate-400 text-sm">{selectedTopic.description}</p>
              </div>
              <Button onClick={() => setSelectedTopic(null)} variant="outline" className="border-[#2a3548]">
                ← Back
              </Button>
            </div>
          </Card>

          {/* Content Sections */}
          {selectedTopic.sections.map((section, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, cidx) => (
                    <li key={cidx} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          {/* Case Studies */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                Real-World Case Studies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedTopic.caseStudies.map((study, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">{study.title}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-500">Scenario: </span>
                        <span className="text-slate-300">{study.scenario}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Outcome: </span>
                        <span className="text-emerald-400">{study.outcome}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}