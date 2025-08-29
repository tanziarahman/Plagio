import os
import mosspy
import requests
from bs4 import BeautifulSoup
import re
import time
from urllib.parse import urljoin

def perform_code_comparison(folder_path, language=None):
    """
    Performs MOSS code comparison for all code files in a folder.
    Returns results and report URL without saving anything to the database.
    """
    if not os.path.isdir(folder_path):
        return {"error": f"Folder '{folder_path}' does not exist"}

    # Collect all code files
    supported_extensions = ('.py', '.c', '.cpp', '.java', '.js', '.cs', '.php', '.rb', '.go')
    file_paths = [os.path.join(folder_path, f) for f in os.listdir(folder_path)
                  if f.lower().endswith(supported_extensions) and os.path.isfile(os.path.join(folder_path, f))]

    print(f"Found {len(file_paths)} files: {[os.path.basename(f) for f in file_paths]}")

    if len(file_paths) < 2:
        return {"error": "At least two code files are required in the folder"}

    # Detect language if not provided
    if not language:
        first_ext = os.path.splitext(file_paths[0])[1].lower()
        extension_language_map = {
            '.py': 'python', '.c': 'c', '.cpp': 'cpp', '.java': 'java',
            '.js': 'javascript', '.cs': 'csharp',
            '.php': 'php', '.rb': 'ruby', '.go': 'go'
        }
        language = extension_language_map.get(first_ext)
        if not language:
            return {"error": f"Unsupported file extension '{first_ext}'"}

    print(f"Using language: {language}")

    try:
        # Initialize MOSS and send files
        m = mosspy.Moss(266483722, language)
        for file_path in file_paths:
            print(f"Adding file: {os.path.basename(file_path)}")
            m.addFile(file_path)
        
        print("Sending files to MOSS...")
        report_url = m.send()
        print(f"MOSS Report URL: {report_url}")

        # Add delay to ensure MOSS report is ready
        time.sleep(3)

        # Parse report
        response = requests.get(report_url)
        html = response.text
        soup = BeautifulSoup(html, "html.parser")

        results = []
        table = soup.find("table")
        
        if not table:
            print("No table found in MOSS report!")
            return {
                "message": "No similarities found",
                "report_url": report_url,
                "total_comparisons": 0,
                "results": []
            }

        # Parse each comparison row
        for row in table.find_all("tr")[1:]:  # Skip header row
            cols = row.find_all("td")
            if len(cols) >= 2:
                file1_text = cols[0].get_text(strip=True)
                file2_text = cols[1].get_text(strip=True)

                # Extract filenames from both columns
                file1_match = re.search(r'([^/\\]+)\.\w+ \(', file1_text)
                file2_match = re.search(r'([^/\\]+)\.\w+ \(', file2_text)
                
                if file1_match and file2_match:
                    file1_name = file1_match.group(1)
                    file2_name = file2_match.group(1)

                    if file1_name != file2_name:
                        # Extract similarity percentages from both directions
                        match1 = re.search(r'\((\d+)%\)', file1_text)
                        match2 = re.search(r'\((\d+)%\)', file2_text)
                        
                        # Calculate similarities with +3 adjustment
                        similarity_1_to_2 = int(match1.group(1)) + 3 if match1 else 3
                        similarity_2_to_1 = int(match2.group(1)) + 3 if match2 else 3
                        
                        # Cap at 100%
                        similarity_1_to_2 = min(similarity_1_to_2, 100)
                        similarity_2_to_1 = min(similarity_2_to_1, 100)

                        # Get detail URLs for both directions
                        detail_link_1 = cols[0].find("a")
                        detail_link_2 = cols[1].find("a")
                        
                        detail_url_1 = None
                        detail_url_2 = None
                        highlights_1_to_2 = {"matches": []}
                        highlights_2_to_1 = {"matches": []}

                        if detail_link_1 and detail_link_1.get("href"):
                            detail_url_1 = urljoin(report_url, detail_link_1['href'])
                            print(f"Analyzing: {file1_name} -> {file2_name} ({similarity_1_to_2}%)")
                            highlights_1_to_2 = get_code_file_highlights(detail_url_1)
                        
                        if detail_link_2 and detail_link_2.get("href"):
                            detail_url_2 = urljoin(report_url, detail_link_2['href'])
                            print(f"Analyzing: {file2_name} -> {file1_name} ({similarity_2_to_1}%)")
                            highlights_2_to_1 = get_code_file_highlights(detail_url_2)

                        # Add both comparison directions to results
                        results.append({
                            "file1_name": file1_name,
                            "file2_name": file2_name,
                            "similarity_1_to_2": similarity_1_to_2,
                            "similarity_2_to_1": similarity_2_to_1,
                            "matches_1_to_2": highlights_1_to_2.get("matches", []),
                            "matches_2_to_1": highlights_2_to_1.get("matches", []),
                            "detail_url_1_to_2": detail_url_1,
                            "detail_url_2_to_1": detail_url_2
                        })

        print(f"Found {len(results)} comparison pairs")
        return {
            "message": "Code comparison completed successfully",
            "report_url": report_url,
            "total_comparisons": len(results),
            "results": results
        }

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return {"error": f'Comparison failed: {str(e)}'}

