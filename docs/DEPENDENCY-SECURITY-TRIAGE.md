# Dependency security triage

Checked: 21 July 2026
Command: `npm audit --omit=dev`

## Current result

- Critical: 0
- High: 0
- Moderate: 13
- Low: 0

The moderate chain is currently rooted in Expo 56 build/configuration tooling
and `xcode`'s transitive `uuid` dependency. The reported `uuid` advisory affects
buffer-supplied v3/v5/v6 operations; MindSHED participant and event identifiers
use Node or Expo cryptographic v4 UUID generation instead.

During the 21 July release sweep, the `fast-uri` host-confusion advisory briefly
raised the production audit to high. The compatible patched `3.1.4` release is
now enforced at the workspace root, returning the high/critical count to zero.

`npm audit` proposes downgrading core Expo packages to old major versions. That
is not a safe remediation and must not be applied with `npm audit fix --force`.
Track supported Expo 56 patches or the next reviewed SDK upgrade, rerun native
builds and the full security suite, and obtain security-owner acceptance before
pilot release if the advisory chain remains.

This is dependency triage, not a penetration test or complete vulnerability
assessment. CI fails on high/critical production advisories and Dependabot
tracks the lockfile and GitHub Actions. Repository secret scanning/push
protection, SAST, container-registry scanning and a named remediation owner
remain release-operations gates.
