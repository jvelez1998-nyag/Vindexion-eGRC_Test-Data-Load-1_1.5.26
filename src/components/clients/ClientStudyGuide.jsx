import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, CheckCircle2, AlertTriangle, Shield, 
  Users, FileText, Target, Lightbulb 
} from "lucide-react";

const STUDY_MODULES = [
  {
    id: 'client-risk',
    title: 'Client Risk Assessment Fundamentals',
    icon: AlertTriangle,
    color: 'text-rose-400',
    topics: [
      {
        name: 'Understanding Client Risk Profiles',
        content: 'Learn how to evaluate client risk across operational, financial, compliance, and reputational dimensions.',
        keyPoints: [
          'Risk scoring methodologies',
          'Industry-specific risk factors',
          'Client lifecycle risk evolution',
          'Early warning indicators'
        ]
      },
      {
        name: 'Risk Level Classification',
        content: 'Master the classification framework for categorizing clients from low to critical risk.',
        keyPoints: [
          'Classification criteria',
          'Threshold definitions',
          'Escalation triggers',
          'Risk appetite alignment'
        ]
      },
      {
        name: 'Continuous Risk Monitoring',
        content: 'Implement effective monitoring strategies to track client risk in real-time.',
        keyPoints: [
          'Key risk indicators (KRIs)',
          'Monitoring frequency guidelines',
          'Alert configuration',
          'Dashboard setup'
        ]
      }
    ]
  },
  {
    id: 'compliance',
    title: 'Client Compliance Management',
    icon: Shield,
    color: 'text-blue-400',
    topics: [
      {
        name: 'Compliance Assessment Framework',
        content: 'Understand how to assess client compliance maturity across multiple frameworks.',
        keyPoints: [
          'Framework selection methodology',
          'Maturity models (0-100 scoring)',
          'Gap analysis techniques',
          'Remediation prioritization'
        ]
      },
      {
        name: 'Regulatory Framework Mapping',
        content: 'Map client operations to applicable regulatory requirements.',
        keyPoints: [
          'Common frameworks (SOX, GDPR, ISO 27001)',
          'Industry-specific regulations',
          'Multi-framework harmonization',
          'Cross-walk mapping'
        ]
      },
      {
        name: 'Compliance Gap Identification',
        content: 'Identify and document compliance gaps systematically.',
        keyPoints: [
          'Assessment questionnaires',
          'Evidence requirements',
          'Gap severity classification',
          'Remediation planning'
        ]
      }
    ]
  },
  {
    id: 'engagement',
    title: 'Client Engagement Best Practices',
    icon: Users,
    color: 'text-purple-400',
    topics: [
      {
        name: 'Effective Client Communication',
        content: 'Master communication strategies for different client scenarios.',
        keyPoints: [
          'Stakeholder identification',
          'Communication cadence',
          'Escalation protocols',
          'Executive reporting'
        ]
      },
      {
        name: 'Building Trust & Credibility',
        content: 'Establish yourself as a trusted advisor to the client.',
        keyPoints: [
          'Demonstrating expertise',
          'Transparent reporting',
          'Proactive recommendations',
          'Value articulation'
        ]
      },
      {
        name: 'Managing Difficult Conversations',
        content: 'Navigate challenging discussions about risks, incidents, and compliance failures.',
        keyPoints: [
          'Delivering bad news effectively',
          'Managing expectations',
          'Solution-focused approach',
          'Turning challenges into opportunities'
        ]
      }
    ]
  },
  {
    id: 'assessment',
    title: 'Assessment Methodologies',
    icon: FileText,
    color: 'text-cyan-400',
    topics: [
      {
        name: 'Initial Client Assessment',
        content: 'Conduct comprehensive initial assessments for new clients.',
        keyPoints: [
          'Pre-assessment data gathering',
          'On-site assessment procedures',
          'Interview techniques',
          'Evidence collection'
        ]
      },
      {
        name: 'Ongoing Assessment Programs',
        content: 'Design and execute ongoing assessment programs.',
        keyPoints: [
          'Assessment frequency planning',
          'Scope definition',
          'Resource allocation',
          'Continuous improvement'
        ]
      },
      {
        name: 'Specialized Assessments',
        content: 'Conduct targeted assessments for specific risks or requirements.',
        keyPoints: [
          'Security assessments',
          'Privacy impact assessments',
          'Vendor risk assessments',
          'Business continuity reviews'
        ]
      }
    ]
  }
];

export default function ClientStudyGuide() {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Client Management Study Guide</h3>
              <p className="text-xs text-slate-400">Comprehensive learning resources and best practices</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {STUDY_MODULES.map(module => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${module.color}`} />
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {module.topics.map((topic, idx) => (
                      <AccordionItem key={idx} value={`${module.id}-${idx}`} className="border-[#2a3548]">
                        <AccordionTrigger className="text-sm text-white hover:text-cyan-400">
                          {topic.name}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-300">
                          <p className="text-sm mb-3">{topic.content}</p>
                          <div className="mt-3">
                            <h5 className="text-xs font-semibold text-white mb-2">Key Points:</h5>
                            <ul className="space-y-1">
                              {topic.keyPoints.map((point, pidx) => (
                                <li key={pidx} className="flex items-start gap-2 text-xs">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}