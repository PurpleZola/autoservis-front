# Auto Servis - Frontend

Frontend dio aplikacije za upravljanje auto servisom (diplomski projekat). Angular aplikacija sa admin i korisničkim panelom - prijava/registracija, upravljanje klijentima, vozilima, serviserima, servisnim nalozima, kvarovima, uslugama, dijelovima i računima, kao i AI analiza vozila.

## Tehnologije

- Angular (standalone komponente, signals)
- Angular Material
- TypeScript
- RxJS

## Kako pokrenuti

1. Instalirati zavisnosti:

   ```
   npm install
   ```

2. Pokrenuti razvojni server:

   ```
   npm start
   ```

3. Otvoriti u browseru: `http://localhost:4200`

Napomena: backend URL je hardkodiran u servisima (`http://localhost:8080/api/...`), tako da backend mora biti pokrenut prije korištenja aplikacije.

## Portovi

| Servis                 | Port |
|-------------------------|------|
| Frontend (Angular)      | 4200 |
| Backend (Spring Boot)   | 8080 |
| AI servis (Flask)       | 5000 |
| MySQL baza              | 3306 |

## Napomena o AI servisu

Dugme za AI analizu vozila (u servisnim nalozima) poziva backend, koji dalje prosljeđuje zahtjev ka posebnom Python (Flask) AI servisu na portu 5000. Ako taj servis nije pokrenut, ostatak aplikacije radi normalno - samo AI analiza neće vratiti rezultat.
