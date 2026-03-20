from rapidfuzz import fuzz

def check_if_fake(raw_text, valid_records):
    status = "FAKE / UNVERIFIED"
    matched_student = "Record Not Found"
    matched_uni = "Unverified Institution"
    
    # Threshold: 70% match is usually safe for messy OCR
    threshold = 70 

    for record in valid_records:
        fname = record['first_name'].lower().strip()
        lname = record['last_name'].lower().strip()
        uni = record['institution'].lower().strip()
        
        # Check if the words are "close enough" to what Tesseract read
        uni_score = fuzz.partial_ratio(uni, raw_text)
        fname_score = fuzz.partial_ratio(fname, raw_text)
        lname_score = fuzz.partial_ratio(lname, raw_text)

        if uni_score > threshold and fname_score > threshold and lname_score > threshold:
            status = "VERIFIED LEGAL"
            matched_student = f"{record['first_name']} {record['last_name']}"
            matched_uni = record['institution']
            break
            
    return status, matched_student, matched_uni