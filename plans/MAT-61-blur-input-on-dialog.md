# MAT-61: Wyłączyć zaznaczony input gdy wejdziemy do dialogu

- **Priorytet:** Low
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-61/wylaczyc-zaznaczony-input-pod-spodem-gdy-wejdziemy-do-dialogu

## Cel

Po otwarciu dialogu input pod spodem traci focus. Jeśli dialog zawiera input, ten powinien być aktywny.

## Kroki realizacji

1. **Zlokalizować logikę otwierania dialogów**
   - Sprawdzić komponenty dialogów w `components/lists/` i `components/ui/`
   - Zidentyfikować które dialogi mają inputy wewnątrz

2. **Dodać blur przy otwarciu dialogu**
   - Przy otwarciu dialogu: `Keyboard.dismiss()` — chowa klawiaturę i blur-uje aktywny input
   - Alternatywnie: użyć ref na inpucie i wywołać `inputRef.current?.blur()`

3. **Auto-focus na inpucie w dialogu**
   - Jeśli dialog zawiera input: `autoFocus={true}` lub `inputRef.current?.focus()` po otwarciu

## Zależności

- Brak

## Definition of done

- [ ] Otwarcie dialogu chowa klawiaturę i deaktywuje input pod spodem
- [ ] Input wewnątrz dialogu jest aktywny (jeśli istnieje)
