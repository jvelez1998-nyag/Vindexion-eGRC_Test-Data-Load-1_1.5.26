import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search as SearchIcon, Brain, Loader2, Sparkles,
  TrendingUp, AlertTriangle, Target, Shield,
  Lightbulb, CheckCircle2, FileText, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function ClientDeepDive({ client, allClients, risks, audits, incidents, findings }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [deepDive, setDeepDive] = useState(null);

  const runDeepDive = async () => {
    setAnalyzing(true);
    try {
      const linkedRisks = risks.filter(r => client.linked_risks?.includes(r.id));
      const linkedAudits = audits.filter(a => client.linked_audits?.includes(a.id));
      const linkedIncidents = incidents.filter(i => client.linked_incidents?.includes(i.id));
      
      const prompt = `As a senior GRC consultant, conduct an exhaustive deep-dive analysis of client "${client.name}".

CLIENT COMPREHENSIVE DATA:
${JSON.stringify({
  profile: {
    name: client.name,
    industry: client.industry,
    type: client.client_type,
    status: client.status
  },
  scores: {
    risk: client.risk_score,
    compliance: client.compliance_score,
    control_maturity: client.control_maturity,
    security_posture: client.security_posture
  },
  metrics: {
    incidents: client.incident_count,
    findings: client.finding_count,
    critical_issues: client.critical_issues
  },
  frameworks: client.regulatory_frameworks,
  compliance_gaps: client.compliance_gaps
}, null, 2)}

LINKED ENTITIES:
- Risks: ${linkedRisks.length} (${linkedRisks.map(r => r.title).join(', ')})
- Audits: ${linkedAudits.length} (${linkedAudits.map(a => a.title).join(', ')})
- Incidents: ${linkedIncidents.length} (${linkedIncidents.map(i => i.title).join(', ')})

PORTFOLIO CONTEXT:
- Total Clients: ${allClients.length}
- Industry Peers: ${allClients.filter(c => c.industry === client.industry).length}

PERFORM EXHAUSTIVE DEEP-DIVE:

1. **360-Degree Risk Analysis**
   - Comprehensive risk breakdown
   - Root cause analysis
   - Risk interdependencies
   - Cascading risk scenarios
   - Risk velocity and trajectory

2. **Compliance Deep Assessment**
   - Framework-by-framework analysis
   - Compliance maturity evaluation
   - Gap impact assessment
   - Remediation complexity analysis
   - Compliance sustainability

3. **Control Environment Investigation**
   - Control design effectiveness
   - Control implementation gaps
   - Control testing adequacy
   - Control optimization opportunities
   - Automation potential

4. **Security Posture Forensics**
   - Security architecture assessment
   - Vulnerability landscape
   - Threat exposure analysis
   - Security investment ROI
   - Incident readiness

5. **Incident Pattern Analysis**
   - Incident clustering and patterns
   - Root cause commonalities
   - Preventive control failures
   - Lessons learned synthesis
   - Recurrence prediction

6. **Financial Impact Assessment**
   - Risk cost analysis
   - Compliance investment needs
   - Incident financial impact
   - ROI on control improvements
   - Budget optimization

7. **Strategic Roadmap**
   - 30-60-90 day action plan
   - 6-month strategic initiatives
   - 12-month transformation vision
   - Resource allocation strategy
   - Success metrics and KPIs

8. **Stakeholder Engagement Strategy**
   - Key stakeholder mapping
   - Communication cadence
   - Escalation protocols
   - Executive briefing materials
   - Change management approach

Return comprehensive markdown analysis with actionable intelligence.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setDeepDive(response);
      toast.success("Deep dive analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete deep dive");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border-cyan-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <SearchIcon className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  AI-Powered Deep Dive Analysis
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px] border-cyan-500/30">COMPREHENSIVE</Badge>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  360° forensic analysis with external threat intelligence
                </p>
              </div>
            </div>
            <Button 
              onClick={runDeepDive}
              disabled={analyzing}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Run Deep Dive
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!deepDive ? (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-12 text-center">
            <SearchIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Client Analysis</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Run a deep dive to get exhaustive insights including 360° risk analysis, 
              compliance forensics, control investigation, security assessment, incident patterns, 
              financial impact, strategic roadmap, and stakeholder engagement strategy.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                Deep Dive Intelligence Report
              </CardTitle>
              <Button size="sm" variant="outline" className="border-[#2a3548] text-slate-400">
                <FileText className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[700px]">
              <div className="pr-4">
                <ReactMarkdown 
                  className="prose prose-sm prose-invert max-w-none"
                  components={{
                    h1: ({children}) => (
                      <h1 className="text-xl font-bold text-white mb-4 mt-8 first:mt-0 pb-3 border-b-2 border-cyan-500/30">
                        {children}
                      </h1>
                    ),
                    h2: ({children}) => (
                      <h2 className="text-lg font-semibold text-white mb-3 mt-6 flex items-center gap-2">
                        <div className="w-1 h-5 bg-cyan-500 rounded" />
                        {children}
                      </h2>
                    ),
                    h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed text-sm">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-cyan-500 pl-4 my-4 text-cyan-300 italic bg-cyan-500/5 py-3 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    table: ({children}) => (
                      <table className="w-full border-collapse border border-[#2a3548] my-4">
                        {children}
                      </table>
                    ),
                    th: ({children}) => (
                      <th className="border border-[#2a3548] px-3 py-2 bg-[#151d2e] text-white text-left text-sm">
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td className="border border-[#2a3548] px-3 py-2 text-slate-300 text-sm">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {deepDive}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}