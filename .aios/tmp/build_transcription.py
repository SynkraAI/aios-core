#!/usr/bin/env python3
"""
Build clean transcription markdown from JSON transcription.
LIVE RENNER DIA 23 - Imersao Palestras Poderosas
"""

import json
import re
import os

INPUT_PATH = '/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSO RENNER/LIVE RENNER DIA 23_transcription.json'
OUTPUT_PATH = '/Users/luizfosc/Dropbox/Dropbox Particular Fosc/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSO RENNER/LIVE RENNER DIA 23.md'

with open(INPUT_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)
segments = data['segments']


def fmt_ts(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


def clean_text(text):
    """Clean verbal tics and fix punctuation."""
    # Remove common verbal tics
    tics = [
        r'\b[Hh]um\b', r'\b[Uu]hm\b', r'\b[Ee]h\b', r'\b[Aa]h\b',
        r'\btipo assim\b', r'\bentao e isso\b',
    ]
    for tic in tics:
        text = re.sub(tic + r'[,.]?\s*', '', text)

    # Fix double spaces
    text = re.sub(r'  +', ' ', text)
    # Fix double periods (but not ellipsis)
    text = re.sub(r'\.\.(?!\.)', '.', text)
    # Fix space before punctuation
    text = re.sub(r'\s+([,.])', r'\1', text)
    return text.strip()


def build_paragraph(segs):
    """Combine segments into cleaned paragraph text."""
    texts = []
    for s in segs:
        t = s['text'].strip()
        if t:
            texts.append(t)
    raw = ' '.join(texts)
    return clean_text(raw)


# Define sections with topic-based titles, segment ranges
# Each tuple: (title, start_idx, end_idx)
sections = [
    ("Abertura e Sacadas do Dia Anterior", 0, 50),
    ("Sacada sobre Autonomia no Palco e Briefing com o Contratante", 37, 155),
    ("Substituindo Cache por Vendas no Palco", 155, 225),
    ("Coragem para Subir no Palco e Falar com o Coracao", 225, 300),
    ("Reconhecendo a Estrutura de Venda do Pitch", 300, 370),
    ("Depoimento da Participante sobre Pitch e Valor", 370, 450),
    ("Depoimento de Willer Meidt - Gratidao, Ambiente, Relacionamento e Espiritualidade", 465, 770),
    ("Renner Abre o Dia 3 - Comunidade e Filtro por Principios e Valores", 770, 890),
    ("A Origem da Imersao Palestras Poderosas e Michael Arruda", 890, 1040),
    ("Michael Arruda - O Poder da Mente e a Historia de Superacao", 1040, 1200),
    ("Michael Arruda - Como a Mente Cria Bloqueios na Infancia", 1200, 1340),
    ("Michael Arruda - Hipnoterapia e Exercicio de Destrave do Medo", 1340, 1480),
    ("Michael Arruda - Visualizacao Guiada e Processo de Perdao com a Crianca Interior", 1480, 1595),
    ("Renner Comenta o Poder da Mente e a Importancia do Treino", 1595, 1700),
    ("Renner Explica o Campeonato Mundial de Palestras Poderosas", 1700, 1870),
    ("Treino Simulado do Campeonato em Grupos de Cinco", 1870, 1965),
    ("Retomada do Treino e Niveis de Clareza ao Longo da Imersao", 1965, 2080),
    ("Regras do Campeonato - Reciclagem e Novatos", 2080, 2175),
    ("Exercicio de Depoimento em Duplas com Cronometro", 2175, 2280),
    ("Depoimento de Leo Donofrio - Da Frustacao a Mentoria e ao Faturamento", 2280, 2325),
    ("Renner sobre Leo Donofrio e a Jornada de Decisao", 2325, 2410),
    ("Renner Apresenta Bruno Juliani e Como se Conheceram", 2410, 2485),
    ("Bruno Juliani - Medo e a Metafora do Filme Frozen", 2485, 2670),
    ("Bruno Juliani - Frozen: Como Traumas da Infancia Bloqueiam Talentos", 2670, 2810),
    ("Bruno Juliani - Dinamica Livre Estou e Liberacao dos Medos", 2810, 3050),
    ("Renner - Os Cinco Pilares da Ciencia da Felicidade: Introducao", 3050, 3175),
    ("Renner - Felicidade versus Tristeza e a Regua da Satisfacao", 3175, 3290),
    ("Renner - Pilar 1: Presenca Plena", 3290, 3475),
    ("Renner - Pilar 2: Inteligencia Positiva e Emocoes Positivas", 3475, 3600),
    ("Renner - Pilar 3: Proposito como Algo que Transcende o Eu", 3600, 3710),
    ("Renner - Pilar 4: Realizacao versus Aquisicao", 3670, 3715),
    ("Renner - Pilar 5: Relacionamentos de Qualidade", 3715, 3810),
    ("Renner - A Surpresa para a Mae e o Video Emocional", 3790, 3835),
    ("Problema Tecnico e Perguntas sobre os Cinco Pilares", 3835, 3960),
    ("Preparacao para a Semifinal - Palestra de 2 Minutos", 3960, 4110),
    ("Dennis Pena - Planejamento para o Mercado de Palestras: Posicionamento", 4110, 4250),
    ("Dennis Pena - Produto Principal e o Poder do Nicho", 4250, 4350),
    ("Dennis Pena - Publico-Alvo e a Importancia de Ser Referencia", 4350, 4500),
    ("Dennis Pena - Autoavaliacao, Mapa e o que Agencias Analisam", 4500, 4650),
    ("Dennis Pena - Tipos de Palco e Estrategias de Vendas como Palestrante", 4650, 4950),
    ("Dennis Pena - Modelo de Negocio do Palestrante e Esteira de Produtos", 4950, 5250),
    ("Dennis Pena - Acoes Praticas, Conteudo e Marketing Digital para Palestrantes", 5250, 5500),
    ("Dennis Pena - Perguntas e Respostas sobre Carreira de Palestrante", 5500, 5700),
    ("Organizacao dos Grupos para a Semifinal do Campeonato", 5700, 5960),
    ("Anuncio dos Classificados e Repescagem do Campeonato", 5960, 6260),
    ("Semifinal do Campeonato Mundial de Palestras Poderosas", 6260, 6500),
    ("Final do Campeonato - Apresentacoes dos Finalistas", 6500, 6750),
    ("Final do Campeonato - Ultimas Apresentacoes e Votacao", 6750, 6926),
]


def build_section_text(start_idx, end_idx):
    """Build cleaned section text from segments, organized in paragraphs."""
    if start_idx >= len(segments) or end_idx > len(segments):
        end_idx = min(end_idx, len(segments))

    segs = segments[start_idx:end_idx]
    if not segs:
        return ""

    # Group segments into paragraphs based on pauses and topic shifts
    paragraphs = []
    current_para = []

    for i, s in enumerate(segs):
        text = s['text'].strip()
        if not text:
            continue

        current_para.append(s)

        # Create paragraph break every ~8-15 segments or at natural breaks
        if len(current_para) >= 12:
            para_text = build_paragraph(current_para)
            if para_text:
                paragraphs.append(para_text)
            current_para = []

    # Don't forget the last paragraph
    if current_para:
        para_text = build_paragraph(current_para)
        if para_text:
            paragraphs.append(para_text)

    return '\n\n'.join(paragraphs)


# Build the full markdown document
md_parts = []

# Header
md_parts.append("""# LIVE RENNER DIA 23

**Curso:** Imersao Palestras Poderosas - Renner
**Modulo:** CURSO RENNER
**Arquivo original:** `LIVE RENNER DIA 23.mp4`
**Duracao:** 05:39:32
**Idioma:** Portugues (BR)
**Data da transcricao:** 2026-02-07

---

## Resumo

Nesta terceira sessao da Imersao Palestras Poderosas, conduzida por Renner Silva, os participantes vivenciaram um dia intenso de conteudo, treino pratico e competicao. O dia comecou com os alunos compartilhando sacadas do dia anterior, seguido de reflexoes sobre briefing com contratantes, a etica no uso do pitch de vendas e a importancia de alinhar verdade pessoal com compromissos profissionais. Renner trouxe convidados especiais que marcaram profundamente a plateia com suas historias e ferramentas.

Michael Arruda, hipnoterapeuta e autor best-seller com mais de 11 milhoes de livros vendidos, compartilhou sua historia de superacao: da timidez extrema na infancia, passando pela perda do pai por infarto e da mae por cancer, ate descobrir na hipnoterapia seu proposito de vida. Michael conduziu uma sessao de visualizacao guiada com toda a plateia, trabalhando o perdao da crianca interior e desbloqueando medos que travavam os participantes. O exercicio ao vivo com a participante Lainy, que nunca havia falado em publico, demonstrou na pratica o poder da hipnose para eliminar o medo de palco.

Bruno Juliani apresentou uma palestra transformadora usando a metafora do filme Frozen da Disney para ilustrar como traumas de infancia bloqueiam dons e talentos. Atraves da historia da princesa Elsa, ele mostrou como o medo se instala na mente ainda na infancia e como e possivel se libertar. A dinamica coletiva cantando "Livre Estou" enquanto rasgavam papeis com seus medos escritos foi um momento de grande emocao e liberacao para os participantes.

Renner ensinou os cinco pilares da ciencia da felicidade baseados na psicologia positiva de Martin Seligman: presenca plena, inteligencia positiva, proposito, realizacao e relacionamentos de qualidade. Dennis Pena, dono da maior agencia de palestrantes do Brasil, trouxe um conteudo altamente pratico sobre como construir uma carreira de palestrante, abordando posicionamento, nicho, produto principal, publico-alvo, autoavaliacao e plano de acao para o mercado corporativo e digital.

O dia culminou com o Campeonato Mundial de Palestras Poderosas, onde os participantes competiram em grupos, passando por eliminatorias, repescagem, semifinal com palestras de dois minutos e a grande final no palco principal. Todo o evento refor\u00e7ou a filosofia central do metodo: treine ate a exaustao, fale com o coracao, use o roteiro dos sete passos e confie no processo.

### Pontos-Chave

- A mente cria bloqueios na infancia para nos proteger, mas esses mesmos bloqueios podem travar nossa vida adulta; ferramentas como hipnoterapia e ressignificacao ajudam a destravar esse potencial
- Todo palestrante precisa de um briefing claro com o contratante e deve alinhar sua verdade pessoal com o compromisso do evento
- Os cinco pilares da ciencia da felicidade sao: presenca plena, inteligencia positiva, proposito, realizacao e relacionamentos de qualidade
- Para construir carreira como palestrante, e fundamental ter posicionamento claro, produto principal unico, nicho especifico e plano de acao com metas mensuraveis
- O treino repetitivo e a reducao progressiva do tempo de palestra (de 5 para 2 minutos) sao metodos eficazes para dominar o roteiro e falar com naturalidade
- A coragem de subir no palco e contar sua historia autentica e mais importante que a tecnica perfeita, porque a verdade conecta e transforma
- A comunidade e o ambiente sao fatores decisivos para o crescimento pessoal e profissional; filtrar relacionamentos por principios e valores e essencial

---

## Transcricao Completa
""")

# Build each section
for title, start_idx, end_idx in sections:
    start_ts = fmt_ts(segments[min(start_idx, len(segments)-1)]['start'])
    end_ts = fmt_ts(segments[min(end_idx-1, len(segments)-1)]['end'])

    section_text = build_section_text(start_idx, end_idx)

    if section_text.strip():
        md_parts.append(f"""### {title}
> **Timestamp:** {start_ts} - {end_ts}

{section_text}
""")

# References section
md_parts.append("""---

## Referencias Mencionadas

- **Martin Seligman** - Psicologia positiva e os cinco pilares da felicidade (modelo PERMA)
- **Howard Gardner** - Teoria das multiplas inteligencias
- **Daniel Goleman** - Inteligencia emocional
- **Viktor Frankl** - "Em Busca de Sentido" e logoterapia (proposito como motor de sobrevivencia)
- **Clovis de Barros Filho** - Filosofo brasileiro, citado sobre autenticidade no palco
- **Gustavo Cerbasi** - Referencia em educacao financeira no Brasil
- **Rodrigo Cardoso** - Palestrante e ex-socio de Renner
- **Michael Arruda** - Hipnoterapeuta, diretor do Instituto Omni, autor best-seller com mais de 11 milhoes de livros vendidos
- **Bruno Juliani** - Coach e treinador de inteligencia emocional, palestra sobre Frozen e medos
- **Dennis Pena** - Dono da maior agencia de palestrantes do Brasil
- **Filme Frozen (Disney, 2014)** - Usado como metafora para bloqueios emocionais e liberacao de talentos
- **Filme Divertidamente (Disney/Pixar)** - Citado como ilustracao cientifica do funcionamento das emocoes
- **Marcelo Germano / EAG** - Empresa onde Renner conheceu Marcao
- **Marcia Luz** - Psicologa citada sobre gratidao (nao reclamar, nao criticar, nao julgar)
- **Musica "Trem-Bala" (Ana Vilela)** - Tocada no encerramento da palestra de Michael Arruda
- **Musica "Livre Estou" (Frozen)** - Usada na dinamica de liberacao dos medos por Bruno Juliani
""")

# Write the file
content = '\n'.join(md_parts)
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

# Validation
file_size = os.path.getsize(OUTPUT_PATH)
word_count = len(content.split())
line_count = content.count('\n')

print(f"File written: {OUTPUT_PATH}")
print(f"File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
print(f"Word count: {word_count:,}")
print(f"Line count: {line_count:,}")
print(f"Sections: {len(sections)}")

# Check for accents in template fields
template_fields = ['Transcricao', 'Modulo', 'Duracao', 'Resumo', 'Pontos-Chave', 'Referencias']
for field in template_fields:
    if field in content:
        print(f"  OK: '{field}' found")
    else:
        print(f"  WARN: '{field}' NOT found")

# Check for double periods
double_periods = len(re.findall(r'\.\.(?!\.)', content))
print(f"Double periods (non-ellipsis): {double_periods}")
