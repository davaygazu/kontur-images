# Photo-loading notice - separate T123 test

Paste KONTUR_photo_notice_test.txt into one NEW T123 block at the bottom of a test page. No HEAD changes or changes to existing blocks. Remove that block to roll back.

Monitors only img elements sourced from raw.githubusercontent.com/davaygazu/kontur-images/. Includes dynamically added images and lazy src updates. No requests, libraries, or IP lookup. CSS backgrounds are not monitored.

A visible pending photo triggers the notice after 6 seconds; a visible broken photo triggers it immediately. Photos smaller than 40px, offscreen, display:none, visibility:hidden or opacity:0 in ancestor chain are ignored. Browser IntersectionObserver plus source/visibility mutations drive the check; there is no periodic polling. Timers pause in hidden tabs and restart when visible. Once shown, notification does not appear again in that tab session using sessionStorage. Closing removes observers. If storage is unavailable, once per page lifetime applies. Successful completion or leaving the relevant images hides the notice. No VPN presence is inferred.

Bottom offset leaves room for messenger controls; check actual Tilda messenger position on phone. Initial notification is hidden, uses role=status and a labeled close button. Text is not a detection claim.

Validation: node tests/photo-notice/check-notice.cjs covers 6-second timeout, fast load, successful-load dismissal, offscreen and hidden slides, lazy placeholder, load error, close, session suppression, and background tab. Those are deterministic DOM lifecycle tests; confirm appearance and integration on a published test copy before installing on production.
