# TutorCard Pre-Launch Test Plan

> **111 test cases** across 17 sections, prioritized P0 (launch blocker), P1 (important), P2 (nice to have)

---

## Issues Found During Automated Checks

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | `node_modules` missing — build fails | P0 | Run `npm install` |
| 2 | ESLint broken — missing `@eslint/eslintrc` | P0 | `npm install @eslint/eslintrc` or update config |
| 3 | TypeScript errors — `style` prop on `IconProps` in `BadgeCard.tsx` and `ProfileCard.tsx` | P0 | Remove `style` prop from `<Icon>` calls or add `style` to `IconProps` interface |
| 4 | Zero automated tests (no unit, integration, or E2E) | P1 | See recommendations below |
| 5 | No CI/CD pipeline | P1 | See recommendations below |

---

## Section 1: Environment Setup (P0)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| ENV-01 | Dependencies install | Run `npm install` | Completes without errors |
| ENV-02 | Build succeeds | Run `npm run build` | Production build completes |
| ENV-03 | Lint passes | Run `npm run lint` | No errors |
| ENV-04 | TypeScript compiles | Run `npx tsc --noEmit` | No type errors |
| ENV-05 | Dev server starts | Run `npm run dev`, open localhost:3000 | Homepage loads |
| ENV-06 | Env vars configured | Check `.env.local` has all required vars | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `SUPERADMIN_EMAILS` |
| ENV-07 | Supabase connection | Load any page that queries DB | No connection errors in console |
| ENV-08 | Seed data loads | Run `npm run seed` | 8 mock tutors created successfully |

---

## Section 2: Authentication (P0)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| AUTH-01 | Email signup | Go to `/signup`, enter new email + password | Account created, redirected to `/create` |
| AUTH-02 | Email login | Go to `/login`, enter valid credentials | Logged in, redirected to `/dashboard` |
| AUTH-03 | Google OAuth signup | Click Google button on `/signup` | Google flow completes, redirected to `/create` |
| AUTH-04 | Google OAuth login | Click Google button on `/login` | Logged in, redirected to `/dashboard` |
| AUTH-05 | Invalid credentials | Enter wrong password on `/login` | Error message shown, not logged in |
| AUTH-06 | Protected route — dashboard | Visit `/dashboard` while logged out | Redirected to `/login` |
| AUTH-07 | Protected route — admin | Visit `/admin` while logged out | Redirected to `/login` |
| AUTH-08 | Protected route — create | Visit `/create` while logged out | Redirected to `/login` |
| AUTH-09 | Session persistence | Log in, close tab, reopen `/dashboard` | Still logged in (cookie-based session) |
| AUTH-10 | Logout | Click logout from dashboard | Session cleared, redirected to `/` |
| AUTH-11 | OAuth callback | Complete Google OAuth flow | `/auth/callback` processes correctly, no errors |

---

## Section 3: Card Creation — `/create` (P0)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| CREATE-01 | Step 1 — Basic info | Fill first name, last name, slug | Fields validate, can proceed to step 2 |
| CREATE-02 | Slug uniqueness | Enter an already-taken slug | Error shown: slug unavailable |
| CREATE-03 | Slug format | Enter slug with special chars/spaces | Auto-sanitized to valid URL format |
| CREATE-04 | Avatar color selection | Select a color from the picker | Preview updates with chosen color |
| CREATE-05 | Profile image upload | Upload a valid JPEG under 2MB | Image uploads, preview shown |
| CREATE-06 | Image too large | Upload a file over 2MB | Error: file too large |
| CREATE-07 | Invalid image type | Upload a `.pdf` or `.bmp` file | Error: unsupported format (only JPEG/PNG/WebP/GIF) |
| CREATE-08 | Step 2 — Subjects & exams | Add exams, subjects, locations via TagPicker | Tags added, visible in preview |
| CREATE-09 | Step 3 — Links | Add website, booking, and social links | Links saved with correct types |
| CREATE-10 | Step 4 — Notifications | Toggle email notification preference | Preference saved |
| CREATE-11 | Profanity filter | Enter profane word in name, title, or links | Rejected with error message |
| CREATE-12 | Submit card | Complete all steps and submit | Card created, redirected to `/dashboard` |
| CREATE-13 | Business name (optional) | Enter optional business name | Displays on public card |
| CREATE-14 | Valid invite code | Enter valid invite code during signup | Code validated and claimed |
| CREATE-15 | Invalid invite code | Enter invalid or already-used code | Error shown |
| CREATE-16 | Auto-generate invite codes | Complete card creation | 5 invite codes generated for user in dashboard |

