/**
 * ZapCatálogo — JavaScript da aplicação
 * Responsável por: Intersection Observer, Dropzone, Upload via fetch, Smooth Scroll
 */

(function () {
  'use strict';

  /* ─── INTERSECTION OBSERVER — Scroll Storytelling ─── */
  const stepCards = document.querySelectorAll('.step-card');

  if (stepCards.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const index = Array.from(stepCards).indexOf(card);
            setTimeout(() => card.classList.add('visible'), index * 160);
            observer.unobserve(card);
          }
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.18 }
    );

    stepCards.forEach((card) => observer.observe(card));
  } else {
    stepCards.forEach((card) => card.classList.add('visible'));
  }

  /* ─── SMOOTH SCROLL para âncoras ─── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ─── UPLOAD / DROPZONE ─── */
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    });
  }

  /* ─── UPLOAD VIA FETCH PARA O BACKEND ─── */
  async function handleFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const dropEl = document.getElementById('dropzone');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    dropEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao processar arquivo');
      window.location.href = '/?step=2';
    } catch (err) {
      errorText.textContent = err.message;
      errorEl.classList.remove('hidden');
      loadingEl.classList.add('hidden');
      dropEl.classList.remove('hidden');
    }
  }

  /* ─── PARÂMETROS DA URL ─── */
  const params = new URLSearchParams(window.location.search);
  if (params.get('step') === '2') {
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const dz = document.getElementById('dropzone');
        if (dz) dz.classList.add('dragover');
        setTimeout(() => document.getElementById('dropzone')?.classList.remove('dragover'), 800);
      }, 500);
    }
  }

  /* ─── MOCKUP INTERATIVO: bubbles acompanham scroll ─── */
  const phoneScreen = document.getElementById('phoneScreen');
  if (phoneScreen && 'IntersectionObserver' in window) {
    const bubbles = phoneScreen.querySelectorAll('.chat-bubble');
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const step = parseInt(entry.target.dataset.step);
          if (entry.isIntersecting && !isNaN(step) && bubbles[step]) {
            bubbles[step].style.opacity = '1';
          }
        });
      },
      { threshold: 0.3 }
    );
    stepCards.forEach((card) => stepObserver.observe(card));
  }
})();
