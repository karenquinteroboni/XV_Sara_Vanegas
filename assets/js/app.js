(function () {
  var C = window.CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);
  var guest = null;

  /* ---------- Invitado personalizado ---------- */
  fetch("guests.json").then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
    .then(function (list) {
      var g = list[params.get("i")];
      if (g) guest = g;
      applyGuest();
    });

  function applyGuest() {
    if (guest) $("opGuest").textContent = guest.n;
    buildRsvp();
  }

  /* ---------- WhatsApp / confirmación ---------- */
  function waUrl(num, msg) { return "https://wa.me/" + num + "?text=" + encodeURIComponent(msg); }

  function buildRsvp() {
    var box = $("rsvpBtns"), sel = $("rsvpN");
    box.innerHTML = "";
    if (guest) {
      var cb = $("cuposBox");
      cb.hidden = false;
      cb.textContent = guest.n + " · " + guest.c + (guest.c === 1 ? " cupo" : " cupos");
      $("rsvpText").textContent = "Tu presencia hará que esta noche sea aún más especial. Confirma cuántas personas asistirán.";
      if (guest.c > 1) {
        $("rsvpExtra").hidden = false;
        sel.innerHTML = "";
        for (var i = guest.c; i >= 1; i--) {
          var o = document.createElement("option");
          o.value = i; o.textContent = i; sel.appendChild(o);
        }
      }
    }
    C.whatsapp.forEach(function (w, idx) {
      var a = document.createElement("a");
      a.className = "btn" + (idx ? " alt2" : "");
      a.target = "_blank"; a.rel = "noopener";
      a.textContent = idx === 0 ? "Confirmar asistencia" : "Confirmar con " + w.nombre;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var n = guest ? (guest.c > 1 ? sel.value : 1) : null;
        var msg = guest
          ? "Hola, soy " + guest.n + ". Confirmo mi asistencia a los XV de " + C.nombreCorto + " el " + C.fechaTexto + " (" + n + (n == 1 ? " persona" : " personas") + "). ¡Gracias por la invitación! 💚"
          : "Hola, confirmo mi asistencia a los XV de " + C.nombreCorto + " el " + C.fechaTexto + ". ¡Gracias por la invitación! 💚";
        if (C.rsvpEndpoint && guest) {
          try {
            navigator.sendBeacon(C.rsvpEndpoint, JSON.stringify({ nombre: guest.n, cupos: guest.c, asistentes: n, ts: new Date().toISOString() }));
          } catch (err) {}
        }
        window.open(waUrl(w.numero, msg), "_blank", "noopener");
      });
      a.href = waUrl(w.numero, "Hola");
      box.appendChild(a);
    });
    $("giftLink").href = waUrl(C.whatsapp[0].numero, "Hola, quiero coordinar la lluvia de sobres para los XV de " + C.nombreCorto + " 💚");
  }

  /* ---------- Mapa ---------- */
  $("mapFrame").src = "https://maps.google.com/maps?q=" + encodeURIComponent(C.mapsBusqueda) + "&output=embed";
  $("mapsLink").href = C.mapsUrl;

  /* ---------- Cuenta regresiva ---------- */
  var target = new Date(C.fechaEvento).getTime();
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var d = Math.max(0, target - Date.now());
    $("cd-d").textContent = Math.floor(d / 864e5);
    $("cd-h").textContent = pad(Math.floor(d % 864e5 / 36e5));
    $("cd-m").textContent = pad(Math.floor(d % 36e5 / 6e4));
    $("cd-s").textContent = pad(Math.floor(d % 6e4 / 1e3));
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Fotos de la fiesta (QR) ---------- */
  if (C.albumUrl) {
    $("fotos").hidden = false;
    $("albumLink").href = C.albumUrl;
    if (window.QRCode) new QRCode($("qr"), { text: C.albumUrl, width: 180, height: 180, colorDark: "#2f3a26", colorLight: "#ffffff" });
  } else {
    $("menuFotos").hidden = true;
  }

  /* ---------- Galería ---------- */
  if (C.galeria && C.galeria.length >= 2) {
    $("galeria").hidden = false;
    C.galeria.forEach(function (src) {
      var im = document.createElement("img");
      im.src = src; im.alt = "Foto de " + C.nombreCorto; im.loading = "lazy";
      $("gallery").appendChild(im);
    });
  } else {
    $("menuGaleria").hidden = true;
  }

  /* ---------- Música ---------- */
  var bgm = $("bgm"), sound = $("soundBtn"), hasAudio = false;
  if (C.musica) {
    bgm.src = C.musica;
    bgm.addEventListener("loadedmetadata", function () { hasAudio = true; });
    bgm.addEventListener("error", function () { hasAudio = false; sound.hidden = true; });
  }
  sound.addEventListener("click", function () {
    if (bgm.paused) { bgm.play(); sound.classList.remove("muted"); }
    else { bgm.pause(); sound.classList.add("muted"); }
  });

  /* ---------- Apertura ---------- */
  var opening = $("opening");
  $("openBtn").addEventListener("click", function () {
    opening.classList.add("open");
    if (C.musica) {
      try {
        bgm.currentTime = C.musicaInicio || 0;
        bgm.volume = 0.7;
        var p = bgm.play();
        if (p && p.then) p.then(function () { sound.hidden = false; }).catch(function () {});
      } catch (e) {}
    }
    setTimeout(function () {
      opening.classList.add("gone");
      document.body.classList.remove("locked");
      window.scrollTo(0, 0);
      revealNow();
    }, 1900);
  });

  /* ---------- Menú ---------- */
  var menu = $("menu"), mb = $("menuBtn");
  function toggleMenu(open) {
    menu.classList.toggle("show", open);
    mb.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
  }
  mb.addEventListener("click", function () { toggleMenu(!menu.classList.contains("show")); });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") toggleMenu(false); });

  /* ---------- Reveal ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
  }, { threshold: 0.12 }) : null;
  var els = [].slice.call(document.querySelectorAll(".reveal"));
  function revealNow() { els.forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); }); }

  /* ---------- Pausar música al reproducir el video ---------- */
  var vid = $("vid");
  vid.addEventListener("play", function () { if (!bgm.paused) { bgm.pause(); bgm.dataset.auto = "1"; } });
  vid.addEventListener("pause", function () { if (bgm.dataset.auto) { bgm.play(); delete bgm.dataset.auto; } });

  /* ---------- Estrellas ---------- */
  var cv = $("stars"), cx = cv.getContext("2d"), S = [];
  function size() {
    cv.width = innerWidth; cv.height = innerHeight;
    S = []; var n = Math.round(innerWidth * innerHeight / 14000);
    for (var i = 0; i < n; i++) S.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, r: Math.random() * 1.4 + .3, p: Math.random() * 6.28, v: Math.random() * .02 + .008 });
  }
  function draw() {
    cx.clearRect(0, 0, cv.width, cv.height);
    S.forEach(function (s) {
      s.p += s.v;
      cx.globalAlpha = .25 + .55 * Math.abs(Math.sin(s.p));
      cx.fillStyle = "#e6d6b0";
      cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.28); cx.fill();
    });
    requestAnimationFrame(draw);
  }
  size(); addEventListener("resize", size);
  if (!matchMedia("(prefers-reduced-motion:reduce)").matches) draw();

  /* ---------- Mariposas ---------- */
  var BF = '<svg viewBox="0 0 60 50"><g fill="#c9a96a" stroke="#8f7233" stroke-width=".8"><path d="M30 25C22 8 6 2 3 12c-3 11 8 18 27 13z"/><path d="M30 25C38 8 54 2 57 12c3 11-8 18-27 13z"/><path d="M30 25C20 32 10 44 17 47c8 2 12-9 13-22z" fill="#e6d6b0"/><path d="M30 25c10 7 20 19 13 22-8 2-12-9-13-22z" fill="#e6d6b0"/></g><rect x="29" y="14" width="2" height="26" rx="1" fill="#6b5320"/></svg>';
  if (!matchMedia("(prefers-reduced-motion:reduce)").matches) {
    for (var i = 0; i < 5; i++) {
      var b = document.createElement("div");
      b.className = "bf";
      b.style.left = (8 + i * 19) + "%";
      b.style.width = (22 + Math.random() * 16) + "px";
      b.style.animationDuration = (22 + Math.random() * 14) + "s";
      b.style.animationDelay = (-Math.random() * 30) + "s";
      b.innerHTML = BF;
      $("butterflies").appendChild(b);
    }
  }
})();
