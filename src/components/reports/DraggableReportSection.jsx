import { DraggableContainer, DraggableItem } from "@/components/ui/draggable-container";
import { DragHandle } from "@/components/ui/drag-handle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DraggableReportSection({ sections, onReorder, children }) {
  return (
    <DraggableContainer items={sections} onReorder={onReorder} droppableId="report-sections">
      <div className="space-y-4">
        {sections.map((section, index) => (
          <DraggableItem key={section.id} id={section.id} index={index}>
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{section.title}</CardTitle>
                <DragHandle />
              </CardHeader>
              <CardContent>
                {children(section, index)}
              </CardContent>
            </Card>
          </DraggableItem>
        ))}
      </div>
    </DraggableContainer>
  );
}