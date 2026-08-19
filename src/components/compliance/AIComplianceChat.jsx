import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Send, Loader2, Sparkles, FileText, AlertTriangle, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIComplianceChat({ compliance, controls, risks }) {
  const [aiProvider, setAiProvider] = useState("base44");
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 **Welcome to your AI Compliance Assistant!**\n\nI'm here to help you navigate the complex world of compliance with ease. Here's what I can do:\n\n🎯 **Smart Analysis**\n- Identify compliance gaps automatically\n- Analyze risk exposure across frameworks\n- Recommend optimal controls\n\n📊 **Strategic Guidance**\n- Implementation roadmaps\n- Resource allocation advice\n- Regulatory change impact\n\n✨ **Instant Answers**\n- Framework requirements\n- Best practices\n- Evidence examples\n\nWhat compliance challenge can I help you solve today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  const scrollRef = useRef(null);

  const quickPrompts = [
    "🔍 Analyze my top 5 compliance gaps",
    "🛡️ Recommend controls for GDPR Article 32",
    "📋 Create SOC 2 implementation roadmap",
    "⚠️ What are my highest compliance risks?",
    "✅ Generate compliance action plan",
    "📊 Compare my compliance vs industry benchmarks"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationContext(prev => [...prev, { role: 'user', content: text }]);
    setInput("");
    setLoading(true);

    try {
      // Build rich context
      const complianceByFramework = compliance.reduce((acc, c) => {
        if (!acc[c.framework]) acc[c.framework] = { total: 0, implemented: 0, gaps: [] };
        acc[c.framework].total++;
        if (c.status === 'implemented' || c.status === 'verified') acc[c.framework].implemented++;
        if (c.status === 'not_started' || c.status === 'non_compliant') {
          acc[c.framework].gaps.push(c.requirement);
        }
        return acc;
      }, {});

      const context = `You are an expert GRC compliance consultant with deep knowledge of regulations, frameworks, and best practices.

CURRENT COMPLIANCE STATE:
━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **Overall Metrics**
- Total Requirements: ${compliance.length}
- Compliance Rate: ${Math.round((compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length / compliance.length) * 100)}%
- Implemented/Verified: ${compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length}
- In Progress: ${compliance.filter(c => c.status === 'in_progress').length}
- Not Started: ${compliance.filter(c => c.status === 'not_started').length}
- Non-Compliant: ${compliance.filter(c => c.status === 'non_compliant').length}

🏢 **By Framework**
${Object.entries(complianceByFramework).map(([fw, data]) => 
  `- ${fw}: ${data.implemented}/${data.total} (${Math.round((data.implemented/data.total)*100)}%)`
).join('\n')}

🛡️ **Controls & Risks**
- Active Controls: ${controls.length}
- Effective Controls: ${controls.filter(c => c.status === 'effective').length}
- Identified Risks: ${risks.length}
- High/Critical Risks: ${risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 12).length}

💬 **Conversation History**
${conversationContext.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━

USER QUESTION: ${text}

RESPONSE GUIDELINES:
✓ Provide specific, actionable guidance tailored to their data
✓ Reference actual metrics and frameworks from their environment
✓ Use clear headings, bullet points, and structured formatting
✓ Include practical next steps with timelines when relevant
✓ Explain technical terms in simple language
✓ Cite specific requirements or standards when applicable
✓ Be encouraging and solution-focused
✓ Use emojis sparingly for visual clarity
✓ Keep responses comprehensive but scannable

Format your response in well-structured markdown.`;

// All AI providers use Base44's LLM backend which supports multiple models
const response = await base44.integrations.Core.InvokeLLM({
  prompt: context,
  add_context_from_internet: false
});

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationContext(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get AI response");
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const clearChat = () => {
    setMessages([messages[0]]);
    setConversationContext([]);
    toast.success("Chat cleared");
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] h-[500px] sm:h-[600px] lg:h-[700px] flex flex-col">
      <CardHeader className="border-b border-[#2a3548] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <span className="text-white truncate block">AI Compliance Assistant</span>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-normal mt-0.5 hidden sm:block">Powered by advanced AI • Real-time insights</p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[8px] sm:text-[9px] hidden sm:inline-flex">
              {aiProvider === "chatgpt" ? "ChatGPT-4" : aiProvider === "claude" ? "Claude 3.5" : "Base44 AI"}
            </Badge>
            <Select value={aiProvider} onValueChange={setAiProvider}>
              <SelectTrigger className="h-6 w-24 sm:h-7 sm:w-36 text-[10px] sm:text-xs bg-[#0f1623] border-[#2a3548]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="base44" className="text-[10px] sm:text-xs">Base44 AI</SelectItem>
                <SelectItem value="chatgpt" className="text-[10px] sm:text-xs">ChatGPT-4</SelectItem>
                <SelectItem value="claude" className="text-[10px] sm:text-xs">Claude 3.5 Sonnet</SelectItem>
              </SelectContent>
            </Select>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] sm:text-[9px]">
              {compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length}/{compliance.length} <span className="hidden sm:inline">Compliant</span>
            </Badge>
            {messages.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearChat}
                className="h-6 sm:h-7 text-[10px] sm:text-xs text-slate-400 hover:text-white px-2 sm:px-3"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-3 sm:p-6 bg-gradient-to-b from-[#151d2e]/30 to-transparent" ref={scrollRef}>
        <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              {msg.role === 'assistant' && (
                <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 h-fit shadow-lg shadow-indigo-500/10 flex-shrink-0">
                  <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[80%] rounded-xl p-3 sm:p-4 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg' 
                  : 'bg-[#1a2332] border border-[#2a3548] shadow-lg'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="relative group">
                    <ReactMarkdown 
                      className="prose prose-sm prose-invert max-w-none"
                      components={{
                        p: ({children}) => <p className="text-slate-300 mb-3 last:mb-0 leading-relaxed text-sm">{children}</p>,
                        ul: ({children}) => <ul className="list-none ml-0 mb-3 space-y-2">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal ml-5 mb-3 space-y-2">{children}</ol>,
                        li: ({children}) => (
                          <li className="text-slate-300 flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                        h1: ({children}) => <h1 className="text-xl font-bold text-white mb-3 pb-2 border-b border-[#2a3548]">{children}</h1>,
                        h2: ({children}) => <h2 className="text-lg font-bold text-white mb-2 mt-4 first:mt-0 flex items-center gap-2">{children}</h2>,
                        h3: ({children}) => <h3 className="text-base font-semibold text-cyan-400 mb-2 mt-3">{children}</h3>,
                        code: ({inline, children}) => inline ? (
                          <code className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono border border-indigo-500/30">{children}</code>
                        ) : (
                          <code className="block px-4 py-3 rounded-lg bg-[#151d2e] text-slate-300 my-3 border border-[#2a3548] font-mono text-xs">{children}</code>
                        ),
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-3 bg-indigo-500/5 rounded-r">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyMessage(msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-7 w-7 p-0 hover:bg-[#2a3548]"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
                <div className="mt-2 text-[9px] text-slate-500">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <Brain className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="bg-[#151d2e] border border-[#2a3548] rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span className="text-sm text-slate-400">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {messages.length === 1 && (
        <div className="px-3 sm:px-6 pb-3 sm:pb-4">
          <p className="text-[10px] sm:text-xs text-slate-500 mb-2 sm:mb-3 font-medium">💡 Popular questions:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickPrompts.slice(0, window.innerWidth < 640 ? 4 : 6).map((prompt, idx) => (
              <Button
                key={idx}
                variant="outline"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="border-[#2a3548] hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 hover:border-indigo-500/30 text-left h-auto py-2 sm:py-3 px-3 sm:px-4 justify-start text-[10px] sm:text-xs transition-all"
              >
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-2 text-indigo-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium line-clamp-1">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <CardContent className="p-3 sm:p-4 border-t border-[#2a3548] bg-[#151d2e]">
        <div className="flex gap-2 sm:gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && input.trim() && sendMessage(input)}
            placeholder="Ask about compliance..."
            className="bg-[#1a2332] border-[#2a3548] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-9 sm:h-11 text-xs sm:text-sm"
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-9 sm:h-11 px-3 sm:px-6 shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[8px] sm:text-[9px] text-slate-500">
          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-indigo-400" />
          <span className="hidden sm:inline">Tip: Ask specific questions about frameworks, requirements, or implementation guidance</span>
          <span className="sm:hidden">Ask about frameworks, requirements, or guidance</span>
        </div>
      </CardContent>
    </Card>
  );
}