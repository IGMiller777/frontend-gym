#!/bin/zsh
# Double-click in Finder: opens Terminal, starts web + api, opens the browser.
# Ctrl+C (or closing the window) stops both.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$(realpath "$0")")/.." || exit 1

free() { ! lsof -iTCP:$1 -sTCP:LISTEN -t >/dev/null 2>&1 }
# First free pair of neighbouring ports in 5900-5909.
for p in 5900 5902 5904 5906 5908; do
  if free $p && free $((p + 1)); then export WEB_PORT=$p API_PORT=$((p + 1)); break; fi
done
if [[ -z $WEB_PORT ]]; then
  echo "Ports 5900-5909 are busy:"; lsof -iTCP:5900-5909 -sTCP:LISTEN
  read -k1 "?Press any key..."; exit 1
fi

echo "frontend-gym: http://localhost:$WEB_PORT (api :$API_PORT). Stop: Ctrl+C"
(sleep 4 && open "http://localhost:$WEB_PORT") &
pnpm dev