def get_code_file_highlights(report_url):
    """
    Extract highlighted code parts from a MOSS report for a single comparison.
    Returns matched line ranges for both files.
    """
    try:
        response = requests.get(report_url, timeout=15)
        response.raise_for_status()
        html = response.text
        
    except Exception as e:
        return {"error": f"Failed to fetch MOSS detail report: {str(e)}"}

    soup = BeautifulSoup(html, "html.parser")
    
    # Method 1: Look for line numbers in the most common patterns
    matches = parse_moss_line_numbers(html)
    
    # If no matches found, try alternative parsing methods
    if not matches:
        matches = parse_alternative_structures(soup)
    
    return {"matches": matches}

def parse_moss_line_numbers(html):
    """Parse line numbers from MOSS HTML using regex patterns"""
    matches = []
    
    # Common MOSS patterns for line numbers
    patterns = [
        r'line[_\s]*(\d+)',      # line 123, line_123
        r'\((\d+)\)',            # (123)
        r'\[(\d+)\]',            # [123]
        r'>(\d+)<',              # >123<
        r'\.\.\.(\d+)',          # ...123
        r'\b(\d{2,4})\b',        # standalone numbers (2-4 digits)
    ]
    
    all_line_numbers = []
    
    for pattern in patterns:
        line_numbers = re.findall(pattern, html, re.IGNORECASE)
        if line_numbers:
            # Convert to integers and filter reasonable line numbers
            numbers = [int(num) for num in line_numbers if 1 <= int(num) <= 9999]
            all_line_numbers.extend(numbers)
    
    # Remove duplicates and sort
    all_line_numbers = sorted(set(all_line_numbers))
    
    print(f"Found {len(all_line_numbers)} unique line numbers")
    
    # Pair line numbers (assuming they alternate between file1 and file2)
    for i in range(0, len(all_line_numbers) - 1, 2):
        if i + 1 < len(all_line_numbers):
            matches.append({
                "file1_start": all_line_numbers[i],
                "file1_end": all_line_numbers[i],
                "file2_start": all_line_numbers[i + 1],
                "file2_end": all_line_numbers[i + 1]
            })
    
    return matches

def parse_alternative_structures(soup):
    """Alternative parsing methods for different MOSS formats"""
    matches = []
    
    # Look for tables with code
    tables = soup.find_all('table')
    for table in tables:
        # Look for rows with highlighting
        rows = table.find_all('tr')
        for row_num, row in enumerate(rows, 1):
            # Check for highlighting
            highlighted = False
            if (row.find(style=re.compile(r'background', re.I)) or 
                row.find(class_=re.compile(r'moss|highlight', re.I))):
                highlighted = True
            
            if highlighted:
                # Try to extract line number from row text
                row_text = row.get_text()
                line_match = re.search(r'(\d+)', row_text)
                if line_match:
                    line_num = int(line_match.group(1))
                    # Simple pairing based on row order
                    matches.append({
                        "file1_start": line_num,
                        "file1_end": line_num,
                        "file2_start": line_num,
                        "file2_end": line_num
                    })
    
    return matches

# ===== Utility function to display results nicely =====
def print_comparison_results(results):
    """Pretty print the comparison results"""
    if "error" in results:
        print(f"Error: {results['error']}")
        return
    
    print(f"\n{'='*80}")
    print("MOSS CODE COMPARISON RESULTS (BIDIRECTIONAL)")
    print(f"{'='*80}")
    print(f"Report URL: {results.get('report_url', 'N/A')}")
    print(f"Total comparison pairs: {results.get('total_comparisons', 0)}")
    print(f"{'='*80}")
    
    for i, result in enumerate(results.get('results', []), 1):
        print(f"\n{i}. {result['file1_name']} <-> {result['file2_name']}")
        print(f"   {result['file1_name']} -> {result['file2_name']}: {result['similarity_1_to_2']}%")
        print(f"   {result['file2_name']} -> {result['file1_name']}: {result['similarity_2_to_1']}%")
        
        if result['matches_1_to_2']:
            print(f"   Matched line ranges ({result['file1_name']} -> {result['file2_name']}):")
            for match in result['matches_1_to_2']:
                print(f"     {result['file1_name']}: lines {match['file1_start']}-{match['file1_end']}")
                print(f"     {result['file2_name']}: lines {match['file2_start']}-{match['file2_end']}")
        
        if result['matches_2_to_1']:
            print(f"   Matched line ranges ({result['file2_name']} -> {result['file1_name']}):")
            for match in result['matches_2_to_1']:
                print(f"     {result['file2_name']}: lines {match['file1_start']}-{match['file1_end']}")
                print(f"     {result['file1_name']}: lines {match['file2_start']}-{match['file2_end']}")
        
        if not result['matches_1_to_2'] and not result['matches_2_to_1']:
            print("   No specific line matches extracted")