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

    // 1) Fetch ALL apartments using micro-batch pagination (no 20 limit)
    const rows = [];
    const header = [
      'id','title','price','listing_type','address','rooms','size','lat','lng','city','neighborhood','riskScore','marketPriceDiff','listing_status','property_type','floor','hasElevator','furnished','pets_allowed','available_from','source','source_url','external_id','created_date','updated_date'
    ];
    rows.push(header);

    let total = 0;
    for (let i = 0; i < 5000; i++) { // up to 100,000 records (5000 * 20)
      const skip = i * 20;
      const batch = await base44.asServiceRole.entities.Apartment.filter({}, '-updated_date', 20, skip);
      if (batch.length === 0) break;

      for (const a of batch) {
        rows.push([
          a.id,
          a.title || '',
          a.price ?? '',
          a.listing_type || '',
          a.address || '',
          a.rooms ?? '',
          a.size ?? '',
          a.lat ?? '',
          a.lng ?? '',
          a.city || '',
          a.neighborhood || '',
          a.riskScore ?? '',
          a.marketPriceDiff ?? '',
          a.listing_status || '',
          a.property_type || '',
          a.floor ?? '',
          a.hasElevator ?? '',
          a.furnished ?? '',
          a.pets_allowed ?? '',
          a.available_from || '',
          a.source || '',
          a.source_url || '',
          a.external_id || '',
          a.created_date || '',
          a.updated_date || ''
        ]);
      }
      total += batch.length;
      if (batch.length < 20) break;
    }

    console.log(`   ✓ Loaded ${total} apartments for sync`);
    if (total === 20) {
      console.error('🚨 Exactly 20 fetched - potential truncation upstream');
    }

    // 2) Get Google Sheets access token (App Connector)
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

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
    const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}/values/${encodeURIComponent(sheetName + '!A1')}:update?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: rows })
    });
    if (!updateRes.ok) {
      const t = await updateRes.text();
      console.error('[GSheets] Update error:', t);
      return Response.json({ error: 'Failed to write values to sheet' }, { status: 500 });
    }

    console.log('   ✓ Wrote rows:', rows.length);
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
    return Response.json({ error: error.message }, { status: 500 });
  }
});