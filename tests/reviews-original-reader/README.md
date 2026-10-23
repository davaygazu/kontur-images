# Rounded and readable Yandex originals - separate test

Replace the complete reviews T123 with KONTUR_reviews_rounded_originals.txt. The native Yandex card design and oval original button are unchanged. Only Yandex screenshot viewing changes; the first signed document retains its previous presentation.

The screenshot files are unchanged: no re-encoding, resizing, sharpening or AI processing. Existing originals are 984px/988px wide. Yandex screenshots now use 16px corners, fit viewport width up to 960px, keep natural aspect ratio and scroll vertically instead of shrinking to fit viewport height. Increase button or screenshot click switches to original pixel width with horizontal/vertical scrolling. Fit width restores the starting layout. Browser-native touch scrolling works without third-party libraries.

Files are still fetched only on opening an original. No additional network requests or Yandex widget. Existing text and source images unchanged. If the WebP source already contains compression artefacts, new PNG or lossless originals are needed to recover that detail.

Verified in browser: desktop original 03 renders at 960x950px with 16px corners and vertical scrolling. At 390px iframe, Increase renders the same file at its 988px native width with horizontal overflow; Fit width returns to 358px; Close restores hidden modal state. Review data and sources match the previous oval-card version and all inline JavaScript parses.

Unified label revision: all visible original-view buttons now say ПОСМОТРЕТЬ ОРИГИНАЛ, including paper review 01. No layout or behavior changes.
