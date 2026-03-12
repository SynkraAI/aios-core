#!/bin/bash
# Tetris — LUIZ FOSC version
# Animated ASCII art with falling Tetris pieces

RESET='\033[0m'
YELLOW='\033[93m'
GREEN='\033[92m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

# Hide cursor
printf "\033[?25l"

# Frame 1: Pieces falling
printf "\033[H\033[2J"
cat << "EOF"

                    🟦🟦
                    🟦🟦

         🟨🟨🟨🟨



                              🟥🟥
                              🟥🟥


EOF
sleep 0.35

# Frame 2: Pieces falling further
printf "\033[H\033[2J"
cat << "EOF"


         🟨🟨🟨🟨

                    🟦🟦
                    🟦🟦


                              🟥🟥
                              🟥🟥
                  🟩🟩🟩
                    🟩
EOF
sleep 0.35

# Frame 3: Pieces stacking
printf "\033[H\033[2J"
cat << "EOF"




                    🟦🟦
         🟨🟨🟨🟨   🟦🟦


                              🟥🟥
                              🟥🟥
                  🟩🟩🟩
                    🟩       🟪🟪🟪
                               🟪
EOF
sleep 0.35

# Final frame: LUIZ FOSC ASCII art + branding (rainbow gradient)
printf "\033[H\033[2J"
echo ""
echo -e "\033[38;5;51m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;45m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;39m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;33m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;27m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;21m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "${DIM}"
cat << "EOF"
 🟦🟦🟨🟨🟨🟨🟥🟥🟩🟩🟩🟪🟪🟪🟧🟧
 🟦🟦        🟥🟥  🟩  🟪  🟧🟧
EOF
echo -e "${RESET}${BOLD}${YELLOW}"
echo " ★ Line Clear! ★"
echo -e "${RESET}${GREEN} AIOS Core v2.1${RESET}"
echo ""
echo -e "${DIM} AI-Orchestrated Full Stack${RESET}"
echo ""

# Show cursor
printf "\033[?25h"
