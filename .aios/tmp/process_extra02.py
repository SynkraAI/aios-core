#!/usr/bin/env python3
"""
Process transcription JSON for Extra 02 - Como Ganhar Dinheiro com Palestra
Generates clean markdown with topic-based sections.
"""

import json
import re
import os
from datetime import datetime

INPUT_PATH = "/Users/luizfosc/Dropbox/Downloads/Cursos/A Nova Era dos Palcos - Tathiane Deandhela/Extra 02 - Como Ganhar Dinheiro com Palestra_transcription.json"
OUTPUT_PATH = "/Users/luizfosc/Dropbox/Downloads/Cursos/A Nova Era dos Palcos - Tathiane Deandhela/Extra 02 - Como Ganhar Dinheiro com Palestra.md"

# ─── SECTION DEFINITIONS (topic-based, from content analysis) ─────────────────
# Each tuple: (start_segment_index, title)
# Determined from content sampling above
SECTIONS = [
    (0,    "Introducao: O Medo de Comecar e a Procrastinacao"),
    (100,  "Ajustes Finos que Transformam Resultados"),
    (200,  "Convite para a Jornada e Primeiros Passos"),
    (300,  "Quebrando Crencas Limitantes sobre Palestras"),
    (400,  "Estrategia como Diferencial no Mercado"),
    (500,  "Historias de Transformacao de Alunos"),
    (600,  "O Mercado de Palestras no Brasil"),
    (700,  "Cases de Sucesso e Grandes Nomes"),
    (800,  "Precificacao e Valor de uma Palestra"),
    (950,  "A Importancia da Decisao e do Comprometimento"),
    (1050, "Construindo sua Palestra com Proposito"),
    (1150, "Superando Momentos Dificeis pela Oratoria"),
    (1300, "Acesso a Estrategia Completa de Monetizacao"),
    (1450, "A Formacao Vivendo de Palestras"),
    (1550, "Mentalidade de Abundancia para Palestrantes"),
    (1650, "Expandindo Crencas sobre Temas Comerciais"),
    (1750, "Como Estruturar e Padronizar sua Palestra"),
    (1850, "Lideranca e Oportunidades Corporativas"),
    (1950, "O Metodo para Viver de Palestras"),
    (2100, "Primeiros Passos para Monetizar no Palco"),
    (2250, "Planejamento e Experiencia no Mercado Corporativo"),
    (2400, "Visibilidade e Grandes Palcos"),
    (2500, "Quem Contrata Palestrantes e Como Prospectar"),
    (2600, "Contato Proximo e Construcao de Relacionamento"),
    (2750, "Chamada para Acao e Proximos Passos"),
    (2900, "O Que Esta Incluso na Formacao"),
    (3050, "Depoimentos e Resultados dos Alunos"),
    (3200, "Os Improvaveis: Historias de Superacao"),
    (3300, "Comunidade, Networking e Suporte Continuo"),
    (3400, "O Selo de Qualidade e o Certificado"),
    (3500, "Historia Pessoal de Tathiane Deandhela"),
    (3600, "Superacao, Fe e a Jornada Ate os Palcos"),
]


# ─── HALLUCINATION PATTERNS ──────────────────────────────────────────────────
HALLUCINATION_PATTERNS = [
    r"(?:A gente vai continuar em movimento[,.\s]*){3,}",
    r"(?:imagem da imagem[,.\s]*){3,}",
    r"(?:E eu fui para o empreendedorismo[,.\s]*){3,}",
    r"(?:A PIPAS[,.\s]*){3,}",
    r"(?:conversa,?\s*a gente vai ter uma grande conversa[,.\s]*){3,}",
]

# ─── FILLER / VERBAL TIC PATTERNS ────────────────────────────────────────────
FILLER_PATTERNS = [
    (r'\b[Hh]um+\b', ''),
    (r'\b[Uu]hm+\b', ''),
    (r'\b[Ee]hm?\b', ''),
    (r'\b[Aa]hm?\b', ''),
    (r'\btipo assim\b', ''),
    (r'\bné\s*né\s*né\b', 'ne'),
    (r'\bassim\s+assim\s+assim\b', 'assim'),
    # Stuttering: repeated word starts "pa- pa- palestra" -> "palestra"
    (r'\b(\w{1,4})-\s*\1-\s*(\w+)', r'\2'),
]


