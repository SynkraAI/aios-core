import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Radar de Projetos — TDAH Dashboard',
  description: 'Dashboard visual para gerenciar projetos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="cyberpunk">
      <body>{children}</body>
    </html>
  );
}
