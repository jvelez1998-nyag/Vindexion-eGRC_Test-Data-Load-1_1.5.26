import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, Sparkles, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIOnboardingAssistant({ vendorName, vendorType, criticality, currentPhase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hello! 👋 I'm your AI Onboarding Assistant. I'm here to help you successfully onboard **${vendorName}** (${vendorType}, ${criticality} criticality).\n\nI can help you with:\n- Understanding onboarding requirements\n- Completing assessment tasks\n- Gathering necessary documentation\n- Answering compliance questions\n- Providing best practices\n\nWhat would you like to know?`,
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const prompt = `You are a helpful AI vendor onboarding assistant. You're guiding the onboarding process for this vendor:

Vendor Name: ${vendorName}
Vendor Type: ${vendorType}
Criticality: ${criticality}
Current Phase: ${currentPhase || 'Initial Setup'}

Your role is to:
1. Answer questions about the onboarding process
2. Explain what documentation is needed and why
3. Guide users through assessment requirements
4. Provide best practices for vendor risk management
5. Clarify compliance and security requirements
6. Suggest next steps in the onboarding workflow

User Question: ${text}

Provide helpful, actionable guidance in a friendly, professional tone. Use markdown formatting for clarity.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });

      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response");
      const errorMessage = {
        role: "assistant",
        content: "I'm sorry, I encountered an issue. Please try asking again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What documents do I need?",
    "How long will onboarding take?",
    "What are the critical tasks?",
    "Help me with security assessment"
  ];

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-400" />
            AI Onboarding Assistant
          </CardTitle>
          <Badge className="bg-emerald-500/20 text-emerald-400">
            <Sparkles className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Messages */}
          <ScrollArea className="h-[400px] rounded-lg bg-[#0f1623] border border-[#2a3548] p-4" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 h-fit">
                      <Bot className="h-3 w-3 text-indigo-400" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-[#151d2e] border border-[#2a3548]'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown 
                        className="prose prose-sm prose-invert max-w-none text-xs"
                        components={{
                          p: ({children}) => <p className="text-slate-300 mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="text-slate-300">{children}</li>,
                          strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                          h3: ({children}) => <h3 className="text-white font-semibold text-sm mb-1 mt-2">{children}</h3>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-xs">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20">
                    <Bot className="h-3 w-3 text-indigo-400" />
                  </div>
                  <div className="bg-[#151d2e] border border-[#2a3548] rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                      <span className="text-xs text-slate-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="border-[#2a3548] hover:bg-[#2a3548] text-left h-auto py-2 justify-start text-xs"
                >
                  <HelpCircle className="h-3 w-3 mr-2 flex-shrink-0 text-indigo-400" />
                  <span className="text-slate-300 line-clamp-1">{prompt}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage(input)}
              placeholder="Ask me anything about onboarding..."
              className="bg-[#151d2e] border-[#2a3548] text-white placeholder:text-slate-500 text-sm"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              size="icon"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}