import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Plus, Brain, AlertTriangle, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const STRIDE_CATEGORIES = [
  { id: "spoofing", label: "Spoofing", color: "rose", description: "Impersonating something or someone else" },
  { id: "tampering", label: "Tampering", color: "amber", description: "Modifying data or code" },
  { id: "repudiation", label: "Repudiation", color: "yellow", description: "Denying having performed an action" },
  { id: "info_disclosure", label: "Information Disclosure", color: "purple", description: "Exposing information to unauthorized users" },
  { id: "dos", label: "Denial of Service", color: "red", description: "Making resources unavailable" },
  { id: "elevation", label: "Elevation of Privilege", color: "orange", description: "Gaining unauthorized capabilities" }
];

export default function ThreatModelingCanvas() {
  const [systemName, setSystemName] = useState("");
  const [components, setComponents] = useState([]);
  const [threats, setThreats] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeThreats = async () => {
    if (!systemName || components.length === 0) {
      toast.error("Please provide system name and add components");
      return;
    }

    setAnalyzing(true);

    try {
      const prompt = `Conduct a STRIDE threat modeling analysis for the following system:

SYSTEM: ${systemName}
COMPONENTS: ${components.join(", ")}

For each component, identify threats across all STRIDE categories:
- Spoofing
- Tampering  
- Repudiation
- Information Disclosure
- Denial of Service
- Elevation of Privilege

For each identified threat, provide:
1. Threat name
2. STRIDE category
3. Description
4. Risk level (Low/Medium/High/Critical)
5. Mitigation strategy

Format as JSON array.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            threats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  component: { type: "string" },
                  description: { type: "string" },
                  risk: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setThreats(response.threats || []);
      toast.success(`Identified ${response.threats?.length || 0} threats`);
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-400" />
            STRIDE Threat Modeling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">System Name</label>
            <Input
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="e.g., Customer Portal Application"
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">System Components</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add component (e.g., Web Server, Database, API Gateway)"
                className="bg-[#151d2e] border-[#2a3548] text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    setComponents([...components, e.target.value]);
                    e.target.value = '';
                  }
                }}
              />
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {components.map((comp, idx) => (
                <Badge key={idx} className="bg-cyan-500/20 text-cyan-400">
                  {comp}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            onClick={analyzeThreats}
            disabled={analyzing}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            <Brain className="h-4 w-4 mr-2" />
            {analyzing ? 'Analyzing...' : 'Run STRIDE Analysis'}
          </Button>
        </CardContent>
      </Card>

      {threats.length > 0 && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="all">All Threats ({threats.length})</TabsTrigger>
            {STRIDE_CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label} ({threats.filter(t => t.category.toLowerCase() === cat.label.toLowerCase()).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4 space-y-3">
                {threats.map((threat, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">{threat.name}</h4>
                          <p className="text-xs text-slate-500 mb-2">{threat.component}</p>
                        </div>
                        <Badge className={
                          threat.risk === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                          threat.risk === 'High' ? 'bg-amber-500/20 text-amber-400' :
                          threat.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {threat.risk}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{threat.description}</p>
                      <div className="p-3 rounded bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-xs text-emerald-400 font-medium mb-1">Mitigation:</p>
                        <p className="text-xs text-slate-300">{threat.mitigation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {STRIDE_CATEGORIES.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm">{cat.label} Threats</CardTitle>
                  <p className="text-xs text-slate-400">{cat.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {threats.filter(t => t.category.toLowerCase() === cat.label.toLowerCase()).map((threat, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-4">
                        <h4 className="text-sm font-semibold text-white mb-2">{threat.name}</h4>
                        <p className="text-sm text-slate-400 mb-2">{threat.description}</p>
                        <div className="p-3 rounded bg-emerald-500/5 border border-emerald-500/20">
                          <p className="text-xs text-emerald-400 font-medium mb-1">Mitigation:</p>
                          <p className="text-xs text-slate-300">{threat.mitigation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}