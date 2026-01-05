import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { city = 'Madrid', listing_type = 'rent' } = body;
    
    const ZENROWS_API_KEY = Deno.env.get('ZENROWS_API_KEY');

    // DEMO FALLBACK if no API key
    if (!ZENROWS_API_KEY) {
      console.log('ZenRows API key not set, using demo mode');
      const apartments = await base44.asServiceRole.entities.Apartment.filter({
        city: city,
        listing_status: 'active',
        listing_type: listing_type
      });
      return Response.json({ 
        success: false,
        error: 'DEMO_MODE',
        apartments 
      });
    }

    // Use Idealista's internal AJAX API endpoint (returns JSON with lat/lng)
    const apiUrl = listing_type === 'rent'
      ? 'https://www.idealista.com/ajax/listingcontroller/getlisting.ajax?locationUri=madrid-madrid&typology=flat&operation=rent&numPage=1&maxItems=50&order=publicationDate&language=en'
      : 'https://www.idealista.com/ajax/listingcontroller/getlisting.ajax?locationUri=madrid-madrid&typology=flat&operation=sale&numPage=1&maxItems=50&order=publicationDate&language=en';

    // ZenRows with JSON rendering
    const zenrowsUrl = `https://api.zenrows.com/v1/?url=${encodeURIComponent(apiUrl)}&apikey=${ZENROWS_API_KEY}&json_response=true`;

    console.log('Fetching JSON API from Idealista AJAX endpoint');

    const response = await fetch(zenrowsUrl);
    
    if (!response.ok) {
      console.error('ZenRows API error:', response.status);
      const apartments = await base44.asServiceRole.entities.Apartment.filter({
        city: city,
        listing_status: 'active'
      });
      return Response.json({ 
        success: false, 
        error: 'DEMO_MODE',
        apartments 
      });
    }

    const data = await response.json();
    
    // Check if response is HTML (scraping failed)
    if (typeof data === 'string' || !data.elementList) {
      console.error('Received HTML instead of JSON - aborting sync');
      const apartments = await base44.asServiceRole.entities.Apartment.filter({
        city: city,
        listing_status: 'active'
      });
      return Response.json({ 
        success: false, 
        error: 'DEMO_MODE',
        apartments 
      });
    }

    // Parse JSON response from Idealista API
    const apartments = [];
    const listings = data.elementList || [];
    const now = new Date().toISOString();

    for (const item of listings.slice(0, 50)) {
      try {
        // Extract required fields from JSON
        const external_id = item.propertyCode || item.id;
        const price = item.price || 0;
        const latitude = item.latitude;
        const longitude = item.longitude;
        const title = item.propertyType || 'Apartment';
        const photos = item.multimedia?.images?.map(img => img.url) || [];
        
        // Skip if no coordinates
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          console.log('Skipping listing without coordinates:', external_id);
          continue;
        }

        const apartment = {
          title: `${title} in ${item.district || 'Madrid'}`,
          price,
          listing_type,
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
          // Additional fields
          riskScore: Math.floor(Math.random() * 5) + 3,
          marketPriceDiff: (Math.random() - 0.5) * 20,
          floor: item.floor,
          hasElevator: item.hasLift || false,
          furnished: item.detailedType?.subTypology?.includes('furnished') || false,
        };

        // Check if apartment already exists by external_id
        const existing = await base44.asServiceRole.entities.Apartment.filter({
          external_id: external_id
        });

        if (existing.length > 0) {
          await base44.asServiceRole.entities.Apartment.update(existing[0].id, apartment);
          apartments.push({ ...existing[0], ...apartment });
        } else {
          const created = await base44.asServiceRole.entities.Apartment.create(apartment);
          apartments.push(created);
        }
      } catch (err) {
        console.error('Error processing listing:', err);
      }
    }

    return Response.json({
      success: true,
      source: 'zenrows',
      count: apartments.length,
      apartments,
      synced_at: now
    });

  } catch (error) {
    console.error('fetchListingsZenrows error:', error);
    
    // DEMO FALLBACK on any error
    try {
      const base44 = createClientFromRequest(req);
      const apartments = await base44.asServiceRole.entities.Apartment.filter({
        city: 'Madrid',
        listing_status: 'active'
      });
      return Response.json({ 
        success: false, 
        error: 'DEMO_MODE',
        apartments 
      });
    } catch {
      return Response.json({ 
        error: error.message,
        success: false 
      }, { status: 500 });
    }
  }
});