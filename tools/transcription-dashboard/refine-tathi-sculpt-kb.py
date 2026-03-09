#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path('/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSOS E TRANSCRIÇÕES/Tathi Deândhela/Palestrante Memorável')
KB = ROOT / 'kb'
REF = KB / 'refined'
CONCEPTS_SRC = KB / 'concepts'
CONCEPTS_REF = REF / 'concepts'

DOMAIN_STOPWORDS = {
    'entao','gente','assim','esse','essa','isso','isso','mesmo','pode','coisa','coisas','agora','bem','quer','quero',
    'tenho','estou','vamos','sei','olha','depois','hoje','dia','fala','falar','falando','falo','sabe','vez','vezes',
    'tudo','nada','algo','alguma','algumas','algum','alguns','outra','outro','outras','outros','tinha','estava','for',
    'nem','mim','nossa','pelo','menos','mais','como','para','com','sem','sobre','entre','aqui','ali','la',
    'pessoa','pessoas','pessoal','esse','essas','esses','dele','dentro','parte','qualquer','mundo','mil','três','tres',
    'bom','boa','melhor','grande','legal','pouco','primeiro','final','hora','momento','forma',
}

THEMES = {
    'posicionamento': [
        'posicion','diferencial','nicho','autoridade','marca','branding','proposta','identidade','visao','valor'
    ],
    'conteudo_storytelling': [
        'conteudo','historia','história','roteiro','slide','apresent','comunic','criativ','tema','mensagem'
    ],
    'vendas_negociacao': [
        'venda','vender','persuas','prova','social','escassez','reciproc','afinidade','coerencia','coerência','oferta','empresa'
    ],
    'marketing_digital': [
        'instagram','linkedin','perfil','post','comentario','comentário','publicacao','publicação','audiencia','audiência','video','vídeo'
    ],
    'palco_performance': [
        'palestra','palestrante','evento','voz','vocal','palco','apresentacao','apresentação','orat','performance'
    ],
    'negocio_carreira': [
        'curso','trabalho','empresa','resultado','consultoria','estrateg','estratég','contabilidade','afiliado','permuta'
    ],
}

MODULE_THEME_MAP = {
    '00-boas-vindas': 'fundamentos_onboarding',
    '01-posicionar': 'posicionamento',
    '02-empoderar': 'marketing_digital',
    '03-aperfeicoar': 'conteudo_storytelling',
    '04-vender': 'vendas_negociacao',
    '05-consolidar': 'negocio_carreira',
    '06-aulas-bonus': 'palco_performance',
    '07-bonus-zero-ao-palestrante': 'palco_performance',
    '08-bonus-time-model-canvas': 'negocio_carreira',
    '09-pgg-experience': 'palco_performance',
}


def now_iso() -> str:
    return datetime.now().isoformat(timespec='seconds')


def normalize(s: str) -> str:
    s = s.strip().lower()
    s = ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s


def stemish(s: str) -> str:
    s = normalize(s)
    for suf in ('mente','coes','cao','sao','oes','ais','eis','is','es','s'):
        if len(s) > len(suf) + 3 and s.endswith(suf):
            s = s[:-len(suf)]
            break
    return s


def detect_theme(concept: str) -> str:
    cn = normalize(concept)
    for theme, keys in THEMES.items():
        for k in keys:
            if normalize(k) in cn or cn in normalize(k):
                return theme
    return 'outros_relevantes'


def build_lesson_module_map(nodes):
    mapping = {}
    for n in nodes:
        if n.get('type') == 'lesson':
            lid = n.get('id', '')
            mod = n.get('module')
            if lid and mod:
                mapping[lid] = mod
    return mapping


def concept_dominant_module(edges, concept_norm: str, lesson_module_map):
    target = f'concept:{concept_norm}'
    c = Counter()
    for e in edges:
        if e.get('to') != target:
            continue
        frm = e.get('from', '')
        if not frm.startswith('lesson:'):
            continue
        mod = lesson_module_map.get(frm)
        if mod:
            c[mod] += 1
    if not c:
        return None
    return c.most_common(1)[0][0]


def concept_weight(graph_edges, concept_norm: str) -> int:
    target = f'concept:{concept_norm}'
    return sum(1 for e in graph_edges if e.get('to') == target)


