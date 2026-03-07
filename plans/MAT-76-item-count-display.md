# MAT-76: Informacja o ilości elementów w widoku listy

- **Priorytet:** Low
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-76/dodac-informacje-o-ilosci-elementow-w-widoku-listy

## Cel

Na ekranie listy list widoczna informacja "zaznaczone/wszystkie" (np. "5/12") dla każdej listy.

## Kroki realizacji

1. **Sprawdzić dane z API**
   - Czy endpoint listy list zwraca liczbę elementów / zaznaczonych
   - Jeśli nie: dodać pola `total_items` i `completed_items` do response (lub obliczyć na froncie)

2. **Zaktualizować komponent karty listy**
   - Zlokalizować komponent na ekranie `app/(tabs)/lists/index.tsx`
   - Dodać wyświetlanie `${completedCount}/${totalCount}`

3. **Format**
   - "5/12" — zaznaczone/wszystkie
   - Umieszczenie: pod nazwą listy lub obok niej

## Zależności

- Brak

## Definition of done

- [ ] Każda karta listy wyświetla "X/Y" (zaznaczone/wszystkie)
- [ ] Dane poprawnie obliczane
