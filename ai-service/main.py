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

# Tự động nhận diện model mới
# Bạn chỉ cần đổi tên file model của bạn thành "custom_model.pt" và thả vào thư mục này,
# server sẽ tự động ưu tiên load file "custom_model.pt" thay vì file cũ.
CUSTOM_MODEL_PATH = "custom_model.pt"
DEFAULT_MODEL_PATH = "yolov8n-waste-12cls-best.pt"

if os.path.exists(CUSTOM_MODEL_PATH):
    model_path = CUSTOM_MODEL_PATH
else:
    model_path = DEFAULT_MODEL_PATH

print(f"=====================================")
print(f" LOADING MODEL: {model_path}")
print(f"=====================================")

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
    
    # Tọa độ hộp bao chuẩn hóa [x_min, y_min, x_max, y_max]
    bbox = boxes.xyxyn[0].tolist()

    mapping_info = get_mapping(label)

    return {
        "label": label,
        "confidence": round(conf, 4),
        "modelName": "YOLOv8",
        "modelVersion": "v8n",
        "boundingBox": bbox,
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

@app.post("/upload-model")
async def upload_model(file: UploadFile = File(...)):
    global model, model_path
    if not file.filename.endswith(".pt") and not file.filename.endswith(".bin"):
        return {"success": False, "message": "Only .pt or .bin files are allowed."}
    
    # Save with its original extension
    ext = os.path.splitext(file.filename)[1]
    new_model_path = f"uploaded_model{ext}"
    
    with open(new_model_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        model = YOLO(new_model_path)
        model_path = new_model_path
        return {"success": True, "message": f"Successfully loaded {file.filename} as the active model."}
    except Exception as e:
        return {"success": False, "message": f"Failed to load model: {str(e)}"}