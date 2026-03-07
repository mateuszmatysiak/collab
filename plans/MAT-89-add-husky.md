# MAT-89: Dodać Husky

- **Priorytet:** Low
- **Label:** Feature
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-89/dodac-husky

## Cel

Git hooks: pre-push (lint + format + typecheck + testy), commit-msg (conventional commits), lint-staged.

## Kontekst

- Format commit message: `scope: Message` (np. `backend: Add new function to get list items`)
- lint-staged: linter tylko na zmienionych plikach (BiomeJS)

## Kroki realizacji

1. **Instalacja**
   - `pnpm add -Dw husky lint-staged`
   - `npx husky init`

2. **Konfiguracja lint-staged**
   - W `package.json`:
     ```json
     "lint-staged": {
       "*.{ts,tsx,js,jsx}": ["biome check --write"]
     }
     ```

3. **Hook: pre-push**
   - `.husky/pre-push`:
     ```bash
     pnpm lint-staged
     pnpm typecheck
     pnpm test
     ```

4. **Hook: commit-msg**
   - `.husky/commit-msg`:
     - Walidacja formatu: `scope: Message`
     - Dozwolone scope: `backend`, `mobile`, `shared`, `chore`, `docs`, `ci`
     - Prosty regex lub `commitlint` z custom rules

5. **Dokumentacja**
   - Dodać info o hookach do README lub CLAUDE.md

## Zależności

- MAT-48 (testy — pre-push je uruchamia)

## Definition of done

- [ ] Push odrzucany gdy lint/typecheck/testy failują
- [ ] Commit odrzucany przy złym formacie wiadomości
- [ ] lint-staged uruchamia BiomeJS tylko na zmienionych plikach
