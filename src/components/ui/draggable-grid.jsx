import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { DragHandle } from "./drag-handle";

export function DraggableGrid({ items, onReorder, renderItem, columns = 1, gap = 4 }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;
    
    const newItems = Array.from(items);
    const [removed] = newItems.splice(sourceIndex, 1);
    newItems.splice(destIndex, 0, removed);
    
    onReorder(newItems);
  };

  const gridClass = `grid grid-cols-1 ${
    columns === 2 ? 'md:grid-cols-2' : 
    columns === 3 ? 'md:grid-cols-3' : 
    columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 
    ''
  } gap-${gap}`;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="draggable-grid">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${gridClass} ${snapshot.isDraggingOver ? 'opacity-75' : ''}`}
          >
            {items.map((item, index) => (
              <Draggable 
                key={item.id || `grid-item-${index}`} 
                draggableId={item.id || `grid-item-${index}`} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`${snapshot.isDragging ? 'opacity-50 rotate-2 scale-105' : ''} transition-all`}
                    style={provided.draggableProps.style}
                  >
                    <div className="relative group">
                      <div {...provided.dragHandleProps} className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DragHandle />
                      </div>
                      {renderItem(item, index)}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}