#!/usr/bin/env bash
# Kill all processes running on port 3333
if lsof -t -i:3333 > /dev/null 2>&1; then
    kill $(lsof -t -i:3333)
    echo "Killed processes running on port 3333"
else
    echo "No processes running on port 3333"
fi