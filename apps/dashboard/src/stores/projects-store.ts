import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '@/types';

interface ProjectsState {
  // State
  projects: Project[];
  activeProjectId: string | null;

  // Actions
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setActiveProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;

  // Bulk actions for context menu
  closeOtherProjects: (keepId: string) => void;
  closeAllProjects: () => void;
}

// Default project - will be detected from current directory
const DEFAULT_PROJECT: Project = {
  id: 'default',
  name: 'aios-core',
  path: '/Users/alan/Code/aios-core',
};

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [DEFAULT_PROJECT],
      activeProjectId: DEFAULT_PROJECT.id,

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
        })),

      removeProject: (id) =>
        set((state) => {
          // Don't allow removing the last project
          if (state.projects.length <= 1) return state;

          const newProjects = state.projects.filter((p) => p.id !== id);

          // If removing active project, switch to first remaining
          const newActiveId =
            state.activeProjectId === id
              ? newProjects[0]?.id ?? null
              : state.activeProjectId;

          return {
            projects: newProjects,
            activeProjectId: newActiveId,
          };
        }),

      setActiveProject: (id) =>
        set({ activeProjectId: id }),

      reorderProjects: (fromIndex, toIndex) =>
        set((state) => {
          const newProjects = [...state.projects];
          const [removed] = newProjects.splice(fromIndex, 1);
          newProjects.splice(toIndex, 0, removed);
          return { projects: newProjects };
        }),

      closeOtherProjects: (keepId) =>
        set((state) => {
          const keepProject = state.projects.find((p) => p.id === keepId);
          if (!keepProject) return state;

          return {
            projects: [keepProject],
            activeProjectId: keepId,
          };
        }),

      closeAllProjects: () =>
        set((state) => {
          // Keep at least one project (the first one)
          const firstProject = state.projects[0];
          if (!firstProject) return state;

          return {
            projects: [firstProject],
            activeProjectId: firstProject.id,
          };
        }),
    }),
    {
      name: 'aios-projects',
    }
  )
);
