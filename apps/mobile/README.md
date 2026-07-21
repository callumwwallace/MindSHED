# MindSHED mobile app

Expo SDK 56 application for the iOS and Android university pilot. Native builds
use SQLCipher for local wellbeing data and the offline research queue, with the
database key and pseudonymous pilot credentials held in Keychain/Keystore.

## Local development

1. Install workspace dependencies from the repository root with `npm install`.
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`. A physical phone
   needs the Mac's LAN address instead of `localhost`.
3. Use `npm run sim` from the root for iOS, or `npm run android --workspace
   mobile` for Android.

SQLCipher, HealthKit and Health Connect require a native development build;
Expo Go is not a valid security or health-permission test
environment. Rebuild the development client after changing native plugins or
permissions. `EXPO_PUBLIC_LOCAL_PILOT_CODE` is an optional local-only helper and
must not be configured in preview or production.

The licensed SWEMWBS flow is available locally by default. Keep
`EXPO_PUBLIC_ENABLE_SWEMWBS_UPLOADS=false` and
`EXPO_PUBLIC_ENABLE_SWEMWBS_FEEDBACK=false` until their separate research,
legal and Warwick digital-review evidence is recorded.

Phone-health context is optional and read-only. The app requests only steps and
sleep, stores at most 21 days of daily summaries in the encrypted local
database, and does not add those summaries or derived observations to pilot
research uploads. Disconnecting removes the cached summaries; clearing local
data removes them as well. This boundary must remain aligned with the privacy
policy, DPIA and Apple/Google store declarations.

## Verification

From the repository root:

```sh
npm run verify
npx --yes expo-doctor@1.20.1 apps/mobile
```

The native generated projects are intentionally ignored and recreated by Expo
prebuild/EAS. Production builds must provide every release value listed in
`.env.example`, including the HTTPS API/policy/support URLs, verified contacts,
written legal-approval flag and organisation-owned EAS project. A production
config fails immediately when any value is absent.

Build profiles are defined in `eas.json`: development client, internal preview,
and auto-incrementing store production.
