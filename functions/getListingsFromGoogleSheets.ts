import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function toBool(v) {
  if (typeof v === 'boolean') return v;
  const s = String(v || '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'y';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { spreadsheetId, sheetName = 'Listings' } = body || {};

    if (!spreadsheetId) {
      return Response.json({ listings: [], count: 0, warning: 'NO_SPREADSHEET_ID' });
    }

    // Access token via connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // Read values
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName + '!A1:ZZZ')}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      const t = await res.text();
      return Response.json({ error: 'Failed to read sheet', details: t }, { status: 500 });
    }
    const data = await res.json();
    const values = data.values || [];
    if (values.length === 0) {
      return Response.json({ listings: [], count: 0 });
    }

    const header = values[0];
    const idx = (name) => header.indexOf(name);

    const listings = values.slice(1).map((row) => {
      const g = (name) => row[idx(name)] ?? '';
      const num = (name) => {
        const v = g(name);
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : undefined;
      };
      const int = (name) => {
        const v = g(name);
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? n : undefined;
      };

      const photosStr = g('photos');
      const photos = photosStr ? photosStr.split(',').map(s => s.trim()).filter(Boolean) : [];

      return {
        id: g('id'),
        title: g('title'),
        price: num('price'),
        currency: g('currency') || 'EUR',
        listing_type: g('type') || 'rent',
        city: g('city'),
        neighborhood: g('neighborhood'),
        address: g('address'),
        lat: num('lat'),
        lng: num('lng'),
        rooms: int('rooms'),
        size: int('size'),
        floor: int('floor'),
        furnished: toBool(g('furnished')),
        pets_allowed: toBool(g('pets_allowed')),
        photos,
        source: g('source'),
        updated_at: g('updated_at'),
      };
    });

    return Response.json({ listings, count: listings.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});