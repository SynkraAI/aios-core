'use client';

import { ExternalLink, GitPullRequest, CircleDot, RefreshCw } from 'lucide-react';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/stores/settings-store';
import { MOCK_PULL_REQUESTS, MOCK_ISSUES } from '@/lib/mock-data';

interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  labels: { name: string }[];
  url: string;
  createdAt: string;
  author: { login: string };
}

interface GitHubPR {
  number: number;
  title: string;
  state: string;
  url: string;
  createdAt: string;
  author: { login: string };
  headRefName: string;
  isDraft: boolean;
}

interface GitHubData {
  issues: GitHubIssue[];
  prs: GitHubPR[];
  repo: { name: string; owner: { login: string }; url: string } | null;
  updatedAt: string;
  error?: string;
  message?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

// Transform mock data to match API format
function getMockGitHubData(): GitHubData {
  return {
    issues: MOCK_ISSUES.filter(i => i.state === 'open').map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      labels: issue.labels.map(l => ({ name: l })),
      url: `https://github.com/synkra/aios-core/issues/${issue.number}`,
      createdAt: issue.createdAt,
      author: { login: issue.author },
    })),
    prs: MOCK_PULL_REQUESTS.filter(pr => pr.state === 'open').map(pr => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      url: `https://github.com/synkra/aios-core/pull/${pr.number}`,
      createdAt: pr.createdAt,
      author: { login: pr.author },
      headRefName: `feat/story-${pr.storyId?.split('-')[1] || 'main'}`,
      isDraft: false,
    })),
    repo: {
      name: 'aios-core',
      owner: { login: 'synkra' },
      url: 'https://github.com/synkra/aios-core',
    },
    updatedAt: new Date().toISOString(),
  };
}

export function GitHubPanel() {
  const { settings } = useSettingsStore();
  const useMockData = settings.useMockData;

  const { data: apiData, error, isLoading, mutate } = useSWR<GitHubData>(
    useMockData ? null : '/api/github',
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  const data = useMockData ? getMockGitHubData() : apiData;

  if (!useMockData && (error || data?.error)) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <CircleDot className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">GitHub Not Connected</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {data?.message || 'Unable to connect to GitHub'}
        </p>
        <code className="text-xs bg-muted px-2 py-1 rounded mb-4">
          gh auth login
        </code>
        <Button variant="outline" size="sm" onClick={() => mutate()}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">GitHub</h2>
          {data?.repo && (
            <a
              href={data.repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {data.repo.owner.login}/{data.repo.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutate()}
          disabled={isLoading}
        >
          <RefreshCw className={cn('h-4 w-4 mr-1.5', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && !data ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Pull Requests */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <GitPullRequest className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-medium">
                  Pull Requests
                  <Badge variant="outline" className="ml-2">
                    {data?.prs?.length || 0}
                  </Badge>
                </h3>
              </div>
              {data?.prs && data.prs.length > 0 ? (
                <ul className="space-y-2">
                  {data.prs.map((pr) => (
                    <li key={pr.number}>
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-sm">
                                #{pr.number}
                              </span>
                              {pr.isDraft && (
                                <Badge variant="outline" className="text-xs">
                                  Draft
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium truncate mt-1">
                              {pr.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {pr.author.login} • {formatDate(pr.createdAt)}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                        <div className="mt-2">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {pr.headRefName}
                          </code>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No open PRs</p>
              )}
            </section>

            {/* Issues */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CircleDot className="h-4 w-4 text-green-500" />
                <h3 className="text-sm font-medium">
                  Issues
                  <Badge variant="outline" className="ml-2">
                    {data?.issues?.length || 0}
                  </Badge>
                </h3>
              </div>
              {data?.issues && data.issues.length > 0 ? (
                <ul className="space-y-2">
                  {data.issues.map((issue) => (
                    <li key={issue.number}>
                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-muted-foreground text-sm">
                              #{issue.number}
                            </span>
                            <p className="text-sm font-medium truncate mt-1">
                              {issue.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {issue.author.login} • {formatDate(issue.createdAt)}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                        {issue.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {issue.labels.slice(0, 3).map((label) => (
                              <Badge
                                key={label.name}
                                variant="outline"
                                className="text-xs"
                              >
                                {label.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No open issues</p>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Footer */}
      {data?.updatedAt && (
        <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
          Last updated: {new Date(data.updatedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
