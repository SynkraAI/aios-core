#!/bin/bash
# Star Wars — LUIZ FOSC version
# 10-frame animation: Starfield -> Death Star -> X-Wing trench run -> EXPLOSION!

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BRIGHT_WHITE='\033[1;97m'
DIM='\033[2m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;27m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;33m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;39m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;45m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;220m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;226m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;45m ☆ May the Code be with you ☆${NC}  ${WHITE}AIOS Core ${GREEN}v2.1${NC}"
echo -e "\033[38;5;220m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Dark space, few stars
frame1() {
cat << 'EOF'

          ✦                                         ✦
                    ✦
     ✦                          ✦
                                            ✦
               ✦
                          ✦                      ✦
    ✦                                  ✦
                  ✦
          ✦                    ✦                 ✦
                                         ✦
     ✦               ✦

EOF
}

# Frame 2 - "A long time ago..." + stars
frame2() {
echo -e "${CYAN}"
cat << 'EOF'

         ✦                                       ✦
                   ✦
    ✦                        ✦

              A long time ago in a galaxy
                   far, far away....

    ✦                                  ✦
                 ✦
         ✦                   ✦                ✦
                                        ✦

EOF
echo -e "${NC}"
}

# Frame 3 - Death Star appears (distant, small)
frame3() {
cat << 'EOF'

    ✦                                          ✦
               ✦                  ✦
                                       ⬛⬛⬛
    ✦                                ⬛⬜⬜⬜⬜⬛
                                    ⬛⬜⬛⬜⬜⬜⬛
                   ✦                ⬛━━🟢━━━━⬛
         ✦                           ⬛⬜⬜⬜⬜⬛
                                       ⬛⬛⬛
    ✦              ✦                              ✦
               ✦                  ✦
                          ✦

EOF
}

# Frame 4 - Death Star closer, more detail
frame4() {
cat << 'EOF'

    ✦              ✦                        ✦
                                    ⬛⬛⬛⬛⬛
               ✦                ⬛⬜⬜⬜⬜⬜⬜⬜⬛
                              ⬛⬜⬜⬜⬛⬜⬜⬜⬜⬜⬛
    ✦                        ⬛⬜⬜⬛⬛🟢⬛⬜⬜⬜⬜⬛
                             ⬛⬜⬜⬜⬛⬛⬜⬜⬜⬜⬜⬜⬛
               ✦             ⬛━━━━━━━━━━━━━━━━━━━⬛
         ✦                   ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
                              ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
    ✦                           ⬛⬜⬜⬜⬜⬜⬜⬜⬛
               ✦                   ⬛⬛⬛⬛⬛

EOF
}

# Frame 5 - X-Wing enters from left!
frame5() {
cat << 'EOF'

    ✦              ✦                        ✦
                                    ⬛⬛⬛⬛⬛
               ✦                ⬛⬜⬜⬜⬜⬜⬜⬜⬛
                              ⬛⬜⬜⬜⬛⬜⬜⬜⬜⬜⬛
   ⬛                        ⬛⬜⬜⬛⬛🟢⬛⬜⬜⬜⬜⬛
  ⬛⬜⬛                      ⬛⬜⬜⬜⬛⬛⬜⬜⬜⬜⬜⬜⬛
 ⬛⬜⬜⬜━━━                  ⬛━━━━━━━━━━━━━━━━━━━⬛
  ⬛⬜⬛                      ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
   ⬛                         ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
    ✦                           ⬛⬜⬜⬜⬜⬜⬜⬜⬛
               ✦                   ⬛⬛⬛⬛⬛

EOF
}

# Frame 6 - X-Wing approaching Death Star
frame6() {
cat << 'EOF'

    ✦              ✦                        ✦
                                    ⬛⬛⬛⬛⬛
               ✦                ⬛⬜⬜⬜⬜⬜⬜⬜⬛
                              ⬛⬜⬜⬜⬛⬜⬜⬜⬜⬜⬛
              ⬛             ⬛⬜⬜⬛⬛🟢⬛⬜⬜⬜⬜⬛
             ⬛⬜⬛           ⬛⬜⬜⬜⬛⬛⬜⬜⬜⬜⬜⬜⬛
            ⬛⬜⬜⬜━━━       ⬛━━━━━━━━━━━━━━━━━━━⬛
             ⬛⬜⬛           ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
              ⬛              ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
    ✦                           ⬛⬜⬜⬜⬜⬜⬜⬜⬛
               ✦                   ⬛⬛⬛⬛⬛

EOF
}

