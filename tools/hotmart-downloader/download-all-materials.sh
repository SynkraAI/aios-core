#!/bin/bash
# Download materials from all Leandro Ladeira courses

source .venv/bin/activate

# Course selections for blackfridayinfinita subdomain
# Based on the course list:
# 1. Stories 10x
# 2. Pronto para vender
# 3. Seu produto pronto
# 4. Fórmula High Ticket
# 5. Tráfego Pronto
# 6. Fórmula de Lançamento
# 7. Automações Inteligentes
# 8. WhatsApp 10x
# 9. Crescimento 10x
# 10. Mentalidade Black
# 11. Filosofia Ladeira
# 12. Conversão 10x
# 13. Light Copy
# 14. Venda Todo Santo Dia
# 15. SuperAds

# Courses to download (matching user's list)
COURSES=(
  "9:Crescimento 10x"
  "11:Filosofia Ladeira"
  "6:Fórmula de Lançamento"
  "4:Fórmula High Ticket"
  "12:Conversão 10x"
  "13:Light Copy"
  "14:Venda Todo Santo Dia"
  "1:Stories 10x"
  "8:WhatsApp 10x"
  "5:Tráfego Pronto"
  "16:Pronto para vender"
  "17:Seu produto pronto"
  "10:Mentalidade Black"
)

echo "=========================================="
echo "Downloading materials from blackfridayinfinita courses"
echo "=========================================="

for course in "${COURSES[@]}"; do
  IFS=':' read -r num name <<< "$course"
  echo ""
  echo "[$num] Processing: $name"
  echo "------------------------------------------"

  printf "$num\n" | hotmart-dl download \
    -c blackfridayinfinita \
    --materials-only 2>&1 | \
    grep -E "Download Summary|Total lessons|Completed|Attachments|Failed" || true
done

# Download from other subdomains
echo ""
echo "=========================================="
echo "Downloading: Pitch de 100 Milhões"
echo "=========================================="
printf "1\n" | hotmart-dl download -c maquina-7d --materials-only 2>&1 | \
  grep -E "Download Summary|Total lessons|Completed|Attachments|Failed" || true

echo ""
echo "=========================================="
echo "Downloading: Os 3 Funis High Ticket"
echo "=========================================="
hotmart-dl download -c 3funishighticket --materials-only 2>&1 | \
  grep -E "Download Summary|Total lessons|Completed|Attachments|Failed" || true

echo ""
echo "=========================================="
echo "DOWNLOAD COMPLETE!"
echo "Check downloads/ directory for materials"
echo "=========================================="
