---
name: reorganize-codebase
description: Analyze a codebase's structure, explain the purpose of important files and folders, map end-to-end data flow, and produce a plan-first file reorganization blueprint for another project. Use when Codex needs to onboard a repo quickly, audit architecture, identify module boundaries, draw UI-service-API, React Native screen-service-storage flow, or propose a target folder structure before a large refactor, especially for Expo Router or React Navigation apps.
---

# Reorganize Codebase

## Overview

Skill này giúp Codex đọc nhanh một repo, giải thích kiến trúc theo kiểu onboarding cho dev mới, rồi đề xuất cấu trúc thư mục đích và kế hoạch chuyển đổi mà không mặc định sửa file ngay. Mặc định làm việc theo hướng `plan-first`: khám phá, chuẩn hóa quyết định, rồi mới mô tả các bước mutate khi user yêu cầu rõ.

## Quy Trình Bắt Buộc

1. Khảo sát repo chỉ bằng thao tác không-mutating.
2. Xác định entrypoints, module boundaries, shared layers, config, test surface, build/deploy surface.
3. Lập bản đồ luồng dữ liệu hiện tại theo stack thực tế.
4. Phân loại vấn đề tổ chức file và dependency direction.
5. Chọn target structure phù hợp thay vì áp một template cố định.
6. Xuất onboarding summary và reorg blueprint ở mức decision-complete.
7. Chỉ mô tả execution/migration mutate khi user yêu cầu rõ hoặc đã chuyển khỏi pha phân tích.

## Cách Khảo Sát Repo

- Bắt đầu từ manifest và entrypoints: `package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml`, `pom.xml`, router, main binary, app bootstrap, server startup.
- Với React Native, kiểm tra thêm `App.tsx`, `index.js`, `app.json`, `expo-router`, `metro.config.js`, `babel.config.js`, `ios/`, `android/`, native modules và asset pipeline.
- Nếu có `Expo Router`, đọc thêm:
  - `app/` route tree
  - `_layout.tsx` ở từng level
  - route groups như `(tabs)`, `(auth)`
  - dynamic segments như `[id].tsx`
  - `+not-found.tsx`, modal routes, deep-link conventions
- Nếu có `React Navigation`, đọc thêm:
  - `navigation/`, `navigators/`, `RootNavigator`
  - stack/tab/drawer composition
  - linking config
  - screen registration, param list types, navigation container ownership
- Lập inventory thư mục mức cao: app, src, packages, services, libs, modules, config, infra, tests, scripts, docs.
- Xác định các nhóm file quan trọng:
  - entrypoints và route surface
  - domain modules
  - shared UI / shared utilities / shared infra
  - service or repository layer
  - API clients, database access, cache/state, background jobs
  - CI/CD, container, deployment, codegen, generated files
- Tìm import direction và ownership:
  - cái gì là domain-owned
  - cái gì thực sự shared
  - module nào đang phụ thuộc ngược
- Nếu repo là web app, ưu tiên dựng luồng `input -> route/page -> component -> state/provider -> service -> API/storage -> side effect`.
- Nếu repo là React Native hoặc Expo, ưu tiên dựng luồng `user action -> screen/navigation -> component/hook -> store/provider -> service/use-case -> API/local storage/native bridge -> side effect`.
- Với React Native, xác định riêng:
  - navigation ownership ở đâu
  - screen-level state vs shared store
  - platform-specific files như `.ios.tsx`, `.android.tsx`
  - native bridge, permissions, push notifications, deep links, offline storage
  - app shell nằm ở route tree (`Expo Router`) hay navigator tree (`React Navigation`)
  - route params hoặc navigation params được định nghĩa ở đâu
  - auth flow, tabs, modal flow, nested navigation đang được tách rõ hay trộn logic
- Nếu repo là backend, ưu tiên dựng luồng `transport -> handler/controller -> service/use case -> repository/client -> datastore/external API`.
- Nếu repo là monorepo, xác định package boundaries, public APIs của package, shared tooling, workspace graph.

## Cách Chọn Cấu Trúc Đích

