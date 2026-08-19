import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, User, Sparkles, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function GuidanceAIAssistant({ open, onOpenChange, guidance }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your GRC guidance assistant. Ask me anything about regulations, frameworks, or compliance requirements. I have access to your guidance library and can help explain complex topics."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestedQuestions = [
    "What are the key requirements for SOX 404 compliance?",
    "Explain the differences between SOC 2 Type I and Type II",
    "What controls are needed for GDPR data subject rights?",
    "How do I prepare for a PCI-DSS audit?"
  ];

  const handleSend = async (question = input) => {
    if (!question.trim()) return;

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const guidanceContext = guidance.map(g => ({
        title: g.title,
        framework: g.framework,
        category: g.category,
        reference_id: g.reference_id,
        description: g.description,
        requirements: g.requirements,
        implementation_tips: g.implementation_tips,
        evidence_examples: g.evidence_examples
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a GRC (Governance, Risk, and Compliance) expert assistant. Answer the user's question using the guidance library as your primary knowledge base. Be helpful, accurate, and cite specific guidance when relevant.

Guidance Library:
${JSON.stringify(guidanceContext, null, 2)}

Previous conversation:
${messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}

User Question: ${question}

Provide a clear, helpful answer. If the question relates to specific guidance in the library, reference it. Format your response with markdown for readability. Include practical recommendations where appropriate.`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            referenced_guidance: { 
              type: "array", 
              items: { type: "string" }
            },
            follow_up_suggestions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      const assistantMessage = {
        role: 'assistant',
        content: result.answer,
        references: result.referenced_guidance,
        suggestions: result.follow_up_suggestions
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your question. Please try again.' 
      }]);
    }
    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 bg-[#0f1623] border-[#2a3548] flex flex-col">
        <SheetHeader className="p-4 border-b border-[#2a3548] bg-[#151d2e]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
              <Bot className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <SheetTitle className="text-base text-white">GRC AI Assistant</SheetTitle>
              <p className="text-xs text-slate-500">{guidance.length} guidance docs in knowledge base</p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div key={idx} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="p-1.5 rounded-lg bg-violet-500/10 h-fit">
                    <Bot className="h-4 w-4 text-violet-400" />
                  </div>
                )}
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-xl px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-[#1a2332] border border-[#2a3548] text-slate-300'
                  }`}>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                  
                  {message.references?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-[10px] text-slate-500">Referenced:</span>
                      {message.references.map((ref, i) => (
                        <Badge key={i} className="text-[9px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                          <BookOpen className="h-2.5 w-2.5 mr-1" />
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {message.suggestions?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] text-slate-500">Follow-up questions:</span>
                      {message.suggestions.slice(0, 2).map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(suggestion)}
                          className="block text-left text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          → {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 h-fit">
                    <User className="h-4 w-4 text-indigo-400" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="p-1.5 rounded-lg bg-violet-500/10 h-fit">
                  <Bot className="h-4 w-4 text-violet-400" />
                </div>
                <div className="bg-[#1a2332] border border-[#2a3548] rounded-xl px-4 py-3">
                  <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Try asking:</p>
                <div className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="w-full text-left text-xs p-2.5 bg-[#1a2332] border border-[#2a3548] rounded-lg text-slate-400 hover:text-white hover:border-violet-500/30 transition-all"
                    >
                      <Sparkles className="h-3 w-3 inline mr-2 text-violet-400" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#2a3548] bg-[#151d2e]">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Ask about regulations, frameworks, or compliance..."
              className="bg-[#1a2332] border-[#2a3548] text-white placeholder:text-slate-500"
              disabled={loading}
            />
            <Button 
              onClick={() => handleSend()} 
              disabled={loading || !input.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}