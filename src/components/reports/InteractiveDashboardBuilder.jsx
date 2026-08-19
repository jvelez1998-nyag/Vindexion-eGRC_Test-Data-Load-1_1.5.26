import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, Plus, Settings, Eye, X, ArrowUpRight,
  TrendingUp, AlertTriangle, Shield, FileCheck, Activity,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DraggableContainer, DraggableItem } from "@/components/ui/draggable-container";
import { DragHandle } from "@/components/ui/drag-handle";

export default function InteractiveDashboardBuilder({ data }) {
  const [widgets, setWidgets] = useState([
    { id: '1', type: 'risk-overview', title: 'Risk Overview', size: 'large' },
    { id: '2', type: 'compliance-gauge', title: 'Compliance Status', size: 'medium' },
    { id: '3', type: 'control-effectiveness', title: 'Control Effectiveness', size: 'medium' }
  ]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const availableWidgets = [
    { type: 'risk-overview', title: 'Risk Overview', icon: AlertTriangle, color: 'rose' },
    { type: 'risk-distribution', title: 'Risk Distribution', icon: PieChartIcon, color: 'amber' },
    { type: 'risk-trend', title: 'Risk Trends', icon: LineChartIcon, color: 'purple' },
    { type: 'compliance-gauge', title: 'Compliance Rate', icon: FileCheck, color: 'emerald' },
    { type: 'compliance-framework', title: 'Framework Status', icon: BarChart3, color: 'blue' },
    { type: 'control-effectiveness', title: 'Control Effectiveness', icon: Shield, color: 'cyan' },
    { type: 'control-distribution', title: 'Control by Domain', icon: PieChartIcon, color: 'indigo' },
    { type: 'audit-activity', title: 'Audit Activity', icon: Activity, color: 'violet' },
    { type: 'incident-severity', title: 'Incident Severity', icon: BarChart3, color: 'red' },
    { type: 'vendor-risk', title: 'Vendor Risk Score', icon: TrendingUp, color: 'orange' }
  ];

  const handleDrillDown = (widgetType, dataPoint) => {
    let drillData = null;

    switch (widgetType) {
      case 'risk-overview':
        drillData = {
          title: 'All Risks',
          items: data.risks || [],
          fields: ['title', 'category', 'status', 'likelihood', 'impact']
        };
        break;
      case 'risk-distribution':
        drillData = {
          title: `Risks - ${dataPoint?.name || 'Category'}`,
          items: (data.risks || []).filter(r => r.category === dataPoint?.name),
          fields: ['title', 'status', 'likelihood', 'impact', 'owner']
        };
        break;
      case 'compliance-framework':
        drillData = {
          title: `${dataPoint?.name || 'Framework'} Requirements`,
          items: (data.compliance || []).filter(c => c.framework === dataPoint?.name),
          fields: ['requirement', 'status', 'owner', 'due_date']
        };
        break;
      case 'control-distribution':
        drillData = {
          title: `Controls - ${dataPoint?.name || 'Domain'}`,
          items: (data.controls || []).filter(c => c.domain === dataPoint?.name),
          fields: ['name', 'category', 'status', 'effectiveness', 'owner']
        };
        break;
      case 'incident-severity':
        drillData = {
          title: `${dataPoint?.severity || 'Severity'} Incidents`,
          items: (data.incidents || []).filter(i => i.severity === dataPoint?.severity?.toLowerCase()),
          fields: ['title', 'incident_type', 'status', 'assigned_to', 'occurred_date']
        };
        break;
    }

    setDrillDownData(drillData);
    setDrillDownOpen(true);
  };

  const addWidget = (widgetType) => {
    const widget = availableWidgets.find(w => w.type === widgetType);
    if (!widget) return;

    const newWidget = {
      id: Date.now().toString(),
      type: widgetType,
      title: widget.title,
      size: 'medium'
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const reorderWidgets = (newOrder) => {
    setWidgets(newOrder);
  };

  const renderWidget = (widget) => {
    const { risks = [], compliance = [], controls = [], audits = [], incidents = [], vendors = [] } = data || {};

    switch (widget.type) {
      case 'risk-overview':
        return (
          <WidgetCard 
            widget={widget} 
            onRemove={removeWidget}
            onDrillDown={() => handleDrillDown(widget.type)}
            editMode={editMode}
          >
            <div className="grid grid-cols-3 gap-4">
              <StatDisplay label="Total Risks" value={risks.length} color="blue" />
              <StatDisplay label="Critical" value={risks.filter(r => (r.residual_likelihood || 0) * (r.residual_impact || 0) >= 16).length} color="rose" />
              <StatDisplay label="Open" value={risks.filter(r => r.status !== 'closed').length} color="amber" />
            </div>
          </WidgetCard>
        );

      case 'risk-distribution':
        const riskByCategory = getRiskDistribution(risks);
        return (
          <WidgetCard 
            widget={widget} 
            onRemove={removeWidget}
            onDrillDown={() => handleDrillDown(widget.type)}
            editMode={editMode}
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  onClick={(data) => handleDrillDown(widget.type, data)}
                  cursor="pointer"
                >
                  {riskByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
              </PieChart>
            </ResponsiveContainer>
          </WidgetCard>
        );

      case 'compliance-gauge':
        const complianceRate = compliance.length > 0 
          ? Math.round((compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length / compliance.length) * 100) 
          : 0;
        return (
          <WidgetCard 
            widget={widget} 
            onRemove={removeWidget}
            onDrillDown={() => handleDrillDown(widget.type)}
            editMode={editMode}
          >
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-400 mb-2">{complianceRate}%</div>
              <div className="text-sm text-slate-400 mb-4">Compliance Rate</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-[#151d2e] rounded">
                  <div className="text-lg font-bold text-white">{compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length}</div>
                  <div className="text-xs text-emerald-400">Compliant</div>
                </div>
                <div className="p-2 bg-[#151d2e] rounded">
                  <div className="text-lg font-bold text-white">{compliance.filter(c => c.status === 'not_started' || c.status === 'in_progress').length}</div>
                  <div className="text-xs text-amber-400">In Progress</div>
                </div>
              </div>
            </div>
          </WidgetCard>
        );

      case 'control-effectiveness':
        const effectivenessRate = controls.length > 0 
          ? Math.round((controls.filter(c => c.status === 'effective').length / controls.length) * 100) 
          : 0;
        return (
          <WidgetCard 
            widget={widget} 
            onRemove={removeWidget}
            onDrillDown={() => handleDrillDown(widget.type)}
            editMode={editMode}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Overall Effectiveness</span>
                <span className="text-2xl font-bold text-blue-400">{effectivenessRate}%</span>
              </div>
              <div className="h-3 bg-[#151d2e] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                  style={{ width: `${effectivenessRate}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Effective:</span> <span className="text-emerald-400">{controls.filter(c => c.status === 'effective').length}</span></div>
                <div><span className="text-slate-500">Ineffective:</span> <span className="text-rose-400">{controls.filter(c => c.status === 'ineffective').length}</span></div>
              </div>
            </div>
          </WidgetCard>
        );

      case 'compliance-framework':
        const frameworkData = getFrameworkDistribution(compliance);
        return (
          <WidgetCard 
            widget={widget} 
            onRemove={removeWidget}
            onDrillDown={() => handleDrillDown(widget.type)}
            editMode={editMode}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={frameworkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => handleDrillDown(widget.type, data)}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </WidgetCard>
        );

      case 'control-distribution':
        const controlByDomain = getControlDistribution(controls);
        return (
          <WidgetCard 
            widget={widget} 
            onRemove={removeWidget}
            onDrillDown={() => handleDrillDown(widget.type)}
            editMode={editMode}
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={controlByDomain}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  onClick={(data) => handleDrillDown(widget.type, data)}
                  cursor="pointer"
                >
                  {controlByDomain.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </WidgetCard>
        );

      case 'incident-severity':
        const incidentData = getIncidentDistribution(incidents);
        return (
          <WidgetCard 
            widget={widget} 
            onRemove={removeWidget}
            onDrillDown={() => handleDrillDown(widget.type)}
            editMode={editMode}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incidentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="severity" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                <Bar 
                  dataKey="count" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => handleDrillDown(widget.type, data)}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </WidgetCard>
        );

      case 'audit-activity':
        return (
          <WidgetCard 
            widget={widget} 
            onRemove={removeWidget}
            onDrillDown={() => handleDrillDown(widget.type)}
            editMode={editMode}
          >
            <div className="grid grid-cols-2 gap-4">
              <StatDisplay label="Completed" value={audits.filter(a => a.status === 'completed').length} color="emerald" />
              <StatDisplay label="In Progress" value={audits.filter(a => a.status === 'in_progress').length} color="blue" />
            </div>
          </WidgetCard>
        );

      case 'vendor-risk':
        const highRiskVendors = vendors.filter(v => (v.overall_risk_score || 0) > 60).length;
        return (
          <WidgetCard 
            widget={widget} 
            onRemove={removeWidget}
            onDrillDown={() => handleDrillDown(widget.type)}
            editMode={editMode}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">High Risk Vendors</span>
                <span className="text-2xl font-bold text-rose-400">{highRiskVendors}</span>
              </div>
              <div className="text-xs text-slate-500">of {vendors.length} total vendors</div>
            </div>
          </WidgetCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="h-7 w-7 text-indigo-400" />
              Interactive Dashboard
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Customize your view with drag-and-drop widgets and drill-down capabilities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "default" : "outline"}
              className={editMode ? "bg-indigo-600 hover:bg-indigo-700" : "border-[#2a3548]"}
            >
              <Settings className="h-4 w-4 mr-2" />
              {editMode ? 'Done Editing' : 'Edit Dashboard'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Widget Picker (shown in edit mode) */}
      {editMode && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" />
            Add Widgets
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {availableWidgets.map(widget => (
              <Button
                key={widget.type}
                onClick={() => addWidget(widget.type)}
                variant="outline"
                className="h-auto flex-col gap-2 py-3 border-[#2a3548] hover:border-indigo-500/40"
              >
                <widget.icon className={`h-5 w-5 text-${widget.color}-400`} />
                <span className="text-xs text-slate-300">{widget.title}</span>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Dashboard Grid */}
      <DraggableContainer
        items={widgets}
        onReorder={reorderWidgets}
        renderItem={(widget) => renderWidget(widget)}
        keyExtractor={(widget) => widget.id}
        disabled={!editMode}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      />

      {/* Drill-Down Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white overflow-hidden">
          {drillDownData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-indigo-400" />
                  {drillDownData.title}
                </DialogTitle>
                <p className="text-sm text-slate-400">{drillDownData.items?.length || 0} records</p>
              </DialogHeader>
              <ScrollArea className="h-[500px] mt-4">
                <div className="space-y-2">
                  {(drillDownData.items || []).map((item, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {(drillDownData.fields || Object.keys(item).slice(0, 5)).map(field => (
                          <div key={field}>
                            <span className="text-slate-500 capitalize">{field.replace(/_/g, ' ')}: </span>
                            <span className="text-white">{item[field] || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WidgetCard({ widget, children, onRemove, onDrillDown, editMode }) {
  return (
    <Card className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/30 transition-all group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {editMode && <DragHandle />}
            {widget.title}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onDrillDown}
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-3 w-3 text-slate-400" />
            </Button>
            {editMode && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(widget.id)}
                className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

function StatDisplay({ label, value, color }) {
  const colorMap = {
    blue: 'text-blue-400',
    rose: 'text-rose-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400'
  };

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function getRiskDistribution(risks) {
  const categories = {};
  risks.forEach(r => {
    const cat = r.category || 'Unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
}

function getControlDistribution(controls) {
  const domains = {};
  controls.forEach(c => {
    const domain = (c.domain || 'Unknown').replace(/_/g, ' ');
    domains[domain] = (domains[domain] || 0) + 1;
  });
  return Object.entries(domains).map(([name, value]) => ({ name, value }));
}

function getFrameworkDistribution(compliance) {
  const frameworks = {};
  compliance.forEach(c => {
    const framework = c.framework || 'Unknown';
    frameworks[framework] = (frameworks[framework] || 0) + 1;
  });
  return Object.entries(frameworks).map(([name, count]) => ({ name, count }));
}

function getIncidentDistribution(incidents) {
  const severities = ['critical', 'high', 'medium', 'low'];
  return severities.map(sev => ({
    severity: sev.charAt(0).toUpperCase() + sev.slice(1),
    count: incidents.filter(i => i.severity === sev).length
  }));
}