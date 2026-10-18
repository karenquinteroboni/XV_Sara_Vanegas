# XV · Sara Valentina Vanegas Pompeyo — Invitación web (Premium)

Sitio estático (HTML/CSS/JS). Se publica tal cual en GitHub Pages, Netlify o Vercel.

## Editar contenido
- `config.js`: fecha, lugar, WhatsApp, música, álbum de fotos, galería.
- `INVITADOS.xlsx` → `python3 tools/build_guests.py [URL_BASE]` genera `guests.json` y `links.csv`
  (un enlace personal `?i=codigo` por invitado, con nombre y cupos).

## Pendiente
- Confirmar si la música inicia en 0:10 (`musicaInicio` en `config.js`).
- El álbum de Google Fotos debe estar compartido con "permitir que otros agreguen fotos"; si no, el QR solo deja ver.
- Opcional: registrar confirmaciones en Google Sheets (`rsvpEndpoint` en `config.js`).

## Privacidad
`guests.json` y `links.csv` contienen nombres de invitados. Si se publica el sitio, `guests.json` queda
descargable. No incluye teléfonos.
