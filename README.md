# EcoHabit

EcoHabit là hệ thống hỗ trợ phân loại rác bằng AI và khuyến khích người dùng xây dựng thói quen bảo vệ môi trường thông qua điểm thưởng, quiz, bản đồ điểm thu gom và đổi quà.

Dự án hiện có 3 phần chính đang có mã nguồn: `mobile`, `backend` và `ai-service`. Thư mục `web` có tồn tại nhưng hiện chưa có source code.

## Overview

Hệ thống cho phép người dùng:

- Đăng ký, đăng nhập và khôi phục mật khẩu bằng OTP qua email.
- Chụp hoặc chọn ảnh rác để AI phân loại.
- Nhận gợi ý loại rác, thùng rác phù hợp và hướng dẫn xử lý.
- Tích điểm sau các hoạt động như phân loại rác hoặc làm quiz.
- Xem điểm thu gom trên bản đồ.
- Đổi phần thưởng bằng điểm.
- Làm quiz môi trường hằng ngày.
- Xem mẹo sống xanh từ Gemini hoặc dữ liệu fallback.

Backend cung cấp REST API cho mobile app, kết nối PostgreSQL, Redis, Cloudinary, Gemini API và AI service FastAPI.

## Main Features

### Mobile app

- Luồng xác thực: welcome, đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu.
- Lưu trạng thái đăng nhập bằng AsyncStorage.
- Tab chính gồm: Trang chủ, Bản đồ, Quét, Đổi quà, Cá nhân.
- Quét/phân tích rác từ ảnh.
- Bản đồ điểm thu gom và gợi ý địa chỉ.
- Quiz môi trường theo ngày.
- Ví điểm và lịch sử điểm.
- Danh sách phần thưởng, chi tiết phần thưởng, đổi thưởng.
- Trang cá nhân và các màn hình cài đặt.
- Giao diện cộng đồng gồm danh sách bài viết, chi tiết bài viết và tạo bài viết.

### Backend API

- JWT authentication với Passport.
- OTP đăng ký và khôi phục mật khẩu qua Nodemailer.
- Redis cho OTP và trạng thái quiz hằng ngày.
- TypeORM entities cho users, points, rewards, locations, AI classification, forum.
- Upload ảnh lên Cloudinary.
- Gọi AI service để phân loại rác.
- Lưu lịch sử phân loại và feedback của người dùng.
- Cộng điểm khi kết quả phân loại đạt ngưỡng tin cậy.
- API điểm, phần thưởng, đổi thưởng, điểm thu gom, check-in, quiz, Gemini daily tip.
- Swagger/OpenAPI tại `/docs`.

### AI service

- FastAPI service dùng YOLO để nhận diện rác.
- Endpoint dự đoán bằng file upload hoặc image URL.
- Mapping nhãn YOLO sang loại rác, thùng gợi ý và hướng dẫn xử lý.
- Có script train/test model.

### Web admin/partner

TODO: Repo có thư mục `web/` nhưng hiện chưa có source code, package scripts hoặc hướng dẫn chạy web admin/partner.

## Tech Stack

| Thành phần | Công nghệ thực tế trong repo |
| --- | --- |
| Mobile | Expo, React Native, TypeScript, React Navigation, NativeWind, React Native Paper, Axios |
| Backend | NestJS, TypeScript, TypeORM, Passport JWT, Swagger |
| Database | PostgreSQL |
| Cache | Redis |
| Object storage | Cloudinary |
| AI service | FastAPI, Uvicorn, Pillow, Ultralytics YOLO |
| AI content | Google Gemini API |
| Web admin/partner | TODO: chưa có source trong `web/` |
| Deployment | TODO: chưa có Dockerfile hoặc docker-compose trong repo |

Lưu ý: Prompt ban đầu nhắc Prisma, React/Vite và Docker Compose, nhưng repo hiện tại chưa có `prisma/schema.prisma`, source web React/Vite hoặc file Docker Compose. Backend đang dùng TypeORM.

## System Architecture

