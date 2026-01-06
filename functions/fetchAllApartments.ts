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
    
    // Cursor-based pagination - fetch ALL records
    while (hasMore) {
      batchCount++;
      console.log(`📄 [BATCH ${batchCount}] Fetching from cursor ${cursor}, limit ${batchSize}`);
      
      const batch = await base44.asServiceRole.entities.Apartment.list('-updated_date', batchSize, cursor);
      
      console.log(`📄 [BATCH ${batchCount}] Received ${batch.length} apartments`);
      
      if (batch.length === 0) {
        console.log(`✓ [BATCH ${batchCount}] No more data, stopping`);
        hasMore = false;
        break;
      }
      
      allApartments.push(...batch);
      
      // If we got less than batchSize, we've reached the end
      if (batch.length < batchSize) {
        console.log(`✓ [BATCH ${batchCount}] Received ${batch.length} < ${batchSize}, last batch`);
        hasMore = false;
      } else {
        // Move cursor forward
        cursor += batch.length;
        console.log(`→ [BATCH ${batchCount}] Moving cursor to ${cursor}`);
      }
      
      // Safety limit to prevent infinite loops (100k apartments max)
      if (batchCount > 100) {
        console.error('🚨 Safety limit reached - stopping at 100 batches');
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