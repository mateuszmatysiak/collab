# MAT-74: Obsłużyć odznaczanie filtra po kliknięciu

- **Priorytet:** Medium
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-74/obsluzyc-odznaczanie-filtra-po-kliknieciu-w-niego

## Cel

Kliknięcie aktywnego filtra odznacza go i wraca do widoku "Wszystkie".

## Kontekst

- Domyślny filtr: "Wszystkie" (brak filtra)
- Nie ma możliwości zaznaczenia kilku filtrów jednocześnie
- Kliknięcie odznacza tylko ten jeden filtr

## Kroki realizacji

1. **Zlokalizować logikę filtrów**
   - Sprawdzić komponent filtrów w widoku listy (`app/(tabs)/lists/[id].tsx`)
   - Znaleźć stan filtra (useState/context)

2. **Dodać toggle logic**
   - Jeśli kliknięty filtr === aktywny filtr → ustawić filtr na `null` (Wszystkie)
   - Jeśli kliknięty filtr !== aktywny filtr → ustawić nowy filtr (obecne zachowanie)

3. **Zaktualizować UI**
   - Wizualne odznaczenie aktywnego filtra (brak podświetlenia)
   - Stan "Wszystkie" powinien być domyślny

## Zależności

- Brak (blokuje MAT-75)

## Definition of done

- [ ] Kliknięcie aktywnego filtra odznacza go
- [ ] Lista pokazuje wszystkie elementy po odznaczeniu
- [ ] Wizualny feedback (brak podświetlenia)
