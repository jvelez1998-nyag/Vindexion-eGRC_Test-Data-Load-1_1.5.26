import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Download, CheckCircle2, X } from "lucide-react";

export default function FeatureSelectionDialog({ open, onOpenChange, features, onExport }) {
  const [search, setSearch] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const filteredFeatures = features.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => {
      const exists = prev.find(f => f.name === feature.name);
      if (exists) {
        return prev.filter(f => f.name !== feature.name);
      } else {
        return [...prev, feature];
      }
    });
  };

  const selectAll = () => {
    setSelectedFeatures([...filteredFeatures]);
  };

  const clearAll = () => {
    setSelectedFeatures([]);
  };

  const handleExport = (format) => {
    if (selectedFeatures.length === 0) {
      return;
    }
    onExport(selectedFeatures, format);
    onOpenChange(false);
    setSelectedFeatures([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2332] border-[#2a3548] max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white">Select Features to Export</DialogTitle>
          <DialogDescription>
            Choose which features to include in your export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search features..."
                className="pl-10 bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>
            <Button onClick={selectAll} variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              Select All
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
              Clear All
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-white font-medium">
                {selectedFeatures.length} of {features.length} features selected
              </span>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-400">
              {Math.round((selectedFeatures.length / features.length) * 100)}%
            </Badge>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredFeatures.map((feature, idx) => {
                const isSelected = selectedFeatures.find(f => f.name === feature.name);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleFeature(feature)}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500/30' 
                        : 'bg-[#0f1623] border-[#2a3548] hover:border-indigo-500/20'
                    }`}
                  >
                    <Checkbox
                      checked={!!isSelected}
                      onCheckedChange={() => toggleFeature(feature)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">{feature.name}</h4>
                        <Badge className="text-xs bg-indigo-500/20 text-indigo-400">
                          {feature.module}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{feature.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400">
                          {feature.capabilities.length} capabilities
                        </Badge>
                        {feature.integrations?.length > 0 && (
                          <Badge className="text-[10px] bg-blue-500/20 text-blue-400">
                            {feature.integrations.length} integrations
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#2a3548]">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#2a3548] hover:bg-[#2a3548]"
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('pdf')}
                disabled={selectedFeatures.length === 0}
                variant="outline"
                className="border-rose-500/30 hover:bg-rose-500/10 text-rose-400"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={() => handleExport('word')}
                disabled={selectedFeatures.length === 0}
                variant="outline"
                className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
              >
                <Download className="h-4 w-4 mr-2" />
                Word
              </Button>
              <Button
                onClick={() => handleExport('excel')}
                disabled={selectedFeatures.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}