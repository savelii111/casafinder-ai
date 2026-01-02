import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Coffee, ShoppingBag, GraduationCap, Hospital, 
  Bus, Train, TreePine, Dumbbell 
} from "lucide-react";
import { motion } from "framer-motion";

export default function POINearby({ apartment, language = 'en' }) {
  const labels = {
    en: {
      nearby: 'Nearby',
      cafe: 'Cafes',
      shop: 'Shops',
      school: 'Schools',
      hospital: 'Hospital',
      metro: 'Metro',
      bus: 'Bus Stop',
      park: 'Park',
      gym: 'Gym',
      min: 'min walk'
    },
    es: {
      nearby: 'Cerca',
      cafe: 'Cafeterías',
      shop: 'Tiendas',
      school: 'Escuelas',
      hospital: 'Hospital',
      metro: 'Metro',
      bus: 'Parada de Bus',
      park: 'Parque',
      gym: 'Gimnasio',
      min: 'min a pie'
    },
    ru: {
      nearby: 'Рядом',
      cafe: 'Кафе',
      shop: 'Магазины',
      school: 'Школы',
      hospital: 'Больница',
      metro: 'Метро',
      bus: 'Автобус',
      park: 'Парк',
      gym: 'Спортзал',
      min: 'мин пешком'
    }
  };

  const t = labels[language] || labels.en;

  // Mock POI data - in real app, fetch from API
  const pois = [
    { type: 'metro', label: t.metro, icon: Train, distance: 5, color: 'text-blue-500' },
    { type: 'bus', label: t.bus, icon: Bus, distance: 2, color: 'text-green-500' },
    { type: 'cafe', label: t.cafe, icon: Coffee, distance: 3, color: 'text-orange-500' },
    { type: 'shop', label: t.shop, icon: ShoppingBag, distance: 4, color: 'text-purple-500' },
    { type: 'school', label: t.school, icon: GraduationCap, distance: 10, color: 'text-indigo-500' },
    { type: 'park', label: t.park, icon: TreePine, distance: 7, color: 'text-emerald-500' },
    { type: 'gym', label: t.gym, icon: Dumbbell, distance: 6, color: 'text-red-500' },
    { type: 'hospital', label: t.hospital, icon: Hospital, distance: 15, color: 'text-pink-500' }
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{t.nearby}</h4>
      <div className="grid grid-cols-2 gap-2">
        {pois.map((poi, idx) => (
          <motion.div
            key={poi.type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <poi.icon className={`h-3 w-3 ${poi.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{poi.label}</p>
                    <p className="text-xs text-gray-500">{poi.distance} {t.min}</p>
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