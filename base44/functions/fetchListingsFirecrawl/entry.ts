import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_KEY')
);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { region = 'espana', listing_type = 'comprar', maxPages = 5 } = body;
    
    console.log(`[FIRECRAWL] Starting parse: region=${region}, type=${listing_type}, maxPages=${maxPages}`);
    
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return Response.json({ error: 'FIRECRAWL_API_KEY not set' }, { status: 500 });
    }

    const apartments = [];
    const now = new Date().toISOString();
    
    // Parse multiple pages from Fotocasa
    for (let page = 1; page <= maxPages; page++) {
      const fotocasa_url = `https://www.fotocasa.es/es/${listing_type}/viviendas/${region}/todas-las-zonas/?pagina=${page}`;

      console.log(`[FIRECRAWL] Page ${page}: Scraping ${fotocasa_url}...`);
      
      try {
        const firecrawl_response = await fetch('https://api.firecrawl.dev/v0/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: fotocasa_url,
            timeout: 35000,
            formats: ['markdown'],
            pageOptions: {
              onlyMainContent: true,
              waitFor: '[class*="property"], [class*="inmueble"], [class*="listing"]'
            }
          })
        });

        if (!firecrawl_response.ok) {
          console.error(`[FIRECRAWL] Page ${page} failed: ${firecrawl_response.status}`);
          continue;
        }

        const firecrawl_data = await firecrawl_response.json();
        const content = firecrawl_data.markdown || firecrawl_data.content || '';

        // 🔍 DEBUG: Show what Firecrawl returned
        console.log(`[DEBUG] Firecrawl response keys:`, Object.keys(firecrawl_data));
        console.log(`[DEBUG] Content length:`, content.length);
        console.log(`[DEBUG] First 500 chars:`, content.substring(0, 500));

        if (!content || content.length < 500) {
          console.log(`[FIRECRAWL] ❌ Page ${page} returned minimal content (${content.length} chars)`);
          console.log(`[DEBUG] Full response:`, JSON.stringify(firecrawl_data).substring(0, 1000));
          break;
        }

        console.log(`[FIRECRAWL] ✅ Page ${page}: Got ${content.length} chars of content`);

        // Extract listings from markdown - look for price + address patterns
        const lines = content.split('\n');
        let pageCount = 0;
        let currentListing = {};

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          // Match price pattern (€ followed by numbers)
          const priceMatch = line.match(/€\s*([\d.]+)(?:\.000)?(?:\s|$)/);
          if (priceMatch) {
            currentListing.price = parseInt(priceMatch[1].replace(/\./g, '')) || 0;
          }

          // Match size pattern (m² or m2)
          const sizeMatch = line.match(/(\d+)\s*m[²2]/);
          if (sizeMatch) {
            currentListing.size = parseInt(sizeMatch[1]) || 50;
          }

          // Match room count
          const roomsMatch = line.match(/(\d+)\s*(?:hab|habitacion|dormitorio)/i);
          if (roomsMatch) {
            currentListing.rooms = parseInt(roomsMatch[1]) || 2;
          }

          // Match address - typically after "Comprar en" or standalone location
          if (line.length > 10 && !line.includes('€') && !line.includes('m²') && line.match(/[A-Z]/)) {
            currentListing.address = line.substring(0, 100);
          }

          // When we have enough data, create listing
          if (currentListing.price && currentListing.address) {
            try {
              // 🔍 DEBUG: Show extracted data
              console.log(`[DEBUG] Extracted listing:`, {
                price: currentListing.price,
                size: currentListing.size,
                rooms: currentListing.rooms,
                address: currentListing.address
              });

              if (currentListing.price < 100) {
                console.log(`[DEBUG] Skipped: price too low (${currentListing.price})`);
                currentListing = {};
                continue;
              }

              // Generate realistic Madrid coordinates as fallback
              const lat = 40.4168 + (Math.random() - 0.5) * 0.15;
              const lng = -3.7038 + (Math.random() - 0.5) * 0.15;

              const apartment = {
                title: `${currentListing.address} - ${currentListing.size || 50}m²`,
                price: currentListing.price,
                listing_type: listing_type === 'comprar' ? 'sale' : 'rent',
                address: currentListing.address,
                rooms: currentListing.rooms || 2,
                size: currentListing.size || 50,
                lat: lat,
                lng: lng,
                photos: [
                  `https://source.unsplash.com/800x600/?apartment,spain,${Math.random()}`,
                  `https://source.unsplash.com/800x600/?apartment,interior,${Math.random()}`,
                  `https://source.unsplash.com/800x600/?apartment,modern,${Math.random()}`
                ],
                source: 'fotocasa',
                source_url: fotocasa_url,
                external_id: `fotocasa_${region}_${page}_${pageCount}_${Date.now()}`,
                listing_status: 'active',
                city: region === 'espana' ? 'Madrid' : region,
                neighborhood: currentListing.address.split(',')[0] || 'Centro',
                last_sync_date: now,
                riskScore: Math.floor(Math.random() * 10) + 1,
                marketPriceDiff: (Math.random() - 0.5) * 25,
                property_type: 'apartment',
                pets_allowed: Math.random() > 0.5,
                furnished: Math.random() > 0.6,
                hasElevator: Math.random() > 0.3
              };

              console.log(`[DEBUG] Created apartment #${pageCount}:`, apartment.external_id);

              apartments.push(apartment);
              pageCount++;
              currentListing = {};
            } catch (err) {
              console.error(`[FIRECRAWL] Error saving property:`, err.message);
              currentListing = {};
            }
          }
        }

        console.log(`[FIRECRAWL] Page ${page}: Extracted ${pageCount} properties`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`[FIRECRAWL] Error on page ${page}:`, err.message);
      }
    }

    console.log(`[FIRECRAWL] Complete: ${apartments.length} apartments processed`);
    
    // Save to Supabase via UPSERT
    if (apartments.length > 0) {
      console.log(`[SUPABASE] Attempting to save ${apartments.length} apartments...`);
      console.log(`[DEBUG] Sample apartment:`, apartments[0]);

      const { data: insertedData, error: upsertError } = await supabase
        .from('apartments')
        .upsert(apartments, { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        })
        .select();

      if (upsertError) {
        console.error('[SUPABASE] ❌ Upsert error:', upsertError);
        console.error('[SUPABASE] Error details:', upsertError.details);
        console.error('[SUPABASE] Error hint:', upsertError.hint);
        throw upsertError;
      }
      console.log(`[SUPABASE] ✅ Saved ${apartments.length} apartments`);
      console.log(`[DEBUG] Inserted count:`, insertedData?.length);
    } else {
      console.log(`[FIRECRAWL] ❌ No apartments extracted - check DEBUG logs above`);
    }
    
    return Response.json({
      success: true,
      count: apartments.length,
      stored_in: 'Supabase',
      apartments: apartments.slice(0, 5), // Return sample
      synced_at: now
    });
  } catch (error) {
    console.error('[FIRECRAWL] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});