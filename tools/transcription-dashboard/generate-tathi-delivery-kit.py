#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path


ROOT = Path(
    "/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/"
    "LUIZFOSC/CURSOS E TRANSCRIÇÕES/Tathi Deândhela/Palestrante Memorável"
)
SCULPT_READY = ROOT / "_pipeline" / "sculpt-ready"
DISTILL = ROOT / "distill"
CURATED = ROOT / "kb" / "refined" / "curated"
FINAL = ROOT / "_pipeline" / "final-delivery"


def read_json(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def read_csv_rows(path: Path):
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def ensure_dirs():
    for sub in [
        "audit",
        "sculpt",
        "squad-bootstrap",
        "mind-clone-bootstrap",
        "manifests",
    ]:
        (FINAL / sub).mkdir(parents=True, exist_ok=True)


def get_distill_metrics():
    reports = sorted(DISTILL.glob("**/distillation-report.json"))
    quality = []
    frameworks = 0
    fragments = 0
    words = 0
    framework_names = Counter()

    for rp in reports:
        d = read_json(rp, {})
        quality.append(float(d.get("quality_score", 0) or 0))
        frameworks += int(d.get("framework_count", 0) or 0)
        fragments += int(d.get("fragment_count", 0) or 0)
        words += int(d.get("word_count", 0) or 0)

        fw_path = rp.parent / "frameworks.json"
        fws = read_json(fw_path, [])
        if isinstance(fws, list):
            for fw in fws:
                if isinstance(fw, dict):
                    name = str(fw.get("name", "")).strip()
                    if name:
                        framework_names[name] += 1

    avg_q = round(sum(quality) / len(quality), 3) if quality else 0
    return {
        "report_count": len(reports),
        "avg_quality_score": avg_q,
        "framework_count": frameworks,
        "fragment_count": fragments,
        "word_count": words,
        "top_frameworks": framework_names.most_common(20),
    }


def get_corpus_markers(corpus_path: Path):
    if not corpus_path.exists():
        return []
    text = corpus_path.read_text(encoding="utf-8").lower()
    tokens = re.findall(r"[a-zà-ÿ]{3,}", text)
    stop = {
        "para", "com", "que", "uma", "não", "como", "mais", "isso", "você", "vou", "está",
        "aqui", "essa", "esse", "sua", "seu", "das", "dos", "nos", "nas", "por", "ser",
        "tem", "são", "ela", "ele", "também", "muito", "sobre", "aula", "módulo", "modulo",
    }
    c = Counter(t for t in tokens if t not in stop and len(t) >= 4)
    return c.most_common(80)


def write_audit(status: dict):
    out_json = FINAL / "audit" / "final-status.json"
    out_md = FINAL / "audit" / "FINAL-STATUS.md"
    out_json.write_text(json.dumps(status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    md = [
        "# Entrega Final — Status Consolidado",
        "",
        f"- Gerado em: {status['generated_at']}",
        f"- Aulas totais: {status['totals']['lessons']}",
        f"- Transcrições concluídas: {status['totals']['transcriptions_done']}",
        f"- Sculpt concluído: {status['totals']['sculpt_done']}",
        f"- Distill concluído: {status['totals']['distill_done']}",
        "",
        "## KB",
        f"- Conceitos base: {status['kb']['concept_count']}",
        f"- Conceitos refinados: {status['kb']['refined_kept']}",
        f"- Conceitos curados: {status['kb']['curated_kept']}",
        f"- Links do grafo: {status['kb']['link_count']}",
        "",
        "## Sculpt ingest",
        f"- Itens: {status['ingest']['total_items']}",
        f"- Chunks: {status['ingest']['chunks']}",
        f"- Formato canônico: {status['ingest']['canonical_format']}",
        "",
        "## Distill",
        f"- Relatórios: {status['distill']['report_count']}",
        f"- Qualidade média: {status['distill']['avg_quality_score']}",
        f"- Frameworks totais: {status['distill']['framework_count']}",
        f"- Fragments totais: {status['distill']['fragment_count']}",
    ]
    out_md.write_text("\n".join(md) + "\n", encoding="utf-8")


def write_sculpt_pack(ingest_manifest: dict):
    out = FINAL / "sculpt" / "SCULPT-EXECUTION-CHECKLIST.md"
    items = ingest_manifest.get("items", [])
    lines = [
        "# Sculpt Execution Checklist",
        "",
        "## Regra obrigatória",
        "- Usar apenas `transcription_clean.md` como fonte de verdade.",
        "- Não ingerir formatos paralelos de transcrição.",
        "",
        "## Ordem de ingestão",
    ]
    for item in items:
        lines.append(f"- F{item['phase']} #{item['order']}: `{item['path']}` ({item['kind']})")
    lines.extend(
        [
            "",
            "## Critério de concluído",
            "- 100% dos itens importados sem duplicação.",
            "- Busca por módulo e por aula validada.",
            "",
        ]
    )
    out.write_text("\n".join(lines), encoding="utf-8")


def write_squad_bootstrap(status: dict, curated_report: dict):
    cfg = {
        "squad_name": "Tathi_Deandhela",
        "purpose": "Orquestrar conteúdo, estratégia e assets baseados no curso Palestrante Memorável.",
        "source_of_truth": "transcription_clean.md",
        "knowledge_layers": [
            "transcription",
            "sculpt",
            "distill",
            "kb_refined_curated",
        ],
        "paths": {
            "course_root": str(ROOT),
            "sculpt_ready": str(SCULPT_READY),
            "final_delivery": str(FINAL),
        },
        "themes": curated_report.get("themes", {}),
        "quality_baseline": {
            "lessons": status["totals"]["lessons"],
            "distill_avg_quality": status["distill"]["avg_quality_score"],
        },
    }
    (FINAL / "squad-bootstrap" / "squad-seed-config.json").write_text(
        json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    md = [
        "# Squad Bootstrap — Tathi_Deandhela",
        "",
        "## Missão",
        "Transformar o acervo Tathi Deândhela em execução assistida: conteúdo, frameworks, posicionamento e venda.",
        "",
        "## Escopo inicial",
        "- Curadoria temática por: oratória, marketing, vendas e mindset.",
        "- Reuso de fragmentos e frameworks destilados.",
        "- Roteiros e respostas no estilo da Tathi (com governança).",
        "",
        "## Inputs prontos",
        f"- Corpus consolidado: `{SCULPT_READY / 'corpus' / 'tathi-palestrante-corpus.md'}`",
        f"- Curated KB: `{CURATED}`",
        f"- Distill reports: `{DISTILL}`",
        "",
        "## Themes (curated)",
    ]
    for k, v in (curated_report.get("themes", {}) or {}).items():
        md.append(f"- {k}: {v}")
    (FINAL / "squad-bootstrap" / "SQUAD-BOOTSTRAP.md").write_text(
        "\n".join(md) + "\n", encoding="utf-8"
    )


def write_mind_clone_bootstrap(status: dict, curated_report: dict, markers):
    kept = curated_report.get("kept", []) or []
    pillars = [k for k, _ in sorted((curated_report.get("themes", {}) or {}).items(), key=lambda x: x[1], reverse=True)]
    top_concepts = [c.get("concept") for c in kept[:20] if isinstance(c, dict)]
    dna = {
        "persona": "Tathi Deândhela — Palestrante Memorável",
        "pillars": pillars,
        "top_concepts": top_concepts,
        "tone_markers": [{"token": t, "freq": n} for t, n in markers[:40]],
        "constraints": [
            "Não inventar dados ou histórias que não existam no corpus.",
            "Priorizar aplicabilidade prática e passo a passo.",
            "Manter linguagem direta e orientada à ação.",
        ],
        "source_paths": {
            "curated_report": str(CURATED / "curation-report.json"),
            "knowledge_graph": str(CURATED / "knowledge-graph-curated.json"),
            "corpus": str(SCULPT_READY / "corpus" / "tathi-palestrante-corpus.md"),
        },
    }
    (FINAL / "mind-clone-bootstrap" / "mind-dna.json").write_text(
        json.dumps(dna, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    prompt = f"""# System Prompt Seed — Mind Clone Tathi Deândhela

Você é uma assistente especializada em comunicação, posicionamento e vendas para palestrantes.
Base de verdade: corpus do curso Palestrante Memorável.

Pilares prioritários: {", ".join(pillars[:4])}
Conceitos prioritários: {", ".join(top_concepts[:15])}

Regras:
1. Não invente fatos fora do corpus.
2. Responda em português do Brasil.
3. Traga recomendações práticas e estruturadas em passos.
4. Sempre que possível, conecte oratória + posicionamento + vendas.
5. Seja direta, clara e executável.
"""
    (FINAL / "mind-clone-bootstrap" / "system-prompt-seed.md").write_text(prompt, encoding="utf-8")

    md = [
        "# Mind Clone Bootstrap — Tathi Deândhela",
        "",
        f"- Aulas fonte: {status['totals']['lessons']}",
        f"- Conceitos curados: {status['kb']['curated_kept']}",
        f"- Qualidade média distill: {status['distill']['avg_quality_score']}",
        "",
        "## Pilares",
    ]
    md.extend([f"- {p}" for p in pillars])
    md.extend(
        [
            "",
            "## Marcadores de linguagem (top)",
        ]
    )
    md.extend([f"- {t} ({n})" for t, n in markers[:25]])
    (FINAL / "mind-clone-bootstrap" / "MIND-CLONE-BOOTSTRAP.md").write_text(
        "\n".join(md) + "\n", encoding="utf-8"
    )


def write_manifest(status: dict):
    files = sorted(str(p) for p in FINAL.rglob("*") if p.is_file())
    payload = {
        "generated_at": status["generated_at"],
        "final_delivery_root": str(FINAL),
        "file_count": len(files),
        "files": files,
    }
    (FINAL / "manifests" / "final-delivery-manifest.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main():
    ensure_dirs()

    catalog = read_csv_rows(SCULPT_READY / "manifests" / "transcripts-catalog.csv")
    ingest = read_json(SCULPT_READY / "ingest" / "ingestion-manifest.json", {})
    kb_stats = read_json(ROOT / "kb" / "stats.json", {})
    refined = read_json(ROOT / "kb" / "refined" / "refinement-summary.json", {})
    curated = read_json(CURATED / "curation-report.json", {})
    distill = get_distill_metrics()
    markers = get_corpus_markers(SCULPT_READY / "corpus" / "tathi-palestrante-corpus.md")

    total_lessons = len(catalog)
    status = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "totals": {
            "lessons": total_lessons,
            "transcriptions_done": total_lessons,
            "sculpt_done": distill["report_count"],
            "distill_done": distill["report_count"],
        },
        "kb": {
            "concept_count": kb_stats.get("concept_count", 0),
            "link_count": kb_stats.get("link_count", 0),
            "refined_kept": refined.get("kept_concepts", 0),
            "curated_kept": curated.get("kept_concepts", 0),
        },
        "ingest": {
            "total_items": ingest.get("total_items", 0),
            "chunks": sum(1 for i in ingest.get("items", []) if i.get("kind") == "corpus-chunk"),
            "canonical_format": ingest.get("canonical_transcript_format", "transcription_clean.md"),
        },
        "distill": distill,
    }

    write_audit(status)
    write_sculpt_pack(ingest)
    write_squad_bootstrap(status, curated)
    write_mind_clone_bootstrap(status, curated, markers)
    write_manifest(status)

    print(f"FINAL_DELIVERY={FINAL}")
    print(f"LESSONS={status['totals']['lessons']}")
    print(f"CURATED_CONCEPTS={status['kb']['curated_kept']}")
    print(f"DISTILL_REPORTS={distill['report_count']}")


if __name__ == "__main__":
    main()
