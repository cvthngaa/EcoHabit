import os
from ultralytics import YOLO
import torch

def main():

    DATA_PATH = "dataset/data.yaml"
    PROJECT_PATH = "runs/train"
    RUN_NAME = "waste-detection"

    # 🔥 Model mạnh hơn (tốt hơn yolov8n)
    MODEL_BASE = "yolov8s.pt"

    EPOCHS = 50
    IMG_SIZE = 640
    BATCH_SIZE = 8

    LAST_MODEL_PATH = f"{PROJECT_PATH}/{RUN_NAME}/weights/last.pt"

    # INIT MODEL + RESUME
    if os.path.exists(LAST_MODEL_PATH):
        print("🔄 Resume training...")
        model = YOLO(LAST_MODEL_PATH)
        resume = True
    else:
        print("🚀 Train from scratch...")
        model = YOLO(MODEL_BASE)
        resume = False

    # TRAIN
    print("🔥 Start training...")
    torch.cuda.empty_cache()

    model.train(
        data=DATA_PATH,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,

        # 🔥 optimizer tốt hơn cho YOLO
        optimizer="SGD",
        lr0=0.01,

        # regularization
        weight_decay=0.0005,
        patience=15,

        # 🔥 augmentation mạnh hơn (quan trọng)
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=15,
        translate=0.15,
        scale=0.6,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.2,

        project=PROJECT_PATH,
        name=RUN_NAME,
        exist_ok=True,

        device=0,
        resume=resume,

        val=True,
        plots=True,
        save_period=5
    )

    print("✅ Training done!")

    # EVALUATE
    best_model_path = f"{PROJECT_PATH}/{RUN_NAME}/weights/best.pt"

    if os.path.exists(best_model_path):
        eval_model = YOLO(best_model_path)
    else:
        eval_model = model

    print("📊 Evaluating...")
    metrics = eval_model.val(
        data=DATA_PATH,
        split='val',
        plots=True,
        conf=0.25,
        iou=0.6
    )

    try:
        print("\n🏆 KẾT QUẢ ĐÁNH GIÁ (METRICS)")
        print(f"👉 mAP50-95: {metrics.box.map:.4f}")
        print(f"👉 mAP50: {metrics.box.map50:.4f}")
        print(f"👉 Precision (P): {metrics.box.mp:.4f}")
        print(f"👉 Recall (R): {metrics.box.mr:.4f}")

        print("\n📈 [THÔNG TIN BIỂU ĐỒ]")
        print(f"📂 Path: {os.path.abspath(f'{PROJECT_PATH}/{RUN_NAME}')}")
        print("   - results.png")
        print("   - confusion_matrix.png")
        print("   - F1_curve.png")
        print("   - PR_curve.png")

    except Exception as e:
        print(f"⚠️ Không lấy được metrics: {e}")

if __name__ == "__main__":
    main()