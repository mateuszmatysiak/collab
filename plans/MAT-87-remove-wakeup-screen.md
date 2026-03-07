# MAT-87: Usunąć WakeUpScreen

- **Priorytet:** High
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-87/usunac-wakeupscreen

## Cel

Usunąć ekran budzenia backendu (WakeUpScreen) — nie jest już potrzebny.

## Kroki realizacji

1. **Zlokalizować WakeUpScreen**
   - Znaleźć komponent i jego route w `apps/mobile/`
   - Sprawdzić powiązania (health check, nawigacja)

2. **Usunąć komponent**
   - Usunąć plik komponentu
   - Usunąć route z Expo Router
   - Usunąć powiązaną logikę (health check endpoint, API call)

3. **Zaktualizować flow nawigacji**
   - Upewnić się, że app startuje bezpośrednio do auth/main
   - Sprawdzić `app/_layout.tsx` — czy nie ma redirectu do WakeUpScreen

4. **Cleanup**
   - Usunąć nieużywane importy
   - Usunąć API funkcję `serverHealth` jeśli używana tylko przez WakeUpScreen

## Zależności

- Brak

## Definition of done

- [ ] WakeUpScreen usunięty
- [ ] Aplikacja startuje bezpośrednio do ekranu auth lub main
- [ ] Brak nieużywanego kodu
