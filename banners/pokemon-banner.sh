#!/bin/bash
# Pokemon — LUIZ FOSC version
# 10-frame animation: Pokeball throw -> open -> Pikachu appears

GREEN='\033[0;32m'
BLUE='\033[0;34m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;196m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;197m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;203m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;209m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;220m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;226m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;226m ⚡ Gotta code 'em all! ⚡${NC}  ${WHITE}AIOS Core ${GREEN}v2.1${NC}"
echo -e "\033[38;5;196m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Pokeball flying (high, left)
frame1() {
cat << 'EOF'


          🟥🟥🟥
        🟥🟥🟥🟥🟥
        ⬛⬛⬛⬛⬛
        ⬜⬜⬜⬜⬜
          ⬜⬜⬜



EOF
}

# Frame 2 - Pokeball flying (mid)
frame2() {
cat << 'EOF'



              🟥🟥🟥
            🟥🟥🟥🟥🟥
            ⬛⬛⬛⬛⬛
            ⬜⬜⬜⬜⬜
              ⬜⬜⬜



EOF
}

# Frame 3 - Pokeball flying (center, lower)
frame3() {
cat << 'EOF'




                  🟥🟥🟥
                🟥🟥🟥🟥🟥
                ⬛⬛⬛⬛⬛
                ⬜⬜⬜⬜⬜
                  ⬜⬜⬜


EOF
}

# Frame 4 - Pokeball landing (center)
frame4() {
cat << 'EOF'




                    🟥🟥🟥🟥
                  🟥🟥🟥🟥🟥🟥
                  🟥🟥🟥🟥🟥🟥
                  ⬛⬛⬜⬛⬛⬛
                  ⬜⬜⬜⬜⬜⬜
                  ⬜⬜⬜⬜⬜⬜
                    ⬜⬜⬜⬜

EOF
}

# Frame 5 - Pokeball shaking left
frame5() {
cat << 'EOF'




                  🟥🟥🟥🟥
                🟥🟥🟥🟥🟥🟥
                🟥🟥🟥🟥🟥🟥
            ✨  ⬛⬛⬜⬛⬛⬛
                ⬜⬜⬜⬜⬜⬜
                ⬜⬜⬜⬜⬜⬜
                  ⬜⬜⬜⬜

EOF
}

# Frame 6 - Pokeball shaking right
frame6() {
cat << 'EOF'




                      🟥🟥🟥🟥
                    🟥🟥🟥🟥🟥🟥
                    🟥🟥🟥🟥🟥🟥
                    ⬛⬛⬜⬛⬛⬛  ✨
                    ⬜⬜⬜⬜⬜⬜
                    ⬜⬜⬜⬜⬜⬜
                      ⬜⬜⬜⬜

EOF
}

# Frame 7 - Pokeball OPENING! Flash!
frame7() {
cat << 'EOF'


                  ✨  ✨  ✨  ✨
              ✨                    ✨
                    🟥🟥🟥🟥
                  🟥🟥🟥🟥🟥🟥
              ✨  ⬛⬛⬜⬛⬛⬛  ✨
                  ⬜⬜⬜⬜⬜⬜
                    ⬜⬜⬜⬜
              ✨                    ✨
                  ✨  ✨  ✨  ✨

EOF
}

# Frame 8 - White flash
frame8() {
cat << 'EOF'


            ✨  ✨  ✨  ✨  ✨  ✨  ✨

          ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨

            ✨  ✨  ✨  ✨  ✨  ✨  ✨

          ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨

            ✨  ✨  ✨  ✨  ✨  ✨  ✨


EOF
}

# Frame 9 - Pikachu appears!
frame9() {
cat << 'EOF'

                  ⬛🟡            🟡⬛
                  ⬛🟡🟡        🟡🟡⬛
                    ⬛🟡🟡🟡🟡🟡🟡⬛
                  ⬛🟡🟡🟡🟡🟡🟡🟡🟡⬛
                  ⬛🟡⬛⬜🟡🟡⬜⬛🟡⬛
                  ⬛🟡🟡🟡⬛⬛🟡🟡🟡⬛
                  ⬛🟡🟥🟡🟡🟡🟡🟥🟡⬛
                    ⬛🟡🟡🟡🟡🟡🟡⬛
                      ⬛🟡🟡🟡🟡⬛
                    ⬛🟡🟡🟡🟡🟡🟡⬛

EOF
}

# Frame 10 - Pikachu ready! Sparks!
frame10() {
cat << 'EOF'

              ⚡  ⬛🟡            🟡⬛
                  ⬛🟡🟡        🟡🟡⬛  ⚡
                    ⬛🟡🟡🟡🟡🟡🟡⬛
                  ⬛🟡🟡🟡🟡🟡🟡🟡🟡⬛
                  ⬛🟡⬛⬜🟡🟡⬜⬛🟡⬛
              ⚡  ⬛🟡🟡🟡⬛⬛🟡🟡🟡⬛
                  ⬛🟡🟥🟡🟡🟡🟡🟥🟡⬛  ⚡
                    ⬛🟡🟡🟡🟡🟡🟡⬛
                      ⬛🟡🟡🟡🟡⬛
                    ⬛🟡🟡🟡🟡🟡🟡⬛

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.15
printf "\033[H\033[2J"; frame2; sleep 0.15
printf "\033[H\033[2J"; frame3; sleep 0.15
printf "\033[H\033[2J"; frame4; sleep 0.4
printf "\033[H\033[2J"; frame5; sleep 0.25
printf "\033[H\033[2J"; frame6; sleep 0.25
printf "\033[H\033[2J"; frame7; sleep 0.3
printf "\033[H\033[2J"; frame8; sleep 0.15
printf "\033[H\033[2J"; frame9; sleep 0.4
printf "\033[H\033[2J"; frame10; sleep 0.35

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
