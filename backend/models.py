from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import  relationship

from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'Users'
    
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
  # created_at = Column(DateTime, default=datetime.utcnow)

    uploads = relationship("Upload", back_populates="user")
    
class Upload(db.Model):
    __tablename__ = 'Uploads'
    
    upload_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('Users.user_id'), nullable=False)
    session_name = Column(String(255))  # Added to replace UploadSession
    upload_path = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="uploads")
    files = relationship("File", back_populates="upload")


class File(db.Model):
    __tablename__ = 'Files'
    
    file_id = Column(Integer, primary_key=True, autoincrement=True)
    upload_id = Column(Integer, ForeignKey('Uploads.upload_id'), nullable=False)
    original_name = Column(String(255), nullable=False)
    stored_name = Column(String(255), nullable=False)  # e.g., "uuid.txt"
    file_path = Column(String(512), nullable=False)    # e.g., "uploads/1/uuid.txt"
  #  content_hash = Column(String(64), nullable=False)  # SHA-256 hash
  #  content = Column(Text, nullable=False)             # Actual text content
    upload_time = Column(DateTime, default=datetime.utcnow)

    upload = relationship("Upload", back_populates="files")
    source_comparisons = relationship("Comparison", foreign_keys='Comparison.file1_id',back_populates="file1")
    target_comparisons = relationship("Comparison", foreign_keys='Comparison.file2_id', back_populates="file2")


class Comparison(db.Model):
    __tablename__ = 'Comparisons'
    
    comparison_id = Column(Integer, primary_key=True, autoincrement=True)
    file1_id = Column(Integer, ForeignKey('Files.file_id', ondelete='CASCADE'), nullable=False)
    file2_id = Column(Integer, ForeignKey('Files.file_id', ondelete='CASCADE'), nullable=False)
    plagiarism_percent = Column(Float, nullable=False)
    comparison_type = Column(String, CheckConstraint("comparison_type IN ('text', 'code')"), nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow)

    file1 = relationship("File", foreign_keys=[file1_id], back_populates="comparisons1")
    file2 = relationship("File", foreign_keys=[file2_id], back_populates="comparisons2")
    matches = relationship("MatchedLine", back_populates="comparison")

    __table_args__ = (
        UniqueConstraint('file1_id', 'file2_id', name='unique_pair'),
        #CheckConstraint('file1_id < file2_id', name='check_file_order')
    )


class MatchedLine(db.Model):
    __tablename__ = 'MatchedLines'
    
    match_id = Column(Integer, primary_key=True, autoincrement=True)
    comparison_id = Column(Integer, ForeignKey('Comparisons.comparison_id', ondelete='CASCADE'), nullable=False)
    file1_line = Column(Integer, nullable=False)
    file2_line = Column(Integer, nullable=False)
    #line_content = Column(Text, nullable=False)

    comparison = relationship("Comparison", back_populates="matches")