# MAT-75: Obsłużyć dodawanie elementu do kategorii z aktywnego filtra

- **Priorytet:** Medium
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-75/obsluzyc-dodawanie-elementu-do-kategorii-ktora-mamy-zaznaczona-w

## Cel

Nowy element dodany przy aktywnym filtrze kategorii automatycznie otrzymuje tę kategorię.

## Kontekst

- Nie ma możliwości zaznaczenia kilku filtrów jednocześnie
- Użytkownik może zmienić kategorię po dodaniu elementu (przez edycję)

## Kroki realizacji

1. **Zlokalizować logikę dodawania elementu**
   - Sprawdzić komponent dodawania w widoku listy
   - Znaleźć mutację `createItem`

2. **Odczytać aktywny filtr**
   - Pobrać aktywną kategorię z filtra

3. **Ustawić kategorię przy tworzeniu**
   - Jeśli filtr kategorii jest aktywny:
     - Ustawić `category_id` = ID kategorii z filtra
     - Ustawić `category_type` = typ kategorii z filtra
   - Jeśli brak filtra: zachować obecne zachowanie (bez kategorii lub domyślna)

4. **UX: zmiana kategorii po dodaniu**
   - Użytkownik może zmienić kategorię przez edycję elementu (istniejąca funkcjonalność)

## Zależności

- MAT-74 (logika filtrów musi działać poprawnie — toggle)

## Definition of done

- [ ] Element dodany przy aktywnym filtrze kategorii ma tę kategorię
- [ ] Bez aktywnego filtra — zachowanie bez zmian
- [ ] Użytkownik może zmienić kategorię po dodaniu
