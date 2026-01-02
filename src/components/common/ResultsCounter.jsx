import React from 'react';
import { motion } from 'framer-motion';
import { Home, TrendingDown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ResultsCounter({ count, language = 'en', showBadges = true }) {
  const labels = {
    en: {
      properties: count === 1 ? 'property' : 'properties',
      found: 'found',
      greatDeals: 'Great deals',
      belowMarket: 'Below market price'
    },
    es: {
      properties: count === 1 ? 'propiedad' : 'propiedades',
      found: 'encontradas',
      greatDeals: 'Buenas ofertas',
      belowMarket: 'Bajo precio de mercado'
    },
    ru: {
      properties: count === 1 ? 'объект' : count < 5 ? 'объекта' : 'объектов',
      found: 'найдено',
      greatDeals: 'Отличные предложения',
      belowMarket: 'Ниже рыночной цены'
    }
  };

  const t = labels[language] || labels.en;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 mb-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-black to-gray-700 flex items-center justify-center">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">{count}</span>
              <span className="text-lg text-gray-600">{t.properties}</span>
              <span className="text-lg text-gray-400">{t.found}</span>
            </div>
            {showBadges && count > 0 && (
              <div className="flex gap-2 mt-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {t.greatDeals}
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t.belowMarket}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}