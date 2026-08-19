import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RotateCcw, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function RecentQueries({ history, onReplay }) {
  const handleClear = () => {
    localStorage.removeItem('kb_search_history');
    window.location.reload();
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            Recent Queries
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-slate-500 hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {history.slice(0, 10).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.query}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">
                    {format(new Date(item.timestamp), 'MMM d, HH:mm')}
                  </span>
                  <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                    {item.resultCount} results
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onReplay(item.query)}
                className="ml-3 text-slate-400 hover:text-indigo-400"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-center text-slate-500 py-8">No search history yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}