def main() -> None:
    REF.mkdir(parents=True, exist_ok=True)
    CONCEPTS_REF.mkdir(parents=True, exist_ok=True)

    graph = json.loads((KB / 'knowledge-graph.json').read_text(encoding='utf-8'))
    nodes = graph.get('nodes', [])
    edges = graph.get('edges', [])

    raw_concepts = [n['label'] for n in nodes if n.get('type') == 'concept' and n.get('label')]
    lesson_module_map = build_lesson_module_map(nodes)

    groups = defaultdict(list)
    for c in raw_concepts:
        n = normalize(c)
        st = stemish(c)
        key = st if st else n
        groups[key].append(c)

    refined = []
    discarded = []
    for key, variants in groups.items():
        canonical = sorted(variants, key=lambda x: (len(normalize(x)), x))[0]
        ncanon = normalize(canonical)

        if ncanon in DOMAIN_STOPWORDS or len(ncanon) <= 3:
            discarded.append({'group': key, 'canonical': canonical, 'reason': 'stopword_or_too_short', 'variants': sorted(set(variants))})
            continue

        weight = concept_weight(edges, ncanon)
        theme = detect_theme(canonical)
        dom_module = concept_dominant_module(edges, ncanon, lesson_module_map)
        if theme == 'outros_relevantes' and dom_module in MODULE_THEME_MAP:
            theme = MODULE_THEME_MAP[dom_module]
        refined.append({
            'concept': canonical,
            'concept_norm': ncanon,
            'group': key,
            'variants': sorted(set(variants)),
            'mention_links': weight,
            'theme': theme,
            'dominant_module': dom_module,
        })

    refined.sort(key=lambda x: (-x['mention_links'], x['concept']))

    top_refined = refined[:80]
    by_theme = defaultdict(list)
    for r in top_refined:
        by_theme[r['theme']].append(r)

    # Write refined concept files
    for r in top_refined:
        path = CONCEPTS_REF / f"{r['concept_norm']}.md"
        md = [
            '---',
            'type: concept',
            f"theme: {r['theme']}",
            f"mention_links: {r['mention_links']}",
            'source: kb/refined',
            '---',
            '',
            f"# {r['concept']}",
            '',
            '## Variantes',
        ]
        md.extend([f"- {v}" for v in r['variants']])
        md.append('')
        md.append('## Observacao')
        md.append('Conceito refinado automaticamente para ingestao no Sculpt.')
        md.append('')
        path.write_text('\n'.join(md), encoding='utf-8')

    # taxonomy refined
    tax = ['root:', '  themes:']
    for theme in sorted(by_theme.keys()):
        tax.append(f'    - {theme}')
    tax.append('  concepts_by_theme:')
    for theme in sorted(by_theme.keys()):
        tax.append(f'    {theme}:')
        for r in by_theme[theme][:20]:
            tax.append(f"      - {r['concept_norm']}")
    (REF / 'taxonomy-refined.yaml').write_text('\n'.join(tax) + '\n', encoding='utf-8')

    # index refined
    idx = ['# Tathi KB Refined (Sculpt 10/10)', '', f'Gerado em: {now_iso()}', '']
    idx.append('## Temas')
    for theme in sorted(by_theme.keys()):
        idx.append(f"- {theme} ({len(by_theme[theme])} conceitos)")
    idx.append('')
    for theme in sorted(by_theme.keys()):
        idx.append(f"## {theme}")
        for r in by_theme[theme][:25]:
            idx.append(f"- [[concepts/{r['concept_norm']}]] ({r['mention_links']} links)")
        idx.append('')
    (REF / 'index-refined.md').write_text('\n'.join(idx), encoding='utf-8')

    # graph refined
    refined_nodes = []
    refined_edges = []
    for theme in sorted(by_theme.keys()):
        refined_nodes.append({'id': f'theme:{theme}', 'type': 'theme', 'label': theme})
    for r in top_refined:
        refined_nodes.append({'id': f"concept:{r['concept_norm']}", 'type': 'concept', 'label': r['concept'], 'theme': r['theme']})
        refined_edges.append({'from': f"theme:{r['theme']}", 'to': f"concept:{r['concept_norm']}", 'type': 'groups'})

    (REF / 'knowledge-graph-refined.json').write_text(
        json.dumps({'nodes': refined_nodes, 'edges': refined_edges, 'generated_at': now_iso(), 'generator': 'local-refiner-v1'}, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )

    # reports
    (REF / 'dedup-report.json').write_text(
        json.dumps({'input_concepts': len(raw_concepts), 'groups': len(groups), 'refined_kept': len(refined), 'discarded': len(discarded), 'top_refined': len(top_refined), 'generated_at': now_iso()}, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )
    (REF / 'discarded-concepts.json').write_text(json.dumps(discarded, ensure_ascii=False, indent=2), encoding='utf-8')

    summary = {
        'generated_at': now_iso(),
        'input_concepts': len(raw_concepts),
        'kept_concepts': len(top_refined),
        'themes': {k: len(v) for k, v in sorted(by_theme.items())},
        'files': {
            'index': str(REF / 'index-refined.md'),
            'taxonomy': str(REF / 'taxonomy-refined.yaml'),
            'graph': str(REF / 'knowledge-graph-refined.json'),
            'dedup_report': str(REF / 'dedup-report.json'),
        }
    }
    (REF / 'refinement-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')

    print('REFINE_DONE')
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
