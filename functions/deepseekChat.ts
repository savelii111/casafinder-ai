import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { query, language = 'en', apartments = [] } = body;
    
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!DEEPSEEK_API_KEY) {
      // Fallback to basic analysis
      return Response.json({
        success: true,
        response: `Found ${apartments.length} properties matching your criteria.`,
        properties_found: apartments.length,
        source: 'fallback'
      });
    }

    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a professional real estate AI assistant. Analyze user queries and provide helpful responses about apartments in Madrid, Spain. Always respond in ${language === 'es' ? 'Spanish' : language === 'ru' ? 'Russian' : 'English'}. Be concise and professional.`
          },
          {
            role: 'user',
            content: `User query: "${query}"\nAvailable apartments: ${apartments.length}\nProvide a helpful response about their search.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!deepseekResponse.ok) {
      console.error('DeepSeek API error:', deepseekResponse.status);
      return Response.json({
        success: true,
        response: `Found ${apartments.length} properties matching your criteria.`,
        properties_found: apartments.length,
        source: 'fallback'
      });
    }

    const data = await deepseekResponse.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Properties found';

    return Response.json({
      success: true,
      response: aiResponse,
      properties_found: apartments.length,
      source: 'deepseek'
    });

  } catch (error) {
    console.error('deepseekChat error:', error);
    
    // Fallback
    const body = await req.json().catch(() => ({}));
    const apartments = body.apartments || [];
    
    return Response.json({
      success: true,
      response: `Found ${apartments.length} properties matching your criteria.`,
      properties_found: apartments.length,
      source: 'error_fallback'
    });
  }
});