---

## Section 4: Public Profile — `/[slug]` (P0)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| PROFILE-01 | Profile loads | Visit `/valid-slug` | Full profile card displayed |
| PROFILE-02 | Invalid slug — 404 | Visit `/nonexistent-slug` | Custom 404 page shown |
| PROFILE-03 | Bio display | View profile with all fields filled | Name, title, locations, subjects, exams all visible |
| PROFILE-04 | Profile image | View profile with uploaded image | Image displayed correctly (not broken) |
| PROFILE-05 | Avatar fallback | View profile without uploaded image | Colored avatar with initials shown |
| PROFILE-06 | Links display | View profile with multiple link types | All link types render with correct icons |
| PROFILE-07 | Link clicks | Click website, email, phone links | Opens correct URL / mailto: / tel: |
| PROFILE-08 | Reviews tab | Click Reviews tab | Reviews listed with star ratings, score improvements, quotes |
| PROFILE-09 | Vouches tab | Click Vouches tab | Vouch count shown + voucher cards displayed |
| PROFILE-10 | Badges tab | Click Badges tab | Certifications and memberships displayed |
| PROFILE-11 | QR code | Generate/view QR code | QR code encodes correct profile URL |
| PROFILE-12 | Card download | Click download/share button | Card image downloaded via html-to-image |
| PROFILE-13 | Empty state — no reviews | View profile with zero reviews | Appropriate empty state message |
| PROFILE-14 | Empty state — no vouches | View profile with zero vouches | Appropriate empty state message |
| PROFILE-15 | Empty state — no badges | View profile with zero badges | Appropriate empty state message |
| PROFILE-16 | Pinned review | View profile with a pinned review | Pinned review appears first in list |

---

## Section 5: Inquiry System (P0)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| INQ-01 | Open inquiry form | Click "Message" button on profile | InquirySheet modal opens |
| INQ-02 | Submit inquiry | Fill name, email, message, select exam | Inquiry submitted, success confirmation |
| INQ-03 | Required field validation | Submit without required fields | Validation errors shown |
| INQ-04 | Email notification | Submit inquiry | Tutor receives email notification via Resend |
| INQ-05 | Dashboard count | Submit inquiry, check tutor's dashboard | Inquiry count incremented |
| INQ-06 | Optional phone | Submit with and without phone number | Both work correctly |

---

## Section 6: Review System (P0)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| REV-01 | Open review form | Click "Leave Review" on profile | ReviewSheet modal opens |
| REV-02 | Submit review | Fill all fields: name, email, rating, quote | Review submitted, appears on profile |
| REV-03 | Star rating | Click 1–5 stars | Rating selection works visually and saves correctly |
| REV-04 | Score before/after | Enter score before and score after | Score improvement displayed on review card |
| REV-05 | Required field validation | Submit without name/email/rating/quote | Validation errors shown |
| REV-06 | Long review text | Enter very long review text (> 2000 chars) | Prevented or truncated with error |
| REV-07 | Review request page | Visit `/[slug]/review` | Review request flow page loads correctly |
| REV-08 | Review request email | Tutor sends review request from dashboard | Parent receives email with review link |
| REV-09 | Pin review | Tutor pins a review from dashboard | Review shows as pinned on public profile (appears first) |
| REV-10 | Unpin review | Tutor unpins a review | Review returns to chronological position |
| REV-11 | Recommendation flag | Check/uncheck "I recommend this tutor" | Flag saved and displayed on review card |
| REV-12 | Review notification email | Submit review | Tutor receives email notification |

---

## Section 7: Review Reports & Disputes (P1)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| RPT-01 | File report | Tutor clicks "Report" on a review in dashboard | Report submitted, status = `pending` |
| RPT-02 | Reviewer gets email | Report filed | Reviewer receives email with response link |
| RPT-03 | Respond with valid token | Reviewer clicks link, submits response | Response saved, status = `responded` |
| RPT-04 | Invalid/expired token | Use bogus response token URL | Error message shown |
| RPT-05 | 7-day auto-revoke | Report filed, 7 days pass with no response | Review auto-revoked on next page load |
| RPT-06 | Admin resolves | Admin marks dispute as revoked or denied | Status updated, both parties emailed |
| RPT-07 | Revoked review hidden | Review is revoked | Not visible on public profile |
| RPT-08 | Report status in dashboard | File report, check dashboard | Report status badge shown next to review |

