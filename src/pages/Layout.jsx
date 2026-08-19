
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { useState, useEffect, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  FileCheck, 
  Shield, 
  ClipboardCheck,
  FileBarChart,
  Calculator,
  Menu,
  X,
  Settings,
  HelpCircle,
  ChevronDown,
  User,
  FileText,
  Brain,
  BookOpen,
  Activity,
  LayoutGrid,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationGenerator from "@/components/notifications/NotificationGenerator";
import AutomationEngine from "@/components/automation/AutomationEngine";
import { base44 } from "@/api/base44Client";
import { PermissionProvider } from "@/components/rbac/PermissionProvider";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import DeferredComponent from "@/components/ui/deferred-component";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
      { name: "Intelligence Hub", icon: Brain, page: "AdvancedInsightsDashboard" },
      { name: "Reports & Analytics", icon: FileBarChart, page: "Reports" },
    ]
  },
  {
    label: "Risk & Compliance",
    items: [
      { name: "Risk Register", icon: AlertTriangle, page: "RiskManagement" },
      { name: "Risk Assessments", icon: Calculator, page: "RiskAssessments" },
      { name: "Policy Compliance", icon: FileCheck, page: "Compliance" },
      { name: "Compliance Frameworks", icon: Shield, page: "ComplianceFrameworks" },
      { name: "Cross-Walk Mapping", icon: LayoutGrid, page: "CrossWalkMapping" },
      { name: "Privacy Assessments", icon: Shield, page: "PrivacyAssessment" },
    ]
  },
  {
    label: "Controls & Testing",
    items: [
      { name: "Controls Library", icon: Shield, page: "Controls" },
      { name: "Threat Intelligence", icon: Shield, page: "ThreatVulnerabilityManagement" },
      { name: "Incidents", icon: Activity, page: "Incidents" },
    ]
  },
  {
    label: "Audit & Assurance",
    items: [
      { name: "Audit Management", icon: ClipboardCheck, page: "Audits" },
      { name: "Regulatory Exams", icon: ClipboardCheck, page: "RegulatoryExamSimulation" },
      { name: "Question Bank", icon: FileText, page: "QuestionBank" },
    ]
  },
  {
    label: "Third Parties",
    items: [
      { name: "Vendor Risk Management", icon: User, page: "ThirdPartyRiskManagement" },
      { name: "Client Management", icon: User, page: "ClientProfile" },
    ]
  },
  {
    label: "AI & Knowledge",
    items: [
      { name: "GRC Knowledge Hub", icon: Brain, page: "GRCKnowledgeHub" },
      { name: "AI Knowledge Base", icon: Brain, page: "KnowledgeBase" },
      { name: "AI Assistant", icon: Brain, page: "ComplianceAssistant" },
      { name: "AI Training Hub", icon: Brain, page: "AITraining" },
      { name: "Guidance Library", icon: BookOpen, page: "Guidance" },
    ]
  },
  {
    label: "Automation",
    items: [
      { name: "AI Workflows", icon: Brain, page: "AIWorkflowAutomation" },
      { name: "Workflow Automation", icon: Settings, page: "WorkflowAutomation" },
      { name: "External Integrations", icon: Settings, page: "ExternalIntegrations" },
    ]
  },
  {
    label: "Settings & Help",
    items: [
      { name: "Assessment Config", icon: Settings, page: "AssessmentConfiguration" },
      { name: "Notifications", icon: Settings, page: "NotificationSettings" },
      { name: "Security Center", icon: Shield, page: "SecurityDashboard" },
      { name: "Administration", icon: Settings, page: "PlatformAdministration" },
      { name: "Quick Start", icon: Rocket, page: "QuickStart" },
      { name: "Platform Features", icon: BookOpen, page: "PlatformFeatures" },
      { name: "User Guide", icon: HelpCircle, page: "UserGuide" },
    ]
  }
];

