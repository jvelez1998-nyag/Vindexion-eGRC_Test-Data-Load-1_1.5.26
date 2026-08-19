import { GripVertical } from "lucide-react";

export function DragHandle({ className = "" }) {
  return (
    <div className={`cursor-move text-slate-500 hover:text-slate-300 transition-colors ${className}`}>
      <GripVertical className="h-5 w-5" />
    </div>
  );
}