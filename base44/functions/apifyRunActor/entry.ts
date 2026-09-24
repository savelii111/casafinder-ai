Deno.serve(async (req) => {
  try {
    const { actorId = 'trudax/fotocasa-scraper', city = 'madrid', listing_type = 'sale', maxResults = 100 } = await req.json();
    
    const APIFY_TOKEN = Deno.env.get('APIFY_API_TOKEN');
    if (!APIFY_TOKEN) {
      return Response.json({ error: 'APIFY_API_TOKEN not set' }, { status: 500 });
    }

    console.log(`[APIFY] Starting actor: ${actorId}, city=${city}, type=${listing_type}`);

    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: city,
        propertyType: listing_type === 'sale' ? 'buy' : 'rent',
        maxItems: maxResults
      })
    });

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    const run = await response.json();
    console.log(`[APIFY] Run started: ${run.data.id}, dataset: ${run.data.defaultDatasetId}`);

    return Response.json({
      success: true,
      runId: run.data.id,
      datasetId: run.data.defaultDatasetId,
      status: run.data.status
    });

  } catch (error) {
    console.error('[APIFY] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});