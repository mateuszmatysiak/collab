# MAT-48: Napisać testy integracyjne backend

- **Priorytet:** High
- **Label:** Feature
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-48/napisac-testy-e2e-lubi-integracyjne

## Cel

Pokrycie testami integracyjnymi krytycznych endpointów backendu (Vitest).

## Kontekst

- Istnieje konfiguracja Vitest i podstawowy test
- Testy integracyjne backend only (E2E mobile na później)
- Testy mają być częścią CI (MAT-51)

## Kroki realizacji

1. **Rozszerzyć konfigurację testową**
   - Sprawdzić istniejący setup w `apps/backend/`
   - Upewnić się, że testy mają osobną bazę danych (testową)
   - Setup/teardown: czysta baza przed każdym testem (lub suite)

2. **Testy autentykacji**
   - POST /auth/register — sukces, duplikat email, walidacja
   - POST /auth/login — sukces, złe hasło, nieistniejący user
   - POST /auth/refresh — sukces, wygasły token, nieistniejący token
   - POST /auth/logout — sukces, brak tokena

3. **Testy autoryzacji**
   - Requesty bez tokena → 401
   - Requesty z wygasłym tokenem → 401
   - Dostęp do cudzej listy → 403

4. **Testy CRUD: Listy**
   - POST /lists — tworzenie
   - GET /lists — pobieranie swoich list
   - GET /lists/:id — szczegóły listy
   - PATCH /lists/:id — edycja
   - DELETE /lists/:id — usunięcie

5. **Testy CRUD: Elementy listy**
   - POST /lists/:id/items — dodawanie elementu
   - PATCH /items/:id — edycja elementu
   - PATCH /items/:id/toggle — toggle completion
   - DELETE /items/:id — usunięcie elementu

6. **Testy CRUD: Kategorie**
   - POST /categories — tworzenie
   - GET /categories — pobieranie
   - PATCH /categories/:id — edycja
   - DELETE /categories/:id — usunięcie

7. **Testy: Udostępnienia**
   - POST /lists/:id/shares — udostępnienie listy
   - PATCH /shares/:id — zmiana roli
   - DELETE /shares/:id — cofnięcie dostępu

## Zależności

- Brak (niezależne, ale blokuje MAT-51 i MAT-89)

## Definition of done

- [ ] Testy pokrywają auth (register, login, refresh, logout)
- [ ] Testy pokrywają CRUD list, items, categories, shares
- [ ] Testy autoryzacji (401, 403)
- [ ] Wszystkie testy przechodzą
- [ ] Testy mogą być uruchomione w CI
