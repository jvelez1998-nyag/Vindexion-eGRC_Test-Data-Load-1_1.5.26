import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, AlertTriangle, Activity, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import KRIForm from "@/components/kri/KRIForm";
import KRICard from "@/components/kri/KRICard";
import KRIVisualization from "@/components/kri/KRIVisualization";
import KRIThresholdMonitor from "@/components/kri/KRIThresholdMonitor";
import KRIRealTimeMonitor from "@/components/kri/KRIRealTimeMonitor";
import KRIKPILibrary from "@/components/kri/KRIKPILibrary";

export default function KRIDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [selectedKRI, setSelectedKRI] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const { data: kris = [], refetch } = useQuery({
    queryKey: ['key-indicators'],
    queryFn: () => base44.entities.KeyIndicator.list(),
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list(),
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list(),
  });

  const filteredKRIs = filterType === "all" 
    ? kris 
    : kris.filter(k => k.indicator_type === filterType);

  const krisByStatus = {
    green: kris.filter(k => k.traffic_light_status === 'green').length,
    amber: kris.filter(k => k.traffic_light_status === 'amber').length,
    red: kris.filter(k => k.traffic_light_status === 'red').length
  };

  return (
    <div className="p-6 space-y-6">
      <KRIRealTimeMonitor kris={kris} risks={risks} controls={controls} onUpdate={refetch} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Key Risk Indicators</h1>
          <p className="text-slate-400">Monitor and manage KRIs, KCIs, and KPIs</p>
        </div>
        <Button onClick={() => { setSelectedKRI(null); setShowForm(true); }} className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Add KRI
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total KRIs</p>
                <p className="text-3xl font-bold text-white mt-1">{kris.length}</p>
              </div>
              <Activity className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Green Status</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">{krisByStatus.green}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Amber Status</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{krisByStatus.amber}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Red Status</p>
                <p className="text-3xl font-bold text-rose-400 mt-1">{krisByStatus.red}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center">
                <span className="text-white font-bold">!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <KRIThresholdMonitor kris={kris} onRefresh={refetch} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[#1a2332]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="library">
            <BookOpen className="h-4 w-4 mr-2" />
            Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Tabs value={filterType} onValueChange={setFilterType}>
            <TabsList className="bg-[#1a2332]">
              <TabsTrigger value="all">All Indicators</TabsTrigger>
              <TabsTrigger value="kri">KRIs (Risk)</TabsTrigger>
              <TabsTrigger value="kci">KCIs (Control)</TabsTrigger>
              <TabsTrigger value="kpi">KPIs (Performance)</TabsTrigger>
            </TabsList>

            <TabsContent value={filterType} className="space-y-4 mt-4">
              {filteredKRIs.length === 0 ? (
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardContent className="p-12 text-center">
                    <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No indicators found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredKRIs.map(kri => (
                    <KRICard 
                      key={kri.id} 
                      kri={kri}
                      risks={risks}
                      controls={controls}
                      onEdit={() => { setSelectedKRI(kri); setShowForm(true); }}
                      onViewDetails={() => setSelectedKRI(kri)}
                      onRefresh={refetch}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="library">
          <KRIKPILibrary onImport={() => refetch()} />
        </TabsContent>
      </Tabs>

      {showForm && (
        <KRIForm
          kri={selectedKRI}
          risks={risks}
          controls={controls}
          onClose={() => { setShowForm(false); setSelectedKRI(null); }}
          onSave={() => { setShowForm(false); setSelectedKRI(null); refetch(); }}
        />
      )}

      {selectedKRI && !showForm && (
        <KRIVisualization
          kri={selectedKRI}
          onClose={() => setSelectedKRI(null)}
        />
      )}
    </div>
  );
}