# MAT-83: Usunięcie wszystkich zaznaczonych elementów

- **Priorytet:** Low
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-83/obsluzyc-usuniecie-wszystkich-zaznaczonych-elementow-listy

## Cel

Przycisk w toolbarze do masowego usunięcia zaznaczonych elementów z dialogiem potwierdzenia.

## Kroki realizacji

1. **Dodać przycisk w toolbarze**
   - Przycisk "Usuń zaznaczone" w menu/toolbarze listy
   - Widoczny tylko gdy są zaznaczone elementy
   - Ikona: Trash / TrashAll

2. **Dialog potwierdzenia**
   - "Czy na pewno chcesz usunąć X zaznaczonych elementów?"
   - Przyciski: Anuluj / Usuń

3. **Logika usunięcia**
   - Pobrać wszystkie elementy z `is_completed === true`
   - Batch delete — iteracja po istniejącym endpoincie DELETE /items/:id
   - Lub: nowy endpoint batch delete (opcjonalnie)

4. **Optimistic update**
   - `onMutate`: usunąć elementy z cache
   - `onError`: rollback
   - `onSettled`: invalidate

## Zależności

- MAT-64 (sekcja zaznaczonych — przycisk logicznie pasuje do tej sekcji)

## Definition of done

- [ ] Przycisk "Usuń zaznaczone" w toolbarze
- [ ] Dialog potwierdzenia przed usunięciem
- [ ] Masowe usunięcie działa poprawnie
- [ ] Optimistic update
