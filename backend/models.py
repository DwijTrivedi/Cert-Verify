from pydantic import BaseModel

# 1. Extracted data inside verification response
class ExtractedData(BaseModel):
    name: str
    institution: str

# 2. Main verification response
class VerificationResponse(BaseModel):
    status: str
    extractedData: ExtractedData
    raw_text_preview: str

# 3. Login request payload
class LoginRequest(BaseModel):
    email: str
    password: str

# 4. Login response — mfa_required=True means password OK but OTP still needed
class LoginResponse(BaseModel):
    success: bool
    message: str
    role: str | None = None
    mfa_required: bool = False  # NEW: signals frontend to show OTP step

# 5. Registration request payload
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "institution" or "company"

# 6. Registration response
class RegisterResponse(BaseModel):
    success: bool
    message: str
    role: str | None = None

# 7. MFA Setup response — returns TOTP URI for QR code generation
class SetupMFAResponse(BaseModel):
    success: bool
    totp_uri: str       # Full otpauth:// URI for QR code
    secret: str         # Raw secret (show as backup code)

# 8. Confirm MFA request — user submits first OTP to activate MFA
class ConfirmMFARequest(BaseModel):
    email: str
    code: str           # 6-digit TOTP code

# 9. MFA Verify request — OTP submitted during login
class VerifyMFARequest(BaseModel):
    email: str
    code: str           # 6-digit TOTP code

# 10. Generic success/fail response for MFA operations
class MFAResponse(BaseModel):
    success: bool
    message: str
    role: str | None = None