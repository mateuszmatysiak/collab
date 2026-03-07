# Plany realizacji — Collab List

Data ustalenia: 2026-03-07

---

## Realizacja — log zmian

### 2026-03-08: Grupa 1 — Bugi i stabilność (MAT-90, MAT-88, MAT-65)

#### MAT-90: Optimistic updates / lag Checkbox — DONE

**Plik:** `apps/mobile/src/api/items.api.ts`

**Problem:** Wszystkie mutacje (toggle checkbox, delete, update) aktualizowały UI dopiero po odpowiedzi API (`onSuccess`). Na fizycznych urządzeniach (Pixel 7a, Samsung) powodowało to widoczny lag.

**Rozwiązanie:** Dodano pełny optimistic update pattern do trzech mutacji:

- **`useUpdateItem`** (toggle checkbox — najczęstsza operacja): `onMutate` natychmiast aktualizuje cache (`cancelQueries` → snapshot → `setQueryData`), `onError` robi rollback do snapshota, `onSettled` synchronizuje z serwerem przez `invalidateQueries`.
- **`useDeleteItem`**: analogiczny optimistic pattern — element znika natychmiast, rollback przy błędzie.
- **`useReorderItems`**: dodano brakujący `onSettled` z `invalidateQueries` (wcześniej nie synchronizował po zakończeniu).

**Uwaga:** `useCreateItem` pozostawiony z `onSuccess` — nie znamy ID elementu przed odpowiedzią serwera, więc optimistic update jest mniej praktyczny.

#### MAT-88: Fix utrzymania sesji — DONE

**Plik:** `apps/backend/src/controllers/auth.controller.ts`

**Root cause:** Endpoint `/api/auth/me` używał `optionalAuthMiddleware`, który przy wygasłym access tokenie (TTL: 15min) **cicho ignorował błąd weryfikacji** i zwracał `{ user: null }` zamiast 401. Axios interceptor na mobile nigdy nie dostawał 401, więc nie miał szansy odświeżyć tokena przez refresh endpoint (refresh token TTL: 30 dni).

**Flow przed fixem:**
1. Użytkownik zamyka app → access token wygasa po 15min
2. Otwarcie app → `useMe()` → GET /api/auth/me z wygasłym tokenem
3. `optionalAuthMiddleware` łapie błąd weryfikacji, ignoruje, zwraca `{ user: null }`
4. Mobile: `isAuthenticated = false` → redirect do loginu

**Rozwiązanie:** Zmiana `/api/auth/me` z `optionalAuthMiddleware` na `authMiddleware`.

**Flow po fixie:**
1. Otwarcie app → GET /api/auth/me z wygasłym tokenem
2. `authMiddleware` → 401 Unauthorized
3. Axios interceptor łapie 401 → pobiera refresh token z SecureStore → POST /api/auth/refresh
4. Backend rotuje tokeny (nowy access + nowy refresh) → interceptor zapisuje w SecureStore
5. Retry oryginalnego requestu z nowym access tokenem → sukces → użytkownik zalogowany

**Usunięto:** Import `optionalAuthMiddleware` z auth.controller.ts (nie jest już używany nigdzie w codebase).

#### MAT-65: Fix pustego znaku w logowaniu — DONE

**Plik:** `packages/shared/src/validators/auth.validator.ts`

**Rozwiązanie:** Dodano `.trim()` do walidatorów Zod w `loginSchema` i `registerSchema` dla pól: `name`, `login`, `password`. Trim jest aplikowany przed walidacją `.min()` / `.max()`, więc:
- Spacje na początku/końcu są automatycznie usuwane
- Działa zarówno na frontend (react-hook-form z zodResolver) jak i backend (@hono/zod-validator)
- String składający się z samych spacji poprawnie failuje walidację `.min(1)`

### 2026-03-08: Grupa 2 — UX: Klawiatura i interakcje (MAT-62, MAT-77, MAT-68, MAT-61)

#### MAT-62 + MAT-77: Keyboard-aware scroll + Login wyżej — DONE

**Pliki:** `apps/mobile/app/(auth)/login.tsx`, `apps/mobile/app/(auth)/register.tsx`

**Problem:** Klawiatura zasłaniała inputy na ekranach auth. Formularz logowania był wycentrowany (`justify-center`), co przy otwartej klawiaturze powodowało częściowe zasłonięcie pól.

