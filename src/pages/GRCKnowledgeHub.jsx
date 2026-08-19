import { Brain, BookOpen } from "lucide-react";
import GRCKnowledgeHub from "@/components/knowledge-hub/GRCKnowledgeHub";
import FloatingChatbot from "@/components/ai/FloatingChatbot";

export default function GRCKnowledgeHubPage() {
  return (
    <div className="min-h-screen bg-[#0f1623]">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-indigo-400">Vindexion eGRC<sup className="text-[8px]">™</sup></h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <Brain className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              GRC Knowledge Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">AI-powered knowledge search, summarization, and contextual recommendations</p>
          </div>
        </div>

        <GRCKnowledgeHub />
      </div>

      <FloatingChatbot context="guidance" />
    </div>
  );
}