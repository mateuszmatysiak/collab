Przeanalizuj zmiany w repozytorium (git diff --staged oraz git diff) i wykonaj następujące kroki:

1. Przeczytaj dostępne prefiksy commitów z pliku `.husky/commit-msg`.
2. Sprawdź styl dotychczasowych commitów: `git log --oneline -20`
3. Pogrupuj zmiany logicznie według zrealizowanej pracy.
4. Przedstaw mi plan commitów w formie listy:
   - Dla każdego commita podaj: proponowany message, listę plików i krótkie uzasadnienie grupowania.
5. **Czekaj na moją akceptację.** Nie wykonuj żadnych commitów bez mojego potwierdzenia.
6. Po akceptacji, dla każdej grupy:
   - Dodaj odpowiednie pliki: `git add <pliki>`
   - Wykonaj commit zgodny z prefiksami z `.husky/commit-msg` i stylem projektu
7. Jeśli zaproponuję zmiany w planie — dostosuj się przed commitowaniem.
8. Nie łącz niezwiązanych zmian w jeden commit.
9. Jeśli nie ma zmian — poinformuj.