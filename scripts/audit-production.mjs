import { spawnSync } from "node:child_process";

// These advisories affect Metro's build-time image inspection, not the API
// container or the installed mobile runtime. Expo SDK 56 currently has no
// compatible patched image-size release. Keep this exception narrow and
// time-limited so a new high/critical advisory still fails CI immediately.
const temporaryExceptions = new Map([
  [1138808, {
    package: "image-size",
    expiresOn: "2026-09-30",
    url: "https://github.com/advisories/GHSA-w3rx-r6r6-pgpr",
  }],
  [1138809, {
    package: "image-size",
    expiresOn: "2026-09-30",
    url: "https://github.com/advisories/GHSA-5p2g-fcmc-qvqq",
  }],
]);

const audit = spawnSync(
  "npm",
  ["audit", "--omit=dev", "--audit-level=high", "--json"],
  { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
);

if (audit.error || !audit.stdout.trim()) {
  process.stderr.write(audit.stderr || audit.error?.message || "npm audit produced no report\n");
  process.exit(1);
}

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  process.stderr.write("npm audit returned invalid JSON\n");
  process.stderr.write(audit.stdout);
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities ?? {};
const highOrCritical = new Set(["high", "critical"]);

function advisorySources(name, visited = new Set()) {
  if (visited.has(name)) return new Set();
  const nextVisited = new Set(visited).add(name);
  const sources = new Set();
  for (const via of vulnerabilities[name]?.via ?? []) {
    if (typeof via === "string") {
      for (const source of advisorySources(via, nextVisited)) sources.add(source);
    } else if (highOrCritical.has(via.severity)) {
      sources.add(via.source);
    }
  }
  return sources;
}

const unexpected = [];
const acceptedSources = new Set();
for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
  if (!highOrCritical.has(vulnerability.severity)) continue;
  const sources = advisorySources(name);
  if (sources.size === 0) {
    unexpected.push(`${name}: high/critical finding has no traceable root advisory`);
    continue;
  }
  for (const source of sources) {
    const exception = temporaryExceptions.get(source);
    if (!exception || exception.package !== "image-size") {
      unexpected.push(`${name}: unexpected advisory ${source}`);
      continue;
    }
    const expiresAt = Date.parse(`${exception.expiresOn}T23:59:59Z`);
    if (Date.now() > expiresAt) {
      unexpected.push(`${name}: temporary exception ${source} expired on ${exception.expiresOn}`);
      continue;
    }
    acceptedSources.add(source);
  }
}

if (unexpected.length > 0) {
  process.stderr.write("Production dependency audit failed:\n");
  for (const message of [...new Set(unexpected)]) process.stderr.write(`- ${message}\n`);
  process.exit(1);
}

for (const source of acceptedSources) {
  const exception = temporaryExceptions.get(source);
  process.stdout.write(
    `Temporary build-tool exception ${source} (${exception.url}); review by ${exception.expiresOn}.\n`,
  );
}

const counts = report.metadata?.vulnerabilities ?? {};
process.stdout.write(
  `Audit complete: ${counts.critical ?? 0} critical, ${counts.high ?? 0} high; no unapproved high/critical advisories.\n`,
);
