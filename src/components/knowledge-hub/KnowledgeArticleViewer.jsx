import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, BookOpen, ExternalLink, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function KnowledgeArticleViewer({ article, onClose }) {
  if (!article) return null;

  const shareArticle = () => {
    const text = `${article.title}\n\n${article.description}`;
    navigator.clipboard.writeText(text);
    toast.success("Article details copied");
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <BookOpen className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-1" />
            <div>
              <CardTitle className="text-lg">{article.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {article.module && (
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                    {article.module}
                  </Badge>
                )}
                {article.type && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {article.type}
                  </Badge>
                )}
                {article.category && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {article.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={shareArticle} size="sm" variant="outline" className="border-[#2a3548]">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button onClick={onClose} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4 pr-4">
            {article.description && (
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{article.description}</ReactMarkdown>
              </div>
            )}

            {article.relevance_score && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Relevance:</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {article.relevance_score}% match
                </Badge>
              </div>
            )}

            {article.relationship && (
              <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
                <p className="text-xs text-blue-300">
                  <strong>Related by:</strong> {article.relationship}
                </p>
              </div>
            )}

            {article.implementation && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Implementation</h4>
                <p className="text-sm text-slate-300">{article.implementation}</p>
              </div>
            )}

            {article.keywords && article.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {article.keywords.map((keyword, idx) => (
                    <Badge key={idx} className="text-xs bg-slate-500/20 text-slate-400 border-slate-500/30">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}