from fastapi import HTTPException, status, Header, Depends, Cookie, Response
from jwt import encode, decode, ExpiredSignatureError, InvalidTokenError
from models import ReadUser, JWTPayloadBase, JWTPayload
from datetime import datetime, timedelta, timezone
from sqlmodel import SQLModel, Session, select
from fastapi.security import SecurityScopes
from passlib.context import CryptContext
from database import get_session
from dotenv import load_dotenv
from os import getenv
import ast

# Load environment variables from .env file
load_dotenv()

JWT_SECRET_KEY = getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = getenv("JWT_ALGORITHM")
JWT_EXPIRATION_TIME_MINUTES = int(getenv("JWT_EXPIRATION_TIME_MINUTES"))
JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def write_to_db(session: Session, obj: type[SQLModel]) -> dict:
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj.model_dump()


def read_from_db(session: Session, obj: type[SQLModel], filters: list | None = None, fetch_first: bool = False) -> list[SQLModel] | SQLModel | None:
    statement = select(obj)
    if filters:
        statement = statement.where(*filters)
    result = session.exec(statement)
    return result.first() if fetch_first else result.all()


def update_in_db(session: Session, obj: type[SQLModel], data: list[dict]) -> dict[str, str]:
    pk_col = list(obj.__table__.primary_key.columns)[0]
    pk_name = pk_col.name

    missing_keys = [d for d in data if pk_name not in d]
    if missing_keys:
        raise HTTPException(
            status_code=422,
            detail=f"Each update entry must include primary key '{pk_name}'. Missing in {len(missing_keys)} record(s)."
        )

    session.bulk_update_mappings(obj, data)
    session.commit()

    return {
        "status": "success",
        "message": f"Updated {len(data)} record(s) in '{obj.__tablename__}'."
    }


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: JWTPayloadBase, current_time: datetime | None = None) -> str:
    if not current_time:
        current_time = datetime.now(timezone.utc).replace(microsecond=0)

    expiration_time = current_time + timedelta(minutes=JWT_EXPIRATION_TIME_MINUTES)
    to_encode = data.model_dump()
    to_encode.update({"iat": int(current_time.timestamp()), "exp": int(expiration_time.timestamp()), "type": "access"})
    access_token = encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    return access_token


def create_refresh_token(data: JWTPayloadBase, current_time: datetime | None = None) -> str:
    if not current_time:
        current_time = datetime.now(timezone.utc).replace(microsecond=0)

    expiration_time = current_time + timedelta(days=JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.model_dump()
    to_encode.update({"iat": int(current_time.timestamp()), "exp": int(expiration_time.timestamp()), "type": "refresh"})
    refresh_token = encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    update_in_db(next(get_session()), ReadUser, [{"user_id": data.user_id, "refresh_token": refresh_token, "modified_by_email": "system", "modified_on_date": current_time}])

    return refresh_token


def verify_access_token(required_scopes: SecurityScopes, authorization: str = Header(...), session: Session = Depends(get_session)) -> JWTPayloadBase:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]

    try:
        decoded_data: dict = decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        payload = JWTPayload(**decoded_data)

        if payload.type != "access":
            raise HTTPException(status_code=401, detail="Invalid token type for access")

        iat = datetime.fromtimestamp(payload.iat, tz=timezone.utc)
        user = session.get(ReadUser, int(payload.user_id))

        if user.modified_on_date.astimezone(timezone(timedelta(hours=5, minutes=30))) > iat:
            raise HTTPException(status_code=401, detail="Access token revoked due to profile/password update")

        scopes = list(required_scopes.scopes) # Using list make a copy
        mode = "any"
        if scopes and scopes[0].startswith("all:"):
            mode = "all"
            scopes[0] = scopes[0].replace("all:", "")

        if scopes:
            user_scopes: list[str] = ast.literal_eval(payload.role_permissions or "[]")

            if mode == "any" and not any(scope in user_scopes for scope in scopes):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"You do not have access to this resource. Requires one of: {scopes}"
                )
            elif mode == "all" and not all(scope in user_scopes for scope in scopes):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"You do not have access to this resource. Requires all of: {scopes}"
                )

        return JWTPayloadBase(**payload.model_dump())
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def refresh_token(refresh_token: str = Cookie(...), session: Session = Depends(get_session)) -> dict[str, str]:
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token provided")

    try:
        decoded_data: dict = decode(refresh_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        payload = JWTPayload(**decoded_data)
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.type != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    iat = datetime.fromtimestamp(payload.iat, tz=timezone.utc)
    user = session.get(ReadUser, int(payload.user_id))

    if (user.modified_on_date.replace(tzinfo=timezone.utc) > iat) or (user.refresh_token != refresh_token):
        raise HTTPException(status_code=401, detail="Refresh token revoked due to profile/password update")

    token_data = JWTPayloadBase(
        user_id=payload.user_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        role_name=payload.role_name,
        role_permissions=payload.role_permissions
    )
    new_access_token = create_access_token(token_data)

    return {"access_token": new_access_token}


def issue_tokens_and_set_cookie(response: Response, db_user: ReadUser, role_name: str, role_permissions: str) -> str:
    token_data = JWTPayloadBase(
        user_id=db_user.user_id,
        first_name=db_user.first_name,
        last_name=db_user.last_name,
        email=db_user.email,
        role_name=role_name,
        role_permissions=role_permissions
    )

    current_time = datetime.now(timezone.utc).replace(microsecond=0)

    access_token = create_access_token(token_data, current_time)
    refresh_token_cookie = create_refresh_token(token_data, current_time)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token_cookie,
        httponly=True,
        secure=True,
        samesite="None",
        max_age=int(JWT_REFRESH_TOKEN_EXPIRE_DAYS) * 24 * 60 * 60
    )

    return access_token
