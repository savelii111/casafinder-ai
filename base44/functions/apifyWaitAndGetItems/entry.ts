Deno.serve(async (req) => {
  try {
    const { runId, datasetId, maxWaitSeconds = 300 } = await req.json();
    
    const APIFY_TOKEN = Deno.env.get('APIFY_API_TOKEN');
    if (!APIFY_TOKEN) {
      return Response.json({ error: 'APIFY_API_TOKEN not set' }, { status: 500 });
    }

    console.log(`[APIFY] Waiting for run: ${runId}`);

    // Poll run status
    const startTime = Date.now();
    let status = 'RUNNING';
    
    while (status === 'RUNNING' && (Date.now() - startTime) < maxWaitSeconds * 1000) {
      const runResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
      const runData = await runResponse.json();
      status = runData.data.status;
      
      console.log(`[APIFY] Status: ${status}`);
      
      if (status === 'RUNNING') {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s
      }
    }

    if (status !== 'SUCCEEDED') {
      return Response.json({ 
        error: `Run failed with status: ${status}`,
        status: status 
      }, { status: 500 });
    }

    // Get dataset items
    console.log(`[APIFY] Fetching items from dataset: ${datasetId}`);
    const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json&token=${APIFY_TOKEN}`);
    const items = await itemsResponse.json();

    console.log(`[APIFY] Got ${items.length} items`);

    return Response.json({
      success: true,
      count: items.length,
      items: items
    });

  } catch (error) {
    console.error('[APIFY] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});