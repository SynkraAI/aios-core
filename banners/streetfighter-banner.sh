#!/bin/bash
# Street Fighter — LUIZ FOSC version
# 10-frame animation: Ryu stance -> wind up -> HADOUKEN! -> fireball travels

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;196m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;202m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;208m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;214m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;220m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;226m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;196m ★ PERFECT! ★${NC}  ${WHITE}AIOS Core ${GREEN}v2.1${NC}"
echo -e "\033[38;5;208m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Ryu fighting stance
frame1() {
cat << 'EOF'

                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
               ⬛🟨⬛⬜⬛🟨⬛
                ⬛🟨🟨🟨🟨⬛
          ⬛⬛⬛🟨🟨🟨🟨⬛
         ⬛🟨⬛⬜⬜⬜⬜⬜⬛⬛
              ⬛⬜⬜⬜⬜⬛🟨⬛
              ⬛⬜⬛⬛⬜⬛
             ⬛⬜⬛  ⬛⬜⬛
            ⬛🟫🟫⬛⬛🟫🟫⬛

EOF
}

# Frame 2 - Ryu pulls arms back
frame2() {
cat << 'EOF'

                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
               ⬛🟨⬛⬜⬛🟨⬛
                ⬛🟨🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨⬛
         ⬛⬛🟨⬜⬜⬜⬜⬜⬛
        ⬛🟨⬛⬜⬜⬜⬜⬛
              ⬛⬜⬛⬛⬜⬛
             ⬛⬜⬛  ⬛⬜⬛
            ⬛🟫🟫⬛⬛🟫🟫⬛

EOF
}

# Frame 3 - Arms at side, chi gathering
frame3() {
cat << 'EOF'

                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
               ⬛🟨⬛⬜⬛🟨⬛
                ⬛🟨🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨⬛
       ⬛⬛🟨🟨⬜⬜⬜⬜⬜⬛
      ⬛🟨⬛  🟦⬜⬜⬜⬛
              ⬛⬜⬛⬛⬜⬛
             ⬛⬜⬛  ⬛⬜⬛
            ⬛🟫🟫⬛⬛🟫🟫⬛

EOF
}

# Frame 4 - CHI energy forming!
frame4() {
cat << 'EOF'

                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
               ⬛🟨⬛⬜⬛🟨⬛
                ⬛🟨🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨⬛
       ⬛⬛🟨🟨⬜⬜⬜⬜⬜⬛
      ⬛🟨⬛ 🟦🟦⬜⬜⬛
             🟦🟦🟦⬛⬛⬜⬛
             ⬛⬜⬛  ⬛⬜⬛
            ⬛🟫🟫⬛⬛🟫🟫⬛

EOF
}

# Frame 5 - HADOUKEN! Energy ball forming
frame5() {
cat << 'EOF'

                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
               ⬛🟨⬛⬜⬛🟨⬛
                ⬛🟨🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
              ⬛⬜⬜⬜⬜⬜⬛ ✨🟦✨
              ⬛⬜⬜⬜⬜⬛   ✨🟦✨
              ⬛⬜⬛⬛⬜⬛
             ⬛⬜⬛  ⬛⬜⬛
            ⬛🟫🟫⬛⬛🟫🟫⬛

EOF
}

# Frame 6 - HADOUKEN launched!
frame6() {
cat << 'EOF'

                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
               ⬛🟨⬛⬜⬛🟨⬛
                ⬛🟨🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
              ⬛⬜⬜⬜⬜⬜⬛⬛         ✨🟦🟦✨
              ⬛⬜⬜⬜⬜⬛            ✨🟦🟦✨
              ⬛⬜⬛⬛⬜⬛
             ⬛⬜⬛  ⬛⬜⬛
            ⬛🟫🟫⬛⬛🟫🟫⬛

EOF
}

# Frame 7 - Fireball traveling!
frame7() {
cat << 'EOF'

                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
               ⬛🟨⬛⬜⬛🟨⬛
                ⬛🟨🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
              ⬛⬜⬜⬜⬜⬜⬛⬛                  🟦🟦🟦
              ⬛⬜⬜⬜⬜⬛                   ✨🟦🟦🟦✨
              ⬛⬜⬛⬛⬜⬛                     🟦🟦🟦
             ⬛⬜⬛  ⬛⬜⬛
            ⬛🟫🟫⬛⬛🟫🟫⬛

EOF
}

# Frame 8 - Fireball flying far!
frame8() {
cat << 'EOF'

                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
               ⬛🟨⬛⬜⬛🟨⬛
                ⬛🟨🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
              ⬛⬜⬜⬜⬜⬜⬛⬛                            🟦🟦🟦
              ⬛⬜⬜⬜⬜⬛                             ✨🟦🟦🟦✨
              ⬛⬜⬛⬛⬜⬛                               🟦🟦🟦
             ⬛⬜⬛  ⬛⬜⬛
            ⬛🟫🟫⬛⬛🟫🟫⬛

EOF
}

# Frame 9 - IMPACT! Explosion!
frame9() {
cat << 'EOF'

                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛                         ✨    ✨
               ⬛🟨⬛⬜⬛🟨⬛                       ✨  🟦🟦  ✨
                ⬛🟨🟨🟨🟨⬛                     ✨  🟦🟦🟦🟦  ✨
               ⬛🟨🟨🟨🟨🟨⬛                      ✨  🟦🟦  ✨
              ⬛⬜⬜⬜⬜⬜⬛⬛                       ✨    ✨
              ⬛⬜⬜⬜⬜⬛
              ⬛⬜⬛⬛⬜⬛
             ⬛⬜⬛  ⬛⬜⬛
            ⬛🟫🟫⬛⬛🟫🟫⬛

EOF
}

# Frame 10 - Victory pose!
frame10() {
cat << 'EOF'

                ⬛
              ⬛🟨⬛
                  ⬛⬛⬛
                ⬛🟨🟨🟨⬛
               ⬛🟨🟨🟨🟨🟨⬛
               ⬛🟨⬛⬜⬛🟨⬛
                ⬛🟨🟨🟨🟨⬛
            ⬛⬛🟨🟨🟨🟨🟨🟨⬛⬛
              ⬛⬜⬜⬜⬜⬜⬜⬛
              ⬛⬜⬛⬛⬛⬛⬜⬛
             ⬛⬜⬛    ⬛⬜⬛
            ⬛🟫🟫⬛  ⬛🟫🟫⬛

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.35
printf "\033[H\033[2J"; frame2; sleep 0.25
printf "\033[H\033[2J"; frame3; sleep 0.25
printf "\033[H\033[2J"; frame4; sleep 0.25
printf "\033[H\033[2J"; frame5; sleep 0.25
printf "\033[H\033[2J"; frame6; sleep 0.2
printf "\033[H\033[2J"; frame7; sleep 0.15
printf "\033[H\033[2J"; frame8; sleep 0.15
printf "\033[H\033[2J"; frame9; sleep 0.3
printf "\033[H\033[2J"; frame10; sleep 0.4

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
