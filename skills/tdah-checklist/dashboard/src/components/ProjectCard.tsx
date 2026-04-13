'use client';

import { useState, useRef, useEffect } from 'react';
import { type Project } from '@/lib/types';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

interface ProjectCardProps {
  project: Project;
  onToggleCheckbox: (projectId: string, index: number) => void;
  onAddCheckbox: (projectId: string, text: string) => void;
  onDeleteCheckbox: (projectId: string, index: number) => void;
  onEditCheckbox: (projectId: string, index: number, newText: string) => void;
  onExpand: (projectId: string) => void;
  isExpanded: boolean;
  isDragging?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

function InlineEdit({
  value,
  onSave,
}: {
  value: string;
  onSave: (newValue: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    setText(value);
  }, [value]);

  if (!editing) {
    return (
      <span
        className="leading-tight cursor-text hover:bg-white/5 rounded px-0.5 -mx-0.5 transition-colors"
        onDoubleClick={() => setEditing(true)}
        title="Duplo clique para editar"
      >
        {value}
      </span>
    );
  }

  const handleSave = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }
    setEditing(false);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
          setText(value);
          setEditing(false);
        }
      }}
      className="w-full bg-primary border border-border rounded px-1.5 py-0.5
        text-xs text-text-primary outline-none focus:border-accent-primary/50 transition-colors"
    />
  );
}

export default function ProjectCard({
  project,
  onToggleCheckbox,
  onAddCheckbox,
  onDeleteCheckbox,
  onEditCheckbox,
  onExpand,
  isExpanded,
  isDragging,
  dragHandleProps,
}: ProjectCardProps) {
  const [newTask, setNewTask] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCb = project.checkboxes.length;
  const doneCb = project.checkboxes.filter((cb) => cb.checked).length;
  const progress = totalCb > 0 ? Math.round((doneCb / totalCb) * 100) : 0;

  const handleAddTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    onAddCheckbox(project.id, trimmed);
    setNewTask('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div
      className={`
        rounded-card bg-card border border-border/40
        transition-all duration-200
        hover:border-border/80 hover:shadow-card-hover hover:-translate-y-0.5
        ${isDragging ? 'shadow-card-hover ring-2 ring-accent-primary/40 opacity-90' : 'shadow-card'}
      `}
    >
      {/* Drag handle — only this area initiates drag */}
      <div
        {...dragHandleProps}
        className="p-4 pb-0 cursor-grab active:cursor-grabbing"
        onClick={() => onExpand(project.id)}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-text-primary text-sm leading-tight">{project.displayName}</h3>
          <button
            className="text-text-secondary hover:text-text-primary transition-colors text-xs ml-2 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(project.id);
            }}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        </div>

        <p className="text-xs text-text-secondary mb-3 line-clamp-2">{project.status}</p>

        {totalCb > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-text-secondary mb-1">
              <span className="font-mono">
                {doneCb}/{totalCb}
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Interactive area — NO drag handle here */}
      {isExpanded && (
        <div className="animate-fade-in space-y-3 px-4 pb-4 pt-3 border-t border-border/30 mt-1">
          {project.path && (
            <div className="flex items-center gap-1.5">
              <span className="section-label">path</span>
              <p className="text-[10px] font-mono text-text-secondary truncate" title={project.path}>
                {project.path}
              </p>
            </div>
          )}

          {project.branch && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="section-label">branch</span>
              <span className="text-accent-primary">⎇</span>
              <span className="font-mono text-text-primary">{project.branch}</span>
            </div>
          )}

          {project.lastCommit && (
            <div className="flex items-center gap-1.5">
              <span className="section-label">commit</span>
              <p className="text-[10px] text-text-secondary font-mono truncate" title={project.lastCommit}>
                {project.lastCommit}
              </p>
            </div>
          )}

          {/* Checklist with edit/delete */}
          <div className="space-y-1">
            {project.checkboxes.map((cb, idx) => (
              <div key={idx} className="flex items-start gap-2 group text-xs">
                <input
                  type="checkbox"
                  checked={cb.checked}
                  onChange={() => onToggleCheckbox(project.id, idx)}
                  className="mt-0.5 shrink-0 rounded-sm cursor-pointer accent-[var(--accent-primary)]"
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <div className={`flex-1 min-w-0 ${cb.checked ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                  <InlineEdit
                    value={cb.text}
                    onSave={(newText) => onEditCheckbox(project.id, idx, newText)}
                  />
                </div>
                <button
                  onClick={() => onDeleteCheckbox(project.id, idx)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-semantic-error
                    transition-all text-[10px] mt-0.5"
                  title="Remover tarefa"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add new task */}
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') setNewTask('');
              }}
              placeholder="+ Nova tarefa..."
              className="flex-1 bg-transparent border-b border-border/40 text-xs text-text-primary
                placeholder:text-text-secondary/50 outline-none py-1
                focus:border-accent-primary/50 transition-colors"
            />
            {newTask.trim() && (
              <button
                onClick={handleAddTask}
                className="text-accent-primary hover:text-accent-secondary text-xs transition-colors shrink-0"
              >
                ↵
              </button>
            )}
          </div>

          {project.analysis && (
            <div className="pt-2 border-t border-border/20">
              <p className="text-[11px] text-text-secondary leading-relaxed">
                <span className="text-accent-primary">📋</span> {project.analysis}
              </p>
            </div>
          )}

          {project.delegation && project.delegation !== '—' && (
            <p className="text-[11px] text-accent-secondary leading-relaxed">
              <span>💡</span> {project.delegation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
