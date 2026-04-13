'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { type RadarData, type Urgency, URGENCY_ORDER } from '@/lib/types';
import KanbanBoard from '@/components/KanbanBoard';
import GlobalAnalysis from '@/components/GlobalAnalysis';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Dashboard() {
  const [data, setData] = useState<RadarData | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  // Ignore SSE updates right after our own save (avoid echo)
  const ignoreUntilRef = useRef<number>(0);

  // SSE live sync — watches file for external changes (Obsidian edits)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      eventSource = new EventSource('/api/projects/watch');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'update' && payload.data) {
            // Skip if this is the echo from our own save
            if (Date.now() < ignoreUntilRef.current) return;

            setData(payload.data);
            setSynced(true);
            setError(null);

            // Flash synced indicator briefly
            setTimeout(() => setSynced(false), 2000);
          }
        } catch {
          // Ignore parse errors
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        // Reconnect after 3s
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch');
      const json: RadarData = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    }
  }, []);

  const saveData = useCallback(
    async (newData: RadarData) => {
      setSaving(true);
      // Ignore SSE updates for 3s after save to avoid echo loop
      ignoreUntilRef.current = Date.now() + 3000;
      try {
        const res = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newData),
        });
        if (!res.ok) throw new Error('Failed to save');
        const json = await res.json();
        setLastSaved(json.timestamp);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar');
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const handleMove = useCallback(
    (projectId: string, from: Urgency, to: Urgency, sourceIndex: number, destIndex: number) => {
      if (!data) return;

      const newData = { ...data, sections: { ...data.sections } };
      const sourceList = [...newData.sections[from]];
      const destList = from === to ? sourceList : [...newData.sections[to]];

      const [moved] = sourceList.splice(sourceIndex, 1);
      moved.urgency = to;
      destList.splice(destIndex, 0, moved);

      newData.sections[from] = sourceList;
      if (from !== to) {
        newData.sections[to] = destList;
      }

      setData(newData);
      saveData(newData);
    },
    [data, saveData]
  );

  const handleToggleCheckbox = useCallback(
    (projectId: string, checkboxIndex: number) => {
      if (!data) return;

      const newData = { ...data, sections: { ...data.sections } };

      for (const urgency of URGENCY_ORDER) {
        const list = newData.sections[urgency];
        const idx = list.findIndex((p) => p.id === projectId);
        if (idx === -1) continue;

        const newList = [...list];
        const project = { ...newList[idx] };
        const newCheckboxes = [...project.checkboxes];
        newCheckboxes[checkboxIndex] = {
          ...newCheckboxes[checkboxIndex],
          checked: !newCheckboxes[checkboxIndex].checked,
        };
        project.checkboxes = newCheckboxes;
        newList[idx] = project;
        newData.sections[urgency] = newList;
        break;
      }

      setData(newData);
      saveData(newData);
    },
    [data, saveData]
  );

  // Helper: find and update a project's checkboxes in any section
  const updateProjectCheckboxes = useCallback(
    (projectId: string, updater: (checkboxes: RadarData['sections']['urgente'][0]['checkboxes']) => RadarData['sections']['urgente'][0]['checkboxes']) => {
      if (!data) return;
      const newData = { ...data, sections: { ...data.sections } };

      for (const urgency of URGENCY_ORDER) {
        const list = newData.sections[urgency];
        const idx = list.findIndex((p) => p.id === projectId);
        if (idx === -1) continue;

        const newList = [...list];
        const project = { ...newList[idx] };
        project.checkboxes = updater([...project.checkboxes]);
        newList[idx] = project;
        newData.sections[urgency] = newList;
        break;
      }

      setData(newData);
      saveData(newData);
    },
    [data, saveData]
  );

  const handleAddCheckbox = useCallback(
    (projectId: string, text: string) => {
      updateProjectCheckboxes(projectId, (cbs) => [...cbs, { text, checked: false }]);
    },
    [updateProjectCheckboxes]
  );

  const handleDeleteCheckbox = useCallback(
    (projectId: string, index: number) => {
      updateProjectCheckboxes(projectId, (cbs) => cbs.filter((_, i) => i !== index));
    },
    [updateProjectCheckboxes]
  );

  const handleEditCheckbox = useCallback(
    (projectId: string, index: number, newText: string) => {
      updateProjectCheckboxes(projectId, (cbs) =>
        cbs.map((cb, i) => (i === index ? { ...cb, text: newText } : cb))
      );
    },
    [updateProjectCheckboxes]
  );

  const handleToggleExpand = useCallback((projectId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  }, []);

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <p className="text-semantic-error text-lg mb-2">Erro ao carregar radar</p>
          <p className="text-text-secondary text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 rounded-btn font-semibold text-sm
              transition-colors"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--bg-primary)',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-text-secondary text-sm animate-pulse font-mono">Carregando radar...</div>
      </div>
    );
  }

  const totalActive = URGENCY_ORDER.filter((u) => u !== 'concluidos').reduce(
    (sum, u) => sum + data.sections[u].length,
    0
  );
  const totalDone = data.sections.concluidos.length;

  return (
    <div className="min-h-screen p-6 bg-primary">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl text-text-primary uppercase tracking-wider">
            Radar de Projetos
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Arraste projetos entre colunas para mudar urgência
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {saving && (
            <span className="text-accent-primary text-xs animate-pulse font-mono">Salvando...</span>
          )}
          {synced && !saving && (
            <span className="text-semantic-success text-xs animate-fade-in font-mono">
              ⟳ Sincronizado do Obsidian
            </span>
          )}
          {lastSaved && !saving && !synced && (
            <span className="text-text-secondary text-xs font-mono">
              Salvo {new Date(lastSaved).toLocaleTimeString('pt-BR')}
            </span>
          )}
          {error && data && (
            <span className="text-semantic-error text-xs">{error}</span>
          )}
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)' }}
            title="Live sync ativo"
          />
        </div>
      </header>

      <GlobalAnalysis content={data.globalAnalysis} totalActive={totalActive} totalDone={totalDone} />

      <KanbanBoard
        data={data}
        expandedCards={expandedCards}
        onMove={handleMove}
        onToggleCheckbox={handleToggleCheckbox}
        onAddCheckbox={handleAddCheckbox}
        onDeleteCheckbox={handleDeleteCheckbox}
        onEditCheckbox={handleEditCheckbox}
        onToggleExpand={handleToggleExpand}
      />
    </div>
  );
}
