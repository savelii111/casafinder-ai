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

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 [GOOGLE SHEETS FETCH] Starting');
    console.log(`   spreadsheetId: ${spreadsheetId}`);
    console.log(`   sheetName: ${sheetName}`);
    console.log('═══════════════════════════════════════════════════════');

    if (!spreadsheetId) {
      console.error('❌ [SHEETS] NO SPREADSHEET ID PROVIDED');
      return Response.json({ listings: [], count: 0, rawCount: 0, warning: 'NO_SPREADSHEET_ID' });
    }

    // Access token via connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // Read values from HARDCODED sheet name
    const targetSheet = 'Listings'; // HARDCODED - do not rely on defaults
    const range = `${targetSheet}!A1:ZZZ`;
    
    console.log(`📖 [SHEETS] Fetching range: ${range}`);
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!res.ok) {
      const t = await res.text();
      console.error(`❌ [SHEETS] API Error: ${res.status} - ${t}`);
      return Response.json({ error: 'Failed to read sheet', details: t }, { status: 500 });
    }
    
    const data = await res.json();
    const values = data.values || [];
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📦 [SHEETS] RAW RESPONSE`);
    console.log(`   Total rows (including header): ${values.length}`);
    console.log(`   First row (header): ${JSON.stringify(values[0] || [])}`);
    if (values[1]) {
      console.log(`   Second row (data): ${JSON.stringify(values[1])}`);
    }
    console.log('═══════════════════════════════════════════════════════');
    
    if (values.length === 0) {
      console.error('❌ [SHEETS] ZERO ROWS RETURNED FROM GOOGLE SHEETS');
      return Response.json({ listings: [], count: 0, rawCount: 0 });
    }
    
    if (values.length === 1) {
      console.error('⚠️ [SHEETS] ONLY HEADER ROW - NO DATA');
      return Response.json({ listings: [], count: 0, rawCount: 0 });
    }

    const header = values[0];
    const rawDataRows = values.slice(1);
    
    console.log(`📊 [SHEETS] Processing ${rawDataRows.length} data rows`);
    
    const idx = (name) => header.indexOf(name);
    
    // Log column mapping
    console.log(`📋 [SHEETS] Column mapping:`);
    console.log(`   id: col ${idx('id')}`);
    console.log(`   title: col ${idx('title')}`);
    console.log(`   price: col ${idx('price')}`);
    console.log(`   lat: col ${idx('lat')}`);
    console.log(`   lng: col ${idx('lng')}`);

    // NO FILTERING - return ALL rows
    const rawListings = rawDataRows.map((row, i) => {
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

      const listing = {
        id: g('id') || `row_${i}`,
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
      
      if (i === 0) {
        console.log(`📝 [SHEETS] First listing after normalization:`, JSON.stringify(listing, null, 2));
      }
      
      return listing;
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ [SHEETS FETCH] Complete`);
    console.log(`   Raw rows: ${rawDataRows.length}`);
    console.log(`   Normalized: ${rawListings.length}`);
    console.log(`   With lat/lng: ${rawListings.filter(l => l.lat && l.lng).length}`);
    console.log('═══════════════════════════════════════════════════════');

    if (rawListings.length === 20) {
      throw new Error('🚨 FORBIDDEN: 20-item limit detected. Google Sheets pipeline broken.');
    }
    
    return Response.json({ 
      listings: rawListings, 
      count: rawListings.length,
      rawCount: rawDataRows.length,
      withCoords: rawListings.filter(l => l.lat && l.lng).length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});