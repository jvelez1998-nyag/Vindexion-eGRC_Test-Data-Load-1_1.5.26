import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

export default function GenericEntityCard({ 
  entity, 
  config,
  onEdit, 
  onDelete,
  onView
}) {
  const getFieldValue = (field) => {
    const value = entity[field.key];
    if (!value) return field.emptyText || '-';

    switch (field.type) {
      case 'date':
        return format(new Date(value), field.format || 'MMM d, yyyy');
      case 'badge':
        return (
          <Badge className={field.colorMap?.[value] || 'bg-slate-700 text-slate-300'}>
            {field.labelMap?.[value] || value}
          </Badge>
        );
      case 'array':
        return value.length > 0 ? value.join(', ') : field.emptyText || 'None';
      case 'number':
        return field.format ? field.format(value) : value;
      default:
        return value;
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] p-5 hover:border-indigo-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {config.badges?.map((badge, idx) => (
              <span key={idx}>{getFieldValue(badge)}</span>
            ))}
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">{entity[config.titleKey]}</h3>
          {config.subtitleKey && (
            <p className="text-slate-400 text-sm">{entity[config.subtitleKey]}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
            {onView && (
              <DropdownMenuItem onClick={() => onView(entity)} className="text-white hover:bg-[#2a3548]">
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(entity)} className="text-white hover:bg-[#2a3548]">
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(entity)} className="text-rose-400 hover:bg-rose-500/10">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {config.fields?.map((field, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{field.label}:</span>
            <span className="text-slate-300">{getFieldValue(field)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}