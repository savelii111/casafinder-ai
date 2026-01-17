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
    console.log('🔍 [GOOGLE SHEETS DEBUG] Starting FULL diagnostic');
    console.log(`   spreadsheetId: ${spreadsheetId}`);
    console.log('═══════════════════════════════════════════════════════');

    if (!spreadsheetId) {
      console.error('❌ [SHEETS] NO SPREADSHEET ID PROVIDED');
      return Response.json({ listings: [], count: 0, rawCount: 0, warning: 'NO_SPREADSHEET_ID' });
    }

    // Access token via connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // STEP 1: Fetch spreadsheet METADATA
    console.log('📋 [STEP 1] Fetching spreadsheet metadata...');
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!metaRes.ok) {
      const t = await metaRes.text();
      console.error(`❌ [METADATA] API Error: ${metaRes.status} - ${t}`);
      return Response.json({ error: 'Failed to fetch metadata', details: t }, { status: 500 });
    }
    
    const metadata = await metaRes.json();
    const docTitle = metadata.properties?.title || 'Unknown';
    const sheets = metadata.sheets || [];
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📄 [SPREADSHEET METADATA]');
    console.log(`   Document Title: "${docTitle}"`);
    console.log(`   Total Sheets/Tabs: ${sheets.length}`);
    console.log(`   Sheet Names:`);
    sheets.forEach((s, i) => {
      const sheetTitle = s.properties?.title || 'Unnamed';
      const rowCount = s.properties?.gridProperties?.rowCount || 0;
      console.log(`     ${i + 1}. "${sheetTitle}" (${rowCount} rows capacity)`);
    });
    console.log('═══════════════════════════════════════════════════════');

    if (sheets.length === 0) {
      console.error('🚨 CRITICAL: Spreadsheet has ZERO sheets');
      throw new Error('Spreadsheet contains no sheets');
    }

    // STEP 2: Try each sheet to find data
    console.log('📊 [STEP 2] Checking each sheet for data...');
    let selectedSheet = null;
    let values = [];
    
    for (const sheet of sheets) {
      const sheetTitle = sheet.properties?.title || 'Unnamed';
      const range = `${sheetTitle}!A1:Z10000`;
      
      console.log(`   Trying "${sheetTitle}"...`);
      
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!res.ok) {
        console.log(`     ❌ Error fetching "${sheetTitle}": ${res.status}`);
        continue;
      }
      
      const data = await res.json();
      const sheetValues = data.values || [];
      
      console.log(`     ✓ "${sheetTitle}": ${sheetValues.length} rows`);
      
      if (sheetValues.length > 1) { // has header + data
        selectedSheet = sheetTitle;
        values = sheetValues;
        console.log(`     ✅ SELECTED: "${sheetTitle}" has data`);
        break;
      }
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📦 [SELECTED SHEET ANALYSIS]');
    console.log(`   Sheet: "${selectedSheet || 'NONE'}"`);
    console.log(`   Total rows: ${values.length}`);
    if (values.length > 0) {
      console.log(`   Header row: ${JSON.stringify(values[0])}`);
    }
    if (values.length > 1) {
      console.log(`   First data row: ${JSON.stringify(values[1])}`);
    }
    if (values.length > 2) {
      console.log(`   Second data row: ${JSON.stringify(values[2])}`);
    }
    console.log('═══════════════════════════════════════════════════════');
    
    if (!selectedSheet || values.length === 0) {
      console.error('🚨🚨🚨 CRITICAL ERROR 🚨🚨🚨');
      console.error('Google API sees EMPTY spreadsheet — mismatch with UI');
      console.error(`Document: "${docTitle}"`);
      console.error(`All ${sheets.length} sheets returned 0 rows`);
      console.error('Possible causes:');
      console.error('  1. Wrong spreadsheetId');
      console.error('  2. Wrong Google account authorization');
      console.error('  3. Sheets connector has wrong permissions');
      throw new Error(`Google API sees EMPTY spreadsheet "${docTitle}" — UI/API mismatch`);
    }
    
    if (values.length === 1) {
      console.error('⚠️ [SHEETS] ONLY HEADER ROW - NO DATA');
      return Response.json({ 
        listings: [], 
        count: 0, 
        rawCount: 0,
        sheetName: selectedSheet,
        documentTitle: docTitle
      });
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
    console.log(`   Document: "${docTitle}"`);
    console.log(`   Sheet: "${selectedSheet}"`);
    console.log(`   Raw rows: ${rawDataRows.length}`);
    console.log(`   Normalized: ${rawListings.length}`);
    console.log(`   With lat/lng: ${rawListings.filter(l => l.lat && l.lng).length}`);
    
    if (rawListings.length === 20) {
      console.warn('⚠️ Exactly 20 items - verify this is expected');
    }
    console.log('═══════════════════════════════════════════════════════');
    
    return Response.json({ 
      listings: rawListings, 
      count: rawListings.length,
      rawCount: rawDataRows.length,
      withCoords: rawListings.filter(l => l.lat && l.lng).length,
      sheetName: selectedSheet,
      documentTitle: docTitle,
      availableSheets: sheets.map(s => s.properties?.title)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});