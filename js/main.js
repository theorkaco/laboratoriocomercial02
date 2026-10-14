(() => {
  'use strict';

  // ====== EDITE APENAS AQUI PARA PUBLICAR ======
  const CONFIG = {
    whatsappUrl: 'https://chat.whatsapp.com/CwWSyaBPHlkCArY6dXj4Zu',
    eventDate: '2026-10-19T20:00:00-03:00',
    fireMetaLeadOnClick: false
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

    function getCookie(name) {
    const match = document.cookie.match(
      new RegExp('(^|; )' + name + '=([^;]*)')
    );

    return match ? decodeURIComponent(match[2]) : null;
  }

  function sendMetaCapi() {
    try {
      const eventId =
        'lead_' +
        Date.now() +
        '_' +
        Math.random().toString(36).substring(2, 10);

      fetch('/api/meta-capi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        keepalive: true,
        body: JSON.stringify({
          event_id: eventId,
          source_url: window.location.href,
          user_agent: navigator.userAgent,
          fbp: getCookie('_fbp'),
          fbc: getCookie('_fbc')
        })
      }).catch(() => {
        // Se a API falhar, não interfere no botão do WhatsApp.
      });

    } catch (error) {
      // Nunca bloquear o usuário.
    }
  }
  
  ctas.forEach((cta) => {
    cta.setAttribute('href', buildDestinationUrl());
    cta.setAttribute('target', '_blank');
    cta.setAttribute('rel', 'noopener noreferrer');

    cta.addEventListener('click', (event) => {
      const position = cta.dataset.ctaPosition || 'unknown';
      trackClick(position);
      sendMetaCapi();

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
