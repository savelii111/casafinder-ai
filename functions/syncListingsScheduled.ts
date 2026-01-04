import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check admin access
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = {
      rent: { success: false, count: 0, error: null },
      sale: { success: false, count: 0, error: null }
    };

    // Sync rental listings
    try {
      const rentResult = await base44.functions.invoke('fetchListingsZenrows', {
        city: 'Madrid',
        listing_type: 'rent'
      });
      
      if (rentResult.data?.success) {
        results.rent.success = true;
        results.rent.count = rentResult.data.apartments?.length || 0;
      } else {
        results.rent.error = rentResult.data?.error || 'Unknown error';
      }
    } catch (error) {
      results.rent.error = error.message;
    }

    // Sync sale listings
    try {
      const saleResult = await base44.functions.invoke('fetchListingsZenrows', {
        city: 'Madrid',
        listing_type: 'sale'
      });
      
      if (saleResult.data?.success) {
        results.sale.success = true;
        results.sale.count = saleResult.data.apartments?.length || 0;
      } else {
        results.sale.error = saleResult.data?.error || 'Unknown error';
      }
    } catch (error) {
      results.sale.error = error.message;
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('syncListingsScheduled error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});