import os
import mosspy
import requests
from bs4 import BeautifulSoup
import re
import time
from urllib.parse import urljoin

SUPPORTED_EXTENSIONS = ('.py', '.c', '.cpp', '.java', '.js', '.cs', '.php', '.rb', '.go')

LANGUAGE_MAP = {
    '.py': 'python', '.c': 'c', '.cpp': 'cpp', '.java': 'java',
    '.js': 'javascript', '.cs': 'csharp',
    '.php': 'php', '.rb': 'ruby', '.go': 'go'
}

def perform_code_comparison(folder_path, language=None):
    if not os.path.isdir(folder_path):
        return {"error": f"Folder '{folder_path}' does not exist"}

    file_paths = [os.path.join(folder_path, f) for f in os.listdir(folder_path)
                  if f.lower().endswith(SUPPORTED_EXTENSIONS) and os.path.isfile(os.path.join(folder_path, f))]
    print(f"Found {len(file_paths)} files: {[os.path.basename(f) for f in file_paths]}")

    if len(file_paths) < 2:
        return {"error": "At least two code files are required"}

    if not language:
        first_ext = os.path.splitext(file_paths[0])[1].lower()
        language = LANGUAGE_MAP.get(first_ext)
        if not language:
            return {"error": f"Unsupported file extension '{first_ext}'"}

    print(f"Using language: {language}")

    try:
        m = mosspy.Moss(266483722, language)
        for file_path in file_paths:
            print(f"Adding file: {os.path.basename(file_path)}")
            m.addFile(file_path)

        print("Sending files to MOSS...")
        report_url = m.send()
        print(f"MOSS Report URL: {report_url}")
        time.sleep(5)  # ensure MOSS report is ready

        # Parse report
        results = []
        for attempt in range(3):
            print(f"Attempt {attempt + 1}/3 to parse MOSS report...")
            results = parse_moss_report(report_url, file_paths, folder_path)
            if results:
                break
            time.sleep(3)

        print(f"Found {len(results)} comparison pairs")
        return {
            "message": "Code comparison completed successfully",
            "report_url": report_url,
            "total_comparisons": len(results),
            "results": results
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f'Comparison failed: {str(e)}'}