**Rozwiązanie:** Owinięto oba ekrany auth w `KeyboardAvoidingView` + `ScrollView` (built-in RN, niezależne od zewnętrznych bibliotek):
- **Login:** `justify-center` → `justify-start pt-[25%]` — formularz wyżej, widoczny przy klawiaturze
- **Register:** `justify-center` → `justify-start pt-[15%]` — mniej top padding bo więcej pól (3 vs 2)
- `KeyboardAvoidingView` z `behavior="padding"` (iOS) / `"height"` (Android)
- `ScrollView` z `keyboardShouldPersistTaps="handled"` — umożliwia scroll przy otwartej klawiaturze

**Uwaga:** Lista elementów (`ListItemsContent`) już miała `KeyboardAvoidingView` — bez zmian.

#### MAT-68: Touch targets + Checkbox — DONE

**Plik:** `apps/mobile/src/components/ui/checkbox.tsx`

**Problem:** Checkbox miał `size-5` (20px) — poniżej minimum 44px (Apple HIG). Na fizycznych urządzeniach (Pixel 7a) trudno było trafić w checkbox.

**Rozwiązanie:**
- Zwiększono rozmiar z `size-5` (20px) do `size-7` (28px)
- Dodano `hitSlop={8}` — efektywny touch target: 28 + 8×2 = 44px

#### MAT-61: Blur input przy dialogu — DONE

**Plik:** `apps/mobile/src/components/ui/Dialog.tsx`

**Problem:** Po otwarciu dialogu klawiatura i focus na inpucie pod spodem pozostawały aktywne.

**Rozwiązanie:** Dodano `Keyboard.dismiss()` w `useEffect` wewnątrz `DialogContent` — przy każdym otwarciu dialogu klawiatura jest chowana. Dialogi z własnymi inputami (np. `CategorySelectDialog` w trybie tworzenia) mają `autoFocus` na swoich polach, więc focus przenosi się automatycznie.

### 2026-03-08: Grupa 3 — Cleanup (MAT-87)

#### MAT-87: Usunięcie WakeUpScreen — DONE

**Usunięte pliki:**
- `apps/mobile/src/components/guards/ServerWakeUpScreen.tsx`
- `apps/mobile/src/components/guards/ServerHealthGuard.tsx`
- `apps/mobile/src/api/serverHealth.api.ts`

**Zmienione pliki:**
- `apps/mobile/app/index.tsx` — usunięto `ServerHealthGuard` wrapper, spłaszczono `IndexContent` do default exportu. Aplikacja startuje bezpośrednio do ekranu auth lub main.
- `apps/mobile/src/api/queryKeys.ts` — usunięto klucz `server.health`.

---

## Kolejność realizacji (priorytet)

### 1. Bugi i stabilność (najwyższy priorytet) — DONE (2026-03-08)

| # | Zadanie | Priorytet | Status | Plan |
|---|---------|-----------|--------|------|
| 1 | **MAT-90** — Optimistic updates / lag Checkbox | Urgent | DONE | [Plan](./MAT-90-optimistic-updates-checkbox-lag.md) |
| 2 | **MAT-88** — Fix utrzymania sesji | High | DONE | [Plan](./MAT-88-fix-session-persistence.md) |
| 3 | **MAT-65** — Fix pustego znaku w logowaniu | High | DONE | [Plan](./MAT-65-fix-empty-char-login-input.md) |

**Uzasadnienie:** Bugi blokują codzienne użytkowanie. MAT-90 jest najważniejszy bo wpływa na core UX przy każdej interakcji.

### 2. UX — Klawiatura i interakcje — DONE (2026-03-08)

| # | Zadanie | Priorytet | Status | Plan |
|---|---------|-----------|--------|------|
| 4 | **MAT-62 + MAT-77** — Keyboard-aware scroll + login wyżej | High | DONE | [Plan](./MAT-62-keyboard-aware-scroll.md) |
| 5 | **MAT-68** — Touch targets + Checkbox fix | High | DONE | [Plan](./MAT-68-touch-targets-checkbox.md) |
| 6 | **MAT-61** — Blur input przy dialogu | Low | DONE | [Plan](./MAT-61-blur-input-on-dialog.md) |

**Uzasadnienie:** Klawiatura zasłaniająca inputy i niereagujące checkboxy krytycznie wpływają na UX.

### 3. Cleanup (szybkie wygrane) — DONE (2026-03-08)

| # | Zadanie | Priorytet | Status | Plan |
|---|---------|-----------|--------|------|
| 7 | **MAT-87** — Usunięcie WakeUpScreen | High | DONE | [Plan](./MAT-87-remove-wakeup-screen.md) |

### 4. Infrastruktura (fundament pod dalszy rozwój)

