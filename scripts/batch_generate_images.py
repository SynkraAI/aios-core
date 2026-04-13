
import os
import time
from google import genai
from google.genai import types
import base64

# Configuração da API
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    print("ERRO: Variável de ambiente GOOGLE_API_KEY não encontrada.")
    exit(1)

client = genai.Client(api_key=api_key)

# Configurações de Destino
DEST_DIR = "/Users/luizfosc/aios-core/docs/projects/1 - App ppt Ensinio Talks/imagens"
os.makedirs(DEST_DIR, exist_ok=True)

# Usando o modelo mais recente disponível: imagen-4.0
MODEL_ID = 'imagen-4.0-generate-001'

# Lista de Imagens para Gerar
images_to_generate = [
    # DIAGRAMAS
    {"id": "d1", "filename": "01-executor-orquestrador.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: Editorial infographic on dark background #0a0a0a, amber #f59e0b accents, thin white lines, Inter/Montserrat sans-serif typography, negative space, high contrast, minimalist, no clutter, 16:9 aspect ratio. ALL TEXT IN BRAZILIAN PORTUGUESE with correct accents (acentuação, cedilhas, tildes). Do NOT translate to English. Proper names stay as-is. Minimalist editorial infographic. LEFT side: a lone figure with text label above reading "EXECUTOR", typing on a single computer, isolated. RIGHT side: the same figure elevated on a podium with text label above reading "ORQUESTRADOR", conducting 5 glowing nodes with Portuguese labels "IA", "DESIGN", "CÓDIGO", "DADOS", "TESTES", connected by thin amber lines forming a network. Big bold Portuguese title on top: "CÓDIGO É COMMODITY. ORQUESTRAR É A NOVA HABILIDADE.\""""},
    {"id": "d2", "filename": "02-vibe-coding-vs-sdd.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark bg #0a0a0a, amber #f59e0b, thin white lines, Inter/Montserrat, pt-BR text with accents, 16:9. Split-screen comparison. LEFT column (red tinted) with Portuguese label 'VIBE CODING': chaotic zigzag path with loops, question marks, figure scratching head, tangled wires, tag 'RÁPIDO, MAS FRÁGIL'. RIGHT column (amber tinted) with label 'SPEC-DRIVEN DEVELOPMENT (SDD)': clean linear flow with 4 boxes 'SPEC → PLANO → BUILD → ENTREGA', amber arrows, blueprint icon, tag 'COMEÇO LENTO, ESCALA RÁPIDA'. Title: 'OS DOIS JEITOS DE CONSTRUIR COM IA'."""},
    {"id": "d3", "filename": "03-janela-contexto.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b accents, pt-BR text with accents, 16:9, isometric editorial. Isometric illustration. Glowing work desk labeled 'JANELA DE CONTEXTO' with papers, files, holographic code snippets piled. Capacity bar above shows '87% CHEIA' in amber. LEFT: figure labeled 'VOCÊ' holds a broom labeled 'CLAUDE.MD + MEMORY.MD', sweeping papers into archive folder labeled 'MEMÓRIA PERSISTENTE'. RIGHT: another desk overflowing, papers falling, label 'SEM GERENCIAMENTO — AS COISAS SE PERDEM'. Title on top: 'VOCÊ É O GERENTE DA SUA JANELA DE CONTEXTO'. Inter/Montserrat typography."""},
    {"id": "d4", "filename": "04-entp-vs-istj.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, pt-BR with accents, 16:9. Split comparison. Center: glowing AI core labeled 'CLAUDE CODE'. Two arms extending L/R. LEFT skin 'USUÁRIO ENTP (Fosc)': playful colorful speech bubble, emojis, metaphors icons, lightbulb for contextual tips, informal vibe. Caption: 'Quer metáforas, humor, tangentes, visão ampla.' RIGHT skin 'USUÁRIO ISTJ': clean structured bubble, bullets, checklists, no emojis, formal. Caption: 'Quer respostas diretas, estrutura, sem firula, passos comprovados.' Between: box 'Squad de MBTI analisou cada usuário e customizou o CLAUDE.MD para cada um.' Title: 'UMA IA. DUAS PERSONALIDADES. AMBAS CERTAS.'"""},
    {"id": "d5", "filename": "05-fonte-de-verdade.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, pt-BR with accents, 16:9, minimalist network diagram. Center: glowing amber cube labeled 'FONTE DE VERDADE' with sub-labels 'DESIGN SYSTEM', 'DOCS DA API', 'REGRAS DE NEGÓCIO'. Around it, 6 satellite nodes in a circle: 'FRONTEND', 'BACKEND', 'MOBILE', 'TESTES', 'DOCS', 'AGENTES DE IA'. Thin amber lines connect satellites to center cube only (not to each other). Small box bottom-right: tangled mess labeled 'SEM FONTE DE VERDADE' with chaotic connections. Title: 'UMA VERDADE, MUITOS CONSUMIDORES'."""},
    {"id": "d6", "filename": "06-piramide-hierarquia.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, pt-BR with accents, 16:9. Editorial pyramid diagram. 4-tier pyramid with glowing amber borders, front angle. From top to bottom: TIER 1 (top, largest): 'SQUADS — times especializados', icon of multiple people. TIER 2: 'AGENTES — especialistas individuais', single person icon. TIER 3: 'SKILLS — habilidades', lightbulb icon. TIER 4 (bottom): 'TOOLS — ferramentas', wrench icon. Right side caption: 'Ter a skill certa e a tool certa é INÚTIL se você pede pra pessoa errada fazer.' Clean infographic."""},
    {"id": "d7", "filename": "07-anatomia-mind.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, pt-BR with accents, 16:9, anatomical style. Center: glowing silhouette of a human head in profile, brain visible with circuit patterns inside. Four lines extend from brain outward to labeled cards: 'VOICE DNA — como falam' (waveform icon), 'THINKING DNA — como raciocinam' (neural network icon), 'FRAMEWORKS MENTAIS — seus modelos' (grid icon), 'ANTI-PADRÕES — o que evitam' (forbidden icon). Big title: 'UM MIND NÃO É UMA PERSONA. É UM CLONE.' Subtitle: 'Não peça pra IA AGIR como o Einstein. Faça ela SER o Einstein.'"""},
    {"id": "d8", "filename": "08-advisor-board.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, pt-BR with accents (proper names stay as-is), 16:9, cinematic editorial. Top-down view of a round glass table with amber glow, board room. Around the table: 5 holographic figures debating. Name plates: STEVE JOBS, BILL GATES, ELON MUSK, WALT DISNEY, and a chair at the head labeled 'VOCÊ'. Speech bubbles with Portuguese phrases: 'Está SIMPLES o suficiente?', 'Qual o impacto SISTÊMICO?', 'PRIMEIROS PRINCÍPIOS?', 'Onde está a HISTÓRIA?'. Center of table: glowing 'DECISÃO ESTRATÉGICA'. Footer: 'Trabalho extenso UMA VEZ. Seu PARA SEMPRE.' Title: 'SEU CONSELHO PESSOAL DE LENDAS'."""},
    {"id": "d9", "filename": "09-fluxo-ideia-produto.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, pt-BR with accents, 16:9, horizontal flowchart. 5 stages arranged left to right, each in a rounded rectangle card, numbered 1-5: 1. 'IDEIA' lightbulb icon. 2. 'PRD' document icon, LARGE card, label '/prd-generator — 80% do seu tempo vive aqui'. 3. 'SPEC' blueprint icon, medium, label '/tech-research — não reinvente a roda'. 4. 'EPICS + STORIES' kanban icon, medium, label '/forge + /quest — execução gamificada'. 5. 'APP ENTREGUE' rocket icon, green glow, label 'Qualidade premium + documentado + expansível'. Between stages 1 and 2, big curved label: 'A REGRA 80/20 — a maioria pula essa etapa e fracassa'. Bottom: thin timeline '80% no PRD' e '20% no resto'. Title: 'DA IDEIA AO PRODUTO — O FLUXO SDD'."""},
    {"id": "d10", "filename": "10-loop-ping-pong.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, pt-BR with accents (product names stay English), 16:9. Circular loop. Two character avatars facing. LEFT: 'CLAUDE CODE' with Portuguese subtitle 'O gênio criativo bêbado', holding paintbrush and broken calculator, halo of lightbulbs. RIGHT: 'CODEX' with subtitle 'O auditor sóbrio e autista', glasses, magnifying glass, red pen. Between: circular arrows. Top arrow L→R: 'CONSTRÓI A FEATURE'. Bottom arrow R→L: 'DEVOLVE REVIEW + FIXES NECESSÁRIOS'. Center scoreboard: 'RODADA 1: 6/10 → RODADA 2: 8/10 → RODADA 3: 10/10' + trophy. Title: 'A DUPLA DE LLMs — CRIATIVIDADE ENCONTRA DISCIPLINA'."""},
    {"id": "d11", "filename": "11-timeline-forge.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, pt-BR with accents (AIOX/QUEST/FORGE stay as-is), 16:9. Horizontal timeline. 4 milestones on thin white line: 1. 'AIOX' description 'Poderoso mas implacável. Você delega tudo. Se deixar algo passar, ele não avisa.' Icon: complex gear. 2. 'QUEST (nascido como dashboard)' description 'Só queria acompanhar o progresso visualmente.' 3. 'QUEST (evoluiu pra jogo)' description 'O dashboard virou um sistema de níveis.' 4. 'FORGE' description 'A sacada: se o Quest é o jogo, precisamos de um motor melhor.' Between 3 and 4: big speech bubble 'MOMENTO EUREKA'. Title: 'COMO UM DASHBOARD VIROU UM FRAMEWORK'."""},
    {"id": "d12", "filename": "12-receita-forge.png", "aspectRatio": "16:9", "prompt": """STYLE ANCHOR: dark #0a0a0a, amber #f59e0b, pt-BR with accents (product names stay as-is), 16:9, cinematic editorial. Central: large glowing amber forge/anvil with molten metal inside. TOP ROW labeled '8 FRAMEWORKS ABSORVIDOS': 8 pills raining — 'RALPH', 'BMAD', 'AIOX', 'OPENSQUAD', 'XOIA', 'GSD-2', '/forge', '/quest'. MIDDLE ROW '3 SKILLS LOCAIS': 3 pills falling — 'STRESS-TEST', 'PING-PONG', 'CELF'. BOTTOM HALO rising UP '10 INOVAÇÕES EXCLUSIVAS': 10 glowing stars labeled 'CONTEXTSTATE UNIFICADO', 'MVP GATE', 'FORGE MEMORY', 'PRD-GENERATOR', 'SCOPE LOCK', 'STATE = FONTE DE VERDADE', 'ANALYSIS GUARD', 'DEVIATION CONTRACT', 'QUEST NATIVO', 'DRY RUN + REPLAY'. Title: 'A RECEITA: 8 + 3 + 10'."""},
    
    # ATO 1
    {"id": "s1-1", "filename": "slide-1-1-matrix-pill.png", "aspectRatio": "16:9", "prompt": "Cinematic close-up of an outstretched hand offering a single glowing red pill on a dark moody background, in the dramatic style of The Matrix movie, high contrast, volumetric lighting, photorealistic, 16:9."},
    {"id": "s1-3", "filename": "slide-1-3-treadmill.png", "aspectRatio": "16:9", "prompt": "Minimalist editorial illustration of a silhouette of a person running on a treadmill seen from the side, glowing amber accent lights, dark background #0a0a0a, motion blur on the legs, conceptual metaphor of running to stay in place, high contrast, editorial infographic style, 16:9."},
    {"id": "s1-4", "filename": "slide-1-4-obra-lupa.png", "aspectRatio": "16:9", "prompt": "Modern industrial warehouse and residential building complex at golden hour, Brazilian architecture, clean lines, professional architectural photography, wide angle, vibrant colors, 16:9."},
    
    # PROFISSÕES EXTINTAS
    {"id": "p1", "filename": "profissao-1-acendedor-lamparina.png", "aspectRatio": "1:1", "prompt": "Vintage sepia editorial illustration of a lamplighter lighting a gas street lamp at dusk in Victorian London, 1890s, warm amber glow, atmospheric fog, high detail, editorial style, square format."},
    {"id": "p2", "filename": "profissao-2-despertador-humano.png", "aspectRatio": "1:1", "prompt": "Vintage sepia editorial illustration of a knocker-upper using a long pole to tap on a second-floor window in early 1900s London at dawn, soft morning light, atmospheric, editorial style, square format."},
    {"id": "p3", "filename": "profissao-3-telefonista.png", "aspectRatio": "1:1", "prompt": "Vintage sepia photograph style of a 1950s female telephone switchboard operator with headset, connecting hundreds of cables on a large manual switchboard, editorial documentary style, high detail, square format."},
    {"id": "p4", "filename": "profissao-4-datilografo.png", "aspectRatio": "1:1", "prompt": "Vintage sepia photograph style of a 1940s typist working at a large manual typewriter in a newsroom, hands in motion, soft side lighting, editorial documentary style, square format."},
    {"id": "p5", "filename": "profissao-5-operador-elevador.png", "aspectRatio": "1:1", "prompt": "Vintage sepia editorial illustration of a 1920s hotel elevator operator in formal uniform and cap standing inside an ornate brass elevator, warm lighting, art deco interior, square format."},
    {"id": "p6", "filename": "profissao-6-leiteiro.png", "aspectRatio": "1:1", "prompt": "Vintage sepia editorial illustration of a 1950s milkman delivering glass milk bottles to a suburban doorstep at dawn, soft morning light, nostalgic atmosphere, editorial style, square format."},
    {"id": "p7", "filename": "profissao-7-cartao-perfurado.png", "aspectRatio": "1:1", "prompt": "Vintage sepia photograph style of a 1960s operator using an IBM punch card machine in a computer room, rows of punch cards visible, fluorescent lighting, editorial documentary style, square format."},
    
    # ATOS DIVERSOS
    {"id": "s2-1", "filename": "slide-2-1-ai-studio-mockup.png", "aspectRatio": "16:9", "prompt": "Screenshot-style mockup of Google AI Studio interface with a long prompt pasted in the input field and a generated todo app preview on the right side showing Eisenhower Matrix quadrants with sample tasks, dark mode interface, editorial style, 16:9."},
    {"id": "s3-1", "filename": "slide-3-1-setup-fosc.png", "aspectRatio": "16:9", "prompt": "Editorial photography of a modern workstation with triple ultrawide monitors, a Stream Deck XL, mechanical keyboard, clean desk, dark theme code editor visible, moody warm lighting, high-end tech setup, 16:9."},
    {"id": "s3-2", "filename": "slide-3-2-organizacao-comparacao.png", "aspectRatio": "16:9", "prompt": "Side by side comparison editorial illustration. LEFT: a chaotic messy file explorer. RIGHT: a clean organized folder structure with labeled Portuguese 'CLAUDE.MD', 'MEMORY.MD', 'src/', 'docs/'. Dark background #0a0a0a, amber accents #f59e0b, Portuguese title 'ANTES × DEPOIS', 16:9."},
    {"id": "s3-4", "filename": "slide-3-4-dica-contextual.png", "aspectRatio": "16:9", "prompt": "Screenshot-style mockup of Claude Code terminal response in dark mode showing a helpful answer ending with a highlighted line starting with lightbulb emoji 💡 Dica: and contextual insight in Portuguese. Amber accent on the tip line, 16:9."},
    {"id": "s3-6", "filename": "slide-3-6-einstein-cozinha.png", "aspectRatio": "16:9", "prompt": "Playful editorial illustration of Albert Einstein wearing a chef apron in a cozy kitchen, holding a wooden spoon over a mixing bowl, white messy hair, mustache, warm lighting, watercolor illustration style, 16:9."},
    {"id": "s4-3", "filename": "slide-4-3-minds-cards.png", "aspectRatio": "16:9", "prompt": "Editorial card layout on dark background #0a0a0a, amber accents #f59e0b, 6 floating portrait cards with silhouette illustrations of famous thinkers labeled: Alex Hormozi, Charlie Munger, Einstein, Steve Jobs, Leandro Ladeira, Paulo Vieira. Portuguese title: 'CÉREBROS CLONÁVEIS', 16:9."},
    {"id": "s6-3", "filename": "slide-6-3-plan-mode.png", "aspectRatio": "16:9", "prompt": "Screenshot-style mockup of Claude Code terminal interface in dark mode, showing a 'PLAN MODE' badge highlighted in amber at the top, with a detailed implementation plan listed as numbered bullet points below, 16:9."},
    {"id": "s6-4", "filename": "slide-6-4-pascal.png", "aspectRatio": "16:9", "prompt": "Editorial vintage illustration of Blaise Pascal sitting at a wooden desk writing a letter with a quill, candlelight, old parchment, 17th century atmosphere, sepia tones with amber highlights, 16:9."},
    {"id": "s7-4", "filename": "slide-7-4-domino-fail.png", "aspectRatio": "16:9", "prompt": "Comedic editorial illustration of a chain reaction domino machine that fails mid-way, pieces missing the next target, frustrated person in background trying to intervene, Portuguese caption 'FRAMEWORK SEM AUTO-GUIA', 16:9."},
    {"id": "s7-5", "filename": "slide-7-5-before-after-forge.png", "aspectRatio": "16:9", "prompt": "Split-screen editorial comparison on dark background #0a0a0a, amber accents #f59e0b. LEFT side labeled Portuguese 'ANTES'. RIGHT side labeled 'DEPOIS (FORGE)': clean linear pipeline with green checkmarks, smooth amber flow. Title: 'UM BOM FRAMEWORK NÃO PRECISA DE INTERFERÊNCIA', 16:9."},
]

