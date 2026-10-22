# Mobile photos: separate T123 test

Branch: test/remaining-photos-20261022. Production main and Tilda page are not modified.

Replace the complete contents of the corresponding T123 blocks on a test copy:
- KONTUR_popular_mobile_test.txt - Popular house projects.
- KONTUR_steps_mobile_test.txt - Construction stages.
No HEAD changes are required. Originals are retained for rollback in *-original.html.

Four mobile WebP files, maximum width 1080, quality 76: 393,420 bytes versus 1,125,606 bytes (65.05% reduction). Mobile breakpoint: 900px. Assets pinned to c345a930789c15f59e3eb426186da13ee885505c on GitHub Raw.

Project covers load within 400px of the viewport; modal cover previews reuse mobile files; fullscreen zoom retains original source images. Desktop uses original images. Construction loads its current image near the block; when visible it also prepares the next stage for the existing 4-second autoplay. Other stage photos retain their original files. Controls, text, and CSS are unchanged.

Validation: all inline JavaScript parses; CSS blocks match originals exactly. Browser checks with a 390px iframe confirmed initial placeholders, mobile cover loading, original fullscreen source, first/second stage switching, and desktop original covers at 1448px. Test assets were served locally; GitHub Raw performance must be checked on a phone without VPN after test publication.

Check all three project cards, modal arrows and zoom, stage arrows/swipe/autoplay, and desktop layout. Then compare several mobile PageSpeed runs and real phone loading. This does not guarantee a specific Lighthouse score.
