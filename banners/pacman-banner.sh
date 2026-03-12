#!/bin/bash
# Pac-Man — LUIZ FOSC version
# 10-frame animation: Pac-Man eats dots, encounters ghost, power pellet victory

GREEN='\033[0;32m'
BLUE='\033[0;34m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;220m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;221m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;222m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;223m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;229m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;230m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;220m ★ WAKA WAKA! ★${NC}  ${WHITE}AIOS Core ${GREEN}v2.1${NC}"
echo -e "\033[38;5;21m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Pac-Man mouth open + 5 dots
frame1() {
cat << 'EOF'

       🟡🟡🟡🟡
     🟡🟡🟡🟡🟡🟡
    🟡🟡🟡🟡🟡
    🟡🟡🟡🟡              ⬜  ⬜  ⬜  ⬜  ⬜
    🟡🟡🟡🟡🟡
     🟡🟡🟡🟡🟡🟡
       🟡🟡🟡🟡

EOF
}

# Frame 2 - Pac-Man mouth closing
frame2() {
cat << 'EOF'

       🟡🟡🟡🟡
     🟡🟡🟡🟡🟡🟡
    🟡🟡🟡🟡🟡🟡
    🟡🟡🟡🟡🟡🟡          ⬜  ⬜  ⬜  ⬜  ⬜
    🟡🟡🟡🟡🟡🟡
     🟡🟡🟡🟡🟡🟡
       🟡🟡🟡🟡

EOF
}

# Frame 3 - Pac-Man open, ate 1 dot
frame3() {
cat << 'EOF'

          🟡🟡🟡🟡
        🟡🟡🟡🟡🟡🟡
       🟡🟡🟡🟡🟡
       🟡🟡🟡🟡                 ⬜  ⬜  ⬜  ⬜
       🟡🟡🟡🟡🟡
        🟡🟡🟡🟡🟡🟡
          🟡🟡🟡🟡

EOF
}

# Frame 4 - Ghost appears
frame4() {
cat << 'EOF'

            🟡🟡🟡🟡                          🟥🟥🟥
          🟡🟡🟡🟡🟡🟡                      🟥🟥🟥🟥🟥
         🟡🟡🟡🟡🟡🟡                      ⬜⬛🟥⬜⬛
         🟡🟡🟡🟡🟡🟡       ⬜  ⬜  ⬜    🟥🟥🟥🟥🟥
         🟡🟡🟡🟡🟡🟡                      🟥🟥🟥🟥🟥
          🟡🟡🟡🟡🟡🟡                      🟥⬛🟥⬛🟥
            🟡🟡🟡🟡

EOF
}

# Frame 5 - Ghost closer + power pellet
frame5() {
cat << 'EOF'

              🟡🟡🟡🟡                   🟥🟥🟥
            🟡🟡🟡🟡🟡🟡              🟥🟥🟥🟥🟥
           🟡🟡🟡🟡🟡                  ⬜⬛🟥⬜⬛
           🟡🟡🟡🟡        ⬜  🟠     🟥🟥🟥🟥🟥
           🟡🟡🟡🟡🟡                  🟥🟥🟥🟥🟥
            🟡🟡🟡🟡🟡🟡              🟥⬛🟥⬛🟥
              🟡🟡🟡🟡

EOF
}

# Frame 6 - Power pellet eaten! FLASH
frame6() {
cat << 'EOF'

                🟡🟡🟡🟡              🟥🟥🟥
              🟡🟡🟡🟡🟡🟡          🟥🟥🟥🟥🟥
             🟡🟡🟡🟡🟡              ⬜⬛🟥⬜⬛
             🟡🟡🟡🟡  ✨✨✨       🟥🟥🟥🟥🟥
             🟡🟡🟡🟡🟡              🟥🟥🟥🟥🟥
              🟡🟡🟡🟡🟡🟡          🟥⬛🟥⬛🟥
                🟡🟡🟡🟡

EOF
}

# Frame 7 - Ghost turns BLUE
frame7() {
cat << 'EOF'

                🟡🟡🟡🟡              🟦🟦🟦
              🟡🟡🟡🟡🟡🟡          🟦🟦🟦🟦🟦
             🟡🟡🟡🟡🟡              ⬜⬜🟦⬜⬜
             🟡🟡🟡🟡                🟦🟦🟦🟦🟦
             🟡🟡🟡🟡🟡              🟦🟦🟦🟦🟦
              🟡🟡🟡🟡🟡🟡          🟦⬛🟦⬛🟦
                🟡🟡🟡🟡

EOF
}

# Frame 8 - Pac-Man chases ghost
frame8() {
cat << 'EOF'

                  🟡🟡🟡🟡        🟦🟦🟦
                🟡🟡🟡🟡🟡🟡    🟦🟦🟦🟦🟦
               🟡🟡🟡🟡🟡        ⬜⬜🟦⬜⬜
               🟡🟡🟡🟡          🟦🟦🟦🟦🟦
               🟡🟡🟡🟡🟡        🟦🟦🟦🟦🟦
                🟡🟡🟡🟡🟡🟡    🟦⬛🟦⬛🟦
                  🟡🟡🟡🟡

EOF
}

# Frame 9 - Pac-Man eats ghost! "200"
frame9() {
cat << 'EOF'

                      🟡🟡🟡🟡
                    🟡🟡🟡🟡🟡🟡
                   🟡🟡🟡🟡🟡        ✨
                   🟡🟡🟡🟡        ２００
                   🟡🟡🟡🟡🟡        ✨
                    🟡🟡🟡🟡🟡🟡
                      🟡🟡🟡🟡

EOF
}

# Frame 10 - Victory!
frame10() {
cat << 'EOF'

                         🟡🟡🟡🟡
                       🟡🟡🟡🟡🟡🟡
                      🟡🟡🟡🟡🟡🟡🟡
                      🟡🟡🟡🟡🟡🟡🟡
                      🟡🟡🟡🟡🟡🟡🟡
                       🟡🟡🟡🟡🟡🟡
                         🟡🟡🟡🟡
                     ✨  ✨  ✨  ✨  ✨

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.25
printf "\033[H\033[2J"; frame2; sleep 0.2
printf "\033[H\033[2J"; frame3; sleep 0.25
printf "\033[H\033[2J"; frame4; sleep 0.3
printf "\033[H\033[2J"; frame5; sleep 0.3
printf "\033[H\033[2J"; frame6; sleep 0.15
printf "\033[H\033[2J"; frame7; sleep 0.3
printf "\033[H\033[2J"; frame8; sleep 0.25
printf "\033[H\033[2J"; frame9; sleep 0.35
printf "\033[H\033[2J"; frame10; sleep 0.3

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
