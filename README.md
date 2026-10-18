# XV · Sara Valentina Vanegas Pompeyo — Invitación web (Premium)

Sitio estático (HTML/CSS/JS). Se publica tal cual en GitHub Pages, Netlify o Vercel.

## Editar contenido
- `config.js`: fecha, lugar, WhatsApp, música, álbum de fotos, galería.
- `INVITADOS.xlsx` → `python3 tools/build_guests.py [URL_BASE]` genera `guests.json` y `links.csv`
  (un enlace personal `?i=codigo` por invitado, con nombre y cupos).

## Pendiente (no está en el repo)
- `assets/audio/cree-y-atrevete.mp3` — canción (el formulario trae solo enlace de YouTube).
- `albumUrl` en `config.js` — enlace del álbum compartido; con él aparece la sección y el QR de fotos.
- Fotos para la galería (`galeria` en `config.js`); sin ellas la sección se oculta.
- Foto de portada definitiva: se usa provisionalmente `assets/img/portada.webp`.
- Confirmar si la música inicia en 0:10 o en otro punto (`musicaInicio`).

## Privacidad
`guests.json` y `links.csv` contienen nombres de invitados. Si se publica el sitio, `guests.json` queda
descargable. No incluye teléfonos.
