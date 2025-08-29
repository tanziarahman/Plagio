from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint,Text
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
    upload_type = Column(String, CheckConstraint("upload_type IN ('text', 'code','ai')"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="uploads")
    files = relationship("File", back_populates="upload", cascade="all, delete-orphan")
    avg_similarities = relationship("AvgSimilarity", back_populates="upload", cascade="all, delete-orphan")



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
    
    ai_results = relationship("AIDetectionResult", backref="file", cascade="all, delete-orphan")

    
    

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
    matches = relationship("MatchItem", back_populates="comparison", cascade="all, delete-orphan")
    match_codes = relationship("MatchCode", back_populates="comparison")

    # # __table_args__ = (
    # #     UniqueConstraint('file1_id', 'file2_id', name='unique_pair'),
    # )
    
    
class AvgSimilarity(db.Model):
    __tablename__ = 'AvgSimilarity'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    upload_id = db.Column(db.Integer, db.ForeignKey('Uploads.upload_id', ondelete='CASCADE'), nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey('Files.file_id', ondelete='CASCADE'), nullable=True)  # optional
    average_similarity = db.Column(db.Float, nullable=False)
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)

    upload = db.relationship("Upload", back_populates="avg_similarities")
    file = db.relationship("File")



class MatchCode(db.Model):
    __tablename__ = 'MatchCodes'

    match_id = Column(Integer, primary_key=True, autoincrement=True)
    comparison_id = Column(Integer, ForeignKey('Comparisons.comparison_id', ondelete='CASCADE'))

    file1_id = Column(Integer, ForeignKey('Files.file_id', ondelete='CASCADE'), nullable=False)
    file1_start = Column(Integer, nullable=False)
    file1_end = Column(Integer, nullable=False)

    file2_id = Column(Integer, ForeignKey('Files.file_id', ondelete='CASCADE'), nullable=False)
    file2_start = Column(Integer, nullable=False)
    file2_end = Column(Integer, nullable=False)

    comparison = relationship("Comparison", backref="match_codes")
    file1 = relationship("File", foreign_keys=[file1_id])
    file2 = relationship("File", foreign_keys=[file2_id])




class MatchItem(db.Model):
    __tablename__ = 'MatchItems'

    id = Column(Integer, primary_key=True, autoincrement=True)
    comparison_id = Column(Integer, ForeignKey('Comparisons.comparison_id', ondelete='CASCADE'), nullable=False)

    match_type = Column(String(50))      
    word_count = Column(Integer)
    index_start = Column(Integer)
    length = Column(Integer)

    comparison = relationship("Comparison", back_populates="matches")
    
    
class AIDetectionResult(db.Model):
    _tablename_ = 'AIDetectionResults'

    detection_id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey('Files.file_id', ondelete='CASCADE'), nullable=False, unique=True)
    ai_percentage = Column(Float, nullable=False)          
    score_html = Column(Text, nullable=False)              
    detected_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("File", backref="ai_results")


# class AIDetectionResult(db.Model):
#     __tablename__ = 'AIDetectionResults'

#     detection_id = Column(Integer, primary_key=True, autoincrement=True)
#     file_id = Column(Integer, ForeignKey('Files.file_id', ondelete='CASCADE'), nullable=False)
#     ai_percentage = Column(Float, nullable=False)
#     detected_at = Column(DateTime, default=datetime.utcnow)

#     file = relationship("File", backref="ai_result")
#     sentences = relationship("AISentenceScore", back_populates="detection", cascade="all, delete-orphan")


# class AISentenceScore(db.Model):
#     __tablename__ = 'AISentenceScores'

#     id = Column(Integer, primary_key=True, autoincrement=True)
#     detection_id = Column(Integer, ForeignKey('AIDetectionResults.detection_id', ondelete='CASCADE'), nullable=False)
#     text = Column(Text, nullable=False)
#     score = Column(Float, nullable=False)  # 100 means very AI-like

#     detection = relationship("AIDetectionResult", back_populates="sentences")


# class MatchedLine(db.Model):
#     __tablename__ = 'MatchedLines'

#     match_id = Column(Integer, primary_key=True, autoincrement=True)
#     comparison_id = Column(Integer, ForeignKey('Comparisons.comparison_id', ondelete='CASCADE'), nullable=False)
#     file1_line = Column(Integer, nullable=False)
#     file2_line = Column(Integer, nullable=False)

#     comparison = relationship("Comparison", back_populates="matches")
    
    
    
