Uruchom po kolei poniższe komendy weryfikacyjne. Po każdej komendzie, jeśli wystąpią błędy — napraw je przed przejściem do następnej. Po naprawie uruchom tę samą komendę ponownie, aby upewnić się, że problem został rozwiązany.

Kolejność komend:

1. `pnpm typecheck` — sprawdzenie typów TypeScript
2. `pnpm lint` — linting i formatowanie (BiomeJS)
3. `pnpm knip` — wykrywanie nieużywanego kodu i zależności
4. `pnpm test:mobile` — testy mobilne (Jest)
5. `pnpm test:backend` — testy backendowe (Vitest)

Zasady:
- Uruchamiaj komendy sekwencyjnie — następna dopiero po naprawieniu błędów z poprzedniej.
- Jeśli naprawa jednej komendy może wpłynąć na wcześniejsze — uruchom je ponownie.
- Jeśli nie jesteś w stanie naprawić błędu samodzielnie, opisz problem i zaproponuj rozwiązanie. Nie wprowadzaj proponowanej zmiany bez mojej wyraźnej akceptacji.
- Na koniec wypisz podsumowanie: które komendy przeszły od razu, a które wymagały napraw.