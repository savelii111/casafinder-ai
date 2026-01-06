import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔵 [BACKEND FETCH] Starting pagination loop');
    console.log('═══════════════════════════════════════════════════════');
    
    const startTime = Date.now();
    const allApartments = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    // Paginated fetch loop - bypass ANY limit
    while (hasMore) {
      console.log(`📄 [PAGE ${page + 1}] Fetching batch (skip: ${page * pageSize}, limit: ${pageSize})`);
      
      const batch = await base44.asServiceRole.entities.Apartment.list('-updated_date', pageSize, page * pageSize);
      
      console.log(`📄 [PAGE ${page + 1}] Received ${batch.length} items`);
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }
      
      allApartments.push(...batch);
      
      // If we got less than pageSize, we've reached the end
      if (batch.length < pageSize) {
        hasMore = false;
      }
      
      page++;
      
      // Safety limit to prevent infinite loops
      if (page > 100) {
        console.error('🚨 Safety limit reached - stopping at 100 pages');
        break;
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ [BACKEND FETCH] Complete`);
    console.log(`   Total pages fetched: ${page}`);
    console.log(`   Total apartments: ${allApartments.length}`);
    console.log(`   Duration: ${duration}ms`);
    console.log('═══════════════════════════════════════════════════════');
    
    // CRITICAL VALIDATION
    if (allApartments.length === 20) {
      console.error('🚨🚨🚨 STILL EXACTLY 20 - PAGINATION FAILED 🚨🚨🚨');
    } else if (allApartments.length > 20) {
      console.log('✅✅✅ SUCCESS: Loaded ' + allApartments.length + ' apartments ✅✅✅');
    }
    
    return Response.json({
      success: true,
      apartments: allApartments,
      count: allApartments.length,
      pages: page,
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