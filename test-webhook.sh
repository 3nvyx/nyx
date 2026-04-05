#!/bin/bash

# Updated Verification script using the production NyX Dashboard URL
API_URL="https://nyx-weld.vercel.app/api/webhook"

echo "🚀 Sending official NyX protocol events to $API_URL..."

# 1. A thought
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "event": "thought",
    "data": {
      "text": "Starting a full spectral analysis of the host...",
      "timestamp": "12:34:56"
    }
  }'

sleep 1

# 2. A console line
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "event": "console",
    "data": {
      "text": "$ dirbust target.com",
      "type": "cmd"
    }
  }'

sleep 1

# 3. An impact update
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "event": "impact",
    "data": {
      "progress": 35
    }
  }'

echo -e "\n✅ Events sent. Check your dashboard at https://nyx-weld.vercel.app!"
