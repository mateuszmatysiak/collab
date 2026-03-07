# MAT-62: Zwiększyć widoczność ekranu/możliwość scrollowania przy focusie inputa

- **Priorytet:** High
- **Label:** Improvement
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-62/zwiekszyc-widocznosc-ekranumozliwosc-scrollowania-gdy-mamy

## Cel

Klawiatura nie zasłania inputów na żadnym ekranie aplikacji (Android + iOS).

## Kontekst

- Preferowana biblioteka: `react-native-keyboard-aware-scroll-view`
- Dotyczy wszystkich ekranów z inputami
- Musi działać na Android (Pixel 7a) i iOS
- Powiązane z MAT-77 (login panel wyżej) — realizowane razem

## Kroki realizacji

1. **Instalacja biblioteki**
   - `pnpm -C apps/mobile add react-native-keyboard-aware-scroll-view`

2. **Zidentyfikować ekrany z inputami**
   - Login (`app/(auth)/login.tsx`)
   - Register (`app/(auth)/register.tsx`)
   - Lista elementów — input dodawania (`app/(tabs)/lists/[id].tsx`)
   - Dialogi z inputami (dodawanie/edycja elementów, kategorii)
   - Ekran kategorii

3. **Implementacja na ekranach**
   - Owinąć scrollowalne ekrany w `KeyboardAwareScrollView`
   - Konfiguracja: `enableOnAndroid={true}`, `extraScrollHeight`, `keyboardOpeningTime`
   - Dla dialogów: dodać padding między contentem a klawiaturą

4. **MAT-77: Login panel wyżej**
   - Oprócz keyboard-aware: przenieść formularz logowania wyżej w layoucie
   - Zmniejszyć top padding / dostosować flex

5. **Testowanie**
   - Android (Pixel 7a) i iOS
   - Każdy ekran z inputem: focus → klawiatura → input widoczny
   - Dialog z inputem: content nie zasłonięty

## Zależności

- Brak
- Realizowane razem z MAT-77

## Definition of done

- [ ] Na wszystkich ekranach input jest widoczny i dostępny gdy klawiatura jest otwarta
- [ ] Działa na Android i iOS
- [ ] Formularz logowania jest wyżej — widoczny w całości przy otwartej klawiaturze (MAT-77)
