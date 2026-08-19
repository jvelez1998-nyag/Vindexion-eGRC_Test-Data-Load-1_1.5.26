import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Brain, 
  Target, 
  CheckCircle2,
  Play,
  Clock,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Zap
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function IncidentStudyGuide() {
  const [selectedPath, setSelectedPath] = useState(null);

  const learningPaths = [
    {
      id: "fundamentals",
      title: "Incident Response Fundamentals",
      level: "Beginner",
      duration: "3 weeks",
      modules: 6,
      color: "from-blue-500 to-cyan-500",
      topics: [
        "Introduction to Incident Response",
        "NIST SP 800-61 Framework Overview",
        "Incident Categories and Severity",
        "Roles and Responsibilities",
        "IR Team Structure",
        "Essential Tools and Technologies"
      ]
    },
    {
      id: "lifecycle",
      title: "Incident Lifecycle Management",
      level: "Intermediate",
      duration: "4 weeks",
      modules: 8,
      color: "from-emerald-500 to-teal-500",
      topics: [
        "Preparation Phase Deep Dive",
        "Detection and Analysis Techniques",
        "Containment Strategies",
        "Eradication Methods",
        "Recovery Procedures",
        "Post-Incident Activities",
        "Lessons Learned Process",
        "Continuous Improvement"
      ]
    },
    {
      id: "advanced",
      title: "Advanced Incident Handling",
      level: "Advanced",
      duration: "5 weeks",
      modules: 10,
      color: "from-purple-500 to-pink-500",
      topics: [
        "Advanced Threat Hunting",
        "Forensic Analysis",
        "Malware Analysis Basics",
        "Network Traffic Analysis",
        "Memory Forensics",
        "Timeline Analysis",
        "Root Cause Analysis",
        "Attribution Techniques",
        "Advanced Containment",
        "Tabletop Exercises"
      ]
    },
    {
      id: "coordination",
      title: "Incident Coordination & Communication",
      level: "Intermediate",
      duration: "3 weeks",
      modules: 7,
      color: "from-amber-500 to-orange-500",
      topics: [
        "Stakeholder Communication",
        "Executive Briefings",
        "External Party Coordination",
        "Law Enforcement Liaison",
        "Media Relations",
        "Crisis Communication",
        "Documentation Best Practices"
      ]
    }
  ];

  const nistPhases = [
    {
      phase: "1. Preparation",
      description: "Establish incident response capability",
      keyActivities: [
        "Develop IR policies and procedures",
        "Build and train IR team",
        "Deploy detection tools (SIEM, IDS/IPS)",
        "Create incident response playbooks",
        "Establish communication channels",
        "Conduct regular training and drills"
      ],
      tips: [
        "Document everything - create runbooks for common scenarios",
        "Automate detection where possible",
        "Maintain updated contact lists and escalation paths",
        "Pre-position forensic tools and licenses"
      ],
      metrics: ["Team readiness", "Tool coverage", "Training completion"]
    },
    {
      phase: "2. Detection & Analysis",
      description: "Identify and validate security incidents",
      keyActivities: [
        "Monitor security alerts and logs",
        "Analyze indicators of compromise (IOCs)",
        "Validate and triage alerts",
        "Determine incident scope and impact",
        "Assign severity and priority",
        "Document initial findings"
      ],
      tips: [
        "Use MITRE ATT&CK for threat categorization",
        "Correlate data from multiple sources",
        "Don't dismiss anomalies - investigate thoroughly",
        "Preserve evidence from the start"
      ],
      metrics: ["Mean Time to Detect (MTTD)", "False positive rate", "Alert volume"]
    },
    {
      phase: "3. Containment",
      description: "Limit the impact and prevent spread",
      keyActivities: [
        "Implement short-term containment",
        "Make backup of affected systems",
        "Isolate compromised systems",
        "Block malicious IPs/domains",
        "Revoke compromised credentials",
        "Execute long-term containment"
      ],
      tips: [
        "Balance containment with business continuity",
        "Document all containment actions taken",
        "Consider attacker's potential awareness",
        "Have rollback plans ready"
      ],
      metrics: ["Mean Time to Contain (MTTC)", "Spread prevention rate"]
    },
    {
      phase: "4. Eradication",
      description: "Remove threat from the environment",
      keyActivities: [
        "Identify and remove malware",
        "Disable compromised accounts",
        "Patch vulnerabilities exploited",
        "Strengthen security controls",
        "Clean affected systems",
        "Verify threat removal"
      ],
      tips: [
        "Don't rush - ensure complete removal",
        "Check for persistence mechanisms",
        "Address root cause, not just symptoms",
        "Use trusted tools for verification"
      ],
      metrics: ["Eradication completeness", "Recurrence rate"]
    },
    {
      phase: "5. Recovery",
      description: "Restore systems to normal operations",
      keyActivities: [
        "Restore systems from clean backups",
        "Rebuild compromised systems",
        "Reset all passwords",
        "Verify system integrity",
        "Gradually restore services",
        "Monitor for signs of threat return"
      ],
      tips: [
        "Test restored systems thoroughly",
        "Implement enhanced monitoring",
        "Communicate recovery status to stakeholders",
        "Have rollback procedures ready"
      ],
      metrics: ["Mean Time to Recovery (MTTR)", "System availability"]
    },
    {
      phase: "6. Post-Incident Activity",
      description: "Learn and improve from the incident",
      keyActivities: [
        "Conduct post-mortem meeting",
        "Document lessons learned",
        "Update IR procedures",
        "Share IOCs with community",
        "Improve detection capabilities",
        "Update training materials"
      ],
      tips: [
        "Hold blameless post-mortems",
        "Focus on process improvements",
        "Share knowledge across teams",
        "Track action items to completion"
      ],
      metrics: ["Improvement actions completed", "Training updates"]
    }
  ];

  const deepDives = [
    {
      title: "Malware Analysis Essentials",
      duration: "120 min",
      description: "Learn to analyze malicious software safely",
      topics: ["Static Analysis", "Dynamic Analysis", "Behavioral Analysis", "Sandbox Usage"]
    },
    {
      title: "Network Forensics",
      duration: "90 min",
      description: "Investigate network-based attacks",
      topics: ["Packet Analysis", "Traffic Patterns", "Protocol Analysis", "Data Carving"]
    },
    {
      title: "Memory Forensics",
      duration: "100 min",
      description: "Extract evidence from system memory",
      topics: ["Memory Acquisition", "Process Analysis", "Network Connections", "Malware Detection"]
    },
    {
      title: "Log Analysis Mastery",
      duration: "75 min",
      description: "Master the art of log investigation",
      topics: ["Log Sources", "Correlation", "Timeline Creation", "Anomaly Detection"]
    },
    {
      title: "Ransomware Response",
      duration: "90 min",
      description: "Specialized response to ransomware",
      topics: ["Initial Response", "Isolation", "Decryption Options", "Recovery Strategies"]
    },
    {
      title: "Insider Threat Detection",
      duration: "80 min",
      description: "Identify and respond to insider threats",
      topics: ["User Behavior Analytics", "Data Exfiltration", "Investigation Techniques", "Legal Considerations"]
    }
  ];

  const incidentMetrics = [
    { month: 'Jan', detected: 45, contained: 42, resolved: 40 },
    { month: 'Feb', detected: 52, contained: 49, resolved: 47 },
    { month: 'Mar', detected: 38, contained: 37, resolved: 36 },
    { month: 'Apr', detected: 61, contained: 58, resolved: 55 },
    { month: 'May', detected: 43, contained: 41, resolved: 40 },
    { month: 'Jun', detected: 48, contained: 47, resolved: 46 }
  ];

  const responseTimeData = [
    { category: 'Critical', avgTime: 15 },
    { category: 'High', avgTime: 45 },
    { category: 'Medium', avgTime: 120 },
    { category: 'Low', avgTime: 240 }
  ];

  const incidentTypeData = [
    { name: 'Malware', value: 35 },
    { name: 'Phishing', value: 28 },
    { name: 'Unauthorized Access', value: 18 },
    { name: 'Data Breach', value: 12 },
    { name: 'Other', value: 7 }
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#3b82f6'];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="overview">
            <Target className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="nist">
            <Shield className="h-4 w-4 mr-2" />
            NIST Lifecycle
          </TabsTrigger>
          <TabsTrigger value="learning">
            <BookOpen className="h-4 w-4 mr-2" />
            Learning Paths
          </TabsTrigger>
          <TabsTrigger value="deepdive">
            <Brain className="h-4 w-4 mr-2" />
            Deep Dives
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Metrics & KPIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Incident Response Study Guide</CardTitle>
              <p className="text-sm text-slate-400 mt-2">
                Master incident response based on NIST SP 800-61 framework and industry best practices
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold text-white">4 Learning Paths</h3>
                  </div>
                  <p className="text-sm text-slate-400">From fundamentals to advanced techniques</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">6 NIST Phases</h3>
                  </div>
                  <p className="text-sm text-slate-400">Complete lifecycle management</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <h3 className="font-semibold text-white">6 Deep Dives</h3>
                  </div>
                  <p className="text-sm text-slate-400">Specialized technical topics</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Quick Start Guide</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-white font-medium">1. Start with NIST Lifecycle</p>
                      <p className="text-xs text-slate-400">Understand the 6 phases of incident response</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-white font-medium">2. Choose Your Learning Path</p>
                      <p className="text-xs text-slate-400">Select based on your experience level</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-white font-medium">3. Practice with Deep Dives</p>
                      <p className="text-xs text-slate-400">Build technical skills in specific areas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-white font-medium">4. Track Your Progress</p>
                      <p className="text-xs text-slate-400">Review metrics and improve response times</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nist" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">NIST SP 800-61 Incident Response Lifecycle</CardTitle>
              <p className="text-sm text-slate-400 mt-2">
                Comprehensive guide to each phase with actionable tips and best practices
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px]">
                <div className="space-y-4 pr-4">
                  {nistPhases.map((phase, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-bold text-indigo-400">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">{phase.phase}</h3>
                            <p className="text-sm text-slate-400">{phase.description}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <Activity className="h-4 w-4 text-emerald-400" />
                              Key Activities
                            </h4>
                            <ul className="space-y-1">
                              {phase.keyActivities.map((activity, i) => (
                                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                  <span className="text-emerald-400 mt-1">•</span>
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-amber-400" />
                              Pro Tips
                            </h4>
                            <div className="space-y-2">
                              {phase.tips.map((tip, i) => (
                                <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                  <p className="text-sm text-slate-300">{tip}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-400" />
                              Key Metrics
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {phase.metrics.map((metric, i) => (
                                <Badge key={i} className="bg-blue-500/10 text-blue-400">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Structured Learning Paths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {learningPaths.map((path) => (
                  <Card
                    key={path.id}
                    className="bg-[#151d2e] border-[#2a3548] hover:border-indigo-500/40 cursor-pointer transition-all"
                    onClick={() => setSelectedPath(path)}
                  >
                    <CardContent className="p-6">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${path.color}/20 w-fit mb-4`}>
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{path.title}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-indigo-500/20 text-indigo-400">{path.level}</Badge>
                        <Badge className="bg-slate-500/20 text-slate-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {path.duration}
                        </Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          {path.modules} modules
                        </Badge>
                      </div>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedPath && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">{selectedPath.title} - Course Outline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPath.topics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-indigo-400">{idx + 1}</span>
                        </div>
                        <span className="text-sm text-white">{topic}</span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-slate-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deepdive" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">Technical Deep Dive Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {deepDives.map((dive, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white mb-2">{dive.title}</h3>
                          <p className="text-sm text-slate-400 mb-3">{dive.description}</p>
                          <Badge className="bg-purple-500/20 text-purple-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {dive.duration}
                          </Badge>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-2">Topics Covered:</p>
                        <div className="flex flex-wrap gap-2">
                          {dive.topics.map((topic, i) => (
                            <Badge key={i} className="bg-slate-500/10 text-slate-400 text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Play className="h-4 w-4 mr-2" />
                        Start Deep Dive
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Incident Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={incidentMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                    <Line type="monotone" dataKey="detected" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="contained" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Average Response Time (minutes)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="category" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                    <Bar dataKey="avgTime" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Incident Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incidentTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {incidentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Mean Time to Detect (MTTD)</span>
                      <Badge className="bg-blue-500/10 text-blue-400">Target: &lt;1hr</Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">45 min</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Mean Time to Contain (MTTC)</span>
                      <Badge className="bg-emerald-500/10 text-emerald-400">Target: &lt;4hr</Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">3.2 hrs</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Mean Time to Recovery (MTTR)</span>
                      <Badge className="bg-amber-500/10 text-amber-400">Target: &lt;24hr</Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">18 hrs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}