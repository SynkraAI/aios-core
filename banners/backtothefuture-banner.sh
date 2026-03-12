#!/bin/bash
# Back to the Future — LUIZ FOSC version
# Animated ASCII art with DeLorean time machine

CYAN='\033[0;36m'
CYAN_BOLD='\033[1;36m'
YELLOW='\033[0;33m'
YELLOW_BOLD='\033[1;33m'
RED='\033[0;31m'
RED_BOLD='\033[1;31m'
WHITE='\033[0;37m'
WHITE_BOLD='\033[1;37m'
BLUE='\033[0;34m'
BLUE_BOLD='\033[1;34m'
GRAY='\033[0;90m'
GREEN='\033[0;32m'
NC='\033[0m'

# Hide cursor
printf "\033[?25l"

# Trap to show cursor on exit
trap 'printf "\033[?25h"' EXIT

# Frame 1: DeLorean approaching
printf "\033[H\033[2J"
echo ""
echo -e "${CYAN_BOLD}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN_BOLD}║${NC}                    ${YELLOW_BOLD}⚡ TEMPORAL DISPLACEMENT IN PROGRESS ⚡${NC}              ${CYAN_BOLD}║${NC}"
echo -e "${CYAN_BOLD}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "              ${GRAY}~~~${NC}                                          "
echo -e "          ${GRAY}~~~${NC}      ${GRAY}~~~${NC}                                     "
echo -e "      ${GRAY}~~~${NC}              ${GRAY}~~~${NC}                                 "
echo -e "                                                             "
echo -e "                    ${WHITE_BOLD}____________________${NC}                      "
echo -e "                   ${WHITE_BOLD}/${NC}${BLUE}▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓${NC}${WHITE_BOLD}\\${NC}                     "
echo -e "                  ${WHITE_BOLD}/${NC}${BLUE}▓${NC} ${YELLOW}[ 88 MPH ]${NC} ${BLUE}▓${NC}${WHITE_BOLD}\\${NC}                    "
echo -e "           ${YELLOW}══${NC}${WHITE_BOLD}════/${NC}${BLUE}▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓${NC}${WHITE_BOLD}\\════${NC}${YELLOW}══${NC}               "
echo -e "         ${YELLOW}═══${NC}${WHITE_BOLD}╔═══${NC}${GRAY}╔══════════════╗${NC}${WHITE_BOLD}═══╗${NC}${YELLOW}═══${NC}             "
echo -e "        ${RED_BOLD}▓${NC}${YELLOW}══${NC}${WHITE_BOLD}║░░░${NC}${GRAY}║${NC}${CYAN_BOLD}●${NC}  ${WHITE}DMC-12${NC}  ${CYAN_BOLD}●${NC}${GRAY}║${NC}${WHITE_BOLD}░░░║${NC}${YELLOW}══${NC}${RED_BOLD}▓${NC}            "
echo -e "        ${RED_BOLD}▓${NC}${YELLOW}══${NC}${WHITE_BOLD}╚═══${NC}${GRAY}╚══════════════╝${NC}${WHITE_BOLD}═══╝${NC}${YELLOW}══${NC}${RED_BOLD}▓${NC}            "
echo -e "         ${RED_BOLD}▓▓${NC}${YELLOW}═══════════════════════════${NC}${RED_BOLD}▓▓${NC}             "
echo -e "           ${RED_BOLD}▓▓${NC}${WHITE}◯${NC}${YELLOW}═════════════════${NC}${WHITE}◯${NC}${RED_BOLD}▓▓${NC}               "
echo -e "             ${WHITE_BOLD}(${NC}${GRAY}O${NC}${WHITE_BOLD})${NC}               ${WHITE_BOLD}(${NC}${GRAY}O${NC}${WHITE_BOLD})${NC}                 "
echo ""
echo -e "                   ${YELLOW_BOLD}Flux Capacitor: ${GREEN}[ ACTIVE ]${NC}"
echo ""

sleep 0.35

