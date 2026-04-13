'use client';

import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { type RadarData, type Urgency, URGENCY_CONFIG, URGENCY_ORDER } from '@/lib/types';
import ProjectCard from './ProjectCard';

interface KanbanBoardProps {
  data: RadarData;
  expandedCards: Set<string>;
  onMove: (projectId: string, from: Urgency, to: Urgency, sourceIndex: number, destIndex: number) => void;
  onToggleCheckbox: (projectId: string, checkboxIndex: number) => void;
  onAddCheckbox: (projectId: string, text: string) => void;
  onDeleteCheckbox: (projectId: string, index: number) => void;
  onEditCheckbox: (projectId: string, index: number, newText: string) => void;
  onToggleExpand: (projectId: string) => void;
}

const COLUMN_DOT_COLORS: Record<Urgency, string> = {
  urgente: 'text-column-red',
  atencao: 'text-column-yellow',
  tranquilo: 'text-column-green',
  avaliar: 'text-column-gray',
  concluidos: 'text-column-blue',
};

const COLUMN_DOT_BG: Record<Urgency, string> = {
  urgente: 'bg-column-red',
  atencao: 'bg-column-yellow',
  tranquilo: 'bg-column-green',
  avaliar: 'bg-column-gray',
  concluidos: 'bg-column-blue',
};

const COLUMN_BORDER_ACCENT: Record<Urgency, string> = {
  urgente: 'border-column-red/20',
  atencao: 'border-column-yellow/20',
  tranquilo: 'border-column-green/20',
  avaliar: 'border-column-gray/20',
  concluidos: 'border-column-blue/20',
};

export default function KanbanBoard({
  data,
  expandedCards,
  onMove,
  onToggleCheckbox,
  onAddCheckbox,
  onDeleteCheckbox,
  onEditCheckbox,
  onToggleExpand,
}: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const from = result.source.droppableId as Urgency;
    const to = result.destination.droppableId as Urgency;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (from === to && sourceIndex === destIndex) return;

    const projectId = result.draggableId;
    onMove(projectId, from, to, sourceIndex, destIndex);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {URGENCY_ORDER.map((urgency) => {
          const config = URGENCY_CONFIG[urgency];
          const projects = data.sections[urgency];

          return (
            <div
              key={urgency}
              className={`flex-shrink-0 w-72 flex flex-col rounded-card border ${COLUMN_BORDER_ACCENT[urgency]} bg-secondary`}
            >
              <div className="flex items-center gap-2.5 p-3 border-b border-border/30">
                <div className={`column-header-dot ${COLUMN_DOT_BG[urgency]} ${COLUMN_DOT_COLORS[urgency]}`} />
                <span className="section-label">{config.label}</span>
                <span className="ml-auto text-xs font-mono text-text-secondary">{projects.length}</span>
              </div>

              <Droppable droppableId={urgency}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      flex-1 p-2 space-y-2 overflow-y-auto transition-colors duration-200
                      ${snapshot.isDraggingOver ? 'bg-card/30' : ''}
                    `}
                  >
                    {projects.map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                          >
                            <ProjectCard
                              project={project}
                              onToggleCheckbox={onToggleCheckbox}
                              onAddCheckbox={onAddCheckbox}
                              onDeleteCheckbox={onDeleteCheckbox}
                              onEditCheckbox={onEditCheckbox}
                              onExpand={onToggleExpand}
                              isExpanded={expandedCards.has(project.id)}
                              isDragging={dragSnapshot.isDragging}
                              dragHandleProps={dragProvided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {projects.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-text-secondary text-xs">
                        Arraste projetos aqui
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
