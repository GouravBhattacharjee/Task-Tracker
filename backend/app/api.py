from models import ReadProject, ReadRole, ReadRolePermissions, ReadTask, ReadTaskStatus, ReadUser, FilteredReadUser, WriteProject, WriteRole, WriteTask, WriteTaskStatus, WriteUser, Login, ChangePassword, JWTPayload
from utils import write_to_db, read_from_db, update_in_db, hash_password, verify_password, refresh_token, issue_tokens_and_set_cookie, require_permissions_any
from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlmodel import SQLModel, Session, select
from google.auth.transport import requests
from google.oauth2 import id_token
from database import get_session
from dotenv import load_dotenv
from typing import Sequence
import os

router = APIRouter()

# Load environment variables from .env file
load_dotenv()

JWT_REFRESH_TOKEN_EXPIRE_DAYS = os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS")


@router.get("/health")
def health():
    return {"message": "Health is good"}


router.post("/refresh-token")(refresh_token)


@router.post("/login")
def login(user: Login, response: Response, session: Session = Depends(get_session)):
    statement = (
        select(ReadUser, ReadRole.role_name, ReadRole.role_permissions)
        .join(ReadRole, ReadUser.role_id == ReadRole.role_id)
        .where(ReadUser.email == user.email)
    )

    result = session.exec(statement).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db_user, role_name, role_permissions = result

    if not verify_password(user.plain_password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = issue_tokens_and_set_cookie(response, db_user, role_name, role_permissions)
    return {"access_token": access_token}


@router.post("/login/google")
def login_google(payload: dict, response: Response, session: Session = Depends(get_session)):
    token = payload.get("token")  # ID token from Google frontend

    if not token:
        raise HTTPException(status_code=400, detail="Google token missing")

    try:
        # Verify Google ID token
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )

        email = idinfo.get("email")
        first_name = idinfo.get("given_name")
        last_name = idinfo.get("family_name")

        # Check if user exists
        statement = select(ReadUser, ReadRole.role_name, ReadRole.role_permissions)\
            .join(ReadRole, ReadUser.role_id == ReadRole.role_id)\
            .where(ReadUser.email == email)

        result = session.exec(statement).first()

        if result:
            # Existing user → login
            db_user, role_name, role_permissions = result
            access_token = issue_tokens_and_set_cookie(response, db_user, role_name, role_permissions)
            return {"access_token": access_token}

        # New user → return prefill data to frontend
        return {
            "status": "register",
            "first_name": first_name,
            "last_name": last_name,
            "email": email
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google login failed: {e}")


@router.post("/register", response_model=FilteredReadUser, status_code=status.HTTP_201_CREATED)
def create_user(user: WriteUser, session: Session = Depends(get_session)):
    filter = [ReadUser.email == user.email]
    existing_user: ReadUser | None = read_from_db(
        session, ReadUser, filter, True)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    data = ReadUser(
        **user.model_dump(exclude={"plain_password"}),
        hashed_password=hash_password(user.plain_password)
    )

    db_user = write_to_db(session, data)
    return db_user


@router.post("/change_password")
def change_password(data: ChangePassword, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_taskstatus", "view_project", "view_task"]))):
    user = session.get(ReadUser, data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not verify_password(data.old_password_plain, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Old password is incorrect")

    update_data = ReadUser(
        **data.model_dump(),
        hashed_password=hash_password(data.new_password_plain)
    )

    update_data_json = [update_data.model_dump(
        include={"user_id", "hashed_password", "modified_by_email", "modified_on_date"})]
    response = update_in_db(session, ReadUser, update_data_json)

    if response:
        return {"message": "Password updated successfully."}


@router.get("/users", response_model=list[FilteredReadUser])
def get_users(session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_user"]))):
    response = read_from_db(session, ReadUser, [ReadUser.user_active == 1])
    return response


@router.get("/users/{user_id}", response_model=FilteredReadUser)
def get_user(user_id: int, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_user"]))):
    user = read_from_db(session, ReadUser, [
                        ReadUser.user_id == user_id], fetch_first=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/update_user")
def update_user(data: ReadUser, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["update_user"]))):
    if isinstance(data, ReadUser):
        data: list[ReadUser] = [data]

    data_json = [d.model_dump(
        exclude={"created_by_email", "created_on_date"}) for d in data]
    response = update_in_db(session, ReadUser, data_json)

    return response


@router.post("/roles", response_model=ReadRole, status_code=status.HTTP_201_CREATED)
def create_role(user: WriteRole, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["create_role"]))):
    role_data = user.model_dump()
    db_user = ReadRole(**role_data)
    response = write_to_db(session, db_user)
    return response


@router.get("/roles", response_model=list[ReadRole])
def get_roles(session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_role"]))) -> Sequence[SQLModel]:
    response = read_from_db(session, ReadRole, [ReadRole.role_active == 1])
    return response


@router.get("/roles/{role_id}", response_model=ReadRole)
def get_role(role_id: int, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_role"]))):
    response = read_from_db(
        session, ReadRole, [ReadRole.role_id == role_id], fetch_first=True)
    return response


@router.post("/update_role")
def update_role(data: ReadRole, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["update_role"]))):
    if isinstance(data, ReadRole):
        data: list[ReadRole] = [data]

    data_json = [d.model_dump(
        exclude={"created_by_email", "created_on_date"}) for d in data]
    response = update_in_db(session, ReadRole, data_json)

    return response


@router.get("/rolepermissions", response_model=list[ReadRolePermissions])
def get_role_permissions(session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_role"]))) -> Sequence[SQLModel]:
    response = read_from_db(session, ReadRolePermissions)
    return response


@router.post("/projects", response_model=ReadProject, status_code=status.HTTP_201_CREATED)
def create_project(project: WriteProject, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["create_project"]))):
    data = ReadProject(
        **project.model_dump()
    )
    response = write_to_db(session, data)

    return response


@router.get("/projects", response_model=list[ReadProject])
def get_projects(session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_project"]))):
    response = read_from_db(session, ReadProject, [
                            ReadProject.project_active == 1])
    return response


@router.get("/projects/{project_id}", response_model=ReadProject)
def get_project(project_id: int, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_project"]))):
    response = read_from_db(session, ReadProject, [
                            ReadProject.project_id == project_id], fetch_first=True)
    return response


@router.post("/update_project")
def update_project(data: ReadProject, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["update_project"]))):
    if isinstance(data, ReadProject):
        data: list[ReadProject] = [data]

    data_json = [d.model_dump(
        exclude={"created_by_email", "created_on_date"}) for d in data]
    response = update_in_db(session, ReadProject, data_json)

    return response


@router.get("/projects/{project_id}/tasks")
def get_tasks_by_project_id(project_id: int, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_project", "view_task"]))):
    response = read_from_db(session, ReadTask, [ReadTask.task_active == 1, ReadTask.project_id == project_id])
    return response


@router.post("/tasks", response_model=ReadTask, status_code=status.HTTP_201_CREATED)
def create_task(task: WriteTask, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["create_task"]))):
    data = ReadTask(
        **task.model_dump()
    )
    response = write_to_db(session, data)

    return response


@router.get("/tasks", response_model=list[ReadTask])
def get_tasks(session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_task"]))):
    response = read_from_db(session, ReadTask, [ReadTask.task_active == 1])
    return response


@router.get("/tasks/{task_id}", response_model=ReadTask)
def get_task(task_id: int, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_task"]))):
    response = read_from_db(
        session, ReadTask, [ReadTask.task_id == task_id], fetch_first=True)
    return response


@router.post("/update_task")
def update_task(data: ReadTask, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["update_task"]))):
    if isinstance(data, ReadTask):
        data: list[ReadTask] = [data]

    data_json = [d.model_dump(
        exclude={"created_by_email", "created_on_date"}) for d in data]
    response = update_in_db(session, ReadTask, data_json)

    return response


@router.post("/update_taskstatus_in_task")
def update_task(data: ReadTask, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["update_taskstatus_in_task", "update_task"]))):
    if isinstance(data, ReadTask):
        data: list[ReadTask] = [data]

    data_json = [d.model_dump(
        include={"task_id", "task_status_id", "modified_by_email", "modified_on_date"}) for d in data]
    response = update_in_db(session, ReadTask, data_json)

    return response


