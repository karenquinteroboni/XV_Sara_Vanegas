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
    if (guest) $("opGuest").textContent = guest.n;
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

  /* ---------- Polvo de hadas, hadas y estrellas ---------- */
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var cv = $("fx"), cx = cv.getContext("2d"), W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 2);
  var stars = [], dust = [], fairies = [], T = 0;
  function size() {
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    stars = [];
    var n = Math.round(W * H / 22000);
    for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + .3, p: Math.random() * 6.28, v: Math.random() * .03 + .01 });
  }
  function spark(x, y, o) {
    o = o || {};
    dust.push({ x: x, y: y, vx: (Math.random() - .5) * (o.spread || .5), vy: (o.up ? -Math.random() * .5 - .1 : Math.random() * .4 - .1) + (o.vy || 0),
      life: 0, max: o.max || 50 + Math.random() * 50, r: o.r || Math.random() * 1.8 + .6, tw: Math.random() * 6 });
  }
  function glint(x, y, r, a) {
    var g = cx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, "rgba(255,244,205," + a + ")"); g.addColorStop(.4, "rgba(255,214,120," + a * .5 + ")"); g.addColorStop(1, "rgba(255,214,120,0)");
    cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r * 4, 0, 6.28); cx.fill();
    if (r > 1.2) {
      cx.strokeStyle = "rgba(255,248,220," + a * .9 + ")"; cx.lineWidth = .7;
      cx.beginPath(); cx.moveTo(x - r * 3.2, y); cx.lineTo(x + r * 3.2, y); cx.moveTo(x, y - r * 3.2); cx.lineTo(x, y + r * 3.2); cx.stroke();
    }
  }
  function makeFairy(i) {
    return { a: .21 + i * .07, b: .17 + i * .05, p: i * 2.1, q: i * 1.3, cx: .25 + i * .25, cy: .3 + i * .2, rx: .22 + i * .04, ry: .26, x: 0, y: 0, ang: 0 };
  }
  function drawFairy(f) {
    var t = T * .003;
    var nx = W * (f.cx + f.rx * Math.sin(t * f.a * 6 + f.p)), ny = H * (f.cy + f.ry * Math.sin(t * f.b * 6 + f.q) * Math.cos(t * .7 + f.p));
    f.ang = Math.atan2(ny - f.y, nx - f.x); f.x = nx; f.y = ny;
    spark(f.x + (Math.random() - .5) * 6, f.y + 4, { max: 55, r: Math.random() * 1.6 + .5, spread: .6, vy: .25 });
    if (Math.random() < .2) spark(f.x, f.y + 4, { max: 40, r: .9, spread: .9, vy: .35 });
    glint(f.x, f.y, 2.2, .7);
    var w = Math.sin(T * .2) * .55 + .6;
    cx.save(); cx.translate(f.x, f.y); cx.fillStyle = "rgba(255,248,225,.55)"; cx.strokeStyle = "rgba(255,226,160,.7)"; cx.lineWidth = .6;
    [-1, 1].forEach(function (s) {
      cx.save(); cx.scale(s, 1); cx.rotate(-.55 * w - .25);
      cx.beginPath(); cx.ellipse(8, -3, 9, 4.2, 0, 0, 6.28); cx.fill(); cx.stroke(); cx.restore();
      cx.save(); cx.scale(s, 1); cx.rotate(.35 * w + .35);
      cx.beginPath(); cx.ellipse(6, 4, 6, 2.8, 0, 0, 6.28); cx.fill(); cx.restore();
    });
    cx.restore();
  }
  function frame() {
    T++;
    cx.clearRect(0, 0, W, H);
    cx.globalCompositeOperation = "lighter";
    stars.forEach(function (s) {
      s.p += s.v; var a = .1 + .4 * Math.abs(Math.sin(s.p));
      cx.fillStyle = "rgba(255,232,170," + a + ")"; cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.28); cx.fill();
    });
    if (T % 6 === 0) spark(Math.random() * W, H + 6, { up: true, max: 260, r: Math.random() * 1.5 + .5, spread: .4 });
    for (var i = dust.length - 1; i >= 0; i--) {
      var d = dust[i]; d.life++; d.x += d.vx + Math.sin((d.life + d.tw) * .05) * .15; d.y += d.vy;
      if (d.life > d.max) { dust.splice(i, 1); continue; }
      var k = 1 - d.life / d.max;
      glint(d.x, d.y, d.r * (.6 + .4 * Math.abs(Math.sin(d.life * .2 + d.tw))), k * .9);
    }
    fairies.forEach(drawFairy);
    if (dust.length > 700) dust.splice(0, dust.length - 700);
    cx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }
  size(); addEventListener("resize", size);
  if (!reduce) {
    for (var fi = 0; fi < 3; fi++) fairies.push(makeFairy(fi));
    requestAnimationFrame(frame);
    addEventListener("pointermove", function (e) { if (e.pointerType !== "touch") { spark(e.clientX, e.clientY, { max: 45, spread: 1 }); spark(e.clientX, e.clientY, { max: 30, r: 1, spread: 1.4 }); } });
    addEventListener("pointerdown", function (e) { for (var i = 0; i < 18; i++) { var a = Math.random() * 6.28, v = Math.random() * 1.8 + .4; dust.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 45 + Math.random() * 35, r: Math.random() * 1.8 + .6, tw: Math.random() * 6 }); } });
    var bk = $("bokeh");
    for (var j = 0; j < 14; j++) {
      var el = document.createElement("i"), sz = 8 + Math.random() * 26;
      el.style.cssText = "left:" + Math.random() * 100 + "%;width:" + sz + "px;height:" + sz + "px;animation-duration:" + (12 + Math.random() * 14) + "s;animation-delay:" + (-Math.random() * 20) + "s";
      bk.appendChild(el);
    }
  }
  var FLOURISH = '<svg viewBox="0 0 120 22" fill="none" stroke="#c9a96a" stroke-width="1.1" stroke-linecap="round"><path d="M60 11l4-4 4 4-4 4z" fill="#c9a96a"/><path d="M56 11H40c-8 0-9-7-3-8 5-1 6 5 1 5M64 11h16c8 0 9-7 3-8-5-1-6 5-1 5"/><path d="M36 11H8M84 11h28" opacity=".7"/><circle cx="6" cy="11" r="1.4" fill="#c9a96a"/><circle cx="114" cy="11" r="1.4" fill="#c9a96a"/></svg>';
  [].forEach.call(document.querySelectorAll(".orn"), function (o) { o.innerHTML = FLOURISH; });

  /* ---------- Mariposas ---------- */
  var BF = '<svg viewBox="0 0 60 50"><g fill="#c9a96a" stroke="#8f7233" stroke-width=".8"><path d="M30 25C22 8 6 2 3 12c-3 11 8 18 27 13z"/><path d="M30 25C38 8 54 2 57 12c3 11-8 18-27 13z"/><path d="M30 25C20 32 10 44 17 47c8 2 12-9 13-22z" fill="#e6d6b0"/><path d="M30 25c10 7 20 19 13 22-8 2-12-9-13-22z" fill="#e6d6b0"/></g><rect x="29" y="14" width="2" height="26" rx="1" fill="#6b5320"/></svg>';
  if (!reduce) {
    for (var i = 0; i < 5; i++) {
      var b = document.createElement("div");
      b.className = "bf";
      b.style.left = (8 + i * 19) + "%";
      b.style.width = (22 + Math.random() * 16) + "px";
      b.style.animationDuration = (60 + Math.random() * 35) + "s";
      b.style.animationDelay = (-Math.random() * 90) + "s";
      b.innerHTML = BF;
      $("butterflies").appendChild(b);
    }
  }
})();
