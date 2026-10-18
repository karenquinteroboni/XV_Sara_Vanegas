// Todo lo editable de la invitación vive aquí.
window.CONFIG = {
  nombre: "Sara Valentina Vanegas Pompeyo",
  nombreCorto: "Sara Valentina",
  // 7 de noviembre de 2026, 7:00 pm hora Colombia
  fechaEvento: "2026-11-07T19:00:00-05:00",
  fechaTexto: "Sábado 7 de noviembre de 2026",
  horaTexto: "7:00 p. m.",
  lugar: "Restaurante Yerbabuena",
  direccion: "Carrera 6 # 9-81, Barrio Belén · Ibagué",
  mapsUrl: "https://maps.app.goo.gl/xo7XuVFAiDdcMCcz9?g_st=ic",
  mapsBusqueda: "Restaurante Yerbabuena, Carrera 6 # 9-81, Ibagué, Colombia",
  whatsapp: [
    { nombre: "Diana", numero: "573132921224" },
    { nombre: "Familia", numero: "573162252587" }
  ],
  dressCode: "Reservado el color verde para la quinceañera",


  // Menú de platos fuertes (cada invitado elige uno por persona).
  menu: [
    { n: "Filet Mignon", d: "Medallones de res albardados con tocineta, bañados en salsa Mignon. Acompañados de ensalada fresca (aguacate, zanahoria, tomates cherry y pepino sobre una cama de lechugas, con vinagreta de la casa) y papas en casco a la provenzal." },
    { n: "Petit Mignon", d: "Medallones de pechuga de pollo albardados con tocineta, bañados en salsa de champiñones. Acompañados de un mix de espárragos y zanahorias baby salteados en salsa meunière y pasta al burro." },
    { n: "Porchetta de Cerdo Especiada", d: "Porchetta de cerdo sazonada con una selección de especias y hierbas aromáticas. Acompañada de papa criolla dorada y ensalada tipo ceviche." },
    { n: "Filete de Salmón a la Plancha", d: "Filete de salmón a la plancha, acompañado de ensalada César y un ligero puré de papa." },
    { n: "Filete de Salmón en Salsa de Naranja", d: "Filete de salmón bañado en una delicada salsa de naranja. Acompañado de un mix de espárragos y zanahorias baby salteados en salsa meunière y papas en casco a la provenzal." },
    { n: "Pollo al Cilantro", d: "Escalopes de pechuga de pollo marinados al cilantro, acompañados de ensalada César y papas en casco a la provenzal." }
  ],

  // Música: pon el archivo en assets/audio/ y ajusta el segundo de inicio.
  musica: "assets/audio/cree-y-atrevete.mp3",
  musicaInicio: 0, // segundos desde donde arranca la canción al abrir la tarjeta
  musicaTitulo: "Cree y atrévete · Ha*Ash",

  // QR / enlace para que los invitados suban fotos (álbum compartido de Drive o Google Fotos).
  albumUrl: "https://photos.app.goo.gl/wZFEyfNQCvyuBgQ6A",

  // Galería: rutas de imágenes. Se oculta si hay menos de 2.
  galeria: [
    { src: "assets/img/g1-rosas.webp", pos: "52% 40%", alt: "Sara Valentina entre las rosas" },
    { src: "assets/img/g2-fuente.webp", pos: "78% 40%", alt: "Sara Valentina junto a la fuente" },
    { src: "assets/img/g3-balcon.webp", pos: "25% 40%", alt: "Sara Valentina en el balcón del castillo" },
    { src: "assets/img/g4-salon.webp", pos: "50% 40%", alt: "Sara Valentina en el salón dorado" },
    { src: "assets/img/g5-escalera.webp", pos: "76% 40%", alt: "Sara Valentina en la escalera del palacio" }
  ],

  // Opcional: URL del Apps Script que registra confirmaciones en Google Sheets.
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbxXTOmRdAQb-_t5SrZuNzp2FayEBDV9sSaSDMMONDJG7VV261fO-EEP09EAvBBNOoMQaw/exec"
};