# Frame 7 - X-Wing FIRES proton torpedo!
frame7() {
cat << 'EOF'

    ✦              ✦                        ✦
                                    ⬛⬛⬛⬛⬛
               ✦                ⬛⬜⬜⬜⬜⬜⬜⬜⬛
                              ⬛⬜⬜⬜⬛⬜⬜⬜⬜⬜⬛
                    ⬛       ⬛⬜⬜⬛⬛🟢⬛⬜⬜⬜⬜⬛
                   ⬛⬜⬛     ⬛⬜⬜⬜⬛⬛⬜⬜⬜⬜⬜⬜⬛
                  ⬛⬜⬜⬜━🟡   ⬛━━━━━━━━━━━━━━━━━━━⬛
                   ⬛⬜⬛     ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
                    ⬛        ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
    ✦                           ⬛⬜⬜⬜⬜⬜⬜⬜⬛
               ✦                   ⬛⬛⬛⬛⬛

EOF
}

# Frame 8 - Torpedo traveling toward exhaust port!
frame8() {
cat << 'EOF'

    ✦              ✦                        ✦
                                    ⬛⬛⬛⬛⬛
               ✦                ⬛⬜⬜⬜⬜⬜⬜⬜⬛
                              ⬛⬜⬜⬜⬛⬜⬜⬜⬜⬜⬛
                          ⬛ ⬛⬜⬜⬛⬛🟢⬛⬜⬜⬜⬜⬛
                         ⬛⬜⬛ ⬛⬜⬜⬜⬛⬛⬜⬜⬜⬜⬜⬜⬛
                        ⬛⬜⬜⬜━━━🟡⬛━━━━━━━━━━━━━━⬛
                         ⬛⬜⬛ ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
                          ⬛  ⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
    ✦                           ⬛⬜⬜⬜⬜⬜⬜⬜⬛
               ✦                   ⬛⬛⬛⬛⬛

EOF
}

# Frame 9 - DIRECT HIT! Death Star exploding!
frame9() {
cat << 'EOF'

    ✦                                       ✦
                              ✨  ✨  ✨  ✨
               ✦          ✨  🟧🟧🟧🟧🟧🟧  ✨
                        ✨🟧🟥🟥🟧🟥🟥🟧🟥🟧✨
                       ✨🟧🟥🟧🟥🟧🟧🟥🟧🟥🟧✨
                      ✨🟥🟧🟥🟧🟡🟡🟧🟥🟧🟥🟧✨
                      ✨🟧🟥🟧🟡🟡🟡🟡🟧🟥🟧🟥✨
                      ✨🟥🟧🟥🟧🟡🟡🟧🟥🟧🟥🟧✨
                       ✨🟧🟥🟧🟥🟧🟧🟥🟧🟥🟧✨
    ✦                   ✨🟧🟥🟧🟥🟥🟧🟥🟧✨
                          ✨  🟧🟧🟧🟧🟧  ✨
               ✦            ✨  ✨  ✨  ✨

EOF
}

# Frame 10 - Debris clearing, victory!
frame10() {
cat << 'EOF'

    ✦              ✦                        ✦
                          ✨         ✨
               ✦       🟧    ✨          🟧
                    ✨                 ✨
    ✦                     ✨    ✨
                        ✨   ✨   ✨
               ✦          ✨      ✨
         ✦            🟧     ✨     🟧
                          ✨    ✨
    ✦              ✨              ✨        ✦
               ✦          ✦           ✦
                                ✦

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.35
printf "\033[H\033[2J"; frame2; sleep 0.8
printf "\033[H\033[2J"; frame3; sleep 0.35
printf "\033[H\033[2J"; frame4; sleep 0.35
printf "\033[H\033[2J"; frame5; sleep 0.3
printf "\033[H\033[2J"; frame6; sleep 0.25
printf "\033[H\033[2J"; frame7; sleep 0.2
printf "\033[H\033[2J"; frame8; sleep 0.2
printf "\033[H\033[2J"; frame9; sleep 0.4
printf "\033[H\033[2J"; frame10; sleep 0.35

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
