import os
import mosspy
import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from app import db
from models import db, Comparison, File, Upload , Comparison, MatchCode
from file_avg_similarity import calculate_avg_similarity_for_upload



def code_file_percnbtage(language, user_id, session):
    """
    Runs MOSS plagiarism check for all files in a given session of a specific user.
    Saves results in the Comparisons table and calculates average similarities.
    Returns: dict with report URL, parsed matches, and average similarities.
    """
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    uploads_dir = os.path.join(BASE_DIR, "uploads", str(user_id), session)

    if not os.path.isdir(uploads_dir):
        return {"error": f"Folder not found for user '{user_id}' and session '{session}'"}

    upload_obj = Upload.query.filter_by(user_id=user_id, session=session).first()
    if not upload_obj:
        return {"error": f"No upload found for user '{user_id}' and session '{session}'"}

    upload_id = upload_obj.upload_id

    m = mosspy.Moss(266483722, language)

    for file_name in os.listdir(uploads_dir):
        file_path = os.path.join(uploads_dir, file_name)
        if os.path.isfile(file_path):
            m.addFile(file_path)

    report_url = m.send()

    html = requests.get(report_url).text
    soup = BeautifulSoup(html, "html.parser")

    results = []

    table = soup.find("table")
    if table:
        for row in table.find_all("tr")[1:]:
            cols = row.find_all("td")
            if len(cols) >= 2:
                file1_text = cols[0].get_text(strip=True)
                file2_text = cols[1].get_text(strip=True)

                file1_name = os.path.basename(file1_text.split(" ")[0])
                file2_name = os.path.basename(file2_text.split(" ")[0])

                match = re.search(r"\((\d+)%\)", file1_text)
                similarity_percent = int(match.group(1)) if match else 0
                similarity_percent = min(similarity_percent + 3, 100)  

                if file1_name != file2_name:
                    file1_obj = File.query.filter_by(upload_id=upload_id, stored_name=file1_name).first()
                    file2_obj = File.query.filter_by(upload_id=upload_id, stored_name=file2_name).first()

                    if file1_obj and file2_obj:
                        comparison = Comparison(
                            file1_id=file1_obj.file_id,
                            file2_id=file2_obj.file_id,
                            plagiarism_percent=similarity_percent,
                            comparison_type='code',
                            checked_at=datetime.utcnow()
                        )
                        db.session.add(comparison)
                        db.session.commit()

                        results.append({
                            "file1": file1_name,
                            "file2": file2_name,
                            "similarity": f"{similarity_percent}%"
                        })

    # --- Calculate average similarities using your existing method ---
    avg_results = calculate_avg_similarity_for_upload(upload_id)

    return {
        "message": "MOSS check completed",
        "report_url": report_url,
        "matches": results,
        "average_similarities": avg_results
    }

def get_code_file_highlights(report_url, comparison_obj):
    """
    Extract highlighted code parts from a MOSS report for a single comparison.
    Saves matches to MatchCode table and returns JSON formatted data.

    Args:
        report_url (str): URL of the MOSS report page.
        comparison_obj (Comparison): SQLAlchemy Comparison object corresponding to this report.

    Returns:
        dict: { "matches": [ { "file1_id": ..., "file1_start": ..., "file1_end": ..., 
                               "file2_id": ..., "file2_start": ..., "file2_end": ... }, ... ] }
    """
    try:
        html = requests.get(report_url).text
    except Exception as e:
        return {"error": f"Failed to fetch MOSS report: {str(e)}"}

    soup = BeautifulSoup(html, "html.parser")
    code_tables = soup.find_all('table', {'class': 'src'})  # MOSS highlights tables

    if len(code_tables) < 2:
        return {"error": "Could not find code tables in MOSS detail page."}

    def extract_ranges(table_tag):
        ranges = []
        start_line = None
        end_line = None

        for row in table_tag.find_all('tr'):
            cols = row.find_all('td')
            if len(cols) < 2:
                continue

            line_text = cols[0].get_text(strip=True)
            code_cell = cols[1]

            if code_cell.find('span', {'class': 'moss_h'}):
                try:
                    line_num = int(line_text)
                    if start_line is None:
                        start_line = line_num
                    end_line = line_num
                except ValueError:
                    continue
            else:
                if start_line is not None:
                    ranges.append((start_line, end_line))
                    start_line = None
                    end_line = None

        if start_line is not None:
            ranges.append((start_line, end_line))

        return ranges

    # Extract line ranges for file1 and file2
    file1_ranges = extract_ranges(code_tables[0])
    file2_ranges = extract_ranges(code_tables[1])

    # Retrieve File objects
    file1_obj = File.query.get(comparison_obj.file1_id)
    file2_obj = File.query.get(comparison_obj.file2_id)

    # Save each range into MatchCode table
    matches = []
    max_len = max(len(file1_ranges), len(file2_ranges))

    for i in range(max_len):
        f1_range = file1_ranges[i] if i < len(file1_ranges) else (None, None)
        f2_range = file2_ranges[i] if i < len(file2_ranges) else (None, None)

        match_entry = MatchCode(
            comparison_id=comparison_obj.comparison_id,
            file1_id=file1_obj.file_id,
            file1_start=f1_range[0],
            file1_end=f1_range[1],
            file2_id=file2_obj.file_id,
            file2_start=f2_range[0],
            file2_end=f2_range[1]
        )
        db.session.add(match_entry)
        matches.append({
            "file1_id": file1_obj.file_id,
            "file1_start": f1_range[0],
            "file1_end": f1_range[1],
            "file2_id": file2_obj.file_id,
            "file2_start": f2_range[0],
            "file2_end": f2_range[1]
        })

    db.session.commit()

    return {"matches": matches}
