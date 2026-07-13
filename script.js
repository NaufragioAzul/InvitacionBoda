/* ==========================================================================
   BODAS DE ORO — Carmen & Alberto
   Vanilla JS modular. Sin dependencias externas.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initImageFallbacks();
  initEnvelope();
  initParticles();
  initScrollReveal();
  initCarousel();
  initMusicPlayer();
  initRSVP();
});

/* --------------------------------------------------------------------------
   0. FALLBACK DE IMÁGENES
   Si una imagen de Unsplash no carga (bloqueo de red, id caducado, etc.)
   se reemplaza automáticamente por el placeholder definido en data-fallback.
   -------------------------------------------------------------------------- */
function initImageFallbacks() {
  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.src !== img.dataset.fallback) {
        img.src = img.dataset.fallback;
      }
    }, { once: true });
  });
}

/* --------------------------------------------------------------------------
   1. SOBRE 3D — apertura y revelado de la invitación
   -------------------------------------------------------------------------- */
function initEnvelope() {
  const envelope = document.getElementById('envelope');
  const welcomeScreen = document.getElementById('welcome-screen');
  const invitation = document.getElementById('invitation');
  const musicPlayer = document.getElementById('music-player');
  const tapHint = document.getElementById('tap-hint');

  if (!envelope) return;

  let opened = false;

  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;

    envelope.classList.add('is-open');
    tapHint.style.opacity = '0';

    // 1. La solapa gira en 3D y la carta sale (definido en CSS, ~1.9s).
    // 2. Tras ese tiempo, el sobre completo se desvanece hacia abajo.
    setTimeout(() => {
      welcomeScreen.classList.add('is-hidden');
    }, 1500);

    // 3. Se revela la invitación con un efecto de aparición escalonado.
    setTimeout(() => {
      welcomeScreen.setAttribute('aria-hidden', 'true');
      invitation.removeAttribute('aria-hidden');
      invitation.style.display = 'block';
      document.body.style.overflowY = 'auto';

      // arranca el reproductor y la primera tanda de revelado visible
      musicPlayer.removeAttribute('aria-hidden');
      revealVisibleNow();
      attemptAutoplay();
    }, 2450);
  });

  // Antes de abrir, evita el scroll del body para mantener el foco en el sobre.
  document.body.style.overflowY = 'hidden';
}

/* --------------------------------------------------------------------------
   2. PARTÍCULAS DORADAS FLOTANTES (canvas)
   -------------------------------------------------------------------------- */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles;
  const PARTICLE_COUNT = window.innerWidth < 700 ? 38 : 70;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.4,
      speedY: Math.random() * 0.35 + 0.08,
      speedX: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
  }

  function tick(t) {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.twinklePhase += p.twinkleSpeed;

      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const twinkle = (Math.sin(p.twinklePhase) + 1) / 2;
      const alpha = p.alpha * (0.4 + twinkle * 0.6);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 199, 102, ${alpha.toFixed(3)})`;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  init();
  requestAnimationFrame(tick);
}

/* --------------------------------------------------------------------------
   3. SCROLL REVEAL — aparición escalonada de secciones al hacer scroll
   -------------------------------------------------------------------------- */
let scrollObserver;

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = (i % 4) * 90;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => scrollObserver.observe(el));
}

// Revela de inmediato lo que ya está en pantalla justo tras abrir el sobre,
// para que la cabecera de la invitación no aparezca "vacía".
function revealVisibleNow() {
  document.querySelectorAll('.reveal').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('is-visible');
    }
  });
}

/* --------------------------------------------------------------------------
   4. CARRUSEL DE FOTOGRAFÍAS
   -------------------------------------------------------------------------- */
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const dotsWrap = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const carousel = document.getElementById('carousel');
  if (!track) return;

  const slides = Array.from(track.children);
  let index = 0;
  let autoplayId = null;
  const AUTOPLAY_MS = 4000;

  // construye los indicadores (dots)
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir a la fotografía ${i + 1}`);
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  }

  function goTo(i, userTriggered) {
    index = (i + slides.length) % slides.length;
    render();
    if (userTriggered) restartAutoplay();
  }

  function next(userTriggered) { goTo(index + 1, userTriggered); }
  function prev(userTriggered) { goTo(index - 1, userTriggered); }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(() => next(false), AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }
  function restartAutoplay() {
    startAutoplay();
  }

  prevBtn.addEventListener('click', () => prev(true));
  nextBtn.addEventListener('click', () => next(true));

  // pausa el autoplay si el usuario tiene el cursor sobre la galería
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // soporte táctil (swipe) para móviles
  let touchStartX = 0;
  let touchDeltaX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    const SWIPE_THRESHOLD = 40;
    if (touchDeltaX > SWIPE_THRESHOLD) prev(true);
    else if (touchDeltaX < -SWIPE_THRESHOLD) next(true);
    else startAutoplay();
    touchDeltaX = 0;
  });

  render();
  startAutoplay();
}

