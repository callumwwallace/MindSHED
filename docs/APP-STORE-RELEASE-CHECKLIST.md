# MindSHED app-store release checklist

Updated: 21 July 2026
Current outcome: **not ready to submit**; engineering safeguards are in place,
but the external and store-owned gates below are open.

## Repository-complete controls

- [x] Stable iOS bundle ID and Android package: `com.mindshed.app`.
- [x] Production EAS profile uses automatic build-number increments.
- [x] Production config rejects missing HTTPS API/policy/support URLs, contacts,
  legal approval, EAS owner and project ID.
- [x] Production Android rejects cleartext traffic and disables app backup/full
  backup for private local data.
- [x] Production Android removes legacy external-storage and overlay permissions;
  only internet, reminder vibration and the two declared health reads remain.
- [x] iOS declares standard/non-exempt encryption use and contains HealthKit
  purpose strings; final export-compliance owner must still confirm the answer.
- [x] Native local data and research queue use SQLCipher with a device-bound key.
- [x] Pilot credentials and offline governance instructions use SecureStore.
- [x] Web is not a pilot client and mounts no private/pilot services.
- [x] Local notifications need no remote token and notification routes are
  allowlisted.
- [x] Health access is optional/read-only and cannot enter the research API.
- [x] Production JavaScript bundles for iOS/Android pass and CI repeats them.
- [x] Opaque 1024×1024 iOS icon and Android adaptive/monochrome/splash assets
  are deterministically derived from the existing Bramble SVG; no generated AI
  artwork is used.
- [x] API migrations, lifecycle tests, container build and high/critical audit
  gate are represented in CI.
- [x] Private vulnerability reporting guidance exists in `SECURITY.md`.

## Required production build values

Configure these in the EAS **production** environment. `EXPO_PUBLIC_*` values
are embedded and must never contain secrets.

- [ ] `EXPO_PUBLIC_API_URL` — approved non-local HTTPS API origin.
- [ ] `EXPO_PUBLIC_LEGAL_DOCUMENTS_APPROVED=true` — only after written approval
  of the exact versions embedded by the release commit.
- [ ] `EXPO_PUBLIC_PRIVACY_POLICY_URL` — public, stable HTTPS policy.
- [ ] `EXPO_PUBLIC_SUPPORT_URL` — public, stable HTTPS support route.
- [ ] `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_PRIVACY_EMAIL`,
  `EXPO_PUBLIC_RESEARCH_EMAIL` — monitored and verified.
- [ ] `EXPO_PUBLIC_DATA_CONTROLLER_NAME`,
  `EXPO_PUBLIC_DATA_CONTROLLER_ADDRESS`, `EXPO_PUBLIC_ICO_REGISTRATION`.
- [ ] `EAS_PROJECT_ID` and `EAS_OWNER` — organisation-owned.
- [ ] SWEMWBS and marketing flags set only to the independently approved state.
- [ ] Confirm `EXPO_PUBLIC_LOCAL_PILOT_CODE` is absent.

## Apple App Store Connect

- [ ] Organisation account, agreements, tax/banking where applicable, admin
  recovery and signing access are owned by the organisation.
- [ ] App record, primary category, age rating and non-clinical wellbeing
  description are approved.
- [ ] Privacy policy URL and support URL exactly match the build.
- [ ] App Privacy answers cover structured wellbeing data, pseudonymous ID,
  consent records and transient infrastructure metadata; journal/support-plan
  data is on-device and is not declared as collected by the service.
- [ ] HealthKit capability and health-data purpose are accurately declared;
  confirm health data is neither used for advertising nor uploaded.
- [ ] Encryption/export-compliance response is reviewed for SQLCipher, TLS and
  standard OS cryptography.
- [ ] Required-reason/privacy manifest output from the archived build is
  inspected; every included third-party SDK declaration is accepted.
- [ ] Legal owner reviews the production dependency inventory and supplies any
  required open-source attribution/notices; the removed Expo template license
  is not presented as the MindSHED application's licence.
- [ ] Visual owner approves the 1024×1024 icon; screenshots for required device
  sizes, subtitle, keywords, promotional text and review notes are final.
- [ ] Reviewer receives a valid non-personal pilot code and clear steps; never
  provide production database or participant credentials.
- [ ] TestFlight internal/external review and physical test matrix pass.

## Google Play Console

- [ ] Organisation developer account, app-signing ownership, recovery and
  closed-track access are approved.
- [ ] Data Safety answers match the same collection boundary as the privacy
  policy and Apple declaration.
- [ ] Health Apps declaration accurately states read-only local steps/sleep and
  the permitted wellbeing purpose.
- [ ] Target API, content rating, audience, ads, account/deletion and app-access
  declarations are complete. Explain the no-account participant-key model.
- [ ] Visual owner approves the adaptive/monochrome icons; feature graphic,
  phone screenshots, short/full descriptions and support details are supplied.
- [ ] Pre-launch report and Play closed testing pass on supported Android
  versions, including Health Connect availability/update states.

## Cross-functional release evidence

- [ ] Final privacy/terms/consent versions, controller roles, processors,
  hosting region, retention and withdrawal/anonymisation cut-off are signed.
- [ ] Ethics, DPIA, data-management plan and protocol/data dictionary approved.
- [ ] Safeguarding, crisis copy, intended purpose and MHRA qualification review
  recorded.
- [ ] Independent penetration test and accessibility audit completed; no open
  high/critical findings.
- [ ] Production backup restore, deletion/backup-expiry, outage, minimum-version,
  enrolment-pause, upload-pause, incident and rollback drills pass.
- [ ] Named support, privacy, research, security, infrastructure and go/no-go
  owners have accepted the release.
- [ ] Visual owner signs off the deterministic Bramble-derived icon and splash.
  AI image generation was stopped at the owner's request and was not used.

## Candidate commands

```sh
npm ci
npm run verify
npx --yes expo-doctor@1.20.1 apps/mobile
npm audit --omit=dev --audit-level=high
docker build -f apps/api/Dockerfile -t mindshed-api:release .
cd apps/mobile
EAS_BUILD_PROFILE=production npx expo config --type introspect
eas build --profile production --platform ios
eas build --profile production --platform android
```

Do not set the approval switches merely to make these commands pass. The
production config failure is a release control, not a setup inconvenience.
