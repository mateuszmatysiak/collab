# MAT-49: Obsłużyć Hono RPC i współdzielenie typów

- **Priorytet:** Low
- **Label:** Feature
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-49/obsluzyc-hono-rpc-i-wspoldzielenie-typow

## Cel

Automatyczne type-safety między backendem a frontendem — bez ręcznego pisania typów requestów/responseów.

## Kontekst

- Cel: frontend i backend mają wspólne typy
- Funkcje formularza i response typowane automatycznie
- Nie chcemy ręcznie pisać typów dla requestów i responseów

## Kroki realizacji

1. **Przestudiować Hono RPC**
   - Docs: https://hono.dev/docs/guides/rpc
   - Pattern: https://github.com/kedom1337/hono-rpc-query
   - Zrozumieć chain pattern z `.route()`

2. **Refaktorować backend routes**
   - Zmienić routes na chain pattern aby eksportowały typy
   - Eksportować `AppType` z backendu:
     ```typescript
     const app = new Hono()
       .route("/auth", authRoutes)
       .route("/lists", listRoutes)
       // ...
     export type AppType = typeof app
     ```

3. **Skonfigurować klienta na mobile**
   - Zainstalować `@hono/client` (lub odpowiedni pakiet)
   - Zastąpić axios klientem Hono RPC:
     ```typescript
     import { hc } from "hono/client"
     import type { AppType } from "@collab-list/backend" // lub shared
     const client = hc<AppType>("http://...")
     ```

4. **Migracja endpointów**
   - Zacząć od jednego endpointu (np. lists) — proof of concept
   - Zweryfikować type-safety
   - Migrować resztę endpointów

5. **Cleanup packages/shared**
   - Zachować validatory Zod (używane na obu stronach)
   - Usunąć ręczne typy interfejsów które są teraz generowane przez RPC

6. **Integracja z React Query**
   - Sprawdzić `hono-rpc-query` pattern
   - Zapewnić że query keys i typy działają poprawnie

## Zależności

- Lepiej przed MAT-18 (Better Auth) aby nie refaktorować dwa razy

## Definition of done

- [ ] Frontend ma pełne type-safety z backendem
- [ ] Zmiana endpointu powoduje błąd kompilacji na froncie
- [ ] Axios zastąpiony klientem Hono RPC
- [ ] Ręczne typy requestów/responseów usunięte
