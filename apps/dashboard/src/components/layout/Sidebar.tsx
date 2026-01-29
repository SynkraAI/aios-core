'use client';

import { useUIStore } from '@/stores/ui-store';
import { SIDEBAR_ITEMS } from '@/types';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, activeView, setActiveView } = useUIStore();

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-sidebar transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'border-[rgba(255,255,255,0.04)]',
        sidebarCollapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-14 items-center border-b border-[rgba(255,255,255,0.04)] px-4">
        {sidebarCollapsed ? (
          <span className="text-xl font-light text-[#C9B298]">A</span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-light tracking-wide text-[#C9B298]">AIOS</span>
            <span className="text-sm font-light text-[#6B6B5F]">Dashboard</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-refined">
        <ul className="space-y-0.5 px-2">
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
          'group relative flex w-full items-center gap-3 px-3 py-2 text-sm font-light',
          'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'hover:bg-[rgba(255,255,255,0.03)] hover:text-[#FAFAF8]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(201,178,152,0.3)]',
          isActive
            ? 'bg-[rgba(201,178,152,0.08)] text-[#FAFAF8]'
            : 'text-[#6B6B5F]',
          isCollapsed && 'justify-center px-2'
        )}
        title={isCollapsed ? `${item.label} (${item.shortcut})` : undefined}
      >
        {/* Icon */}
        {(() => {
          const IconComponent = iconMap[item.icon];
          return IconComponent ? (
            <IconComponent className={cn(
              "h-4 w-4 flex-shrink-0 transition-colors duration-300",
              isActive ? "text-[#C9B298]" : "text-[#4A4A42] group-hover:text-[#6B6B5F]"
            )} />
          ) : null;
        })()}

        {/* Label (hidden when collapsed) */}
        {!isCollapsed && <span className="flex-1 truncate text-left">{item.label}</span>}

        {/* Keyboard shortcut hint */}
        {!isCollapsed && item.shortcut && (
          <span className={cn(
            "ml-auto text-[9px] px-1.5 py-0.5 font-mono tracking-wide",
            "border border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.3)]",
            isActive ? "text-[#C9B298] border-[rgba(201,178,152,0.2)]" : "text-[#4A4A42]"
          )}>
            {item.shortcut}
          </span>
        )}

        {/* Active indicator - gold line */}
        {isActive && (
          <span
            className={cn(
              'absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-[#C9B298]',
              isCollapsed && 'left-0'
            )}
          />
        )}
      </button>
    </li>
  );
}
