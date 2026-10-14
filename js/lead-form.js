/* Formulário de captação: abre ao clicar em qualquer botão [data-whatsapp-cta],
   salva no Supabase, dispara o Lead e só então leva para o grupo do WhatsApp. */
(function () {
  'use strict';

  var CONFIG = {
    SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waGlma3ZsZHJ3Z25mb3F6aWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MzEwMzAsImV4cCI6MjEwNzUwNzAzMH0.pVYpM9jTlBn9tSWS3PiqA5fkbC8To2NgCIeyUrFHFRw',
    TABELA: 'leads',
    QUALIFICADOS: ['80-150', '150+'], // faixas que disparam o evento Lead no Meta
    TIMEOUT_MS: 2500
  };

  var isTest = false;
  try { isTest = localStorage.getItem('lc_teste') === '1'; } catch (e) {}

  var state = { href: '', pos: '' };
  var overlay, form, btn, erro;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'lf-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="lf-card" role="dialog" aria-modal="true" aria-labelledby="lf-title">' +
      '<button type="button" class="lf-close" aria-label="Fechar">&times;</button>' +
      '<p id="lf-title" class="lf-title">Receba o link da aula</p>' +
      '<p class="lf-sub">Preencha para entrar no grupo. Leva 20 segundos.</p>' +
      '<form novalidate>' +
      '<label>Seu nome<input name="nome" type="text" autocomplete="name" required></label>' +
      '<label>Seu WhatsApp (com DDD)<input name="whatsapp" type="tel" inputmode="numeric" autocomplete="tel" placeholder="(11) 90000-0000" required></label>' +
      '<label>Faturamento mensal da empresa<select name="faixa" required>' +
      '<option value="">Selecione</option>' +
      '<option value="ate20">Até R$ 20 mil</option>' +
      '<option value="20-50">R$ 20 a 50 mil</option>' +
      '<option value="50-80">R$ 50 a 80 mil</option>' +
      '<option value="80-150">R$ 80 a 150 mil</option>' +
      '<option value="150+">Acima de R$ 150 mil</option>' +
      '</select></label>' +
      '<input name="website" type="text" tabindex="-1" autocomplete="off" class="lf-hp" aria-hidden="true">' +
      '<p class="lf-erro" role="alert" hidden></p>' +
      '<button type="submit" class="btn btn--primary lf-btn">ENTRAR NO GRUPO</button>' +
      '<p class="lf-legal">Ao enviar, você aceita receber o link e os avisos da aula por WhatsApp. Não compartilhamos seus dados.</p>' +
      '</form></div>';
    document.body.appendChild(overlay);
    form = overlay.querySelector('form');
    btn = overlay.querySelector('.lf-btn');
    erro = overlay.querySelector('.lf-erro');
    overlay.querySelector('.lf-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    form.addEventListener('submit', submit);
  }

  function open() {
    if (!overlay) build();
    overlay.hidden = false;
    document.documentElement.classList.add('lf-lock');
    try { if (window.fbq) fbq('trackCustom', 'FormOpen', { position: state.pos }); } catch (e) {}
    setTimeout(function () { form.nome.focus(); }, 50);
  }
  function close() {
    if (!overlay) return;
    overlay.hidden = true;
    document.documentElement.classList.remove('lf-lock');
  }
  function msg(t) { erro.textContent = t; erro.hidden = !t; }
  function digits(s) { return (s || '').replace(/\D/g, ''); }

  function submit(ev) {
    ev.preventDefault();
    if (form.website.value) return; // robô
    var nome = form.nome.value.trim();
    var fone = digits(form.whatsapp.value);
    if (fone.length > 11 && fone.indexOf('55') === 0) fone = fone.slice(2);
    var faixa = form.faixa.value;
    if (nome.length < 2) return msg('Digite seu nome.');
    if (fone.length < 10 || fone.length > 11) return msg('Digite o WhatsApp com DDD.');
    if (!faixa) return msg('Escolha a faixa de faturamento.');
    msg('');

    var q = CONFIG.QUALIFICADOS.indexOf(faixa) > -1;
    var p = new URLSearchParams(location.search);
    var row = {
      nome: nome, whatsapp: fone, faixa: faixa, qualificado: q, teste: isTest,
      posicao: state.pos, pagina: location.pathname, referrer: document.referrer || null,
      utm_source: p.get('utm_source'), utm_medium: p.get('utm_medium'),
      utm_campaign: p.get('utm_campaign'), utm_content: p.get('utm_content'),
      utm_term: p.get('utm_term'), fbclid: p.get('fbclid')
    };

    btn.disabled = true;
    btn.textContent = 'Abrindo o grupo...';

    var req = Promise.resolve();
    if (CONFIG.SUPABASE_URL.indexOf('SEU-PROJETO') === -1) {
      req = fetch(CONFIG.SUPABASE_URL + '/rest/v1/' + CONFIG.TABELA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(row),
        keepalive: true
      }).catch(function () {});
    }
    var limite = new Promise(function (r) { setTimeout(r, CONFIG.TIMEOUT_MS); });

    Promise.race([req, limite]).then(function () {
      track(q, faixa);
      setTimeout(function () { window.location.href = state.href; }, 300);
    });
  }

  function track(qualificado, faixa) {
    if (!window.fbq) return;
    if (qualificado) fbq('track', 'Lead', { content_name: 'aula-19-10', faixa: faixa });
    else fbq('trackCustom', 'LeadFaixaBaixa', { faixa: faixa });
  }

  // Captura o clique antes do main.js, para o Lead não disparar no clique.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-whatsapp-cta]');
    if (!a) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    state.href = a.href;
    state.pos = a.getAttribute('data-cta-position') || '';
    open();
  }, true);
})();