def parse_moss_report(report_url, file_paths, folder_path):
    try:
        response = requests.get(report_url)
        html = response.text

        with open("moss_report_debug.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("✅ Saved MOSS report HTML to 'moss_report_debug.html'")

        soup = BeautifulSoup(html, "html.parser")
        results = []

        tables = soup.find_all("table")
        print(f"Found {len(tables)} tables in the report")

        for table in tables:
            rows = table.find_all("tr")
            for row_idx, row in enumerate(rows):
                if row_idx == 0:  # skip header
                    continue

                cols = row.find_all("td")
                if len(cols) < 2:
                    continue

                col1_text, col2_text = cols[0].get_text(strip=True), cols[1].get_text(strip=True)
                file1_name, file2_name = extract_filename(col1_text), extract_filename(col2_text)

                if not (file1_name and file2_name and file1_name != file2_name):
                    continue

                sim1 = min(extract_similarity(col1_text) + 3, 100) if extract_similarity(col1_text) else 0
                sim2 = min(extract_similarity(col2_text) + 3, 100) if extract_similarity(col2_text) else 0

                detail_url_1 = urljoin(report_url, cols[0].find("a")["href"]) if cols[0].find("a") else None
                detail_url_2 = urljoin(report_url, cols[1].find("a")["href"]) if cols[1].find("a") else None

                matches_1_to_2 = extract_matches_from_detail(detail_url_1) if detail_url_1 else []
                matches_2_to_1 = extract_matches_from_detail(detail_url_2) if detail_url_2 else []
                
                file1_code, file2_code = "", ""
                if detail_url_1:
                    # Get the full file path by matching name
                    file1_full_path = next((f for f in file_paths if os.path.splitext(os.path.basename(f))[0] == file1_name), None)
                    file2_full_path = next((f for f in file_paths if os.path.splitext(os.path.basename(f))[0] == file2_name), None)

                    file1_code = fetch_full_code_from_file(file1_full_path) if file1_full_path else ""
                    file2_code = fetch_full_code_from_file(file2_full_path) if file2_full_path else ""



                results.append({
                    "file1_name": file1_name,
                    "file2_name": file2_name,
                    "similarity_1_to_2": sim1,
                    "similarity_2_to_1": sim2,
                    "matches_1_to_2": matches_1_to_2,
                     "matches_2_to_1": matches_2_to_1,
                    "detail_url_1_to_2": detail_url_1,
                    "detail_url_2_to_1": detail_url_2,
                    "file1_code": file1_code,
                    "file2_code": file2_code
                })
                print(f"    ✅ Added comparison: {file1_name} vs {file2_name}")

        return results

    except Exception as e:
        print(f"Error parsing MOSS report: {e}")
        return []



def extract_filename(text):
    match = re.search(r'([^/\\]+)\.\w+', text)
    return match.group(1) if match else None


def extract_similarity(text):
    match = re.search(r'\((\d+)%\)', text)
    return int(match.group(1)) if match else None

import requests
from bs4 import BeautifulSoup

def extract_matches_from_detail(detail_url):
    """
    Extract matched line numbers from a MOSS detail page.
    Returns a list of dicts with keys: file1_start, file1_end, file2_start, file2_end
    """
    matches = []

    try:
        # MOSS keeps line ranges in the "-top.html" page
        if not detail_url.endswith("-top.html"):
            detail_url = detail_url.replace(".html", "-top.html")

        response = requests.get(detail_url, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Find all <tr> rows (skip header)
        rows = soup.find_all("tr")[1:]
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 3:
                continue

            # Each side has an <a> tag like "1-6"
            file1_range = cols[0].find("a").get_text(strip=True).split("-")
            file2_range = cols[2].find("a").get_text(strip=True).split("-")

            if len(file1_range) == 2 and len(file2_range) == 2:
                matches.append({
                    "file1_start": int(file1_range[0]),
                    "file1_end": int(file1_range[1]),
                    "file2_start": int(file2_range[0]),
                    "file2_end": int(file2_range[1]),
                })

    except Exception as e:
        print(f"Failed to fetch detail report {detail_url}: {e}")

    return matches




def extract_lines_from_column(pre_tag):
    """
    Extract line numbers from a code column (<pre> tag)
    using <a name="line_number"> attributes (MOSS highlights matched lines this way)
    Returns a sorted list of integers.
    """
    lines = []
    for a in pre_tag.find_all("a"):
        if a.has_attr("name") and a["name"].isdigit():
            lines.append(int(a["name"]))
    return sorted(lines)


def group_consecutive(nums):
    """
    Group consecutive numbers into ranges. Example: [1,2,3,5,6] -> [(1,3),(5,6)]
    """
    if not nums:
        return []

    ranges = []
    start = prev = nums[0]

    for n in nums[1:]:
        if n == prev + 1:
            prev = n
        else:
            ranges.append((start, prev))
            start = prev = n
    ranges.append((start, prev))
    return ranges


def extract_line_range(text):
    """
    Convert a string like '1-6' into a tuple of integers (1, 6)
    """
    if '-' in text:
        parts = text.split('-')
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            return int(parts[0]), int(parts[1])
    return None

def fetch_full_code_from_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Failed to read {file_path}: {e}")
        return ""




def print_comparison_results(results):
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

        # Print matched line ranges
        if result['matches_1_to_2']:
            print(f"   Matched line ranges ({result['file1_name']} -> {result['file2_name']}):")
            for m in result['matches_1_to_2']:
                print(f"     {result['file1_name']}: lines {m['file1_start']}-{m['file1_end']}")
                print(f"     {result['file2_name']}: lines {m['file2_start']}-{m['file2_end']}")
        if result['matches_2_to_1']:
            print(f"   Matched line ranges ({result['file2_name']} -> {result['file1_name']}):")
            for m in result['matches_2_to_1']:
                print(f"     {result['file2_name']}: lines {m['file2_start']}-{m['file2_end']}")
                print(f"     {result['file1_name']}: lines {m['file1_start']}-{m['file1_end']}")
        if not result['matches_1_to_2'] and not result['matches_2_to_1']:
            print("   No specific line matches extracted")

        # Print full code for both files
        print(f"\nFull code of {result['file1_name']}:\n{result['file1_code']}")
        print(f"\nFull code of {result['file2_name']}:\n{result['file2_code']}")


        print(f"\n   Detail URLs: {result.get('detail_url_1_to_2', 'N/A')} | {result.get('detail_url_2_to_1', 'N/A')}")
        print(f"{'='*80}")



# def main():
#     folder_path = input("Enter the path to the folder containing code files: ").strip()
#     if not folder_path or not os.path.exists(folder_path):
#         print("Invalid folder path. Exiting.")
#         return

#     language_choice = input("Enter programming language (press Enter for auto-detect): ").strip()
#     language = language_choice if language_choice else None

#     print(f"\nStarting analysis of: {folder_path}")
#     if language:
#         print(f"Using language: {language}")
#     else:
#         print("Auto-detecting language...")

#     results = perform_code_comparison(folder_path, language)
#     print_comparison_results(results)

#     if 'results' in results and results['results']:
#         total_comparisons = len(results['results'])
#         avg_similarity = sum(max(r['similarity_1_to_2'], r['similarity_2_to_1']) for r in results['results']) / total_comparisons
#         highest_pair = max(results['results'], key=lambda x: max(x['similarity_1_to_2'], x['similarity_2_to_1']))
#         print(f"\nSummary:\nTotal comparisons: {total_comparisons}\nAverage similarity: {avg_similarity:.1f}%\nHighest similarity: {max(highest_pair['similarity_1_to_2'], highest_pair['similarity_2_to_1'])}% ({highest_pair['file1_name']} vs {highest_pair['file2_name']})")
#         print(f"MOSS Report URL: {results.get('report_url')}")


# if __name__ == "__main__":
#     main()


# def main():
#     folder_path = input("Enter the path to the folder containing code files: ").strip()
#     if not folder_path or not os.path.exists(folder_path):
#         print("Invalid folder path. Exiting.")
#         return

#     # List all supported code files
#     file_paths = [os.path.join(folder_path, f) for f in os.listdir(folder_path)
#                   if f.lower().endswith(SUPPORTED_EXTENSIONS) and os.path.isfile(os.path.join(folder_path, f))]

#     if not file_paths:
#         print("No supported code files found in the folder.")
#         return

#     # Print the content of each file
#     for file_path in file_paths:
#         file_name = os.path.basename(file_path)
#         code = fetch_full_code_from_file(file_path)
#         print(f"\n{'='*80}")
#         print(f"Full code of {file_name}:\n")
#         print(code)
#         print(f"{'='*80}\n")

# if __name__ == "__main__":
#     main()