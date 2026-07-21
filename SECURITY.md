# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability or include
participant data, pilot credentials, deletion secrets, access codes, database
URLs or screenshots of private wellbeing content in a report.

Use this repository's **Security → Advisories → Report a vulnerability** route.
That creates a private discussion with the maintainers. If private reporting is
not enabled, contact the verified technical-support address published in the
released MindSHED app and ask for the current security-reporting route without
including exploit details in the first message.

Include the affected version, platform, reproducible steps, impact and the
minimum evidence needed to validate the issue. Use synthetic data only.

## Supported versions

During the pilot, only the latest store-distributed version is supported. The
API can enforce `PILOT_MINIMUM_APP_VERSION` and pause enrolment or uploads while
an update or incident response is underway.

## Disclosure and response

The maintainers will acknowledge a private report, triage it under the approved
incident-response process, preserve participant confidentiality, and coordinate
remediation and disclosure with the controller and research governance owners.
No response-time promise is made here until those owners approve and staff one.
