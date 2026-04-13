'use client';

interface GlobalAnalysisProps {
  content: string;
  totalActive: number;
  totalDone: number;
}

export default function GlobalAnalysis({ content, totalActive, totalDone }: GlobalAnalysisProps) {
  const lines = content.split('\n').filter((l) => l.trim());

  return (
    <div
      className="mb-8 rounded-card border border-accent-primary/20 p-6 shadow-accent-glow"
      style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl uppercase tracking-widest text-text-primary">
          Análise Global
        </h2>
        <div className="flex gap-4 text-sm">
          <span className="text-text-secondary">
            <span className="stat-value text-lg">{totalActive}</span>{' '}
            <span className="section-label">ativos</span>
          </span>
          <span className="text-text-secondary">
            <span className="stat-value text-lg text-semantic-success">{totalDone}</span>{' '}
            <span className="section-label">concluídos</span>
          </span>
        </div>
      </div>
      <div className="space-y-2 text-text-primary text-sm leading-relaxed">
        {lines.map((line, i) => {
          const cleaned = line.replace(/^>\s*/, '').replace(/^_/, '').replace(/_$/, '');
          if (!cleaned) return null;

          if (cleaned.startsWith('**🎯')) {
            return (
              <p key={i} className="text-accent-primary font-medium mt-3">
                {cleaned.replace(/\*\*/g, '')}
              </p>
            );
          }
          if (cleaned.startsWith('**🧹')) {
            return (
              <p key={i} className="text-semantic-info font-medium">
                {cleaned.replace(/\*\*/g, '')}
              </p>
            );
          }
          if (cleaned.startsWith('**⏸️')) {
            return (
              <p key={i} className="text-text-secondary font-medium">
                {cleaned.replace(/\*\*/g, '')}
              </p>
            );
          }

          return (
            <p key={i} className="text-text-primary/80">
              {cleaned.replace(/\*\*/g, '')}
            </p>
          );
        })}
      </div>
    </div>
  );
}
