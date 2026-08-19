import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, Target, Calendar } from "lucide-react";

export default function KRIVisualization({ kri, onClose }) {
  const historicalData = kri.historical_data || [];
  
  const chartData = historicalData.map(d => ({
    date: new Date(d.timestamp).toLocaleDateString(),
    value: d.value,
    target: kri.target_value
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return 'text-emerald-400 bg-emerald-500/20';
      case 'amber': return 'text-amber-400 bg-amber-500/20';
      case 'red': return 'text-rose-400 bg-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getThresholdZones = () => {
    const { threshold_green, threshold_amber, threshold_red, direction } = kri;
    if (direction === "lower_better") {
      return [
        { name: "Green Zone", range: [0, threshold_green], color: "#10b981" },
        { name: "Amber Zone", range: [threshold_green, threshold_amber], color: "#f59e0b" },
        { name: "Red Zone", range: [threshold_amber, 100], color: "#ef4444" }
      ];
    } else {
      return [
        { name: "Red Zone", range: [0, threshold_red], color: "#ef4444" },
        { name: "Amber Zone", range: [threshold_red, threshold_amber], color: "#f59e0b" },
        { name: "Green Zone", range: [threshold_amber, 100], color: "#10b981" }
      ];
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a2332] border-[#2a3548] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            {kri.name} - Performance Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-3">
                <p className="text-xs text-slate-500 mb-1">Current Status</p>
                <Badge className={getStatusColor(kri.traffic_light_status)}>
                  {kri.traffic_light_status?.toUpperCase() || 'N/A'}
                </Badge>
              </CardContent>
            </Card>
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-3">
                <p className="text-xs text-slate-500 mb-1">Current Value</p>
                <p className="text-xl font-bold text-white">{kri.current_value} {kri.unit}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-3">
                <p className="text-xs text-slate-500 mb-1">Target Value</p>
                <p className="text-xl font-bold text-indigo-400">{kri.target_value} {kri.unit}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-3">
                <p className="text-xs text-slate-500 mb-1">Frequency</p>
                <p className="text-sm font-semibold text-white capitalize">{kri.frequency}</p>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 ? (
            <>
              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                      <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <ReferenceLine y={kri.threshold_green} stroke="#10b981" strokeDasharray="3 3" label="Green" />
                      <ReferenceLine y={kri.threshold_amber} stroke="#f59e0b" strokeDasharray="3 3" label="Amber" />
                      <ReferenceLine y={kri.threshold_red} stroke="#ef4444" strokeDasharray="3 3" label="Red" />
                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="target" stroke="#818cf8" strokeDasharray="5 5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Threshold Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                      <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <ReferenceLine y={kri.threshold_green} stroke="#10b981" strokeWidth={2} />
                      <ReferenceLine y={kri.threshold_amber} stroke="#f59e0b" strokeWidth={2} />
                      <ReferenceLine y={kri.threshold_red} stroke="#ef4444" strokeWidth={2} />
                      <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No historical data available</p>
                <p className="text-xs text-slate-500 mt-1">Data will appear as the KRI is updated over time</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-3">
            {getThresholdZones().map((zone, idx) => (
              <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: zone.color }} />
                    <p className="text-xs font-semibold text-white">{zone.name}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {zone.range[0]} - {zone.range[1]} {kri.unit}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#0f1623] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm text-white">KRI Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Metric:</span>
                <span className="text-white">{kri.metric}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Source:</span>
                <span className="text-white">{kri.data_source || 'Not specified'}</span>
              </div>
              {kri.calculation_method && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Calculation:</span>
                  <span className="text-white">{kri.calculation_method}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Direction:</span>
                <Badge>{kri.direction === 'lower_better' ? '↓ Lower is Better' : '↑ Higher is Better'}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}