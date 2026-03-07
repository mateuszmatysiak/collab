# MAT-35: Obsłużyć działanie aplikacji offline

- **Priorytet:** Low
- **Label:** Feature
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-35/obsluzyc-dzialanie-aplikacji-bez-dostepu-do-internetu

## Cel

Aplikacja działa offline (odczyt z cache) i synchronizuje zmiany po reconnect.

## Kontekst

- Zakres: odczyt cached danych + sync po połączeniu
- Strategia konfliktów: last-write-wins z timestampem (rekomendacja)
- Technologia: React Query persistence + detekcja sieci

## Kroki realizacji

1. **React Query Persistence**
   - Zainstalować `@tanstack/query-async-storage-persister` i `@react-native-async-storage/async-storage`
   - Skonfigurować `persistQueryClient`:
     ```typescript
     const persister = createAsyncStoragePersister({
       storage: AsyncStorage,
     })
     ```
   - Dane przetrwają restart aplikacji

2. **Detekcja stanu sieci**
   - Zainstalować `@react-native-community/netinfo`
   - Hook `useNetworkStatus()` — online/offline
   - React Query `onlineManager` integracja:
     ```typescript
     onlineManager.setEventListener(setOnline => {
       return NetInfo.addEventListener(state => {
         setOnline(!!state.isConnected)
       })
     })
     ```

3. **Kolejkowanie mutacji offline**
   - React Query automatycznie pauzuje mutacje offline
   - Skonfigurować `networkMode: 'offlineFirst'` dla mutacji
   - Mutacje wykonają się gdy połączenie wróci

4. **Rozwiązywanie konfliktów**
   - Strategia: **last-write-wins** z timestampem `updated_at`
   - Backend: sprawdzić `updated_at` przy update — jeśli nowszy niż request → odrzuć lub nadpisz
   - Prosty i wystarczający dla tego typu aplikacji

5. **UI: wskaźnik trybu offline**
   - Banner/badge "Offline" gdy brak połączenia
   - Ikona sync gdy mutacje czekają na wysłanie
   - Toast po synchronizacji "Zsynchronizowano X zmian"

## Zależności

- Lepiej po MAT-45 (real-time) — sync offline musi współgrać z WebSockets

## Definition of done

- [ ] Dane widoczne offline (z cache)
- [ ] Mutacje kolejkowane offline, wykonywane po reconnect
- [ ] Wskaźnik trybu offline w UI
- [ ] Brak utraty danych przy przejściu offline/online
