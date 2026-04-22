# Output Formats

Dùng file này để chọn format trả lời phù hợp với mục tiêu của user. Không cần dùng toàn bộ mọi mẫu trong một câu trả lời.

## 1. Onboarding Cho Dev Mới

Phù hợp khi user muốn hiểu repo nhanh.

```md
## Kiến trúc hiện tại
- Repo này là ...
- Entry chính là ...
- Các nhóm thư mục quan trọng gồm ...

## File quan trọng
- `...`: ...
- `...`: ...

## Luồng dữ liệu
- Người dùng / request đi từ ... -> ... -> ... -> ...

## Điều cần nhớ khi sửa code
- Module nào sở hữu logic gì
- Shared code nằm ở đâu
- Chỗ nào dễ gây regression
```

## 2. Dataflow End-to-End

Phù hợp khi user yêu cầu vẽ luồng dữ liệu.

```md
## Luồng dữ liệu
1. Nguồn vào: ...
2. Entry / route / handler: ...
3. UI hoặc transport layer: ...
4. Domain / service layer: ...
5. API client / repository / datastore: ...
6. Cache / state / persistence: ...
7. Side effects: ...

## Điểm cắt quan trọng
- Validation ở đâu
- Mapping DTO/model ở đâu
- Chỗ nào đang trộn concern
```

## 3. Repo Audit Trước Reorg

Phù hợp khi user muốn tìm vấn đề tổ chức.

```md
## Kiến trúc hiện tại
- ...

## Vấn đề tổ chức
- ...

## Rủi ro nếu giữ nguyên
- ...

## Cấu trúc đích
- ...

## Kế hoạch chuyển đổi
- ...
```

## 4. Blueprint Cho Dự Án Khác

Phù hợp khi user muốn áp mô hình sang repo mới.

```md
## Cấu trúc đích
```text
src/
  ...
```

## Quy tắc tổ chức
- ...

## Quy tắc import
- ...

## Mapping từ cấu trúc cũ
- `old/...` -> `new/...`: ...
```

## Mặc Định Khuyến Nghị

- Repo nhỏ: trả lời ngắn, tập trung ownership và simplicity.
- Repo trung bình: thêm target structure và migration map.
- Repo lớn/monorepo: thêm package boundaries, public APIs và rollout theo đợt.
- Repo React Native: thêm navigation shell, storage/offline layer, native integrations và platform split nếu có.

## 5. React Native / Expo Audit

Phù hợp khi user muốn hiểu hoặc sắp xếp app mobile.

```md
## Kiến trúc hiện tại
- Entry mobile: `App.tsx` / expo router / navigation root
- Các nhóm chính: screens, features, services, storage, native/platform, shared ui

## Luồng dữ liệu
1. User action trên screen
2. Navigation hoặc screen container
3. Hook/provider/store
4. Service/use-case
5. API, AsyncStorage/MMKV/SQLite hoặc native module
6. Side effects: navigation, toast, notification, analytics

## Vấn đề tổ chức
- Screen component quá dày
- Navigation tree ôm business logic
- Native/platform code trộn với shared UI

## Cấu trúc đích
- Tách mobile shell khỏi domain logic
- Chốt vị trí cho storage, permissions, notifications, deep links
```

## 6. Expo Router Audit

Phù hợp khi app dùng file-based routing.

```md
## Kiến trúc hiện tại
- Route shell nằm ở `app/`
- Các `_layout.tsx` điều phối flow nào
- Route groups `(tabs)`, `(auth)`, modal routes map ra sao

## Luồng dữ liệu
1. Route file nhận params
2. Hook/container của feature
3. Service/use-case
4. API/storage/native adapter
5. Side effects: redirect, router push, toast, analytics

## Vấn đề tổ chức
- Route file quá dày
- `_layout.tsx` ôm auth/data orchestration
- Feature code nằm lẫn trong route tree

## Cấu trúc đích
- `app/` giữ route shell mỏng
- `src/features/*` giữ screen logic và reusable sections
```

## 7. React Navigation Audit

Phù hợp khi app dùng navigator tree thủ công.

```md
## Kiến trúc hiện tại
- Root navigator ở đâu
- Stack/tab/drawer nesting ra sao
- Linking config và param types nằm ở đâu

## Luồng dữ liệu
1. User action
2. Screen component/container
3. Feature hook/service
4. API/storage/native adapter
5. Side effects: navigate, reset, analytics, notifications

## Vấn đề tổ chức
- Navigator file quá dày
- Screen ownership mờ
- Linking config không đồng bộ với route names

## Cấu trúc đích
- `navigation/` giữ shell và route contracts
- `features/*/screens` giữ screen UI + orchestration
```
