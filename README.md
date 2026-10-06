# User Profile Web

Frontend aplikacji do logowania i zarządzania profilem użytkownika, zbudowany
w React, TypeScript i Vite.

## Cel projektu

Celem projektu jest przygotowanie responsywnego interfejsu, który pozwala
użytkownikowi zalogować się, wyświetlić swój profil oraz zmienić nazwę
wyświetlaną i opis. Frontend komunikuje się z osobnym backendem przez REST API.

## Funkcjonalności

- formularz logowania z walidacją danych,
- obsługa błędów i stanów ładowania,
- przechowywanie tokenu sesji wyłącznie w pamięci aplikacji,
- ochrona strony profilu przed niezalogowanym użytkownikiem,
- wyświetlanie identyfikatora i adresu e-mail użytkownika,
- edycja nazwy wyświetlanej oraz opisu profilu,
- pobieranie aktualnych danych profilu,
- wylogowanie lokalne i po stronie API,
- automatyczne zakończenie sesji po odpowiedzi `401`,
- automatyczne testy oraz kontrola CI w GitHub Actions.

## Struktura systemu

```text
Przeglądarka użytkownika
        |
        v
Frontend React + TypeScript
        |
        | HTTPS / JSON / Bearer token
        v
Zewnętrzne REST API
```

Frontend został podzielony zgodnie z Atomic Design:

```text
src/
|-- api/          klient HTTP oraz funkcje komunikacji z API
|-- components/
|   |-- atoms/       podstawowe elementy interfejsu
|   |-- molecules/   połączenia kilku atomów
|   |-- organisms/   formularze logowania i profilu
|   `-- templates/   układy stron
|-- pages/        strony logowania i profilu
|-- routing/      ochrona tras publicznych i prywatnych
|-- session/      stan sesji przechowywany w pamięci
|-- test/         konfiguracja środowiska testowego
`-- types/        wspólne typy TypeScript
```

Najważniejsze technologie:

- React,
- TypeScript,
- Vite,
- React Router,
- Vitest,
- React Testing Library.

## Uruchomienie frontendu

Wymagane są Node.js 22 oraz npm.

### 1. Instalacja zależności

```bash
npm ci
```

### 2. Konfiguracja lokalnego adresu API

W PowerShellu utwórz lokalny plik środowiskowy:

```powershell
Copy-Item .env.example .env.local
```

Następnie ustaw w `.env.local` adres działającego backendu:

```env
VITE_API_URL=https://api.example.com
```

Plik `.env.local` nie jest zapisywany w Git. Backend musi zezwalać w CORS na
adres `http://localhost:5173`.

### 3. Uruchomienie trybu deweloperskiego

```bash
npm run dev
```

Aplikacja jest domyślnie dostępna pod adresem:
`http://localhost:5173`.

### 4. Zbudowanie wersji produkcyjnej

```bash
npm run build
```

Vite używa adresu API z `.env.production` i zapisuje gotowe pliki statyczne w
katalogu `dist`.

### 5. Lokalny podgląd wersji produkcyjnej

```bash
npm run preview
```

## Uruchomienie testów

Jednorazowe uruchomienie wszystkich testów:

```bash
npm test
```

Uruchomienie testów w trybie obserwowania zmian:

```bash
npm run test:watch
```

Pełna kontrola przed wysłaniem zmian:

```bash
npm run lint
npm test
npm run build
```

Testy korzystają z zamockowanego API, dlatego nie wymagają uruchomionego
backendu. Sprawdzają między innymi logowanie, walidację formularza, ochronę
trasy profilu, zapis i odświeżanie danych oraz wylogowanie.

## Wdrożenie frontendu

Serwer udostępnia wyłącznie gotowe pliki statyczne. Po wykonaniu
`npm run build` należy przesłać zawartość katalogu `dist`, a nie sam katalog:

```text
sftp ucz-web@54.36.162.208
cd /public
lcd dist
put -r *
bye
```

Po przesłaniu plik `index.html` musi znajdować się bezpośrednio w `/public`.
Wdrożona aplikacja jest dostępna pod adresem
`https://app.54-36-162-208.sslip.io`.

API pod adresem `https://api.54-36-162-208.sslip.io` musi mieć poprawnie
skonfigurowane HTTPS oraz zezwalać w CORS na adres aplikacji.

## Continuous Integration

Workflow GitHub Actions po każdym `push` i pull requeście automatycznie
instaluje zależności, uruchamia lint, testy oraz produkcyjny build.
