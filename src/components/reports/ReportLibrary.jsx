import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";

const reportLibrary = [
  {
    id: 'executive-summary',
    name: 'Executive Summary Report',
    description: 'Comprehensive overview of GRC posture with key metrics and recommendations',
    category: 'Executive',
    frequency: 'On-Demand',
    format: 'PDF',
    icon: FileText,
    color: 'indigo'
  },
  {
    id: 'risk-summary',
    name: 'Risk Summary Report',
    description: 'Detailed analysis of risk landscape, trends, and mitigation status',
    category: 'Risk Management',
    frequency: 'Monthly',
    format: 'PDF',
    icon: FileText,
    color: 'rose'
  },
  {
    id: 'compliance-status',
    name: 'Compliance Status Report',
    description: 'Framework compliance tracking and gap analysis',
    category: 'Compliance',
    frequency: 'Quarterly',
    format: 'PDF',
    icon: FileText,
    color: 'emerald'
  },
  {
    id: 'controls-effectiveness',
    name: 'Controls Effectiveness Report',
    description: 'Control testing results and effectiveness metrics',
    category: 'Controls',
    frequency: 'Quarterly',
    format: 'PDF',
    icon: FileText,
    color: 'blue'
  },
  {
    id: 'audit-findings',
    name: 'Audit Findings Report',
    description: 'Summary of audit results, findings, and remediation tracking',
    category: 'Audit',
    frequency: 'Per Audit',
    format: 'PDF',
    icon: FileText,
    color: 'violet'
  },
  {
    id: 'incident-management',
    name: 'Incident Management Report',
    description: 'Incident trends, severity analysis, and response effectiveness',
    category: 'Incident Response',
    frequency: 'Monthly',
    format: 'PDF',
    icon: FileText,
    color: 'rose'
  },
  {
    id: 'assessment-overview',
    name: 'Risk Assessment Overview',
    description: 'Risk assessment results and scoring methodology analysis',
    category: 'Risk Assessment',
    frequency: 'Quarterly',
    format: 'PDF',
    icon: FileText,
    color: 'violet'
  },
  {
    id: 'board-report',
    name: 'Board of Directors Report',
    description: 'Executive-level summary for board presentations',
    category: 'Executive',
    frequency: 'Quarterly',
    format: 'PDF',
    icon: FileText,
    color: 'indigo'
  },
  {
    id: 'regulatory-compliance',
    name: 'Regulatory Compliance Report',
    description: 'Detailed compliance status for regulatory submissions',
    category: 'Compliance',
    frequency: 'Annual',
    format: 'PDF',
    icon: FileText,
    color: 'emerald'
  },
  {
    id: 'third-party-risk',
    name: 'Third-Party Risk Report',
    description: 'Vendor and third-party risk assessment summary',
    category: 'Risk Management',
    frequency: 'Semi-Annual',
    format: 'PDF',
    icon: FileText,
    color: 'amber'
  }
];

const categoryColors = {
  'Executive': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Risk Management': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Compliance': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Controls': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Audit': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Incident Response': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Risk Assessment': 'bg-violet-500/10 text-violet-400 border-violet-500/20'
};

export default function ReportLibrary({ onGenerateReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportLibrary.map(report => (
          <Card key={report.id} className="bg-[#1a2332] border-[#2a3548] p-5 hover:border-[#3a4558] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg bg-${report.color}-500/10`}>
                <report.icon className={`h-5 w-5 text-${report.color}-400`} />
              </div>
              <Badge className="text-[10px] bg-[#151d2e] text-slate-400 border-[#2a3548]">
                {report.format}
              </Badge>
            </div>

            <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
              {report.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4 line-clamp-2">
              {report.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <Badge className={`text-[10px] ${categoryColors[report.category]}`}>
                {report.category}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                {report.frequency}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
                onClick={() => onGenerateReport(report.id)}
              >
                <Download className="h-3 w-3" />
                Generate
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Report Generation Tips</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>All reports are generated in real-time based on current data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>PDF exports include charts, metrics, and detailed data tables</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>Schedule recurring reports via the "Scheduled" tab</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>Custom report templates can be created in the "Templates" tab</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}