from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from api import router

app = FastAPI()

app.include_router(router, prefix="/api")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
