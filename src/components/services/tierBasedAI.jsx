import { getDeepSeekResponse } from './integrations';

// Tier-based AI response system
export async function getTierBasedAIResponse(prompt, apartment, userPlan = 'free', language = 'en') {
  const planFeatures = {
    free: {
      useMock: true,
      includeNeighborhood: false,
      includePredictions: false,
      includeComparisons: false,
      includePortfolio: false
    },
    pro1: {
      useMock: false,
      includeNeighborhood: true,
      includePredictions: false,
      includeComparisons: false,
      includePortfolio: false
    },
    pro2: {
      useMock: false,
      includeNeighborhood: true,
      includePredictions: true,
      includeComparisons: true,
      includePortfolio: false
    },
    ultimate: {
      useMock: false,
      includeNeighborhood: true,
      includePredictions: true,
      includeComparisons: true,
      includePortfolio: true
    }
  };

  const features = planFeatures[userPlan] || planFeatures.free;

  if (features.useMock) {
    return getMockAIResponse(prompt, apartment, language);
  }

  // Build enhanced prompt based on tier
  let enhancedPrompt = `${prompt}\n\nProperty Details:\n`;
  enhancedPrompt += `- Address: ${apartment.address}\n`;
  enhancedPrompt += `- Price: €${apartment.price}/month\n`;
  enhancedPrompt += `- Rooms: ${apartment.rooms}\n`;
  enhancedPrompt += `- Size: ${apartment.size}m²\n`;

  if (features.includeNeighborhood) {
    enhancedPrompt += `\nProvide neighborhood analysis including safety, transport, and amenities.`;
  }

  if (features.includePredictions) {
    enhancedPrompt += `\nInclude price predictions and market trends.`;
  }

  if (features.includeComparisons) {
    enhancedPrompt += `\nCompare with similar properties in the area.`;
  }

  if (features.includePortfolio) {
    enhancedPrompt += `\nProvide portfolio recommendations and investment insights.`;
  }

  enhancedPrompt += `\n\nRespond in ${language === 'es' ? 'Spanish' : language === 'ru' ? 'Russian' : 'English'}.`;

  return getDeepSeekResponse(enhancedPrompt, { language });
}

function getMockAIResponse(prompt, apartment, language) {
  const responses = {
    en: {
      general: `This property at ${apartment.address} is priced at €${apartment.price}/month. Based on our analysis, it's a ${apartment.riskScore <= 5 ? 'safe' : 'moderate risk'} property. Upgrade to Pro 1 for detailed neighborhood analysis and live property data.`,
      neighborhood: 'Upgrade to Pro 1 for neighborhood analysis.',
      prediction: 'Upgrade to Pro 2 for price predictions.',
      comparison: 'Upgrade to Pro 2 for property comparisons.'
    },
    es: {
      general: `Esta propiedad en ${apartment.address} tiene un precio de €${apartment.price}/mes. Según nuestro análisis, es una propiedad de ${apartment.riskScore <= 5 ? 'bajo' : 'moderado'} riesgo. Actualice a Pro 1 para análisis detallado del barrio y datos en vivo.`,
      neighborhood: 'Actualice a Pro 1 para análisis del barrio.',
      prediction: 'Actualice a Pro 2 para predicciones de precios.',
      comparison: 'Actualice a Pro 2 para comparaciones de propiedades.'
    },
    ru: {
      general: `Эта недвижимость по адресу ${apartment.address} стоит €${apartment.price}/мес. По нашему анализу, это объект с ${apartment.riskScore <= 5 ? 'низким' : 'средним'} риском. Обновитесь до Pro 1 для детального анализа района и живых данных.`,
      neighborhood: 'Обновитесь до Pro 1 для анализа района.',
      prediction: 'Обновитесь до Pro 2 для прогнозов цен.',
      comparison: 'Обновитесь до Pro 2 для сравнения объектов.'
    }
  };

  const lang = responses[language] || responses.en;
  return Promise.resolve(lang.general);
}

export async function analyzeNeighborhood(apartment, language = 'en') {
  // Pro 1+ feature
  const prompt = `Analyze the neighborhood of ${apartment.address} in ${apartment.city}. Include:
  - Safety rating
  - Transport options (metro, bus proximity)
  - Nearby amenities (shops, restaurants, parks)
  - School districts
  - General vibe and demographics`;

  return getDeepSeekResponse(prompt, { language });
}

export async function predictPrice(apartment, language = 'en') {
  // Pro 2+ feature
  const prompt = `Predict the rental price trend for ${apartment.address} in ${apartment.city}:
  - Current price: €${apartment.price}
  - 6-month forecast
  - 1-year forecast
  - Market conditions
  - Best time to rent`;

  return getDeepSeekResponse(prompt, { language });
}

export async function compareProperties(apartments, language = 'en') {
  // Pro 2+ feature
  const prompt = `Compare these properties and recommend the best option:
  ${apartments.map((apt, i) => `
  Property ${i + 1}:
  - Address: ${apt.address}
  - Price: €${apt.price}
  - Size: ${apt.size}m²
  - Rooms: ${apt.rooms}
  - Risk Score: ${apt.riskScore}
  `).join('\n')}
  
  Provide a detailed comparison and recommendation.`;

  return getDeepSeekResponse(prompt, { language });
}

export async function analyzePortfolio(apartments, clientPreferences, language = 'en') {
  // Ultimate feature
  const prompt = `Analyze this property portfolio for a client:
  
  Client Preferences: ${JSON.stringify(clientPreferences)}
  
  Properties:
  ${apartments.map((apt, i) => `
  ${i + 1}. ${apt.address} - €${apt.price}/mo, ${apt.rooms} rooms, ${apt.size}m²
  `).join('\n')}
  
  Provide:
  - Best matches for client
  - Investment potential
  - Risk assessment
  - Personalized recommendations`;

  return getDeepSeekResponse(prompt, { language });
}

export default {
  getTierBasedAIResponse,
  analyzeNeighborhood,
  predictPrice,
  compareProperties,
  analyzePortfolio
};