import os
import shutil
import argparse
from distutils.dir_util import copy_tree
from distutils.errors import DistutilsFileError

# --- CẤU HÌNH ĐƯỜNG DẪN ---
# Thay đổi các đường dẫn này cho phù hợp với cấu trúc của bạn
# Thư mục A: Nơi thư viện được sử dụng trong ứng dụng (đích)
DIR_A = "/Users/tonypham/MEGA/WebApp/WIP/Library/react-quiz-kit/src/lib/interactive-quiz-kit"

# Thư mục B:  Nơi bạn phát triển thư viện (nguồn)
DIR_B = "/Users/tonypham/MEGA/WebApp/WIP/Library/interactive-quiz-kit/src"
# -------------------------

# --- CÁC THƯ MỤC/FILE CẦN BỎ QUA ---
# Thêm các tên thư mục hoặc file bạn không muốn đồng bộ vào đây
IGNORE_PATTERNS = shutil.ignore_patterns(
    'node_modules',
    '.next',
    'dist',
    '*.log',
    '*.lock',
    '.DS_Store'
)
# ------------------------------------

def sync_directories(src, dst, direction):
    """
    Đồng bộ hóa nội dung từ thư mục nguồn (src) đến thư mục đích (dst).
    Ghi đè các file hiện có.
    """
    print("="*50)
    print(f"Bắt đầu đồng bộ hóa: {direction}")
    print(f"  Từ (Nguồn): {src}")
    print(f"  Đến (Đích) : {dst}")
    print("="*50)

    if not os.path.isdir(src):
        print(f"\n[LỖI] Thư mục nguồn không tồn tại: {src}")
        return

    # Tạo thư mục đích nếu nó chưa tồn tại
    if not os.path.isdir(dst):
        print(f"Thư mục đích không tồn tại. Đang tạo: {dst}")
        os.makedirs(dst)

    try:
        # Sử dụng copy_tree để sao chép và ghi đè
        # `update=1` có nghĩa là chỉ sao chép các file mới hơn
        # `verbose=1` để in ra các file đang được sao chép
        copy_tree(src, dst, verbose=1)
        
        # Nếu bạn muốn ghi đè hoàn toàn mà không cần kiểm tra thời gian,
        # bạn có thể xóa thư mục đích trước, nhưng hãy cẩn thận!
        # print(f"Đang xóa thư mục đích để ghi đè hoàn toàn: {dst}")
        # shutil.rmtree(dst, ignore_errors=True)
        # shutil.copytree(src, dst, ignore=IGNORE_PATTERNS)

        print("\n[THÀNH CÔNG] Đồng bộ hóa hoàn tất!")

    except DistutilsFileError as e:
        print(f"\n[LỖI] Đã xảy ra lỗi trong quá trình sao chép: {e}")
    except Exception as e:
        print(f"\n[LỖI] Đã xảy ra một lỗi không mong muốn: {e}")


def main():
    """
    Hàm chính để phân tích các đối số dòng lệnh và gọi hàm đồng bộ.
    """
    parser = argparse.ArgumentParser(
        description="Đồng bộ hóa nội dung giữa hai thư mục.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    
    parser.add_argument(
        'direction',
        choices=['a_to_b', 'b_to_a'],
        help="Chiều đồng bộ hóa:\n"
             "  a_to_b: Sao chép từ Thư mục A (app) sang Thư mục B (library source).\n"
             "  b_to_a: Sao chép từ Thư mục B (library source) sang Thư mục A (app)."
    )

    args = parser.parse_args()

    if args.direction == 'a_to_b':
        sync_directories(DIR_A, DIR_B, "A -> B")
    elif args.direction == 'b_to_a':
        sync_directories(DIR_B, DIR_A, "B -> A")

if __name__ == "__main__":
    main()