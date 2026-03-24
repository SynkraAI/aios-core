# Manual de Processos Operacionais

**Programa Jornalistico — Producao de Conteudo**
Versao 1.0 | Fevereiro 2026

---

# SOP 1: Legendar Video

**Objetivo:** Produzir um MP4 com legenda queimada em portugues a partir de um video online ou local, seguindo os timecodes e instrucoes da pauta.

**Trigger:** A pauta contem um video com instrucao de legenda — exemplos: "legendar TC X ate Y", "mostrar video (TC X-Y — legendar)", "legendar [nome] TC X:XX ao X:XX".

**Inputs:**

- Pauta do programa (Google Docs) com URL do video e timecodes especificados
- Opcional: arquivo de video no Google Drive ou em pasta local no PC

---

## Passo a Passo

### 1. Ler a pauta e identificar o que legendar

- Percorrer a pauta do inicio ao fim
- Localizar todas as ocorrencias com instrucao de legenda
- Para cada ocorrencia, anotar:
  - URL do video (ou caminho do arquivo)
  - Timecode de inicio
  - Timecode de fim
  - Se ha instrucao de juntar trechos (ex: "TC 0:34-0:44 e juntar com TC 1:51-2:28")

### 2. Abrir o Video Downloader pelo terminal

- Abrir o terminal
- Executar o comando de inicializacao do software Video Downloader
- Aguardar a interface grafica (GUI) carregar

### 3. Configurar o clip no software

Preencher os campos da interface:

| Campo | O que preencher |
|-------|----------------|
| URL | Colar o link do video da pauta (YouTube, X/Twitter, Instagram, etc.) |
| Clip Start | Timecode de inicio no formato MMSS (ver tabela de formato abaixo) |
| Clip End | Timecode de fim no formato MMSS |
| Quality | 1080p (padrao — nao alterar salvo instrucao especifica) |
| Destino | Desktop (padrao) |
| Video Name | Nome do video conforme contexto da pauta |

**Tabela de formato de tempo (MMSS):**

| Formato digitado | Equivale a |
|-----------------|-----------|
| 0034 | 0:34 |
| 0130 | 1:30 |
| 0230 | 2:30 |
| 1000 | 10:00 |
| 10000 | 1:00:00 |

**Atencao:** o campo de legenda NAO deve ser desativado neste SOP — o pipeline de transcricao e traducao deve rodar normalmente.

### 4. Se houver juncao de trechos

Quando a pauta indica juntar dois ou mais trechos do mesmo video (ex: "TC 0:34-0:44 e juntar com TC 1:51-2:28"):

1. Configurar o primeiro trecho nos campos Clip Start e Clip End
2. Adicionar o segundo trecho usando o campo de clips adicionais (numero de clips)
3. Marcar a caixa "Merge into one"
4. O software processa ambos os trechos sequencialmente e une com transicao fadewhite de 1 segundo

### 5. Se o video vier de arquivo local (nao de URL)

- Em vez de colar URL, selecionar a opcao de arquivo local no software
- Navegar ate o arquivo no Google Drive ou na pasta local
- Os demais campos (timecodes, nome, etc.) funcionam da mesma forma

### 6. Processar

- Clicar em processar
- O software executa automaticamente o pipeline completo:
  1. Download do video (ou leitura do arquivo local)
  2. Corte nos timecodes especificados
  3. Ajuste de aspecto para 16:9
  4. Transcricao do audio via OpenAI Whisper
  5. Traducao do texto para portugues via GPT-4.1-mini
  6. Geracao do arquivo de legenda no formato ASS
  7. Embed da legenda queimada no video (hardcoded)
- Aguardar o pipeline completar sem fechar o software

### 7. Revisar no Editor de Legendas

- Apos o processamento, o Editor de Legendas abre dentro da GUI
- Assistir o video com preview (VLC/OpenCV) verificando:
  - Se a transcricao capturou corretamente o que foi dito
  - Se a traducao para portugues esta correta e natural
  - Se o sincronismo das legendas esta alinhado com a fala
- Corrigir eventuais erros diretamente na lista editavel do editor
- Usar a timeline visual para ajustes finos de sincronismo se necessario
- Confirmar quando estiver ok

### 8. Verificar o arquivo de saida

- Acessar o Desktop
- Confirmar que o MP4 foi gerado com o nome correto
- Abrir rapidamente o arquivo para verificar que a legenda esta visivelmente queimada no video

---

## Output

