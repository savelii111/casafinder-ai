import React from 'react';
import { motion } from 'framer-motion';
import { Home, Heart, Search, TrendingUp } from 'lucide-react';

export default function StatsBar({ 
  totalProperties = 0,
  favorites = 0,
  searches = 0,
  avgPrice = 0,
  language = 'en'
}) {
  const labels = {
    en: {
      properties: 'Properties',
      favorites: 'Favorites',
      searches: 'Searches',
      avgPrice: 'Avg Price'
    },
    es: {
      properties: 'Propiedades',
      favorites: 'Favoritos',
      searches: 'Búsquedas',
      avgPrice: 'Precio Medio'
    },
    ru: {
      properties: 'Объектов',
      favorites: 'Избранное',
      searches: 'Поиски',
      avgPrice: 'Средняя Цена'
    }
  };

  const t = labels[language] || labels.en;

  const stats = [
    { icon: Home, label: t.properties, value: totalProperties, color: 'text-blue-500' },
    { icon: Heart, label: t.favorites, value: favorites, color: 'text-red-500' },
    { icon: Search, label: t.searches, value: searches, color: 'text-purple-500' },
    { icon: TrendingUp, label: t.avgPrice, value: `€${avgPrice}`, color: 'text-green-500' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card p-4 rounded-xl hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}