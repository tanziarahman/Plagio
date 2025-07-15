from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'Users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

    uploads = relationship("Upload", back_populates="user",cascade="all, delete-orphan")


class Upload(db.Model):
    __tablename__ = 'Uploads'

    upload_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('Users.id'), nullable=False)
    session_name = Column(String(255))
    # upload_path = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="uploads")
    files = relationship("File", back_populates="upload", cascade="all, delete-orphan")


class File(db.Model):
    __tablename__ = 'Files'

    file_id = Column(Integer, primary_key=True, autoincrement=True)
    upload_id = Column(Integer, ForeignKey('Uploads.upload_id', ondelete='CASCADE'), nullable=False)
    original_name = Column(String(255), nullable=False)
    stored_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow)

    upload = relationship("Upload", back_populates="files")

    comparisons_as_source = relationship("Comparison", foreign_keys='Comparison.file1_id',
                                         back_populates="file1", cascade="all, delete-orphan")

    comparisons_as_target = relationship("Comparison", foreign_keys='Comparison.file2_id',
                                         back_populates="file2", cascade="all, delete-orphan")




class Comparison(db.Model):
    __tablename__ = 'Comparisons'

    comparison_id = Column(Integer, primary_key=True, autoincrement=True)
    file1_id = Column(Integer, ForeignKey('Files.file_id', ondelete='CASCADE'), nullable=False)
    file2_id = Column(Integer, ForeignKey('Files.file_id', ondelete='CASCADE'), nullable=False)
    plagiarism_percent = Column(Float, nullable=False)
    comparison_type = Column(String, CheckConstraint("comparison_type IN ('text', 'code')"), nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow)

    file1 = relationship("File", foreign_keys=[file1_id], back_populates="comparisons_as_source")
    file2 = relationship("File", foreign_keys=[file2_id], back_populates="comparisons_as_target")
    matches = relationship("MatchedLine", back_populates="comparison", cascade="all, delete-orphan")

    # # __table_args__ = (
    # #     UniqueConstraint('file1_id', 'file2_id', name='unique_pair'),
    # )


class MatchedLine(db.Model):
    __tablename__ = 'MatchedLines'

    match_id = Column(Integer, primary_key=True, autoincrement=True)
    comparison_id = Column(Integer, ForeignKey('Comparisons.comparison_id', ondelete='CASCADE'), nullable=False)
    file1_line = Column(Integer, nullable=False)
    file2_line = Column(Integer, nullable=False)

    comparison = relationship("Comparison", back_populates="matches")
