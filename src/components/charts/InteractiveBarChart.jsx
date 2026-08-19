import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Maximize2, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2 } from "lucide-react";

export default function InteractiveBarChart({
  data = [],
  dataKey,
  nameKey = "name",
  height = 300,
  color = "#6366f1",
  hoverColor = "#818cf8",
  title,
  onBarClick,
  drillDownContent,
  showTrendIndicators = false,
  benchmark,
  customTooltip,
  ...props
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const handleBarClick = (data, index) => {
    setSelectedData({ ...data, index });
    setDrillDownOpen(true);
    onBarClick?.(data, index);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg p-3 shadow-lg">
          <p className="text-xs text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-white font-semibold">{entry.value}{typeof entry.value === 'number' && entry.value <= 100 ? '%' : ''}</span>
            </div>
          ))}
          {benchmark && (
            <div className="mt-2 pt-2 border-t border-[#2a3548]">
              <div className="flex items-center gap-2 text-xs">
                <Target className="h-3 w-3 text-amber-400" />
                <span className="text-slate-400">Benchmark:</span>
                <span className="text-amber-400 font-semibold">{benchmark}%</span>
              </div>
            </div>
          )}
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <Maximize2 className="h-2.5 w-2.5" />
            Click to drill down
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (entry, index) => {
    if (hoveredIndex === index) return hoverColor;
    if (benchmark && entry[dataKey] < benchmark) return '#ef4444';
    return color;
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data} 
          onMouseMove={(state) => {
            if (state.isTooltipActive) {
              setHoveredIndex(state.activeTooltipIndex);
            } else {
              setHoveredIndex(null);
            }
          }}
          onMouseLeave={() => setHoveredIndex(null)}
          {...props}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
          <XAxis 
            dataKey={nameKey} 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 10 }} 
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip content={customTooltip || <CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar 
            dataKey={dataKey} 
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            cursor="pointer"
            className="transition-all"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry, index)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Drill-Down Modal */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="bg-[#1a2332] border-[#2a3548] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Maximize2 className="h-5 w-5 text-violet-400" />
              {selectedData?.[nameKey]} - Detailed Analysis
            </DialogTitle>
          </DialogHeader>
          {selectedData && (
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-[#0f1623] border-[#2a3548]">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-white">{selectedData[dataKey]}{typeof selectedData[dataKey] === 'number' && selectedData[dataKey] <= 100 ? '%' : ''}</div>
                    <div className="text-xs text-slate-400">Value</div>
                  </CardContent>
                </Card>
                
                {benchmark && (
                  <>
                    <Card className="bg-[#0f1623] border-[#2a3548]">
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-amber-400">{benchmark}%</div>
                        <div className="text-xs text-slate-400">Benchmark</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#0f1623] border-[#2a3548]">
                      <CardContent className="p-3 text-center">
                        <div className={`text-2xl font-bold ${selectedData[dataKey] >= benchmark ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {selectedData[dataKey] >= benchmark ? '+' : ''}{(selectedData[dataKey] - benchmark).toFixed(0)}
                        </div>
                        <div className="text-xs text-slate-400">vs Benchmark</div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Performance Indicator */}
              <Card className={`bg-gradient-to-r ${
                selectedData[dataKey] >= 80 ? 'from-emerald-500/10 to-green-500/10 border-emerald-500/20' :
                selectedData[dataKey] >= 60 ? 'from-blue-500/10 to-cyan-500/10 border-blue-500/20' :
                'from-amber-500/10 to-orange-500/10 border-amber-500/20'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {selectedData[dataKey] >= 80 ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                    ) : selectedData[dataKey] >= 60 ? (
                      <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">Performance Assessment</h4>
                      <p className="text-xs text-slate-300">
                        {selectedData[dataKey] >= 80 ? 'Excellent performance! You have strong mastery in this area.' :
                         selectedData[dataKey] >= 60 ? 'Good progress. Continue practicing to reach expert level.' :
                         'This area needs attention. Focus on fundamentals and practice more.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Drill-Down Content */}
              {drillDownContent && drillDownContent(selectedData)}

              {/* Additional Insights */}
              <Card className="bg-violet-500/10 border-violet-500/20">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-violet-400 mb-2">Recommendations</h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedData[dataKey] < 70 && (
                      <>
                        <li>• Review foundational concepts in {selectedData[nameKey]}</li>
                        <li>• Practice 10-15 additional questions in this category</li>
                        <li>• Study relevant regulatory guidance materials</li>
                      </>
                    )}
                    {selectedData[dataKey] >= 70 && selectedData[dataKey] < 85 && (
                      <>
                        <li>• Move to advanced-level questions in {selectedData[nameKey]}</li>
                        <li>• Focus on scenario-based practice</li>
                        <li>• Review edge cases and exceptions</li>
                      </>
                    )}
                    {selectedData[dataKey] >= 85 && (
                      <>
                        <li>• Excellent mastery - maintain with periodic review</li>
                        <li>• Consider mentoring others in {selectedData[nameKey]}</li>
                        <li>• Challenge yourself with expert-level scenarios</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}