/* --------------------------------------------------------------------------
   5. REPRODUCTOR DE MÚSICA FLOTANTE
   -------------------------------------------------------------------------- */
function initMusicPlayer() {
  const player = document.getElementById('music-player');
  const toggleBtn = document.getElementById('music-toggle');
  const nextBtn = document.getElementById('music-next');
  const progressBar = document.getElementById('music-progress');
  const progressFill = document.getElementById('music-progress-fill');
  const trackName = document.getElementById('music-track-name');
  if (!player) return;

  const tracks = [
    { el: document.getElementById('audio-track-1'), label: 'Pista 1 — Nuestra melodía' },
    { el: document.getElementById('audio-track-2'), label: 'Pista 2 — Bajo la luna dorada' },
  ];

  let current = 0;
  let isPlaying = false;

  function setTrack(i, autoplay) {
    tracks[current].el.pause();
    current = (i + tracks.length) % tracks.length;
    trackName.textContent = tracks[current].label;
    progressFill.style.width = '0%';
    if (autoplay) play();
  }

  function play() {
    tracks[current].el.play().then(() => {
      isPlaying = true;
      player.classList.add('is-playing');
    }).catch(() => {
      // el navegador bloqueó el autoplay: se necesitará interacción manual
      isPlaying = false;
      player.classList.remove('is-playing');
    });
  }

  function pause() {
    tracks[current].el.pause();
    isPlaying = false;
    player.classList.remove('is-playing');
  }

  toggleBtn.addEventListener('click', () => {
    if (isPlaying) pause();
    else play();
  });

  nextBtn.addEventListener('click', () => setTrack(current + 1, isPlaying));

  // cuando termina una pista, pasa automáticamente a la siguiente sin cortes
  tracks.forEach((t, i) => {
    t.el.addEventListener('ended', () => setTrack(i + 1, true));

    t.el.addEventListener('timeupdate', () => {
      if (i !== current || !t.el.duration) return;
      const pct = (t.el.currentTime / t.el.duration) * 100;
      progressFill.style.width = `${pct}%`;
    });
  });

  // barra de progreso interactiva: clic para saltar a un punto de la canción
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const t = tracks[current].el;
    if (t.duration) t.currentTime = ratio * t.duration;
  });

  trackName.textContent = tracks[current].label;

  // expone un intento de autoplay al abrir el sobre (algunos navegadores lo permiten
  // tras la interacción de clic sobre el sobre; si lo bloquean, el usuario pulsa play)
  window.__attemptMusicAutoplay = () => play();
}

function attemptAutoplay() {
  if (window.__attemptMusicAutoplay) window.__attemptMusicAutoplay();
}

/* --------------------------------------------------------------------------
   6. RSVP — construye el enlace de WhatsApp con el mensaje pre-llenado
   -------------------------------------------------------------------------- */
function initRSVP() {
  const link = document.getElementById('rsvp-link');
  if (!link) return;

  const PHONE = '51979797137'; // número genérico — reemplázalo por el real
  const message =
    '¡Hola! Confirmo con mucha alegría mi asistencia a las Bodas de Oro de ' +
    'Carmen y Alberto el 1 de agosto. Mi nombre es: [Escribe tu nombre aquí] ' +
    'y asistiré con [Número] acompañantes.';

  link.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}
