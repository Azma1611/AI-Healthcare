from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict

from models import UserCreate, UserLogin, User
from auth import verify_password, get_password_hash, create_access_token
from database import get_database
from bson import ObjectId

router = APIRouter()

@router.post("/register", response_model=Dict)
async def register(
    user_in: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and store user
    user_dict = user_in.model_dump()
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["role"] = "admin"
    
    result = await db.users.insert_one(user_dict)
    
    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }

@router.post("/login", response_model=Dict)
async def login(
    user_in: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Authenticate user
    db_user = await db.users.find_one({"email": user_in.email})
    if not db_user or not verify_password(user_in.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(db_user["_id"]), "email": db_user["email"]}
    )
    
    # Return response matching contracts.md
    return {
        "token": access_token,
        "user": {
            "id": str(db_user["_id"]),
            "email": db_user["email"],
            "name": db_user["name"]
        }
    }
