import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { query, language = 'en', totalCount = 0, sampleApartments = [] } = body;
    
    console.log('🤖 [DEEPSEEK] Input totalCount:', totalCount);
    
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

    if (!DEEPSEEK_API_KEY) {
      console.error('[DeepSeek] API key not set');
      return Response.json({ 
        response: `I found ${totalCount} properties matching your search. All results are displayed on the map and sorted by AI below.`,
        error: 'API_KEY_MISSING'
      });
    }

    // Build context from apartments data
    const apartmentsContext = apartments.map((apt, i) => 
      `${i + 1}. €${apt.price}/mo - ${apt.rooms} rooms, ${apt.size}m² in ${apt.neighborhood}${apt.floor ? `, floor ${apt.floor}` : ''}${apt.hasElevator ? ' (elevator)' : ''}${apt.furnished ? ' (furnished)' : ''}${apt.pets_allowed ? ' (pets OK)' : ''} - Risk Score: ${apt.riskScore || 'N/A'}`
    ).join('\n');

    const systemPrompt = language === 'es' 
      ? `Eres un asistente experto en bienes raíces en España. Ayudas a usuarios a encontrar el apartamento perfecto en Madrid. Sé amigable, útil y conciso. Responde SIEMPRE en español.`
      : language === 'ru'
      ? `Ты эксперт по недвижимости в Испании. Ты помогаешь пользователям найти идеальную квартиру в Мадриде. Будь дружелюбным, полезным и кратким. Отвечай ВСЕГДА на русском языке.`
      : `You are an expert real estate assistant in Spain. You help users find the perfect apartment in Madrid. Be friendly, helpful, and concise. Always respond in English.`;

    const userPrompt = `User query: "${query}"

TOTAL PROPERTIES: ${totalCount}

Sample properties (top 10):
${apartmentsContext}

YOUR TASK:
1. Start: "I found ${totalCount} properties matching your search"
2. Analyze the sample and give helpful insights
3. Remind: "All ${totalCount} are visible on the map and list below"
4. Keep under 150 words

CRITICAL: State exact number ${totalCount}.`;

    console.log('[DeepSeek] Calling API...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DeepSeek] API error:', response.status, errorText);
      return Response.json({ 
        response: `Found ${totalCount} properties in Madrid. Check out the results on the map and sorted list below!`,
        error: 'API_ERROR'
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || `Found ${totalCount} properties. All are shown on the map!`;

    console.log('[DeepSeek] Response generated:', aiResponse.substring(0, 100));

    return Response.json({
      response: aiResponse,
      totalCount,
      model: 'deepseek-chat'
    });

  } catch (error) {
    console.error('[DeepSeek] Error:', error);
    return Response.json({ 
      response: 'Found properties in Madrid. Check the map and list below for all results.',
      error: error.message 
    }, { status: 500 });
  }
});