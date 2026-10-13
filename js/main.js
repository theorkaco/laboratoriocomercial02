(() => {
  'use strict';

  // ====== EDITE APENAS AQUI PARA PUBLICAR ======
  const CONFIG = {
    whatsappUrl: 'https://chat.whatsapp.com/SEU-CODIGO-AQUI',
    eventDate: '2026-10-19T20:00:00-03:00',
    fireMetaLeadOnClick: true
  };
  // =============================================

  const ctas = document.querySelectorAll('[data-whatsapp-cta]');

  function buildDestinationUrl() {
    // WhatsApp group links do not accept UTMs in a useful way.
    // We keep this function isolated so the destination can later be changed
    // to a bridge/thank-you page without touching the HTML.
    return CONFIG.whatsappUrl;
  }

  function trackClick(position) {
    try {
      if (window.fbq) {
        window.fbq('trackCustom', 'WhatsAppGroupClick', { position });
        if (CONFIG.fireMetaLeadOnClick) {
          window.fbq('track', 'Lead', { content_name: 'Laboratorio Comercial com IA', cta_position: position });
        }
      }
    } catch (error) {
      // Tracking failure should never block the user from opening WhatsApp.
    }
  }

  ctas.forEach((cta) => {
    cta.setAttribute('href', buildDestinationUrl());
    cta.setAttribute('target', '_blank');
    cta.setAttribute('rel', 'noopener noreferrer');

    cta.addEventListener('click', (event) => {
      const position = cta.dataset.ctaPosition || 'unknown';
      trackClick(position);

      if (CONFIG.whatsappUrl.includes('SEU-CODIGO-AQUI')) {
        event.preventDefault();
        window.alert('Antes de publicar, substitua o link do grupo em js/main.js.');
      }
    });
  });

  const countdownNodes = document.querySelectorAll('[data-countdown]');
  const target = new Date(CONFIG.eventDate).getTime();

  function renderCountdown() {
    if (!countdownNodes.length || Number.isNaN(target)) return;

    const now = Date.now();
    const diff = target - now;
    let label = '';

    if (diff <= 0) {
      const elapsed = now - target;
      label = elapsed < 3 * 60 * 60 * 1000 ? 'É HOJE' : 'AULA EM ANDAMENTO';
    } else {
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      label = days <= 1 ? 'É AMANHÃ' : `FALTAM ${days} DIAS`;
    }

    countdownNodes.forEach((node) => { node.textContent = label; });
  }

  renderCountdown();
})();
