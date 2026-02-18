#!/bin/bash
# skill-sync.sh — Sync skills between projects and the local hub
#
# Usage:
#   skill-sync promote <skill-name> <project-name>   Copy skill from project to hub
#   skill-sync distribute [skill-name]                Copy skills from hub to all projects
#   skill-sync list                                   Show skills in hub and projects

HUB="$HOME/aios-core/.aios/skills"
PROJECTS_DIR="$HOME/Projects"

# Active projects (edit this list as needed)
PROJECTS=(
  garimpoai
  autoknowledge-ai
  dne-digital-student-id
  luizfosc-site
)

cmd="$1"

case "$cmd" in

  promote)
    skill="$2"
    project="$3"

    if [ -z "$skill" ] || [ -z "$project" ]; then
      echo "Usage: skill-sync promote <skill-name> <project-name>"
      echo "Example: skill-sync promote pncp-analyzer garimpoai"
      exit 1
    fi

    src="$PROJECTS_DIR/$project/.aios/skills/$skill"
    if [ ! -d "$src" ]; then
      echo "Error: $src not found"
      exit 1
    fi

    if [ -d "$HUB/$skill" ]; then
      echo "Skill '$skill' already exists in hub. Overwrite? (y/n)"
      read -r answer
      [ "$answer" != "y" ] && echo "Cancelled." && exit 0
      rm -rf "$HUB/$skill"
    fi

    cp -r "$src" "$HUB/$skill"
    echo "Promoted: $project/$skill → hub"
    ;;

  distribute)
    skill="$2"

    if [ -n "$skill" ]; then
      # Distribute one specific skill
      if [ ! -d "$HUB/$skill" ]; then
        echo "Error: $HUB/$skill not found"
        exit 1
      fi
      for proj in "${PROJECTS[@]}"; do
        dest="$PROJECTS_DIR/$proj/.aios/skills/$skill"
        mkdir -p "$PROJECTS_DIR/$proj/.aios/skills"
        if [ -d "$dest" ]; then
          echo "  $proj: skipped (already has $skill)"
        else
          cp -r "$HUB/$skill" "$dest"
          echo "  $proj: copied $skill"
        fi
      done
    else
      # Distribute all hub skills to projects that don't have them
      for skill_dir in "$HUB"/*/; do
        [ ! -d "$skill_dir" ] && continue
        s=$(basename "$skill_dir")
        for proj in "${PROJECTS[@]}"; do
          dest="$PROJECTS_DIR/$proj/.aios/skills/$s"
          mkdir -p "$PROJECTS_DIR/$proj/.aios/skills"
          if [ -d "$dest" ]; then
            continue
          else
            cp -r "$skill_dir" "$dest"
            echo "  $proj: copied $s"
          fi
        done
      done
      echo "Done. Skills that already existed were skipped."
    fi
    ;;

  list)
    echo "=== Hub ($HUB) ==="
    for d in "$HUB"/*/; do
      [ -d "$d" ] && echo "  $(basename "$d")"
    done
    echo ""
    for proj in "${PROJECTS[@]}"; do
      dir="$PROJECTS_DIR/$proj/.aios/skills"
      echo "=== $proj ==="
      if [ -d "$dir" ]; then
        for d in "$dir"/*/; do
          [ -d "$d" ] && echo "  $(basename "$d")"
        done
      else
        echo "  (no skills)"
      fi
      echo ""
    done
    ;;

  *)
    echo "skill-sync — Sync AIOS skills between projects"
    echo ""
    echo "Commands:"
    echo "  promote <skill> <project>   Copy skill from project to hub"
    echo "  distribute [skill]          Copy hub skills to all projects"
    echo "  list                        Show skills everywhere"
    ;;
esac
