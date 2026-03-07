# MAT-64: Osobna sekcja dla zaznaczonych elementów (Google Keep)

- **Priorytet:** Low
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-64/dodac-osobna-sekcje-pod-spodem-dla-zaznaczonych-elementow-na-wzor

## Cel

Zaznaczone elementy wyświetlane w osobnej, domyślnie zwiniętej sekcji na dole listy (Google Keep style).

## Kontekst

- Sekcja domyślnie zwinięta
- Elementy mają opcję odznaczenia (przeniesienie z powrotem)
- Pozycja (position) zachowywana po odznaczeniu
- Blokuje MAT-72 (animacje) i MAT-83 (masowe usuwanie)

## Kroki realizacji

1. **Rozdzielić elementy na grupy**
   - `const pending = items.filter(i => !i.is_completed)`
   - `const completed = items.filter(i => i.is_completed)`

2. **Sekcja "Pending"**
   - Header: "PENDING (X)" z liczbą elementów
   - Lista niezaznaczonych elementów (obecny widok)

3. **Sekcja "Completed"**
   - Header: "COMPLETED (X)" — klikalny, rozwija/zwija sekcję
   - Domyślnie zwinięta (`const [isExpanded, setIsExpanded] = useState(false)`)
   - Ikona chevron (obracana przy rozwinięciu/zwinięciu)

4. **Funkcjonalność odznaczenia**
   - Checkbox w sekcji "Completed" — kliknięcie odznacza element
   - Element wraca do sekcji "Pending" na swoją oryginalną pozycję (wg `position`)

5. **Zachowanie pozycji**
   - Przy zaznaczeniu: element znika z "Pending", pojawia się w "Completed"
   - Przy odznaczeniu: element wraca do "Pending" na swoją pozycję (sortowanie po `position`)

## Zależności

- Brak
- Blokuje: MAT-72 (animacje), MAT-83 (masowe usuwanie zaznaczonych)

## Definition of done

- [ ] Zaznaczone elementy w osobnej, zwijanej sekcji "Completed"
- [ ] Sekcja domyślnie zwinięta
- [ ] Kliknięcie odznacza element — wraca do "Pending"
- [ ] Pozycja zachowywana po odznaczeniu
