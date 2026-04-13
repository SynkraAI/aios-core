#!/bin/zsh
# quest — Detecta estado do projeto, prepara o necessario, e inicia o Pipeline Quest
# Uso: quest /caminho/do/projeto
# Ou:  quest (usa diretorio atual)
# Ou:  quest new meu-projeto  (cria pasta nova)

AIOS_HOME="$HOME/aios-core"
DASHBOARD_DIR="$AIOS_HOME/tools/pipeline-dashboard"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 0: Parse arguments
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [ "$1" = "new" ] && [ -n "$2" ]; then
  # Create new project directory
  NEW_PATH="$HOME/CODE/Projects/$2"
  if [ -d "$NEW_PATH" ]; then
    echo "  Pasta $NEW_PATH ja existe. Usando ela."
  else
    mkdir -p "$NEW_PATH"
    echo "  Pasta criada: $NEW_PATH"
  fi
  PROJECT_PATH="$NEW_PATH"
elif [ -n "$1" ]; then
  PROJECT_PATH="$1"
else
  PROJECT_PATH="$(pwd)"
fi

# Resolve path absoluto
PROJECT_PATH=$(cd "$PROJECT_PATH" 2>/dev/null && pwd)
if [ -z "$PROJECT_PATH" ]; then
  echo "  Erro: diretorio '$1' nao existe."
  echo "  Dica: use 'quest new meu-projeto' para criar um novo."
  exit 1
fi

PROJECT_NAME=$(basename "$PROJECT_PATH")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 1: Diagnostico do projeto
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HAS_AIOS=false
HAS_GIT=false
HAS_PACKAGE=false
HAS_CLAUDE_MD=false
HAS_README=false
HAS_CHECKLIST=false
HAS_PRD=false

[ -d "$PROJECT_PATH/.aios" ] || [ -d "$PROJECT_PATH/.claude" ] && HAS_AIOS=true
[ -d "$PROJECT_PATH/.git" ] && HAS_GIT=true
[ -f "$PROJECT_PATH/package.json" ] && HAS_PACKAGE=true
[ -f "$PROJECT_PATH/.claude/CLAUDE.md" ] && HAS_CLAUDE_MD=true
[ -f "$PROJECT_PATH/README.md" ] && HAS_README=true
[ -f "$PROJECT_PATH/.aiox/pipeline-checklist.yaml" ] && HAS_CHECKLIST=true

# Check for PRD anywhere in the project
if find "$PROJECT_PATH" -maxdepth 3 -name "prd*" -o -name "PRD*" 2>/dev/null | head -1 | grep -q .; then
  HAS_PRD=true
fi

# Determine project stage
STAGE="empty"
if [ "$HAS_CHECKLIST" = true ]; then
  STAGE="in_progress"
elif [ "$HAS_AIOS" = true ] && [ "$HAS_PACKAGE" = true ]; then
  STAGE="setup_done"
elif [ "$HAS_AIOS" = true ]; then
  STAGE="aios_only"
elif [ "$HAS_GIT" = true ] || [ "$HAS_PACKAGE" = true ]; then
  STAGE="existing_project"
elif [ "$HAS_PRD" = true ]; then
  STAGE="has_prd"
