import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { enrichEntity } from "./DataEnrichmentEngine";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EnrichmentSuggestionsPanel from "./EnrichmentSuggestionsPanel";

export default function AutoEnrichmentButton({ entityType, entity, relatedData, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEnrich = async () => {
    setLoading(true);
    try {
      const result = await enrichEntity(entityType, entity, relatedData);
      
      if (result.hasEnrichments) {
        setEnrichmentData(result);
        setDialogOpen(true);
      } else {
        toast.info("No enrichment opportunities found for this item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Enrichment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion) => {
    if (onUpdate) {
      const updates = { [suggestion.field]: suggestion.suggested_value };
      onUpdate(entity.id, updates);
      toast.success(`Applied: ${suggestion.field.replace(/_/g, ' ')}`);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleEnrich}
        disabled={loading}
        className="border-purple-500/30 hover:bg-purple-500/10"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        AI Enrich
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#1a2332] border-[#2a3548]">
          <DialogHeader>
            <DialogTitle className="text-white">AI Enrichment Suggestions</DialogTitle>
          </DialogHeader>
          {enrichmentData && (
            <EnrichmentSuggestionsPanel
              suggestions={enrichmentData.suggestions}
              onApply={handleApplySuggestion}
              onDismiss={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}