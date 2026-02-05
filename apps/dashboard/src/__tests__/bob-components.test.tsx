import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useBobStore } from '@/stores/bob-store';
import { BobPipelinePanel } from '@/components/bob/BobPipelinePanel';
import { BobAgentActivity } from '@/components/bob/BobAgentActivity';
import { BobSurfaceAlert } from '@/components/bob/BobSurfaceAlert';
import { BobOrchestrationView } from '@/components/bob/BobOrchestrationView';

const SAMPLE_STATUS = {
  active: true,
  timestamp: new Date().toISOString(),
  orchestration: { active: true },
  pipeline: {
    stages: ['validation', 'development', 'self_healing', 'quality_gate', 'push', 'checkpoint'],
    current_stage: 'development',
    story_progress: '3/8',
    completed_stages: ['validation'],
  },
  current_agent: {
    id: 'dev',
    name: 'Dex',
    task: 'implementing jwt-handler',
    reason: 'code_general',
    started_at: new Date().toISOString(),
  },
  active_terminals: [
    { agent: 'dev', pid: 12345, task: 'jwt-handler', elapsed: '4m32s' },
  ],
  surface_decisions: [],
  elapsed: { story_seconds: 272, session_seconds: 1380 },
  errors: [],
  educational: { enabled: false, tradeoffs: [], reasoning: [] },
};

beforeEach(() => {
  useBobStore.getState().reset();
});

describe('BobPipelinePanel', () => {
  it('should not render when Bob is inactive', () => {
    const { container } = render(<BobPipelinePanel />);
    expect(container.innerHTML).toBe('');
  });

  it('should render pipeline stages when active', () => {
    useBobStore.getState().updateFromStatus(SAMPLE_STATUS);
    render(<BobPipelinePanel />);

    expect(screen.getByText('Bob Orchestration')).toBeInTheDocument();
    expect(screen.getByText('Story 3/8')).toBeInTheDocument();
    expect(screen.getByText('Dev')).toBeInTheDocument();
  });

  it('should show current agent info', () => {
    useBobStore.getState().updateFromStatus(SAMPLE_STATUS);
    render(<BobPipelinePanel />);

    expect(screen.getByText(/implementing jwt-handler/)).toBeInTheDocument();
  });

  it('should show terminal count', () => {
    useBobStore.getState().updateFromStatus(SAMPLE_STATUS);
    render(<BobPipelinePanel />);

    expect(screen.getByText(/Terminals: 1 active/)).toBeInTheDocument();
  });
});

describe('BobAgentActivity', () => {
  it('should not render when Bob is inactive', () => {
    const { container } = render(<BobAgentActivity />);
    expect(container.innerHTML).toBe('');
  });

  it('should show placeholder when no agents active', () => {
    useBobStore.getState().updateFromStatus({
      ...SAMPLE_STATUS,
      current_agent: null,
      active_terminals: [],
    });
    render(<BobAgentActivity />);

    expect(screen.getByText('Nenhum agente ativo no momento')).toBeInTheDocument();
  });

  it('should show agent cards when agents active', () => {
    useBobStore.getState().updateFromStatus(SAMPLE_STATUS);
    render(<BobAgentActivity />);

    expect(screen.getByText('@dev')).toBeInTheDocument();
    expect(screen.getByText('jwt-handler')).toBeInTheDocument();
  });
});

describe('BobSurfaceAlert', () => {
  it('should not render when no pending decisions', () => {
    useBobStore.getState().updateFromStatus(SAMPLE_STATUS);
    const { container } = render(<BobSurfaceAlert />);
    expect(container.innerHTML).toBe('');
  });

  it('should render alert when surface decision pending', () => {
    useBobStore.getState().updateFromStatus({
      ...SAMPLE_STATUS,
      surface_decisions: [
        { criteria: 'C003', action: 'present_options', timestamp: new Date().toISOString(), resolved: false },
      ],
    });
    render(<BobSurfaceAlert />);

    expect(screen.getByText('Bob precisa da sua atenção no CLI')).toBeInTheDocument();
    expect(screen.getByText(/C003/)).toBeInTheDocument();
  });

  it('should not render resolved decisions', () => {
    useBobStore.getState().updateFromStatus({
      ...SAMPLE_STATUS,
      surface_decisions: [
        { criteria: 'C003', action: 'present_options', timestamp: new Date().toISOString(), resolved: true },
      ],
    });
    const { container } = render(<BobSurfaceAlert />);
    expect(container.innerHTML).toBe('');
  });
});

describe('BobOrchestrationView', () => {
  it('should show placeholder when Bob is not active', () => {
    render(<BobOrchestrationView />);

    expect(screen.getByText('Bob não está ativo')).toBeInTheDocument();
    expect(screen.getByText(/Inicie Bob no CLI/)).toBeInTheDocument();
  });

  it('should render orchestration view when Bob is active', () => {
    useBobStore.getState().updateFromStatus(SAMPLE_STATUS);
    render(<BobOrchestrationView />);

    expect(screen.getByText('Bob Orchestration')).toBeInTheDocument();
  });

  it('should show errors when present', () => {
    useBobStore.getState().updateFromStatus({
      ...SAMPLE_STATUS,
      errors: [
        { phase: 'development', message: 'Test failure', recoverable: true },
      ],
    });
    render(<BobOrchestrationView />);

    expect(screen.getByText('Errors (1)')).toBeInTheDocument();
    expect(screen.getByText('Test failure')).toBeInTheDocument();
  });
});
