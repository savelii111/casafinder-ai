import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = [];
    const header = [
      'id','title','price','listing_type','address','rooms','size','lat','lng','city','neighborhood','riskScore','marketPriceDiff','listing_status','property_type','floor','hasElevator','furnished','pets_allowed','available_from','source','source_url','external_id','created_date','updated_date'
    ];
    rows.push(header.join(','));

    let total = 0;
    for (let i = 0; i < 5000; i++) { // up to 100,000 records
      const skip = i * 1000;
      const batch = await base44.asServiceRole.entities.Apartment.filter({}, '-updated_date', 1000, skip);
      if (batch.length === 0) break;

      for (const a of batch) {
        const r = [
          a.id,
          (a.title || '').replaceAll('"', '""'),
          a.price ?? '',
          a.listing_type || '',
          (a.address || '').replaceAll('"', '""'),
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
        ].map(v => typeof v === 'string' ? `"${v}"` : v);
        rows.push(r.join(','));
      }

      total += batch.length;
      if (batch.length < 1000) break;
    }

    const csv = rows.join('\n');
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=apartments_${new Date().toISOString().slice(0,10)}.csv`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});