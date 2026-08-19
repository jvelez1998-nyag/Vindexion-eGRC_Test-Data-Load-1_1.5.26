import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, LayoutGrid, Save } from "lucide-react";
import { toast } from "sonner";
import InteractiveRiskHeatmap from "./InteractiveRiskHeatmap";
import ControlEffectivenessRadar from "./ControlEffectivenessRadar";
import ComplianceNetworkGraph from "./ComplianceNetworkGraph";
import AIExecutiveSummary from "./AIExecutiveSummary";

const AVAILABLE_WIDGETS = [
  { id: 'risk_heatmap', name: 'Risk Heatmap', component: InteractiveRiskHeatmap },
  { id: 'control_radar', name: 'Control Effectiveness Radar', component: ControlEffectivenessRadar },
  { id: 'compliance_network', name: 'Compliance Network', component: ComplianceNetworkGraph },
  { id: 'ai_summary', name: 'AI Executive Summary', component: AIExecutiveSummary }
];

export default function CustomDashboardBuilder() {
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [selectedWidgets, setSelectedWidgets] = useState(['risk_heatmap', 'control_radar']);
  const [layout, setLayout] = useState('grid');

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list('-updated_date', 100)
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list('-updated_date', 100)
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100)
  });

  const dashboardData = {
    risks_count: risks.length,
    compliance_count: compliance.length,
    controls_count: controls.length,
    critical_risks: risks.filter(r => r.overall_risk_rating === 'critical').length,
    compliant_items: compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length
  };

  const addWidget = (widgetId) => {
    if (!selectedWidgets.includes(widgetId)) {
      setSelectedWidgets([...selectedWidgets, widgetId]);
      toast.success("Widget added");
    }
  };

  const removeWidget = (widgetId) => {
    setSelectedWidgets(selectedWidgets.filter(id => id !== widgetId));
    toast.success("Widget removed");
  };

  const saveDashboard = () => {
    localStorage.setItem('custom_dashboard', JSON.stringify({
      name: dashboardName,
      widgets: selectedWidgets,
      layout
    }));
    toast.success("Dashboard saved");
  };

  return (
    <div className="space-y-6">
      {/* Builder Controls */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-indigo-400" />
            Dashboard Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Dashboard name..."
              className="bg-[#0f1623] border-[#2a3548] text-white"
            />
            <Button onClick={saveDashboard} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Add Widgets:</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_WIDGETS.map(widget => (
                <Button
                  key={widget.id}
                  onClick={() => addWidget(widget.id)}
                  disabled={selectedWidgets.includes(widget.id)}
                  size="sm"
                  className={selectedWidgets.includes(widget.id) 
                    ? "bg-gradient-to-r from-slate-600 to-slate-500 opacity-50 cursor-not-allowed" 
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {widget.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Active Widgets:</label>
            <div className="flex flex-wrap gap-2">
              {selectedWidgets.map(widgetId => {
                const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
                return (
                  <Badge key={widgetId} className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 pr-1">
                    {widget?.name}
                    <Button
                      onClick={() => removeWidget(widgetId)}
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-2 hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Preview */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Dashboard Preview: {dashboardName}</h3>
        
        {selectedWidgets.includes('ai_summary') && (
          <AIExecutiveSummary dashboardData={dashboardData} />
        )}

        <div className={layout === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
          {selectedWidgets.map(widgetId => {
            const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
            if (!widget || widgetId === 'ai_summary') return null;
            const WidgetComponent = widget.component;
            return <WidgetComponent key={widgetId} />;
          })}
        </div>
      </div>
    </div>
  );
}