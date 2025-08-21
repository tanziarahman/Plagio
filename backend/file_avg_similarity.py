from datetime import datetime
from sqlalchemy import func
from models import db, Comparison, AvgSimilarity, File

def calculate_avg_similarity_for_upload(upload_id):
    """
    Calculate average similarity for all files in a given upload.
    Stores/updates the results in AvgSimilarity table.
    Returns JSON-like list with upload_id included.
    """
    # Get all files in this upload
    files = File.query.filter_by(upload_id=upload_id).all()
    
    results = []

    for file in files:
        # Sum all comparisons where this file is file1 (source)
        avg = db.session.query(func.avg(Comparison.plagiarism_percent)).filter(
            Comparison.file1_id == file.file_id
        ).scalar() or 0.0

        # Check if record exists
        record = AvgSimilarity.query.filter_by(file_id=file.file_id, upload_id=upload_id).first()
        if record:
            record.average_similarity = avg
            record.calculated_at = datetime.utcnow()
        else:
            record = AvgSimilarity(
                file_id=file.file_id,
                upload_id=upload_id,
                average_similarity=avg
            )
            db.session.add(record)
        
        results.append({
            "upload_id": upload_id,
            "file_id": file.file_id,
            "file_name": file.original_name,
            "average_similarity": avg
        })

    db.session.commit()
    return results
