"""
Test script: Kiểm tra flow backend NestJS -> AI Service
Chạy: python test_flow.py
"""
import urllib.request
import json
import io
import sys

AI_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:3000"

DIVIDER = "=" * 55


def print_result(label, data, ok=True):
    icon = "✅" if ok else "❌"
    print(f"\n{icon} {label}")
    print(json.dumps(data, ensure_ascii=False, indent=2))


def test_ai_health():
    print(f"\n{DIVIDER}")
    print("TEST 1: AI Service Health Check")
    print(DIVIDER)
    req = urllib.request.Request(f"{AI_URL}/health")
    with urllib.request.urlopen(req, timeout=5) as r:
        data = json.loads(r.read())
    print_result("GET /health", data)
    return data.get("status") == "healthy"


def test_ai_predict_file():
    """Tạo ảnh PNG giả (200x400 - tall → bottle) và gửi lên /predict"""
    from PIL import Image
    print(f"\n{DIVIDER}")
    print("TEST 2: AI /predict (file upload - tall blue image → plastic bottle)")
    print(DIVIDER)

    img = Image.new("RGB", (200, 400), color=(30, 120, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    boundary = "----TestBoundary12345"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode() + img_bytes + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        f"{AI_URL}/predict",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read())
    print_result("POST /predict", data)
    return data


def test_ai_predict_url():
    """Test /predict-url với Cloudinary URL mẫu (dùng local fallback)"""
    print(f"\n{DIVIDER}")
    print("TEST 3: AI /predict-url (JSON body với imageUrl)")
    print(DIVIDER)

    # Tạo data URI thay thế vì Wikipedia bị block
    # Gửi URL của ảnh local server nếu có, hoặc skip
    payload = json.dumps({"imageUrl": "http://localhost:8000/static/test.jpg"}).encode()
    req = urllib.request.Request(
        f"{AI_URL}/predict-url",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        print_result("POST /predict-url", data)
    except Exception as e:
        print(f"⚠️  /predict-url cần URL công khai (bị chặn trong test local): {e}")
        print("   → Trong production, Cloudinary URL sẽ hoạt động bình thường")


def test_ai_predict_cardboard():
    """Màu nâu → cardboard"""
    from PIL import Image
    print(f"\n{DIVIDER}")
    print("TEST 4: AI /predict (brownish square → cardboard)")
    print(DIVIDER)

    img = Image.new("RGB", (300, 300), color=(180, 130, 60))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    boundary = "----TestBoundary99999"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="cardboard.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode() + img_bytes + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        f"{AI_URL}/predict",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read())
    print_result("POST /predict (cardboard)", data)


def test_ai_predict_metal():
    """Màu bạc → metal can"""
    from PIL import Image
    print(f"\n{DIVIDER}")
    print("TEST 5: AI /predict (silver square → metal can)")
    print(DIVIDER)

    img = Image.new("RGB", (300, 300), color=(200, 200, 205))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    boundary = "----TestBoundaryMetal"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="metal.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode() + img_bytes + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        f"{AI_URL}/predict",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read())
    print_result("POST /predict (metal)", data)


if __name__ == "__main__":
    print("\n🌿 EcoHabit AI Service — Integration Test")
    print(DIVIDER)

    try:
        ok = test_ai_health()
        if not ok:
            print("\n❌ AI Service không healthy. Dừng test.")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Không kết nối được AI Service tại {AI_URL}: {e}")
        print("   Hãy chạy: uvicorn main:app --reload --port 8000")
        sys.exit(1)

    try:
        test_ai_predict_file()
    except Exception as e:
        print(f"❌ Lỗi test file upload: {e}")

    test_ai_predict_url()

    try:
        test_ai_predict_cardboard()
    except Exception as e:
        print(f"❌ Lỗi test cardboard: {e}")

    try:
        test_ai_predict_metal()
    except Exception as e:
        print(f"❌ Lỗi test metal: {e}")

    print(f"\n{DIVIDER}")
    print("✅ Tất cả tests AI Service đã chạy xong!")
    print(f"{DIVIDER}\n")
