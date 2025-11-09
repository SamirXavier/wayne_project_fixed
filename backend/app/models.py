from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base
import datetime

# Tabela de associação para áreas de acesso
user_accessible_areas = Table('user_accessible_areas', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('area_id', Integer, ForeignKey('restricted_areas.id'))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    refresh_tokens = relationship('RefreshToken', back_populates='user')
    accessible_areas = relationship('RestrictedArea', secondary=user_accessible_areas, back_populates='authorized_users')
    access_logs = relationship('AccessLog', back_populates='user')

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, index=True)
    details = Column(Text, nullable=True)
    status = Column(String, default="available")  # available, in_use, maintenance
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship('User', back_populates='refresh_tokens')

class RestrictedArea(Base):
    __tablename__ = "restricted_areas"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    security_level = Column(String, default="medium")  # low, medium, high, critical
    location = Column(String, nullable=True)
    authorized_users = relationship('User', secondary=user_accessible_areas, back_populates='accessible_areas')
    access_logs = relationship('AccessLog', back_populates='area')

class AccessLog(Base):
    __tablename__ = "access_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    area_id = Column(Integer, ForeignKey('restricted_areas.id'))
    access_time = Column(DateTime, default=datetime.datetime.utcnow)
    access_type = Column(String, default="entry")  # entry, exit
    status = Column(String, default="granted")  # granted, denied
    user = relationship('User', back_populates='access_logs')
    area = relationship('RestrictedArea', back_populates='access_logs')