# Frame 2: DeLorean with fire trails
printf "\033[H\033[2J"
echo ""
echo -e "${CYAN_BOLD}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN_BOLD}║${NC}                      ${RED_BOLD}🔥 88 MILES PER HOUR! 🔥${NC}                      ${CYAN_BOLD}║${NC}"
echo -e "${CYAN_BOLD}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "     ${RED_BOLD}▓▓${NC}  ${YELLOW_BOLD}═══${NC}   ${RED}~~${NC}                                   "
echo -e "   ${RED_BOLD}▓▓${NC}  ${YELLOW_BOLD}═══${NC}   ${RED}~~~${NC}   ${YELLOW}~~${NC}                               "
echo -e " ${RED_BOLD}▓▓${NC}  ${YELLOW_BOLD}═══${NC}   ${RED}~~${NC}   ${YELLOW}~~~${NC}                                 "
echo -e "                                                             "
echo -e "                    ${WHITE_BOLD}____________________${NC}                      "
echo -e "                   ${WHITE_BOLD}/${NC}${BLUE}▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓${NC}${WHITE_BOLD}\\${NC}                     "
echo -e "                  ${WHITE_BOLD}/${NC}${BLUE}▓${NC} ${RED_BOLD}[${YELLOW_BOLD} 88 MPH ${RED_BOLD}]${NC} ${BLUE}▓${NC}${WHITE_BOLD}\\${NC}                    "
echo -e "           ${YELLOW_BOLD}══${NC}${WHITE_BOLD}════/${NC}${BLUE}▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓${NC}${WHITE_BOLD}\\════${NC}${YELLOW_BOLD}══${NC}               "
echo -e "         ${YELLOW_BOLD}═══${NC}${WHITE_BOLD}╔═══${NC}${GRAY}╔══════════════╗${NC}${WHITE_BOLD}═══╗${NC}${YELLOW_BOLD}═══${NC}             "
echo -e "        ${RED_BOLD}▓${NC}${YELLOW_BOLD}══${NC}${WHITE_BOLD}║${CYAN_BOLD}░░░${NC}${GRAY}║${NC}${CYAN_BOLD}●${NC}  ${WHITE_BOLD}DMC-12${NC}  ${CYAN_BOLD}●${NC}${GRAY}║${NC}${CYAN_BOLD}░░░${NC}${WHITE_BOLD}║${NC}${YELLOW_BOLD}══${NC}${RED_BOLD}▓${NC}            "
echo -e "        ${RED_BOLD}▓${NC}${YELLOW_BOLD}══${NC}${WHITE_BOLD}╚═══${NC}${GRAY}╚══════════════╝${NC}${WHITE_BOLD}═══╝${NC}${YELLOW_BOLD}══${NC}${RED_BOLD}▓${NC}            "
echo -e "         ${RED_BOLD}▓▓${NC}${YELLOW_BOLD}═══════════════════════════${NC}${RED_BOLD}▓▓${NC}             "
echo -e "           ${RED_BOLD}▓▓${NC}${WHITE_BOLD}◯${NC}${YELLOW_BOLD}═════════════════${NC}${WHITE_BOLD}◯${NC}${RED_BOLD}▓▓${NC}               "
echo -e "             ${WHITE_BOLD}(${NC}${GRAY}O${NC}${WHITE_BOLD})${NC}               ${WHITE_BOLD}(${NC}${GRAY}O${NC}${WHITE_BOLD})${NC}                 "
echo ""
echo -e "            ${RED_BOLD}🔥${YELLOW_BOLD}🔥${RED_BOLD}🔥${NC}  ${CYAN_BOLD}TEMPORAL SHIFT${NC}  ${RED_BOLD}🔥${YELLOW_BOLD}🔥${RED_BOLD}🔥${NC}          "
echo ""

sleep 0.35

