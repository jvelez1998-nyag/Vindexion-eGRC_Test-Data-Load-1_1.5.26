import { DraggableContainer, DraggableItem } from "@/components/ui/draggable-container";
import { DragHandle } from "@/components/ui/drag-handle";

export default function DraggableList({ items, onReorder, renderItem, keyExtractor, className = "" }) {
  return (
    <DraggableContainer items={items} onReorder={onReorder} droppableId="draggable-list">
      <div className={`space-y-3 ${className}`}>
        {items.map((item, index) => (
          <DraggableItem 
            key={keyExtractor ? keyExtractor(item) : item.id || index} 
            id={keyExtractor ? keyExtractor(item) : (item.id || `item-${index}`)} 
            index={index}
          >
            <div className="flex items-center gap-3">
              <DragHandle />
              <div className="flex-1">
                {renderItem(item, index)}
              </div>
            </div>
          </DraggableItem>
        ))}
      </div>
    </DraggableContainer>
  );
}