# MAT-73: Obsłużyć wyszukiwanie elementów listy

- **Priorytet:** Medium
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-73/obsluzyc-wyszukiwanie-elementow-listy

## Cel

Użytkownik może wyszukiwać elementy listy po nazwie w search barze w headerze.

## Kontekst

- Wyszukiwanie po stronie klienta (filtrowanie pobranych danych)
- Szukamy po nazwie elementu
- Search bar w headerze listy

## Kroki realizacji

1. **Dodać search bar**
   - `TextInput` w headerze widoku listy (`app/(tabs)/lists/[id].tsx`)
   - Ikona lupy, placeholder "Szukaj..."
   - Ikona czyszczenia (X) gdy jest tekst

2. **Stan wyszukiwania**
   - `const [searchQuery, setSearchQuery] = useState("")`
   - Debounce 300ms (useDebounce hook lub `useDeferredValue`)

3. **Filtrowanie**
   - `items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))`
   - Filtrowanie łączy się z istniejącymi filtrami (kategoria, status)

4. **UX**
   - Pusty wynik: "Brak wyników dla [query]"
   - Search bar chowa się/pojawia (opcjonalnie: animacja slide down)

## Zależności

- Brak

## Definition of done

- [ ] Search bar w headerze listy
- [ ] Filtrowanie elementów po nazwie w real-time
- [ ] Działa razem z filtrami kategorii/statusu
- [ ] Ikona czyszczenia wyszukiwania