---

## Section 8: Vouch System (P1)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| VOUCH-01 | Vouch for tutor | Logged-in tutor clicks Vouch on another profile | Vouch recorded, count incremented |
| VOUCH-02 | Toggle unvouch | Click Vouch again on same profile | Vouch removed, count decremented |
| VOUCH-03 | Self-vouch prevention | Try to vouch for your own profile | Prevented with error message |
| VOUCH-04 | Must have card first | User without a card tries to vouch | Error: must create card first |
| VOUCH-05 | Direct vouch flow | Visit `/vouch/[slug]` | Vouch flow page loads, can complete vouch |
| VOUCH-06 | Vouch notification | Vouch for a tutor | Tutor receives email notification |
| VOUCH-07 | Voucher display | View vouches tab on profile | Voucher's name, title, avatar, and link shown |
| VOUCH-08 | Vouch while logged out | Click Vouch while not authenticated | Prompted to log in first |

---

## Section 9: Dashboard — `/dashboard` (P0)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| DASH-01 | Dashboard loads | Navigate to `/dashboard` while logged in | All sections render without errors |
| DASH-02 | Reviews section | View reviews in dashboard | All reviews listed with details + report status |
| DASH-03 | Vouch count | Check vouch section | Correct count + recent voucher avatars |
| DASH-04 | Inquiries section | Check inquiries section | Correct count displayed |
| DASH-05 | Invite codes section | View invite codes | 5 codes shown with claim status |
| DASH-06 | Copy invite code | Click copy button on an invite code | Code copied to clipboard |
| DASH-07 | Claimed code status | View a claimed invite code | Shows who claimed it (name + slug) |
| DASH-08 | Edit profile link | Click "Edit" button | Navigates to `/dashboard/edit` |
| DASH-09 | View public card | Click "View my card" link | Opens `/[your-slug]` |

---

## Section 10: Profile Editing — `/dashboard/edit` (P1)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| EDIT-01 | Pre-populated fields | Open edit page | All current profile data pre-filled |
| EDIT-02 | Update name | Change first/last name, save | Name updated on public profile |
| EDIT-03 | Update subjects/exams | Add/remove subjects or exams | Changes reflected on profile |
| EDIT-04 | Update links | Add, edit, or remove links | Changes saved correctly |
| EDIT-05 | Change profile image | Upload a new image | Old image replaced with new one |
| EDIT-06 | Change avatar color | Select new color | Color updated on profile |
| EDIT-07 | Profanity filter | Enter profane content in any field | Rejected with error |
| EDIT-08 | Slug is read-only | Check if slug can be changed | Slug field is read-only or not shown |

---

## Section 11: Admin Dashboard — `/admin` (P1)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| ADMIN-01 | Admin access | Super admin (email in `SUPERADMIN_EMAILS`) visits `/admin` | Dashboard loads with all stats |
| ADMIN-02 | Non-admin blocked | Regular user visits `/admin` | Access denied or redirected |
| ADMIN-03 | Stats accuracy | View aggregate stats | Signup, review, vouch, inquiry counts are correct |
| ADMIN-04 | Tutor directory | Browse tutor list | All tutors listed with search |
| ADMIN-05 | Filter by location | Apply location filter | Results filtered correctly |
| ADMIN-06 | Filter by exam | Apply exam filter | Results filtered correctly |
| ADMIN-07 | Delete user | Delete a test user account | User removed from `auth.users` + `tutors` table |
| ADMIN-08 | Suspend user | Suspend a user account | User cannot log in afterward |
| ADMIN-09 | Reset password | Trigger password reset for a user | Password reset email sent |
| ADMIN-10 | Change email | Update a user's email | Email updated in Supabase auth |
| ADMIN-11 | Review reports list | View pending review reports | Reports listed with details and deadlines |
| ADMIN-12 | Resolve report | Resolve a dispute (revoke or deny) | Status updated, notification emails sent |
| ADMIN-13 | Funnel metrics | Check funnel metrics section | Signup → card → engagement data displayed |

---

