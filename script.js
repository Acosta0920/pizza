/* ==========================================================================
   FORNO ROSSO — script.js
   JavaScript Vanilla, organizado por módulos independientes.
   Cada módulo se auto-inicializa si encuentra sus elementos en el DOM,
   así que puedes borrar secciones del HTML sin romper el resto del sitio.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initMenuTabs();
  initMenuImageFallback();
  initGallery();
  initTestimonialSlider();
  initForm();
  initScrollTopButton();
  initFooterYear();
});

/* --------------------------------------------------------------------------
   NAVBAR — pasa de transparente a sólida al hacer scroll
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* --------------------------------------------------------------------------
   MENÚ MÓVIL (hamburguesa)
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const burger = document.getElementById('burgerBtn');
  const menu = document.getElementById('navMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Cierra el menú al pulsar un enlace
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* --------------------------------------------------------------------------
   SCROLL REVEAL — revela elementos con [data-reveal] al entrar en viewport
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   MENÚ — pestañas por categoría (Pizzas, Pastas, Entradas, Bebidas, Postres)
   -------------------------------------------------------------------------- */
function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu__tab');
  const panels = document.querySelectorAll('.menu__grid');

  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;
      const target = document.getElementById(`menu-${category}`);

      // Reset botones
      tabs.forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });

      // Activar actual
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      // Ocultar todos
      panels.forEach((panel) => {
        panel.hidden = true;
      });

      // Mostrar el correcto
      if (target) {
        target.hidden = false;
      }
    });
  });
}
/* --------------------------------------------------------------------------
   IMÁGENES CON FALLBACK — muestra un ícono de reemplazo si una foto no carga
   (evita el ícono roto del navegador cuando una URL de imagen falla)
   Aplica tanto al menú como a la galería.
   -------------------------------------------------------------------------- */
function initMenuImageFallback() {
  setupImageFallback('.menu-card__media img', '.menu-card__media', 'menu-card__media--fallback', '🍽️');
  setupImageFallback('.gallery__item img', '.gallery__item', 'gallery__item--fallback', '📷');
}

function setupImageFallback(imgSelector, containerSelector, fallbackClass, icon) {
  const images = document.querySelectorAll(imgSelector);
  if (!images.length) return;

  images.forEach((img) => {
    const handleError = () => {
      const container = img.closest(containerSelector);
      if (container && !container.classList.contains(fallbackClass)) {
        container.classList.add(fallbackClass);
        const span = document.createElement('span');
        span.textContent = icon;
        span.setAttribute('aria-hidden', 'true');
        container.appendChild(span);
      }
    };

    img.addEventListener('error', handleError, { once: true });

    // Si la imagen ya falló antes de que se registrara el listener (caché del navegador)
    if (img.complete && img.naturalWidth === 0) {
      handleError();
    }
  });
}

/* --------------------------------------------------------------------------
   GALERÍA — lightbox al hacer click en una imagen
   -------------------------------------------------------------------------- */
function initGallery() {
  const items = document.querySelectorAll('.gallery__item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  if (!items.length || !lightbox || !lightboxImg || !closeBtn) return;

  let lastFocused = null;

  const open = (src, alt) => {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  items.forEach((btn) => {
    btn.addEventListener('click', () => {
      const full = btn.dataset.full;
      const img = btn.querySelector('img');
      open(full, img ? img.alt : '');
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) close();
  });
}

/* --------------------------------------------------------------------------
   OPINIONES — carrusel con puntos, controles y autoplay pausable
   -------------------------------------------------------------------------- */
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');
  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  const slides = Array.from(track.children);
  let index = 0;
  let autoplayId = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Ir a la opinión ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
  }

  prevBtn.addEventListener('click', () => { goTo(index - 1); resetAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(index + 1); resetAutoplay(); });

  function startAutoplay() {
    autoplayId = setInterval(() => goTo(index + 1), 6000);
  }
  function resetAutoplay() {
    clearInterval(autoplayId);
    startAutoplay();
  }

  const sliderEl = track.closest('.testimonial-slider');
  sliderEl.addEventListener('mouseenter', () => clearInterval(autoplayId));
  sliderEl.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

/* --------------------------------------------------------------------------
   FORMULARIO DE PEDIDO / RESERVA — validación en el cliente
   PERSONALIZAR: reemplazar el bloque "envío simulado" por tu integración real
   (fetch a tu backend, Formspree, Google Sheets, WhatsApp Business API, etc.)
   -------------------------------------------------------------------------- */
function initForm() {
  const form = document.getElementById('orderForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  const validators = {
    name: (v) => v.trim().length >= 3 || 'Escribe tu nombre completo.',
    phone: (v) => /^[\d\s+()-]{7,}$/.test(v) || 'Ingresa un teléfono válido.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Ingresa un correo válido.',
    'order-type': (v) => v !== '' || 'Selecciona un tipo de pedido.',
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach((field) => {
      const input = form.elements[field];
      const errorEl = form.querySelector(`[data-error-for="${field}"]`);
      const result = validators[field](input.value);

      if (result !== true) {
        input.classList.add('is-invalid');
        if (errorEl) errorEl.textContent = result;
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
        if (errorEl) errorEl.textContent = '';
      }
    });

    if (!isValid) return;

    // --- Envío simulado (reemplazar por integración real) ---
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      submitBtn.textContent = 'Enviar pedido';
      submitBtn.disabled = false;
      if (successMsg) {
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 900);
  });

  // Limpia el error al escribir de nuevo
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('input', () => el.classList.remove('is-invalid'));
  });
}

/* --------------------------------------------------------------------------
   BOTÓN "VOLVER ARRIBA"
   -------------------------------------------------------------------------- */
function initScrollTopButton() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.hidden = window.scrollY < 500;
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
/* --------------------------------------------------------------------------
   AÑO ACTUAL EN EL FOOTER
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}