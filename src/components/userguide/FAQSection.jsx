import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

export default function FAQSection() {
  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is Vindexion eGRC Hub?",
          a: "Vindexion eGRC Hub™ is a comprehensive platform for managing Governance, Risk, and Compliance. It helps organizations identify risks, maintain compliance with regulatory frameworks, implement controls, and track audits—all in one integrated system."
        },
        {
          q: "Who should use this platform?",
          a: "The platform is designed for GRC professionals, compliance officers, risk managers, internal auditors, IT security teams, and executives who need visibility into their organization's risk and compliance posture."
        },
        {
          q: "Is my data secure?",
          a: "Yes. The platform employs enterprise-grade security including encryption at rest and in transit, role-based access control, and regular security audits. All data is stored securely on Base44's infrastructure."
        }
      ]
    },
    {
      category: "Risk Management",
      questions: [
        {
          q: "How do I calculate risk scores?",
          a: "Risk scores are calculated using the formula: Likelihood × Impact. Both likelihood and impact are rated on a scale of 1-5, resulting in scores from 1-25. Scores 1-3 are Low, 4-8 Medium, 9-15 High, and 16-25 Critical."
        },
        {
          q: "Can AI really identify risks for me?",
          a: "Yes! The AI Risk Analyzer uses advanced language models to analyze scenarios you describe and identify potential risks. While AI suggestions should be reviewed and refined, they provide an excellent starting point and can identify risks you might have missed."
        },
        {
          q: "How often should I review risks?",
          a: "Critical and high risks should be reviewed monthly. Medium risks quarterly. Low risks can be reviewed semi-annually. The platform can send automated reminders based on your review schedule."
        }
      ]
    },
    {
      category: "Compliance",
      questions: [
        {
          q: "Which compliance frameworks are supported?",
          a: "The platform supports SOX, SOC2, ISO 27001, GDPR, HIPAA, PCI-DSS, NIST, COBIT, FFIEC, DORA, EU AI Act, CCPA, and many more. You can also create custom frameworks."
        },
        {
          q: "Can I map requirements across different frameworks?",
          a: "Yes! The Crosswalk Mapping feature allows you to map requirements across frameworks to identify overlapping controls and reduce duplication of effort."
        },
        {
          q: "How do I track compliance evidence?",
          a: "You can upload evidence documents directly to compliance requirements, link them to controls, and organize them by framework. The system maintains version history and tracks who uploaded what and when."
        }
      ]
    },
    {
      category: "Controls",
      questions: [
        {
          q: "What's the difference between control types?",
          a: "Preventive controls stop issues before they occur (e.g., access controls). Detective controls identify issues when they happen (e.g., monitoring). Corrective controls fix issues after detection (e.g., incident response). Directive controls guide behavior (e.g., policies)."
        },
        {
          q: "How do I rate control effectiveness?",
          a: "Rate controls on a scale of 1-5: 1 = Very Low (control fails frequently), 2 = Low (significant deficiencies), 3 = Moderate (some issues), 4 = High (minor issues), 5 = Very High (control operates as designed with no deficiencies)."
        },
        {
          q: "Can I import controls from standard libraries?",
          a: "Yes! The platform includes pre-built control libraries for NIST 800-53, ISO 27001 Annex A, and IT General Controls (ITGC). You can import these controls and customize them for your organization."
        }
      ]
    },
    {
      category: "AI Features",
      questions: [
        {
          q: "How accurate are AI-generated recommendations?",
          a: "AI recommendations are based on industry best practices and your existing GRC data. While highly accurate, they should be reviewed by a subject matter expert before implementation. The more data you provide, the better the AI performs."
        },
        {
          q: "What data does the AI use?",
          a: "AI features analyze your risks, controls, compliance requirements, and guidance library to provide contextual recommendations. No data is shared outside your organization, and AI processing respects your data privacy."
        },
        {
          q: "Can I disable AI features?",
          a: "While we recommend using AI features for efficiency, you can choose not to use them. All AI features are opt-in and manual alternatives are always available."
        }
      ]
    },
    {
      category: "Reporting",
      questions: [
        {
          q: "Can I schedule automated reports?",
          a: "Yes! Create report templates and schedule them to run daily, weekly, monthly, or quarterly. Reports can be automatically emailed to stakeholders in PDF, Excel, or CSV format."
        },
        {
          q: "Can I customize report templates?",
          a: "Absolutely. The Custom Report Builder allows you to create templates with specific data sources, filters, visualizations, and layouts. Save them for reuse and share with your team."
        },
        {
          q: "What's the AI Report Generator?",
          a: "The AI Report Generator creates comprehensive reports with analysis and insights. Describe what you need, select data sources, and AI will generate a professional report complete with findings, trends, and recommendations."
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-400" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 mb-6">
            Find answers to common questions about using Vindexion eGRC Hub. 
            Can't find what you're looking for? Use the AI chatbot for personalized assistance.
          </p>

          <div className="space-y-6">
            {faqs.map((category, catIdx) => (
              <div key={catIdx}>
                <Badge className="bg-indigo-500/10 text-indigo-400 mb-4">
                  {category.category}
                </Badge>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, qIdx) => (
                    <AccordionItem 
                      key={qIdx} 
                      value={`${catIdx}-${qIdx}`}
                      className="border-[#2a3548] bg-[#151d2e] rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-white hover:no-underline text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-400 text-sm leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}