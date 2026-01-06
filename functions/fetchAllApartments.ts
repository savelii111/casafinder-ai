import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔵 [BACKEND FETCH] Starting FULL pagination (bypass 20 limit)');
    console.log('═══════════════════════════════════════════════════════');
    
    const startTime = Date.now();
    const allApartments = [];
    let skip = 0;
    let batchCount = 0;
    let hasMore = true;
    
    // CRITICAL: Base44 SDK might limit filter() to 20 items by default
    // Solution: Keep fetching with increasing skip until we get 0 results
    while (hasMore) {
      batchCount++;
      console.log(`📄 [BATCH ${batchCount}] Fetching skip=${skip}, limit=1000`);
      
      // Fetch batch - if SDK limits to 20, we'll detect it
      const batch = await base44.asServiceRole.entities.Apartment.filter(
        {}, 
        '-updated_date', 
        1000,
        skip
      );
      
      console.log(`📄 [BATCH ${batchCount}] Received ${batch.length} apartments`);
      
      if (batch.length === 0) {
        console.log(`✓ [BATCH ${batchCount}] Empty batch, stopping`);
        break;
      }
      
      // CRITICAL CHECK: If first batch is exactly 20, SDK is limiting us
      if (batchCount === 1 && batch.length === 20) {
        console.error('🚨🚨🚨 SDK RETURNED EXACTLY 20 - TRYING WORKAROUND 🚨🚨🚨');
        
        // Workaround: Fetch multiple times with skip increments of 20
        for (let i = 0; i < 500; i++) { // Max 10,000 apartments (500 * 20)
          const microBatch = await base44.asServiceRole.entities.Apartment.filter(
            {},
            '-updated_date',
            1000,
            i * 20
          );
          
          if (microBatch.length === 0) {
            console.log(`✓ Micro-fetch complete at iteration ${i}`);
            break;
          }
          
          // Add only unique apartments
          microBatch.forEach(apt => {
            if (!allApartments.find(a => a.id === apt.id)) {
              allApartments.push(apt);
            }
          });
          
          if (microBatch.length < 20) {
            console.log(`✓ Last micro-batch had ${microBatch.length} items`);
            break;
          }
          
          if (i % 10 === 0) {
            console.log(`→ Micro-fetch progress: ${allApartments.length} unique apartments`);
          }
        }
        
        hasMore = false;
        break;
      }
      
      // Normal pagination
      allApartments.push(...batch);
      
      if (batch.length < 1000) {
        console.log(`✓ [BATCH ${batchCount}] Last batch`);
        hasMore = false;
      } else {
        skip += batch.length;
        console.log(`→ [BATCH ${batchCount}] Moving skip to ${skip}`);
      }
      
      if (batchCount > 100) {
        console.error('🚨 Safety limit: 100 batches');
        break;
      }
    }
    
    const duration = Date.now() - startTime;
    const withCoords = allApartments.filter(a => a.lat && a.lng).length;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ [BACKEND FETCH] Complete`);
    console.log(`   Method: Cursor-based pagination`);
    console.log(`   Batches fetched: ${batchCount}`);
    console.log(`   Total apartments: ${allApartments.length}`);
    console.log(`   With coordinates: ${withCoords}`);
    console.log(`   Duration: ${duration}ms`);
    console.log('═══════════════════════════════════════════════════════');
    
    // CRITICAL VALIDATION
    if (allApartments.length === 20) {
      console.error('🚨🚨🚨 FAILURE: STILL EXACTLY 20 - PAGINATION NOT WORKING 🚨🚨🚨');
    } else if (allApartments.length > 20) {
      console.log(`✅✅✅ SUCCESS: Bypassed 20-item limit (${allApartments.length} total) ✅✅✅`);
    } else if (allApartments.length > 0) {
      console.log(`⚠️ WARNING: Database has only ${allApartments.length} apartments`);
    } else {
      console.error('🚨 ERROR: No apartments found in database');
    }
    
    return Response.json({
      success: true,
      apartments: allApartments,
      count: allApartments.length,
      batches: batchCount,
      duration,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[BACKEND FETCH] Error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});