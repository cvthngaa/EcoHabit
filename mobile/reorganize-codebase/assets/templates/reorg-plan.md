## Vấn đề tổ chức

- [vấn đề]
- [vấn đề]

## Cấu trúc đích

```text
[tree]
```

Nếu là React Native, cân nhắc tách rõ:
- `navigation/` hoặc `app/`
- `features/`
- `services/api`, `services/storage`
- `platform/` hoặc `native/`
- Nếu là Expo Router, giữ `app/` cho route shell mỏng và chuyển reusable screen logic ra `features/`
- Nếu là React Navigation, giữ `navigation/` cho navigator/linking/types và chuyển screen orchestration theo feature

## Migration map

- `[old path/group]` -> `[new path/group]`: [lý do]
- `[old path/group]` -> `[new path/group]`: [lý do]

## Kế hoạch chuyển đổi

1. [bước]
2. [bước]
3. [bước]

## Test gates

- [check]
- [check]

## Giả định

- [assumption]
