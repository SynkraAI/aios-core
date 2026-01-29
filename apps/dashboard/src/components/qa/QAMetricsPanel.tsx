'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Library,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Bug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TYPES
// ═══════════════════════════════════════════════════════════════════════════════════

interface QAMetrics {
  overview: {
    totalReviews: number;
    passRate: number;
    avgReviewTime: string;
    trend: 'improving' | 'declining' | 'stable';
  };
  libraryValidation: {
    librariesChecked: number;
    validationsPassed: number;
    deprecatedFound: number;
    securityIssues: number;
  };
  securityChecklist: {
    totalChecks: number;
    passed: number;
    failed: number;
    critical: number;
  };
  migrationValidation: {
    migrationsChecked: number;
    schemasValid: number;
    rollbacksAvailable: number;
    pendingMigrations: number;
  };
  patternFeedback: {
    patternsTracked: number;
    deprecatedPatterns: number;
    avgSuccessRate: number;
    recentTrend: 'improving' | 'declining' | 'neutral';
  };
  gotchas: {
    totalGotchas: number;
    recentlyAdded: number;
    mostCommonCategory: string;
    queriesServed: number;
  };
  dailyTrend: Array<{
    date: string;
    passed: number;
    failed: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════════

const MOCK_QA_METRICS: QAMetrics = {
  overview: {
    totalReviews: 47,
    passRate: 89,
    avgReviewTime: '4.2m',
    trend: 'improving',
  },
  libraryValidation: {
    librariesChecked: 156,
    validationsPassed: 148,
    deprecatedFound: 3,
    securityIssues: 2,
  },
  securityChecklist: {
    totalChecks: 376,
    passed: 361,
    failed: 15,
    critical: 2,
  },
  migrationValidation: {
    migrationsChecked: 23,
    schemasValid: 21,
    rollbacksAvailable: 19,
    pendingMigrations: 2,
  },
  patternFeedback: {
    patternsTracked: 34,
    deprecatedPatterns: 3,
    avgSuccessRate: 0.82,
    recentTrend: 'improving',
  },
  gotchas: {
    totalGotchas: 28,
    recentlyAdded: 5,
    mostCommonCategory: 'api',
    queriesServed: 142,
  },
  dailyTrend: [
    { date: 'Mon', passed: 8, failed: 1 },
    { date: 'Tue', passed: 6, failed: 2 },
    { date: 'Wed', passed: 9, failed: 0 },
    { date: 'Thu', passed: 7, failed: 1 },
    { date: 'Fri', passed: 5, failed: 1 },
    { date: 'Sat', passed: 3, failed: 0 },
    { date: 'Sun', passed: 4, failed: 0 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function MetricCard({ title, value, subtitle, icon, color, bgColor }: MetricCardProps) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-2 rounded-lg', bgColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface TrendBadgeProps {
  trend: 'improving' | 'declining' | 'stable' | 'neutral';
}

function TrendBadge({ trend }: TrendBadgeProps) {
  const config = {
    improving: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Improving' },
    declining: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Declining' },
    stable: { icon: null, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Stable' },
    neutral: { icon: null, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Neutral' },
  }[trend];

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('text-xs gap-1', config.color, config.bg)}>
      {Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

function MiniBarChart({ data }: { data: Array<{ date: string; passed: number; failed: number }> }) {
  const maxValue = Math.max(...data.map(d => d.passed + d.failed));

  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((day) => {
        const total = day.passed + day.failed;
        const passedHeight = (day.passed / maxValue) * 100;
        const failedHeight = (day.failed / maxValue) * 100;

        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse" style={{ height: '60px' }}>
              <div
                className="w-full bg-green-500 rounded-t"
                style={{ height: `${passedHeight}%` }}
              />
              {day.failed > 0 && (
                <div
                  className="w-full bg-red-500"
                  style={{ height: `${failedHeight}%` }}
                />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{day.date}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════

interface QAMetricsPanelProps {
  useMockData?: boolean;
}

export function QAMetricsPanel({ useMockData = true }: QAMetricsPanelProps) {
  const [metrics, setMetrics] = useState<QAMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      if (useMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setMetrics(MOCK_QA_METRICS);
      } else {
        const response = await fetch('/api/qa/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch QA metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  useEffect(() => {
    fetchMetrics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (!metrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-foreground">Loading QA Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">QA Metrics</h2>
          <TrendBadge trend={metrics.overview.trend} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchMetrics}
          disabled={loading}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Overview */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Reviews"
              value={metrics.overview.totalReviews}
              subtitle="this week"
              icon={<CheckCircle2 className="h-5 w-5 text-blue-500" />}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <MetricCard
              title="Pass Rate"
              value={`${metrics.overview.passRate}%`}
              subtitle="reviews passed"
              icon={<TrendingUp className="h-5 w-5 text-green-500" />}
              color="text-green-500"
              bgColor="bg-green-500/10"
            />
            <MetricCard
              title="Avg Review Time"
              value={metrics.overview.avgReviewTime}
              subtitle="per review"
              icon={<RefreshCw className="h-5 w-5 text-purple-500" />}
              color="text-purple-500"
              bgColor="bg-purple-500/10"
            />
            <MetricCard
              title="Critical Issues"
              value={metrics.securityChecklist.critical}
              subtitle="need attention"
              icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
              color={metrics.securityChecklist.critical > 0 ? 'text-red-500' : 'text-green-500'}
              bgColor={metrics.securityChecklist.critical > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}
            />
          </div>
        </section>

        {/* Daily Trend */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Daily Trend (7 days)</h3>
          <div className="p-4 rounded-lg border border-border bg-card">
            <MiniBarChart data={metrics.dailyTrend} />
            <div className="flex items-center justify-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-muted-foreground">Passed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-muted-foreground">Failed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Validation Modules */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Validation Modules</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Library Validation */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Library className="h-4 w-4 text-cyan-500" />
                <span className="font-medium">Library Validation</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checked</span>
                  <span>{metrics.libraryValidation.librariesChecked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passed</span>
                  <span className="text-green-500">{metrics.libraryValidation.validationsPassed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deprecated</span>
                  <span className="text-yellow-500">{metrics.libraryValidation.deprecatedFound}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Issues</span>
                  <span className="text-red-500">{metrics.libraryValidation.securityIssues}</span>
                </div>
              </div>
            </div>

            {/* Security Checklist */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="font-medium">Security Checklist</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Checks</span>
                  <span>{metrics.securityChecklist.totalChecks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passed</span>
                  <span className="text-green-500">{metrics.securityChecklist.passed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed</span>
                  <span className="text-yellow-500">{metrics.securityChecklist.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Critical</span>
                  <span className={metrics.securityChecklist.critical > 0 ? 'text-red-500 font-bold' : 'text-green-500'}>
                    {metrics.securityChecklist.critical}
                  </span>
                </div>
              </div>
            </div>

            {/* Migration Validation */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Migration Validation</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checked</span>
                  <span>{metrics.migrationValidation.migrationsChecked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid Schemas</span>
                  <span className="text-green-500">{metrics.migrationValidation.schemasValid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rollbacks Ready</span>
                  <span className="text-blue-500">{metrics.migrationValidation.rollbacksAvailable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="text-yellow-500">{metrics.migrationValidation.pendingMigrations}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning System */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Learning System</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pattern Feedback */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Pattern Feedback</span>
                </div>
                <TrendBadge trend={metrics.patternFeedback.recentTrend} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-2xl font-bold text-foreground">{metrics.patternFeedback.patternsTracked}</p>
                  <p className="text-xs text-muted-foreground">Patterns Tracked</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    {Math.round(metrics.patternFeedback.avgSuccessRate * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Success Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{metrics.patternFeedback.deprecatedPatterns}</p>
                  <p className="text-xs text-muted-foreground">Deprecated</p>
                </div>
              </div>
            </div>

            {/* Gotchas Registry */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Gotchas Registry</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  +{metrics.gotchas.recentlyAdded} new
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-2xl font-bold text-foreground">{metrics.gotchas.totalGotchas}</p>
                  <p className="text-xs text-muted-foreground">Total Gotchas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">{metrics.gotchas.queriesServed}</p>
                  <p className="text-xs text-muted-foreground">Queries Served</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">
                    Most common: <span className="text-foreground font-medium">{metrics.gotchas.mostCommonCategory}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {useMockData ? 'Demo data' : 'Live data'}
        </span>
        <span className="text-xs text-muted-foreground">
          Updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
        </span>
      </div>
    </div>
  );
}
