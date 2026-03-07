# MAT-65: Naprawić problem pustego znaku w inpucie logowania

- **Priorytet:** High
- **Label:** Bug
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-65/naprawic-problem-pustego-znaku-w-inpucie-logowania

## Cel

Wyeliminować problem trailing/leading spacji w polach logowania, które powodują błąd.

## Kroki realizacji

1. **Zlokalizować formularz logowania**
   - Znaleźć komponent w `app/(auth)/login.tsx`
   - Sprawdzić react-hook-form setup i Zod validator

2. **Dodać trim**
   - Dodać `.trim()` na wartościach email i hasła przed wysłaniem
   - Opcja A: w `onSubmit` handlera
   - Opcja B: w Zod validatorze (`z.string().trim()`) w `packages/shared`

3. **Sprawdzić też register**
   - Analogiczny fix na ekranie rejestracji

## Zależności

- Brak

## Definition of done

- [ ] Spacje na początku/końcu email i hasła nie powodują błędu logowania
- [ ] Fix zastosowany na login i register
