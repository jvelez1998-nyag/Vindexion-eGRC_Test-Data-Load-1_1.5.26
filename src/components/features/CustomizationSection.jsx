import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Sliders, Palette, Layout, Bell, Eye, Filter, Database, Workflow, UserCog } from "lucide-react";

const customizationFeatures = [
  {
    category: "Dashboard Customization",
    icon: Layout,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    capabilities: [
      {
        feature: "Personalized Dashboard Layouts",
        description: "Create custom dashboard views tailored to your role and preferences",
        options: [
          "Drag-and-drop widget positioning",
          "Add/remove widgets based on needs",
          "Resize widgets for optimal viewing",
          "Save multiple dashboard configurations",
          "Role-based default dashboards",
          "Share dashboard templates with team"
        ]
      },
      {
        feature: "Widget Customization",
        description: "Configure individual widgets with custom parameters and filters",
        options: [
          "Custom date ranges and time periods",
          "Entity-specific filters (risks, controls, vendors)",
          "Severity and priority thresholds",
          "Data visualization preferences (chart types)",
          "Refresh intervals for real-time data",
          "Widget color schemes and themes"
        ]
      },
      {
        feature: "AI-Powered Personalization",
        description: "Intelligent dashboard adaptation based on usage patterns",
        options: [
          "AI-recommended widgets based on activity",
          "Auto-prioritize most-used features",
          "Predictive content suggestions",
          "Usage-based widget ordering",
          "Smart alerts for relevant events",
          "Personalized insights and recommendations"
        ]
      }
    ]
  },
  {
    category: "Notification Preferences",
    icon: Bell,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    capabilities: [
      {
        feature: "Granular Notification Control",
        description: "Fine-tune notifications for every event type and entity",
        options: [
          "Enable/disable by notification type",
          "Set notification frequency (immediate, daily, weekly)",
          "Priority-based notification filtering",
          "Entity-specific notification rules",
          "Time-based notification scheduling",
          "Multi-channel delivery (in-app, email, Slack)"
        ]
      },
      {
        feature: "Smart Notification Rules",
        description: "Create custom rules for when and how you receive alerts",
        options: [
          "Conditional notifications based on criteria",
          "Threshold-based alerts (e.g., risk score > 80)",
          "Assignment-based notifications",
          "Follow/watch specific entities",
          "Team member activity notifications",
          "Escalation notification chains"
        ]
      },
      {
        feature: "Notification Digest Options",
        description: "Consolidate notifications into digestible summaries",
        options: [
          "Daily summary emails",
          "Weekly rollup reports",
          "Priority-only notifications",
          "Category-grouped digests",
          "Customizable digest schedule",
          "Digest content filtering"
        ]
      }
    ]
  },
  {
    category: "View & Display Settings",
    icon: Eye,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    capabilities: [
      {
        feature: "List View Customization",
        description: "Tailor data tables and lists to show exactly what you need",
        options: [
          "Show/hide columns per entity type",
          "Custom column ordering",
          "Column width preferences",
          "Default sort preferences",
          "Saved filter sets",
          "Page size preferences (items per page)",
          "Quick filter pinning",
          "Column grouping and aggregation"
        ]
      },
      {
        feature: "Color Coding & Visual Preferences",
        description: "Customize visual indicators and color schemes",
        options: [
          "Risk severity color customization",
          "Status badge color preferences",
          "Chart color palette selection",
          "Dark/light mode toggle",
          "Contrast and accessibility settings",
          "Icon preferences"
        ]
      },
      {
        feature: "Data Density Controls",
        description: "Adjust information density for optimal viewing",
        options: [
          "Compact/comfortable/spacious view modes",
          "Card vs. list view preferences",
          "Details expansion defaults",
          "Image thumbnail sizes",
          "Font size adjustments",
          "Information panel visibility"
        ]
      }
    ]
  },
  {
    category: "Filtering & Search",
    icon: Filter,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    capabilities: [
      {
        feature: "Advanced Filter Builder",
        description: "Create complex, multi-criteria filters for any data view",
        options: [
          "Multi-condition filter rules (AND/OR logic)",
          "Custom filter criteria per field type",
          "Date range filters with presets",
          "Numeric range filters",
          "Multi-select dropdown filters",
          "Text search with wildcards",
          "Saved filter templates",
          "Share filters with team"
        ]
      },
      {
        feature: "Quick Filters & Presets",
        description: "Access commonly used filters with one click",
        options: [
          "Save favorite filter combinations",
          "Pin frequently used filters",
          "Recent filters history",
          "System-provided preset filters",
          "Category-based quick filters",
          "Status-based quick filters"
        ]
      },
      {
        feature: "Global Search Preferences",
        description: "Customize how search works across the platform",
        options: [
          "Search scope selection (all modules or specific)",
          "Search result ordering preferences",
          "Recent searches history",
          "Search suggestions customization",
          "Fuzzy search enable/disable",
          "Search highlighting preferences"
        ]
      }
    ]
  },
  {
    category: "Workflow & Process Customization",
    icon: Workflow,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    capabilities: [
      {
        feature: "Custom Workflow Templates",
        description: "Build and save reusable workflow templates",
        options: [
          "Define custom workflow stages",
          "Set default assignees per stage",
          "Configure stage transition rules",
          "Add custom approval steps",
          "Set automatic notifications per stage",
          "Template versioning",
          "Share templates organization-wide"
        ]
      },
      {
        feature: "Automation Rule Builder",
        description: "Create custom automation rules for repetitive tasks",
        options: [
          "Trigger-based automation (event-driven)",
          "Scheduled automation tasks",
          "Conditional logic builder",
          "Multi-step automation workflows",
          "Custom action definitions",
          "Automation testing and simulation",
          "Enable/disable automation rules"
        ]
      },
      {
        feature: "Task Management Preferences",
        description: "Customize how tasks and assignments work for you",
        options: [
          "Default task priority settings",
          "Task due date calculation rules",
          "Task assignment routing preferences",
          "Task completion workflows",
          "Recurring task templates",
          "Task notification preferences"
        ]
      }
    ]
  },
  {
    category: "Form & Field Customization",
    icon: Sliders,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    capabilities: [
      {
        feature: "Custom Fields",
        description: "Add custom fields to core entities for specific needs",
        options: [
          "Add text, number, date, dropdown fields",
          "Define custom field validation rules",
          "Set field visibility and requirements",
          "Create calculated/formula fields",
          "Field dependencies and conditional logic",
          "Custom field grouping",
          "Field-level permissions"
        ]
      },
      {
        feature: "Form Layout Customization",
        description: "Modify form layouts to match your workflow",
        options: [
          "Reorder form fields",
          "Show/hide fields based on role",
          "Group related fields into sections",
          "Set default values for fields",
          "Multi-column form layouts",
          "Conditional field display",
          "Form validation customization"
        ]
      },
      {
        feature: "Template Management",
        description: "Create and manage entity templates for consistency",
        options: [
          "Save entity configurations as templates",
          "Pre-fill templates with default values",
          "Category-specific templates",
          "Template sharing and permissions",
          "Template version control",
          "Quick-create from templates"
        ]
      }
    ]
  },
  {
    category: "Reporting Customization",
    icon: Database,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    capabilities: [
      {
        feature: "Custom Report Builder",
        description: "Design reports exactly how you need them",
        options: [
          "Drag-and-drop report designer",
          "Select data sources and entities",
          "Custom report columns and fields",
          "Grouping and aggregation options",
          "Chart and visualization types",
          "Report filters and parameters",
          "Report templates library",
          "Schedule report generation"
        ]
      },
      {
        feature: "Export & Format Preferences",
        description: "Customize how data is exported from the platform",
        options: [
          "Default export formats (PDF, Excel, CSV)",
          "PDF report styling preferences",
          "Excel template customization",
          "Data field selection for exports",
          "Export file naming conventions",
          "Automated export scheduling",
          "Export destination preferences"
        ]
      },
      {
        feature: "Report Distribution",
        description: "Control how reports are shared and distributed",
        options: [
          "Define report recipients and groups",
          "Schedule automated report delivery",
          "Email report distribution settings",
          "Report access permissions",
          "Report subscription management",
          "Report archival settings"
        ]
      }
    ]
  },
  {
    category: "User Profile & Preferences",
    icon: UserCog,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    capabilities: [
      {
        feature: "Personal Profile Settings",
        description: "Manage your personal information and preferences",
        options: [
          "Profile information and avatar",
          "Email and contact preferences",
          "Language and locale settings",
          "Time zone configuration",
          "Date and time format preferences",
          "Number format preferences"
        ]
      },
      {
        feature: "Access & Security Settings",
        description: "Control your security and access preferences",
        options: [
          "Password management",
          "Two-factor authentication setup",
          "Session timeout preferences",
          "Trusted device management",
          "Login activity monitoring",
          "API key generation and management"
        ]
      },
      {
        feature: "Collaboration Preferences",
        description: "Set how you work with your team",
        options: [
          "Default sharing permissions",
          "Comment notification preferences",
          "Mention notification settings",
          "Team visibility preferences",
          "Default task delegation rules",
          "Collaboration tool integrations"
        ]
      }
    ]
  },
  {
    category: "Data Import/Export Customization",
    icon: Database,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    capabilities: [
      {
        feature: "Import Mapping Templates",
        description: "Create reusable field mapping templates for imports",
        options: [
          "Save field mapping configurations",
          "CSV/Excel column mapping",
          "Data transformation rules",
          "Validation rule definitions",
          "Default value specifications",
          "Import template library",
          "Mapping template versioning"
        ]
      },
      {
        feature: "Bulk Operation Preferences",
        description: "Configure how bulk operations work",
        options: [
          "Bulk update field selection",
          "Batch size preferences",
          "Error handling preferences",
          "Confirmation requirements",
          "Audit trail preferences",
          "Rollback capabilities"
        ]
      }
    ]
  },
  {
    category: "Module-Specific Customization",
    icon: Palette,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    capabilities: [
      {
        feature: "Risk Module Customization",
        description: "Tailor risk management to your methodology",
        options: [
          "Custom risk scoring formulas",
          "Risk matrix configuration (3x3, 5x5, custom)",
          "Risk categories and taxonomies",
          "Risk treatment strategies",
          "Risk review frequency defaults",
          "Risk appetite thresholds"
        ]
      },
      {
        feature: "Control Module Customization",
        description: "Configure controls to match your framework",
        options: [
          "Control type taxonomies",
          "Control effectiveness scales",
          "Testing frequency defaults",
          "Control status workflows",
          "Evidence requirements",
          "Control libraries and frameworks"
        ]
      },
      {
        feature: "Vendor Module Customization",
        description: "Adapt vendor management to your process",
        options: [
          "Vendor risk tier definitions",
          "Assessment questionnaire templates",
          "KPI and SLA templates",
          "Vendor review schedules",
          "Onboarding workflow stages",
          "Performance scoring methods"
        ]
      },
      {
        feature: "Audit Module Customization",
        description: "Configure audit processes and templates",
        options: [
          "Audit program templates",
          "Finding classification schemes",
          "Audit frequency rules",
          "Workpaper organization",
          "Audit report templates",
          "Evidence collection requirements"
        ]
      },
      {
        feature: "Compliance Module Customization",
        description: "Align compliance tracking with your needs",
        options: [
          "Framework selection and activation",
          "Requirement customization",
          "Evidence type definitions",
          "Compliance status definitions",
          "Gap analysis criteria",
          "Attestation workflows"
        ]
      }
    ]
  }
];

