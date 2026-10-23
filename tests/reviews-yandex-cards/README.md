# Test: Yandex cards in KONTUR reviews

Replace the complete reviews T123 with KONTUR_reviews_yandex_cards_test.txt on a test page. No HEAD changes or external widget required. Review 01 remains a document. Reviews 02/03 have native HTML cards with source name, actual author name, screenshot date, 5 stars as shown in both source screenshots, and brief topic labels. Initials are neutral placeholders, not invented profile photos.

All quotes and original screenshot sources are unchanged from the corrected review version. Screenshots still load only after clicking the card or its View original label. Full screenshots open in the existing lightbox. No new network dependencies or image requests are added. No live Tilda page is modified.

Test selectors, arrows, original opening, close/Escape and mobile layout. Previous block retained in before.html for rollback.

Validation: all JavaScript parses, review data and original URLs match the corrected prior version. Repeated arrow/swipe enhancement scripts consolidated into one controller. Desktop 02/03 navigation and original opening tested; 390px mobile selector, original opening/close and return to paper review 01 tested. New card is 270x360 on the mobile test. Preview service truncation was isolated with QA-only transport padding; no padding or local paths are present in the deliverable.

Oval button revision: the Yandex card uses the same krev-open pill styling as the paper review, with label ПОСМОТРЕТЬ ОРИГИНАЛ and no diagonal arrow. Review content, navigation and original-opening behavior are unchanged.
