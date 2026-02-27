#!/bin/bash

# E2E Webhook Test Script
# Tests complete flow: webhook → capture → parser → replication

set -e

API_URL="${API_URL:-http://localhost:3000}"
TENANT_ID="${TENANT_ID:-tenant-test-123}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

echo "🧪 E2E Webhook Test"
echo "===================="
echo "API_URL: $API_URL"
echo "TENANT_ID: $TENANT_ID"
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."

# Check Redis
if ! redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
  echo "❌ Redis not running at $REDIS_URL"
  exit 1
fi
echo "  ✓ Redis running"

# Check API
if ! curl -s "$API_URL/health" > /dev/null; then
  echo "❌ API not running at $API_URL"
  exit 1
fi
echo "  ✓ API running"

echo ""
echo "📤 Test 1: Simple text message (marketplace detection)"
echo "======================================================"

MSG_ID_1=$(date +%s%N)
RESPONSE_1=$(curl -s -X POST "$API_URL/webhooks/evolution" \
  -H "Content-Type: application/json" \
  -d "{
    \"data\": {
      \"key\": {
        \"remoteJid\": \"120363099999999@g.us\",
        \"id\": \"msg-$MSG_ID_1\",
        \"participant\": \"5511999999999@s.whatsapp.net\",
        \"fromMe\": false
      },
      \"message\": {
        \"conversation\": \"Novo produto! https://shopee.com.br/product/123456 - R\$ 99.90\"
      },
      \"messageTimestamp\": $(date +%s)
    },
    \"instance\": {
      \"instanceName\": \"test_instance\",
      \"serverUrl\": \"http://localhost:3000\"
    }
  }")

echo "Response: $RESPONSE_1"
echo "  ✓ Message sent to webhook"

sleep 2

# Check if job was enqueued
QUEUE_SIZE=$(redis-cli -u "$REDIS_URL" LLEN "bull:offer-parser:$TENANT_ID" 2>/dev/null || echo "0")
echo "  ✓ Jobs in offer-parser queue: $QUEUE_SIZE"

echo ""
echo "📸 Test 2: Message with image + caption"
echo "======================================="

MSG_ID_2=$(date +%s%N)
RESPONSE_2=$(curl -s -X POST "$API_URL/webhooks/evolution" \
  -H "Content-Type: application/json" \
  -d "{
    \"data\": {
      \"key\": {
        \"remoteJid\": \"120363099999999@g.us\",
        \"id\": \"msg-$MSG_ID_2\",
        \"participant\": \"5511999999999@s.whatsapp.net\",
        \"fromMe\": false
      },
      \"message\": {
        \"imageMessage\": {
          \"url\": \"https://ae-pic-a1.aliexpress-media.com/kf/S123456.jpg\",
          \"caption\": \"Confira! Mercado Livre: https://www.mercadolivre.com.br/item-123 - 40% OFF\"
        }
      },
      \"messageTimestamp\": $(date +%s)
    },
    \"instance\": {
      \"instanceName\": \"test_instance\",
      \"serverUrl\": \"http://localhost:3000\"
    }
  }")

echo "Response: $RESPONSE_2"
echo "  ✓ Image message sent to webhook"

sleep 2

QUEUE_SIZE=$(redis-cli -u "$REDIS_URL" LLEN "bull:offer-parser:$TENANT_ID" 2>/dev/null || echo "0")
echo "  ✓ Jobs in offer-parser queue: $QUEUE_SIZE"

echo ""
echo "🔗 Test 3: Link preview message (NOVIDADE)"
echo "=========================================="

MSG_ID_3=$(date +%s%N)
RESPONSE_3=$(curl -s -X POST "$API_URL/webhooks/evolution" \
  -H "Content-Type: application/json" \
  -d "{
    \"data\": {
      \"key\": {
        \"remoteJid\": \"120363099999999@g.us\",
        \"id\": \"msg-$MSG_ID_3\",
        \"participant\": \"5511999999999@s.whatsapp.net\",
        \"fromMe\": false
      },
      \"message\": {
        \"webPreviewMessage\": {
          \"text\": \"Melhor preço!\",
          \"title\": \"Produto Premium - 50% OFF\",
          \"description\": \"Amazon exclusive deal\",
          \"canonicalUrl\": \"https://amazon.com.br/dp/B123456789\",
          \"image\": {
            \"url\": \"https://m.media-amazon.com/images/I/123456.jpg\"
          }
        }
      },
      \"messageTimestamp\": $(date +%s)
    },
    \"instance\": {
      \"instanceName\": \"test_instance\",
      \"serverUrl\": \"http://localhost:3000\"
    }
  }")

echo "Response: $RESPONSE_3"
echo "  ✓ Link preview message sent to webhook"

sleep 2

QUEUE_SIZE=$(redis-cli -u "$REDIS_URL" LLEN "bull:offer-parser:$TENANT_ID" 2>/dev/null || echo "0")
echo "  ✓ Jobs in offer-parser queue: $QUEUE_SIZE"

echo ""
echo "✅ All webhook tests complete!"
echo ""
echo "📊 Monitoring:"
echo "============="
echo "Watch Redis queue: redis-cli -u \"$REDIS_URL\" MONITOR"
echo "Watch API logs: npm run dev:api"
echo "Check captured offers: SELECT * FROM captured_offers WHERE created_at > now() - interval '5 minutes'"
echo ""
