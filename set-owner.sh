#!/usr/bin/env sh
# Replace the placeholder GitHub owner ("silberarrows") in package.json, server.json and README.md.
# Usage: ./set-owner.sh <github-username>
set -e
[ -n "$1" ] || { echo "Usage: $0 <github-username>"; exit 1; }
for f in package.json server.json README.md; do
  sed -i.bak -e "s#github.com/silberarrows/#github.com/$1/#g" -e "s#io.github.silberarrows/#io.github.$1/#g" "$f" && rm -f "$f.bak"
done
echo "GitHub owner set to $1"