def generate_image(item):
    filename = item['filename']
    prompt = item['prompt']
    aspect_ratio = item.get('aspectRatio', '1:1')
    
    print(f"Gerando: {filename}...")
    
    try:
        response = client.models.generate_images(
            model=MODEL_ID,
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio=aspect_ratio,
                output_mime_type='image/png'
            )
        )
        
        if response and response.generated_images:
            image_data = response.generated_images[0].image.image_bytes
            file_path = os.path.join(DEST_DIR, filename)
            with open(file_path, 'wb') as f:
                f.write(image_data)
            print(f"SUCESSO: Salvo em {file_path}")
            return True
        else:
            print(f"ERRO: Nenhuma imagem retornada para {filename}")
            return False
            
    except Exception as e:
        print(f"ERRO ao gerar {filename}: {str(e)}")
        return False

# Loop de Execução
total = len(images_to_generate)
success_count = 0

for i, item in enumerate(images_to_generate):
    print(f"[{i+1}/{total}] {item['filename']}: ", end="", flush=True)
    if generate_image(item):
        success_count += 1
    
    # Espera para evitar Rate Limit (ajuste conforme necessário)
    if i < total - 1:
        print("Aguardando 35 segundos para a próxima imagem...")
        time.sleep(35)

print(f"\nConcluído! {success_count} de {total} imagens geradas com sucesso.")
print(f"Arquivos salvos em: {DEST_DIR}")
