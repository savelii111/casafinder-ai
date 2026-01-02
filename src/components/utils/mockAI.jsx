// Mock AI responses for apartment queries
// Ready for DeepSeek API integration in BuilderPlan

const mockResponses = {
  en: {
    askAI: [
      "This apartment offers excellent value for money in a prime location. The neighborhood is safe and well-connected to public transport. I'd recommend visiting during rush hour to check noise levels.",
      "Great find! The price is below market average for this area. The building appears well-maintained from the photos. Consider asking about recent renovations and utility costs.",
      "This property is in a vibrant neighborhood with good amenities nearby. The size is generous for the price point. Make sure to verify the heating system and internet connection quality.",
      "Location-wise, this is one of the better options in the area. The apartment seems bright and spacious. I'd suggest inquiring about the move-in date flexibility and deposit terms.",
      "Solid choice for the budget. The area has seen steady appreciation over the past year. Check for any upcoming construction projects that might affect noise or parking.",
    ],
    compare: [
      "Compared to similar properties in the area:\n\n✓ Price is 8% lower than average\n✓ Better location with more amenities\n✗ Slightly smaller size\n✓ Lower risk score\n\nOverall: This is a better deal than 72% of comparable properties.",
      "Comparison Analysis:\n\n✓ Excellent value - €150/month below market\n✓ Superior neighborhood safety rating\n✗ One fewer room than average\n✓ Better public transport access\n\nRecommendation: Strong buy for the price point.",
      "Market Comparison:\n\n✓ Top 15% for price/quality ratio\n✗ Higher utility costs estimated\n✓ Better building condition\n✓ More natural light\n\nConclusion: Above average option worth considering.",
    ],
    translate: [
      "Translation: The landlord is very responsive and the apartment was recently renovated. All appliances are new and included. The building has 24/7 security.",
      "Translation: Quiet residential area with parks nearby. Close to supermarkets and restaurants. Metro station is 5 minutes walk. Perfect for students or young professionals.",
      "Translation: Modern apartment with excellent natural light. Updated kitchen and bathroom. Building has elevator and parking available for extra fee. Available immediately.",
    ]
  },
  es: {
    askAI: [
      "Este apartamento ofrece excelente relación calidad-precio en una ubicación privilegiada. El barrio es seguro y está bien conectado al transporte público. Recomendaría visitar en hora punta para verificar niveles de ruido.",
      "¡Gran hallazgo! El precio está por debajo del promedio del mercado para esta zona. El edificio parece bien mantenido según las fotos. Considera preguntar sobre renovaciones recientes y costos de servicios.",
      "Esta propiedad está en un barrio vibrante con buenas comodidades cercanas. El tamaño es generoso para el precio. Asegúrate de verificar el sistema de calefacción y la calidad de conexión a internet.",
      "En cuanto a ubicación, esta es una de las mejores opciones en el área. El apartamento parece luminoso y espacioso. Sugiero preguntar sobre flexibilidad en fecha de entrada y términos del depósito.",
      "Opción sólida para el presupuesto. El área ha visto una apreciación constante el último año. Verifica si hay proyectos de construcción próximos que puedan afectar ruido o estacionamiento.",
    ],
    compare: [
      "Comparado con propiedades similares en el área:\n\n✓ Precio 8% menor que el promedio\n✓ Mejor ubicación con más servicios\n✗ Tamaño ligeramente menor\n✓ Menor puntuación de riesgo\n\nEn general: Esta es mejor oferta que el 72% de propiedades comparables.",
      "Análisis Comparativo:\n\n✓ Excelente valor - €150/mes bajo el mercado\n✓ Calificación superior en seguridad del barrio\n✗ Una habitación menos que el promedio\n✓ Mejor acceso al transporte público\n\nRecomendación: Fuerte opción de compra para el precio.",
      "Comparación de Mercado:\n\n✓ Top 15% en relación precio/calidad\n✗ Costos de servicios estimados más altos\n✓ Mejor condición del edificio\n✓ Más luz natural\n\nConclusión: Opción superior al promedio que vale la pena considerar.",
    ],
    translate: [
      "Traducción: El propietario es muy receptivo y el apartamento fue renovado recientemente. Todos los electrodomésticos son nuevos e incluidos. El edificio tiene seguridad 24/7.",
      "Traducción: Zona residencial tranquila con parques cercanos. Cerca de supermercados y restaurantes. Estación de metro a 5 minutos caminando. Perfecto para estudiantes o jóvenes profesionales.",
      "Traducción: Apartamento moderno con excelente luz natural. Cocina y baño actualizados. Edificio con ascensor y estacionamiento disponible por tarifa extra. Disponible inmediatamente.",
    ]
  },
  ru: {
    askAI: [
      "Эта квартира предлагает отличное соотношение цены и качества в престижном районе. Район безопасный и хорошо связан с общественным транспортом. Рекомендую посетить в час пик, чтобы проверить уровень шума.",
      "Отличная находка! Цена ниже среднерыночной для этого района. Здание выглядит ухоженным на фотографиях. Стоит спросить о недавних ремонтах и стоимости коммунальных услуг.",
      "Эта недвижимость находится в оживленном районе с хорошими удобствами поблизости. Размер щедрый для этой цены. Обязательно проверьте систему отопления и качество интернет-соединения.",
      "По расположению это один из лучших вариантов в районе. Квартира кажется светлой и просторной. Предлагаю узнать о гибкости даты въезда и условиях депозита.",
      "Надежный выбор для бюджета. Район показывал стабильный рост стоимости за последний год. Проверьте наличие предстоящих строительных проектов, которые могут повлиять на шум или парковку.",
    ],
    compare: [
      "По сравнению с похожими объектами в районе:\n\n✓ Цена на 8% ниже средней\n✓ Лучшее расположение с большим количеством удобств\n✗ Немного меньшая площадь\n✓ Более низкий показатель риска\n\nВ целом: Это лучшее предложение, чем 72% сопоставимых объектов.",
      "Сравнительный Анализ:\n\n✓ Отличная ценность - на €150/мес ниже рынка\n✓ Превосходный рейтинг безопасности района\n✗ На одну комнату меньше среднего\n✓ Лучший доступ к общественному транспорту\n\nРекомендация: Сильный вариант для покупки по этой цене.",
      "Рыночное Сравнение:\n\n✓ Топ 15% по соотношению цена/качество\n✗ Выше оценочные расходы на коммунальные услуги\n✓ Лучшее состояние здания\n✓ Больше естественного света\n\nЗаключение: Вариант выше среднего, который стоит рассмотреть.",
    ],
    translate: [
      "Перевод: Арендодатель очень отзывчивый, и квартира была недавно отремонтирована. Вся техника новая и включена. В здании круглосуточная охрана.",
      "Перевод: Тихий жилой район с парками поблизости. Рядом супермаркеты и рестораны. Станция метро в 5 минутах ходьбы. Идеально для студентов или молодых специалистов.",
      "Перевод: Современная квартира с отличным естественным освещением. Обновленная кухня и ванная. В здании есть лифт и парковка за дополнительную плату. Доступна немедленно.",
    ]
  }
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockAskAI(apartment, language = 'en') {
  await delay(1200); // Simulate API call
  const responses = mockResponses[language] || mockResponses.en;
  const randomIndex = Math.floor(Math.random() * responses.askAI.length);
  return responses.askAI[randomIndex];
}

export async function mockCompare(apartment, language = 'en') {
  await delay(1500); // Simulate API call
  const responses = mockResponses[language] || mockResponses.en;
  const randomIndex = Math.floor(Math.random() * responses.compare.length);
  return responses.compare[randomIndex];
}

export async function mockTranslate(apartment, language = 'en') {
  await delay(1000); // Simulate API call
  const responses = mockResponses[language] || mockResponses.en;
  const randomIndex = Math.floor(Math.random() * responses.translate.length);
  return responses.translate[randomIndex];
}

// Function to update map with new properties data
// Ready for ZenRows/Idealista integration
export function updateMap(properties) {
  // This function will be called when real API data arrives
  // For now, it returns the properties as-is
  // Future: Add data transformation, filtering, validation
  return properties.map(property => ({
    ...property,
    lat: property.lat || 40.4168 + (Math.random() - 0.5) * 0.1,
    lng: property.lng || -3.7038 + (Math.random() - 0.5) * 0.1,
  }));
}