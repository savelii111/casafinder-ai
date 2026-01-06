import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { query, language = 'en', totalCount = 0, apartmentsSummary = [] } = body;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🤖 [DEEPSEEK AI] Request received');
    console.log(`   Query: "${query}"`);
    console.log(`   Total apartments to process: ${totalCount}`);
    console.log(`   Summary entries received: ${apartmentsSummary.length}`);
    console.log(`   Language: ${language}`);
    console.log('═══════════════════════════════════════════════════════');
    
    // CRITICAL VALIDATION
    if (totalCount === 20) {
      console.error('🚨 DEEPSEEK: Received EXACTLY 20 apartments - upstream truncation!');
    } else if (totalCount === 0) {
      console.error('🚨 DEEPSEEK: No apartments provided!');
    } else {
      console.log(`✅ DEEPSEEK: Processing full dataset (${totalCount} apartments)`);
    }
    
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

    if (!DEEPSEEK_API_KEY) {
      console.error('[DeepSeek] API key not set');
      return Response.json({ 
        response: `I found ${totalCount} properties matching your search. All results are displayed on the map and sorted by AI below.`,
        error: 'API_KEY_MISSING'
      });
    }

    // Build context from the FULL apartments summary (no slicing)
    const apartmentsContext = apartmentsSummary.length > 0 
      ? apartmentsSummary.map((apt, i) => 
          `${i + 1}. €${apt.price}${apt.listing_type === 'rent' ? '/mo' : ''} - ${apt.rooms} rooms, ${apt.size}m² in ${apt.neighborhood || apt.city || 'Madrid'} (risk ${apt.riskScore ?? 'n/a'})`
        ).join('\n')
      : 'No apartments summary provided';

    const systemPrompt = language === 'es' 
      ? `Eres un asistente experto en bienes raíces en España. Ayudas a usuarios a encontrar el apartamento perfecto en Madrid. Sé amigable, útil y conciso. Responde SIEMPRE en español.`
      : language === 'ru'
      ? `Ты эксперт по недвижимости в Испании. Ты помогаешь пользователям найти идеальную квартиру в Мадриде. Будь дружелюбным, полезным и кратким. Отвечай ВСЕГДА на русском языке.`
      : `You are an expert real estate assistant in Spain. You help users find the perfect apartment in Madrid. Be friendly, helpful, and concise. Always respond in English.`;

    const userPrompt = `User query: "${query}"

    🔢 TOTAL PROPERTIES MATCHING: ${totalCount}

    ALL PROPERTIES SUMMARY (no truncation):
    ${apartmentsContext}

    YOUR TASK:
    - Start with EXACT count: "I found exactly ${totalCount} properties"
    - Provide concise insights (price ranges, neighborhoods, mix of rent/sale, notable risk patterns)
    - Confirm: "All ${totalCount} properties are shown on the map and list below; browse them all."
    - Keep under 150 words, natural and agent-like (no lists of 1000 items).

    STRICT REQUIREMENTS:
    - Do NOT mention "top N" / "best X" / "some". Use the full count.
    - Do NOT imply truncation. Emphasize that ALL ${totalCount} are visible.
    - Be helpful and realistic.`;

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

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ [DEEPSEEK AI] Response generated');
    console.log(`   Response length: ${aiResponse.length} chars`);
    console.log(`   Mentioned count: ${totalCount}`);
    console.log(`   Preview: ${aiResponse.substring(0, 100)}...`);
    console.log('═══════════════════════════════════════════════════════');

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