# Mobile photo compression v2 - test only

Production main stays unchanged. New assets retain 1080x608 dimensions and composition, encoded from desktop originals as WebP quality 58, method 6. Desktop originals and fullscreen zoom stay unchanged. Hero font preload, layout, mobile header timing, and interactions remain unchanged.

Hero: 144840 -> 112746 bytes. Sosnovka cover: 193962 -> 142798 bytes. Combined: 338802 -> 255544 bytes, saving 83258 bytes (24.57%).

Use KONTUR_hero_mobile_v2_test.txt to replace the complete hero T123 on a test copy. Use KONTUR_projects_mobile_v2_test.txt to replace the existing gallery loader on that copy. If using the separate no-Izhora loader, replace ONLY its jsDelivr script URL with the URL from the v2 loader, retaining its filter. Do not install two gallery loaders on one page. No HEAD changes required.

Sosnovka's mobile card and main gallery preview use the new cover; thumbnails and other images keep their previous sources. Fullscreen zoom and desktop originals are preserved. The mobile picture source works when resizing from desktop as well.

Compare quality on a phone without VPN before production. Compare several PageSpeed runs; the report's LCP element is text, so no score or LCP gain is guaranteed. Rollback: restore hero-before.html and the prior pinned gallery loader at commit 59015cf97574725f407af672e47de8357783b2f9.
