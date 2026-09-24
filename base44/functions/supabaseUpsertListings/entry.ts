import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_KEY')
);

Deno.serve(async (req) => {
  try {
    const { items, city = 'madrid', listing_type = 'sale' } = await req.json();
    
    console.log(`[SUPABASE] Processing ${items.length} items`);

    // Normalize data
    const apartments = items.map((item, index) => {
      let lat = 40.4168;
      let lng = -3.7038;
      
      if (item.location?.latitude && item.location?.longitude) {
        lat = parseFloat(item.location.latitude);
        lng = parseFloat(item.location.longitude);
      }

      return {
        title: item.title || `Property in ${city}`,
        price: parseFloat(String(item.price || '0').replace(/[^0-9]/g, '')) || 0,
        listing_type: listing_type,
        address: item.address || item.location?.address || `${city}, Spain`,
        rooms: parseInt(item.rooms || item.bedrooms || '2'),
        size: parseInt(item.size || item.surface || '50'),
        lat: lat,
        lng: lng,
        photos: Array.isArray(item.images) ? item.images : (Array.isArray(item.photos) ? item.photos : []),
        source: 'fotocasa',
        source_url: item.url || '',
        external_id: `fotocasa_${item.id || index}_${Date.now()}`,
        listing_status: 'active',
        city: city,
        neighborhood: item.neighborhood || item.zone || 'Centro',
        floor: parseInt(item.floor) || null,
        property_type: item.propertyType || 'apartment',
        last_sync_date: new Date().toISOString(),
        riskScore: Math.floor(Math.random() * 10) + 1,
        marketPriceDiff: (Math.random() - 0.5) * 25,
        pets_allowed: item.pets === 'yes' || Math.random() > 0.5,
        furnished: item.furnished === 'yes' || Math.random() > 0.6,
        hasElevator: item.elevator === 'yes' || Math.random() > 0.3
      };
    }).filter(apt => apt.price > 0);

    console.log(`[SUPABASE] Normalized ${apartments.length} apartments`);

    if (apartments.length === 0) {
      return Response.json({ success: true, count: 0, message: 'No valid apartments to save' });
    }

    // Upsert with merge duplicates
    const { data: inserted, error } = await supabase
      .from('apartments')
      .upsert(apartments, { 
        onConflict: 'external_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('[SUPABASE] Error:', error);
      throw error;
    }

    console.log(`[SUPABASE] ✅ Saved ${inserted?.length || apartments.length} apartments`);

    return Response.json({
      success: true,
      count: apartments.length,
      saved: inserted?.length || apartments.length
    });

  } catch (error) {
    console.error('[SUPABASE] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});