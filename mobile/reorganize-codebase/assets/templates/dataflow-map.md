## Luồng dữ liệu

1. Nguồn vào: [user/request/event]
2. Entry: [route/page/controller/handler]
3. Presentation hoặc transport: [component/view/controller]
4. State hoặc orchestration: [provider/store/service/use-case]
5. API/client/repository: [adapter]
6. Datastore hoặc external system: [DB/API/queue]
7. Side effects: [cache, toast, file write, redirect, event]

## Điểm cắt

- Validation: [ở đâu]
- Data mapping: [ở đâu]
- Cache/state: [ở đâu]
- Rủi ro trộn concern: [ở đâu]
- Nếu là React Native: navigation, AsyncStorage/MMKV/SQLite, native module, permission flow [ở đâu]
- Nếu là Expo Router: route file vs feature screen boundary [ở đâu]
- Nếu là React Navigation: navigator shell vs screen orchestration boundary [ở đâu]
