# MAT-18: Obsłużyć Better Auth

- **Priorytet:** Low
- **Label:** Feature
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-18/obsluzyc-better-auth

## Cel

Zastąpić ręczną implementację JWT biblioteką Better Auth z email/password + Google Sign-In.

## Kontekst

- Cel: zastąpienie obecnej ręcznej implementacji JWT
- Providery: email/password + Google Sign-In
- Nie blokuje MAT-88 (sesja — naprawiana niezależnie)

## Kroki realizacji

1. **Instalacja Better Auth (backend)**
   - `pnpm -C apps/backend add better-auth`
   - Docs: https://www.better-auth.com

2. **Konfiguracja adaptera Drizzle**
   - https://www.better-auth.com/docs/adapters/drizzle
   - Migracja/rozszerzenie tabel users, sessions
   - Generowanie migracji

3. **Integracja z Hono**
   - https://www.better-auth.com/docs/integrations/hono
   - Zastąpić ręczny middleware auth
   - Skonfigurować routes auth

4. **Providery**
   - Email/password (domyślny)
   - Google Sign-In — konfiguracja OAuth credentials

5. **Konfiguracja na Expo (mobile)**
   - https://www.better-auth.com/docs/integrations/expo
   - Zastąpić obecny auth context
   - Skonfigurować storage (SecureStore)

6. **Migracja istniejących kont**
   - Sprawdzić kompatybilność hashowania haseł
   - Migracja danych użytkowników
   - Usunięcie tabeli refresh_tokens (Better Auth zarządza sesjami)

7. **Cleanup**
   - Usunąć ręczną implementację JWT
   - Usunąć middleware auth
   - Usunąć kontroler auth
   - Zaktualizować testy

## Zależności

- Lepiej po MAT-49 (Hono RPC)
- Lepiej po MAT-88 (fix sesji — niezależny fix)

## Definition of done

- [ ] Auth działa przez Better Auth
- [ ] Email/password login działa
- [ ] Google Sign-In działa
- [ ] Stara implementacja JWT usunięta
- [ ] Istniejące konta zmigrowane
- [ ] Testy zaktualizowane
