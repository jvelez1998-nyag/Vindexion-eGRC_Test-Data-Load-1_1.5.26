import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const contextConfigs = {
  risks: {
    title: "Risk Management Assistant",
    greeting: "Hi there! 👋 I'm here to help you with risk assessments, mitigation strategies, and risk management best practices. What would you like to know?",
    color: "from-rose-500/20 to-orange-500/20 border-rose-500/30",
    iconColor: "text-rose-400",
    prompts: [
      "How do I assess inherent vs residual risk?",
      "What's a good risk mitigation strategy?",
      "Help me prioritize my top risks",
      "Best practices for risk treatment"
    ]
  },
  controls: {
    title: "Controls Assistant",
    greeting: "Hello! 👋 I'm your controls expert. I can help with control design, effectiveness testing, and implementation guidance. How can I assist you?",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    iconColor: "text-blue-400",
    prompts: [
      "How do I test control effectiveness?",
      "What makes a strong preventive control?",
      "Help me design access controls",
      "Best practices for control documentation"
    ]
  },
  compliance: {
    title: "Compliance Assistant",
    greeting: "Welcome! 👋 I'm here to help with compliance requirements, frameworks, and regulatory guidance. What can I help you with today?",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    iconColor: "text-emerald-400",
    prompts: [
      "What evidence do I need for SOX compliance?",
      "Help me understand GDPR requirements",
      "How to prepare for a compliance audit?",
      "What are ISO 27001 key controls?"
    ]
  },
  incidents: {
    title: "Incident Response Assistant",
    greeting: "Hi! 👋 I'm your incident response helper. I can guide you through incident handling, root cause analysis, and response procedures. How can I help?",
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
    iconColor: "text-amber-400",
    prompts: [
      "What are the steps for incident response?",
      "How do I conduct root cause analysis?",
      "Help me write an incident report",
      "Best practices for containment"
    ]
  },
  audits: {
    title: "Audit Assistant",
    greeting: "Hello! 👋 I'm here to help with audit planning, execution, and reporting. What audit-related questions do you have?",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    iconColor: "text-purple-400",
    prompts: [
      "How do I plan an effective audit?",
      "What evidence should I collect?",
      "Help me write audit findings",
      "Best practices for audit sampling"
    ]
  },
  guidance: {
    title: "Guidance Assistant",
    greeting: "Welcome! 👋 I'm your regulatory guidance expert. I can help you understand requirements and implementation best practices. What would you like to explore?",
    color: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
    iconColor: "text-indigo-400",
    prompts: [
      "Explain this regulation in simple terms",
      "What controls address this requirement?",
      "Help me implement this guidance",
      "Show me practical examples"
    ]
  },
  clients: {
    title: "Client Management Assistant",
    greeting: "Hi there! 👋 I'm here to help with client assessments, scorecards, and relationship management. How can I assist you?",
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
    iconColor: "text-cyan-400",
    prompts: [
      "How do I assess client risk?",
      "What should I include in a scorecard?",
      "Help me analyze client compliance",
      "Best practices for client reviews"
    ]
  },
  vendors: {
    title: "Vendor Management Assistant",
    greeting: "Hello! 👋 I'm your vendor risk expert. I can help with vendor assessments, audits, security scoring, and compliance management. What do you need?",
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    iconColor: "text-blue-400",
    prompts: [
      "How do I assess vendor security risk?",
      "What should I include in a vendor audit?",
      "Help me evaluate vendor compliance",
      "Best practices for vendor reviews"
    ]
  },
  privacy: {
    title: "Privacy Compliance Assistant",
    greeting: "Welcome! 👋 I'm your privacy law expert. I can help with GDPR, CCPA, DPIAs, data subject rights, and privacy compliance. How can I assist?",
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
    iconColor: "text-purple-400",
    prompts: [
      "How do I conduct a DPIA?",
      "What are GDPR data subject rights?",
      "Help me with CCPA compliance",
      "Best practices for consent management"
    ]
  }
  };