```text
Mobile App (Expo React Native)
        |
        | HTTP / JSON, multipart upload
        v
Backend API (NestJS, /api)
        |
        |-- PostgreSQL: users, points, rewards, locations, AI history...
        |-- Redis: OTP, daily quiz completion
        |-- Cloudinary: image storage
        |-- Gemini API: daily tips / generated quiz content
        |
        v
AI Service (FastAPI + YOLO)
        |
        v
Waste classification result
```

Backend dùng global prefix `/api`, riêng Swagger Docs nằm tại `/docs`.

## Project Structure

```text
EcoHabit/
  README.md
  package.json

  backend/
    src/
      common/
      config/
      modules/
        ai/
        auth/
        forum/
        gemini/
        health/
        locations/
        points/
        quiz/
        rewards/
        uploads/
        users/
      main.ts
    test/
    uploads/
    package.json

  mobile/
    src/
      components/
      context/
      navigation/
      screens/
      services/
      store/
      theme/
    app.json
    package.json

  ai-service/
    dataset/
    main.py
    train.py
    test_flow.py
    requirements.txt
    *.pt

  web/
    TODO: chưa có source code

  runs/
    Kết quả train/validate YOLO
```

## Prerequisites

- Node.js và npm.
- Python 3.10+.
- PostgreSQL.
- Redis.
- Expo Go hoặc Android/iOS emulator.
- Tài khoản Cloudinary nếu dùng upload/phân loại ảnh.
- Gmail app password nếu dùng gửi OTP.
- Gemini API key nếu dùng Gemini.

## Installation Guide

Clone repository:

```bash
git clone <repo-url>
cd EcoHabit
```

Cài backend:

```bash
cd backend
npm install
```

Cài mobile:

```bash
cd mobile
npm install
```

Cài AI service:

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install ultralytics
```

TODO: Chưa có hướng dẫn cài `web/` vì thư mục này hiện trống.

## Environment Variables

Repo hiện chưa có `.env.example`. Các biến dưới đây được tổng hợp từ source code backend.

Tạo file `backend/.env`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=ecohabit

REDIS_URL=redis://localhost:6379

JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=1d

MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

AI_SERVICE_URL=http://localhost:8000

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
```

Mobile hiện lấy IP local từ Expo host trong `mobile/src/services/api/api.ts` và gọi:

```text
http://<expo-host-ip>:3000/api
```

Trong `mobile/app.json` có cấu hình:

```json
{
  "expo": {
    "extra": {
      "googleRoutesApiKey": ""
    }
  }
}
```

TODO: Nếu cần dùng Google Routes API thật, bổ sung key và hướng dẫn bảo mật key.

## How To Run Each Service

### 1. Chạy PostgreSQL và Redis

Đảm bảo PostgreSQL và Redis đang chạy trước khi start backend.

TODO: Chưa có `docker-compose.yml`, nên hiện README chưa thể cung cấp lệnh `docker compose up` chính thức cho database/cache.

### 2. Chạy AI service

```bash
cd ai-service
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Health check:

```text
http://localhost:8000/health
```

AI endpoints:

- `GET /health`
- `POST /predict`
- `POST /predict-url`

### 3. Chạy backend

```bash
cd backend
npm run start:dev
```

Backend mặc định chạy tại:

```text
http://localhost:3000
```

API prefix:

```text
http://localhost:3000/api
```

Swagger:

```text
http://localhost:3000/docs
```

### 4. Chạy mobile

```bash
cd mobile
npm start
```

Hoặc:

```bash
npm run android
npm run ios
npm run web
```

Sau đó mở app bằng Expo Go hoặc emulator.

### 5. Chạy web admin/partner

TODO: `web/` hiện chưa có source code hoặc `package.json`, nên chưa có lệnh chạy.

## Database Migration / Seed

Backend hiện dùng TypeORM với:

```ts
synchronize: false
```

Hiện repo chưa có thư mục migrations, seed script hoặc Prisma schema. Vì vậy cần chuẩn bị schema PostgreSQL tương ứng với các TypeORM entities trước khi chạy đầy đủ.

TODO:

- Bổ sung migration TypeORM hoặc SQL schema.
- Bổ sung seed data cho user, reward, collection point nếu cần demo.
- Tạo `.env.example` để người mới clone repo dễ cấu hình.

## API Documentation

Swagger/OpenAPI:

```text
http://localhost:3000/docs
```

Các nhóm API chính:

| Nhóm | Endpoint |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password/send-otp`, `POST /api/auth/reset-password`, `GET /api/auth/me` |
| Users | `GET /api/users` |
| AI | `POST /api/ai/classify`, `POST /api/ai/feedback/:classificationId`, `GET /api/ai/history` |
| Uploads | `POST /api/uploads/image` |
| Points | `GET /api/points/balance`, `GET /api/points/history` |
| Rewards | `GET /api/rewards`, `GET /api/rewards/top`, `GET /api/rewards/:id`, `POST /api/rewards/redeem`, `PATCH /api/rewards/redemptions/:id/status`, `POST /api/rewards`, `PUT /api/rewards/:id`, `DELETE /api/rewards/:id` |
| Locations | `GET /api/collection-points`, `GET /api/collection-points/address-suggestions`, `GET /api/collection-points/:id`, `POST /api/collection-points`, `PATCH /api/collection-points/:id`, `POST /api/checkins` |
| Quiz | `POST /api/quiz/generate`, `GET /api/quiz/daily`, `POST /api/quiz/daily/submit` |
| Gemini | `GET /api/gemini/daily-tip` |

