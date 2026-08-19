import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Pencil, FileText, Shield, CheckCircle2, Lightbulb, Link2 } from "lucide-react";
import { format } from "date-fns";
import GuidanceAISummarize from "./GuidanceAISummarize";

const frameworkColors = {
  'SOX': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'SOC2': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'ISO27001': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'GDPR': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'PCI-DSS': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'HIPAA': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'NIST': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'COBIT': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'FFIEC': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'DORA': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'EU AI Act': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'CCPA': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'COSO': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Basel III': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

export default function GuidanceDetailDrawer({ open, onOpenChange, guidance, onEdit }) {
  if (!guidance) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 bg-[#0f1623] border-[#2a3548]">
        <SheetHeader className="p-6 border-b border-[#2a3548] bg-[#151d2e]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <BookOpen className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-[10px] border ${frameworkColors[guidance.framework] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    {guidance.framework}
                  </Badge>
                  {guidance.reference_id && (
                    <span className="text-xs text-slate-500">{guidance.reference_id}</span>
                  )}
                </div>
                <SheetTitle className="text-base text-white text-left">{guidance.title}</SheetTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GuidanceAISummarize guidance={guidance} />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { onOpenChange(false); onEdit(guidance); }}
                className="border-[#2a3548] hover:bg-[#2a3548] text-white"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Meta Info */}
            <div className="flex flex-wrap gap-2">
              <Badge className="text-[10px] border bg-slate-500/10 text-slate-400 border-slate-500/20 capitalize">
                {guidance.category?.replace(/_/g, ' ')}
              </Badge>
              <Badge className={`text-[10px] border ${
                guidance.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                guidance.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-slate-500/10 text-slate-400 border-slate-500/20'
              } capitalize`}>
                {guidance.status}
              </Badge>
            </div>

            {/* Description */}
            {guidance.description && (
              <div>
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Description
                </h4>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{guidance.description}</p>
              </div>
            )}

            <Separator className="bg-[#2a3548]" />

            {/* Requirements */}
            {guidance.requirements && (
              <div>
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Key Requirements
                </h4>
                <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{guidance.requirements}</p>
                </div>
              </div>
            )}

            {/* Implementation Tips */}
            {guidance.implementation_tips && (
              <div>
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Implementation Tips
                </h4>
                <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{guidance.implementation_tips}</p>
                </div>
              </div>
            )}

            {/* Evidence Examples */}
            {guidance.evidence_examples && (
              <div>
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  Evidence Examples
                </h4>
                <div className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{guidance.evidence_examples}</p>
                </div>
              </div>
            )}

            {/* Related Controls */}
            {guidance.related_controls?.length > 0 && (
              <div>
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5" />
                  Related Controls
                </h4>
                <div className="flex flex-wrap gap-2">
                  {guidance.related_controls.map((control, i) => (
                    <Badge key={i} className="bg-[#151d2e] text-white border border-[#2a3548]">
                      {control}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {guidance.tags?.length > 0 && (
              <div>
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {guidance.tags.map((tag, i) => (
                    <Badge key={i} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-[#2a3548]" />

            {/* Timestamps */}
            <div className="text-xs text-slate-500 space-y-1">
              {guidance.created_date && (
                <p>Created: {format(new Date(guidance.created_date), 'MMM d, yyyy h:mm a')}</p>
              )}
              {guidance.updated_date && (
                <p>Updated: {format(new Date(guidance.updated_date), 'MMM d, yyyy h:mm a')}</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}