- Arquivo MP4 salvo no Desktop com legenda queimada em portugues
- Padrao visual aplicado automaticamente pelo software:
  - Fonte: Arial Bold, tamanho 21
  - Texto branco (#FFFFFF)
  - Fundo: caixa preta opaca (#000000) com padding 8px
  - Outline preto 2px
  - Posicao: centralizado na base da tela
  - Margens: 10px em todas as direcoes

---

## Excecoes e Troubleshooting

| Situacao | O que fazer |
|----------|-------------|
| Video vem do Google Drive | Usar opcao "arquivo local" no software em vez de colar URL |
| Video vem de arquivo local no PC | Mesma solucao acima |
| Traducao do GPT com erro evidente | Corrigir manualmente no Editor de Legendas antes de confirmar |
| Timecode no formato com horas (ex: 1h00min) | Usar formato 10000 para representar 1:00:00 |
| Pauta nao especifica timecodes | Assistir o video completo, identificar o trecho relevante e definir os timecodes manualmente antes de configurar |
| Legenda gerada ficou visivelmente ruim | Seguir Caminho C do SOP 2 para correcao no Premiere |

---

## Veto — Quando NAO usar este SOP

- Video com instrucao "Mostrar video" sem mencao a legenda: usar SOP 2
- Video ja legendado na origem e a legenda original e adequada
- Material de imagem estatica (foto, screenshot, print): usar SOP 3

---

# SOP 2: Editar Video

**Objetivo:** Processar os videos da pauta (download, corte, configuracoes de edicao) e disponibilizar os arquivos MP4 prontos no StreamYard antes do inicio do programa.

**Trigger:** A pauta contem instrucao de video sem legenda — exemplos: "Mostrar video", "B-ROLL: [link]", "Mostrar apenas o video", timecodes de corte sem mencao a legenda.

**Inputs:**

- Pauta do programa (Google Docs) com URLs dos videos e instrucoes de edicao
- Timecodes de corte quando especificados na pauta
- Indicacao de quantos videos precisam ser juntados (quando aplicavel)

---

## Criterio de Decisao: Qual Caminho Usar

```
O video precisa de legenda?
  SIM → Parar aqui. Usar SOP 1: Legendar Video.

O video envolve qualquer uma destas situacoes?
  - Juntar videos de links DIFERENTES entre si
  - Repeticoes ou montagens complexas que o Video Downloader nao resolve
  NAO → CAMINHO A (Video Downloader — maioria dos casos)
  SIM → CAMINHO B (Video Downloader + Premiere)

Apos Caminho A ou B: a legenda gerada ficou ruim?
  SIM → CAMINHO C (Correcao no Premiere)
```

---

## CAMINHO A — Video Downloader (maioria dos casos)

### 1. Ler a pauta e identificar os videos

- Localizar todos os videos com instrucao sem legenda
- Para cada video, anotar: URL, timecodes de corte, nome, instrucoes especiais

### 2. Abrir o Video Downloader pelo terminal

- Abrir o terminal
- Executar o comando de inicializacao do software
- Aguardar a GUI carregar

### 3. Configurar e processar cada video

Preencher os campos:

| Campo | O que preencher |
|-------|----------------|
| URL | Link do video da pauta |
| Clip Start / End | Timecodes de corte no formato MMSS |
| Quality | 1080p (padrao) |
| Video Name | Nome conforme contexto da pauta |
| Video only | MARCAR (desativa transcricao e legenda) |
| Merge into one | Marcar apenas se precisar juntar trechos do MESMO link |

### 4. Processar e verificar

- Clicar em processar
- Aguardar o pipeline completar
- Acessar o Desktop e confirmar que o MP4 foi gerado corretamente
- Abrir o arquivo, verificar duracao e corte

### 5. Subir no StreamYard

- Acessar o StreamYard
- Fazer upload do MP4
- Confirmar que o arquivo esta disponivel e carregado antes do inicio do programa

---

## CAMINHO B — Video Downloader + Premiere (casos complexos)

**Usar quando:** e necessario juntar videos provenientes de links diferentes entre si, ou quando a edicao envolve repeticoes e montagens que o Video Downloader nao suporta.

### 1. Ler a pauta e identificar todos os videos necessarios

- Mapear quantos links diferentes precisam ser baixados
- Anotar cada URL separadamente

### 2. Baixar cada video pelo Video Downloader (modo download puro)

Para cada URL:

- Abrir o Video Downloader pelo terminal
- Colar a URL
- Marcar "Video only"
- Nao preencher timecodes de corte (o corte sera feito no Premiere)
- Processar e salvar no Desktop
- Repetir para cada URL diferente

### 3. Editar no Premiere

- Abrir o Adobe Premiere
- Importar todos os arquivos baixados no Desktop
- Executar a edicao conforme instrucoes da pauta:
  - Cortes nos timecodes especificados
  - Juncao dos clips na ordem correta
  - Repeticoes ou montagens necessarias

### 4. Exportar como MP4

- Exportar o projeto finalizado como MP4
- Salvar no Desktop com o nome correto

### 5. Subir no StreamYard

- Acessar o StreamYard
- Fazer upload do MP4 exportado
- Confirmar que o arquivo esta disponivel antes do inicio do programa

---

## CAMINHO C — Correcao pos-processamento (legenda ruim)

**Usar quando:** o Video Downloader processou e gerou o MP4, mas a legenda apresenta erros graves de transcricao ou sincronismo que nao valem corrigir no Editor de Legendas.

### 1. Abrir o arquivo MP4 gerado no Adobe Premiere

### 2. Corrigir a legenda manualmente no Premiere

### 3. Exportar novamente como MP4 para o Desktop

### 4. Substituir o arquivo anterior no Desktop

### 5. Atualizar no StreamYard

- Se o upload no StreamYard ja tiver sido feito, remover o arquivo anterior
- Fazer o upload do arquivo corrigido
- Confirmar que a versao correta esta disponivel

---

## Output

- Um arquivo MP4 por video da pauta, salvo no Desktop
- Todos os arquivos disponiveis e carregados no StreamYard antes do inicio do programa

---

## Excecoes e Troubleshooting

| Situacao | O que fazer |
|----------|-------------|
| Video precisa de legenda E e caso complexo (multiplos links) | Fazer Caminho B primeiro para montar o video; depois aplicar legenda no Premiere manualmente |
| Link da pauta nao funciona ou video foi removido | Buscar fonte alternativa pelo contexto da noticia; se nao encontrar, sinalizar na pauta |
| Video vem do Google Drive | Baixar o arquivo manualmente e usar como arquivo local no Video Downloader ou importar direto no Premiere |
| Whisper gerou legenda ruim | Caminho C |

---

## Veto — Quando NAO usar este SOP

- Videos com instrucao de legenda na pauta: usar SOP 1
- Material de imagem estatica (foto, screenshot, print de postagem): usar SOP 3

---

# SOP 3: Criar Slides

**Objetivo:** Montar os slides do programa no Google Slides usando o template correto para cada tipo de conteudo e conectar a apresentacao no StreamYard antes do inicio do programa.

**Trigger:** A pauta contem instrucoes como "Mostrar postagem: [link]", "Mostrar reportagem: [link]", "Mostrar materia: [link]", "Mostrar imagem: [numero/link]", "Mostrar imagens em sequencia: 1, 2, 3...".

**Inputs:**

- Pauta do programa (Google Docs) com links e instrucoes de cada slide
- Arquivo Google Slides contendo os templates dos 5 tipos de slide

---

## Passo a Passo Geral

### 1. Abrir o arquivo Google Slides do programa

- Acessar o Google Slides
- Abrir o arquivo que contem os templates de cada tipo de slide

### 2. Para cada instrucao de slide na pauta, executar o ciclo

```
Ler a instrucao da pauta
→ Identificar o tipo de slide (ver os 5 tipos abaixo)
→ Duplicar o slide template correspondente
→ Extrair o conteudo conforme instrucoes do tipo
→ Colar e ajustar os elementos no slide duplicado
→ Passar para a proxima instrucao
```

Repetir ate que todos os slides da edicao estejam montados.

### 3. Conectar no StreamYard

- Acessar o StreamYard
- Conectar o Google Slides diretamente (nao e necessario exportar como PDF ou PPTX)
- Confirmar que todos os slides estao visiveis e disponiveis para uso no programa

---

## Os 5 Tipos de Slide

---

### TIPO 1 — Postagem de Rede Social

**Trigger na pauta:** "Mostrar postagem: [link]"
**Plataformas:** X (Twitter), Truth Social, Instagram, Telegram

**O que extrair e como:**

**Foto de perfil:**

1. Abrir o link da postagem no navegador
2. Clicar na imagem/avatar do perfil do autor
3. A pagina do perfil abre — clicar na imagem do perfil novamente
4. A imagem aparece ampliada em alta resolucao
5. Clicar com botao direito na imagem ampliada
6. Selecionar "Copiar imagem"

**@ da conta:**

- Copiar diretamente da postagem (selecionar e Ctrl+C)

**Texto da postagem:**

- Copiar e colar o texto diretamente da postagem para o slide

**Como montar o slide:**

1. Duplicar o slide template de Postagem
2. Substituir a foto de perfil existente pela copiada (colar sobre o elemento)
3. Substituir o @ pelo da conta
4. Substituir o texto pelo da postagem

**Regra de texto grande:**

- Se o texto nao couber no espaco do slide → diminuir o tamanho da fonte
- Se ainda nao couber mesmo com fonte reduzida → cortar parte do texto mantendo o sentido principal da postagem

---

### TIPO 2 — Noticia COM Texto Traduzido

**Trigger na pauta:** "Mostrar reportagem: [link]" ou "Mostrar materia: [link]" quando ha texto traduzido junto na pauta

**O que extrair e como:**

**Titulo da noticia:**

- Copiar o titulo do artigo acessando o link

**Logo do site de origem:**

- Acessar o site do veiculo de imprensa
- Copiar o logo da pagina inicial ou do cabecalho do artigo

**Texto traduzido:**

- Copiar diretamente da pauta — na maioria dos casos o texto ja vem traduzido para portugues na propria pauta

**Como montar o slide:**

1. Duplicar o slide template de Noticia COM texto
2. Substituir o titulo, logo e texto pelos extraidos

---

### TIPO 3 — Noticia SEM Texto Traduzido

**Trigger na pauta:** "Mostrar reportagem: [link]" ou "Mostrar materia: [link]" quando NAO ha texto traduzido na pauta

**O que extrair e como:**

**Titulo da noticia:**

- Copiar o titulo do artigo acessando o link

**Logo do site de origem:**

- Acessar o site do veiculo
- Copiar o logo

**Como montar o slide:**

1. Duplicar o slide template de Noticia SEM texto
2. Substituir o titulo e o logo pelos extraidos
3. O campo de texto traduzido nao e usado neste tipo

---

### TIPO 4 — Imagem Fullscreen

**Trigger na pauta:** instrucoes de imagem referentes ao "giro de noticias"

**Criterio de uso:**

- Imagens do giro de noticias usam SEMPRE o Tipo 4 (fullscreen) como padrao
- Excecao: se a qualidade da imagem ficar visivelmente ruim ao ocupar o slide inteiro → usar Tipo 5

**O que extrair e como:**

**Imagem:**

- Os numeros na pauta ("Mostrar imagem: 1") contem um link embutido
- Clicar no numero/link para acessar a imagem
- Copiar ou salvar a imagem

**Como montar o slide:**

1. Duplicar o slide template de Imagem Fullscreen
2. Substituir a imagem existente pela extraida
3. Ajustar para que ocupe todo o espaco do slide sem bordas

---

### TIPO 5 — Imagem Parcial ou Multiplas Imagens

**Trigger na pauta:**

- "Mostrar imagens em sequencia: 1, 2, 3..." (multiplas imagens no mesmo slide)
- Instrucoes de imagem fora do giro de noticias (outras noticias)
- Imagens do giro quando a qualidade ficaria ruim em fullscreen (Tipo 4)

**O que extrair e como:**

**Cada imagem:**

- Clicar no numero/link embutido na pauta para acessar cada imagem
- Copiar ou salvar cada uma separadamente

**Como montar o slide:**

1. Duplicar o slide template de Imagem Parcial/Multipla
2. Posicionar cada imagem no espaco correspondente do template
3. Para multiplas imagens: distribuir nos campos pre-definidos do template

---

## Output

- Arquivo Google Slides da edicao completamente preenchido com todos os slides da pauta
- Apresentacao conectada e disponivel no StreamYard antes do inicio do programa

---

## Excecoes e Troubleshooting

| Situacao | O que fazer |
|----------|-------------|
| Imagem de perfil nao abre ampliada ao clicar | Tentar salvar a imagem diretamente da pagina do perfil (botao direito na foto menor) |
| Link da pauta esta quebrado ou indisponivel | Buscar o conteudo pelo nome da conta ou contexto da noticia mencionada na pauta |
| Texto da postagem muito grande mesmo apos cortar | Reduzir ainda mais o tamanho da fonte ou dividir o conteudo em dois slides consecutivos |
| Duvida se e Tipo 4 ou Tipo 5 | Verificar se a instrucao e do giro de noticias (Tipo 4) ou de outra noticia (Tipo 5); se for giro e a qualidade ficar ruim, usar Tipo 5 |
| Texto traduzido nao vem na pauta (minoria dos casos) | Traduzir o trecho relevante manualmente e incluir no slide Tipo 2 |

---

## Veto — Quando NAO usar este SOP

- Material de video (com ou sem legenda): usar SOP 1 ou SOP 2
- Slides ja prontos fornecidos por outra pessoa: apenas verificar e conectar no StreamYard

---

*Manual de Processos Operacionais v1.0*
*Programa Jornalistico — Producao de Conteudo*
*Extraido e validado em Fevereiro 2026*
