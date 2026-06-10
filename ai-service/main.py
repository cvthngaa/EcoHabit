from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import urllib.request
import io
import shutil
from PIL import Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

DEFAULT_MODEL_PATH = "best1.pt"

print(f"=====================================")
print(f" LOADING MODEL: {DEFAULT_MODEL_PATH}")
print(f"=====================================")

model = YOLO(DEFAULT_MODEL_PATH)

class PredictUrlRequest(BaseModel):
    imageUrl: str


def get_mapping(label: str):
    label_lower = label.lower()
    
    # mapping = {
    #     "battery": ("Pin", "BATTERY", "COLLECTION_POINT", "Pin chứa hóa chất độc hại, cần mang tới điểm thu gom."),
    #     "cardboard": ("Bìa Carton", "PAPER", "BIN", "Gấp gọn hoặc làm bẹp trước khi vứt vào thùng rác tái chế."),
    #     "clothes": ("Quần áo", "OTHER", "CENTER", "Có thể quyên góp nếu còn dùng được, hoặc mang tới trung tâm xử lý."),
    #     "glass": ("Thủy tinh", "GLASS", "BIN", "Tránh làm vỡ, cẩn thận khi vứt vào thùng rác tái chế."),
    #     "metal": ("Kim loại", "METAL", "BIN", "Thu gom vào thùng rác tái chế."),
    #     "miscellaneous trash": ("Rác tổng hợp", "OTHER", "BIN", "Rác không thể tái chế, bỏ vào thùng rác thường."),
    #     "organic": ("Rác hữu cơ", "OTHER", "BIN", "Dùng để ủ phân xanh trồng cây hoặc làm thức ăn gia súc."),
    #     "paper": ("Giấy", "PAPER", "BIN", "Giữ giấy khô ráo để tái chế tốt nhất."),
    #     "plastic": ("Nhựa", "PLASTIC", "BIN", "Đổ hết nước, làm sạch trước khi tái chế."),
    #     "shoes": ("Giày dép", "OTHER", "CENTER", "Có thể quyên góp hoặc vứt rác vô cơ."),
    # }

    mapping = {
        "battery": ("Pin", "BATTERY", "COLLECTION_POINT", "Pin chứa hóa chất độc hại, cần mang tới điểm thu gom."),
        "paper": ("Giấy", "PAPER", "BIN", "Giữ giấy khô ráo để tái chế tốt nhất."),
        "plastic": ("Nhựa", "PLASTIC", "BIN", "Đổ hết nước, làm sạch trước khi tái chế."),
        "metal": ("Kim loại", "METAL", "BIN", "Thu gom vào thùng rác tái chế."),
        "glass": ("Thủy tinh", "GLASS", "BIN", "Tránh làm vỡ, cẩn thận khi vứt vào thùng rác tái chế."),
        "organic": ("Rác hữu cơ", "OTHER", "BIN", "Dùng để ủ phân xanh trồng cây hoặc làm thức ăn gia súc."),
        "e-waste": ("Rác điện tử", "E_WASTE", "COLLECTION_POINT", "Mang tới điểm thu gom rác điện tử để xử lý đúng cách."),
        "textile": ("Vải/Quần áo", "TEXTILE", "CENTER", "Có thể quyên góp nếu còn dùng được, hoặc mang tới trung tâm xử lý."),
        "other": ("Rác tổng hợp", "OTHER", "BIN", "Rác không thể tái chế, bỏ vào thùng rác thường."),
    }

    if "this dataset was exported" in label_lower or "roboflow" in label_lower:
        return {
            "displayLabel": "Không nhận diện được",
            "wasteType": "OTHER",
            "suggestedBin": "BIN",
            "instruction": "Chụp rõ hơn hoặc thử góc khác nhé."
        }

    if label_lower in mapping:
        v = mapping[label_lower]
        return {
            "displayLabel": v[0],
            "wasteType": v[1],
            "suggestedBin": v[2],
            "instruction": v[3],
        }
        
    return {
        "displayLabel": label.title(),
        "wasteType": "OTHER",
        "suggestedBin": "BIN",
        "instruction": "Chưa rõ phân loại, mặc định bỏ rác vô cơ.",
    }

def process_results(results):
    boxes = results[0].boxes
    if boxes is None or len(boxes) == 0:
        return {
            "success": True,
            "detections": []
        }

    detections = []
    for i in range(len(boxes)):
        cls_id = int(boxes.cls[i])
        conf = float(boxes.conf[i])
        label = model.names[cls_id]
        
        # Tọa độ hộp bao chuẩn hóa [x_min, y_min, x_max, y_max]
        bbox = boxes.xyxyn[i].tolist()
        
        mapping_info = get_mapping(label)
        detections.append({
            "label": label,
            "confidence": round(conf, 4),
            "modelName": "YOLOv8",
            "modelVersion": "best1",
            "boundingBox": bbox,
            **mapping_info
        })

    return {
        "success": True,
        "detections": detections
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/predict")
async def predict_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        results = model(img, conf=0.45)
        return process_results(results)
    except Exception as e:
        return {"success": False, "error": str(e), "message": "Failed to process image file."}

@app.post("/predict-url")
async def predict_url(req: PredictUrlRequest):
    try:
        req_http = urllib.request.Request(req.imageUrl, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_http) as response:
            img_data = response.read()
        img = Image.open(io.BytesIO(img_data)).convert("RGB")
        results = model(img, conf=0.45)
        return process_results(results)
    except Exception as e:
        return {"success": False, "error": str(e), "message": "Failed to process image from URL."}