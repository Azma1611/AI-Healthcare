from fastapi import APIRouter, HTTPException, Depends, status
from motor.motor_asyncio import AsyncIOMotorClient
from models import (
    UserCreate, UserLogin, User,
    PortfolioInfo, PortfolioInfoUpdate,
    About, AboutUpdate,
    Skill, SkillCreate, SkillUpdate,
    Project, ProjectCreate, ProjectUpdate,
    Achievement, AchievementCreate, AchievementUpdate,
    Education, EducationCreate, EducationUpdate,
    Language, LanguageCreate, LanguageUpdate,
    Contact, ContactCreate
)
from auth import (
    get_password_hash, verify_password, create_access_token, get_current_user
)
from email_service import send_contact_email
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'portfolio_db')]

# ==================== AUTH ROUTES ====================

@router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user_dict = {
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name,
        "role": "admin",
        "createdAt": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    
    return {
        "message": "User registered successfully",
        "user": {
            "id": str(result.inserted_id),
            "email": user_data.email,
            "name": user_data.name
        }
    }

@router.post("/auth/login", response_model=dict)
async def login(user_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"]}
    )
    
    return {
        "token": access_token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"]
        }
    }

# ==================== PORTFOLIO INFO ROUTES ====================

@router.get("/portfolio/info", response_model=PortfolioInfo)
async def get_portfolio_info():
    info = await db.portfolio_info.find_one()
    if not info:
        raise HTTPException(status_code=404, detail="Portfolio info not found")
    info["_id"] = str(info["_id"])
    return info

@router.put("/portfolio/info", response_model=PortfolioInfo)
async def update_portfolio_info(
    update_data: PortfolioInfoUpdate,
    current_user: dict = Depends(get_current_user)
):
    info = await db.portfolio_info.find_one()
    if not info:
        raise HTTPException(status_code=404, detail="Portfolio info not found")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    update_dict["updatedAt"] = datetime.utcnow()
    
    await db.portfolio_info.update_one(
        {"_id": info["_id"]},
        {"$set": update_dict}
    )
    
    updated_info = await db.portfolio_info.find_one({"_id": info["_id"]})
    updated_info["_id"] = str(updated_info["_id"])
    return updated_info

# ==================== ABOUT ROUTES ====================

@router.get("/portfolio/about", response_model=About)
async def get_about():
    about = await db.about.find_one()
    if not about:
        raise HTTPException(status_code=404, detail="About section not found")
    about["_id"] = str(about["_id"])
    return about

@router.put("/portfolio/about", response_model=About)
async def update_about(
    update_data: AboutUpdate,
    current_user: dict = Depends(get_current_user)
):
    about = await db.about.find_one()
    if not about:
        raise HTTPException(status_code=404, detail="About section not found")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    update_dict["updatedAt"] = datetime.utcnow()
    
    await db.about.update_one(
        {"_id": about["_id"]},
        {"$set": update_dict}
    )
    
    updated_about = await db.about.find_one({"_id": about["_id"]})
    updated_about["_id"] = str(updated_about["_id"])
    return updated_about

# ==================== SKILLS ROUTES ====================

@router.get("/portfolio/skills", response_model=List[Skill])
async def get_skills():
    skills = await db.skills.find().sort("order", 1).to_list(100)
    for skill in skills:
        skill["_id"] = str(skill["_id"])
    return skills

@router.post("/portfolio/skills", response_model=Skill)
async def create_skill(
    skill_data: SkillCreate,
    current_user: dict = Depends(get_current_user)
):
    skill_dict = skill_data.dict()
    skill_dict["order"] = await db.skills.count_documents({})
    skill_dict["createdAt"] = datetime.utcnow()
    
    result = await db.skills.insert_one(skill_dict)
    skill_dict["_id"] = str(result.inserted_id)
    return skill_dict