| # | Zadanie | Priorytet | Plan | Zależności |
|---|---------|-----------|------|------------|
| 8 | **MAT-48** — Testy integracyjne backend | High | [Plan](./MAT-48-integration-tests.md) | - |
| 9 | **MAT-51** — CI/CD | High | [Plan](./MAT-51-ci-cd.md) | MAT-48 |
| 10 | **MAT-70** — Knip | Low | [Plan](./MAT-70-add-knip.md) | - |
| 11 | **MAT-89** — Husky | Low | [Plan](./MAT-89-add-husky.md) | MAT-48 |

**Uzasadnienie:** Testy (MAT-48) blokują CI (MAT-51) i Husky (MAT-89).

### 5. Funkcjonalności listy

| # | Zadanie | Priorytet | Plan | Zależności |
|---|---------|-----------|------|------------|
| 12 | **MAT-74** — Odznaczanie filtra | Medium | [Plan](./MAT-74-deselect-filter.md) | - |
| 13 | **MAT-75** — Auto-kategoria z filtra | Medium | [Plan](./MAT-75-auto-category-from-filter.md) | MAT-74 |
| 14 | **MAT-73** — Wyszukiwanie elementów | Medium | [Plan](./MAT-73-search-list-items.md) | - |
| 15 | **MAT-64** — Sekcja zaznaczonych (Google Keep) | Low | [Plan](./MAT-64-completed-items-section.md) | - |
| 16 | **MAT-76** — Licznik elementów "X/Y" | Low | [Plan](./MAT-76-item-count-display.md) | - |
| 17 | **MAT-82** — Reset checkboxów | Low | [Plan](./MAT-82-reset-checkboxes.md) | - |
| 18 | **MAT-83** — Masowe usuwanie zaznaczonych | Low | [Plan](./MAT-83-delete-all-completed.md) | MAT-64 |
| 19 | **MAT-72** — Animacje zaznaczenia | Low | [Plan](./MAT-72-checkbox-animations.md) | MAT-64 |
| 20 | **MAT-84** — Redesign filtrów | Low | [Plan](./MAT-84-filter-redesign.md) | MAT-74, MAT-75 |
| 21 | **MAT-85** — Więcej ikon kategorii | Low | [Plan](./MAT-85-more-category-icons.md) | - |

**Uzasadnienie:** MAT-74 blokuje MAT-75. MAT-64 blokuje MAT-83 i MAT-72. MAT-84 lepiej po MAT-74/75.

### 6. Architektura (duże zmiany)

| # | Zadanie | Priorytet | Plan | Zależności |
|---|---------|-----------|------|------------|
| 22 | **MAT-49** — Hono RPC | Low | [Plan](./MAT-49-hono-rpc.md) | - |
| 23 | **MAT-18** — Better Auth | Low | [Plan](./MAT-18-better-auth.md) | MAT-49, MAT-88 |
| 24 | **MAT-45** — Real-time (WebSockets) | Low | [Plan](./MAT-45-realtime-editing.md) | MAT-49 |
| 25 | **MAT-35** — Tryb offline | Low | [Plan](./MAT-35-offline-mode.md) | MAT-45 |

**Uzasadnienie:** MAT-49 (Hono RPC) przed MAT-18 i MAT-45 aby nie refaktorować dwa razy. MAT-35 po MAT-45 bo sync offline musi współgrać z WS.

### 7. UI Redesign

| # | Zadanie | Priorytet | Plan | Zależności |
|---|---------|-----------|------|------------|
| 26 | **MAT-6** — Apple Glass UI redesign | Low | [Plan](./MAT-6-ui-redesign.md) | Stabilna architektura |

**Uzasadnienie:** Duży refactor — lepiej po zakończeniu zmian funkcjonalnych i architektonicznych. Mockupy dostarczone.

---

## Kluczowe ustalenia z analizy

### MAT-90 (Optimistic updates)
- Priorytet #1 — jeden z najistotniejszych punktów
- TanStack Query optimistic updates pattern: `onMutate` (cancelQueries → snapshot → setQueryData) → `onError` (rollback) → `onSettled` (invalidate)
- Istniejąca implementacja nie działa na fizycznych urządzeniach (Pixel 7a, Samsung)
- Priorytet mutacji: toggle checkbox → dodawanie → edycja → usuwanie

### MAT-88 (Sesja)
- Po zamknięciu app na Androidzie użytkownik jest wylogowany
- Zbadać: SecureStore persist, auth init flow, refresh token TTL

### MAT-65 (Pusty znak)
- Fix: `.trim()` na wartościach email i hasła (w Zod lub onSubmit)

### MAT-62 + MAT-77 (Klawiatura + Login)
- Realizowane razem — `react-native-keyboard-aware-scroll-view`
- Wszystkie ekrany z inputami, Android + iOS
- Login: dodatkowo statyczne przesunięcie formularza wyżej

