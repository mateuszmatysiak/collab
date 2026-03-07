# MAT-68: Zwiększyć pole klikalności elementów i weryfikacja Checkboxa

- **Priorytet:** High
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-68/zwiekszyc-pole-klikalnosci-elementow-i-weryfikacja-dzialania-checkboxa

## Cel

Checkbox i inne interaktywne elementy reagują niezawodnie z minimum 44x44px polem dotykowym.

## Kontekst

- Checkbox działa poprawnie lokalnie, ale na fizycznych urządzeniach reaguje z opóźnieniem lub w ogóle
- Problem dotyczy wszystkich Checkboxów w aplikacji
- Minimalne pole klikalności: 44x44px (Apple HIG)
- Powiązane z MAT-90 (optimistic updates — część lagu może wynikać z czekania na API)

## Kroki realizacji

1. **Zbadać komponent Checkbox**
   - Sprawdzić `components/ui/checkbox.tsx` — wymiary, Pressable/TouchableOpacity
   - Sprawdzić `hitSlop` — czy jest ustawiony
   - Zmierzyć aktualny touch target

2. **Zwiększyć touch target**
   - Dodać `hitSlop={{ top: X, bottom: X, left: X, right: X }}` aby osiągnąć min. 44x44px
   - Lub: zwiększyć padding wewnątrz Pressable

3. **Zbadać problem na produkcji**
   - Możliwe przyczyny braku reakcji:
     - Overlapping gesture handlers (np. drag handle obok checkbox)
     - Zbyt mały touch target na urządzeniu z większym DPI
     - Re-render issue po kliknięciu
   - Sprawdzić czy nie ma konfliktu z `react-native-gesture-handler`

4. **Poprawić inne elementy**
   - Zastosować analogiczne poprawki dla Input i Button
   - Sprawdzić wszystkie Pressable w aplikacji

5. **Testowanie**
   - Pixel 7a — checkbox reaguje natychmiast
   - Szybkie wielokrotne kliknięcia — każde zarejestrowane

## Zależności

- Powiązane z MAT-90 (optimistic updates)

## Definition of done

- [ ] Checkbox reaguje natychmiast i niezawodnie na Pixel 7a
- [ ] Wszystkie interaktywne elementy mają min. 44x44px touch target
- [ ] Brak problemów z overlapping gestures
