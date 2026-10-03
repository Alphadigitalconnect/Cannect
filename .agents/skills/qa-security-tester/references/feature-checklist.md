# CAnnect Feature Test Checklist

Use with `browser_subagent` against `http://localhost:3000`. For each item:
expected result → actual result → PASS/FAIL. Capture a screenshot on failure.
Check the browser console for errors on every page.

Viewports: **mobile 375×812** and **desktop 1440×900**.

## 0. Smoke set (run on every change)
- [ ] Home `/` loads, hero + search widget render, no console errors.
- [ ] Navbar links work (About, Events, Knowledge, Go Digital, Login).
- [ ] Footer renders on public pages and is **hidden** on `/dashboard`.
- [ ] Login with QA account → lands on `/dashboard`.
- [ ] Dashboard: every tab opens without errors.
- [ ] Logout clears session → `/dashboard` redirects to `/auth/login`.
- [ ] Unknown URL shows the 404 page.

## 1. Auth
- [ ] Register: required-field validation, invalid email, weak password, duplicate email error.
- [ ] Register-type page routes to the correct form.
- [ ] Login: wrong password shows a generic error (no "user not found" leakage).
- [ ] Forgot password → success message, no account enumeration.
- [ ] Reset password with invalid/expired token is rejected.
- [ ] Pending account sees the "Account Pending Verification" screen.

## 2. Dashboard: navigation
- [ ] **Mobile:** fixed bottom nav shows Directory, My Network, Chats, Share Expertise.
- [ ] Bottom nav stays fixed while content scrolls; last content isn't hidden behind it.
- [ ] Active tab is highlighted; badges show pending requests / unread chats.
- [ ] Tapping the avatar in the mobile top bar opens My Profile.
- [ ] Notifications bell opens and closes the modal; modal sits above the bottom nav.
- [ ] **Desktop:** left sidebar is visible, bottom nav is hidden.
- [ ] `?tab=chat`, `?tab=connections` deep links open the right tab.

## 3. Directory
- [ ] List loads; search by name, city, area and specialisation filters work.
- [ ] Empty search shows an empty state, not a crash.
- [ ] Connect button sends a request → state changes to Pending.
- [ ] View profile opens the modal with correct details and posts.
- [ ] Private profiles hide contact details from non-connections.

## 4. My Network
- [ ] Incoming request: Accept → appears in connections; Ignore → removed.
- [ ] Search/filter connections.
- [ ] Remove connection asks for confirmation, then updates the list.

## 5. Chats
- [ ] Select a peer → message history loads; send text → appears instantly and persists after reload.
- [ ] Image attachment > 2MB is rejected; a valid image sends.
- [ ] Create group with members → group chat works.
- [ ] Unread badge clears after opening the conversation.
- [ ] Mobile: chat input is reachable above the bottom nav.
- [ ] XSS: send `<img src=x onerror=alert(1)>` → rendered as text, no alert.

## 6. Share Expertise
- [ ] Create post with title, content, tags and image (> 5MB rejected) → appears in the feed.
- [ ] My posts → delete asks for confirmation and removes the post.
- [ ] XSS: a post containing `<script>` / `javascript:` links renders inertly.

## 7. Profile
- [ ] Edit and save all fields → success message; values persist after reload.
- [ ] Avatar upload > 2MB is rejected.
- [ ] Social URLs: `javascript:alert(1)` must be rejected or neutralised.
- [ ] Experience add/remove rows.

## 8. Admin (admin account only)
- [ ] Non-admin cannot see the Admin tab or open `/admin` / `/admin-approvals`.
- [ ] Approve/reject a pending test user.

## 9. Public content
- [ ] `/events`, `/knowledge`, `/knowledge/[slug]`, `/go-digital`, `/about`, `/app-teaser` render with no console errors.
- [ ] Images have alt text; one `<h1>` per page; title and meta description set.
