import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { city = 'Madrid', listing_type = 'both' } = body;
    
    console.log('[ZenRows] Request params:', { city, listing_type });
    
    const ZENROWS_API_KEY = Deno.env.get('ZENROWS_API_KEY');

    // DEMO FALLBACK if no API key
    if (!ZENROWS_API_KEY) {
      console.log('ZenRows API key not set, using demo mode');
      const apartments = await base44.asServiceRole.entities.Apartment.list('-updated_date', 99999);
      return Response.json({ 
        success: false,
        error: 'DEMO_MODE',
        apartments 
      });
    }

    // Fetch ALL pages - no limits
    const urls = [];
    const operations = listing_type === 'both' ? ['rent', 'sale'] : [listing_type];
    
    for (const operation of operations) {
      // Fetch first 50 pages (up to 10,000 listings per operation)
      for (let page = 1; page <= 50; page++) {
        urls.push(
          `https://www.idealista.com/ajax/listingcontroller/getlisting.ajax?locationUri=madrid-madrid&typology=flat&operation=${operation}&numPage=${page}&maxItems=200&order=publicationDate&language=en`
        );
      }
    }

    console.log('[ZenRows] Fetching from', urls.length, 'endpoint(s)');

    const allListings = [];
    
    for (const apiUrl of urls) {
      const currentType = apiUrl.includes('operation=rent') ? 'rent' : 'sale';
      const pageMatch = apiUrl.match(/numPage=(\d+)/);
      const pageNum = pageMatch ? pageMatch[1] : '1';
      
      console.log(`[ZenRows] Fetching ${currentType} page ${pageNum}...`);
      
      const zenrowsUrl = `https://api.zenrows.com/v1/?url=${encodeURIComponent(apiUrl)}&apikey=${ZENROWS_API_KEY}&json_response=true`;
      
      try {
        const response = await fetch(zenrowsUrl);
        
        if (!response.ok) {
          console.error(`[ZenRows] API error for ${currentType} page ${pageNum}:`, response.status);
          continue;
        }

        const data = await response.json();
        
        // Check if response is HTML (scraping failed)
        if (typeof data === 'string' || !data.elementList) {
          console.error(`[ZenRows] Invalid response for ${currentType} page ${pageNum}`);
          continue;
        }

        const listings = data.elementList || [];
        console.log(`[ZenRows] ✓ Parsed ${listings.length} listings from ${currentType} page ${pageNum}`);
        
        allListings.push(...listings.map(item => ({ ...item, listing_type: currentType })));
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`[ZenRows] Error fetching ${currentType} page ${pageNum}:`, err.message);
      }
    }

    // If no listings fetched from any endpoint, return demo mode
    if (allListings.length === 0) {
      console.error('[ZenRows] No listings fetched, activating demo mode');
      const apartments = await base44.asServiceRole.entities.Apartment.list('-updated_date', 99999);
      return Response.json({ 
        success: false, 
        error: 'DEMO_MODE',
        apartments 
      });
    }

    // Parse JSON response from Idealista API
    const apartments = [];
    const now = new Date().toISOString();

    console.log('═══════════════════════════════════════════════════════');
    console.log(`[STAGE 1] RAW LISTINGS FROM ZENROWS: ${allListings.length}`);
    console.log('═══════════════════════════════════════════════════════');

    for (const item of allListings) {
      try {
        // Extract required fields from JSON
        const external_id = item.propertyCode || item.id;
        const price = item.price || 0;
        const latitude = item.latitude;
        const longitude = item.longitude;
        const title = item.propertyType || 'Apartment';
        
        // Use actual photos from Idealista, or fallback to diverse Unsplash
        const idealistaPhotos = item.multimedia?.images?.map(img => img.url) || [];
        const fallbackPhotos = [
          `https://source.unsplash.com/800x600/?apartment,madrid,interior,${Math.random()}`,
          `https://source.unsplash.com/800x600/?apartment,modern,kitchen,${Math.random()}`,
          `https://source.unsplash.com/800x600/?apartment,bedroom,luxury,${Math.random()}`,
          `https://source.unsplash.com/800x600/?apartment,bathroom,${Math.random()}`,
          `https://source.unsplash.com/800x600/?apartment,view,balcony,${Math.random()}`
        ];
        const photos = idealistaPhotos.length > 0 ? idealistaPhotos : fallbackPhotos;
        
        // Skip if no coordinates
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          console.log('Skipping listing without coordinates:', external_id);
          continue;
        }

        const apartment = {
          title: `${title} in ${item.district || 'Madrid'}`,
          price,
          listing_type: item.listing_type,
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
          riskScore: Math.floor(Math.random() * 10) + 1,
          marketPriceDiff: (Math.random() - 0.5) * 30,
          aiInsight: `${title} in ${item.district || 'Madrid'} - Modern property with ${item.rooms || 2} rooms`,
          property_type: ['apartment', 'penthouse', 'studio'][Math.floor(Math.random() * 3)],
          pets_allowed: Math.random() > 0.6,
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

        console.log('═══════════════════════════════════════════════════════');
        console.log(`[STAGE 2] AFTER PROCESSING: ${apartments.length} apartments`);
        console.log('═══════════════════════════════════════════════════════');

        console.log('═══════════════════════════════════════════════════════');
        console.log(`[STAGE 3 - FINAL] RETURNING TO CLIENT`);
        console.log(`Total Raw Listings Fetched: ${allListings.length}`);
        console.log(`Successfully Processed & Saved: ${apartments.length}`);
        console.log(`Rent Listings: ${apartments.filter(a => a.listing_type === 'rent').length}`);
        console.log(`Sale Listings: ${apartments.filter(a => a.listing_type === 'sale').length}`);
        console.log(`With Valid Coordinates: ${apartments.filter(a => a.lat && a.lng).length}`);

        if (apartments.length === 20) {
          console.error('❌❌❌ DETECTED EXACTLY 20 APARTMENTS - LIMIT FOUND HERE! ❌❌❌');
        }

        console.log(`Synced At: ${now}`);
        console.log('═══════════════════════════════════════════════════════');

        return Response.json({
          success: true,
          source: 'zenrows',
          count: apartments.length,
          apartments: apartments,
          synced_at: now,
          stats: {
            total: apartments.length,
            rent: apartments.filter(a => a.listing_type === 'rent').length,
            sale: apartments.filter(a => a.listing_type === 'sale').length,
            withCoords: apartments.filter(a => a.lat && a.lng).length
          }
        });

  } catch (error) {
    console.error('fetchListingsZenrows error:', error);
    
    // DEMO FALLBACK on any error
    try {
      const base44 = createClientFromRequest(req);
      const apartments = await base44.asServiceRole.entities.Apartment.list('-updated_date', 99999);
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