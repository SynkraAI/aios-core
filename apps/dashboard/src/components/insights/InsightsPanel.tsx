'use client';

import { TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';
import { MOCK_INSIGHTS } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { AGENT_CONFIG, type AgentId } from '@/types';
import { iconMap } from '@/lib/icons';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

function MetricCard({ title, value, subtitle, trend, trendValue, icon, color = 'text-foreground' }: MetricCardProps) {
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
        {icon && (
          <div className="p-2 rounded-lg bg-muted">
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className={cn(
          'flex items-center gap-1 mt-2 text-xs',
          trend === 'up' && 'text-green-500',
          trend === 'down' && 'text-red-500',
          trend === 'stable' && 'text-muted-foreground',
        )}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
           trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}

function BarChart({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue: number }) {
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-8">{item.label}</span>
          <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
            <div
              className={cn('h-full rounded', item.color || 'bg-primary')}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function InsightsPanel() {
  const { settings } = useSettingsStore();
  const data = settings.useMockData ? MOCK_INSIGHTS : null;

  if (!settings.useMockData || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">No Insights Available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enable Demo Mode in Settings to see sample analytics
          </p>
        </div>
      </div>
    );
  }

  const velocityChange = ((data.velocity.current - data.velocity.previous) / data.velocity.previous * 100).toFixed(0);
  const errorChange = data.errorRate.previous - data.errorRate.current;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Insights</h2>
          <Badge variant="outline" className="text-xs">This Week</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Key Metrics */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Key Metrics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Velocity"
              value={data.velocity.current}
              subtitle="stories/week"
              trend={data.velocity.trend}
              trendValue={`${velocityChange}% vs last week`}
              icon={<TrendingUp className="h-5 w-5 text-green-500" />}
              color="text-green-500"
            />
            <MetricCard
              title="Cycle Time"
              value={`${data.cycleTime.average}h`}
              subtitle="avg per story"
              icon={<Clock className="h-5 w-5 text-blue-500" />}
              color="text-blue-500"
            />
            <MetricCard
              title="Error Rate"
              value={`${data.errorRate.current}%`}
              subtitle="stories with errors"
              trend={errorChange > 0 ? 'down' : 'up'}
              trendValue={`${Math.abs(errorChange)}% ${errorChange > 0 ? 'decrease' : 'increase'}`}
              icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
              color={data.errorRate.current > 10 ? 'text-red-500' : 'text-yellow-500'}
            />
            <MetricCard
              title="Completed"
              value={data.agentActivity.reduce((sum, a) => sum + a.storiesCompleted, 0)}
              subtitle="total stories"
              icon={<CheckCircle2 className="h-5 w-5 text-purple-500" />}
              color="text-purple-500"
            />
          </div>
        </section>

        {/* Agent Performance */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Agent Performance</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.agentActivity.map((agent) => {
              const config = AGENT_CONFIG[agent.agentId];
              const IconComponent = iconMap[config.icon];
              return (
                <div
                  key={agent.agentId}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border"
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    {IconComponent && <IconComponent className="h-5 w-5" style={{ color: config.color }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">@{agent.agentId}</span>
                      <Badge variant="outline" className="text-xs">
                        {agent.successRate}% success
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{agent.storiesCompleted} stories</span>
                      <span>{agent.hoursActive}h active</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Weekly Activity */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Weekly Activity</h3>
          <div className="p-4 rounded-lg border border-border bg-card">
            <BarChart
              data={data.weeklyActivity.map(d => ({
                label: d.day,
                value: d.stories,
                color: 'bg-primary',
              }))}
              maxValue={Math.max(...data.weeklyActivity.map(d => d.stories)) || 1}
            />
          </div>
        </section>

        {/* Bottlenecks */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Bottlenecks</h3>
          <div className="space-y-2">
            {data.bottlenecks.map((bottleneck) => (
              <div
                key={bottleneck.status}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{bottleneck.status}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{bottleneck.count} stories</span>
                  <Badge variant="outline" className="text-xs">
                    ~{bottleneck.avgWaitTime}h wait
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cycle Time by Status */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Time in Status (avg hours)</h3>
          <div className="p-4 rounded-lg border border-border bg-card">
            <BarChart
              data={Object.entries(data.cycleTime.byStatus).map(([status, hours]) => ({
                label: status.replace('_', ' ').slice(0, 8),
                value: hours,
                color: status === 'backlog' ? 'bg-gray-500' :
                       status === 'in_progress' ? 'bg-blue-500' :
                       status === 'ai_review' ? 'bg-purple-500' :
                       status === 'human_review' ? 'bg-yellow-500' :
                       'bg-cyan-500',
              }))}
              maxValue={Math.max(...Object.values(data.cycleTime.byStatus)) || 1}
            />
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {settings.useMockData ? 'Showing mock analytics' : 'Real-time data'}
        </span>
        <span className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