## Section 12: Email Notifications (P1)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| EMAIL-01 | Welcome email | Create a new tutor card | Welcome email received from `hello@tutorcard.co` |
| EMAIL-02 | New review notification | Submit review on a profile | Tutor receives review notification email |
| EMAIL-03 | Vouch notification | Vouch for a tutor | Tutor receives vouch notification email |
| EMAIL-04 | Inquiry notification | Submit inquiry on a profile | Tutor receives inquiry notification email |
| EMAIL-05 | Review flagged email | Report a review | Reviewer gets flagged notification with response link |
| EMAIL-06 | Report resolved email | Admin resolves a report | Both tutor and reviewer notified |
| EMAIL-07 | Invite claimed email | Someone uses your invite code | You receive "invite claimed" notification |
| EMAIL-08 | Review request email | Send review request from dashboard | Recipient gets email with direct review link |
| EMAIL-09 | Graceful email failure | Simulate Resend API failure (invalid key) | App doesn't crash; primary action still completes |

---

## Section 13: Static & Legal Pages (P2)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| STATIC-01 | Homepage | Visit `/` | Hero section, features, pricing ($20/yr), CTA all render |
| STATIC-02 | Terms of Service | Visit `/terms` | Full terms content displayed |
| STATIC-03 | Privacy Policy | Visit `/privacy` | Full privacy content displayed |
| STATIC-04 | For Associations | Visit `/for-associations` | Info page renders correctly |
| STATIC-05 | 404 page | Visit `/random-nonexistent-path` | Custom 404 page with navigation |
| STATIC-06 | Homepage CTA | Click "Get Started" button | Navigates to `/signup` |
| STATIC-07 | Nav links | Click all navigation links | All navigate to correct pages |
| STATIC-08 | Footer links | Click all footer links | All work correctly |

---

## Section 14: Mobile Responsiveness (P1)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| MOB-01 | Homepage | View `/` at 375px width | Layout adapts, no horizontal scroll |
| MOB-02 | Public profile | View `/[slug]` on mobile | Card, tabs, and action buttons all usable |
| MOB-03 | Card creation form | Complete all 4 steps on mobile | All steps work with touch input |
| MOB-04 | Dashboard | View `/dashboard` on mobile | All sections readable, no overflow |
| MOB-05 | Modals (inquiry/review) | Open InquirySheet and ReviewSheet on mobile | Modals fill screen properly, scrollable |
| MOB-06 | TagPicker | Use tag picker on mobile | Touch interactions work correctly |
| MOB-07 | Admin dashboard | View `/admin` on mobile | Tables scroll horizontally if needed |

---

## Section 15: Security & Edge Cases (P0)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| SEC-01 | RLS enforcement | Use Supabase client to update another user's tutor record | Rejected by row-level security |
| SEC-02 | API without auth | Call `POST /api/tutors` without auth cookie | Returns 401 Unauthorized |
| SEC-03 | Upload validation bypass | POST to `/api/upload` with oversized or wrong-type file directly | Returns error, file not stored |
| SEC-04 | XSS in reviews | Submit review with `<script>alert(1)</script>` as quote | Script not executed on profile page |
| SEC-05 | XSS in profile fields | Enter `<img onerror=alert(1)>` in name/title | Content escaped on render |
| SEC-06 | SQL injection | Enter `'; DROP TABLE tutors; --` in form fields | No effect (Supabase uses parameterized queries) |
| SEC-07 | CSRF | Submit API request from different origin without auth | Rejected |
| SEC-08 | Rate limiting | Submit 50 reviews in 1 minute to same profile | Handled gracefully (or document as missing) |
| SEC-09 | Admin API without admin | Call `DELETE /api/admin/users` as regular user | Returns 403 Forbidden |
| SEC-10 | Duplicate card | Try creating a second card for same `user_id` | Prevented by unique constraint |
| SEC-11 | Invite code reuse | Attempt to claim an already-claimed invite code | Returns error: code already used |

---

## Section 16: Performance (P2)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| PERF-01 | Profile page load | Load a profile with reviews + vouches + badges | Page interactive in < 3 seconds |
| PERF-02 | Dashboard load | Load dashboard with real data | Page interactive in < 3 seconds |
| PERF-03 | Image upload speed | Upload a 2MB image | Completes in < 5 seconds |
| PERF-04 | Homepage Lighthouse | Run Lighthouse on `/` | LCP < 2.5s, CLS < 0.1 |
| PERF-05 | Build bundle size | Check `npm run build` output | No route bundles > 200KB |

---

## Section 17: API Endpoint Verification (P1)

