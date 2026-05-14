"""Authentication service"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse


class AuthService:
    """Authentication service"""

    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    async def signup(self, user_data: UserCreate) -> TokenResponse:
        """Register a new user"""
        # Check if email exists
        if await self.user_repo.email_exists(user_data.email):
            raise ValueError("Email already registered")

        # Hash password
        hashed_password = hash_password(user_data.password)

        # Create user
        user = await self.user_repo.create(
            {
                "name": user_data.name,
                "email": user_data.email,
                "password_hash": hashed_password,
            }
        )

        # Create token
        access_token = create_access_token({"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user),
        )

    async def login(self, login_data: UserLogin) -> TokenResponse:
        """Login user"""
        # Get user by email
        user = await self.user_repo.get_by_email(login_data.email)
        if not user:
            raise ValueError("Invalid email or password")

        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            raise ValueError("Invalid email or password")

        # Create token
        access_token = create_access_token({"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user),
        )

    async def get_user(self, user_id: int) -> UserResponse:
        """Get user by ID"""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        return UserResponse.model_validate(user)
