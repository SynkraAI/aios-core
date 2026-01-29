'use client';

import { useEffect } from 'react';
import { Sun, Moon, Monitor, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { useSettingsStore, type Theme } from '@/stores/settings-store';
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
    setUseMockData,
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
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] block mb-1" style={{ color: 'var(--accent-gold)' }}>Configuration</span>
          <h2 className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>Settings</h2>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-luxury hover:opacity-80"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-refined">
        {/* Appearance Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-gold)' }}>Appearance</span>
            <div className="flex-1 h-px gold-line" />
          </div>

          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="text-[11px] uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>Theme</label>
              <div className="flex gap-2">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = settings.theme === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className="flex items-center gap-2 px-4 py-2 border transition-luxury"
                      style={{
                        borderColor: isSelected ? 'var(--border-gold)' : 'var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--accent-gold-bg)' : 'var(--bg-hover)',
                        color: isSelected ? 'var(--accent-gold)' : 'var(--text-muted)',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px]">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Data Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-gold)' }}>Data</span>
            <div className="flex-1 h-px gold-line" />
          </div>

          <div className="space-y-4">
            {/* Mock Data Toggle */}
            <div
              className="flex items-center justify-between p-4 border"
              style={{ backgroundColor: 'var(--status-warning-bg)', borderColor: 'var(--status-warning-border)' }}
            >
              <div>
                <label className="text-[11px] font-medium" style={{ color: 'var(--status-warning)' }}>Demo Mode</label>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Use mock data for visualization
                </p>
              </div>
              <button
                onClick={() => setUseMockData(!settings.useMockData)}
                className="relative w-11 h-6 transition-luxury"
                style={{ backgroundColor: settings.useMockData ? 'var(--status-warning)' : 'var(--border)' }}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white transition-luxury',
                    settings.useMockData ? 'left-6' : 'left-1'
                  )}
                />
              </button>
            </div>

            {/* Stories Path */}
            <div>
              <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                Stories Directory
              </label>
              <input
                type="text"
                value={settings.storiesPath}
                onChange={(e) => setStoriesPath(e.target.value)}
                disabled={settings.useMockData}
                className={cn(
                  'w-full px-3 py-2 border text-[11px] focus:outline-none transition-colors',
                  settings.useMockData && 'opacity-40 cursor-not-allowed'
                )}
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-secondary)',
                }}
                placeholder="docs/stories"
              />
              <p className="text-[10px] mt-1.5" style={{ color: 'var(--border)' }}>
                Relative path from project root
              </p>
            </div>

            {/* Auto Refresh */}
            <div
              className="flex items-center justify-between p-4 border"
              style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <label className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Auto Refresh</label>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Automatically refresh data
                </p>
              </div>
              <button
                onClick={() => setAutoRefresh(!settings.autoRefresh)}
                className="relative w-11 h-6 transition-luxury"
                style={{ backgroundColor: settings.autoRefresh ? 'var(--status-success)' : 'var(--border)' }}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white transition-luxury',
                    settings.autoRefresh ? 'left-6' : 'left-1'
                  )}
                />
              </button>
            </div>

            {/* Refresh Interval */}
            {settings.autoRefresh && (
              <div>
                <label className="text-[11px] uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Refresh Interval
                </label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 border text-[11px] focus:outline-none transition-colors cursor-pointer"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                  }}
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
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-gold)' }}>Agent Colors</span>
            <div className="flex-1 h-px gold-line" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(AGENT_CONFIG) as AgentId[]).map((agentId) => {
              const config = AGENT_CONFIG[agentId];
              return (
                <div
                  key={agentId}
                  className="flex items-center gap-3 p-3 border transition-colors hover:border-[rgba(255,255,255,0.08)]"
                  style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }}
                >
                  {(() => {
                    const IconComponent = iconMap[config.icon];
                    return IconComponent ? <IconComponent className="h-4 w-4" style={{ color: config.color }} /> : null;
                  })()}
                  <span className="flex-1 text-[11px] font-light" style={{ color: 'var(--text-tertiary)' }}>@{agentId}</span>
                  <input
                    type="color"
                    value={settings.agentColors[agentId] || '#888888'}
                    onChange={(e) => setAgentColor(agentId, e.target.value)}
                    className="w-6 h-6 cursor-pointer border-0 bg-transparent"
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 border-t"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <p className="text-[10px] text-center" style={{ color: 'var(--border)' }}>
          Settings are automatically saved to localStorage
        </p>
      </div>
    </div>
  );
}
