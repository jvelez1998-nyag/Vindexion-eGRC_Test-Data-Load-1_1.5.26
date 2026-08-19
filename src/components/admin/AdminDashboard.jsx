import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DraggableGrid } from "@/components/ui/draggable-grid";
import { Users, Workflow, Bell, Shield, Activity, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function AdminDashboard() {
  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const { data: automationRules = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => base44.entities.AutomationRule.list()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list()
  });

  const [widgets, setWidgets] = useState([
    { id: 'stats', title: 'Platform Statistics' },
    { id: 'users-chart', title: 'User Activity' },
    { id: 'automation', title: 'Automation Status' },
    { id: 'notifications', title: 'Notification Trends' }
  ]);

  const activeUsers = users.filter(u => u.status !== 'inactive').length;
  const activeAutomation = automationRules.filter(r => r.enabled).length;
  const recentNotifications = notifications.filter(n => !n.read).length;

  const statsData = [
    { name: 'Total Users', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-400' },
    { name: 'Active Roles', value: roles.length, icon: Shield, color: 'from-purple-500 to-pink-500', textColor: 'text-purple-400' },
    { name: 'Automations', value: activeAutomation, icon: Workflow, color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-400' },
    { name: 'Notifications', value: recentNotifications, icon: Bell, color: 'from-amber-500 to-orange-500', textColor: 'text-amber-400' }
  ];

  const userActivityData = [
    { month: 'Jan', active: 45, total: 50 },
    { month: 'Feb', active: 48, total: 52 },
    { month: 'Mar', active: 52, total: 58 },
    { month: 'Apr', active: 55, total: 60 },
    { month: 'May', active: 58, total: 65 },
    { month: 'Jun', active: 62, total: 68 }
  ];

  const automationStatusData = [
    { name: 'Active', value: activeAutomation, color: '#10b981' },
    { name: 'Inactive', value: automationRules.length - activeAutomation, color: '#6b7280' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.name}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Draggable Visualization Widgets */}
      <DraggableGrid
        items={widgets}
        onReorder={setWidgets}
        columns={2}
        gap={4}
        renderItem={(widget) => {
          if (widget.id === 'users-chart') {
            return (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-400" />
                    User Activity Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="total" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          }

          if (widget.id === 'automation') {
            return (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    Automation Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={automationStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {automationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          }

          if (widget.id === 'notifications') {
            return (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-400" />
                    Notification Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#0f1623] rounded-lg">
                      <span className="text-sm text-slate-300">Unread Notifications</span>
                      <Badge className="bg-amber-500/20 text-amber-400">{recentNotifications}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0f1623] rounded-lg">
                      <span className="text-sm text-slate-300">Total Notifications</span>
                      <Badge className="bg-blue-500/20 text-blue-400">{notifications.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0f1623] rounded-lg">
                      <span className="text-sm text-slate-300">Read Rate</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        {notifications.length > 0 ? Math.round(((notifications.length - recentNotifications) / notifications.length) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return null;
        }}
      />

      {/* Quick Actions */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">All Systems Operational</span>
              </div>
              <p className="text-xs text-slate-400">Platform running smoothly</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">Performance Optimal</span>
              </div>
              <p className="text-xs text-slate-400">Response time: 124ms avg</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">Active Monitoring</span>
              </div>
              <p className="text-xs text-slate-400">24/7 system surveillance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}