const Layout = memo(function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setUserEmail(user?.email || null);
      } catch (err) {
        console.log("Auth check:", err);
        setUserEmail(null);
      }
    };
    loadUser();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPageName]);

  return (
    <ErrorBoundary>
      <SecurityProvider>
        <PermissionProvider>
          <div className="min-h-screen bg-[#0f1623]">
                  <DeferredComponent fallback={null} delay={2000} waitForInteraction={true}>
                    <AutomationEngine />
                  </DeferredComponent>
      <style>{`
        :root {
          --grc-bg: #0f1623;
          --grc-sidebar: #151d2e;
          --grc-card: #1a2332;
          --grc-border: #2a3548;
          --grc-text: #e2e8f0;
          --grc-text-muted: #94a3b8;
          --grc-accent: #6366f1;
          --grc-accent-hover: #818cf8;
          --grc-success: #10b981;
          --grc-warning: #f59e0b;
          --grc-danger: #ef4444;
        }
        html, body {
          background-color: #0f1623;
        }
        * {
          scrollbar-color: #2a3548 #0f1623;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #2a3548;
          border-radius: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #3a4558;
        }
        .overflow-x-auto {
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
        }
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #2a3548;
          border-radius: 3px;
        }
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        [role="tab"][data-state="active"] {
          background: linear-gradient(to right, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15)) !important;
          color: #a78bfa !important;
          border-color: rgba(139, 92, 246, 0.3) !important;
        }
        [role="tab"]:not([data-state="active"]) {
          color: #94a3b8 !important;
          border-color: #2a3548 !important;
        }
        [role="tab"]:hover:not([data-state="active"]) {
          background: rgba(99, 102, 241, 0.05) !important;
          color: #cbd5e1 !important;
        }
        h1, h2, h3, h4, h5, h6, 
        div[class*="CardTitle"], 
        [class*="card"] h1, [class*="card"] h2, [class*="card"] h3, [class*="card"] h4, [class*="card"] h5, [class*="card"] h6,
        [class*="text-lg"], [class*="text-xl"], [class*="text-2xl"], [class*="text-3xl"],
        [class*="font-bold"], [class*="font-semibold"] {
          color: #ffffff !important;
        }
        p, span, div, label, input, textarea, select, button {
          color: #e2e8f0;
        }
        [class*="text-slate-400"], [class*="text-slate-500"] {
          color: #94a3b8 !important;
        }
        [class*="text-slate-300"] {
          color: #cbd5e1 !important;
        }
        [class*="text-white"] {
          color: #ffffff !important;
        }
      `}</style>
      
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 sm:h-14 bg-[#151d2e] border-b border-[#2a3548] z-50 flex items-center justify-between px-4 lg:pl-64">
        <div className="lg:hidden flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400 hover:text-white hover:bg-[#1a2332] h-10 w-10">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="hidden xs:block">
              <span className="font-bold text-white text-base truncate">Vindexion eGRC</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Vindexion eGRC Hub™</h2>
            <p className="text-[10px] text-slate-400">{currentPageName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DeferredComponent fallback={null} delay={1000}>
            <NotificationBell />
            <NotificationGenerator userEmail={userEmail} />
          </DeferredComponent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-[#1a2332] h-10 w-10 p-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548] text-white">
              <DropdownMenuItem className="hover:bg-[#2a3548] focus:bg-[#2a3548]">
                <User className="h-4 w-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#2a3548] focus:bg-[#2a3548]">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-72 sm:w-64 bg-[#151d2e] border-r border-[#2a3548] z-40 transform transition-transform duration-200 ease-in-out flex flex-col",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-[#2a3548] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent tracking-tight">
              Vindexion eGRC Hub™
            </h1>
            <p className="text-[9px] text-indigo-400/60 uppercase tracking-widest font-semibold">Enterprise Platform</p>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto pb-4" type="scroll">
          <nav className="p-4 space-y-5 pb-24">
            {navGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-1.5">
                <div className="px-3 mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {group.label}
                  </p>
                </div>
                {group.items.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group active:scale-95",
                        isActive 
                          ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10" 
                          : "text-slate-400 hover:bg-[#1a2332] hover:text-white active:bg-[#2a3548]"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-md transition-colors",
                        isActive ? "bg-indigo-500/20" : "bg-[#0f1623] group-hover:bg-[#1a2332]"
                      )}>
                        <item.icon className={cn("h-5 w-5", isActive && "text-indigo-400")} />
                      </div>
                      <span className="flex-1">{item.name}</span>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>
            </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-200",
        "lg:ml-64",
        "pt-16 sm:pt-14"
      )}>
        <div className="min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-56px)] bg-[#0f1623] pb-4">
          {children}
        </div>
      </main>
      </div>
      </PermissionProvider>
      </SecurityProvider>
      </ErrorBoundary>
      );
      });

      export default Layout;