export default function CustomizationSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-violet-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-600">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Dynamic User Customization</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Comprehensive customization capabilities across all platform modules</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Platform-Wide Customization Philosophy</h3>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Vindexion eGRC Hub™ provides extensive customization capabilities allowing you to tailor every aspect 
              of the platform to your organization's unique processes, preferences, and requirements. From UI/UX 
              preferences to workflow automation and data management, the platform adapts to you.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-3 mt-4">
            <div className="text-center p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-2xl font-bold text-indigo-400">10+</div>
              <div className="text-xs text-slate-400">Customization Categories</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400">50+</div>
              <div className="text-xs text-slate-400">Customization Features</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">200+</div>
              <div className="text-xs text-slate-400">Configurable Options</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-2xl font-bold text-amber-400">∞</div>
              <div className="text-xs text-slate-400">Possibilities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {customizationFeatures.map((section, idx) => (
          <Card key={idx} className={`bg-[#1a2332] border ${section.borderColor}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${section.bgColor}`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">{section.category}</CardTitle>
                  <Badge className="mt-1 bg-slate-500/20 text-slate-400 text-xs">
                    {section.capabilities.length} Feature{section.capabilities.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.capabilities.map((capability, capIdx) => (
                <div key={capIdx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <h4 className="font-semibold text-white mb-1">{capability.feature}</h4>
                  <p className="text-sm text-slate-400 mb-3">{capability.description}</p>
                  <div className="grid md:grid-cols-2 gap-2">
                    {capability.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded bg-[#1a2332]">
                        <span className={`${section.color} mt-0.5`}>✓</span>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            How to Access Customization Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#0f1623]">
              <div className="font-semibold text-emerald-400 mb-2">User Profile Settings</div>
              <p className="text-sm text-slate-300 mb-2">Access personal preferences and profile settings:</p>
              <p className="text-xs text-slate-400">Top right menu → Profile Icon → Settings</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0f1623]">
              <div className="font-semibold text-blue-400 mb-2">Notification Settings</div>
              <p className="text-sm text-slate-300 mb-2">Customize all notification preferences:</p>
              <p className="text-xs text-slate-400">Navigation menu → Notification Settings</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0f1623]">
              <div className="font-semibold text-purple-400 mb-2">Dashboard Customization</div>
              <p className="text-sm text-slate-300 mb-2">Personalize your dashboard layout:</p>
              <p className="text-xs text-slate-400">Dashboard → Edit Mode → Drag widgets</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0f1623]">
              <div className="font-semibold text-amber-400 mb-2">Module Settings</div>
              <p className="text-sm text-slate-300 mb-2">Configure module-specific options:</p>
              <p className="text-xs text-slate-400">Each module → Settings icon → Configure</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0f1623]">
              <div className="font-semibold text-rose-400 mb-2">Workflow Automation</div>
              <p className="text-sm text-slate-300 mb-2">Build custom automation rules:</p>
              <p className="text-xs text-slate-400">Navigation menu → Workflow Automation</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0f1623]">
              <div className="font-semibold text-indigo-400 mb-2">Admin Configuration</div>
              <p className="text-sm text-slate-300 mb-2">Organization-wide settings (Admin only):</p>
              <p className="text-xs text-slate-400">Navigation menu → Assessment Config</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}