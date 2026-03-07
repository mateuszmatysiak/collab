# MAT-90: Naprawić lag przy zaznaczaniu Checkboxa — pełne optimistic updates

- **Priorytet:** Urgent
- **Label:** Bug
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-90/naprawic-lag-przy-zaznaczaniu-checkboxa-pelne-optimistic-updates-dla

## Cel

Wyeliminować lag przy zaznaczaniu/odznaczaniu Checkboxa — UI musi reagować natychmiast (optimistic update), a zapytanie do API wykonuje się w tle.

## Kontekst

- TanStack Query (React Query) jest już w projekcie
- Prawdopodobnie istnieje częściowa implementacja optimistic updates, ale nie działa poprawnie na fizycznych urządzeniach (Pixel 7a, Samsung)
- Problem dotyczy wszystkich mutacji, ale priorytetem jest toggle checkbox

## Kroki realizacji

1. **Audyt istniejących `useMutation` hooków**
   - Sprawdzić wszystkie mutacje w `src/api/` i hookach
   - Zidentyfikować które mają optimistic updates, a które nie
   - Sprawdzić czy istniejące implementacje mają poprawny wzorzec

2. **Implementacja poprawnego wzorca optimistic updates**
   - Wzorzec dla każdej mutacji:
     ```typescript
     useMutation({
       mutationFn: toggleItem,
       onMutate: async (variables) => {
         await queryClient.cancelQueries({ queryKey: [...] })
         const snapshot = queryClient.getQueryData([...])
         queryClient.setQueryData([...], (old) => /* optimistic state */)
         return { snapshot }
       },
       onError: (err, variables, context) => {
         queryClient.setQueryData([...], context.snapshot)
       },
       onSettled: () => {
         queryClient.invalidateQueries({ queryKey: [...] })
       },
     })
     ```

3. **Priorytet implementacji**
   - Toggle checkbox (is_completed) — najczęstsza operacja
   - Dodawanie elementu
   - Edycja elementu
   - Usuwanie elementu
   - Pozostałe mutacje (listy, kategorie, udostępnienia)

4. **Testowanie**
   - Przetestować na Pixel 7a i Samsung
   - Sprawdzić rollback przy błędzie API
   - Sprawdzić race conditions (szybkie wielokrotne kliknięcia)

## Zależności

- Brak (niezależne zadanie)
- Powiązane z MAT-68 (pole klikalności Checkbox — osobny problem)

## Definition of done

- [ ] Toggle checkbox reaguje natychmiast na UI (bez czekania na API)
- [ ] Wszystkie mutacje list items mają poprawne optimistic updates
- [ ] Rollback działa przy błędzie API
- [ ] Przetestowane na Pixel 7a i Samsung — brak widocznego lagu
