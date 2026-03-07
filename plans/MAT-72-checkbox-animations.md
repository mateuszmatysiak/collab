# MAT-72: Obsłużyć animacje po zaznaczeniu

- **Priorytet:** Low
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-72/obsluzyc-animacje-po-zaznaczeniu

## Cel

Zaznaczenie elementu listy ma płynną animację w stylu Google Keep (strikethrough + fade + przesunięcie).

## Kontekst

- Animacja wzorowana na Google Keep
- Użyć `react-native-reanimated`
- Lepiej realizować po MAT-64 (sekcja zaznaczonych) — animacja przesunięcia do dolnej sekcji

## Kroki realizacji

1. **Zainstalować/skonfigurować react-native-reanimated**
   - Sprawdzić czy jest już w projekcie
   - Jeśli nie: `pnpm -C apps/mobile add react-native-reanimated` + konfiguracja babel plugin

2. **Zbadać animację Google Keep**
   - Strikethrough tekstu (animowany z lewej do prawej)
   - Lekki fade (opacity zmniejsza się)
   - Po chwili: element przesuwa się do sekcji "Completed"

3. **Implementacja**
   - `useAnimatedStyle` do animacji opacity i strikethrough
   - `withTiming` / `withSequence` do sekwencji animacji
   - Layout animation (`LayoutAnimationConfig`) dla przesunięcia między sekcjami
   - Animacja checkboxa: fill + scale

4. **Integracja z sekcją zaznaczonych (MAT-64)**
   - Animacja przesunięcia elementu z sekcji "Pending" do "Completed"
   - Odwrotna animacja przy odznaczeniu

## Zależności

- MAT-64 (sekcja zaznaczonych) — lepiej realizować po tym

## Definition of done

- [ ] Zaznaczenie checkbox animuje: strikethrough + fade
- [ ] Element przesuwa się do sekcji "Completed" z animacją
- [ ] Odznaczenie ma odwrotną animację
- [ ] Animacje są płynne (60fps) na Pixel 7a
