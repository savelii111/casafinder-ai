import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { city = 'Madrid', listing_type = 'rent', startPage = 1 } = body;
    
    console.log(`[BATCH] Starting batch parse: city=${city}, type=${listing_type}, startPage=${startPage}`);
    
    const ZENROWS_API_KEY = Deno.env.get('ZENROWS_API_KEY');
    if (!ZENROWS_API_KEY) {
      return Response.json({ error: 'ZENROWS_API_KEY not set' }, { status: 500 });
    }

    const cityMap = {
      'madrid': 'madrid-madrid',
      'barcelona': 'barcelona-barcelona',
      'valencia': 'valencia-valencia',
      'seville': 'sevilla-sevilla',
      'sevilla': 'sevilla-sevilla'
    };
    const locationUri = cityMap[(city || 'madrid').toLowerCase()] || 'madrid-madrid';

    const apartments = [];
    const now = new Date().toISOString();
    
    // Parse 20 pages per batch
    for (let page = startPage; page < startPage + 20; page++) {
      const apiUrl = `https://www.idealista.com/ajax/listingcontroller/getlisting.ajax?locationUri=${locationUri}&typology=flat&operation=${listing_type}&numPage=${page}&maxItems=200&order=publicationDate&language=en`;
      const zenrowsUrl = `https://api.zenrows.com/v1/?url=${encodeURIComponent(apiUrl)}&apikey=${ZENROWS_API_KEY}&json_response=true`;
      
      try {
        const response = await fetch(zenrowsUrl);
        if (!response.ok) {
          console.error(`[BATCH] Page ${page} failed: ${response.status}`);
          continue;
        }

        const data = await response.json();
        if (!data.elementList || data.elementList.length === 0) {
          console.log(`[BATCH] Page ${page} empty, stopping`);
          break;
        }

        for (const item of data.elementList) {
          const external_id = item.propertyCode || item.id;
          const latitude = item.latitude;
          const longitude = item.longitude;
          
          if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) continue;

          const idealistaPhotos = item.multimedia?.images?.map(img => img.url) || [];
          const fallbackPhotos = [
            `https://source.unsplash.com/800x600/?apartment,madrid,${Math.random()}`,
            `https://source.unsplash.com/800x600/?apartment,modern,${Math.random()}`
          ];
          const photos = idealistaPhotos.length > 0 ? idealistaPhotos : fallbackPhotos;

          const apartment = {
            title: `${item.propertyType || 'Apartment'} in ${item.district || 'Madrid'}`,
            price: item.price || 0,
            listing_type: listing_type,
            address: item.address || `${item.district}, Madrid`,
            rooms: item.rooms || 2,
            size: item.size || 50,
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
            photos: photos.slice(0, 5),
            source: 'idealista',
            source_url: `https://www.idealista.com/inmueble/${external_id}/`,
            external_id: external_id,
            listing_status: 'active',
            city: city,
            neighborhood: item.district || item.neighborhood || 'Centro',
            last_sync_date: now,
            riskScore: Math.floor(Math.random() * 10) + 1,
            marketPriceDiff: (Math.random() - 0.5) * 30,
            property_type: 'apartment',
            pets_allowed: Math.random() > 0.6,
            floor: item.floor,
            hasElevator: item.hasLift || false,
            furnished: item.detailedType?.subTypology?.includes('furnished') || false,
          };

          const existing = await base44.asServiceRole.entities.Apartment.filter({ external_id });
          if (existing.length > 0) {
            await base44.asServiceRole.entities.Apartment.update(existing[0].id, apartment);
          } else {
            await base44.asServiceRole.entities.Apartment.create(apartment);
          }
          apartments.push(apartment);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`[BATCH] Error on page ${page}:`, err.message);
      }
    }

    console.log(`[BATCH] Complete: ${apartments.length} apartments processed`);
    
    return Response.json({
      success: true,
      count: apartments.length,
      nextPage: startPage + 20,
      apartments: apartments
    });
  } catch (error) {
    console.error('[BATCH] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});