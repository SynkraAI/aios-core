import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

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

export async function GET() {
  try {
    // Check if gh CLI is authenticated
    try {
      await execFileAsync('gh', ['auth', 'status']);
    } catch {
      return NextResponse.json(
        {
          error: 'GitHub CLI not authenticated',
          message: 'Run "gh auth login" to authenticate',
        },
        { status: 401 }
      );
    }

    // Fetch issues and PRs in parallel
    const [issuesResult, prsResult] = await Promise.allSettled([
      execFileAsync('gh', [
        'issue',
        'list',
        '--json',
        'number,title,state,labels,url,createdAt,author',
        '--limit',
        '15',
      ]),
      execFileAsync('gh', [
        'pr',
        'list',
        '--json',
        'number,title,state,url,createdAt,author,headRefName,isDraft',
        '--limit',
        '15',
      ]),
    ]);

    const issues: GitHubIssue[] =
      issuesResult.status === 'fulfilled' ? JSON.parse(issuesResult.value.stdout || '[]') : [];

    const prs: GitHubPR[] =
      prsResult.status === 'fulfilled' ? JSON.parse(prsResult.value.stdout || '[]') : [];

    // Get repo info
    let repoInfo = null;
    try {
      const { stdout: repoJson } = await execFileAsync('gh', [
        'repo',
        'view',
        '--json',
        'name,owner,url',
      ]);
      repoInfo = JSON.parse(repoJson);
    } catch {
      // Ignore repo info errors
    }

    return NextResponse.json({
      issues,
      prs,
      repo: repoInfo,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('GitHub API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch GitHub data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
