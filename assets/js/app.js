(function () {
  var C = window.CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);
  var guest = null;

  /* ---------- Invitado personalizado ---------- */
  fetch("guests.json").then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
    .then(function (list) {
      Object.keys(list).forEach(function (k) { allGuests.push({ n: list[k].n, c: list[k].c, k: norm(list[k].n) }); });
      var g = list[params.get("i")];
      if (g) guest = { n: g.n, c: g.c };
      applyGuest();
    });

  function applyGuest() {
    buildRsvp();
  }

  /* ---------- Confirmación: buscar nombre, cupos y WhatsApp ---------- */
  var allGuests = [], picked = null;
  function waUrl(num, msg) { return "https://wa.me/" + num + "?text=" + encodeURIComponent(msg); }
  function norm(t) { return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(); }

  function pick(g) {
    picked = g;
    $("rsvpSearch").hidden = true; $("rsvpThanks").hidden = true; $("rsvpPick").hidden = false;
    $("pickName").textContent = g.n;
    $("pickMax").textContent = g.c === 1 ? "Tu invitación es para 1 persona." : "Tu invitación es para máximo " + g.c + " personas.";
    var sel = $("rsvpN"); sel.innerHTML = "";
    for (var i = g.c; i >= 1; i--) sel.add(new Option(i === 1 ? "1 persona" : i + " personas", i));
    sel.add(new Option("No podré asistir", 0));
  }
  function search() {
    var q = norm($("q").value), list = $("qList");
    list.innerHTML = ""; $("qEmpty").hidden = true;
    if (q.length < 3) return;
    var toks = q.split(" ");
    var hits = allGuests.filter(function (g) { return toks.every(function (t) { return g.k.indexOf(t) > -1; }); }).slice(0, 6);
    hits.forEach(function (g) {
      var li = document.createElement("li"), b = document.createElement("button");
      b.type = "button"; b.textContent = g.n; b.addEventListener("click", function () { pick(g); });
      li.appendChild(b); list.appendChild(li);
    });
    if (!hits.length) {
      $("qEmpty").hidden = false;
      var a = $("qEmpty"); a.innerHTML = 'No encontramos ese nombre. Revisa cómo está escrito o <a target="_blank" rel="noopener">escríbenos por WhatsApp</a>.';
      a.querySelector("a").href = waUrl(C.whatsapp[0].numero, "Hola, no encuentro mi nombre en la invitación de los XV de " + C.nombreCorto + ".");
    }
  }
  $("q").addEventListener("input", search);
  $("rsvpBack").addEventListener("click", function () {
    picked = null; $("rsvpPick").hidden = true; $("rsvpThanks").hidden = true; $("rsvpSearch").hidden = false; $("q").value = ""; $("qList").innerHTML = ""; $("q").focus();
  });
  $("rsvpGo").addEventListener("click", function () {
    if (!picked) return;
    var n = parseInt($("rsvpN").value, 10);
    if (isNaN(n) || n < 0 || n > picked.c) return;
    var msg = n === 0
      ? "Hola, soy " + picked.n + ". Lamentablemente no podré asistir a los XV de " + C.nombreCorto + ". ¡Gracias por la invitación! 💚"
      : "Hola, soy " + picked.n + ". Confirmo mi asistencia a los XV de " + C.nombreCorto + " el " + C.fechaTexto + ": asistiremos " + n + (n === 1 ? " persona" : " personas") + " (de " + picked.c + " cupos). ¡Gracias por la invitación! 💚";
    if (C.rsvpEndpoint) {
      try { fetch(C.rsvpEndpoint, { method: "POST", mode: "no-cors", body: JSON.stringify({ nombre: picked.n, cupos: picked.c, asistentes: n, fecha: new Date().toISOString() }) }); } catch (e) {}
    }
    window.open(waUrl(C.whatsapp[0].numero, msg), "_blank", "noopener");
    $("rsvpThanks").hidden = false;
  });
  function buildRsvp() {
    if (guest) pick(guest);
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
  } else {
    $("menuFotos").hidden = true;
  }

  /* ---------- Galería ---------- */
  if (C.galeria && C.galeria.length >= 2) {
    $("galeria").hidden = false;
    C.galeria.forEach(function (g) {
      var fg = document.createElement("figure"), im = document.createElement("img");
      im.src = g.src; im.alt = g.alt || "Foto de " + C.nombreCorto; im.loading = "lazy";
      im.style.objectPosition = g.pos || "50% 40%";
      fg.appendChild(im); $("gallery").appendChild(fg);
    });
  } else {
    $("menuGaleria").hidden = true;
  }

  /* ---------- Música ---------- */
  var bgm = $("bgm"), sound = $("soundBtn"), hasAudio = false;
  if (C.musica) {
    bgm.src = C.musica;
    bgm.addEventListener("loadedmetadata", function () { hasAudio = true; });
    bgm.addEventListener("ended", function () { bgm.currentTime = C.musicaInicio || 0; bgm.play(); });
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
        bgm.volume = 0.7;
        var p = bgm.play();
        var seek = function () { bgm.currentTime = C.musicaInicio || 0; };
        if (bgm.readyState >= 1) seek(); else bgm.addEventListener("loadedmetadata", seek, { once: true });
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

  /* ---------- Banner de video: corre al llegar, sin audio ---------- */
  var vid = $("vid");
  vid.muted = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); });
    }, { threshold: 0.35 }).observe(vid);
  } else { vid.play(); }

  /* ---------- Destellos al tocar (solo al hacer clic o tocar) ---------- */
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var cv = $("fx"), cx = cv.getContext("2d"), dust = [], running = false, DPR = Math.min(devicePixelRatio || 1, 2);
  function size() { cv.width = innerWidth * DPR; cv.height = innerHeight * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  function frame() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    cx.globalCompositeOperation = "lighter";
    for (var i = dust.length - 1; i >= 0; i--) {
      var d = dust[i]; d.life++; d.x += d.vx; d.y += d.vy; d.vy += .01;
      if (d.life > d.max) { dust.splice(i, 1); continue; }
      var k = 1 - d.life / d.max, g = cx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4);
      g.addColorStop(0, "rgba(255,244,205," + k + ")"); g.addColorStop(.4, "rgba(255,214,120," + k * .5 + ")"); g.addColorStop(1, "rgba(255,214,120,0)");
      cx.fillStyle = g; cx.beginPath(); cx.arc(d.x, d.y, d.r * 4, 0, 6.28); cx.fill();
    }
    cx.globalCompositeOperation = "source-over";
    if (dust.length) requestAnimationFrame(frame); else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  size(); addEventListener("resize", size);
  if (!reduce) addEventListener("pointerdown", function (e) {
    for (var i = 0; i < 16; i++) { var a = Math.random() * 6.28, v = Math.random() * 1.6 + .4; dust.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 40 + Math.random() * 30, r: Math.random() * 1.6 + .6 }); }
    if (!running) { running = true; requestAnimationFrame(frame); }
  });

  /* ---------- Adornos animados fijos en las esquinas de cada banner ---------- */
  var BF = '<svg viewBox="0 0 60 50"><g fill="#c9a96a" stroke="#8f7233" stroke-width=".8"><path d="M30 25C22 8 6 2 3 12c-3 11 8 18 27 13z"/><path d="M30 25C38 8 54 2 57 12c3 11-8 18-27 13z"/><path d="M30 25C20 32 10 44 17 47c8 2 12-9 13-22z" fill="#e6d6b0"/><path d="M30 25c10 7 20 19 13 22-8 2-12-9-13-22z" fill="#e6d6b0"/></g><rect x="29" y="14" width="2" height="26" rx="1" fill="#6b5320"/></svg>';
  var SPK = '<svg viewBox="0 0 20 20"><path d="M10 0c.7 5.5 4.5 9.3 10 10-5.5.7-9.3 4.5-10 10-.7-5.5-4.5-9.3-10-10 5.5-.7 9.3-4.5 10-10z" fill="currentColor"/></svg>';
  var FAIRY = '<svg viewBox="0 0 40 34"><defs><radialGradient id="fg"><stop offset="0" stop-color="#fff6d8"/><stop offset=".5" stop-color="#ffd980" stop-opacity=".7"/><stop offset="1" stop-color="#ffd980" stop-opacity="0"/></radialGradient></defs><circle class="orb" cx="20" cy="21" r="12" fill="url(#fg)"/><circle cx="20" cy="21" r="2.4" fill="#fff8e0"/><g fill="rgba(255,248,225,.7)" stroke="rgba(230,200,130,.9)" stroke-width=".6"><ellipse class="wl" cx="11" cy="15" rx="9" ry="4" transform="rotate(-28 11 15)"/><ellipse class="wr" cx="29" cy="15" rx="9" ry="4" transform="rotate(28 29 15)"/></g></svg>';
  [].forEach.call(document.querySelectorAll("main > header, main > section, main > footer"), function (sec, i) {
    var left = i % 2 === 0, d = document.createElement("div");
    d.className = "deco"; d.setAttribute("aria-hidden", "true");
    d.innerHTML = '<span class="bfly ' + (left ? "tl" : "tr") + '">' + BF + '</span>' +
      '<span class="twk ' + (left ? "br" : "bl") + '">' + SPK + SPK + SPK + '</span>' +
      (i % 3 === 0 ? '<span class="fairy ' + (left ? "tr" : "tl") + '">' + FAIRY + '</span>' : "");
    sec.appendChild(d);
  });

  var FLOURISH = '<svg viewBox="0 0 120 22" fill="none" stroke="#c9a96a" stroke-width="1.1" stroke-linecap="round"><path d="M60 11l4-4 4 4-4 4z" fill="#c9a96a"/><path d="M56 11H40c-8 0-9-7-3-8 5-1 6 5 1 5M64 11h16c8 0 9-7 3-8-5-1-6 5-1 5"/><path d="M36 11H8M84 11h28" opacity=".7"/><circle cx="6" cy="11" r="1.4" fill="#c9a96a"/><circle cx="114" cy="11" r="1.4" fill="#c9a96a"/></svg>';
  [].forEach.call(document.querySelectorAll(".orn"), function (o) { o.innerHTML = FLOURISH; });
})();
