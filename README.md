# Citizens Reporting Solution

Android/iOS Expo SDK 58 app for publishing and receiving live public incident reports. Reports are immediately public; there is no moderation queue.

## Privacy warning

Every submitted description, photo, reporter display name, selected address, latitude, and longitude is publicly readable. The UI repeats this before submission. Do not submit sensitive personal information.

## Prerequisites and credentials

- Node.js and npm; install dependencies with `npm install`.
- A Supabase project: project URL and publishable/anon key (never a service-role key in the app).
- An Expo account and EAS project ID.
- Android: a Google Maps SDK for Android key restricted to package `com.citizens.reporting` and the build certificate SHA-1; FCM V1 service-account credentials uploaded to EAS for push.
- iOS: an Apple Developer team, bundle ID `com.citizens.reporting`, APNs key/certificate managed through EAS, and signing distribution certificate/provisioning profile. Apple Maps needs no external map key.
- Supabase server secrets: a strong `INCIDENT_WEBHOOK_SECRET`, `RECEIPT_PROCESSOR_SECRET`, and the automatically available `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`. The service-role key must remain server-side.

Copy `.env.example` to `.env` and provide the three `EXPO_PUBLIC_*` values. Put `GOOGLE_MAPS_ANDROID_API_KEY` in local `.env` and in EAS environment variables for both build profiles. Public Expo variables are embedded in the app; they must never hold secrets.

## Supabase setup

1. Link the CLI and apply `supabase/migrations/202611080001_initial_schema.sql` using `supabase db push`, or paste it into the SQL editor once. It creates profiles, incidents, device tokens, delivery/receipt queues, constraints, indexes, triggers, RLS, Realtime publication, and the restricted `incident-images` bucket.
2. In Authentication → URL Configuration, set the site URL to `citizens://` and add `citizens://reset-password` to redirect URLs. Enable email confirmation if desired.
3. Verify Realtime replication includes `public.incidents` (the migration adds it).
4. Deploy functions:

   ```sh
   supabase functions deploy notify-new-incident --no-verify-jwt
   supabase functions deploy process-push-receipts --no-verify-jwt
   supabase secrets set INCIDENT_WEBHOOK_SECRET=... RECEIPT_PROCESSOR_SECRET=...
   ```

5. Create a Database Webhook for `public.incidents` / `INSERT`, targeting the `notify-new-incident` function URL. Add header `x-webhook-secret: <INCIDENT_WEBHOOK_SECRET>`. The function validates the header and payload, re-reads the incident, excludes every reporter device, claims the incident once, sends batches of at most 100, and records tickets.
6. Invoke `process-push-receipts` every 15 minutes using Supabase Cron/pg_cron or an external scheduler. Send `Authorization: Bearer <RECEIPT_PROCESSOR_SECRET>`. It retries missing receipts with bounded backoff and removes `DeviceNotRegistered` tokens.
7. Test RLS with three clients (not the SQL editor/service role): anonymous can select incidents only; account A can insert/update/delete only its rows and its image prefix; account B cannot change A's rows or files. Confirm account A cannot change `user_id`. The migration tests provide static regression coverage but do not replace live-project RLS testing.

Storage allows public JPEG reads, authenticated owner-prefix writes, at most 5 MB per uploaded object, and JPEG MIME type only. The app resizes to 1600 px width and JPEG quality 0.75 before upload. Deterministic `{user}/{incident}/{index}.jpg` keys plus a stable client incident UUID make retries idempotent. Failed submissions preserve the form and safe retry state. Deletion removes files first; if the network fails, retry deletion for reconciliation.

## Development and builds

Push notifications require a physical device/development build; do not validate native integrations in Expo Go.

```sh
npm install
npx eas-cli@latest login
npx eas-cli@latest init                 # place the resulting ID in EXPO_PUBLIC_EAS_PROJECT_ID
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios
npx expo start --dev-client
```

For production:

```sh
npx eas-cli@latest build --profile production --platform android
npx eas-cli@latest build --profile production --platform ios
npx eas-cli@latest submit --profile production --platform android
npx eas-cli@latest submit --profile production --platform ios
```

EAS can generate signing credentials interactively. For Android, configure the Play Console application and upload key, then restrict the Maps key to the production signing SHA-1 as well as the development SHA-1. For iOS, register the bundle identifier and Push Notifications capability in Apple Developer; EAS can create/manage the certificate, profile, and APNs key. Keep `.jks`, `.p8`, `.p12`, provisioning profiles, keys, and `.env` files out of Git.

## App behavior and delivery limits

- Guests browse, filter, paginate, refresh, and receive live INSERT/UPDATE/DELETE cache invalidations.
- Authentication is restored before navigation renders. Email confirmation, password reset, intended-route return, chunked SecureStore persistence, and cache clearing on sign-out are included.
- Location permission is requested only from the report form. If denied/unavailable, users select a map pin manually; reverse-geocode failure never blocks publishing.
- Camera/library and notification permissions are requested only on use and denial offers Settings guidance.
- Android opens `geo:`; iOS opens Apple Maps. Android uses Google Maps; iOS uses Apple Maps by default.
- Notification taps are processed after root navigation is ready whether foregrounded, backgrounded, or cold-started.
- Push is best-effort: OS delivery is not guaranteed. Incident creation never waits for notification delivery. The delivery claim prevents routine webhook retries from duplicating sends, but a process crash after Expo accepts a batch and before completion is recorded can still create an ambiguous outcome.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npx expo-doctor
npx expo config --type public
deno check supabase/functions/notify-new-incident/index.ts
deno check supabase/functions/process-push-receipts/index.ts
```

## Two-account/two-device feature test

Use account A on device A and account B on device B.

### Android checklist

- [ ] Install the Android development APK; confirm Google Maps tiles render.
- [ ] Register A and B, including the email-confirmation-required state; restart and confirm session restoration.
- [ ] Reset a password through `citizens://reset-password`; verify protected-route return after login.
- [ ] As A, create a report in every category; test GPS granted and denied/manual pin, camera and gallery denial/recovery, 1–4 images, offline failure, and retry without a duplicate row.
- [ ] On B, verify the live feed indicator, newest-first order, filter, pull-to-refresh, stable pagination, detail gallery/map, and `geo:` Open in Maps.
- [ ] Verify B receives one foreground/background/terminated notification and its tap opens the correct report; A's devices receive none.
- [ ] Move one device from A to B and verify the token follows B. Sign out and confirm token removal and private Query cache clearing.
- [ ] Delete A's report from My Reports, confirm first, and verify removal from both feeds/details and Storage.
- [ ] Switch system light/dark mode, font scale, and TalkBack; verify contrast, labels, safe areas, keyboard avoidance, and 44-point targets.

### iOS checklist

- [ ] Install an iOS development build on a signed physical device; confirm Apple Maps renders.
- [ ] Repeat registration, confirmation, persistence, reset deep link, and protected-route-return checks.
- [ ] Repeat report creation with Location While In Use granted/denied, manual pin, camera/photos limited/denied, offline retry, and 1–4 images.
- [ ] Repeat live feed, filters, pagination, deletion, unavailable-detail, and two-account ownership tests.
- [ ] Verify APNs/Expo notifications in foreground/background/terminated states; taps deep-link to the incident and exclude A.
- [ ] Verify “Open in Maps” opens Apple Maps at the selected coordinate.
- [ ] Test light/dark mode, Dynamic Type, VoiceOver, safe-area insets, and iOS keyboard avoidance.

Physical Android and iOS verification requires the external projects, credentials, signed builds, and devices listed above; automated checks alone do not establish production readiness.
