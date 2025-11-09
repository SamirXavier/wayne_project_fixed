from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas, crud, auth
from .database import engine, Base

# Base.metadata.create_all(bind=engine)
app = FastAPI(title="Wayne Industries Security API")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# ENDPOINTS DE AUTENTICAÇÃO
# ==============================================================================

@app.post('/token', response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(auth.get_db)
):
    """Endpoint para login e obtenção de tokens de acesso"""
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail='Incorrect username or password')
    
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    refresh = crud.create_refresh_token(db, user_id=user.id, expires_delta_days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh.token,
        "token_type": "bearer"
    }


@app.post('/refresh-token', response_model=schemas.Token)
def refresh_token_endpoint(
    payload: dict, 
    db: Session = Depends(auth.get_db)
):
    """Endpoint para renovar tokens usando refresh token"""
    token = payload.get('refresh_token')
    if not token:
        raise HTTPException(status_code=400, detail='Refresh token required')
    
    rt = crud.get_refresh_token(db, token)
    if not rt or rt.revoked:
        raise HTTPException(status_code=401, detail='Invalid refresh token')
    
    if rt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail='Refresh token expired')
    
    user = db.query(models.User).filter(models.User.id == rt.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    
    crud.revoke_refresh_token(db, token)
    new_rt = crud.create_refresh_token(db, user_id=user.id, expires_delta_days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    
    return {
        "access_token": access_token,
        "refresh_token": new_rt.token,
        "token_type": "bearer"
    }


@app.post('/logout')
def logout(
    payload: dict, 
    db: Session = Depends(auth.get_db)
):
    """Endpoint para logout e revogação de refresh token"""
    token = payload.get('refresh_token')
    if not token:
        raise HTTPException(status_code=400, detail='Refresh token required')
    
    rt = crud.revoke_refresh_token(db, token)
    if not rt:
        raise HTTPException(status_code=404, detail='Refresh token not found')
    
    return {"ok": True}


# ==============================================================================
# ENDPOINTS DE USUÁRIOS
# ==============================================================================

@app.post('/users/', response_model=schemas.UserOut)
def create_user(
    user: schemas.UserCreate, 
    db: Session = Depends(auth.get_db)
):
    """Cria um novo usuário"""
    db_user = crud.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail='Username already registered')
    return crud.create_user(db, user)


@app.get('/users/', response_model=list[schemas.UserOut])
def list_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(auth.get_db), 
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Lista todos os usuários (apenas para security_admin)"""
    return crud.list_users(db, skip=skip, limit=limit)


@app.get('/users/me', response_model=schemas.UserWithAreas)
async def read_users_me(
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Retorna informações do usuário atual"""
    return current_user


@app.get('/users/{user_id}', response_model=schemas.UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Obtém um usuário específico por ID (apenas para security_admin)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user


@app.put('/users/{user_id}', response_model=schemas.UserOut)
def update_user(
    user_id: int, 
    user: schemas.UserCreate, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Atualiza um usuário existente (apenas para security_admin)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Verificar se o username já existe em outro usuário
    if user.username != db_user.username:
        existing_user = crud.get_user_by_username(db, user.username)
        if existing_user:
            raise HTTPException(status_code=400, detail='Username already registered')
    
    # Verificar se o email já existe em outro usuário
    if user.email != db_user.email:
        existing_email = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail='Email already registered')
    
    # Atualizar campos
    db_user.username = user.username
    db_user.email = user.email
    db_user.full_name = user.full_name
    db_user.role = user.role
    
    # Se uma nova senha foi fornecida, atualizar
    if user.password:
        hashed = auth.pwd_context.hash(user.password)
        db_user.hashed_password = hashed
    
    db.commit()
    db.refresh(db_user)
    return db_user


@app.delete('/users/{user_id}')
def delete_user(
    user_id: int, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Exclui um usuário (apenas para security_admin)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Impedir que o usuário exclua a si mesmo
    if db_user.id == current_user.id:
        raise HTTPException(status_code=400, detail='Cannot delete your own account')
    
    db.delete(db_user)
    db.commit()
    return {"ok": True}


# ==============================================================================
# ENDPOINTS DE RECURSOS
# ==============================================================================

@app.post('/resources/', response_model=schemas.ResourceOut)
def create_resource(
    resource: schemas.ResourceCreate, 
    db: Session = Depends(auth.get_db), 
    current_user: models.User = Depends(auth.require_role('manager'))
):
    """Cria um novo recurso (apenas para manager)"""
    return crud.create_resource(db, resource)


@app.get('/resources/', response_model=list[schemas.ResourceOut])
def list_resources(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(auth.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Lista todos os recursos"""
    return crud.list_resources(db, skip=skip, limit=limit)


@app.get('/resources/{resource_id}', response_model=schemas.ResourceOut)
def get_resource(
    resource_id: int, 
    db: Session = Depends(auth.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Obtém um recurso específico por ID"""
    res = crud.get_resource(db, resource_id)
    if not res:
        raise HTTPException(status_code=404, detail='Resource not found')
    return res


@app.put('/resources/{resource_id}', response_model=schemas.ResourceOut)
def update_resource(
    resource_id: int, 
    resource: schemas.ResourceCreate, 
    db: Session = Depends(auth.get_db), 
    current_user: models.User = Depends(auth.require_role('manager'))
):
    """Atualiza um recurso existente (apenas para manager)"""
    updated = crud.update_resource(db, resource_id, resource)
    if not updated:
        raise HTTPException(status_code=404, detail='Resource not found')
    return updated


@app.delete('/resources/{resource_id}')
def delete_resource(
    resource_id: int, 
    db: Session = Depends(auth.get_db), 
    current_user: models.User = Depends(auth.require_role('manager'))
):
    """Exclui um recurso (apenas para manager)"""
    deleted = crud.delete_resource(db, resource_id)
    if not deleted:
        raise HTTPException(status_code=404, detail='Resource not found')
    return {"ok": True}


# ==============================================================================
# ENDPOINTS DE ÁREAS RESTRITAS
# ==============================================================================

@app.post('/restricted-areas/', response_model=schemas.RestrictedAreaOut)
def create_restricted_area(
    area: schemas.RestrictedAreaCreate, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Cria uma nova área restrita (apenas para security_admin)"""
    return crud.create_restricted_area(db, area)


@app.get('/restricted-areas/', response_model=list[schemas.RestrictedAreaOut])
def list_restricted_areas(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Lista todas as áreas restritas"""
    return crud.get_restricted_areas(db, skip=skip, limit=limit)


@app.get('/restricted-areas/{area_id}', response_model=schemas.RestrictedAreaOut)
def get_restricted_area(
    area_id: int,
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Obtém uma área restrita específica por ID"""
    area = crud.get_restricted_area(db, area_id)
    if not area:
        raise HTTPException(status_code=404, detail='Restricted area not found')
    return area


@app.put('/restricted-areas/{area_id}', response_model=schemas.RestrictedAreaOut)
def update_restricted_area(
    area_id: int, 
    area: schemas.RestrictedAreaCreate, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Atualiza uma área restrita existente (apenas para security_admin)"""
    db_area = crud.get_restricted_area(db, area_id)
    if not db_area:
        raise HTTPException(status_code=404, detail='Restricted area not found')
    
    # Atualiza os campos
    for key, value in area.dict().items():
        setattr(db_area, key, value)
    
    db.commit()
    db.refresh(db_area)
    return db_area


@app.delete('/restricted-areas/{area_id}')
def delete_restricted_area(
    area_id: int, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Exclui uma área restrita (apenas para security_admin)"""
    db_area = crud.get_restricted_area(db, area_id)
    if not db_area:
        raise HTTPException(status_code=404, detail='Restricted area not found')
    
    db.delete(db_area)
    db.commit()
    return {"ok": True}


@app.post('/restricted-areas/{area_id}/grant-access/{user_id}')
def grant_area_access(
    area_id: int, 
    user_id: int, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Concede acesso a uma área restrita para um usuário (apenas para security_admin)"""
    area = crud.grant_area_access(db, user_id, area_id)
    if not area:
        raise HTTPException(status_code=404, detail='Area or user not found')
    return {"ok": True, "message": "Access granted"}


@app.post('/restricted-areas/{area_id}/revoke-access/{user_id}')
def revoke_area_access(
    area_id: int, 
    user_id: int, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Revoga acesso a uma área restrita de um usuário (apenas para security_admin)"""
    area = crud.revoke_area_access(db, user_id, area_id)
    if not area:
        raise HTTPException(status_code=404, detail='Area or user not found')
    return {"ok": True, "message": "Access revoked"}


# ==============================================================================
# ENDPOINTS DE LOGS DE ACESSO
# ==============================================================================

@app.post('/access-logs/', response_model=schemas.AccessLogOut)
def create_access_log(
    access_log: schemas.AccessLogCreate, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Cria um novo log de acesso"""
    return crud.create_access_log(db, access_log)


@app.get('/access-logs/', response_model=list[schemas.AccessLogOut])
def list_access_logs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Lista todos os logs de acesso (apenas para security_admin)"""
    return crud.get_access_logs(db, skip=skip, limit=limit)


@app.get('/access-logs/{log_id}', response_model=schemas.AccessLogOut)
def get_access_log(
    log_id: int,
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Obtém um log de acesso específico por ID (apenas para security_admin)"""
    log = db.query(models.AccessLog).filter(models.AccessLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail='Access log not found')
    return log


@app.delete('/access-logs/{log_id}')
def delete_access_log(
    log_id: int,
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Exclui um log de acesso (apenas para security_admin)"""
    log = db.query(models.AccessLog).filter(models.AccessLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail='Access log not found')
    
    db.delete(log)
    db.commit()
    return {"ok": True}


@app.get('/access-logs/user/{user_id}', response_model=list[schemas.AccessLogOut])
def get_user_access_logs(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.require_role('security_admin'))
):
    """Lista logs de acesso de um usuário específico (apenas para security_admin)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    logs = db.query(models.AccessLog)\
        .filter(models.AccessLog.user_id == user_id)\
        .order_by(models.AccessLog.access_time.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return logs


# ==============================================================================
# ENDPOINT DE DASHBOARD
# ==============================================================================

@app.get('/dashboard/stats', response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(auth.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Retorna estatísticas para o dashboard"""
    return crud.get_dashboard_stats(db)


# ==============================================================================
# ENDPOINT DE HEALTH CHECK
# ==============================================================================

@app.get("/health")
def health_check():
    """Endpoint de verificação de saúde da API"""
    return {"status": "healthy", "message": "Wayne Industries API is running"}