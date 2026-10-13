# Landing Page - Laboratório Comercial com IA

Versão clara criada para testar continuidade visual entre os criativos de fundo branco e a página de inscrição.

## Arquivos

- `index.html` - estrutura e copy
- `css/style.css` - identidade visual e responsividade
- `js/main.js` - link do WhatsApp, evento de Lead e contador
- `assets/logo.svg` - logo provisório editável
- `assets/favicon.svg` - favicon
- `assets/og-image.png` - imagem de compartilhamento

## 3 mudanças obrigatórias antes de publicar

### 1. Link do grupo
Abra `js/main.js` e troque:

```js
whatsappUrl: 'https://chat.whatsapp.com/SEU-CODIGO-AQUI'
```

pelo link real do grupo.

### 2. Meta Pixel
Cole o código-base oficial do seu Pixel no `<head>` do `index.html`, exatamente no comentário `META PIXEL`.

O JS dispara dois eventos nos CTAs se `fbq` existir:

- `WhatsAppGroupClick` (custom)
- `Lead` (standard)

**Importante:** como o destino é um grupo do WhatsApp, o Meta consegue medir o clique, não a entrada confirmada no grupo. Se não quiser chamar o clique de Lead, mude em `js/main.js`:

```js
fireMetaLeadOnClick: false
```

### 3. Horário
A página está configurada para:

- 19/10/2026
- 20h
- Google Meet

Se mudar, ajuste o texto do `index.html` e:

```js
eventDate: '2026-10-19T20:00:00-03:00'
```

## Identidade

- Fundo: `#FFFFFF`
- Texto: `#111111`
- Laranja/coral: `#F04838`
- Fundo de apoio: `#FBF8F6`

As cores ficam no topo de `css/style.css` em `:root`.

## Estrutura estratégica

1. Qualificação imediata: `+R$ 80 mil/mês`
2. Promessa conectada ao criativo: perdas depois que o lead entra
3. CTA acima da dobra
4. Quatro vazamentos comerciais
5. Mecanismo `Processo -> IA -> Time`
6. O que será ensinado
7. Filtro de perfil
8. CTA final

## Publicação

Pode subir a pasta inteira em qualquer hospedagem estática, GitHub Pages, Netlify, Vercel ou no servidor atual.

Se o `index.html` ficar na raiz, mantenha as pastas `css`, `js` e `assets` ao lado dele.

## Teste rápido antes de ativar tráfego

- Abrir no celular
- Clicar nos dois CTAs e no CTA fixo mobile
- Confirmar que o WhatsApp abre no grupo correto
- Verificar no Meta Pixel Helper se `PageView` e o evento escolhido disparam
- Checar a página em 4G / modo anônimo
- Conferir se o botão principal aparece sem rolagem no celular
