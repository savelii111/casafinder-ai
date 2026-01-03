import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Maximize } from "lucide-react";

const demoProperties = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    city: 'Madrid',
    label: 'City Center',
    price: 1200,
    rooms: 2,
    size: 75
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    city: 'Barcelona',
    label: 'Near Beach',
    price: 1400,
    rooms: 3,
    size: 90
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    city: 'Valencia',
    label: 'Modern',
    price: 950,
    rooms: 2,
    size: 65
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    city: 'Seville',
    label: 'Historic Center',
    price: 850,
    rooms: 1,
    size: 55
  }
];

export default function FeaturedProperties({ language = 'en' }) {
  const labels = {
    en: {
      title: 'Popular Homes in Spain',
      subtitle: 'Discover trending properties across major cities',
      perMonth: '/month'
    },
    es: {
      title: 'Hogares Populares en España',
      subtitle: 'Descubre propiedades destacadas en las principales ciudades',
      perMonth: '/mes'
    },
    ru: {
      title: 'Популярные Дома в Испании',
      subtitle: 'Откройте популярную недвижимость в крупных городах',
      perMonth: '/мес'
    }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
      {/* Section Header */}
      <div className="text-center mb-8 lg:mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          {t.title}
        </h2>
        <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400">
          {t.subtitle}
        </p>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {demoProperties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
                  {property.label}
                </Badge>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{property.city}</span>
                </div>

                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  €{property.price}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{t.perMonth}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{property.rooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize className="h-4 w-4" />
                    <span>{property.size}m²</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}