'use client';

import { useEffect } from 'react';
import { Sun, Moon, Monitor, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore, type Theme } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { AGENT_CONFIG, type AgentId } from '@/types';

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const REFRESH_OPTIONS = [
  { value: 10, label: '10 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
];

export function SettingsPanel() {
  const {
    settings,
    setTheme,
    setAutoRefresh,
    setRefreshInterval,
    setStoriesPath,
    setAgentColor,
    resetToDefaults,
  } = useSettingsStore();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Settings</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reset to Defaults
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Appearance Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="flex-1 h-px bg-border" />
            <span>Appearance</span>
            <span className="flex-1 h-px bg-border" />
          </h3>

          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="flex gap-2">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                        settings.theme === option.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Data Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="flex-1 h-px bg-border" />
            <span>Data</span>
            <span className="flex-1 h-px bg-border" />
          </h3>

          <div className="space-y-4">
            {/* Stories Path */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Stories Directory
              </label>
              <input
                type="text"
                value={settings.storiesPath}
                onChange={(e) => setStoriesPath(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="docs/stories"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Relative path from project root
              </p>
            </div>

            {/* Auto Refresh */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Auto Refresh</label>
                <p className="text-xs text-muted-foreground">
                  Automatically refresh data
                </p>
              </div>
              <button
                onClick={() => setAutoRefresh(!settings.autoRefresh)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  settings.autoRefresh ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    settings.autoRefresh ? 'left-6' : 'left-1'
                  )}
                />
              </button>
            </div>

            {/* Refresh Interval */}
            {settings.autoRefresh && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Refresh Interval
                </label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {REFRESH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Agents Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="flex-1 h-px bg-border" />
            <span>Agent Colors</span>
            <span className="flex-1 h-px bg-border" />
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(AGENT_CONFIG) as AgentId[]).map((agentId) => {
              const config = AGENT_CONFIG[agentId];
              return (
                <div
                  key={agentId}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border"
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="flex-1 text-sm font-medium">@{agentId}</span>
                  <input
                    type="color"
                    value={settings.agentColors[agentId] || '#888888'}
                    onChange={(e) => setAgentColor(agentId, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Settings are automatically saved to localStorage
        </p>
      </div>
    </div>
  );
}
