# MAT-51: Obsłużyć CI/CD

- **Priorytet:** High
- **Label:** Feature
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-51/obsluzyc-cicd

## Cel

GitHub Actions: CI (lint, typecheck, testy) + CD (deploy backendu na Vercel).

## Kontekst

- Platforma: GitHub Actions (istnieje już workflow)
- CI: lint, typecheck, testy (bez build mobile)
- CD: deploy backendu na Vercel
- Mobile build: ręcznie/lokalnie (nie w CI)

## Kroki realizacji

1. **Rozszerzyć workflow CI**
   - Trigger: push na master, pull requests
   - Steps:
     - Checkout
     - Setup Node 22 + pnpm 9.15
     - Install dependencies
     - `pnpm lint`
     - `pnpm typecheck`
     - `pnpm test` (backend integration tests z MAT-48)

2. **Skonfigurować CD (Vercel)**
   - Opcja A: Vercel GitHub Integration (auto-deploy na push do master)
   - Opcja B: Vercel CLI w GitHub Actions (`vercel --prod`)
   - Skonfigurować env variables w Vercel (DATABASE_URL, JWT_SECRET, etc.)

3. **Konfiguracja sekretów**
   - GitHub Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   - Database URL dla testów w CI (test database)

4. **Status badges**
   - Dodać badge CI status do README

## Zależności

- MAT-48 (testy integracyjne — CI powinno je uruchamiać)

## Definition of done

- [ ] Push na master uruchamia CI: lint + typecheck + testy
- [ ] PR do master uruchamia CI
- [ ] Po sukcesie CI na master — auto-deploy backendu na Vercel
- [ ] Env variables skonfigurowane
