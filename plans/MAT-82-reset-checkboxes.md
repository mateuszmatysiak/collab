# MAT-82: Resetowanie stanu elementów listy

- **Priorytet:** Low
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-82/obsluzyc-resetowanie-stanu-elementow-listy

## Cel

Przycisk w toolbarze do odznaczenia wszystkich checkboxów z dialogiem potwierdzenia.

## Kroki realizacji

1. **Dodać przycisk w toolbarze**
   - Przycisk "Resetuj zaznaczenia" w menu/toolbarze listy
   - Widoczny tylko gdy są zaznaczone elementy
   - Ikona: RotateCcw / RefreshCw

2. **Dialog potwierdzenia**
   - "Czy na pewno chcesz odznaczyć wszystkie elementy?"
   - Przyciski: Anuluj / Resetuj

3. **Logika resetowania**
   - Batch update `is_completed = false` dla wszystkich elementów listy
   - Iteracja po istniejącym endpoincie toggle/update
   - Lub: nowy endpoint batch reset (opcjonalnie)

4. **Optimistic update**
   - `onMutate`: ustawić `is_completed = false` w cache
   - `onError`: rollback
   - `onSettled`: invalidate

## Zależności

- Brak

## Definition of done

- [ ] Przycisk "Resetuj zaznaczenia" w toolbarze
- [ ] Dialog potwierdzenia
- [ ] Wszystkie checkboxy odznaczone po potwierdzeniu
- [ ] Optimistic update