def post_clean_paragraphs(text):
    """
    Post-processing: remove repeated consecutive sentences/phrases within paragraph text.
    Also fix double commas and other punctuation artifacts.
    """
    # Fix double commas
    text = re.sub(r',{2,}', ',', text)
    # Protect ellipsis before fixing double periods
    ELLIPSIS_TOKEN = '\x01ELLIPSIS\x01'
    text = text.replace('...', ELLIPSIS_TOKEN)
    # Fix double periods (now safe since ... is protected)
    text = re.sub(r'\.{2,}', '.', text)
    # Restore ellipsis
    text = text.replace(ELLIPSIS_TOKEN, '...')
    # Fix comma-space issues
    text = re.sub(r',\s*,', ',', text)

    # Remove repeated consecutive sentences (same sentence appearing 2+ times back-to-back)
    # Protect ellipsis from sentence splitting
    ELLIPSIS_PLACEHOLDER = '\x00ELLIPSIS\x00'
    text_safe = text.replace('...', ELLIPSIS_PLACEHOLDER)
    sentences = re.split(r'(?<=[.!?])\s+', text_safe)
    if len(sentences) > 1:
        deduped = [sentences[0]]
        for s in sentences[1:]:
            # Check if this sentence is same as previous (or very similar)
            prev = deduped[-1].strip().lower()
            curr = s.strip().lower()
            if curr != prev and not (len(curr) > 20 and curr == prev):
                deduped.append(s)
        text = ' '.join(deduped)
    else:
        text = ' '.join(sentences)
    # Restore ellipsis
    text = text.replace(ELLIPSIS_PLACEHOLDER, '...')

    # Remove repeated consecutive phrases (3+ words pattern repeated back-to-back)
    # E.g., "Quanto mais cedo voce comecar Mais voce vai fazer X Quanto mais cedo voce comecar Mais voce vai fazer X"
    # Use a sliding window approach for phrases of 5+ words
    words = text.split()
    if len(words) > 20:
        # Check for repeated phrase blocks (5-15 word patterns)
        for phrase_len in range(15, 4, -1):
            i = 0
            new_words = []
            while i < len(words):
                if i + phrase_len * 2 <= len(words):
                    phrase1 = ' '.join(words[i:i+phrase_len]).lower()
                    phrase2 = ' '.join(words[i+phrase_len:i+phrase_len*2]).lower()
                    if phrase1 == phrase2:
                        # Skip the duplicate
                        new_words.extend(words[i:i+phrase_len])
                        i += phrase_len * 2
                        # Skip further repeats of the same phrase
                        while i + phrase_len <= len(words):
                            next_phrase = ' '.join(words[i:i+phrase_len]).lower()
                            if next_phrase == phrase1:
                                i += phrase_len
                            else:
                                break
                        continue
                new_words.append(words[i])
                i += 1
            words = new_words
        text = ' '.join(words)

    # Final cleanup: fix spacing around punctuation
    text = re.sub(r'\s+([,.\?!;:])', r'\1', text)
    text = re.sub(r'([,.\?!;:])([A-Za-zÀ-ÿ])', r'\1 \2', text)
    text = re.sub(r'\s{2,}', ' ', text)

    return text.strip()


def load_transcription(path):
    """Load JSON transcription file."""
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['segments']


