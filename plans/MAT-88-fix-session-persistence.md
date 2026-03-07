# MAT-88: Naprawić problem utrzymania sesji

- **Priorytet:** High
- **Label:** Bug
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-88/naprawic-problem-utrzymania-sesji

## Cel

Użytkownik po zamknięciu i ponownym otwarciu aplikacji na Androidzie powinien pozostać zalogowany.

## Kontekst

- Problem: po zamknięciu aplikacji i ponownym otwarciu użytkownik jest wylogowany
- Testowane na Pixel 7a (Android)
- Tokeny powinny być persystowane w SecureStore

## Kroki realizacji

1. **Zbadać flow persystowania tokenów**
   - Sprawdzić `contexts/auth.context.tsx` — jak tokeny są zapisywane do SecureStore
   - Sprawdzić czy `SecureStore.setItemAsync` jest wywoływane po login/refresh
   - Sprawdzić czy `SecureStore.getItemAsync` jest wywoływane przy starcie aplikacji

2. **Zbadać flow inicjalizacji auth**
   - Sprawdzić co dzieje się przy starcie aplikacji — czy próbuje odczytać tokeny z SecureStore
   - Czy jest próba refreshu tokenu przy starcie
   - Czy stan auth jest ustawiany na "zalogowany" jeśli tokeny istnieją

3. **Zbadać TTL refresh tokena**
   - Backend: sprawdzić tabelę `refresh_tokens` — jaki jest czas wygaśnięcia
   - Czy refresh token nie wygasa zbyt szybko (np. minuty zamiast dni)

4. **Zbadać Axios interceptor**
   - Czy interceptor poprawnie łapie 401 i próbuje refresh
   - Czy po refresh aktualizuje tokeny w SecureStore

5. **Fix i testowanie**
   - Naprawić zidentyfikowany problem
   - Przetestować na Pixel 7a: login → zamknięcie app → otwarcie → powinien być zalogowany

## Zależności

- Brak

## Definition of done

- [ ] Po zamknięciu i otwarciu aplikacji użytkownik pozostaje zalogowany
- [ ] Wylogowanie następuje tylko gdy refresh token wygaśnie lub użytkownik wyloguje się ręcznie
- [ ] Przetestowane na Android (Pixel 7a)
