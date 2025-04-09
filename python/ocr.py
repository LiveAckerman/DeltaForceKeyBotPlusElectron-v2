from paddleocr import PaddleOCR
import sys

def recognize_text(image_path):
    ocr = PaddleOCR(use_angle_cls=True, lang='ch')  # 支持中文
    result = ocr.ocr(image_path, cls=True)
    for line in result[0]:
        print(line[1][0])  # 打印识别到的文字

if __name__ == "__main__":
    image_path = sys.argv[1]  # 从命令行参数获取图片路径
    recognize_text(image_path)