import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Load compiled handlers from dist after build.
const { handleNextService, handleServiceInfo, handleWarningLight, handleContact } = await import(
  pathToFileURL(path.join(root, "dist/api.js")).href
);

let fail = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    fail++;
    console.error(`FAIL ${name}:`, e.message);
  }
}

check("next-service happy path", () => {
  const r = handleNextService(
    new URLSearchParams({
      last_service_type: "A",
      last_service_date: "2026-03-01",
      last_service_km: "40000",
      current_km: "50000",
    })
  );
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.equal(r.body.nextType, "B");
});

check("next-service missing param", () => {
  const r = handleNextService(new URLSearchParams({ last_service_type: "A" }));
  assert.equal(r.status, 400);
  assert.equal(r.body.ok, false);
});

check("service-info A", () => {
  const r = handleServiceInfo(new URLSearchParams({ service: "A" }));
  assert.equal(r.status, 200);
  assert.match(r.body.title, /Service A/);
});

check("service-info invalid", () => {
  const r = handleServiceInfo(new URLSearchParams({ service: "C" }));
  assert.equal(r.status, 400);
});

check("warning-light list", () => {
  const r = handleWarningLight(new URLSearchParams());
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.covered));
  assert.ok(r.body.covered.length > 0);
});

check("warning-light match", () => {
  const r = handleWarningLight(new URLSearchParams({ light: "flashing check engine" }));
  assert.equal(r.status, 200);
  assert.equal(r.body.found, true);
});

check("warning-light unknown", () => {
  const r = handleWarningLight(new URLSearchParams({ light: "plasma core overload" }));
  assert.equal(r.status, 404);
  assert.equal(r.body.found, false);
});

check("contact", () => {
  const r = handleContact();
  assert.equal(r.status, 200);
  assert.match(r.body.website, /mercedes-benz\.silberarrows\.com/);
});

check("openapi.json is valid JSON OpenAPI 3", () => {
  const require = createRequire(import.meta.url);
  const spec = require("../openapi.json");
  assert.equal(spec.openapi.startsWith("3."), true);
  assert.equal(spec.servers[0].url, "https://silberarrows-mcp.netlify.app");
  assert.equal(spec.info["x-category"], "Transportation");
  assert.equal(spec.info["x-website"], "https://mercedes-benz.silberarrows.com/");
  for (const p of ["/api/next-service", "/api/service-info", "/api/warning-light", "/api/contact"]) {
    assert.ok(spec.paths[p]?.get, `missing GET ${p}`);
  }
});

if (fail) {
  console.error(`${fail} failure(s)`);
  process.exit(1);
}
console.log("ALL API TESTS OK");