@router.put("/portfolio/skills/{skill_id}", response_model=Skill)
async def update_skill(
    skill_id: str,
    update_data: SkillUpdate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(skill_id):
        raise HTTPException(status_code=400, detail="Invalid skill ID")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    
    result = await db.skills.update_one(
        {"_id": ObjectId(skill_id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    skill = await db.skills.find_one({"_id": ObjectId(skill_id)})
    skill["_id"] = str(skill["_id"])
    return skill

@router.delete("/portfolio/skills/{skill_id}")
async def delete_skill(
    skill_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(skill_id):
        raise HTTPException(status_code=400, detail="Invalid skill ID")
    
    result = await db.skills.delete_one({"_id": ObjectId(skill_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    return {"message": "Skill deleted successfully"}

# ==================== PROJECTS ROUTES ====================

@router.get("/portfolio/projects", response_model=List[Project])
async def get_projects(featured: Optional[bool] = None):
    query = {}
    if featured is not None:
        query["featured"] = featured
    
    projects = await db.projects.find(query).sort("order", 1).to_list(100)
    for project in projects:
        project["_id"] = str(project["_id"])
    return projects

@router.post("/portfolio/projects", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    project_dict = project_data.dict()
    project_dict["order"] = await db.projects.count_documents({})
    project_dict["createdAt"] = datetime.utcnow()
    
    result = await db.projects.insert_one(project_dict)
    project_dict["_id"] = str(result.inserted_id)
    return project_dict

@router.put("/portfolio/projects/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    update_data: ProjectUpdate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    
    result = await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    project["_id"] = str(project["_id"])
    return project

@router.delete("/portfolio/projects/{project_id}")
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    result = await db.projects.delete_one({"_id": ObjectId(project_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project deleted successfully"}

# ==================== ACHIEVEMENTS ROUTES ====================

@router.get("/portfolio/achievements", response_model=List[Achievement])
async def get_achievements():
    achievements = await db.achievements.find().sort("order", 1).to_list(100)
    for achievement in achievements:
        achievement["_id"] = str(achievement["_id"])
    return achievements

@router.post("/portfolio/achievements", response_model=Achievement)
async def create_achievement(
    achievement_data: AchievementCreate,
    current_user: dict = Depends(get_current_user)
):
    achievement_dict = achievement_data.dict()
    achievement_dict["order"] = await db.achievements.count_documents({})
    achievement_dict["createdAt"] = datetime.utcnow()
    
    result = await db.achievements.insert_one(achievement_dict)
    achievement_dict["_id"] = str(result.inserted_id)
    return achievement_dict

@router.put("/portfolio/achievements/{achievement_id}", response_model=Achievement)
async def update_achievement(
    achievement_id: str,
    update_data: AchievementUpdate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(achievement_id):
        raise HTTPException(status_code=400, detail="Invalid achievement ID")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    
    result = await db.achievements.update_one(
        {"_id": ObjectId(achievement_id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    achievement = await db.achievements.find_one({"_id": ObjectId(achievement_id)})
    achievement["_id"] = str(achievement["_id"])
    return achievement

@router.delete("/portfolio/achievements/{achievement_id}")
async def delete_achievement(
    achievement_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(achievement_id):
        raise HTTPException(status_code=400, detail="Invalid achievement ID")
    
    result = await db.achievements.delete_one({"_id": ObjectId(achievement_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    return {"message": "Achievement deleted successfully"}

# ==================== EDUCATION ROUTES ====================

@router.get("/portfolio/education", response_model=List[Education])
async def get_education():
    education = await db.education.find().sort("order", 1).to_list(100)
    for edu in education:
        edu["_id"] = str(edu["_id"])
    return education

@router.post("/portfolio/education", response_model=Education)
async def create_education(
    education_data: EducationCreate,
    current_user: dict = Depends(get_current_user)
):
    education_dict = education_data.dict()
    education_dict["order"] = await db.education.count_documents({})
    education_dict["createdAt"] = datetime.utcnow()
    
    result = await db.education.insert_one(education_dict)
    education_dict["_id"] = str(result.inserted_id)
    return education_dict

@router.put("/portfolio/education/{education_id}", response_model=Education)
async def update_education(
    education_id: str,
    update_data: EducationUpdate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(education_id):
        raise HTTPException(status_code=400, detail="Invalid education ID")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    
    result = await db.education.update_one(
        {"_id": ObjectId(education_id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Education not found")
    
    education = await db.education.find_one({"_id": ObjectId(education_id)})
    education["_id"] = str(education["_id"])
    return education

@router.delete("/portfolio/education/{education_id}")
async def delete_education(
    education_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(education_id):
        raise HTTPException(status_code=400, detail="Invalid education ID")
    
    result = await db.education.delete_one({"_id": ObjectId(education_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Education not found")
    
    return {"message": "Education deleted successfully"}

# ==================== LANGUAGES ROUTES ====================

@router.get("/portfolio/languages", response_model=List[Language])
async def get_languages():
    languages = await db.languages.find().sort("order", 1).to_list(100)
    for lang in languages:
        lang["_id"] = str(lang["_id"])
    return languages

@router.post("/portfolio/languages", response_model=Language)
async def create_language(
    language_data: LanguageCreate,
    current_user: dict = Depends(get_current_user)
):
    language_dict = language_data.dict()
    language_dict["order"] = await db.languages.count_documents({})
    
    result = await db.languages.insert_one(language_dict)
    language_dict["_id"] = str(result.inserted_id)
    return language_dict

@router.put("/portfolio/languages/{language_id}", response_model=Language)
async def update_language(
    language_id: str,
    update_data: LanguageUpdate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(language_id):
        raise HTTPException(status_code=400, detail="Invalid language ID")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    
    result = await db.languages.update_one(
        {"_id": ObjectId(language_id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Language not found")
    
    language = await db.languages.find_one({"_id": ObjectId(language_id)})
    language["_id"] = str(language["_id"])
    return language

@router.delete("/portfolio/languages/{language_id}")
async def delete_language(
    language_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(language_id):
        raise HTTPException(status_code=400, detail="Invalid language ID")
    
    result = await db.languages.delete_one({"_id": ObjectId(language_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Language not found")
    
    return {"message": "Language deleted successfully"}

# ==================== CONTACT ROUTES ====================

@router.post("/contact", response_model=dict)
async def submit_contact(
    contact_data: ContactCreate
):
    # Save to database
    contact_dict = contact_data.dict()
    contact_dict["read"] = False
    contact_dict["createdAt"] = datetime.utcnow()
    
    result = await db.contacts.insert_one(contact_dict)
    
    # Send email notification
    await send_contact_email(
        name=contact_data.name,
        email=contact_data.email,
        subject=contact_data.subject,
        message=contact_data.message
    )
    
    return {
        "success": True,
        "message": "Thank you for your message! I'll get back to you soon."
    }

@router.get("/contacts", response_model=List[Contact])
async def get_contacts(current_user: dict = Depends(get_current_user)):
    contacts = await db.contacts.find().sort("createdAt", -1).to_list(100)
    for contact in contacts:
        contact["_id"] = str(contact["_id"])
    return contacts

@router.put("/contacts/{contact_id}/read")
async def mark_contact_read(
    contact_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid contact ID")
    
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact marked as read"}
