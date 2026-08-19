import { Card } from "@/components/ui/card";
import { DragHandle } from "./drag-handle";

export function CardWithDrag({ children, className = "", showHandle = true }) {
  return (
    <Card className={`relative group ${className}`}>
      {showHandle && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DragHandle />
        </div>
      )}
      {children}
    </Card>
  );
}