- Không đề xuất feature-first chỉ vì nó phổ biến. Chọn theo kích thước repo, mức độ chia domain, số team, tần suất cross-cutting concerns.
- Đọc `references/reorg-patterns.md` trước khi kết luận target structure.
- Đọc `references/decision-checklist.md` để khóa các quyết định mà implementer không nên tự đoán.
- Nếu repo nhỏ và chủ yếu technical layers, ưu tiên cấu trúc gọn, ít thư mục.
- Nếu repo trung bình với nhiều module nghiệp vụ, ưu tiên feature-first với shared core nhỏ.
- Nếu repo lớn hoặc monorepo, ưu tiên domain boundary rõ và public API cho từng package/module.
- Nếu repo là React Native app, tách rõ `screens`, `features`, `shared/ui`, `navigation`, `services`, `storage`, `native` hoặc `platform` tùy độ phức tạp. Không để business logic nằm lẫn trong screen component quá lâu.
- Nếu dùng `Expo Router`, giữ `app/` như navigation shell và route surface; đẩy business logic, hooks, queries và reusable screen sections ra `features/` hoặc `shared/`, không nhét toàn bộ logic vào file route.
- Nếu dùng `React Navigation`, giữ `navigation/` cho navigator tree, linking config, screen registration; đẩy orchestration và domain logic ra feature modules thay vì để trong navigator definitions.

## Hợp Đồng Đầu Ra

Luôn cố gắng trả lời theo các mục sau. Có thể gộp hoặc rút gọn nếu repo rất nhỏ, nhưng không bỏ các quyết định quan trọng:

- `Kiến trúc hiện tại`
  - cây thư mục mức cao
  - vai trò từng nhóm
  - entrypoints chính
- `File quan trọng`
  - config
  - providers/context/bootstrap
  - domain services
  - shared utilities
  - navigation, native bridge, storage, permissions nếu là mobile
- `Luồng dữ liệu`
  - nguồn vào -> UI/transport -> domain/service -> API/storage -> cache/state -> side effects
- `Vấn đề tổ chức`
  - duplication
  - mixed concerns
  - feature scattering
  - import ngược
  - naming yếu
  - dead zones / unclear ownership
- `Cấu trúc đích`
  - sơ đồ thư mục đề xuất
  - nguyên tắc shared vs domain-owned
  - import direction
- `Kế hoạch chuyển đổi`
  - migration map
  - thứ tự move/refactor
  - test gates
  - rollback notes nếu reorg lớn
- `Giả định`
  - nêu rõ các giả định hoặc mặc định đã chốt

## Khi Cần Hỏi Thêm

Chỉ hỏi khi câu trả lời làm thay đổi target structure hoặc execution plan. Ví dụ:

- tổ chức theo feature hay layer
- colocate tests/styles/types hay tách
- repo này tối ưu cho một team hay nhiều team
- reorg chỉ để dễ hiểu hay còn để chuẩn bị scale
- với React Native: navigation theo feature hay global, native/platform code colocate hay gom riêng
- với Expo Router: route groups map theo flow hay theo domain, file route chỉ nên mỏng đến mức nào
- với React Navigation: param list, linking config, nested navigator ownership có nên tập trung một chỗ hay chia theo feature

Nếu user chưa trả lời mà vẫn có thể tiếp tục an toàn, chọn mặc định hợp lý và ghi nó vào mục `Giả định`.

## Cách Dùng References Và Templates

- Dùng `references/analysis-outputs.md` để chọn format trả lời theo nhu cầu:
  - onboarding dev mới
  - dataflow map
  - repo audit
  - blueprint cho dự án khác
- Dùng `references/reorg-patterns.md` khi quyết định chiến lược tổ chức.
- Dùng `references/decision-checklist.md` để khóa các quyết định trước khi sinh plan.
- Dùng các file trong `assets/templates/` như skeleton ngắn cho output. Điều chỉnh theo stack thực tế, không chép nguyên xi khi không phù hợp.

## Giới Hạn Và Nguyên Tắc

- Mặc định không mutate repo-tracked files trong pha phân tích.
- Không nhồi nhét chi tiết file-by-file nếu một sơ đồ theo module sẽ rõ hơn.
- Không áp template frontend cho backend hoặc library.
- Không áp template web thuần cho React Native khi repo có navigation, native bridge hoặc platform-specific code rõ rệt.
- Không đẩy file route của Expo Router thành nơi chứa toàn bộ UI business sections nếu chúng có thể tái dùng hoặc có lifecycle phức tạp.
- Không để navigator definitions trong React Navigation kiêm luôn data fetching, auth orchestration và side effects nếu có thể tách rõ hơn.
- Không đề xuất over-engineering cho repo nhỏ.
- Không để implementer tự quyết các phần quan trọng như module ownership, import direction, hay migration ordering.
