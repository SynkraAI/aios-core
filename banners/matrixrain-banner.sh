#!/bin/bash
# Matrix Rain — LUIZ FOSC version
# Animated falling katakana rain effect

GREEN='\033[0;32m'
BOLD_GREEN='\033[1;32m'
DIM_GREEN='\033[2;32m'
WHITE='\033[1;37m'
NC='\033[0m'

# Hide cursor
printf "\033[?25l"

# Katakana and symbols for rain
CHARS=("ア" "イ" "ウ" "エ" "オ" "カ" "キ" "ク" "ケ" "コ" "サ" "シ" "ス" "セ" "ソ" "タ" "チ" "ツ" "テ" "ト" "0" "1" "2" "3" "4" "5" "6" "7" "8" "9" "Z" ":" "." "=" "*" "+")

# Function to get random character
get_char() {
    echo "${CHARS[$RANDOM % ${#CHARS[@]}]}"
}

# Frame 1 - Initial rain
printf "\033[H\033[2J"
echo -e "${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}"
echo -e "  ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}"
echo -e "${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}"
echo -e "  ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${WHITE}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}"
sleep 0.15

# Frame 2 - Rain continues
printf "\033[H\033[2J"
echo -e "  ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}"
echo -e "${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}"
echo -e "  ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${WHITE}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}"
echo -e "${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}"
echo -e "  ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}"
sleep 0.18

# Frame 3 - More rain
printf "\033[H\033[2J"
echo -e "${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}"
echo -e "  ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${WHITE}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}"
echo -e "${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}"
echo -e "  ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}"
echo -e "${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}"
echo -e "  ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${WHITE}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}"
sleep 0.2

# Frame 4 - Rain intensifies
printf "\033[H\033[2J"
echo -e "  ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${WHITE}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}"
echo -e "${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}"
echo -e "  ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}"
echo -e "${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}"
echo -e "  ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${WHITE}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}"
echo -e "${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${BOLD_GREEN}$(get_char)${NC}     ${WHITE}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${BOLD_GREEN}$(get_char)${NC}"
echo -e "  ${GREEN}$(get_char)${NC}    ${BOLD_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${WHITE}$(get_char)${NC}     ${GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${WHITE}$(get_char)${NC}      ${BOLD_GREEN}$(get_char)${NC}   ${GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}"
sleep 0.2

# Frame 5 - Rain fades, reveal LUIZ FOSC with gradient
printf "\033[H\033[2J"
echo -e "  ${DIM_GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}"
echo ""
echo -e "\033[38;5;22m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;28m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;34m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;40m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;46m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;48m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "${WHITE}        ★ Wake up, Neo... ★${NC}"
echo -e "${GREEN}          AIOS Core v2.1${NC}"
echo ""
echo -e "  ${DIM_GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}    ${DIM_GREEN}$(get_char)${NC}      ${DIM_GREEN}$(get_char)${NC}   ${DIM_GREEN}$(get_char)${NC}     ${DIM_GREEN}$(get_char)${NC}"
sleep 0.5

# Show cursor
printf "\033[?25h"
