export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const PIXEL_ID = process.env.META_PIXEL_ID;
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
    const API_VERSION = process.env.META_GRAPH_VERSION || 'v26.0';

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return res.status(500).json({
        error: 'Meta credentials not configured'
      });
    }

    const {
      event_id,
      source_url,
      user_agent,
      fbp,
      fbc
    } = req.body || {};

    if (!event_id || !source_url) {
      return res.status(400).json({
        error: 'event_id and source_url are required'
      });
    }

    const forwardedFor = req.headers['x-forwarded-for'];

    const clientIp = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.socket?.remoteAddress;

    const userData = {
      client_ip_address: clientIp,
      client_user_agent:
        user_agent ||
        req.headers['user-agent'] ||
        ''
    };

    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const payload = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: event_id,
          action_source: 'website',
          event_source_url: source_url,
          user_data: userData
        }
      ]
    };

    if (process.env.META_TEST_EVENT_CODE) {
      payload.test_event_code =
        process.env.META_TEST_EVENT_CODE;
    }

    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
        ACCESS_TOKEN
      )}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI error:', data);

      return res.status(response.status).json({
        success: false,
        meta: data
      });
    }

    return res.status(200).json({
      success: true,
      meta: data
    });

  } catch (error) {
    console.error('CAPI error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
