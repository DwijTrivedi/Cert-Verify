from pydantic import BaseModel
from typing import Optional

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

# 4. Login response — now returns a JWT token
class LoginResponse(BaseModel):
    success: bool
    message: str
    role: Optional[str] = None
    token: Optional[str] = None   # JWT — stored by frontend in localStorage

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
    role: Optional[str] = None

# 7. Deletion request — institution submits, admin approves
class DeletionRequestBody(BaseModel):
    roll_number: str
    reason: Optional[str] = ""