else
  # Check if directory has any files
  FILE_COUNT=$(ls -1 "$PROJECT_PATH" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$FILE_COUNT" -gt 0 ]; then
    STAGE="has_files"
  fi
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 2: Show diagnostic
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PIPELINE QUEST"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Projeto: $PROJECT_NAME"
echo "  Path:    $PROJECT_PATH"
echo ""
echo "  Diagnostico:"

# Show checklist of what exists
check_icon() { [ "$1" = true ] && echo "\033[32m✓\033[0m" || echo "\033[31m✗\033[0m"; }

echo "    $(check_icon $HAS_GIT) Git inicializado"
echo "    $(check_icon $HAS_AIOS) AIOS instalado (.aiox/ ou .claude/)"
echo "    $(check_icon $HAS_PACKAGE) package.json"
echo "    $(check_icon $HAS_CLAUDE_MD) CLAUDE.md (system prompt)"
echo "    $(check_icon $HAS_README) README.md"
echo "    $(check_icon $HAS_PRD) PRD encontrado"
echo "    $(check_icon $HAS_CHECKLIST) Pipeline Checklist"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 3: Show next actions based on stage
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

case "$STAGE" in
  "empty")
    echo "  Estado: Pasta vazia"
    echo ""
    echo "  Proximos passos (na outra aba do Claude Code):"
    echo "    1. npx $AIOS_HOME init $PROJECT_PATH"
    echo "    2. /devops → *environment-bootstrap"
    echo "    3. /devops → *setup-github"
    echo "    4. /pipeline-checklist (para criar o quest log)"
    echo ""
    echo "  Ou use /forge para fazer tudo automaticamente:"
    echo "    cd $PROJECT_PATH && /forge \"descricao do app\""
    ;;

  "has_files"|"has_prd")
    echo "  Estado: Tem arquivos mas AIOS nao instalado"
    echo ""
    echo "  Proximos passos (na outra aba do Claude Code):"
    echo "    1. npx $AIOS_HOME init $PROJECT_PATH"
    echo "    2. /devops → *environment-bootstrap"
    echo "    3. /devops → *setup-github"
    echo "    4. /pipeline-checklist (para criar o quest log)"
    if [ "$HAS_PRD" = true ]; then
      echo ""
      echo "  PRD detectado! Apos instalar o AIOS, voce pode ir direto:"
      echo "    /pipeline-checklist scan  (vai detectar o PRD automaticamente)"
    fi
    ;;

  "existing_project")
    echo "  Estado: Projeto existente sem AIOS"
    echo ""
    echo "  Proximos passos (na outra aba do Claude Code):"
    echo "    1. npx $AIOS_HOME init $PROJECT_PATH"
    echo "    2. /pipeline-checklist scan (detecta o que ja foi feito)"
    echo "    3. /pipeline-checklist next (mostra proximo passo)"
    ;;

  "aios_only")
    echo "  Estado: AIOS instalado, projeto nao configurado"
    echo ""
    echo "  Proximos passos (na outra aba do Claude Code):"
    echo "    1. /devops → *environment-bootstrap"
    echo "    2. /devops → *setup-github"
    echo "    3. /pipeline-checklist (cria o quest log)"
    ;;

  "setup_done")
    echo "  Estado: Projeto configurado, sem checklist"
    echo ""
    echo "  Proximo passo (na outra aba do Claude Code):"
    echo "    /pipeline-checklist       (cria o quest log)"
    echo "    /pipeline-checklist scan  (detecta o que ja foi feito)"
    ;;

  "in_progress")
    echo "  Estado: Jornada em andamento!"
    echo ""
    echo "  Proximo passo (na outra aba do Claude Code):"
    echo "    /pipeline-checklist next  (mostra proxima missao)"
    ;;
esac

echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 4: Start dashboard (always)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "  Iniciando dashboard server..."
node "$DASHBOARD_DIR/server.js" "$PROJECT_PATH" &
DASHBOARD_PID=$!

sleep 1

# Get the port from registry
REGISTRY="$AIOS_HOME/.aiox-core/data/port-registry.json"
QUEST_PORT=5000
if [ -f "$REGISTRY" ]; then
  FOUND_PORT=$(node -e "
    try {
      const r = require('$REGISTRY');
      const k = 'quest-$PROJECT_NAME';
      if (r[k]) process.stdout.write(String(r[k].port));
      else process.stdout.write('5000');
    } catch { process.stdout.write('5000'); }
  " 2>/dev/null)
  if [ -n "$FOUND_PORT" ]; then
    QUEST_PORT=$FOUND_PORT
  fi
fi

# Open browser
open "http://localhost:$QUEST_PORT" 2>/dev/null || true

echo ""
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Dashboard: http://localhost:$QUEST_PORT"
echo "  Ctrl+C para encerrar"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cleanup on exit
trap "kill $DASHBOARD_PID 2>/dev/null; echo ''; echo '  Dashboard encerrado.'; exit 0" INT TERM
wait $DASHBOARD_PID
