from pydantic import BaseModel, EmailStr
from typing import Optional, List
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
    is_active: bool
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class UserWithAreas(UserOut):
    accessible_areas: List['RestrictedAreaOut'] = []

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
import datetime

class ResourceCreate(BaseModel):
    name: str
    type: str
    details: Optional[str] = None
    status: Optional[str] = "available"
    location: Optional[str] = None

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('O nome do recurso não pode estar vazio')
        return v.strip()

    @validator('type')
    def type_must_be_valid(cls, v):
        valid_types = ['equipment', 'vehicle', 'security_device', 'other']
        if v not in valid_types:
            raise ValueError(f'Tipo deve ser um dos: {", ".join(valid_types)}')
        return v

    @validator('status')
    def status_must_be_valid(cls, v):
        if v not in ['available', 'in_use', 'maintenance', 'out_of_service']:
            raise ValueError('Status inválido')
        return v

class ResourceOut(ResourceCreate):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    
    class Config:
        from_attributes = True

class RestrictedAreaCreate(BaseModel):
    name: str
    description: Optional[str] = None
    security_level: Optional[str] = "medium"
    location: Optional[str] = None

class RestrictedAreaOut(RestrictedAreaCreate):
    id: int
    authorized_users: List[UserOut] = []
    class Config:
        from_attributes = True

class AccessLogCreate(BaseModel):
    user_id: int
    area_id: int
    access_type: Optional[str] = "entry"
    status: Optional[str] = "granted"

class AccessLogOut(AccessLogCreate):
    id: int
    access_time: datetime.datetime
    user: Optional[UserOut] = None
    area: Optional[RestrictedAreaOut] = None
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_users: int
    total_resources: int
    total_restricted_areas: int
    recent_access_logs: int
    security_incidents: int
    resources_by_type: dict
    access_by_hour: dict

class AreaAccessRequest(BaseModel):
    user_id: int
    area_id: int
    reason: Optional[str] = None
    
    