# Frame 3: Time travel effect
printf "\033[H\033[2J"
echo ""
echo -e "${CYAN_BOLD}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN_BOLD}║${NC}                    ${WHITE_BOLD}⚡ ARRIVAL: ${YELLOW_BOLD}PRESENT TIME${NC} ${WHITE_BOLD}⚡${NC}                  ${CYAN_BOLD}║${NC}"
echo -e "${CYAN_BOLD}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "       ${CYAN_BOLD}*${NC}    ${WHITE_BOLD}*${NC}    ${CYAN_BOLD}*${NC}         ${WHITE_BOLD}*${NC}      ${CYAN_BOLD}*${NC}     ${WHITE_BOLD}*${NC}          "
echo -e "    ${WHITE_BOLD}*${NC}       ${CYAN_BOLD}*${NC}       ${WHITE_BOLD}*${NC}   ${CYAN_BOLD}*${NC}    ${WHITE_BOLD}*${NC}         ${CYAN_BOLD}*${NC}        "
echo -e "  ${CYAN_BOLD}*${NC}    ${WHITE_BOLD}*${NC}       ${CYAN_BOLD}*${NC}       ${WHITE_BOLD}*${NC}       ${CYAN_BOLD}*${NC}    ${WHITE_BOLD}*${NC}          "
echo -e "                                                             "
echo -e "                    ${WHITE_BOLD}____________________${NC}                      "
echo -e "                   ${WHITE_BOLD}/${NC}${BLUE_BOLD}▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓${NC}${WHITE_BOLD}\\${NC}                     "
echo -e "                  ${WHITE_BOLD}/${NC}${BLUE_BOLD}▓${NC} ${YELLOW_BOLD}[ ARRIVED ]${NC} ${BLUE_BOLD}▓${NC}${WHITE_BOLD}\\${NC}                    "
echo -e "           ${YELLOW_BOLD}══${NC}${WHITE_BOLD}════/${NC}${BLUE_BOLD}▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓${NC}${WHITE_BOLD}\\════${NC}${YELLOW_BOLD}══${NC}               "
echo -e "         ${YELLOW_BOLD}═══${NC}${WHITE_BOLD}╔═══${NC}${GRAY}╔══════════════╗${NC}${WHITE_BOLD}═══╗${NC}${YELLOW_BOLD}═══${NC}             "
echo -e "        ${RED_BOLD}▓${NC}${YELLOW_BOLD}══${NC}${WHITE_BOLD}║${CYAN_BOLD}░░░${NC}${GRAY}║${NC}${CYAN_BOLD}●${NC}  ${WHITE_BOLD}DMC-12${NC}  ${CYAN_BOLD}●${NC}${GRAY}║${NC}${CYAN_BOLD}░░░${NC}${WHITE_BOLD}║${NC}${YELLOW_BOLD}══${NC}${RED_BOLD}▓${NC}            "
echo -e "        ${RED_BOLD}▓${NC}${YELLOW_BOLD}══${NC}${WHITE_BOLD}╚═══${NC}${GRAY}╚══════════════╝${NC}${WHITE_BOLD}═══╝${NC}${YELLOW_BOLD}══${NC}${RED_BOLD}▓${NC}            "
echo -e "         ${RED_BOLD}▓▓${NC}${YELLOW_BOLD}═══════════════════════════${NC}${RED_BOLD}▓▓${NC}             "
echo -e "           ${RED_BOLD}▓▓${NC}${WHITE_BOLD}◯${NC}${YELLOW_BOLD}═════════════════${NC}${WHITE_BOLD}◯${NC}${RED_BOLD}▓▓${NC}               "
echo -e "             ${WHITE_BOLD}(${NC}${GRAY}O${NC}${WHITE_BOLD})${NC}               ${WHITE_BOLD}(${NC}${GRAY}O${NC}${WHITE_BOLD})${NC}                 "
echo ""
echo -e "                  ${CYAN_BOLD}System initialized...${NC}                      "
echo ""

sleep 0.35

# Final frame: LUIZ FOSC branding (cyan -> yellow gradient)
printf "\033[H\033[2J"
echo ""
echo ""
echo -e "\033[38;5;44m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;45m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;51m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;87m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;220m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;226m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "      ${YELLOW_BOLD}★${NC} ${WHITE_BOLD}88 mph to production!${NC} ${YELLOW_BOLD}★${NC}"
echo ""
echo -e "          ${BLUE_BOLD}AIOS Core ${WHITE}v2.1${NC}"
echo -e "    ${GRAY}AI-Orchestrated Intelligence System${NC}"
echo ""
echo -e "${CYAN_BOLD}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "  ${WHITE}⚡ Flux Capacitor:${NC} ${GREEN}Online${NC}"
echo -e "  ${WHITE}🔥 Time Circuits:${NC} ${GREEN}Synchronized${NC}"
echo -e "  ${WHITE}⚙️  Core Systems:${NC}  ${GREEN}Ready${NC}"
echo -e "${CYAN_BOLD}════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GRAY}\"Where we're going, we don't need roads.\"${NC}"
echo -e "              ${GRAY}- Doc Brown${NC}"
echo ""

# Show cursor
printf "\033[?25h"