| ID | Endpoint | Method | Expected |
|----|----------|--------|----------|
| API-01 | `/api/tutors` | POST | 200 — tutor created |
| API-02 | `/api/tutors` | PUT | 200 — tutor updated |
| API-03 | `/api/tutors/check-slug?slug=available` | GET | `{ available: true }` |
| API-04 | `/api/tutors/check-slug?slug=taken` | GET | `{ available: false }` |
| API-05 | `/api/reviews` | POST | 200 — review created |
| API-06 | `/api/reviews/pin` | PUT | 200 — review pinned |
| API-07 | `/api/vouches` | POST | 200 — vouch toggled |
| API-08 | `/api/inquiries` | POST | 200 — inquiry created |
| API-09 | `/api/upload` | POST | 200 — image URL returned |
| API-10 | `/api/invite-codes/validate` | POST (valid code) | `{ valid: true }` |
| API-11 | `/api/invite-codes/validate` | POST (invalid code) | `{ valid: false }` |
| API-12 | `/api/health/invite-codes` | GET | 200 |
| API-13 | `/api/review-request` | POST | 200 — email sent |
| API-14 | `/api/review-reports` | POST | 200 — report created |
| API-15 | `/api/review-reports/respond` | POST | 200 — response saved |

---

## Recommended Testing Order

### Phase 1: Fix Blockers (do first)
1. `npm install`
2. Fix ESLint config (`@eslint/eslintrc`)
3. Fix TypeScript errors in `BadgeCard.tsx` and `ProfileCard.tsx`
4. Verify `npm run build` passes

### Phase 2: Smoke Test (P0 items)
Run through all P0 sections in order:
1. ENV → AUTH → CREATE → PROFILE → INQ → REV → DASH → SEC

### Phase 3: Feature Test (P1 items)
Run through P1 sections:
1. RPT → VOUCH → EDIT → ADMIN → EMAIL → MOB → API

### Phase 4: Polish (P2 items)
1. STATIC → PERF

---

## Recommendations: Improving the Pre-Launch Process

### 1. Pre-Launch Checklist Script
Create `scripts/prelaunch-check.sh`:
```bash
#!/bin/bash
set -e
echo "=== Installing dependencies ==="
npm install
echo "=== Running lint ==="
npm run lint
echo "=== Running type check ==="
npx tsc --noEmit
echo "=== Running build ==="
npm run build
echo "=== All checks passed ==="
```
One command to verify the codebase is deployable.

### 2. CI/CD via GitHub Actions
Add `.github/workflows/ci.yml` that runs on every PR:
- `npm install` → `npm run lint` → `npx tsc --noEmit` → `npm run build`
- Blocks merge if any step fails
- Catches regressions before they reach production

### 3. Critical Path E2E Tests (Playwright)
Start with 5–10 Playwright tests covering the highest-value user journeys:
- **Happy path**: Signup → create card → view public profile
- **Review flow**: Visit profile → submit review → review appears
- **Inquiry flow**: Visit profile → submit inquiry → success shown
- **Auth flow**: Login → dashboard loads → edit profile
- **Vouch flow**: Login as tutor → vouch for another tutor
These catch 80% of regressions with minimal maintenance.

### 4. Unit Tests for Business Logic (Vitest)
Pure functions that are easy to test and high-value:
- `lib/profanityFilter.ts` — test detection accuracy
- `lib/inviteCodes.ts` — test code generation format and validation
- `lib/auto-revoke.ts` — test expiry logic
- `lib/cardDraft.ts` — test draft save/restore

### 5. Staging Environment
- Configure Vercel to auto-deploy `staging` branch to `staging.tutorcard.co`
- Use a separate Supabase project for staging with seed data
- Run the full manual test plan on staging before promoting to production
- Never test destructive admin operations on production

### 6. Database Migration Safety
- Review all 13 migration files in `supabase/migrations/` for idempotency
- Test migrations against a fresh Supabase project
- Document rollback procedures for each migration
- Use `supabase db reset` in staging to verify clean-slate migrations work

### 7. Post-Launch Monitoring
- **Error tracking**: Add Sentry (`@sentry/nextjs`) for real-time error alerts
- **Database monitoring**: Watch Supabase dashboard for slow queries and RLS violations
- **Email delivery**: Monitor Resend dashboard for bounces and failures
- **Uptime**: Set up a free uptime monitor (e.g., UptimeRobot) for the production URL
- **Analytics**: Add basic page-view tracking to understand user flow

### 8. Feature Flags for Risky Launches
For future features, consider a simple feature flag system (even a DB table or env var) so you can:
- Ship code to production behind a flag
- Enable for a small percentage of users
- Roll back instantly without a deploy
