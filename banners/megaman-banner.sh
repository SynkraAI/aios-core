#!/bin/bash
# Mega Man — LUIZ FOSC version
# 9-frame animation: Teleport beam -> materialize -> landing -> arm cannon ready!

GREEN='\033[0;32m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;25m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;31m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;37m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;43m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;49m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;51m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;45m ◆ READY! ◆${NC}  \033[1;37mAIOS Core \033[0;32mv2.1${NC}"
echo -e "\033[38;5;33m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Beam from sky (thin)
frame1() {
cat << 'EOF'

                      ⬜
                      ⬜
                      ⬜
                      ⬜
                      ⬜
                      ⬜
                      ⬜
                      ⬜
                      ⬜
                      ⬜

EOF
}

# Frame 2 - Beam wider
frame2() {
cat << 'EOF'

                    ⬜⬜⬜
                    ⬜🟦⬜
                    ⬜🟦⬜
                    ⬜🟦⬜
                    ⬜🟦⬜
                    ⬜🟦⬜
                    ⬜🟦⬜
                    ⬜🟦⬜
                    ⬜🟦⬜
                    ⬜⬜⬜

EOF
}

# Frame 3 - Beam pulsing
frame3() {
cat << 'EOF'

                  ✨⬜🟦⬜✨
                    ⬜🟦⬜
                  ✨⬜🟦⬜✨
                    ⬜🟦⬜
                  ✨⬜🟦⬜✨
                    ⬜🟦⬜
                  ✨⬜🟦⬜✨
                    ⬜🟦⬜
                  ✨⬜🟦⬜✨
                    ⬜⬜⬜

EOF
}

# Frame 4 - Shape forming in beam
frame4() {
cat << 'EOF'

                    ⬜🟦⬜
                    ⬜🟦⬜
                    ⬜🟦⬜
                   ⬛⬜🟦⬜⬛
                   ⬛⬜🟦⬜⬛
                    ⬛🟦🟦⬛
                    ⬜🟦⬜
                    ⬜🟦⬜
                   ⬛⬜⬜⬜⬛
                    ⬜⬜⬜

EOF
}

# Frame 5 - Mega Man materializing!
frame5() {
cat << 'EOF'

                    ⬜⬜⬜
                  ⬜⬛🟦🟦🟦⬛⬜
                 ⬜⬛🟦🟦🟦🟦🟦⬛⬜
                  ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟨⬛⬜⬛🟨⬛
                   ⬛🟨🟨🟨🟨⬛
                  ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟦🟦⬛🟦🟦⬛
                  ⬛🟦⬛⬛⬛🟦⬛
                  ⬛🟦⬛  ⬛🟦⬛

EOF
}

# Frame 6 - Mega Man SOLID! Landing pose
frame6() {
cat << 'EOF'

                    ⬛⬛⬛
                  ⬛🟦🟦🟦⬛
                 ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟨⬛⬜⬛🟨⬛
                   ⬛🟨🟨🟨🟨⬛
                  ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟦🟦⬛🟦🟦⬛
                  ⬛🟦⬛⬛⬛🟦⬛
                 ⬛🟦🟦⬛⬛🟦🟦⬛

EOF
}

# Frame 7 - Mega Man standing tall
frame7() {
cat << 'EOF'

                    ⬛⬛⬛
                  ⬛🟦🟦🟦⬛
                 ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟨⬛⬜⬛🟨⬛
                   ⬛🟨🟨🟨🟨⬛
               ⬛⬛🟦🟦🟦🟦🟦⬛⬛
              ⬛🟦🟦🟦🟦⬛🟦🟦🟦⬛
                  ⬛🟦⬛⬛⬛🟦⬛
                 ⬛🟦🟦⬛⬛🟦🟦⬛

EOF
}

# Frame 8 - Arm cannon CHARGING!
frame8() {
cat << 'EOF'

                    ⬛⬛⬛
                  ⬛🟦🟦🟦⬛
                 ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟨⬛⬜⬛🟨⬛
                   ⬛🟨🟨🟨🟨⬛
               ⬛⬛🟦🟦🟦🟦🟦⬛⬛
              ⬛🟦🟦🟦🟦⬛🟦🟦🟦⬛
            ✨⬛🟦🟦⬛⬛⬛⬛🟦⬛
                 ⬛🟦🟦⬛⬛🟦🟦⬛

EOF
}

# Frame 9 - MEGA BUSTER FIRE!
frame9() {
cat << 'EOF'

                    ⬛⬛⬛
                  ⬛🟦🟦🟦⬛
                 ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟦🟦🟦🟦🟦⬛
                  ⬛🟨⬛⬜⬛🟨⬛
                   ⬛🟨🟨🟨🟨⬛
               ⬛⬛🟦🟦🟦🟦🟦⬛⬛
              ⬛🟦🟦🟦🟦⬛🟦🟦🟦⬛
    🟡🟡🟡✨⬛🟦🟦⬛⬛⬛⬛🟦⬛
                 ⬛🟦🟦⬛⬛🟦🟦⬛

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.15
printf "\033[H\033[2J"; frame2; sleep 0.15
printf "\033[H\033[2J"; frame3; sleep 0.2
printf "\033[H\033[2J"; frame4; sleep 0.25
printf "\033[H\033[2J"; frame5; sleep 0.25
printf "\033[H\033[2J"; frame6; sleep 0.3
printf "\033[H\033[2J"; frame7; sleep 0.3
printf "\033[H\033[2J"; frame8; sleep 0.35
printf "\033[H\033[2J"; frame9; sleep 0.4

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
