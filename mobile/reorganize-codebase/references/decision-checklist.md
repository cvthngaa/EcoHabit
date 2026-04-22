# Decision Checklist

Khóa các quyết định này trước khi sinh reorg plan. Nếu thiếu thông tin, chọn mặc định hợp lý và ghi vào `Giả định`.

## 1. Đơn Vị Tổ Chức Chính

- Tổ chức theo feature, layer, hay hybrid?
- Ownership chính nằm ở domain hay technical layer?
- Cấu trúc này tối ưu cho scale của 6-12 tháng tới hay chỉ dọn lại ngắn hạn?

## 2. Shared Vs Domain-Owned

- Shared thật sự là gì?
- Code nào chỉ được dùng bởi một feature nhưng đang để ở shared?
- Có cần tách `shared/ui`, `shared/lib`, `shared/api`, `shared/config` không?

## 3. Colocation Rules

- Tests colocate với source hay gom riêng?
- Styles colocate hay để global?
- Types đặt cạnh feature hay để package/types chung?
- Mocks, fixtures, story files đặt ở đâu?
- Với React Native: screen, hook, query, styles, assets của cùng một feature có colocate không?
- Với Expo Router: route file chỉ làm shell hay được phép chứa screen UI hoàn chỉnh?
- Với React Navigation: screen definitions colocate theo feature hay gom ở `screens/` toàn cục?

## 4. Public API Của Module

- Mỗi module/package có entrypoint public không?
- Có cấm import file nội bộ xuyên module không?
- Có cần barrel file hay explicit path import?

## 5. Import Direction

- UI có được gọi trực tiếp infra không?
- Domain/service có được import từ page/route không?
- Shared layer có được phụ thuộc feature layer không?
- Navigation có được gọi thẳng service/storage không?
- Native module wrappers có được import trực tiếp từ screen không hay qua adapter?
- Với Expo Router: `_layout.tsx` có được chứa auth gating, preload data, analytics side effects không, hay chỉ giữ shell mỏng?
- Với React Navigation: navigator có được gọi hooks business hay chỉ nhận screen components/container đã chuẩn bị sẵn?

Mặc định an toàn:
- app/route -> feature -> shared/core -> infra adapter
- shared không import ngược feature
- với React Native: navigation/screen -> feature hook/service -> api/storage/native adapter

## 6. Naming Rules

Chốt quy tắc đặt tên cho:
- pages/routes
- screens/navigators
- route groups, `_layout`, dynamic routes nếu là Expo Router
- navigator, stack, tab, param list, route names nếu là React Navigation
- hooks
- services/use-cases
- repositories/clients
- types/models/dtos

Ưu tiên:
- tên theo nghiệp vụ hoặc vai trò rõ
- tránh `misc`, `common`, `helpers`, `stuff`

## 7. Migration Strategy

- Reorg theo từng feature hay theo từng layer?
- Có cần compatibility shims/barrel tạm thời không?
- Test gates nào phải pass sau mỗi đợt move?
- Rollback đơn giản nhất là gì nếu import graph vỡ?
- Nếu là React Native: có cần giữ ổn định navigation names, deep-link paths, analytics event names, native module entrypoints không?
- Nếu là Expo Router: có cần giữ nguyên route segments, deep-link URLs, shared layouts, modal routes không?
- Nếu là React Navigation: có cần giữ route names, linking config, screen analytics mapping, navigator nesting không?
