from .upload_route import upload_bp
from .uploads_route import uploads_bp
from .compare_txt_file_route import compareTxtFile_bp
from .txt_file_comparison_result_route import txt_comparison_result_bp
from .dashboard_route import dashboard_bp
from .delete_route import delete_bp
from .home_route import home_bp
from .ai_detection_route import ai_detect_bp
from .ai_results_route import aiHistory_bp
from .avg_similarity_route import avgSimilarity_bp
from .code_file_comparison_route import code_comparison_result_bp
from .compare_code_file_route import compareCodeFile_bp
all_blueprints = [upload_bp, dashboard_bp, delete_bp, uploads_bp, home_bp, compareTxtFile_bp, txt_comparison_result_bp, ai_detect_bp, aiHistory_bp, avgSimilarity_bp, code_comparison_result_bp, compareCodeFile_bp]