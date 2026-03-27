from rapidfuzz import fuzz

def check_if_fake(raw_text, valid_records):
    status = "FAKE / UNVERIFIED"
    matched_student = "Record Not Found"
    matched_uni = "Unverified Institution"
    
    # Threshold: 70% match is usually safe for messy OCR
    threshold = 70 

    for record in valid_records:
        # Use dot-notation — record is a SQLAlchemy ORM object, not a dict
        name = record.student_name.lower().strip()
        uni = record.institution.lower().strip()

        # Check if the words are "close enough" to what Tesseract read
        uni_score = fuzz.partial_ratio(uni, raw_text)
        name_score = fuzz.partial_ratio(name, raw_text)

        if uni_score > threshold and name_score > threshold:
            status = "VERIFIED LEGAL"
            matched_student = record.student_name
            matched_uni = record.institution
            break
            
    return status, matched_student, matched_uni