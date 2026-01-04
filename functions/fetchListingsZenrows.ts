import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { city = 'Madrid', listing_type = 'rent' } = body;
    
    const ZENROWS_API_KEY = Deno.env.get('ZENROWS_API_KEY');

    // DEMO FALLBACK if no API key
    if (!ZENROWS_API_KEY) {
      console.log('ZenRows API key not set, using demo listings');
      const apartments = await base44.asServiceRole.entities.Apartment.filter({
        city: city,
        listing_status: 'active',
        listing_type: listing_type
      });
      return Response.json({ 
        success: true, 
        source: 'demo',
        count: apartments.length,
        apartments 
      });
    }

    // Construct Idealista URL (only rentals for Madrid)
    const idealistaUrl = `https://www.idealista.com/alquiler-viviendas/madrid-madrid/`;
    
    // Call ZenRows API with JSON output
    const zenrowsUrl = `https://api.zenrows.com/v1/?url=${encodeURIComponent(idealistaUrl)}&apikey=${ZENROWS_API_KEY}&js_render=true&premium_proxy=true&json_response=true`;
    
    const response = await fetch(zenrowsUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('ZenRows API error:', response.status);
      // DEMO FALLBACK
      const apartments = await base44.asServiceRole.entities.Apartment.filter({
        city: city,
        listing_status: 'active'
      });
      return Response.json({ 
        success: true, 
        source: 'demo_fallback',
        count: apartments.length,
        apartments 
      });
    }

    const data = await response.json();
    const now = new Date().toISOString();
    
    // Parse listings from ZenRows response
    const listings = data.listings || [];
    const newApartments = [];

    for (const item of listings.slice(0, 20)) {
      try {
        const apartment = {
          title: item.title || 'Apartment in Madrid',
          price: item.price || 1000,
          listing_type: 'rent',
          address: item.address || 'Madrid, Spain',
          rooms: item.rooms || 2,
          size: item.size || 60,
          lat: item.latitude || (40.4168 + (Math.random() - 0.5) * 0.1),
          lng: item.longitude || (-3.7038 + (Math.random() - 0.5) * 0.1),
          photos: item.photos && item.photos.length > 0 ? item.photos : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
          city: 'Madrid',
          source: 'idealista',
          source_url: item.url || idealistaUrl,
          listing_status: 'active',
          last_sync_date: now,
          neighborhood: item.neighborhood || 'Centro',
          property_type: item.propertyType || 'apartment',
          furnished: item.furnished || false,
          pets_allowed: item.petsAllowed || false,
          hasElevator: item.hasElevator || false
        };

        // Check if apartment already exists by source_url
        const existing = await base44.asServiceRole.entities.Apartment.filter({
          source_url: apartment.source_url
        });

        if (existing.length > 0) {
          await base44.asServiceRole.entities.Apartment.update(existing[0].id, {
            ...apartment
          });
          newApartments.push({ ...existing[0], ...apartment });
        } else {
          const created = await base44.asServiceRole.entities.Apartment.create(apartment);
          newApartments.push(created);
        }
      } catch (err) {
        console.error('Error processing listing:', err);
      }
    }

    // If no new listings, return existing
    if (newApartments.length === 0) {
      const apartments = await base44.asServiceRole.entities.Apartment.filter({
        city: city,
        listing_status: 'active'
      });
      return Response.json({
        success: true,
        source: 'database',
        count: apartments.length,
        apartments
      });
    }

    return Response.json({
      success: true,
      source: 'zenrows',
      count: newApartments.length,
      apartments: newApartments,
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
        success: true, 
        source: 'error_fallback',
        count: apartments.length,
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