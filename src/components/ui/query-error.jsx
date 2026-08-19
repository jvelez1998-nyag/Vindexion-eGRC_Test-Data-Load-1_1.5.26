import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function QueryError({ error, retry, entityName = "data" }) {
  return (
    <Card className="bg-rose-500/10 border-rose-500/30">
      <CardContent className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/20 mb-4">
          <AlertTriangle className="h-6 w-6 text-rose-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load {entityName}</h3>
        <p className="text-sm text-slate-400 mb-4">
          {error?.message || "An error occurred while fetching data"}
        </p>
        {retry && (
          <Button 
            onClick={retry}
            variant="outline"
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}