from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed = pwd_context.hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed, full_name=user.full_name, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_resource(db: Session, resource: schemas.ResourceCreate):
    db_res = models.Resource(name=resource.name, type=resource.type, details=resource.details)
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return db_res

def list_resources(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Resource).offset(skip).limit(limit).all()

def get_resource(db: Session, resource_id: int):
    return db.query(models.Resource).filter(models.Resource.id == resource_id).first()

def update_resource(db: Session, resource_id: int, resource: schemas.ResourceCreate):
    db_res = get_resource(db, resource_id)
    if not db_res:
        return None
    for key, val in resource.dict().items():
        setattr(db_res, key, val)
    db.commit()
    db.refresh(db_res)
    return db_res

def delete_resource(db: Session, resource_id: int):
    db_res = get_resource(db, resource_id)
    if db_res:
        db.delete(db_res)
        db.commit()
    return db_res

def create_refresh_token(db: Session, user_id: int, expires_delta_days: int):
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(days=expires_delta_days)
    rt = models.RefreshToken(token=token, user_id=user_id, expires_at=expires_at)
    db.add(rt)
    db.commit()
    db.refresh(rt)
    return rt

def get_refresh_token(db: Session, token: str):
    return db.query(models.RefreshToken).filter(models.RefreshToken.token == token).first()

def revoke_refresh_token(db: Session, token: str):
    rt = get_refresh_token(db, token)
    if not rt:
        return None
    rt.revoked = True
    db.commit()
    db.refresh(rt)
    return rt