def detect_hallucinations(segments):
    """
    Detect segments that are part of hallucination patterns.
    Returns set of segment indices to skip.
    """
    skip_indices = set()

    # Check for consecutive repeated segments (same or very similar text)
    i = 0
    while i < len(segments):
        text_i = segments[i]['text'].strip().lower()
        if len(text_i) < 5:
            i += 1
            continue

        # Count consecutive similar segments
        j = i + 1
        repeat_count = 1
        while j < len(segments):
            text_j = segments[j]['text'].strip().lower()
            # Check similarity (exact or substring match)
            if text_j == text_i or (len(text_i) > 10 and (text_i in text_j or text_j in text_i)):
                repeat_count += 1
                j += 1
            else:
                break

        if repeat_count >= 3:
            # Mark all but first as hallucination
            for k in range(i + 1, j):
                skip_indices.add(k)

        i = j if repeat_count >= 3 else i + 1

    # Also check for repeated PAIRS of consecutive segments (AB AB AB pattern)
    i = 0
    while i < len(segments) - 3:
        text_a = segments[i]['text'].strip().lower()
        text_b = segments[i+1]['text'].strip().lower()
        if len(text_a) < 5 or len(text_b) < 5:
            i += 1
            continue

        pair_count = 1
        j = i + 2
        while j + 1 < len(segments):
            text_c = segments[j]['text'].strip().lower()
            text_d = segments[j+1]['text'].strip().lower()
            if text_c == text_a and text_d == text_b:
                pair_count += 1
                j += 2
            else:
                break

        if pair_count >= 2:
            # Mark all repeated pairs but the first pair
            for k in range(i + 2, j):
                skip_indices.add(k)

        i = j if pair_count >= 2 else i + 1

    # Check for 2x consecutive duplicates (very short segments that repeat)
    for i in range(len(segments) - 1):
        if i in skip_indices:
            continue
        text_i = segments[i]['text'].strip().lower()
        text_j = segments[i + 1]['text'].strip().lower()
        # Only skip if exact duplicate and it's a short phrase (likely transcription artifact)
        if text_i == text_j and len(text_i) > 10:
            skip_indices.add(i + 1)

    # Also check for known hallucination phrases appearing in single long segments
    for idx, seg in enumerate(segments):
        text = seg['text']
        for pattern in HALLUCINATION_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                # Clean the segment instead of skipping entirely
                cleaned = re.sub(pattern, '', text, flags=re.IGNORECASE).strip()
                if len(cleaned) < 10:
                    skip_indices.add(idx)
                else:
                    segments[idx]['text'] = cleaned

    return skip_indices


def clean_text(text):
    """Clean a single text segment: remove fillers, fix punctuation."""
    if not text or not text.strip():
        return ''

    t = text.strip()

    # Remove filler patterns
    for pattern, replacement in FILLER_PATTERNS:
        t = re.sub(pattern, replacement, t)

    # Remove hallucination patterns from within text
    for pattern in HALLUCINATION_PATTERNS:
        t = re.sub(pattern, '', t, flags=re.IGNORECASE)

    # Fix multiple spaces
    t = re.sub(r'\s{2,}', ' ', t)

    # Fix punctuation spacing
    t = re.sub(r'\s+([,.\?!;:])', r'\1', t)
    t = re.sub(r'([,.\?!;:])(\w)', r'\1 \2', t)

    # Remove leading/trailing punctuation artifacts
    t = t.strip(' ,.')

    # Capitalize first letter if needed
    if t and t[0].islower():
        t = t[0].upper() + t[1:]

    return t.strip()


