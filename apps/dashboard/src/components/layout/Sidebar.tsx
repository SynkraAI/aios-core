'use client';

import { useUIStore } from '@/stores/ui-store';
import { SIDEBAR_ITEMS } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, activeView, setActiveView } = useUIStore();

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-sidebar transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-14 items-center border-b border-border px-4">
        {sidebarCollapsed ? (
          <span className="text-xl font-bold text-primary">A</span>
        ) : (
          <span className="text-lg font-semibold text-foreground">AIOS Dashboard</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={activeView === item.id}
              isCollapsed={sidebarCollapsed}
              onClick={() => setActiveView(item.id)}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

interface SidebarNavItemProps {
  item: typeof SIDEBAR_ITEMS[number];
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

function SidebarNavItem({ item, isActive, isCollapsed, onClick }: SidebarNavItemProps) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground',
          isCollapsed && 'justify-center px-2'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        {/* Icon */}
        <span className="flex-shrink-0 text-lg">{item.icon}</span>

        {/* Label (hidden when collapsed) */}
        {!isCollapsed && <span className="truncate">{item.label}</span>}

        {/* Active indicator */}
        {isActive && (
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary',
              isCollapsed && 'left-0'
            )}
          />
        )}
      </button>
    </li>
  );
}
