import os
from .database import SessionLocal, recreate_database
from . import models, crud, schemas

def create_initial_data():
    # Recria o banco de dados
    recreate_database()
    
    db = SessionLocal()
    try:
        # Verificar se o admin já existe
        admin = crud.get_user_by_username(db, 'admin')
        if not admin:
            admin_user = schemas.UserCreate(
                username='admin',
                email='admin@wayne.com', 
                password='admin123',
                full_name='Bruce Wayne',
                role='security_admin'
            )
            crud.create_user(db, admin_user)
            print('✅ Admin criado (username=admin, password=admin123)')
        
        # Criar alguns dados de exemplo
        resources_count = db.query(models.Resource).count()
        if resources_count == 0:
            # Criar alguns recursos de exemplo
            sample_resources = [
                schemas.ResourceCreate(
                    name="Computador i7",
                    type="equipment",
                    details="Dell i7, 16GB RAM, 512GB SSD",
                    status="available",
                    location="Sala A101"
                ),
                schemas.ResourceCreate(
                    name="Van de Segurança",
                    type="vehicle", 
                    details="Ford Transit 2023",
                    status="available",
                    location="Garagem Principal"
                ),
                schemas.ResourceCreate(
                    name="Câmera IP",
                    type="security_device",
                    details="Câmera de vigilância 4K",
                    status="in_use",
                    location="Portão Principal"
                )
            ]
            
            for resource in sample_resources:
                crud.create_resource(db, resource)
            
            print(f'✅ {len(sample_resources)} recursos de exemplo criados')
        
        # Criar áreas restritas de exemplo
        areas_count = db.query(models.RestrictedArea).count()
        if areas_count == 0:
            sample_areas = [
                schemas.RestrictedAreaCreate(
                    name="Laboratório de Pesquisa",
                    description="Área de pesquisa e desenvolvimento",
                    security_level="high",
                    location="Edifício B, 3º andar"
                ),
                schemas.RestrictedAreaCreate(
                    name="Sala do Servidor",
                    description="Data center principal",
                    security_level="critical", 
                    location="Edifício A, Subsolo"
                ),
                schemas.RestrictedAreaCreate(
                    name="Armazém de Equipamentos",
                    description="Armazenamento de equipamentos sensíveis",
                    security_level="medium",
                    location="Edifício C, 1º andar"
                )
            ]
            
            for area in sample_areas:
                crud.create_restricted_area(db, area)
            
            print(f'✅ {len(sample_areas)} áreas restritas de exemplo criadas')
            
        # Criar alguns logs de acesso de exemplo
        from datetime import datetime, timedelta
        access_logs_count = db.query(models.AccessLog).count()
        if access_logs_count == 0:
            # Buscar usuário admin e primeira área
            admin_user = crud.get_user_by_username(db, 'admin')
            first_area = db.query(models.RestrictedArea).first()
            
            if admin_user and first_area:
                sample_logs = [
                    schemas.AccessLogCreate(
                        user_id=admin_user.id,
                        area_id=first_area.id,
                        access_type="entry",
                        status="granted"
                    )
                ]
                
                for log in sample_logs:
                    crud.create_access_log(db, log)
                
                print('✅ Logs de acesso de exemplo criados')
        
        print('🎉 Dados iniciais criados com sucesso!')
            
    except Exception as e:
        print(f'❌ Erro ao criar dados iniciais: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    create_initial_data()