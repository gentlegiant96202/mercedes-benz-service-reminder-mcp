#!/usr/bin/env bash
# Smoke-check REST endpoints (default: production Netlify).
set -euo pipefail
BASE="${1:-https://silberarrows-mcp.netlify.app}"

echo "Checking REST against $BASE"

curl -fsS "$BASE/api/contact" | grep -q 'SilberArrows'
curl -fsS "$BASE/api/service-info?service=A" | grep -q 'Service A'
curl -fsS "$BASE/api/warning-light" | grep -q 'covered'
curl -fsS "$BASE/api/warning-light?light=battery" | grep -q 'found'
curl -fsS "$BASE/api/next-service?last_service_type=A&last_service_date=2026-03-01&last_service_km=40000&current_km=50000" | grep -q 'nextType'

# CORS preflight
curl -fsS -o /dev/null -D - -X OPTIONS "$BASE/api/contact" \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: GET" | grep -qi 'access-control-allow-origin'

# MCP endpoint still present (method not allowed on GET is expected)
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/mcp")
test "$code" = "405"

echo "ALL CURL CHECKS OK"
