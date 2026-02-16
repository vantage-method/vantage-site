#!/usr/bin/env bash
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "localhost")
echo "Running on http://localhost:3333"
echo "Network:    http://${LOCAL_IP}:3333"
python3 -m http.server 3333 --bind 0.0.0.0