import re
from difflib import SequenceMatcher

# ── Text sanitisation ──────────────────────────────────────────────────────────
# Strip everything except A-Z and 0-9, then uppercase.
# This eliminates newlines, spaces, punctuation and OCR noise before comparing.
def _sanitise(text: str) -> str:
    return re.sub(r'[^A-Z0-9]', '', text.upper())


def check_if_fake(raw_text: str, valid_records):
    status = "FAKE / UNVERIFIED"
    matched_student = "Record Not Found"
    matched_uni = "Unverified Institution"

    # Sanitise the full OCR dump once (expensive to repeat per record)
    clean_ocr = _sanitise(raw_text)

    # Similarity threshold for difflib SequenceMatcher (0.0 – 1.0)
    # 0.80 = 80 % character-sequence overlap required
    THRESHOLD = 0.80

    for record in valid_records:
        # Sanitise the DB reference strings the same way
        clean_name = _sanitise(record.student_name)
        clean_uni  = _sanitise(record.institution)

        # SequenceMatcher.ratio() returns a value in [0, 1]
        name_score = SequenceMatcher(None, clean_name, clean_ocr).ratio()
        uni_score  = SequenceMatcher(None, clean_uni,  clean_ocr).ratio()

        # Debug: log per-record scores so you can tune THRESHOLD in Render logs
        print(
            f"[verify] DB: '{record.student_name}' / '{record.institution}' → "
            f"name={name_score:.2f}  uni={uni_score:.2f}"
        )

        if name_score >= THRESHOLD and uni_score >= THRESHOLD:
            status = "VERIFIED LEGAL"
            matched_student = record.student_name
            matched_uni     = record.institution
            break

    return status, matched_student, matched_uni