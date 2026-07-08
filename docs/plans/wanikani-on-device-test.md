# WaniKani import — on-device test checklist

The automated suite (1105 tests) covers logic; these are the steps only a real WaniKani token on a
**real device** (not an emulator) can prove. Best run with a WaniKani account that has some Master+
(stage 7-9) items, some Apprentice/Guru items, and a few items under 75% accuracy over 4+ answers.

1. **Connect flow.** Settings → WaniKani section (between Account and Privacy) → Connect. On the page,
   "Open the WaniKani key page" should open the system browser at the token page. If it doesn't, the
   selectable fallback URL must be shown and long-press-copyable. Generate a read-only token.
2. **Token entry.** Copy the token, return to the app. The Paste button appears only if the OS grants
   clipboard read. Paste; confirm the field does not autocapitalize/autocorrect. Connect → your WaniKani
   username and level appear. Free-tier accounts show the calm "levels 1 to 3" panel, not an error.
3. **Keychain persistence.** After the confirm screen, force-kill the app, relaunch, return to the page.
   It must NOT ask for the token again (it came back from the OS keychain / EncryptedSharedPreferences).
4. **Real sync under the rate limit.** "Scan my progress" → watch staged progress (validating, subjects,
   assignments, review statistics) with counts. On a large account let it run past a minute; if it goes
   quiet >10s the "WaniKani limits how fast apps can read" caption should appear; it finishes with no 429
   error screen. Optionally kill mid-scan, relaunch, confirm Resume (not restart-from-zero).
5. **Preview == import.** On preview, write down: Marked as known, Join your reviews, due in next 7 days,
   already tracked, unmatched. The unmatched panel is visible without a tap and shows only characters +
   reading + level (no English meanings anywhere). Tricky toggle is ON by default with a candidate count.
   The bold "Importing adds to your progress. It never removes anything." line is present; nothing advances
   without a button press.
6. **Import + report.** "Add N items" → report: Marked as known + Added to reviews should equal N; the
   totals footnote is present. No achievement toast burst fires; navigate away and back and confirm
   achievements still unlocked and XP went up.
7. **Seeded "known" not due.** Review queue: imported Master+/burned items are NOT due today (burned should
   be weeks out); a few Apprentice items may appear over the next 1-5 days. A stage 8-9 word shows as
   known/tracked with a far-future date and zero misses.
8. **Tricky drills.** Progress → Tricky: items you missed on WaniKani show a "From WaniKani" chip (a
   0-misses imported item shows the chip instead of "0 misses"); the one-line explainer stays dismissed
   after tapping its X and reloading. Drill a From-WaniKani item; it behaves like a local drill. No more
   than 20 WK items drilling at once.
9. **Idempotent re-sync.** Settings → Sync now: completes fast (304 path), reports success; a follow-up
   preview shows nothing new to add (total 0); existing review dates unchanged.
10. **Offline edge.** Airplane mode → Sync now: the button is NOT disabled, the attempt runs, and a plain
    "Could not reach WaniKani" message appears (no error codes). Disable airplane mode; next sync succeeds.
11. **Disconnect keeps progress.** Note due-card count + one imported word's state. Disconnect (leave "also
    forget" OFF): section returns to Connect, imported cards + dates all still present, kill/relaunch does
    not resurrect the connection. Reconnect + re-scan → preview reports everything already tracked (re-import
    is a no-op). Optionally disconnect WITH "also forget" checked: cards remain, but the From WaniKani chips
    and linked counts are gone.

## Before shipping (release blocker, not app behavior)

Update the Apple App Privacy labels, the Google Data Safety form, and the privacy policy to disclose the
on-device WaniKani token and progress-data processing. If Pro-gating is ever turned on, gate only
*initiating new syncs* — never access to already-imported progress or Disconnect.

## Known minor follow-ups (non-blocking, from the Phase 4 verify)

- Report "Marked as known"/"Added to reviews" tiles use pre-import preview counts, not the `applyAll`
  summary. Identical in the normal flow (both derive from the shared `classifyApply`); could differ only if
  a background auto-sync lands a stage change between preview and pressing Add. Fix: derive the tiles from
  the actual apply summary.
- `previewApply` doesn't model the frozen-target retarget edge (needs three rare conditions at once:
  applied link + stale content_id after a content reseed + reviewed old card + risen WK stage). Fix: treat
  that row as already-tracked in the preview.
