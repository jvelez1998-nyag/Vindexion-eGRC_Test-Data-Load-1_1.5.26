import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Lightbulb, BookOpen } from "lucide-react";
import AISearchEngine from "./AISearchEngine";
import AISummarization from "./AISummarization";
import ContextualSuggestions from "./ContextualSuggestions";
import KnowledgeArticleViewer from "./KnowledgeArticleViewer";

export default function GRCKnowledgeHub() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentModule] = useState("Knowledge Hub");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="search" className="space-y-6">
            <TabsList className="bg-[#1a2332] border border-[#2a3548]">
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                AI Search
              </TabsTrigger>
              <TabsTrigger value="summarize">
                <Sparkles className="h-4 w-4 mr-2" />
                Summarization
              </TabsTrigger>
              <TabsTrigger value="browse">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <AISearchEngine onArticleSelect={setSelectedArticle} />
            </TabsContent>

            <TabsContent value="summarize">
              <AISummarization />
            </TabsContent>

            <TabsContent value="browse">
              <div className="text-center py-12 text-slate-400">
                Browse feature coming soon - organize content by categories
              </div>
            </TabsContent>
          </Tabs>

          {selectedArticle && (
            <KnowledgeArticleViewer
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
            />
          )}
        </div>

        <div className="space-y-6">
          <ContextualSuggestions
            currentModule={currentModule}
            currentData={null}
            onSuggestionClick={setSelectedArticle}
          />
        </div>
      </div>
    </div>
  );
}