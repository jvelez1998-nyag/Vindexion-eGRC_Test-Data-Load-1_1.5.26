import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Loader2, Users, MessageSquare, 
  Lightbulb, TrendingUp, AlertTriangle, Zap 
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const SCENARIO_TYPES = [
  { id: 'onboarding', name: 'Onboarding Kickoff', icon: Users, color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20' },
  { id: 'quarterly', name: 'Quarterly Review', icon: TrendingUp, color: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20' },
  { id: 'incident', name: 'Incident Response', icon: AlertTriangle, color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20' },
  { id: 'escalation', name: 'Risk Escalation', icon: Zap, color: 'from-rose-500/10 to-red-500/10 border-rose-500/20' },
  { id: 'improvement', name: 'Improvement Planning', icon: Lightbulb, color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20' }
];

export default function ClientEngagementScenarios({ client }) {
  const [generating, setGenerating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('onboarding');
  const [scenario, setScenario] = useState(null);

  const generateScenario = async () => {
    setGenerating(true);
    try {
      const scenarioPrompts = {
        onboarding: `Create a detailed onboarding engagement scenario for new client "${client.name}".

CLIENT INFO:
- Industry: ${client.industry}
- Type: ${client.client_type}
- Risk Level: ${client.risk_level}

Provide:
1. **Meeting Agenda** - Structured agenda for kickoff meeting
2. **Key Discussion Points** - Critical topics to cover
3. **Stakeholder Mapping** - Who should attend
4. **Initial Deliverables** - What to provide in first 30 days
5. **Success Criteria** - How to measure successful onboarding
6. **Conversation Starters** - Ice breakers and rapport building
7. **Common Objections** - How to handle concerns
8. **Next Steps** - Clear action items and timeline`,

        quarterly: `Create a quarterly business review scenario for client "${client.name}".

CLIENT METRICS:
- Risk Score: ${client.risk_score}
- Compliance: ${client.compliance_score}
- Incidents: ${client.incident_count}
- Findings: ${client.finding_count}

Provide:
1. **Review Agenda** - Structured QBR agenda
2. **Performance Highlights** - Wins to celebrate
3. **Areas of Concern** - Issues to address
4. **Trend Analysis** - Performance over time
5. **Recommendations** - Actionable next steps
6. **Discussion Guide** - Questions to ask
7. **Value Demonstration** - ROI and benefits shown
8. **Renewal Strategy** - Strengthening the relationship`,

        incident: `Create an incident response engagement scenario for client "${client.name}".

Recent incidents: ${client.incident_count}
Critical issues: ${client.critical_issues}

Provide:
1. **Initial Response** - First 24 hours communication
2. **Stakeholder Communication** - Who to notify and how
3. **Investigation Approach** - Root cause analysis plan
4. **Remediation Discussion** - How to present solutions
5. **Prevention Planning** - Long-term improvements
6. **Confidence Restoration** - Rebuilding trust
7. **Documentation Approach** - Record keeping
8. **Follow-up Strategy** - Post-incident engagement`,

        escalation: `Create a risk escalation engagement scenario for client "${client.name}".

Risk Level: ${client.risk_level}
Risk Score: ${client.risk_score}

Provide:
1. **Escalation Trigger** - When and why to escalate
2. **Escalation Path** - Who needs to be involved
3. **Communication Strategy** - How to deliver bad news
4. **Solution Presentation** - Proposed remediation
5. **Timeline Discussion** - Urgency and deadlines
6. **Resource Allocation** - What's needed
7. **Executive Briefing** - C-level talking points
8. **Crisis Management** - If situation is critical`,

        improvement: `Create an improvement planning engagement scenario for client "${client.name}".

Current Scores:
- Compliance: ${client.compliance_score}
- Control Maturity: ${client.control_maturity}
- Security: ${client.security_posture}

Provide:
1. **Current State Assessment** - Where we are today
2. **Target State Vision** - Where we want to be
3. **Gap Analysis** - What's missing
4. **Improvement Roadmap** - Phased approach
5. **Quick Wins** - Early successes (30 days)
6. **Major Initiatives** - Long-term projects
7. **Resource Planning** - What's needed
8. **Success Metrics** - How to measure progress`
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: scenarioPrompts[selectedScenario],
        add_context_from_internet: false
      });

      setScenario(response);
      toast.success("Scenario generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate scenario");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">AI Engagement Scenarios</h3>
              <p className="text-xs text-slate-400">Simulated client interactions and meeting guides</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SCENARIO_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all bg-gradient-to-br ${type.color} ${
                selectedScenario === type.id ? 'ring-2 ring-purple-500' : 'hover:scale-[1.02]'
              }`}
              onClick={() => setSelectedScenario(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#1a2332]/50">
                    <Icon className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{type.name}</h4>
                  </div>
                  {selectedScenario === type.id && (
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button 
        onClick={generateScenario}
        disabled={generating}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Scenario...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            Generate AI Scenario
          </>
        )}
      </Button>

      {scenario && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white">
              {SCENARIO_TYPES.find(t => t.id === selectedScenario)?.name} Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="pr-4">
                <ReactMarkdown 
                  className="prose prose-sm prose-invert max-w-none"
                  components={{
                    h1: ({children}) => <h1 className="text-lg font-bold text-white mb-3 mt-4 first:mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold text-white mb-2 mt-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-medium text-white mb-2 mt-2">{children}</h3>,
                    p: ({children}) => <p className="text-slate-300 mb-2 text-sm leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                  }}
                >
                  {scenario}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}