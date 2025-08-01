from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from logging_config import logger
from fastapi import HTTPException
from dotenv import load_dotenv
from typing import Generator
from sqlmodel import Session
import os

# Load environment variables from .env file
load_dotenv()

# Azure SQL Database connection details
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")


def get_db_connection_string() -> str:
    db_conn_str = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    return db_conn_str


def get_db_engine(pool_size: int = None, max_overflow: int = None) -> Engine:
    try:
        db_conn_str = get_db_connection_string()

        if pool_size is None and max_overflow is None:
            engine = create_engine(db_conn_str, pool_pre_ping=True, echo=False, future=True)
        else:
            engine = create_engine(db_conn_str, pool_size=pool_size, max_overflow=max_overflow, pool_pre_ping=True, echo=False, future=True)

        return engine
    except Exception as e:
        logger.error(f"Error connecting to the database: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error connecting to the database: {e}")


def get_session() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


engine = get_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)
