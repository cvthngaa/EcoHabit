# Báo Cáo Đánh Giá Kết Quả Huấn Luyện Mô Hình Waste Detection

Báo cáo này tổng hợp kết quả huấn luyện mô hình nhận diện rác thải (Waste Detection) qua 50 epochs, dựa trên các số liệu ghi nhận được từ quá trình training.

## 1. Tổng quan quá trình huấn luyện
- **Số lượng Epoch:** 50
- **Thời gian hoàn thành:** ~18,374 giây (tương đương khoảng 5.1 giờ)
- **Cấu hình Learning Rate (cuối):** 0.000298

## 2. Các Chỉ Số Đánh Giá (Metrics)
Dưới đây là các chỉ số đánh giá chất lượng mô hình ở epoch cuối cùng (Epoch 50), cho thấy khả năng nhận diện của mô hình trên tập validation:

- **Precision (Độ chính xác):** `89.36%` (0.8936) 
  *Trong số các đối tượng mô hình dự đoán là rác, có khoảng 89.36% là chính xác.*
- **Recall (Độ phủ):** `77.51%` (0.7751)
  *Mô hình nhận diện thành công 77.51% tổng số đối tượng rác thực tế có trong ảnh.*
- **mAP@50 (Mean Average Precision ở ngưỡng IoU 0.5):** `81.38%` (0.8138)
  *Hiệu suất tổng thể rất tốt ở mức phát hiện cơ bản.*
- **mAP@50-95 (Mean Average Precision trung bình ở các ngưỡng IoU từ 0.5 đến 0.95):** `68.31%` (0.6831)
  *Chỉ số này khá cao, chứng tỏ box dự đoán bám rất sát vào vật thể.*

## 3. Phân Tích Loss (Độ Lỗi)
Quá trình huấn luyện cho thấy sự hội tụ (convergence) tốt, không có dấu hiệu overfitting nghiêm trọng:

### Training Loss (Độ lỗi trên tập huấn luyện)
- **Box Loss:** Giảm từ `1.357` xuống `0.569`
- **Class Loss:** Giảm từ `1.989` xuống `0.364`

### Validation Loss (Độ lỗi trên tập kiểm thử)
- **Box Loss:** Giảm từ `1.570` xuống `0.621`
- **Class Loss:** Giảm từ `1.426` xuống `0.448`

*Nhận xét:* Validation loss liên tục giảm và duy trì ổn định, bám sát Training loss, chứng tỏ mô hình học hỏi tốt và có khả năng tổng quát hóa (generalize) trên các dữ liệu mới mà không bị học vẹt (overfit).

## 4. Các Biểu Đồ Và Hình Ảnh Đánh Giá Đi Kèm
Trong thư mục kết quả (`runs/detect/runs/train/waste-detection/`), có các biểu đồ trực quan hỗ trợ phân tích chi tiết hơn:
- `results.png`: Biểu diễn trực quan xu hướng giảm của Loss và tăng của Metrics qua 50 epochs.
- `confusion_matrix.png` & `confusion_matrix_normalized.png`: Giúp nhận biết mô hình có hay bị nhầm lẫn giữa các loại rác cụ thể nào không.
- `BoxPR_curve.png` (Precision-Recall Curve): Biểu đồ đánh giá sự đánh đổi giữa Precision và Recall.
- `val_batch*_pred.jpg`: Các hình ảnh dự đoán thực tế trên tập validation để kiểm tra bằng mắt thường.

## 5. Phân Tích Sâu Từ Các Biểu Đồ

Sau khi xem xét các biểu đồ `results.png`, `confusion_matrix.png`, `BoxF1_curve.png`, và `labels.jpg`, dưới đây là các nhận định chi tiết:

### A. Phân bố dữ liệu (Class Imbalance)
Dựa trên `labels.jpg`, tập dữ liệu bị **mất cân bằng khá nghiêm trọng**:
- **Nhóm đa số:** `organic` (hữu cơ) áp đảo với 7,872 mẫu, theo sau là `cardboard` (3,164) và `battery` (2,761).
- **Nhóm thiểu số:** `metal` (kim loại - 115 mẫu) và `glass` (thủy tinh - 92 mẫu) có rất ít dữ liệu.
- *Lỗi dữ liệu:* Có một class rác tên là `This dataset was exported via roboflow.com...` (50 mẫu). Đây là lỗi xuất dữ liệu từ Roboflow cần được gỡ bỏ trong tương lai để tránh nhiễu mô hình.

### B. Confusion Matrix (Ma Trận Nhầm Lẫn)
- **Nhận diện xuất sắc:** `organic`, `cardboard`, `paper` gần như đường chéo chính rất đậm (đúng > 90%).
- **Sự nhầm lẫn với Background (False Negatives - Bỏ sót):** 
  - `clothes` (quần áo) có 102 trường hợp bị nhầm thành background (không nhận diện ra được).
  - `battery` (pin) cũng bị sót 67 trường hợp.
- **Nhầm lẫn chéo:** Các class khá tách biệt, ít bị nhầm với nhau, chủ yếu lỗi xuất phát từ việc "bỏ sót" không nhận ra vật thể thay vì nhận diện sai loại rác.

### C. F1-Confidence Curve
- **Điểm tối ưu (Optimal Threshold):** F1-Score đạt đỉnh ở mức `0.78` tại ngưỡng Confidence (độ tin cậy) là `0.395`. Điều này có nghĩa là khi cấu hình trên ứng dụng (Inference), bạn nên cài đặt `conf=0.4` (hoặc 0.39) để cân bằng tốt nhất giữa việc không nhận diện sai và không bỏ sót rác.
- **Hiệu suất theo class:** Đường F1 của `organic` gần tiệm cận 1.0 (hoàn hảo), trong khi `clothes` và `glass` có đường cong tụt khá thấp, phản ánh đúng việc thiếu dữ liệu hoặc vật thể khó nhận dạng.

### D. Biểu đồ Results.png
- Có một bước nhảy vọt (sharp drop) rất tích cực về độ lỗi (loss) ở khoảng **epoch 40**. Đây là đặc trưng của YOLOv8 khi tắt tính năng Augmentation (như Mosaic) ở 10 epoch cuối cùng để mô hình "chốt" các vật thể thực tế tốt hơn. Nhờ đó, cả Precision và mAP đều tăng vọt và ổn định ở các epoch cuối cùng.

## 6. Kết Luận & Đề Xuất
- **Kết luận:** Mô hình hiện tại đã đạt được độ chính xác rất khả quan (mAP50 > 81%, Precision ~89%). Đặc biệt mô hình bắt bounding box rất chính xác với chỉ số mAP50-95 đạt trên 68%.
- **Đề xuất bước tiếp theo:** 
  1. Xem xét `confusion_matrix.png` để phát hiện class nào đang bị nhận diện kém nhất (nếu có nhiều loại rác khác nhau).
  2. Nếu muốn tăng Recall (hiện đang ở mức 77.51%), có thể thu thập thêm dữ liệu hoặc thực hiện data augmentation (tăng cường dữ liệu) cho các trường hợp khó nhận diện (góc chụp khuất, thiếu sáng).
  3. Có thể dùng weights tốt nhất (`weights/best.pt`) để chạy inference thử nghiệm nghiệm thu (testing) trên video hoặc hình ảnh thực tế từ ứng dụng.
