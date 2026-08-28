from pydantic import BaseModel, EmailStr, Field


class CompanyRegisterRequest(BaseModel):
    company_name: str = Field(..., max_length=150)
    dti_reg_no: str = Field(..., max_length=50)
    doe_no: str | None = Field(default=None, max_length=50)
    primary_branch: str | None = Field(default=None, max_length=100)
    address: str = Field(..., max_length=255)
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=255)


class CompanyRegisterResponse(BaseModel):
    company_id: int = Field(..., ge=1)
    company_name: str
    user_id: int = Field(..., ge=1)
    role_id: int = Field(..., ge=1)
    email: EmailStr
    message: str
