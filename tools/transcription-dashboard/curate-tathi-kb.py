#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path('/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSOS E TRANSCRIÇÕES/Tathi Deândhela/Palestrante Memorável')
REF = ROOT / 'kb' / 'refined'
CUR = REF / 'curated'
CUR_CONCEPTS = CUR / 'concepts'

KEEP_ALWAYS = {
    'palestra','palestrante','evento','conteudo','historia','video',
    'instagram','linkedin','foto',
    'vender','empresa','curso','resultado','trabalho',
    'vida','tempo','importante','sempre','seja','posso','conseguir','comecar','passo','exemplo','poder','colocar'
}

DISCARD_ALWAYS = {
    'acho','ainda','alguem','antes','cara','deixa','entendeu','estar','falei','falou','fazendo','fica','ficar',
    'muitas','nesse','quanto','tati','faco','pode'
}

THEME_MAP = {
    'oratoria_palco': {'palestra','palestrante','evento','video','conteudo','historia','exemplo'},
    'marketing_posicionamento': {'instagram','linkedin','foto','posso'},
    'vendas_negocio': {'vender','empresa','curso','resultado','trabalho','passo','colocar'},
    'mindset_execucao': {'vida','tempo','importante','sempre','seja','conseguir','comecar','poder'},
}


def now_iso() -> str:
    return datetime.now().isoformat(timespec='seconds')


def load_concept_weights(index_path: Path) -> dict[str, int]:
    pat = re.compile(r'\[\[concepts/(.*?)\]\] \((\d+) links\)')
    weights = {}
    for line in index_path.read_text(encoding='utf-8').splitlines():
        m = pat.search(line)
        if m:
            weights[m.group(1)] = int(m.group(2))
    return weights


def detect_theme(concept: str) -> str:
    for theme, bag in THEME_MAP.items():
        if concept in bag:
            return theme
    return 'suporte_contextual'


def read_title(md_path: Path) -> str:
    for line in md_path.read_text(encoding='utf-8', errors='ignore').splitlines():
        if line.startswith('# '):
            return line[2:].strip()
    return md_path.stem


def build_curated() -> None:
    CUR.mkdir(parents=True, exist_ok=True)
    CUR_CONCEPTS.mkdir(parents=True, exist_ok=True)

    weights = load_concept_weights(REF / 'index-refined.md')
    kept = []
    dropped = []

    for concept, links in sorted(weights.items(), key=lambda x: (-x[1], x[0])):
        if concept in DISCARD_ALWAYS:
            dropped.append({'concept': concept, 'links': links, 'reason': 'discard_list'})
            continue

        keep = links >= 1 or concept in KEEP_ALWAYS
        if not keep:
            dropped.append({'concept': concept, 'links': links, 'reason': 'low_signal'})
            continue

        src = REF / 'concepts' / f'{concept}.md'
        if not src.exists():
            dropped.append({'concept': concept, 'links': links, 'reason': 'missing_source'})
            continue

        title = read_title(src)
        theme = detect_theme(concept)
        priority = 'high' if links >= 3 else 'medium' if links >= 1 else 'support'

        out = CUR_CONCEPTS / f'{concept}.md'
        body = [
            '---',
            'type: concept',
            f'theme: {theme}',
            f'priority: {priority}',
            f'mention_links: {links}',
            'source: kb/refined/curated',
            f'generated_at: {now_iso()}',
            '---',
            '',
            f'# {title}',
            '',
            'Conceito curado para uso no Sculpt com foco em sinal alto e aplicabilidade.',
            '',
            '## Notas de Curadoria',
            f'- Tema: {theme}',
            f'- Prioridade: {priority}',
            f'- Evidência (links): {links}',
            '',
        ]
        out.write_text('\n'.join(body), encoding='utf-8')

        kept.append({'concept': concept, 'title': title, 'links': links, 'theme': theme, 'priority': priority})

    # taxonomy
    by_theme: dict[str, list[dict]] = {}
    for k in kept:
        by_theme.setdefault(k['theme'], []).append(k)
    for theme in by_theme:
        by_theme[theme].sort(key=lambda x: (-x['links'], x['concept']))

    tax = ['root:', '  themes:']
    for theme in sorted(by_theme):
        tax.append(f'    - {theme}')
    tax.append('  concepts_by_theme:')
    for theme in sorted(by_theme):
        tax.append(f'    {theme}:')
        for item in by_theme[theme]:
            tax.append(f"      - {item['concept']}")
    (CUR / 'taxonomy-curated.yaml').write_text('\n'.join(tax) + '\n', encoding='utf-8')

    # index
    idx = [
        '# Tathi KB Curated (Sculpt Ready)',
        '',
        f'Gerado em: {now_iso()}',
        f'Conceitos curados: {len(kept)}',
        '',
        '## Ordem de Ingestão Recomendada',
        '1. oratoria_palco',
        '2. marketing_posicionamento',
        '3. vendas_negocio',
        '4. mindset_execucao',
        '5. suporte_contextual',
        '',
    ]
    for theme in ['oratoria_palco','marketing_posicionamento','vendas_negocio','mindset_execucao','suporte_contextual']:
        items = by_theme.get(theme, [])
        idx.append(f'## {theme} ({len(items)})')
        for item in items:
            idx.append(f"- [[concepts/{item['concept']}]] — {item['links']} links — {item['priority']}")
        idx.append('')
    (CUR / 'index-curated.md').write_text('\n'.join(idx), encoding='utf-8')

    # graph curated
    nodes = []
    edges = []
    for theme in sorted(by_theme):
        nodes.append({'id': f'theme:{theme}', 'type': 'theme', 'label': theme})
        for item in by_theme[theme]:
            cid = f"concept:{item['concept']}"
            nodes.append({'id': cid, 'type': 'concept', 'label': item['title'], 'links': item['links'], 'priority': item['priority']})
            edges.append({'from': f'theme:{theme}', 'to': cid, 'type': 'groups'})
    (CUR / 'knowledge-graph-curated.json').write_text(
        json.dumps({'generated_at': now_iso(), 'generator': 'local-curator-v1', 'nodes': nodes, 'edges': edges}, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )

    # reports
    report = {
        'generated_at': now_iso(),
        'input_concepts': len(weights),
        'kept_concepts': len(kept),
        'dropped_concepts': len(dropped),
        'themes': {k: len(v) for k, v in sorted(by_theme.items())},
        'kept': kept,
    }
    (CUR / 'curation-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    (CUR / 'dropped-concepts.json').write_text(json.dumps(dropped, ensure_ascii=False, indent=2), encoding='utf-8')

    ingest = []
    for theme in ['oratoria_palco','marketing_posicionamento','vendas_negocio','mindset_execucao','suporte_contextual']:
        for item in by_theme.get(theme, []):
            ingest.append(str(CUR_CONCEPTS / f"{item['concept']}.md"))
    (CUR / 'ingest-order.txt').write_text('\n'.join(ingest) + ('\n' if ingest else ''), encoding='utf-8')

    print('CURATION_DONE')
    print(json.dumps({'kept': len(kept), 'dropped': len(dropped), 'themes': report['themes']}, ensure_ascii=False))


if __name__ == '__main__':
    build_curated()
