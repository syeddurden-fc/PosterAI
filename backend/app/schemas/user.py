"""User schemas"""
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema"""

    name: str
    email: EmailStr


class UserCreate(UserBase):
    """User creation schema"""

    password: str


class UserLogin(BaseModel):
    """User login schema"""

    email: EmailStr
    password: str


class UserResponse(UserBase):
    """User response schema"""

    id: int

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema"""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
