from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from ultralytics import YOLO
import urllib.request
import io
from PIL import Image

app = FastAPI()

# import os
# model_path = "best.pt" if os.path.exists("best.pt") else "yolov8n.pt"
model_path = "yolov8n-waste-12cls-best.pt"

model = YOLO(model_path)

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
        "biological": ("Rác sinh học", "OTHER", "BIN", "Dùng để ủ phân xanh trồng cây hoặc làm thức ăn gia súc."),
        "brown-glass": ("Thủy tinh nâu", "GLASS", "BIN", "Tránh làm vỡ, cẩn thận khi vứt vào thùng rác tái chế."),
        "cardboard": ("Bìa Carton", "PAPER", "BIN", "Gấp gọn hoặc làm bẹp trước khi vứt vào thùng rác tái chế."),
        "clothes": ("Quần áo", "OTHER", "CENTER", "Có thể quyên góp nếu còn dùng được, hoặc mang tới trung tâm xử lý."),
        "green-glass": ("Thủy tinh xanh lá", "GLASS", "BIN", "Tránh làm vỡ, cẩn thận khi vứt vào thùng rác tái chế."),
        "metal": ("Kim loại", "METAL", "BIN", "Thu gom vào thùng rác tái chế."),
        "paper": ("Giấy", "PAPER", "BIN", "Giữ giấy khô ráo để tái chế tốt nhất."),
        "plastic": ("Nhựa", "PLASTIC", "BIN", "Đổ hết nước, làm sạch trước khi tái chế."),
        "shoes": ("Giày dép", "OTHER", "CENTER", "Có thể quyên góp hoặc vứt rác vô cơ."),
        "trash": ("Rác tổng hợp", "OTHER", "BIN", "Rác không thể tái chế, bỏ vào thùng rác thường."),
        "white-glass": ("Thủy tinh trắng", "GLASS", "BIN", "Tránh làm vỡ, cẩn thận khi vứt vào thùng rác tái chế."),
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
            "label": "unknown",
            "displayLabel": "Không nhận diện được đồ vật",
            "confidence": 0,
            "wasteType": "OTHER",
            "suggestedBin": "BIN",
            "instruction": "Chụp rõ hơn hoặc thử góc khác nhé."
        }

    # Lấy class tự tin nhất
    cls_id = int(boxes.cls[0])
    conf = float(boxes.conf[0])
    label = model.names[cls_id]

    mapping_info = get_mapping(label)

    return {
        "label": label,
        "confidence": round(conf, 4),
        "modelName": "YOLOv8",
        "modelVersion": "v8n",
        **mapping_info
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/predict")
async def predict_file(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    results = model(img)
    return process_results(results)

@app.post("/predict-url")
async def predict_url(req: PredictUrlRequest):
    req_http = urllib.request.Request(req.imageUrl, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_http) as response:
        img_data = response.read()
    img = Image.open(io.BytesIO(img_data)).convert("RGB")
    results = model(img)
    return process_results(results)