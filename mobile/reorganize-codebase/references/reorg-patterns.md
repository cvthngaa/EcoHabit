# Reorganization Patterns

## Mục Tiêu

Chọn cấu trúc đích theo đặc điểm codebase, không theo sở thích cá nhân.

## 1. Small App: Layer-First

Phù hợp khi:
- repo nhỏ
- ít domain
- ít người cùng sửa
- phần lớn file còn nằm trong vài technical layers rõ ràng

Mẫu điển hình:

```text
src/
  app/
  components/
  services/
  lib/
  types/
```

Ưu điểm:
- dễ đọc
- ít ceremony
- phù hợp khi shared code nhiều hơn domain-specific code

Không phù hợp khi:
- một feature phải nhảy qua quá nhiều thư mục
- số module nghiệp vụ tăng nhanh
- ownership mờ giữa `components`, `services`, `lib`

## 2. Medium App: Feature-First With Shared Core

Phù hợp khi:
- có nhiều domain hoặc màn hình nghiệp vụ
- logic của từng feature đã đủ dày
- team muốn colocate UI, hooks, service adapters, types theo feature

Mẫu điển hình:

```text
src/
  app/
  features/
    warehouse/
    handover/
    ventilation/
  shared/
    ui/
    lib/
    api/
    config/
```

Ưu điểm:
- giảm feature scattering
- rõ ownership
- dễ onboarding theo domain

Cần giữ shared core nhỏ. Nếu mọi thứ đều bị đẩy vào `shared`, mô hình này sẽ mất tác dụng.

## 2A. React Native App: Feature-First With Mobile Shell

Phù hợp khi:
- app React Native hoặc Expo đã có nhiều màn hình
- navigation, auth flow, offline storage hoặc native integrations bắt đầu dày lên
- screen component đang ôm cả UI, orchestration và business logic

Mẫu điển hình:

```text
src/
  app/ or navigation/
  features/
    auth/
    inventory/
    handover/
  shared/
    ui/
    hooks/
    lib/
    theme/
  services/
    api/
    storage/
    notifications/
  platform/ or native/
```

Ưu điểm:
- tách mobile shell khỏi domain logic
- screen ownership rõ hơn
- dễ kiểm soát phần nào là UI, phần nào là side effect mobile

Cần chú ý:
- navigation tree là application shell, không phải nơi chứa toàn bộ business logic
- `services/storage` và `services/api` nên tách khỏi UI
- native bridge, permissions, push, deep link nên có home rõ ràng

## 2B. Expo Router: File-Based Navigation With Thin Route Files

Phù hợp khi:
- app dùng `expo-router`
- route tree trong `app/` đã là nguồn sự thật cho navigation
- team muốn tận dụng file-based routing nhưng không muốn route files phình to

Mẫu điển hình:

```text
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    home.tsx
    inventory/
      [id].tsx
  (auth)/
    sign-in.tsx
src/
  features/
    inventory/
    auth/
  shared/
    ui/
    hooks/
    lib/
  services/
    api/
    storage/
  platform/
```

Nguyên tắc:
- `app/` là route shell và route composition, không phải domain home
- file route nên mỏng: nhận params, gọi hook/container, render feature screen
- các section hoặc screen logic tái dùng nên chuyển vào `src/features/*/screens` hoặc `src/features/*/components`
- route groups như `(tabs)` và `(auth)` nên map theo flow lớn, không thay thế domain boundaries

Red flags:
- mọi logic của screen nằm trực tiếp trong `app/.../*.tsx`
- `_layout.tsx` chứa auth orchestration, fetching hoặc side effects lớn
- route tree mirror toàn bộ business structure một cách cứng nhắc dù feature được tái dùng ở nhiều flow

## 2C. React Navigation: Navigator Tree With Feature-Owned Screens

Phù hợp khi:
- app dùng `@react-navigation/*`
- có nested stack/tab/drawer phức tạp
- team cần kiểm soát linking, analytics, screen registration hoặc custom navigators

Mẫu điển hình:

```text
src/
  navigation/
    RootNavigator.tsx
    linking.ts
    types.ts
    stacks/
    tabs/
  features/
    auth/
      screens/
      hooks/
    inventory/
      screens/
      services/
  shared/
    ui/
    lib/
  services/
    api/
    storage/
  platform/
```

Nguyên tắc:
- `navigation/` sở hữu navigator composition, linking, route names, param lists
- `features/*/screens` sở hữu screen UI và screen-level orchestration
- navigator không nên chứa fetching hoặc business rules ngoài navigation policy
- nested navigators nên phản ánh app flows, không biến thành nơi gom mọi screen không rõ owner

Red flags:
- navigator file dài, vừa đăng ký screen vừa fetch data vừa quyết auth logic
- `screens/` phẳng toàn cục, không rõ screen nào thuộc domain nào
- linking config nằm rải rác và không khớp với navigation tree

## 3. Large App Or Monorepo: Domain Boundary + Packages

Phù hợp khi:
- nhiều app/package
- nhiều team hoặc ownership tách biệt
- cần public API rõ cho từng module/package

Mẫu điển hình:

```text
apps/
  web/
  admin/
packages/
  domain-warehouse/
  domain-handover/
  ui-kit/
  config/
  tooling/
```

Ưu điểm:
- boundaries rõ
- scale tốt
- dễ enforce import direction

Cần thêm:
- public entrypoints
- dependency rules
- versioning hoặc workspace ownership rõ ràng

## Nên Giữ `app/components/services/lib` Hay Chuyển Sang `features/<domain>`

Giữ layer-first khi:
- feature còn mỏng
- phần lớn file là generic
- domain boundaries chưa rõ
- số màn hình / use case còn ít

Chuyển sang feature-first khi:
- cùng một feature đang rải ở `components`, `services`, `hooks`, `types`, `lib`
- sửa một use case phải mở nhiều thư mục không liên quan
- domain ownership quan trọng hơn technical purity

Chọn hybrid khi:
- route/bootstrap vẫn nên ở `app/`
- domain logic nên ở `features/`
- shared primitives nên ở `shared/` hoặc `core/`
- với React Native, navigation shell nên ở `app/`, `navigation/` hoặc `src/navigation`, còn screen-specific logic nên theo feature khi có thể
- với Expo Router, `app/` là shell còn feature code nên sống ngoài route tree
- với React Navigation, navigator tree là shell còn screens nên ưu tiên domain ownership

## Red Flags

- `lib/` thành chỗ chứa mọi thứ
- `utils.ts` hoặc `helpers.ts` phình to và không rõ owner
- service của feature A được import tràn sang feature B
- component business logic nằm trong thư mục UI dùng chung
- types nằm xa nơi dùng nhất mà không có lý do
- mọi screen cùng dùng một thư mục `screens/` phẳng nhưng business logic, hooks và queries lại nằm rải ở nhiều chỗ
- code platform-specific bị trộn vào component chung mà không tách `.ios` / `.android` / native adapters
- file route Expo Router quá dày, copy-paste data fetching và side effects giữa nhiều routes
- navigator React Navigation trở thành "god file" cho app shell, auth flow, analytics và business orchestration
