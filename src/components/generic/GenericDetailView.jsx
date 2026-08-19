import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { format } from "date-fns";
import { Edit, Trash2, X } from "lucide-react";

export default function GenericDetailView({ 
  entity, 
  config,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) {
  if (!entity) return null;

  const renderValue = (field) => {
    const value = entity[field.key];
    if (!value) return field.emptyText || '-';

    switch (field.type) {
      case 'date':
        return format(new Date(value), field.format || 'MMM d, yyyy h:mm a');
      case 'badge':
        return (
          <Badge className={field.colorMap?.[value] || 'bg-slate-700 text-slate-300'}>
            {field.labelMap?.[value] || value}
          </Badge>
        );
      case 'array':
        return value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.map((item, idx) => (
              <Badge key={idx} className="bg-slate-700 text-slate-300 text-xs">{item}</Badge>
            ))}
          </div>
        ) : field.emptyText || 'None';
      case 'link':
        return <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{value}</a>;
      case 'multiline':
        return <p className="whitespace-pre-wrap">{value}</p>;
      default:
        return value;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl bg-[#1a2332] border-[#2a3548] text-white">
        <SheetHeader className="border-b border-[#2a3548] pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-white text-xl">{entity[config.titleKey]}</SheetTitle>
              {config.subtitleKey && (
                <p className="text-sm text-slate-400 mt-1">{entity[config.subtitleKey]}</p>
              )}
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button onClick={() => onEdit(entity)} size="sm" variant="outline" className="border-[#2a3548]">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button onClick={() => onDelete(entity)} size="sm" variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6">
            {config.sections?.map((section, sIdx) => (
              <div key={sIdx}>
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">{section.title}</h3>
                <div className="space-y-3">
                  {section.fields.map((field, fIdx) => (
                    <div key={fIdx} className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">{field.label}</div>
                      <div className="text-sm text-white">{renderValue(field)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}