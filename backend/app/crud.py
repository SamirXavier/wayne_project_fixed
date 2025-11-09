from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid
from sqlalchemy import func

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Funções para Usuários
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed = pwd_context.hash(user.password)
    db_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed, 
        full_name=user.full_name, 
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def list_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

# Funções para Recursos
def create_resource(db: Session, resource: schemas.ResourceCreate):
    db_res = models.Resource(
        name=resource.name, 
        type=resource.type, 
        details=resource.details,
        status=resource.status,
        location=resource.location
    )
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

# Funções para Refresh Tokens
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

# Funções para Áreas Restritas
def create_restricted_area(db: Session, area: schemas.RestrictedAreaCreate):
    db_area = models.RestrictedArea(
        name=area.name,
        description=area.description,
        security_level=area.security_level,
        location=area.location
    )
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area

def get_restricted_areas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.RestrictedArea).offset(skip).limit(limit).all()

def get_restricted_area(db: Session, area_id: int):
    return db.query(models.RestrictedArea).filter(models.RestrictedArea.id == area_id).first()

def grant_area_access(db: Session, user_id: int, area_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    area = db.query(models.RestrictedArea).filter(models.RestrictedArea.id == area_id).first()
    
    if user and area and area not in user.accessible_areas:
        user.accessible_areas.append(area)
        db.commit()
    
    return area

def revoke_area_access(db: Session, user_id: int, area_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    area = db.query(models.RestrictedArea).filter(models.RestrictedArea.id == area_id).first()
    
    if user and area and area in user.accessible_areas:
        user.accessible_areas.remove(area)
        db.commit()
    
    return area

# Funções para Logs de Acesso
def create_access_log(db: Session, access_log: schemas.AccessLogCreate):
    db_log = models.AccessLog(
        user_id=access_log.user_id,
        area_id=access_log.area_id,
        access_type=access_log.access_type,
        status=access_log.status
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_access_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AccessLog).order_by(models.AccessLog.access_time.desc()).offset(skip).limit(limit).all()

# Funções para Dashboard
def get_dashboard_stats(db: Session):
    total_users = db.query(models.User).count()
    total_resources = db.query(models.Resource).count()
    total_restricted_areas = db.query(models.RestrictedArea).count()
    
    # Logs das últimas 24 horas
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_access_logs = db.query(models.AccessLog).filter(
        models.AccessLog.access_time >= yesterday
    ).count()
    
    # Incidentes de segurança (acessos negados)
    security_incidents = db.query(models.AccessLog).filter(
        models.AccessLog.status == "denied"
    ).count()
    
    # Recursos por tipo
    resources_by_type = db.query(
        models.Resource.type, 
        func.count(models.Resource.id)
    ).group_by(models.Resource.type).all()
    resources_by_type_dict = {rtype: count for rtype, count in resources_by_type}
    
    # Acessos por hora (últimas 24h)
    access_by_hour = db.query(
        func.extract('hour', models.AccessLog.access_time).label('hour'),
        func.count(models.AccessLog.id)
    ).filter(
        models.AccessLog.access_time >= yesterday
    ).group_by('hour').all()
    access_by_hour_dict = {int(hour): count for hour, count in access_by_hour}
    
    return {
        "total_users": total_users,
        "total_resources": total_resources,
        "total_restricted_areas": total_restricted_areas,
        "recent_access_logs": recent_access_logs,
        "security_incidents": security_incidents,
        "resources_by_type": resources_by_type_dict,
        "access_by_hour": access_by_hour_dict
    }