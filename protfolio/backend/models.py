from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: EmailStr
    name: str
    role: str = "admin"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Portfolio Info Models
class PortfolioInfo(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    title: str
    cgpa: str
    email: EmailStr
    phone: str
    linkedin: str
    github: str
    profileImage: str
    resumeUrl: Optional[str] = None
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class PortfolioInfoUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    cgpa: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    profileImage: Optional[str] = None
    resumeUrl: Optional[str] = None

# About Models
class About(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    description: str
    interests: List[str]
    qualities: List[str]
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class AboutUpdate(BaseModel):
    description: Optional[str] = None
    interests: Optional[List[str]] = None
    qualities: Optional[List[str]] = None

# Skill Models
class SkillCreate(BaseModel):
    name: str
    level: int
    category: str

class Skill(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    level: int
    category: str
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[int] = None
    category: Optional[str] = None
    order: Optional[int] = None

# Project Models
class ProjectCreate(BaseModel):
    title: str
    description: str
    image: str
    technologies: List[str]
    githubUrl: str
    liveUrl: str
    featured: bool = False
    award: Optional[str] = None

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    title: str
    description: str
    image: str
    technologies: List[str]
    githubUrl: str
    liveUrl: str
    featured: bool = False
    award: Optional[str] = None
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    technologies: Optional[List[str]] = None
    githubUrl: Optional[str] = None
    liveUrl: Optional[str] = None
    featured: Optional[bool] = None
    award: Optional[str] = None
    order: Optional[int] = None

# Achievement Models
class AchievementCreate(BaseModel):
    title: str
    description: str
    icon: str
    year: str

class Achievement(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    title: str
    description: str
    icon: str
    year: str
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    year: Optional[str] = None
    order: Optional[int] = None

# Education Models
class EducationCreate(BaseModel):
    degree: str
    institution: str
    duration: str
    score: str
    status: str

class Education(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    degree: str
    institution: str
    duration: str
    score: str
    status: str
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class EducationUpdate(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    duration: Optional[str] = None
    score: Optional[str] = None
    status: Optional[str] = None
    order: Optional[int] = None

# Language Models
class LanguageCreate(BaseModel):
    name: str
    proficiency: str

class Language(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    proficiency: str
    order: int = 0

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class LanguageUpdate(BaseModel):
    name: Optional[str] = None
    proficiency: Optional[str] = None
    order: Optional[int] = None

# Contact Models
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class Contact(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    email: EmailStr
    subject: str
    message: str
    read: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
