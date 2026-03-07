# MAT-85: Obsłużyć większą ilość ikon dla kategorii

- **Priorytet:** Low
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-85/obsluzyc-wieksza-ilosc-ikon-dla-kategorii

## Cel

Rozszerzyć wybór ikon kategorii do ~100 z Lucide z opcją wyszukiwania.

## Kroki realizacji

1. **Wybrać ~100 ikon z Lucide**
   - Ikony pasujące do kontekstu: zakupy, jedzenie, dom, praca, zdrowie, transport, etc.
   - Stworzyć mapę: `{ name: string, icon: LucideIcon }[]`

2. **Komponent Icon Picker**
   - Grid view z ikonami (4-5 kolumn)
   - Wyszukiwanie po nazwie ikony (TextInput na górze)
   - Zaznaczenie wybranej ikony (border/highlight)
   - Scroll jeśli nie mieści się na ekranie

3. **Integracja z formularzem kategorii**
   - Zastąpić obecny wybór ikon nowym Icon Picker
   - W formularzu tworzenia kategorii
   - W formularzu edycji kategorii

4. **Przechowywanie**
   - Zapisywać nazwę ikony w DB (jak dotychczas)
   - Renderować ikonę po nazwie z mapy

## Zależności

- Brak

## Definition of done

- [ ] ~100 ikon Lucide do wyboru
- [ ] Icon picker z wyszukiwaniem
- [ ] Zintegrowany z tworzeniem/edycją kategorii
