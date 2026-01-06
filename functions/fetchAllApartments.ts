import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔵 [BACKEND FETCH] Starting cursor-based pagination');
    console.log('═══════════════════════════════════════════════════════');
    
    const startTime = Date.now();
    const allApartments = [];
    let cursor = 0;
    const batchSize = 1000;
    let batchCount = 0;
    let hasMore = true;
    
    // CRITICAL FIX: Use filter() with pagination instead of list()
    // list() has hard 20-item limit, filter() allows proper pagination
    while (hasMore) {
      batchCount++;
      console.log(`📄 [BATCH ${batchCount}] Fetching with skip=${cursor}, limit=${batchSize}`);
      
      // Use filter({}) to get ALL apartments with pagination support
      const batch = await base44.asServiceRole.entities.Apartment.filter(
        {}, // empty filter = all records
        '-updated_date', 
        batchSize,
        cursor
      );
      
      console.log(`📄 [BATCH ${batchCount}] Received ${batch.length} apartments`);
      console.log(`   First ID: ${batch[0]?.id || 'N/A'}, Last ID: ${batch[batch.length-1]?.id || 'N/A'}`);
      
      if (batch.length === 0) {
        console.log(`✓ [BATCH ${batchCount}] No more data, stopping`);
        hasMore = false;
        break;
      }
      
      allApartments.push(...batch);
      
      // CRITICAL: Check if this is the last batch
      if (batch.length < batchSize) {
        console.log(`✓ [BATCH ${batchCount}] Last batch (${batch.length} < ${batchSize})`);
        hasMore = false;
      } else {
        // Move cursor forward by batch size
        cursor += batch.length;
        console.log(`→ [BATCH ${batchCount}] Cursor moved to ${cursor}, continuing...`);
      }
      
      // Safety limit to prevent infinite loops (100k apartments max)
      if (batchCount > 100) {
        console.error('🚨 Safety limit reached - stopping at 100 batches');
        break;
      }
      
      // CRITICAL: If we got exactly 20 in first batch, something is wrong
      if (batchCount === 1 && batch.length === 20 && batch.length === batchSize) {
        console.error('🚨 WARNING: First batch is exactly 20 - SDK may be limiting us!');
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