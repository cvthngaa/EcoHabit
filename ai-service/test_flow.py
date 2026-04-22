"""
Test script: Kiểm tra flow backend NestJS -> AI Service
Chạy: python test_flow.py
"""
import urllib.request
import json
import io
import sys
import os
import tempfile
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from contextlib import contextmanager

AI_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:3000"

VALID_WASTE_TYPES = {"PLASTIC", "PAPER", "BATTERY", "GLASS", "METAL", "OTHER"}
VALID_BIN_TYPES = {"BIN", "CENTER", "COLLECTION_POINT"}

DIVIDER = "=" * 55


def print_result(label, data, ok=True):
    icon = "✅" if ok else "❌"
    print(f"\n{icon} {label}")
    print(json.dumps(data, ensure_ascii=False, indent=2))


def assert_backend_enum_compatible(data: dict):
    waste_type = data.get("wasteType")
    suggested_bin = data.get("suggestedBin")

    if waste_type not in VALID_WASTE_TYPES:
        raise AssertionError(
            f"wasteType không hợp lệ: {waste_type}. Expected one of {sorted(VALID_WASTE_TYPES)}"
        )

    if suggested_bin not in VALID_BIN_TYPES:
        raise AssertionError(
            f"suggestedBin không hợp lệ: {suggested_bin}. Expected one of {sorted(VALID_BIN_TYPES)}"
        )


@contextmanager
def temporary_image_url():
    """Tạo URL local tạm thời cho ảnh để test /predict-url không cần internet."""
    from PIL import Image

    with tempfile.TemporaryDirectory() as tmp_dir:
        image_path = os.path.join(tmp_dir, "test.jpg")
        img = Image.new("RGB", (320, 320), color=(40, 140, 210))
        img.save(image_path, format="JPEG")

        class QuietHandler(SimpleHTTPRequestHandler):
            def log_message(self, format, *args):
                return

        old_cwd = os.getcwd()
        os.chdir(tmp_dir)
        server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()

        try:
            host, port = server.server_address
            yield f"http://{host}:{port}/test.jpg"
        finally:
            server.shutdown()
            server.server_close()
            os.chdir(old_cwd)


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
    assert_backend_enum_compatible(data)
    print_result("POST /predict", data)
    return data


def test_ai_predict_url():
    """Test /predict-url với URL local tạm thời và assert enum backend."""
    print(f"\n{DIVIDER}")
    print("TEST 3: AI /predict-url (JSON body với imageUrl)")
    print(DIVIDER)

    try:
        with temporary_image_url() as img_url:
            payload = json.dumps({"imageUrl": img_url}).encode()
            req = urllib.request.Request(
                f"{AI_URL}/predict-url",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as r:
                data = json.loads(r.read())
        assert_backend_enum_compatible(data)
        print_result("POST /predict-url", data)
        return data
    except Exception as e:
        print(f"❌ Lỗi /predict-url: {e}")
        raise


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
    assert_backend_enum_compatible(data)
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
    assert_backend_enum_compatible(data)
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
