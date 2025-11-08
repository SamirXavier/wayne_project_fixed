from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str]
    role: Optional[str] = "employee"

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str]
    role: str
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class ResourceCreate(BaseModel):
    name: str
    type: str
    details: Optional[str] = None

class ResourceOut(ResourceCreate):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    class Config:
        from_attributes = True