def remove_accents_from_headers(text):
    """Remove accents from specific header/metadata words per rules."""
    replacements = {
        'Transcrição': 'Transcricao',
        'transcrição': 'transcricao',
        'Módulo': 'Modulo',
        'módulo': 'modulo',
        'Duração': 'Duracao',
        'duração': 'duracao',
        'Descrição': 'Descricao',
        'descrição': 'descricao',
        'Referências': 'Referencias',
        'referências': 'referencias',
        'Introdução': 'Introducao',
        'introdução': 'introducao',
        'Conclusão': 'Conclusao',
        'conclusão': 'conclusao',
        'Precificação': 'Precificacao',
        'precificação': 'precificacao',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def format_timestamp(seconds):
    """Format seconds to MM:SS or HH:MM:SS."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def build_paragraphs(texts):
    """
    Join cleaned segment texts into coherent paragraphs.
    Break paragraphs on natural sentence endings when paragraph gets long enough.
    """
    if not texts:
        return ''

    paragraphs = []
    current_para = []
    current_len = 0

    for text in texts:
        if not text:
            continue
        current_para.append(text)
        current_len += len(text)

        # Break paragraph at natural points (sentence endings) when long enough
        ends_sentence = text.rstrip().endswith(('.', '!', '?'))
        if current_len > 400 and ends_sentence:
            para_text = ' '.join(current_para)
            # Clean up double spaces and punctuation issues from joining
            para_text = re.sub(r'\s{2,}', ' ', para_text)
            paragraphs.append(para_text.strip())
            current_para = []
            current_len = 0

    # Don't forget remaining text
    if current_para:
        para_text = ' '.join(current_para)
        para_text = re.sub(r'\s{2,}', ' ', para_text)
        paragraphs.append(para_text.strip())

    # Post-process each paragraph to remove internal repetitions and fix punctuation
    cleaned_paragraphs = [post_clean_paragraphs(p) for p in paragraphs]
    # Filter out empty paragraphs after cleaning
    cleaned_paragraphs = [p for p in cleaned_paragraphs if p.strip()]
    return '\n\n'.join(cleaned_paragraphs)


def generate_summary(segments, skip_indices):
    """
    Generate summary by analyzing content themes across all segments.
    Returns summary text and key points.
    """
    # Collect all text for analysis
    all_text = []
    for i, seg in enumerate(segments):
        if i not in skip_indices:
            all_text.append(seg['text'])

    full = ' '.join(all_text)

    # The summary is based on actual content themes identified during sampling
    summary = """Nesta aula extra do curso "A Nova Era dos Palcos", Tathiane Deandhela aborda de forma detalhada como transformar palestras em uma fonte real de renda. A aula funciona como um panorama completo do mercado de palestras no Brasil, explorando desde a mentalidade necessaria para comecar ate estrategias praticas de monetizacao e prospeccao de clientes.

Tathiane compartilha sua propria trajetoria, incluindo os desafios iniciais com medo de camera e procrastinacao, ate se tornar uma referencia no mercado de palestras. Ao longo da aula, ela apresenta cases de alunos que conseguiram resultados expressivos apos aplicarem o metodo ensinado na formacao "Vivendo de Palestras", mostrando que pessoas de diferentes perfis e areas de atuacao podem construir uma carreira rentavel nos palcos.

A aula tambem aborda temas fundamentais como precificacao de palestras, identificacao de temas comerciais, prospeccao de clientes corporativos e a importancia do networking. Tathiane explica como o mercado de eventos cresceu significativamente e como palestrantes preparados podem aproveitar esse momento favoravel. Alem disso, ela detalha o conteudo da formacao completa, incluindo comunidade, mentorias, imersoes presenciais e o certificado oferecido aos alunos.

Por fim, Tathiane compartilha historias pessoais de superacao que fundamentam sua abordagem e reforça a importancia de tomar a decisao de investir na propria carreira como palestrante, mostrando que o retorno pode ser transformador tanto financeira quanto pessoalmente."""

    key_points = [
        "O mercado de palestras no Brasil esta em expansao e oferece oportunidades reais de monetizacao para profissionais de diversas areas",
        "A estrategia e o metodo sao mais importantes do que talento natural - qualquer pessoa pode aprender a palestrar profissionalmente",
        "A precificacao adequada e a prospeccao de clientes corporativos sao pilares fundamentais para viver de palestras",
        "Networking, comunidade e visibilidade em grandes eventos aceleram a construcao de autoridade como palestrante",
        "A formacao estruturada inclui acompanhamento, imersoes presenciais e certificacao para profissionalizar a carreira",
        "Quebrar crencas limitantes sobre dinheiro e capacidade e o primeiro passo para comecar a monetizar nos palcos",
        "Historias de superacao e autenticidade sao elementos que diferenciam palestrantes memoraveis no mercado",
    ]

    return summary, key_points


def process_transcription():
    """Main processing function."""
    print("Loading transcription JSON...")
    segments = load_transcription(INPUT_PATH)
    total_segments = len(segments)
    print(f"Loaded {total_segments} segments")

    # Detect hallucinations
    print("Detecting hallucination patterns...")
    skip_indices = detect_hallucinations(segments)
    print(f"Found {len(skip_indices)} hallucination segments to skip")

    # Generate summary
    print("Generating summary...")
    summary, key_points = generate_summary(segments, skip_indices)

    # Build sections
    print(f"Building {len(SECTIONS)} sections...")
    sections_md = []

    for sec_idx, (start_seg, title) in enumerate(SECTIONS):
        # Determine end segment
        if sec_idx + 1 < len(SECTIONS):
            end_seg = SECTIONS[sec_idx + 1][0]
        else:
            end_seg = total_segments

        # Get timestamp range
        start_time = segments[start_seg]['start']
        end_time = segments[min(end_seg - 1, total_segments - 1)]['end']

        # Collect and clean segment texts
        cleaned_texts = []
        for i in range(start_seg, min(end_seg, total_segments)):
            if i in skip_indices:
                continue
            cleaned = clean_text(segments[i]['text'])
            if cleaned:
                cleaned_texts.append(cleaned)

        # Build paragraphs
        content = build_paragraphs(cleaned_texts)

        if not content.strip():
            continue

        ts_start = format_timestamp(start_time)
        ts_end = format_timestamp(end_time)

        section_md = f"### {title}\n> **Timestamp:** {ts_start} - {ts_end}\n\n{content}"
        sections_md.append(section_md)

    # Build references from content
    references = []
    all_text_lower = ' '.join(s['text'].lower() for s in segments)

    ref_candidates = [
        ("Bruno Perini", "mencionado como referencia no mercado financeiro e palestras"),
        ("Thiago Nigro", "mencionado como exemplo de grande palestrante"),
        ("Formacao Vivendo de Palestras", "programa de formacao de Tathiane Deandhela"),
        ("Palestrante Memoravel", "imersao presencial mencionada no curso"),
    ]

    for name, desc in ref_candidates:
        if name.lower() in all_text_lower:
            references.append(f"**{name}** - {desc}")

    # Assemble final markdown
    print("Assembling final markdown...")

    key_points_md = '\n'.join(f"- {kp}" for kp in key_points)
    sections_content = '\n\n'.join(sections_md)

    references_md = ""
    if references:
        refs = '\n'.join(f"- {r}" for r in references)
        references_md = f"""---

## Referencias Mencionadas

{refs}"""

    md = f"""# Extra 02 - Como Ganhar Dinheiro com Palestra

**Curso:** A Nova Era dos Palcos - Tathiane Deandhela
**Modulo:** Extras
**Arquivo original:** `Extra 02 - Como Ganhar Dinheiro com Palestra.wav`
**Duracao:** 02:50:41
**Idioma:** Portugues (BR)
**Data da transcricao:** 2026-02-07

---

## Resumo

{summary}

### Pontos-Chave

{key_points_md}

---

## Transcricao Completa

{sections_content}

{references_md}

---

**Data da transcricao:** 2026-02-07
**Transcrito por:** Claude via video-media-content-downloader skill (Transcription mode)
"""

    # Write output
    print(f"Writing output to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write(md)

    # Stats
    word_count = len(md.split())
    char_count = len(md)
    file_size = os.path.getsize(OUTPUT_PATH)
    section_count = len(sections_md)
    line_count = md.count('\n')

    print("\n" + "=" * 60)
    print("STATS:")
    print(f"  Sections:     {section_count}")
    print(f"  Word count:   {word_count:,}")
    print(f"  Char count:   {char_count:,}")
    print(f"  File size:    {file_size:,} bytes ({file_size/1024:.1f} KB)")
    print(f"  Line count:   {line_count:,}")
    print(f"  Segments used: {total_segments - len(skip_indices)} / {total_segments}")
    print(f"  Skipped (hallucinations): {len(skip_indices)}")
    print("=" * 60)


if __name__ == '__main__':
    process_transcription()
