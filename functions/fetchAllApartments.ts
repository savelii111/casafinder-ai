import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔵 [BACKEND FETCH] Fetching ALL apartments via service role');
    console.log('═══════════════════════════════════════════════════════');
    
    const startTime = Date.now();
    
    // Use service role to bypass frontend SDK limits
    const apartments = await base44.asServiceRole.entities.Apartment.list('-updated_date', 99999);
    
    const duration = Date.now() - startTime;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ [BACKEND FETCH] Complete`);
    console.log(`   Total apartments: ${apartments.length}`);
    console.log(`   Duration: ${duration}ms`);
    console.log('═══════════════════════════════════════════════════════');
    
    // CRITICAL VALIDATION
    if (apartments.length === 20) {
      console.error('🚨🚨🚨 BACKEND STILL LIMITED TO 20 🚨🚨🚨');
    } else if (apartments.length > 20) {
      console.log('✅✅✅ SUCCESS: Backend bypassed 20-item limit ✅✅✅');
    }
    
    return Response.json({
      success: true,
      apartments,
      count: apartments.length,
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