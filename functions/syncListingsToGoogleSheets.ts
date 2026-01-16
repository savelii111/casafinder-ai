import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      spreadsheetId,
      sheetName = 'Listings',
      city = 'Madrid'
    } = body || {};

    console.log('═══════════════════════════════════════════════════════');
    console.log('📤 [GSHEETS SYNC] Start');
    console.log(`   Target sheet: ${sheetName}`);
    console.log(`   Spreadsheet ID provided: ${!!spreadsheetId}`);

    // 1) Fetch ALL listings from ZenRows/API (no 20 limit)
    const rows = [];
    const header = [
      'id','title','price','currency','type','city','neighborhood','address','lat','lng','rooms','size','floor','furnished','pets_allowed','photos','source','updated_at'
    ];
    rows.push(header);

    // Call existing ZenRows fetcher (rent + sale)
    console.log('   Calling fetchListingsZenrows...');
    let syncRes;
    try {
      syncRes = await base44.functions.invoke('fetchListingsZenrows', { city, listing_type: 'both' });
      console.log(`   ZenRows fetch result: ${syncRes?.data?.apartments?.length || 0} apartments`);
    } catch (fetchError) {
      console.error('   ❌ ZenRows fetch failed:', fetchError.message);
      // Continue with empty array
      syncRes = { data: { apartments: [] } };
    }
    const apiApts = syncRes?.data?.apartments || [];

    // Deduplicate by id + source
    const seen = new Set();
    let fetchedCount = 0;
    let writtenCount = 0;

    for (const a of apiApts) {
      fetchedCount++;
      const src = a.source || 'idealista';
      const plainId = a.external_id || a.id || `${(a.title || '').slice(0,20)}-${a.lat}-${a.lng}`;
      const key = `${src}:${plainId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Limit photos to first 3 to reduce data size
      const photosList = (a.photos || []).slice(0, 3);
      const photos = photosList.join(',');
      const currency = 'EUR';
      const updatedAt = a.last_sync_date || new Date().toISOString();

      rows.push([
        plainId,
        (a.title || '').substring(0, 200), // Limit title length
        a.price ?? '',
        currency,
        a.listing_type || 'rent',
        a.city || city,
        (a.neighborhood || '').substring(0, 100),
        (a.address || '').substring(0, 200),
        a.lat ?? '',
        a.lng ?? '',
        a.rooms ?? '',
        a.size ?? '',
        a.floor ?? '',
        a.furnished ?? false,
        a.pets_allowed ?? false,
        photos,
        src,
        updatedAt
      ]);
      writtenCount++;
    }

    console.log(`   Fetched from API: ${fetchedCount}`);
    console.log(`   Prepared for Sheet (deduped): ${writtenCount}`);

    // 2) Get Google Sheets access token (App Connector)
    console.log('   Getting Google Sheets access token...');
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
    console.log(`   Token received: ${accessToken ? 'YES' : 'NO'}`);

    // 3) Create spreadsheet if not provided
    let targetSpreadsheetId = spreadsheetId;
    if (!targetSpreadsheetId) {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title: `RentAI Listings ${new Date().toISOString().slice(0,10)} (${city})` },
          sheets: [{ properties: { title: sheetName } }]
        })
      });
      if (!createRes.ok) {
        const t = await createRes.text();
        console.error('[GSheets] Create error:', t);
        return Response.json({ error: 'Failed to create spreadsheet' }, { status: 500 });
      }
      const created = await createRes.json();
      targetSpreadsheetId = created.spreadsheetId;
      console.log('   ✓ Created spreadsheet:', targetSpreadsheetId);
    } else {
      // Ensure target sheet exists; if not, create it
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!metaRes.ok) {
        const t = await metaRes.text();
        console.error('[GSheets] Metadata error:', t);
        return Response.json({ error: 'Failed to read spreadsheet metadata' }, { status: 500 });
      }
      const meta = await metaRes.json();
      const exists = (meta.sheets || []).some(s => s.properties?.title === sheetName);
      if (!exists) {
        const addRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: sheetName } } }]
          })
        });
        if (!addRes.ok) {
          const t = await addRes.text();
          console.error('[GSheets] addSheet error:', t);
          return Response.json({ error: 'Failed to create sheet' }, { status: 500 });
        }
        console.log('   ✓ Added sheet:', sheetName);
      }
    }

    // 4) Clear target sheet
    const clearRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}/values/${encodeURIComponent(sheetName + '!A:ZZ')}:clear`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!clearRes.ok) {
      const t = await clearRes.text();
      console.error('[GSheets] Clear error:', t);
    }

    // 5) Write values (single batch)
    const rowsCount = rows.length;
    const dataSize = JSON.stringify(rows).length;
    console.log(`   Writing ${rowsCount} rows (${(dataSize / 1024).toFixed(2)} KB)`);
    
    if (dataSize > 10_000_000) {
      console.error('   ❌ Data too large (>10MB), need batching');
      return Response.json({ error: 'Data too large, contact support' }, { status: 500 });
    }
    
    const range = `${sheetName}!A1`;
    const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: rows })
    });
    
    if (!updateRes.ok) {
      const t = await updateRes.text();
      console.error('[GSheets] Update error:', updateRes.status, t);
      console.error('[GSheets] Rows count:', rowsCount);
      console.error('[GSheets] Data size:', dataSize, 'bytes');
      return Response.json({ 
        error: 'Failed to write values to sheet',
        details: `Status ${updateRes.status}: ${t.substring(0, 500)}`,
        rowsCount,
        dataSize
      }, { status: 500 });
    }

    console.log('   ✓ Wrote rows:', rows.length);
    console.log(`   Written to Sheet: ${rows.length - 1}`);

    // Check total rows in sheet
    const metaRes2 = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}/values/${encodeURIComponent(sheetName + '!A1:ZZ')}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (metaRes2.ok) {
      const metaVals = await metaRes2.json();
      const totalRows = (metaVals.values || []).length - 1;
      console.log(`   Sheet total rows: ${Math.max(totalRows, 0)}`);
    }
    console.log('═══════════════════════════════════════════════════════');

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${targetSpreadsheetId}`;
    return Response.json({
      success: true,
      spreadsheetId: targetSpreadsheetId,
      spreadsheetUrl,
      rows: rows.length
    });
  } catch (error) {
    console.error('[GSHEETS SYNC] Error:', error);
    console.error('[GSHEETS SYNC] Stack:', error.stack);
    return Response.json({ 
      error: error.message,
      stack: error.stack,
      details: 'Check server logs for full error'
    }, { status: 500 });
  }
});