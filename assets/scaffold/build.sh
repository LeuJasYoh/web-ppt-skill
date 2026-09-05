#!/usr/bin/env bash
# ===== VuePPT 一键构建（Linux / macOS）=====
set -e
[ -d node_modules ] || npm install
npm run build
go build -ldflags "-s -w" -o presentation .
echo "Build OK: ./presentation"