Một số endpoint yêu cầu Bearer Token JWT. Xem chi tiết request/response trong Swagger.

## Testing Commands

### Backend

Các script có thật trong `backend/package.json`:

```bash
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

### Mobile

`mobile/package.json` hiện chưa có script test.

TODO: Bổ sung test script nếu dự án cần test mobile.

### AI service

AI service có file `test_flow.py`:

```bash
cd ai-service
venv\Scripts\activate
python test_flow.py
```

TODO: Chưa có test runner chuẩn như `pytest` trong `requirements.txt`.

## Useful Scripts

### Backend

| Script | Mô tả |
| --- | --- |
| `npm run build` | Build NestJS |
| `npm run format` | Format source/test bằng Prettier |
| `npm run start` | Chạy NestJS |
| `npm run start:dev` | Chạy dev mode có watch |
| `npm run start:debug` | Chạy debug mode |
| `npm run start:prod` | Chạy `dist/main` |
| `npm run lint` | ESLint và tự fix |
| `npm run test` | Unit test |
| `npm run test:e2e` | E2E test |

### Mobile

| Script | Mô tả |
| --- | --- |
| `npm start` | Chạy Expo |
| `npm run android` | Chạy Expo Android |
| `npm run ios` | Chạy Expo iOS |
| `npm run web` | Chạy Expo Web |

### AI service

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
python train.py
python test_flow.py
```

## Deployment Guide

TODO: Repo hiện chưa có Dockerfile, `docker-compose.yml`, CI/CD config hoặc hướng dẫn deploy production.

Gợi ý các việc cần bổ sung sau:

- Dockerfile cho `backend`.
- Dockerfile cho `ai-service`.
- Dockerfile hoặc build guide cho `mobile` nếu cần Expo/EAS.
- `docker-compose.yml` cho PostgreSQL, Redis, backend và AI service.
- Biến môi trường production.
- Migration/seed production.
- Hướng dẫn deploy Cloudinary/Gemini keys an toàn.

## Demo Accounts

TODO: Chưa tìm thấy seed data hoặc tài khoản demo trong repo.

Hiện app hỗ trợ đăng ký người dùng mới qua OTP email nếu backend, Redis, PostgreSQL và cấu hình email hoạt động.

## Contributors

TODO: Bổ sung tên thành viên/nhóm thực hiện.

## License / Academic Note

Dự án phục vụ mục đích học tập/đồ án tốt nghiệp.

TODO: Bổ sung license chính thức nếu dự án được công khai hoặc sử dụng lại ngoài phạm vi học thuật.

## Known TODOs

- Tạo `.env.example`.
- Bổ sung migration/seed database.
- Bổ sung source và hướng dẫn cho `web/`.
- Bổ sung Docker/Docker Compose nếu muốn chạy toàn hệ thống bằng container.
- Đổi JWT fallback dev trong code thành cấu hình bắt buộc khi deploy production.
- Chuẩn hóa encoding tiếng Việt trong một số file source cũ nếu còn bị lỗi hiển thị.
