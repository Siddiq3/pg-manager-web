# PG Manager local website refresh

Implemented in this workspace on local branch `feature/real-app-video-tour`. No GitHub PR, merge or deployment was made, as requested.

## Reference and scope

Inspected the clean local `main` branch of StitchBook-Web at `/Users/siddiqkolimi/Documents/silaibook/web`, commit `4949ba85efaedf5d4404ac8e5c2b037ecf102c6a`, including `MediaShowcase.jsx`, `DemoStory.jsx`, `LandingPage.jsx` and `landing.css`. The remote main SHA was verified to match. No applicable AGENTS.md files were found. All PG repositories were accessible locally.

The landing page now uses that presentation with PG Manager's violet identity, real locally stored app media, clear white cards and the actual subscription catalog. The main tour shows one phone, with the video on the left and information on the right at all screen widths, including mobile (updated at the user’s request). The account dashboard, billing and authentication styling use the same typography, spacing and controls. Existing API calls, authentication, permissions, account deletion, plan IDs, Cashfree checkout and subscription synchronization remain intact. The existing web-dashboard feature flag is unchanged; web property management is labelled planned in the public copy.

## Expanded feature tour

Mobile cards retain two columns, with the phone constrained to the available space (approximately 96px at 320px and 124px at 390px). Full recordings remain uncropped. Text, selectors and controls use compact spacing to prevent overflow.

The PG management tour now has five independent cards, with three named, selectable clips per card (15 total). Each card keeps one active phone and its own progress, play/pause and navigation. Cards cover property/occupancy, tenants/bed assignments, rent/deposits/notices, staff/salary/daily wages, and expenses/monthly/pending-rent reports. Account/security clips were excluded at the user’s request.

## Real recordings

`public/media/` contains 15 MP4 files and matching WebP posters. Each MP4 is 13 seconds, 720×1600, H.264, silent and fast-start. The combined MP4s are approximately 3.1 MB. These are recordings of the real Android app, not generated screens or hotlinked media.

All clips open with a two-second recording of the actual **Sai Residency PG** property picker. The remaining eleven seconds show a recorded workflow. Editing consists of joining the real opening to each workflow, trimming static ending time or blurry closing scrolls and holding a clean actual frame where Android screenrecord stops emitting changed frames. App content is neither stretched nor cropped. Posters are extracted from the corresponding final MP4.

| Clip | Actual app workflow | Poster time |
| --- | --- | --- |
| rooms.mp4 | Inspect rooms and open room details to see occupied and vacant beds | 10s |
| tenants.mp4 | Find a tenant and view room, bed, rent and deposit details | 5s |
| rent.mp4 | View pending rent, record Arjun's ₹7,500 payment with UPI, and see the updated entry | 5s |
| notice.mp4 | Save Tara's notice and expected move-out dates and see the on-notice status | 3s |
| occupancy.mp4 | Open occupied/vacant bed reports | 10s |
| properties.mp4 | View property details and owner access settings | 9s |
| add-tenant.mp4 | Inspect a prepared fictional tenant form and monthly/daily stay options (not submitted) | 3s |
| bed-move.mp4 | Inspect the vacant-bed picker and return to the tenant (no completed move claimed) | 3s |
| deposit.mp4 | Inspect deposit amount and toggle paid status (no completed refund claimed) | 9s |
| staff.mp4 | Open a cook's record and editable staff details | 5s |
| salary.mp4 | Save an actual dummy ₹12,000 UPI salary payment; view paid/pending totals and history | 10s |
| daily-wages.mp4 | Save 18 days worked at ₹600/day; view ₹10,800 earned and pending | 7s |
| expenses.mp4 | Filter unpaid expenses and view the fictional electricity bill | 10s |
| finance-report.mp4 | Review computed collections, spending, remaining and pending amounts | 3s |
| pending.mp4 | View outstanding rent and navigate to rent management | 3s |

Used six fictional tenants, two fictional staff records, three fictional operating expenses and four rooms with three beds each in an isolated, in-memory DynamoDB Local table through PG Manager's actual backend. No production/customer data was accessed. Maintenance was not implemented in the app, so the supported notice workflow was selected instead.

### Recording runtime adjustment

The available Android emulator ran the installed PG Manager native runtime with the current app JavaScript bundle. A fresh local native build had a PlatformConstants registration failure. The existing installed native APK worked with the current embedded recording bundle. For recording only, a temporary App.js font-loading change pointed the app's seven existing font files at private emulator-local files, avoiding missing Metro asset references in that installed runtime. The source was restored immediately after generating the bundle. **No tracked app or backend source changes remain.** Temporary tools, fixture credentials, raw recordings and APKs stay outside the repository in `/private/tmp/pg-video-tools`; they are not website assets.

## Validation

- Existing app tests: 21 passed.
- Production website build passed; its served output also passed the full landing-page media and responsive browser checks.
- Website plan catalog check passed against backend definitions for all three plans.
- Chromium browser verification passed at 320, 390, 768, 1024 and 1440px, including actual dummy-account dashboard and billing. No page overflow at any tested width.
- Verified all 15 media files, muted inline playback, one active tour phone, automatic end progression and wrap, dots, previous/next, pause/resume, lazy loading, off-screen pausing, keyboard focus, reduced-motion initial pause and manual playback.
- Simulated a failed MP4 request and rejected autoplay: real poster fallback and navigation/play controls remained available.
- No unexpected console errors or uncaught browser exceptions during normal tested flows.
- Screenshots were captured in Chromium and visually reviewed. Checkout integration was preserved; no paid transaction was executed. Tests do not claim verification on physical iOS/Android browsers.

Recording scope: property, tenant-form, deposit and bed-picker clips demonstrate controls and navigation. They do not claim a completed new-tenant submission, co-owner creation, deposit refund or bed reassignment. Salary-period, salary-payment and daily-wage saves were checked against the actual displayed results. No account/security demo clips were added.

Machine-readable results: `validation.json` (including real dummy account) and `validation-production.json` (served production build). Visual artifacts: `screenshots/landing-1440.png`, `screenshots/landing-390.png`, `screenshots/tour-1440.png`, `screenshots/tour-390.png`, dashboard and billing screenshots.

Run `node scripts/check-plan-catalog.cjs` from this repository. Browser checks use `node scripts/verify-demo.cjs` with Playwright available (or set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` to installed tooling). Set `DEMO_WEB_URL` to the running website; optional `DEMO_SESSION_FILE` enables the local dummy-backend dashboard checks. Credentials are never included in this repository. There was no pre-existing website test suite.
