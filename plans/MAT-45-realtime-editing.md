# MAT-45: Obsłużyć edycję w czasie rzeczywistym

- **Priorytet:** Low
- **Label:** Feature
- **Linear:** https://linear.app/mateusz-matysiak/issue/MAT-45/obsluzyc-mozliwosc-edycji-w-czasie-rzeczywistym

## Cel

Zmiany na liście (checkboxy, nowe elementy, edycje) synchronizowane w real-time przez WebSockets.

## Kontekst

- Mechanizm: WebSockets
- Synchronizowane: wszystko (checkboxy, nowe elementy, edycja nazw, usuwanie)
- Prawdopodobnie wymaga przebudowy backendu — potrzebna dodatkowa analiza

## Kroki realizacji

1. **Analiza i wybór biblioteki WS**
   - Opcje dla Hono: `hono/ws` (natywne), Socket.io, ws
   - Sprawdzić kompatybilność z Vercel (hosting)
   - Uwaga: Vercel może nie wspierać persistent WS — rozważyć alternatywy (Pusher, Ably, SSE)

2. **Backend: WS endpoint**
   - Endpoint WS z autoryzacją (token w query param lub first message)
   - Room/channel per lista (list_id)
   - Broadcast do subskrybentów listy (współdzielący)

3. **Protokół wiadomości**
   - Event types:
     - `item:created` — nowy element
     - `item:updated` — edycja elementu
     - `item:deleted` — usunięcie
     - `item:toggled` — toggle checkbox
     - `list:updated` — edycja listy
   - Payload: pełny obiekt po zmianie

4. **Backend: emitowanie eventów**
   - Przy każdej mutacji w kontrolerze: emitować event do WS room
   - Nie emitować do autora zmiany (unikanie podwójnego update)

5. **Mobile: WS client**
   - Podłączyć WS client przy wejściu na ekran listy
   - Nasłuchiwać eventów → aktualizować React Query cache (`queryClient.setQueryData`)
   - Rozłączyć przy wyjściu z ekranu

6. **Reconnect i error handling**
   - Auto-reconnect przy utracie połączenia
   - Fallback: invalidateQueries po reconnect (sync pełnego stanu)

## Zależności

- Lepiej po MAT-49 (Hono RPC) — stabilna architektura
- Weryfikacja: czy Vercel wspiera WebSockets (jeśli nie — alternatywa)

## Definition of done

- [ ] Dwóch użytkowników widzi zmiany na liście w real-time
- [ ] Wszystkie operacje synchronizowane (CRUD items, toggle)
- [ ] Auto-reconnect przy utracie połączenia
- [ ] Brak podwójnych updateów
