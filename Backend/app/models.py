from __future__ import annotations

from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, Identity, Integer, String, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Company(Base):
    __tablename__ = "company"

    company_id: Mapped[int] = mapped_column(
        Integer,
        Identity(always=True),
        primary_key=True,
    )
    company_name: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    dti_reg_no: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    doe_no: Mapped[str | None] = mapped_column(String(50), nullable=True)
    primary_branch: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)

    users: Mapped[list[AppUser]] = relationship(back_populates="company")


class Role(Base):
    __tablename__ = "role"

    role_id: Mapped[int] = mapped_column(
        Integer,
        Identity(always=True),
        primary_key=True,
    )
    role_name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    users: Mapped[list[AppUser]] = relationship(back_populates="role")


class AppUser(Base):
    __tablename__ = "app_user"
    __table_args__ = (
        CheckConstraint(
            "status IN ('Active', 'Inactive', 'Suspended')",
            name="chk_user_status",
        ),
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        Identity(always=True),
        primary_key=True,
    )
    company_id: Mapped[int] = mapped_column(
        ForeignKey("company.company_id", name="fk_user_company"),
        nullable=False,
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey("role.role_id", name="fk_user_role"),
        nullable=False,
    )
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default=text("'Active'"),
    )
    created_at: Mapped[datetime] = mapped_column(
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    company: Mapped[Company] = relationship(back_populates="users")
    role: Mapped[Role] = relationship(back_populates="users")
