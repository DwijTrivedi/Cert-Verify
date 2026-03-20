# import mysql.connector
# import bcrypt
# import pyotp
# import os

# def get_db_connection():
#     return mysql.connector.connect(
#         host=os.getenv("DB_HOST", "localhost"),
#         port=int(os.getenv("DB_PORT", "3306")),
#         user=os.getenv("DB_USER", "root"),
#         password=os.getenv("DB_PASSWORD", "Dwij@2356"),
#         database=os.getenv("DB_NAME", "Local_cert_verify_db")
#     )



# # PASSWORD HELPERS (bcrypt)
# def hash_password(plain: str) -> str:
#     """Hash a plaintext password using bcrypt."""
#     return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

# def verify_password(plain: str, stored: str) -> bool:
#     """
#     Verify a password. Supports both:
#     - bcrypt hashes (new accounts)
#     - plain text (legacy accounts, migration period)
#     """
#     # If stored value looks like a bcrypt hash ($2b$...) use bcrypt
#     if stored.startswith("$2b$") or stored.startswith("$2a$"):
#         return bcrypt.checkpw(plain.encode(), stored.encode())
#     # Fallback: plain text comparison (for existing un-hashed users)
#     return plain == stored

# # CERTIFICATE VERIFICATION
# def get_valid_degrees():
#     """Fetch all legitimate issued certificates from DB."""
#     db = get_db_connection()
#     cursor = db.cursor(dictionary=True)
#     query = """
#         SELECT s.first_name, s.last_name, i.name AS institution 
#         FROM Issued_Certificates ic
#         JOIN Students s ON ic.student_id = s.id
#         JOIN Institutions i ON ic.institution_id = i.id
#     """
#     cursor.execute(query)
#     records = cursor.fetchall()
#     db.close()
#     return records

# def log_verification(certificate_id: str, student_name: str, status: str):
#     """Log a scan result into Verification_Log."""
#     db = get_db_connection()
#     cursor = db.cursor()
#     cursor.execute(
#         "INSERT INTO Verification_Log (certificate_id, student_name, status) VALUES (%s, %s, %s)",
#         (certificate_id, student_name, status)
#     )
#     db.commit()
#     db.close()

# # USER MANAGEMENT
# def get_user(email: str):
#     """Fetch a user by email – returns None if not found."""
#     db = get_db_connection()
#     cursor = db.cursor(dictionary=True)
#     cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
#     user = cursor.fetchone()
#     db.close()
#     return user

# def register_user(name: str, email: str, password: str, role: str):
#     """
#     Register a new user.
#     - Password is bcrypt-hashed before storage.
#     - A TOTP secret is pre-generated (MFA not yet enabled until /confirm-mfa).
#     - Raises ValueError if email already exists.
#     """
#     db = get_db_connection()
#     cursor = db.cursor(dictionary=True)
#     cursor.execute("SELECT id FROM Users WHERE email = %s", (email,))
#     if cursor.fetchone():
#         db.close()
#         raise ValueError("Email already registered")

#     hashed_pw = hash_password(password)
#     mfa_secret = pyotp.random_base32()  # Pre-generate; activated after QR scan

#     cursor.execute(
#         "INSERT INTO Users (name, email, password, role, mfa_secret, mfa_enabled) VALUES (%s, %s, %s, %s, %s, %s)",
#         (name, email, hashed_pw, role, mfa_secret, False)
#     )
#     db.commit()
#     db.close()

# # MFA MANAGEMENT
# def get_mfa_secret(email: str) -> str | None:
#     """Return the stored TOTP secret for a user."""
#     db = get_db_connection()
#     cursor = db.cursor(dictionary=True)
#     cursor.execute("SELECT mfa_secret FROM Users WHERE email = %s", (email,))
#     row = cursor.fetchone()
#     db.close()
#     return row["mfa_secret"] if row else None

# def enable_mfa(email: str):
#     """Mark MFA as active for the given user."""
#     db = get_db_connection()
#     cursor = db.cursor()
#     cursor.execute("UPDATE Users SET mfa_enabled = TRUE WHERE email = %s", (email,))
#     db.commit()
#     db.close()

# def verify_totp(email: str, code: str) -> bool:
#     """Verify a 6-digit TOTP code against the user's stored secret."""
#     secret = get_mfa_secret(email)
#     if not secret:
#         return False
#     totp = pyotp.TOTP(secret)
#     return totp.verify(code, valid_window=1)  # ±30s tolerance

# # LOGIN AUDIT LOGGING
# def log_login(email: str, role: str):
#     """Record a successful login to Login_Log for audit purposes."""
#     db = get_db_connection()
#     cursor = db.cursor()
#     cursor.execute(
#         "INSERT INTO Login_Log (email, role) VALUES (%s, %s)",
#         (email, role)
#     )
#     db.commit()
#     db.close()

import psycopg2
from psycopg2 import extras  # For dictionary-style results
import bcrypt
import pyotp
import os

def get_db_connection():
    """Connects to Supabase (Cloud) or local Postgres."""
    # Use the URI we just put in Render's environment variables
    db_url = os.environ.get("DATABASE_URL")
    
    if db_url:
        # Cloud connection (SSL is required by Supabase)
        return psycopg2.connect(db_url, sslmode='require')
    else:
        # Fallback for your Dell G15 local dev
        return psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "Dwij@2356"),
            database=os.getenv("DB_NAME", "local_cert_verify_db")
        )

# PASSWORD HELPERS (bcrypt) - No changes needed here!
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, stored: str) -> bool:
    if stored.startswith("$2b$") or stored.startswith("$2a$"):
        return bcrypt.checkpw(plain.encode(), stored.encode())
    return plain == stored

# CERTIFICATE VERIFICATION
def get_valid_degrees():
    db = get_db_connection()
    # RealDictCursor replaces "dictionary=True" from MySQL
    cursor = db.cursor(cursor_factory=extras.RealDictCursor)
    query = """
        SELECT s.first_name, s.last_name, i.name AS institution 
        FROM issued_certificates ic
        JOIN students s ON ic.student_id = s.id
        JOIN institutions i ON ic.institution_id = i.id
    """
    cursor.execute(query)
    records = cursor.fetchall()
    db.close()
    return records

# USER MANAGEMENT
def get_user(email: str):
    db = get_db_connection()
    cursor = db.cursor(cursor_factory=extras.RealDictCursor)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    db.close()
    return user

# ... [The logic for register_user, log_verification, etc., remains the same] ...
# Just ensure you use 'cursor_factory=extras.RealDictCursor' whenever 
# you want to use dictionary-style access like user['email'].