@router.post("/taskstatus", response_model=ReadTaskStatus, status_code=status.HTTP_201_CREATED)
def create_taskstatus(task: WriteTaskStatus, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["create_taskstatus"]))):
    data = ReadTaskStatus(
        **task.model_dump()
    )
    response = write_to_db(session, data)

    return response


@router.get("/taskstatus", response_model=list[ReadTaskStatus])
def get_taskstatuses(session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_taskstatus"]))):
    response = read_from_db(session, ReadTaskStatus, [
                            ReadTaskStatus.task_status_active == 1])
    return response


@router.get("/taskstatus/{task_status_id}", response_model=ReadTaskStatus)
def get_taskstatus(task_status_id: int, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["view_taskstatus"]))):
    response = read_from_db(session, ReadTaskStatus, [
                            ReadTaskStatus.task_status_id == task_status_id], fetch_first=True)
    return response


@router.post("/update_taskstatus")
def update_taskstatus(data: ReadTaskStatus, session: Session = Depends(get_session), jwt_user: JWTPayload = Depends(require_permissions_any(["update_taskstatus"]))):
    if isinstance(data, ReadTaskStatus):
        data: list[ReadTaskStatus] = [data]

    data_json = [d.model_dump(
        exclude={"created_by_email", "created_on_date"}) for d in data]
    response = update_in_db(session, ReadTaskStatus, data_json)

    return response
