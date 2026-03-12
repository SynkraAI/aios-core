#!/bin/bash
# Space Invaders — LUIZ FOSC version
# 10-frame animation: Aliens march -> ship fires -> aliens explode

GREEN='\033[0;32m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;22m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;28m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;34m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;40m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;46m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;48m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;45m ◄► INSERT COIN ◄►${NC}  ${WHITE}AIOS Core ${GREEN}v2.1${NC}"
echo -e "\033[38;5;34m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Aliens formation
frame1() {
cat << 'EOF'

      👾  👾  👾  👾  👾  👾  👾
       🟪  🟪  🟪  🟪  🟪  🟪
      👾  👾  👾  👾  👾  👾  👾
       🟩  🟩  🟩  🟩  🟩  🟩



                    🔺
                  🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Frame 2 - Aliens move right
frame2() {
cat << 'EOF'

        👾  👾  👾  👾  👾  👾  👾
         🟪  🟪  🟪  🟪  🟪  🟪
        👾  👾  👾  👾  👾  👾  👾
         🟩  🟩  🟩  🟩  🟩  🟩



                    🔺
                  🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Frame 3 - Aliens move down + left
frame3() {
cat << 'EOF'


      👾  👾  👾  👾  👾  👾  👾
       🟪  🟪  🟪  🟪  🟪  🟪
      👾  👾  👾  👾  👾  👾  👾
       🟩  🟩  🟩  🟩  🟩  🟩



                    🔺
                  🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Frame 4 - Ship fires!
frame4() {
cat << 'EOF'


      👾  👾  👾  👾  👾  👾  👾
       🟪  🟪  🟪  🟪  🟪  🟪
      👾  👾  👾  👾  👾  👾  👾
       🟩  🟩  🟩  🟩  🟩  🟩
                    ⬜
                    ⬜
                    ⬜
                    🔺
                  🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Frame 5 - Laser hits! Alien explodes!
frame5() {
cat << 'EOF'


      👾  👾  👾  👾  👾  👾  👾
       🟪  🟪  🟪  🟪  🟪  🟪
      👾  👾  👾  ✨  👾  👾  👾
       🟩  🟩  🟩  🟩  🟩  🟩


                    🔺
                  🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Frame 6 - More shooting
frame6() {
cat << 'EOF'


      👾  👾  👾  👾  👾  👾  👾
       🟪  🟪  🟪  🟪  🟪  🟪
      👾  👾  👾      👾  👾  👾
       🟩  🟩  🟩  🟩  🟩  🟩
              ⬜
              ⬜
              ⬜
              🔺
            🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Frame 7 - Chain explosions!
frame7() {
cat << 'EOF'


      👾  👾  ✨  👾  👾  👾  👾
       🟪  🟪      🟪  🟪  🟪
      👾  ✨  👾      👾  👾  👾
       🟩  🟩  🟩  🟩  🟩  🟩


              🔺
            🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Frame 8 - Almost all destroyed!
frame8() {
cat << 'EOF'


      👾      ✨      ✨  👾  ✨
       🟪          🟪      🟪
      ✨  ✨  👾      ✨  👾  ✨
           🟩  🟩      🟩


                    🔺
                  🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Frame 9 - Last alien!
frame9() {
cat << 'EOF'



                       👾


                    ⬜
                    ⬜
                    ⬜
                    🔺
                  🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Frame 10 - Victory!
frame10() {
cat << 'EOF'



                       ✨


              ✨  ✨  ✨  ✨  ✨  ✨

                    🔺
                  🟦🟦🟦
              ━━━━━━━━━━━━━━━

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.3
printf "\033[H\033[2J"; frame2; sleep 0.3
printf "\033[H\033[2J"; frame3; sleep 0.3
printf "\033[H\033[2J"; frame4; sleep 0.2
printf "\033[H\033[2J"; frame5; sleep 0.2
printf "\033[H\033[2J"; frame6; sleep 0.2
printf "\033[H\033[2J"; frame7; sleep 0.2
printf "\033[H\033[2J"; frame8; sleep 0.25
printf "\033[H\033[2J"; frame9; sleep 0.3
printf "\033[H\033[2J"; frame10; sleep 0.3

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
