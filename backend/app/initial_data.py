from .database import SessionLocal, engine
from . import models, crud, schemas

models.Base.metadata.create_all(bind=engine)

if __name__ == '__main__':
    db = SessionLocal()
    admin = schemas.UserCreate(username='admin', email='admin@wayne.com', password='admin123', full_name='Bruce Wayne', role='security_admin')
    if not crud.get_user_by_username(db, 'admin'):
        crud.create_user(db, admin)
    db.close()
    print('Admin created (username=admin, password=admin123)')
