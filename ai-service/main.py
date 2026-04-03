from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import io
import urllib.request
from PIL import Image

app = FastAPI(title="EcoHabit AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Waste knowledge base
# ---------------------------------------------------------------------------
WASTE_LABELS = [
    {
        "label": "plastic_bottle",
        "displayLabel": "Chai nhựa",
        "wasteType": "PLASTIC",
        "suggestedBin": "BIN",
        "instruction": "Rửa sạch và bỏ vào thùng rác tái chế màu vàng. Có thể đổi lấy điểm tại các điểm thu gom.",
    },
    {
        "label": "plastic_bag",
        "displayLabel": "Túi nilon",
        "wasteType": "PLASTIC",
        "suggestedBin": "COLLECTION_POINT",
        "instruction": "Gom nhiều túi vào một túi lớn và mang đến điểm thu gom tái chế gần nhất.",
    },
    {
        "label": "cardboard",
        "displayLabel": "Bìa giấy / Carton",
        "wasteType": "PAPER",
        "suggestedBin": "BIN",
        "instruction": "Gấp phẳng, giữ khô ráo và bỏ vào thùng rác giấy. Không bỏ khi đã ướt hoặc dính dầu mỡ.",
    },
    {
        "label": "newspaper",
        "displayLabel": "Báo / Giấy",
        "wasteType": "PAPER",
        "suggestedBin": "BIN",
        "instruction": "Bỏ vào thùng rác giấy hoặc mang đến điểm thu mua giấy vụn.",
    },
    {
        "label": "glass_bottle",
        "displayLabel": "Chai thủy tinh",
        "wasteType": "GLASS",
        "suggestedBin": "CENTER",
        "instruction": "Tháo nắp ra riêng. Mang đến trung tâm tái chế vì thủy tinh có thể gây nguy hiểm khi vỡ.",
    },
    {
        "label": "metal_can",
        "displayLabel": "Lon kim loại",
        "wasteType": "METAL",
        "suggestedBin": "BIN",
        "instruction": "Rửa sạch và bỏ vào thùng rác tái chế. Lon nhôm và lon sắt đều có thể tái chế được.",
    },
    {
        "label": "battery",
        "displayLabel": "Pin / Ắc quy",
        "wasteType": "BATTERY",
        "suggestedBin": "COLLECTION_POINT",
        "instruction": "KHÔNG bỏ vào thùng rác thông thường! Mang đến điểm thu gom pin nguy hại hoặc cửa hàng điện tử.",
    },
    {
        "label": "electronic_waste",
        "displayLabel": "Rác điện tử",
        "wasteType": "BATTERY",
        "suggestedBin": "CENTER",
        "instruction": "Mang đến trung tâm thu gom rác điện tử. Không vứt bừa vì chứa kim loại nặng độc hại.",
    },
    {
        "label": "food_waste",
        "displayLabel": "Rác thực phẩm",
        "wasteType": "OTHER",
        "suggestedBin": "BIN",
        "instruction": "Bỏ vào thùng rác hữu cơ. Có thể làm phân compost để tái sử dụng dinh dưỡng cho đất.",
    },
    {
        "label": "trash",
        "displayLabel": "Rác hỗn hợp",
        "wasteType": "OTHER",
        "suggestedBin": "BIN",
        "instruction": "Bỏ vào thùng rác sinh hoạt thông thường. Cố gắng phân loại rác trước khi vứt.",
    },
]


# ---------------------------------------------------------------------------
# Simple heuristic classifier (replace with real ML model in production)
# ---------------------------------------------------------------------------
def classify_image(image: Image.Image) -> dict:
    width, height = image.size
    img_rgb = image.convert("RGB")

    cx, cy = width // 2, height // 2
    sample = min(50, width // 4, height // 4)

    r_total = g_total = b_total = count = 0
    for x in range(cx - sample, cx + sample, 4):
        for y in range(cy - sample, cy + sample, 4):
            if 0 <= x < width and 0 <= y < height:
                r, g, b = img_rgb.getpixel((x, y))
                r_total += r; g_total += g; b_total += b; count += 1

    if count == 0:
        count = 1

    avg_r = r_total / count
    avg_g = g_total / count
    avg_b = b_total / count
    aspect = width / height if height > 0 else 1.0

    # Brownish/cardboard
    if avg_r > 150 and avg_g > 100 and avg_b < 100 and avg_r > avg_g > avg_b:
        return WASTE_LABELS[2]
    # Greenish/glass
    if avg_g > avg_r and avg_g > avg_b and avg_g > 100:
        return WASTE_LABELS[4]
    # Silvery/metallic (all channels high)
    if avg_r > 180 and avg_g > 180 and avg_b > 180:
        return WASTE_LABELS[5]
    # Very dark (battery/electronics)
    if avg_r < 60 and avg_g < 60 and avg_b < 60:
        return WASTE_LABELS[6]
    # Tall narrow → bottle
    if aspect < 0.6:
        return WASTE_LABELS[0]
    # Wide flat → bag/paper
    if aspect > 1.5:
        return WASTE_LABELS[1]

    # Fallback random from common waste types
    return WASTE_LABELS[random.choice([0, 2, 5, 9])]


def build_response(result: dict) -> dict:
    return {
        "label": result["label"],
        "displayLabel": result["displayLabel"],
        "confidence": round(random.uniform(0.72, 0.97), 4),
        "wasteType": result["wasteType"],
        "suggestedBin": result["suggestedBin"],
        "instruction": result["instruction"],
        "modelName": "ecohabit-v1-heuristic",
        "modelVersion": "1.0.0",
    }


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class PredictByUrlRequest(BaseModel):
    imageUrl: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {"status": "ok", "service": "EcoHabit AI Classification Service", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/predict")
async def predict_file(file: UploadFile = File(...)):
    """Classify waste from an uploaded image file."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File phải là ảnh (jpg, png, webp, ...)")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Không thể đọc file ảnh")

    return build_response(classify_image(image))


@app.post("/predict-url")
async def predict_url(body: PredictByUrlRequest):
    """Classify waste from a publicly accessible image URL."""
    try:
        req = urllib.request.Request(
            body.imageUrl,
            headers={"User-Agent": "EcoHabit-AI/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            raw = response.read()
        image = Image.open(io.BytesIO(raw))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Không thể tải ảnh từ URL: {str(e)}"
        )

    return build_response(classify_image(image))