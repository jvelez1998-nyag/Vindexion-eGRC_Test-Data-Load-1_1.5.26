import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Eye, BookOpen, ExternalLink } from "lucide-react";

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

const categoryColors = {
  'access_control': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'data_protection': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'risk_management': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'incident_response': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'business_continuity': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'vendor_management': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'audit_assurance': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'governance': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'privacy': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'security_operations': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'compliance_monitoring': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'change_management': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'asset_management': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'hr_security': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function GuidanceCard({ guidance, onView, onEdit, onDelete }) {
  return (
    <Card 
      className="bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558] transition-all cursor-pointer group"
      onClick={() => onView(guidance)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10">
              <BookOpen className="h-4 w-4 text-indigo-400" />
            </div>
            <Badge className={`text-[10px] border ${frameworkColors[guidance.framework] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {guidance.framework}
            </Badge>
            {guidance.reference_id && (
              <span className="text-[10px] text-slate-500">{guidance.reference_id}</span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-[#2a3548] opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a2332] border-[#2a3548]">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(guidance); }} className="text-white hover:bg-[#2a3548]">
                <Eye className="h-4 w-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(guidance); }} className="text-white hover:bg-[#2a3548]">
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(guidance); }} className="text-rose-400 hover:bg-rose-500/10">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {guidance.title}
        </h3>

        {guidance.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{guidance.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge className={`text-[9px] border capitalize ${categoryColors[guidance.category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
            {guidance.category?.replace(/_/g, ' ')}
          </Badge>
          {guidance.status && guidance.status !== 'active' && (
            <Badge className="text-[9px] border bg-slate-500/10 text-slate-400 border-slate-500/20 capitalize">
              {guidance.status}
            </Badge>
          )}
        </div>

        {guidance.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {guidance.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#151d2e] text-slate-500 border border-[#2a3548]">
                {tag}
              </span>
            ))}
            {guidance.tags.length > 3 && (
              <span className="text-[9px] text-slate-500">+{guidance.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}