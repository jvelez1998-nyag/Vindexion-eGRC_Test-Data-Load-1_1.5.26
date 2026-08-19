import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, LayoutDashboard, Brain, FileText, Calendar, TrendingUp,
  CheckCircle2, AlertCircle, Download, Settings, Filter
} from "lucide-react";

const GuideSection = ({ icon: Icon, title, steps }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-500/20">
          <Icon className="h-6 w-6 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-8 pb-6 border-l-2 border-indigo-500/30 last:border-l-0 last:pb-0">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-sm font-bold">{idx + 1}</span>
            </div>
            
            <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2a3548]">
              <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{step.description}</p>
              
              {step.image && (
                <div className="bg-[#0f1623] rounded-lg p-4 border border-[#2a3548] mb-3">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg">
                    <step.image className="h-16 w-16 text-indigo-400/30" />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">{step.imageCaption}</p>
                </div>
              )}
              
              {step.tips && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-400 mb-1">Pro Tip</p>
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

export default function ReportsUserGuide() {
  const [activeGuide, setActiveGuide] = useState("dashboard");

  const guides = {
    dashboard: {
      icon: LayoutDashboard,
      title: "Reports Dashboard",
      steps: [
        {
          title: "Pre-Built Report Templates",
          description: "Access ready-to-use report templates: Executive Summary, Risk Register, Compliance Status, Audit Findings, Control Effectiveness, and more.",
          image: FileText,
          imageCaption: "Report templates library",
          tips: "Start with templates and customize rather than building from scratch - saves significant time."
        },
        {
          title: "Report Preview",
          description: "Preview reports before generating to ensure they contain expected data and formatting. Adjust filters or parameters as needed.",
          image: LayoutDashboard,
          imageCaption: "Report preview interface"
        },
        {
          title: "Recent Reports Access",
          description: "Quickly access recently generated reports. View generation history with timestamps, parameters used, and who generated each report.",
          image: FileText,
          imageCaption: "Recent reports history",
          tips: "Bookmark frequently used report configurations for one-click regeneration."
        },
        {
          title: "Report Distribution",
          description: "Share reports via email, export to PDF/Excel, or publish to shared dashboards. Track who has accessed each report.",
          image: Download,
          imageCaption: "Report distribution options"
        }
      ]
    },
    
    ai_engine: {
      icon: Brain,
      title: "AI Report Generation",
      steps: [
        {
          title: "Natural Language Report Requests",
          description: "Describe the report you need in plain English: 'Create an executive summary of critical risks with mitigation status' and AI generates the report.",
          image: Brain,
          imageCaption: "Natural language report builder",
          tips: "Be specific about time periods, data sources, and audience to get precisely tailored reports."
        },
        {
          title: "AI Narrative Generation",
          description: "AI writes executive summaries, trend analyses, and recommendations in clear, professional language. Customizes tone for different audiences.",
          image: FileText,
          imageCaption: "AI narrative generation"
        },
        {
          title: "Insight Extraction",
          description: "AI automatically identifies key insights from data: emerging risks, control gaps, compliance trends, audit patterns. Highlights what matters most.",
          image: TrendingUp,
          imageCaption: "AI insight extraction dashboard",
          tips: "AI insights often surface non-obvious patterns - review them even if not explicitly requested."
        },
        {
          title: "Smart Data Visualization",
          description: "AI selects optimal chart types for your data and narrative. Automatically creates graphs, heat maps, and trend lines that support key messages.",
          image: LayoutDashboard,
          imageCaption: "AI-generated visualizations"
        },
        {
          title: "Automated Recommendations",
          description: "AI generates actionable recommendations based on report findings. Recommendations include priority, owner suggestions, and success criteria.",
          image: CheckCircle2,
          imageCaption: "AI recommendations engine",
          warning: "Always review AI recommendations for organizational context before distribution."
        }
      ]
    },
    
    custom: {
      icon: FileText,
      title: "Custom Report Builder",
      steps: [
        {
          title: "Selecting Data Sources",
          description: "Choose which entities to include: risks, controls, compliance, audits, incidents, vendors. Combine multiple sources for comprehensive reports.",
          image: Filter,
          imageCaption: "Data source selector",
          tips: "Use related entities together - risks with controls, audits with findings - for meaningful analysis."
        },
        {
          title: "Applying Filters",
          description: "Filter data by date range, severity, status, owner, category, framework, or custom fields. Create focused reports for specific audiences.",
          image: Filter,
          imageCaption: "Filter configuration panel"
        },
        {
          title: "Designing Report Layout",
          description: "Drag and drop report sections: summary, charts, tables, narrative blocks. Customize order and visibility based on audience needs.",
          image: LayoutDashboard,
          imageCaption: "Layout designer interface",
          tips: "Executive reports: summary first, details last. Technical reports: reverse order."
        },
        {
          title: "Adding Custom Sections",
          description: "Include custom content: methodology, assumptions, definitions, recommendations. Use rich text editor for formatting.",
          image: FileText,
          imageCaption: "Custom content editor"
        },
        {
          title: "Saving Report Templates",
          description: "Save custom report configurations as templates for reuse. Share templates with team members for consistent reporting.",
          image: CheckCircle2,
          imageCaption: "Template management",
          tips: "Version control report templates - track changes and maintain audit trail of template updates."
        }
      ]
    },
    
    scheduled: {
      icon: Calendar,
      title: "Scheduled Reports",
      steps: [
        {
          title: "Creating Scheduled Reports",
          description: "Set up recurring reports with defined frequency: daily, weekly, monthly, quarterly. Specify generation time and automatic distribution.",
          image: Calendar,
          imageCaption: "Schedule configuration",
          tips: "Schedule board reports for Friday afternoons so executives receive them for weekend review."
        },
        {
          title: "Configuring Recipients",
          description: "Define recipient lists for each scheduled report. Use distribution groups for easy management. Set conditional delivery based on report contents.",
          image: Settings,
          imageCaption: "Recipient configuration"
        },
        {
          title: "Dynamic Filters",
          description: "Scheduled reports use dynamic filters that update with each generation: 'Last 30 days', 'Current quarter', 'Unresolved items'.",
          image: Filter,
          imageCaption: "Dynamic filter setup",
          tips: "Use relative date filters (Last 30 days) rather than absolute dates for evergreen scheduled reports."
        },
        {
          title: "Delivery Options",
          description: "Choose delivery methods: email with PDF attachment, link to online dashboard, or API push to other systems. Set backup delivery if primary fails.",
          image: Download,
          imageCaption: "Delivery method configuration"
        },
        {
          title: "Managing Schedules",
          description: "Pause, modify, or delete schedules as needs change. View execution history showing when reports ran and delivery status.",
          image: Calendar,
          imageCaption: "Schedule management dashboard",
          warning: "Review scheduled report relevance quarterly - remove obsolete reports to reduce information overload."
        }
      ]
    },
    
    analytics: {
      icon: TrendingUp,
      title: "Report Analytics",
      steps: [
        {
          title: "Report Usage Metrics",
          description: "Track which reports are generated most, who generates them, and how often. Identify high-value reports and unused templates.",
          image: TrendingUp,
          imageCaption: "Report usage analytics",
          tips: "Reports not generated in 6 months are candidates for archiving or retirement."
        },
        {
          title: "Data Quality Indicators",
          description: "Monitor data completeness for reports: missing fields, outdated information, or data inconsistencies. Quality issues highlighted before report generation.",
          image: AlertCircle,
          imageCaption: "Data quality dashboard"
        },
        {
          title: "Report Performance",
          description: "Track report generation times, file sizes, and delivery success rates. Optimize slow reports by refining queries or reducing data scope.",
          image: TrendingUp,
          imageCaption: "Report performance metrics"
        },
        {
          title: "Audience Engagement",
          description: "For dashboard reports, track viewer engagement: who viewed, time spent, sections accessed. Use insights to improve report relevance.",
          image: LayoutDashboard,
          imageCaption: "Engagement analytics",
          tips: "Low engagement reports may need better visualization or different delivery format."
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <BookOpen className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Reports & Analytics User Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Complete guide to creating, customizing, and distributing GRC reports
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
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto bg-transparent p-0">
              {Object.entries(guides).map(([key, guide]) => {
                const Icon = guide.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:border-indigo-500/50 border border-[#2a3548] rounded-lg h-auto"
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