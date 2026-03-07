# MAT-84: Zmienić obsługę filtrów w widoku listy

- **Priorytet:** Low
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-84/zmienic-obsluge-filtrow-w-widoku-z-elementami-listy

## Cel

Usprawnić wyświetlanie dwóch poziomów filtrów (status + kategoria) — inny, czytelniejszy layout.

## Kontekst

- Problem: dwa poziomy filtrów wyświetlane w ten sam sposób — nieczytelne
- Mogą zostać dwa poziomy, ale muszą być wizualnie rozdzielone
- Nie blokuje MAT-74 i MAT-75

## Kroki realizacji

1. **Zbadać obecny UI filtrów**
   - Sprawdzić komponent filtrów w widoku listy
   - Zrozumieć obecny layout

2. **Zaprojektować nowy layout**
   - Opcja z mockupów (MAT-6): dwa dropdowny obok siebie ("All Statuses" | "All Categories")
   - Alternatywy:
     - Filtry statusu jako tabs/segmented control na górze
     - Filtry kategorii jako chips/pills poniżej
     - Dropdown (Select) dla obu filtrów

3. **Implementacja**
   - Nowy layout komponentu filtrów
   - Zachować istniejącą logikę filtrowania
   - Wizualne rozdzielenie dwóch poziomów

## Zależności

- Lepiej po MAT-74 i MAT-75 (bazowa logika filtrów)

## Definition of done

- [ ] Dwa poziomy filtrów wizualnie rozdzielone
- [ ] Czytelny i intuicyjny layout
- [ ] Logika filtrowania bez zmian
