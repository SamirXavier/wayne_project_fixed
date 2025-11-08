from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas, crud, auth
from .database import engine, Base

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Wayne Industries Security API")

# CONFIGURAÇÃO CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/token', response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail='Incorrect username or password')
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    refresh = crud.create_refresh_token(db, user_id=user.id, expires_delta_days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    return {"access_token": access_token, "refresh_token": refresh.token, "token_type": "bearer"}

@app.post('/refresh-token', response_model=schemas.Token)
def refresh_token_endpoint(payload: dict, db: Session = Depends(auth.get_db)):
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
    return {"access_token": access_token, "refresh_token": new_rt.token, "token_type": "bearer"}

@app.post('/logout')
def logout(payload: dict, db: Session = Depends(auth.get_db)):
    token = payload.get('refresh_token')
    if not token:
        raise HTTPException(status_code=400, detail='Refresh token required')
    rt = crud.revoke_refresh_token(db, token)
    if not rt:
        raise HTTPException(status_code=404, detail='Refresh token not found')
    return {"ok": True}

@app.post('/users/', response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail='Username already registered')
    return crud.create_user(db, user)

@app.get('/users/me', response_model=schemas.UserOut)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@app.post('/resources/', response_model=schemas.ResourceOut)
def create_resource(resource: schemas.ResourceCreate, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.require_role('manager'))):
    return crud.create_resource(db, resource)

@app.get('/resources/', response_model=list[schemas.ResourceOut])
def list_resources(skip: int = 0, limit: int = 100, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    return crud.list_resources(db, skip=skip, limit=limit)

@app.get('/resources/{resource_id}', response_model=schemas.ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    res = crud.get_resource(db, resource_id)
    if not res:
        raise HTTPException(status_code=404, detail='Resource not found')
    return res

@app.put('/resources/{resource_id}', response_model=schemas.ResourceOut)
def update_resource(resource_id: int, resource: schemas.ResourceCreate, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.require_role('manager'))):
    updated = crud.update_resource(db, resource_id, resource)
    if not updated:
        raise HTTPException(status_code=404, detail='Resource not found')
    return updated

@app.delete('/resources/{resource_id}')
def delete_resource(resource_id: int, db: Session = Depends(auth.get_db), current_user: models.User = Depends(auth.require_role('manager'))):
    deleted = crud.delete_resource(db, resource_id)
    if not deleted:
        raise HTTPException(status_code=404, detail='Resource not found')
    return {"ok": True}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Wayne Industries API is running"}



