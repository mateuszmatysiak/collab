# MAT-6: Zmienić wygląd UI — Apple Glass UI

- **Priorytet:** Low
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-6/zmienic-biblioteke-ui

## Cel

Zmienić wygląd aplikacji na nowy design oparty o Apple Glass UI z gradientami i animacjami. Zachować React Native Reusables jako bazę.

## Styl wizualny

- **Apple Glass UI** — efekty szkła, blur, przezroczystości (glassmorphism)
- Dużo **gradientów** (tła, karty, ikony kategorii z kolorowymi tłami)
- Lekkie **gradientowe animacje/przejścia** między ekranami i stanami
- Jasna kolorystyka, delikatne cienie, zaokrąglone rogi

## Mockupy (dostarczone screenshoty)

### Ekran "My Lists" (lists/index.tsx)
- Header: "My Lists" + liczba list ("5 lists")
- Tabs filtrów: All Lists / My Lists / Shared (pill buttons)
- Karty list:
  - Ikona kategorii z kolorowym zaokrąglonym tłem (pastelowe kolory)
  - Nazwa listy (bold)
  - Liczba elementów ("12 items")
  - Avatary współpracowników po prawej (inicjały w szarych kółkach: JD, AS, MK, RL)
- Bottom navigation: Lists, Categories, Profile

### Ekran "List Detail" (lists/[id].tsx)
- Header: strzałka wstecz + nazwa listy + "X/Y completed"
- Progress bar: ikona kategorii + bar + "X% complete"
- Filtry: dwa dropdowny obok siebie — "All Statuses" | "All Categories"
- Sekcja "PENDING (X)":
  - Elementy: drag handle (6 kropek) | checkbox (kółko) | nazwa + opis + kategoria | ikona trash
- Sekcja "COMPLETED (X)":
  - Elementy z zaznaczonym checkboxem (wypełnione kółko)
  - Strikethrough na nazwie
  - Zielona ikona check po prawej + trash

### Ekran "Categories" (categories.tsx)
- Header: "Categories" + "Organize your shopping lists"
- Grid 3 kolumny:
  - Karty: ikona na kolorowym zaokrąglonym tle + nazwa pod spodem
  - Przycisk X w rogu do usunięcia
  - Pastelowe kolory: zielony (Groceries), beżowy (Food), różowy (Gifts), niebieski (Work), fioletowy (Health), etc.
- Karta "Add Category": przerywane obramowanie + ikona +

### Ekran "Profile" (profile.tsx)
- Duży avatar z inicjałami (niebieski)
- Imię (bold) + email
- Sekcja "Statistics":
  - Karta: ikona + liczba (bold) + etykieta — "Lists Created"
  - Karta: ikona + liczba (bold) + etykieta — "Shared Lists"
- Sekcja "Account": przycisk Logout (czerwony, full-width)

## Biblioteki techniczne

- **Baza UI:** React Native Reusables (bez zmiany)
- **Glassmorphism:** `expo-blur` / `@react-native-community/blur`
- **Gradienty:** `expo-linear-gradient`
- **Animacje:** `react-native-reanimated`

## Kroki realizacji

1. **Setup bibliotek**
   - Zainstalować expo-blur, expo-linear-gradient (jeśli brak)
   - Skonfigurować react-native-reanimated (jeśli brak)

2. **Design system**
   - Zdefiniować paletę kolorów (pastelowe gradienty)
   - Zdefiniować style glassmorphism (blur, opacity, border)
   - Stworzyć reusable gradient background component

3. **Implementacja per ekran**
   - My Lists → nowy layout kart z avatarami i ikonami
   - List Detail → progress bar, sekcje Pending/Completed, nowy layout elementów
   - Categories → grid layout z kolorowymi kartami
   - Profile → nowy layout ze statystykami

4. **Animacje**
   - Przejścia między ekranami (shared element transitions)
   - Animacje gradientów (subtle shimmer / pulse)
   - Animacje interakcji (press feedback)

## Zależności

- Wymaga stabilnej architektury — lepiej po zakończeniu zmian funkcjonalnych
- Powiązane z wieloma zadaniami UI (MAT-64 sekcja completed, MAT-84 filtry, MAT-76 licznik)

## Definition of done

- [ ] Wszystkie ekrany zgodne z dostarczonymi mockupami
- [ ] Apple Glass UI: blur, gradienty, pastelowe kolory
- [ ] Płynne animacje przejść
- [ ] Działa na Android i iOS
