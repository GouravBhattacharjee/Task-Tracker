from sqlmodel import SQLModel, Field, Relationship
from datetime import date, datetime, timezone
from pydantic import BaseModel


def get_time() -> datetime:
    return datetime.now(timezone.utc).replace(microsecond=0)


class JWTPayloadBase(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    email: str
    role_name: str
    role_permissions: str


class JWTPayload(JWTPayloadBase):
    iat: int
    exp: int
    type: str


class Login(BaseModel):
    email: str
    plain_password: str


class WriteRole(SQLModel):
    role_name: str = Field(index=True, unique=True, max_length=50)
    role_permissions: str
    role_active: bool = True
    created_by_email: str = "system"
    created_on_date: datetime = Field(default_factory=get_time)
    modified_by_email: str = "system"
    modified_on_date: datetime = Field(default_factory=get_time)


class ReadRole(WriteRole, table=True):
    __tablename__ = "roles"

    role_id: int | None = Field(default=None, primary_key=True)

    users: list["ReadUser"] = Relationship(back_populates="role")


class ReadRolePermissions(SQLModel, table=True):
    __tablename__ = "role_permissions"

    role_permissions_name: str = Field(primary_key=True)


class WriteTaskStatus(SQLModel):
    task_status_name: str = Field(index=True, unique=True, max_length=50)
    task_status_active: bool = True
    created_by_email: str = "system"
    created_on_date: datetime = Field(default_factory=get_time)
    modified_by_email: str = "system"
    modified_on_date: datetime = Field(default_factory=get_time)


class ReadTaskStatus(WriteTaskStatus, table=True):
    __tablename__ = "task_status"

    task_status_id: int | None = Field(default=None, primary_key=True)

    tasks: list["ReadTask"] = Relationship(back_populates="status")


class ChangePassword(BaseModel):
    user_id: int
    old_password_plain: str
    new_password_plain: str


class UserBase(SQLModel):
    first_name: str = Field(max_length=30)
    last_name: str = Field(max_length=30)
    email: str = Field(index=True, unique=True, max_length=100)
    provider: str = Field(max_length=30)
    role_id: int = Field(foreign_key="roles.role_id")
    user_active: bool = True
    created_by_email: str = "system"
    created_on_date: datetime = Field(default_factory=get_time)
    modified_by_email: str = "system"
    modified_on_date: datetime = Field(default_factory=get_time)


class WriteUser(UserBase):
    plain_password: str = Field(max_length=255)


class FilteredReadUser(UserBase):
    user_id: int


class ReadUser(UserBase, table=True):
    __tablename__ = "users"

    user_id: int | None = Field(default=None, primary_key=True)
    hashed_password: str = Field(max_length=255)
    refresh_token: str | None = Field(max_length=1024)

    role: ReadRole = Relationship(back_populates="users")
    owned_projects: list["ReadProject"] = Relationship(back_populates="owner")
    owned_tasks: list["ReadTask"] = Relationship(back_populates="owner")


class WriteProject(SQLModel):
    project_name: str = Field(max_length=150)
    project_description: str
    project_start_date: date
    project_end_date: date
    owner_id: int = Field(foreign_key="users.user_id")
    project_active: bool = True
    created_by_email: str = "system"
    created_on_date: datetime = Field(default_factory=get_time)
    modified_by_email: str = "system"
    modified_on_date: datetime = Field(default_factory=get_time)


class ReadProject(WriteProject, table=True):
    __tablename__ = "projects"

    project_id: int | None = Field(default=None, primary_key=True)

    owner: ReadUser = Relationship(back_populates="owned_projects")
    tasks: list["ReadTask"] = Relationship(back_populates="project")


class WriteTask(SQLModel):
    task_description: str
    task_due_date: date
    task_status_id: int = Field(foreign_key="task_status.task_status_id")
    owner_id: int = Field(foreign_key="users.user_id")
    project_id: int = Field(foreign_key="projects.project_id")
    task_active: bool = True
    created_by_email: str = "system"
    created_on_date: datetime = Field(default_factory=get_time)
    modified_by_email: str = "system"
    modified_on_date: datetime = Field(default_factory=get_time)


class ReadTask(WriteTask, table=True):
    __tablename__ = "tasks"

    task_id: int | None = Field(default=None, primary_key=True)

    status: ReadTaskStatus = Relationship(back_populates="tasks")
    owner: ReadUser = Relationship(back_populates="owned_tasks")
    project: ReadProject = Relationship(back_populates="tasks")


# Forward references
ReadUser.model_rebuild()
ReadRole.model_rebuild()
ReadTask.model_rebuild()
ReadProject.model_rebuild()
ReadTaskStatus.model_rebuild()
