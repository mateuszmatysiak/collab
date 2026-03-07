# MAT-70: Dodać Knip

- **Priorytet:** Low
- **Label:** Feature
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-70/dodac-knip

## Cel

Wykrywanie nieużywanych eksportów, plików i zależności we wszystkich pakietach monorepo.

## Kroki realizacji

1. **Instalacja**
   - `pnpm add -Dw knip`

2. **Konfiguracja**
   - Stworzyć `knip.json` (lub `knip.ts`) w rootcie
   - Skonfigurować workspace entries dla:
     - `apps/backend/`
     - `apps/mobile/`
     - `packages/shared/`
   - Ustawić ignore patterns dla generowanych plików, konfiguracji

3. **Pierwszy run i kalibracja**
   - `pnpm knip`
   - Przeanalizować wyniki
   - Naprawić false positives w konfiguracji (ignore, entry points)
   - Opcjonalnie: naprawić prawdziwe unused exports/files

4. **Dodać script**
   - `"knip": "knip"` w root `package.json`

5. **Opcjonalnie: CI (non-blocking)**
   - Dodać jako osobny step w CI workflow (continue-on-error: true)

## Zależności

- Brak

## Definition of done

- [ ] `pnpm knip` działa bez false positives
- [ ] Raportuje nieużywane eksporty/pliki/zależności
- [ ] Script dodany do package.json
