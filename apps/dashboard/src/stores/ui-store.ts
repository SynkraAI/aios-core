import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SidebarView } from '@/types';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  activeView: SidebarView;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveView: (view: SidebarView) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeView: 'kanban',

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setActiveView: (view) =>
        set({ activeView: view }),
    }),
    {
      name: 'aios-ui',
    }
  )
);