### MAT-68 (Touch targets)
- Min. 44x44px (Apple HIG)
- Problem: działa lokalnie, nie na produkcji (Pixel 7a)
- Wszystkie Checkboxy w aplikacji

### MAT-61 (Input blur)
- `Keyboard.dismiss()` przy otwarciu dialogu
- Auto-focus na input wewnątrz dialogu

### MAT-72 (Animacje)
- Styl Google Keep, `react-native-reanimated`
- Po MAT-64 (sekcja zaznaczonych)

### MAT-87 (WakeUpScreen)
- Ekran budzący backend z cold start — usunąć, nie potrzebny

### MAT-48 (Testy)
- Backend only, Vitest, rozszerzenie istniejącej konfiguracji
- Pokrycie: auth, CRUD (lists, items, categories, shares), autoryzacja
- Część CI (MAT-51)

### MAT-51 (CI/CD)
- GitHub Actions: lint + typecheck + testy
- CD: deploy backendu na Vercel
- Mobile build: ręcznie/lokalnie

### MAT-89 (Husky)
- pre-push: lint + format + typecheck + testy
- commit-msg: `scope: Message` (np. `backend: Add new function`)
- lint-staged z BiomeJS

### MAT-70 (Knip)
- Wszystkie pakiety monorepo, na razie raportowanie (nie blokuje CI)

### MAT-74 (Odznaczanie filtra)
- Domyślny: "Wszystkie", single select, toggle na kliknięcie

### MAT-75 (Auto-kategoria)
- Single filter, auto-assign, zmiana po dodaniu przez edycję

### MAT-73 (Wyszukiwanie)
- Client-side, po nazwie, search bar w headerze, debounce 300ms

### MAT-64 (Sekcja completed)
- Google Keep style, domyślnie zwinięta, pozycja zachowywana

### MAT-83 (Masowe usuwanie)
- Przycisk w toolbarze, dialog potwierdzenia, jak usuwanie pojedynczego ale batch

### MAT-82 (Reset)
- Przycisk w toolbarze, dialog potwierdzenia, odznaczenie wszystkich checkboxów

### MAT-76 (Licznik)
- Format "5/12" (zaznaczone/wszystkie)

### MAT-84 (Filtry redesign)
- Problem: dwa poziomy filtrów wyświetlane tak samo
- Mogą zostać dwa, ale inny layout (np. dropdowny jak w mockupach)

### MAT-85 (Ikony)
- ~100 ikon z Lucide, picker z wyszukiwaniem

### MAT-49 (Hono RPC)
- Cel: auto type-safety, nie pisać ręcznych typów
- Zachować validatory Zod, usunąć ręczne interfejsy

### MAT-18 (Better Auth)
- Zastąpienie JWT, email/password + Google Sign-In
- Nie blokuje MAT-88

### MAT-45 (Real-time)
- WebSockets, synchronizacja wszystkiego
- Uwaga: weryfikacja czy Vercel wspiera WS

### MAT-35 (Offline)
- React Query persistence + NetInfo + kolejkowanie mutacji
- Konflikty: last-write-wins z timestampem

### MAT-6 (UI Redesign)
- Apple Glass UI, glassmorphism, gradienty, animacje
- Mockupy dostarczone (My Lists, List Detail, Categories, Profile)
- React Native Reusables (bez zmiany), expo-blur, expo-linear-gradient

---

## Graf zależności

```
MAT-90 (optimistic updates)
MAT-88 (sesja) ──────────────────────┐
MAT-65 (trim)                        │
MAT-62+77 (klawiatura)               │
MAT-68 (touch targets)               │
MAT-61 (blur dialog)                 │
MAT-87 (WakeUpScreen)                │
MAT-48 (testy) ─────┬───────────┐    │
                     │           │    │
MAT-51 (CI/CD) ◄────┘           │    │
MAT-70 (knip)                   │    │
MAT-89 (husky) ◄────────────────┘    │
MAT-74 (filtr toggle) ──┐            │
MAT-75 (auto kategoria) ◄            │
MAT-73 (wyszukiwanie)                │
MAT-64 (sekcja completed) ──┬──┐     │
MAT-76 (licznik)             │  │     │
MAT-82 (reset)               │  │     │
MAT-83 (masowe usuwanie) ◄──┘  │     │
MAT-72 (animacje) ◄────────────┘     │
MAT-84 (filtry redesign) ◄── MAT-74,75
MAT-85 (ikony)                       │
MAT-49 (Hono RPC) ──┬──┐             │
MAT-18 (Better Auth) ◄─┤◄────────────┘
MAT-45 (real-time) ◄───┘
MAT-35 (offline) ◄── MAT-45
MAT-6 (UI redesign) ◄── stabilna architektura
```
