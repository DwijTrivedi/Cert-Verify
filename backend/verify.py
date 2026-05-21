"""
verify.py — Keyword Sniper Verification
========================================
Two-stage matching strategy to handle OCR noise from AI-generated fonts:

  Stage 1 — Substring Sniper (fast, exact)
    Check whether the student name AND a core institution keyword
    both appear verbatim anywhere inside the OCR text.

  Stage 2 — Fuzzy Fallback (forgiving)
    Slide a window across the OCR text, comparing chunks against the
    student name using difflib.SequenceMatcher.  Fires only when the
    exact substring check fails (e.g. one letter is garbled by Tesseract).

Both stages work on plain lowercase text — no aggressive stripping of
spaces/punctuation, so word boundaries are preserved for the substring check.
"""

import logging
from difflib import SequenceMatcher

# Words that are too generic to act as a meaningful institution keyword.
_STOPWORDS = {
    "university", "institute", "college", "of", "the", "and",
    "for", "in", "at", "a", "an", "school", "faculty",
}


def _core_keyword(institution: str) -> str:
    """
    Extract the single most distinctive word from the institution name.
    Strategy: pick the longest word not in _STOPWORDS.
    Falls back to the first word if everything is a stopword.
    """
    words = institution.lower().split()
    candidates = [w for w in words if w not in _STOPWORDS]
    if candidates:
        return max(candidates, key=len)   # longest = most specific
    return words[0] if words else institution.lower()


def _fuzzy_name_in_text(name: str, ocr_text: str, threshold: float = 0.80) -> bool:
    """
    Slide a window of len(name) characters across ocr_text and return True
    if any window achieves a SequenceMatcher ratio >= threshold.
    The window is slightly wider than the name to absorb insertions/deletions.
    """
    n = len(name)
    if n == 0:
        return False

    # Window size: name length ±30% to handle OCR insertions/deletions
    win = max(n, int(n * 1.3))

    for start in range(0, max(1, len(ocr_text) - win + 1)):
        chunk = ocr_text[start : start + win]
        ratio = SequenceMatcher(None, name, chunk).ratio()
        if ratio >= threshold:
            logging.info(
                f"[verify] Fuzzy hit: '{name}' ~ '{chunk.strip()}' "
                f"ratio={ratio:.2f} @pos={start}"
            )
            return True
    return False


def check_if_fake(raw_text: str, valid_records):
    """
    Main verification entry point.

    raw_text    : full lowercase OCR output from Tesseract (main.py lowercases it)
    valid_records: list of SQLAlchemy ORM objects with .student_name / .institution
    """
    status          = "FAKE / UNVERIFIED"
    matched_student = "Record Not Found"
    matched_uni     = "Unverified Institution"

    ocr_text = raw_text.lower()   # already lowercase from main.py, harmless no-op

    for record in valid_records:
        name    = record.student_name.lower().strip()
        keyword = _core_keyword(record.institution)

        # ── Stage 1: Substring Sniper ──────────────────────────────────────────
        name_found    = name    in ocr_text
        keyword_found = keyword in ocr_text

        logging.info(
            f"[verify] Sniper check | name='{name}' found={name_found} | "
            f"keyword='{keyword}' found={keyword_found}"
        )

        if name_found and keyword_found:
            logging.info(f"[verify] ✅ Stage 1 (Substring) PASSED for '{record.student_name}'")
            status          = "VERIFIED LEGAL"
            matched_student = record.student_name
            matched_uni     = record.institution
            break

        # ── Stage 2: Fuzzy Fallback (name only — keyword is a hard requirement) ─
        if keyword_found and _fuzzy_name_in_text(name, ocr_text, threshold=0.80):
            logging.info(f"[verify] ✅ Stage 2 (Fuzzy) PASSED for '{record.student_name}'")
            status          = "VERIFIED LEGAL"
            matched_student = record.student_name
            matched_uni     = record.institution
            break

        logging.info(f"[verify] ❌ No match for '{record.student_name}' / '{record.institution}'")

    return status, matched_student, matched_uni