export default function FloatingChatbot({ context, contextData = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const config = contextConfigs[context] || contextConfigs.risks;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: config.greeting,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, config.greeting, messages.length]);

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
      const contextInfo = contextData ? JSON.stringify(contextData, null, 2) : "No specific context data available.";

      const prompt = `You are a friendly, welcoming, and expert GRC assistant specializing in ${context}.

USER'S CURRENT CONTEXT:
${contextInfo}

USER QUESTION: ${text}

INSTRUCTIONS:
1. Be warm, friendly, and conversational in your tone
2. Provide clear, actionable, and practical advice
3. Reference the user's context when relevant
4. Use simple language and avoid jargon unless necessary
5. Break down complex topics into easy-to-understand steps
6. Offer examples and templates when helpful
7. Be encouraging and supportive
8. Format your response using markdown for readability

Remember: You're not just providing information, you're a helpful colleague who genuinely wants to help them succeed.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

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
        content: "Oops! I ran into a technical hiccup. 😅 Could you try asking that again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-50 w-[calc(100vw-16px)] sm:w-96 max-h-[500px] sm:max-h-[600px] flex flex-col"
          >
            <Card className="bg-[#1a2332] border-[#2a3548] flex flex-col h-full shadow-2xl">
              {/* Header */}
              <div className={`p-4 border-b border-[#2a3548] bg-gradient-to-r ${config.color} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#1a2332]/50">
                    <Bot className={`h-4 w-4 ${config.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{config.title}</h3>
                    <p className="text-[10px] text-slate-400">Always here to help! 😊</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-7 w-7 text-slate-400 hover:text-white"
                  >
                    {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 text-slate-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'assistant' && (
                            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${config.color} h-fit`}>
                              <Bot className={`h-3 w-3 ${config.iconColor}`} />
                            </div>
                          )}
                          <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                            msg.role === 'user' 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-[#151d2e] border border-[#2a3548]'
                          }`}>
                            {msg.role === 'assistant' ? (
                              <ReactMarkdown 
                                className="prose prose-sm prose-invert max-w-none"
                                components={{
                                  p: ({children}) => <p className="text-slate-300 mb-2 last:mb-0 leading-relaxed text-xs">{children}</p>,
                                  ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                                  ol: ({children}) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                                  li: ({children}) => <li className="text-slate-300 text-xs">{children}</li>,
                                  strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                                  code: ({inline, children}) => inline ? (
                                    <code className="px-1 py-0.5 rounded bg-[#1a2332] text-indigo-400 text-[10px]">{children}</code>
                                  ) : (
                                    <code className="block px-2 py-1 rounded bg-[#1a2332] text-slate-300 text-[10px] my-1">{children}</code>
                                  ),
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
                          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${config.color}`}>
                            <Bot className={`h-3 w-3 ${config.iconColor}`} />
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
                  {messages.length === 1 && (
                    <div className="px-4 pb-3">
                      <p className="text-[10px] text-slate-500 mb-2">Quick questions:</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {config.prompts.slice(0, 3).map((prompt, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            onClick={() => sendMessage(prompt)}
                            className="border-[#2a3548] hover:bg-[#2a3548] text-left h-auto py-2 px-3 justify-start text-xs"
                            disabled={loading}
                          >
                            <Sparkles className="h-2.5 w-2.5 mr-2 text-indigo-400 flex-shrink-0" />
                            <span className="text-[10px] text-slate-300 line-clamp-1">{prompt}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 border-t border-[#2a3548]">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage(input)}
                        placeholder="Ask me anything..."
                        className="bg-[#151d2e] border-[#2a3548] text-white placeholder:text-slate-500 text-xs h-9"
                        disabled={loading}
                      />
                      <Button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        size="icon"
                        className="bg-indigo-600 hover:bg-indigo-700 h-9 w-9"
                      >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 sm:bottom-6 right-2 sm:right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl bg-gradient-to-r ${config.color} hover:scale-110 transition-transform`}
        >
          <Bot className={`h-5 w-5 sm:h-6 sm:w-6 ${config.iconColor}`} />
        </Button>
      </motion.div>
    </>
  );
}