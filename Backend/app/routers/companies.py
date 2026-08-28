from fastapi import APIRouter, Depends, HTTPException, status
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import AppUser, Company, Role
from app.schemas import CompanyRegisterRequest, CompanyRegisterResponse

router = APIRouter(prefix="/api/v1/companies", tags=["companies"])

# Initialize pwdlib PasswordHash with BcryptHasher
password_hash_context = PasswordHash((BcryptHasher(),))


def get_password_hash(password: str) -> str:
    # Safely truncate byte length to 72 bytes before decoding back to string
    truncated_bytes = password.encode("utf-8")[:72]
    safe_password_str = truncated_bytes.decode("utf-8", errors="ignore")
    return password_hash_context.hash(safe_password_str)


@router.post(
    "/register",
    response_model=CompanyRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_company(
    payload: CompanyRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> CompanyRegisterResponse:
    try:
        async with db.begin():
            existing_company = await db.scalar(
                select(Company).where(
                    or_(
                        Company.company_name == payload.company_name,
                        Company.dti_reg_no == payload.dti_reg_no,
                    )
                )
            )
            if existing_company:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Company name or DTI registration number already exists.",
                )

            existing_user = await db.scalar(
                select(AppUser).where(AppUser.email == payload.email)
            )
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists.",
                )

            admin_role_id = await db.scalar(
                select(Role.role_id).where(Role.role_name == "Admin")
            )
            if admin_role_id is None:
                admin_role = Role(role_name="Admin")
                db.add(admin_role)
                await db.flush()
                admin_role_id = admin_role.role_id

            if admin_role_id is None:
                raise ValueError("Unable to resolve Admin role_id.")

            company = Company(
                company_name=payload.company_name,
                dti_reg_no=payload.dti_reg_no,
                doe_no=payload.doe_no,
                primary_branch=payload.primary_branch,
                address=payload.address,
            )
            db.add(company)
            await db.flush()

            if company.company_id is None:
                raise ValueError("Unable to create company_id for app_user foreign key.")

            admin_user = AppUser(
                company_id=company.company_id,
                role_id=admin_role_id,
                first_name=payload.first_name,
                last_name=payload.last_name,
                email=payload.email,
                password_hash=get_password_hash(payload.password),
            )
            db.add(admin_user)
            await db.flush()

        return CompanyRegisterResponse(
            company_id=company.company_id,
            company_name=company.company_name,
            user_id=admin_user.user_id,
            role_id=admin_role_id,
            email=admin_user.email,
            message="Company and admin user registered successfully.",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e