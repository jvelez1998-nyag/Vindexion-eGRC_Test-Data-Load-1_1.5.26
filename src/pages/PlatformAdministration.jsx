import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Settings, Users, Bell, Workflow, Plug, FileText, Shield, BookOpen, Target, HelpCircle, Sparkles, BarChart3, Brain, Activity, Zap, CheckCircle2, AlertCircle, ScrollText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WorkflowAutomationPanel from "@/components/admin/WorkflowAutomationPanel";
import ExternalIntegrationsPanel from "@/components/admin/ExternalIntegrationsPanel";
import AssessmentConfigPanel from "@/components/admin/AssessmentConfigPanel";
import RoleManagementPanel from "@/components/admin/RoleManagementPanel";
import UserAdministrationPanel from "@/components/admin/UserAdministrationPanel";
import NotificationSettingsPanel from "@/components/admin/NotificationSettingsPanel";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminStudyGuide from "@/components/admin/AdminStudyGuide";
import AdminDeepDive from "@/components/admin/AdminDeepDive";
import AdminVisualizations from "@/components/admin/AdminVisualizations";
import AdminHowTo from "@/components/admin/AdminHowTo";
import AuditTrailViewer from "@/components/admin/AuditTrailViewer";

export default function PlatformAdministration() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => setUserEmail(user?.email)).catch(() => {});
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 50),
    staleTime: 300000
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list('-created_date'),
    staleTime: 300000
  });

  const { data: automationRules = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => base44.entities.AutomationRule.list('-created_date', 50),
    staleTime: 300000
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 100),
    staleTime: 180000
  });

  const activeUsers = users.filter(u => u.role === 'admin' || u.role === 'user').length;
  const activeAutomations = automationRules.filter(r => r.is_active).length;
  const unreadNotifications = notifications.filter(n => !n.read && n.user_email === userEmail).length;

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-[1800px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Hero Header */}
        <div className="mb-3">
          <h2 className="text-sm font-bold text-purple-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bS0yIDJ2LTJoLTJ2Mmgyem0wLTR2LTJoLTJ2Mmgyem0yLTJ2LTJoLTJ2Mmgyem0wLTRoMnYtMmgtMnYyem0tMiAwdi0yaC0ydjJoMnptLTIgMGgtMnYyaDJ2LTJ6bTQgMGgydi0yaC0ydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
          <div className="relative p-8 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 shadow-2xl shadow-purple-500/40">
                  <Settings className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent mb-2">
                    Platform Administration
                  </h1>
                  <p className="text-slate-300 text-base">Unified system configuration, automation & governance</p>
                </div>
              </div>
              <div className="hidden lg:block">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2 text-sm">
                  <Activity className="h-4 w-4 mr-2" />
                  System Active
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 p-4 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeUsers}</div>
            </div>
            <div className="text-xs text-slate-400">Active Users</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Platform access</div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 p-4 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeAutomations}</div>
            </div>
            <div className="text-xs text-slate-400">Active Automations</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Running workflows</div>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 p-4 hover:border-violet-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Shield className="h-5 w-5 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white">{roles.length}</div>
            </div>
            <div className="text-xs text-slate-400">Roles Configured</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Access control</div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-4 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Bell className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{unreadNotifications}</div>
            </div>
            <div className="text-xs text-slate-400">Pending Notifications</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Requires attention</div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto scrollbar-thin">
            <TabsList className="bg-[#1a2332] border border-[#2a3548] p-1 inline-flex gap-1 h-auto">
              <TabsTrigger 
                value="dashboard"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-purple-400 data-[state=active]:border data-[state=active]:border-purple-500/30 text-xs whitespace-nowrap"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="workflow"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30 text-xs whitespace-nowrap"
              >
                <Workflow className="h-4 w-4 mr-2" />
                Workflow
              </TabsTrigger>
              <TabsTrigger 
                value="integrations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/30 text-xs whitespace-nowrap"
              >
                <Plug className="h-4 w-4 mr-2" />
                Integrations
              </TabsTrigger>
              <TabsTrigger 
                value="assessments"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30 text-xs whitespace-nowrap"
              >
                <FileText className="h-4 w-4 mr-2" />
                Assessments
              </TabsTrigger>
              <TabsTrigger 
                value="roles"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30 text-xs whitespace-nowrap"
              >
                <Shield className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30 text-xs whitespace-nowrap"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:text-amber-400 data-[state=active]:border data-[state=active]:border-amber-500/30 text-xs whitespace-nowrap"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="audit-trail"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/30 text-xs whitespace-nowrap"
              >
                <ScrollText className="h-4 w-4 mr-2" />
                Audit Trail
              </TabsTrigger>
              <TabsTrigger 
                value="visualizations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30 text-xs whitespace-nowrap"
              >
                <Brain className="h-4 w-4 mr-2" />
                Visualizations
              </TabsTrigger>
              <TabsTrigger 
                value="how-to"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-teal-400 data-[state=active]:border data-[state=active]:border-teal-500/30 text-xs whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                How-To
              </TabsTrigger>
              <TabsTrigger 
                value="study"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-orange-400 data-[state=active]:border data-[state=active]:border-orange-500/30 text-xs whitespace-nowrap"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Study
              </TabsTrigger>
              <TabsTrigger 
                value="deep-dive"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-fuchsia-400 data-[state=active]:border data-[state=active]:border-fuchsia-500/30 text-xs whitespace-nowrap"
              >
                <Target className="h-4 w-4 mr-2" />
                Deep Dive
              </TabsTrigger>
              <TabsTrigger 
                value="help"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500/20 data-[state=active]:to-gray-500/20 data-[state=active]:text-slate-400 data-[state=active]:border data-[state=active]:border-slate-500/30 text-xs whitespace-nowrap"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="workflow">
            <WorkflowAutomationPanel />
          </TabsContent>

          <TabsContent value="integrations">
            <ExternalIntegrationsPanel />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentConfigPanel />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagementPanel />
          </TabsContent>

          <TabsContent value="users">
            <UserAdministrationPanel />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettingsPanel />
          </TabsContent>

          <TabsContent value="audit-trail">
            <AuditTrailViewer />
          </TabsContent>

          <TabsContent value="visualizations">
            <AdminVisualizations />
          </TabsContent>

          <TabsContent value="how-to">
            <AdminHowTo />
          </TabsContent>

          <TabsContent value="study">
            <AdminStudyGuide />
          </TabsContent>

          <TabsContent value="deep-dive">
            <AdminDeepDive />
          </TabsContent>

          <TabsContent value="help">
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-indigo-500/20">
                      <HelpCircle className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Platform Administration Help</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    This comprehensive administration module consolidates all platform configuration, 
                    user management, automation, and integration capabilities into one unified interface.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-[#1a2332] border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-semibold text-white">Getting Started</h3>
                    </div>
                    <p className="text-sm text-slate-400">Navigate through tabs to access different administrative functions. Each section includes contextual help and AI assistance.</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a2332] border-blue-500/20 hover:border-blue-500/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-white">Best Practices</h3>
                    </div>
                    <p className="text-sm text-slate-400">Review the Study Guide and Deep Dive sections for comprehensive training on platform administration and governance.</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a2332] border-amber-500/20 hover:border-amber-500/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                      <h3 className="font-semibold text-white">Support</h3>
                    </div>
                    <p className="text-sm text-slate-400">Need assistance? Check the How-To Guide for step-by-step tutorials or contact your system administrator.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}