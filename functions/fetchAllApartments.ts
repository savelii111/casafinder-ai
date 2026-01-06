import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔵 [BACKEND FETCH] Starting FULL pagination (bypass 20 limit)');
    console.log('═══════════════════════════════════════════════════════');
    
    const startTime = Date.now();
    const allApartments = [];
    let batchCount = 0;

    // Always fetch in micro-batches of 20 to bypass any hidden limits
    for (let i = 0; i < 5000; i++) { // up to 100,000 records (5000 * 20)
      batchCount++;
      const skip = i * 20;
      console.log(`📄 [MICRO-BATCH ${batchCount}] Fetching skip=${skip}, limit=20`);

      const batch = await base44.asServiceRole.entities.Apartment.filter(
        {},
        '-updated_date',
        20,
        skip
      );

      console.log(`📄 [MICRO-BATCH ${batchCount}] Received ${batch.length}`);

      if (batch.length === 0) {
        console.log(`✓ [MICRO-BATCH ${batchCount}] Empty, stopping`);
        break;
      }

      // Aggregate unique
      batch.forEach(apt => {
        if (!allApartments.find(a => a.id === apt.id)) {
          allApartments.push(apt);
        }
      });

      if (batch.length < 20) {
        console.log(`✓ [MICRO-BATCH ${batchCount}] Last batch (<20)`);
        break;
      }

      if (batchCount % 50 === 0) {
        console.log(`→ Progress: ${allApartments.length} unique apartments so far`);
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