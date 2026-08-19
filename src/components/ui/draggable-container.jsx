import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function DraggableContainer({ items, onReorder, children, droppableId = "droppable" }) {
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={snapshot.isDraggingOver ? 'bg-indigo-500/5 transition-colors' : ''}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export function DraggableItem({ item, index, children, id }) {
  return (
    <Draggable draggableId={id || `item-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${snapshot.isDragging ? 'opacity-50 scale-105' : ''} transition-all`}
          style={provided.draggableProps.style}
        >
          {children}
        </div>
      )}
    </Draggable>
  );
}