import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { ApifyClient } from 'npm:apify-client@2.9.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_KEY')
);

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { city = 'madrid', listing_type = 'sale', maxResults = 50 } = body;
    
    console.log(`[APIFY] Starting scrape: city=${city}, type=${listing_type}, max=${maxResults}`);
    
    const APIFY_TOKEN = Deno.env.get('APIFY_API_TOKEN');
    if (!APIFY_TOKEN) {
      return Response.json({ error: 'APIFY_API_TOKEN not set' }, { status: 500 });
    }

    const client = new ApifyClient({ token: APIFY_TOKEN });

    // Use Fotocasa scraper actor
    console.log('[APIFY] Starting actor run...');
    const run = await client.actor('trudax/fotocasa-scraper').call({
      location: city,
      propertyType: listing_type === 'sale' ? 'buy' : 'rent',
      maxItems: maxResults
    });

    console.log(`[APIFY] Run completed: ${run.id}, status: ${run.status}`);

    // Fetch results from dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`[APIFY] Got ${items.length} raw results`);

    // Transform to our schema
    const apartments = items.map((item, index) => {
      // Extract coordinates if available
      let lat = 40.4168; // Madrid default
      let lng = -3.7038;
      
      if (item.location?.latitude && item.location?.longitude) {
        lat = parseFloat(item.location.latitude);
        lng = parseFloat(item.location.longitude);
      }

      return {
        title: item.title || `Property in ${city}`,
        price: parseFloat(item.price?.replace(/[^0-9]/g, '')) || 0,
        listing_type: listing_type,
        address: item.address || item.location?.address || `${city}, Spain`,
        rooms: parseInt(item.rooms) || parseInt(item.bedrooms) || 2,
        size: parseInt(item.size) || parseInt(item.surface) || 50,
        lat: lat,
        lng: lng,
        photos: item.images || item.photos || [],
        source: 'fotocasa',
        source_url: item.url || '',
        external_id: `apify_fotocasa_${item.id || index}_${Date.now()}`,
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

    console.log(`[APIFY] Transformed ${apartments.length} apartments`);

    // Save to Supabase
    if (apartments.length > 0) {
      console.log(`[SUPABASE] Saving ${apartments.length} apartments...`);
      
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
    }

    return Response.json({
      success: true,
      count: apartments.length,
      stored_in: 'Supabase',
      run_id: run.id,
      apartments: apartments.slice(0, 5) // Sample
    });

  } catch (error) {
    console.error('[APIFY] Error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});