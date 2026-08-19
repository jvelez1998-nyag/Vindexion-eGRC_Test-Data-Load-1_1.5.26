import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Loader2, HelpCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_QUESTIONS = [
  "What is CVSS scoring?",
  "Explain SOX compliance requirements",
  "What's the difference between inherent and residual risk?",
  "How do I conduct a risk assessment?",
  "What are the key GDPR requirements?",
  "Explain control testing procedures"
];

export default function AIContextualAssistant({ context = "general", contextData = {} }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (question) => {
    const userMessage = { role: "user", content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const contextInfo = contextData ? JSON.stringify(contextData, null, 2) : "";
      
      const prompt = `You are an expert GRC (Governance, Risk, and Compliance) consultant providing contextual assistance.

CONTEXT: ${context}
${contextInfo ? `RELEVANT DATA:\n${contextInfo}` : ''}

USER QUESTION: ${question}

Provide a clear, concise, and practical explanation:
1. Define any technical terms
2. Explain concepts in simple language
3. Provide relevant examples
4. Include practical steps or guidance when applicable
5. Reference industry standards or frameworks when relevant
6. Keep responses focused and under 200 words unless more detail is requested

Format your response in markdown for readability.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      const assistantMessage = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response");
      const errorMessage = { role: "assistant", content: "I apologize, but I encountered an error. Please try asking your question again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#2a3548]">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <Brain className="h-3 w-3 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">AI Assistant</h3>
            <p className="text-[9px] text-slate-500">Ask about GRC concepts, requirements, or best practices</p>
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-2">
            {messages.length === 0 ? (
              <div className="text-center py-6">
                <HelpCircle className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">Ask me anything about GRC</p>
                <div className="grid grid-cols-1 gap-1">
                  {QUICK_QUESTIONS.slice(0, 4).map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(q)}
                      disabled={loading}
                      className="border-[#2a3548] text-left justify-start h-auto py-2 text-[10px] text-slate-400 hover:text-white hover:bg-[#2a3548]"
                    >
                      <Sparkles className="h-2 w-2 mr-1.5 flex-shrink-0 text-indigo-400" />
                      <span className="line-clamp-1">{q}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-lg p-2 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-[#151d2e] border border-[#2a3548]'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown 
                          className="prose prose-xs prose-invert max-w-none"
                          components={{
                            p: ({ children }) => <p className="text-[10px] text-slate-300 mb-1 last:mb-0 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc ml-3 mb-1 space-y-0.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-3 mb-1 space-y-0.5">{children}</ol>,
                            li: ({ children }) => <li className="text-[10px] text-slate-300">{children}</li>,
                            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                            code: ({ inline, children }) => inline ? (
                              <code className="px-1 py-0.5 rounded bg-[#1a2332] text-indigo-400 text-[9px]">{children}</code>
                            ) : (
                              <code className="block px-2 py-1 rounded bg-[#1a2332] text-slate-300 text-[9px] my-1">{children}</code>
                            )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-[10px]">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-[#151d2e] border border-[#2a3548] rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                    <span className="text-[10px] text-slate-400">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && input.trim() && sendMessage(input)}
            placeholder="Ask a question..."
            className="bg-[#151d2e] border-[#2a3548] text-white placeholder:text-slate-500 text-xs h-8"
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            size="icon"
            className="bg-indigo-600 hover:bg-indigo-700 h-8 w-8"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}