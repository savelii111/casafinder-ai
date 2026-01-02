import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Bus, Coffee, GraduationCap, Music, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function NeighborhoodCard({ neighborhood, language = 'en', onClick }) {
  const labels = {
    en: {
      safety: 'Safety',
      transport: 'Transport',
      amenities: 'Amenities',
      restaurants: 'Food',
      schools: 'Schools',
      nightlife: 'Nightlife',
      avgPrice: 'Avg Price'
    },
    es: {
      safety: 'Seguridad',
      transport: 'Transporte',
      amenities: 'Comodidades',
      restaurants: 'Comida',
      schools: 'Escuelas',
      nightlife: 'Vida Nocturna',
      avgPrice: 'Precio Promedio'
    },
    ru: {
      safety: 'Безопасность',
      transport: 'Транспорт',
      amenities: 'Удобства',
      restaurants: 'Еда',
      schools: 'Школы',
      nightlife: 'Ночная Жизнь',
      avgPrice: 'Средняя Цена'
    }
  };

  const t = labels[language] || labels.en;

  const scores = [
    { label: t.safety, value: neighborhood.safety_score, icon: Shield, color: 'text-green-500' },
    { label: t.transport, value: neighborhood.transport_score, icon: Bus, color: 'text-blue-500' },
    { label: t.amenities, value: neighborhood.amenities_score, icon: Coffee, color: 'text-purple-500' },
    { label: t.restaurants, value: neighborhood.restaurants_score, icon: Coffee, color: 'text-orange-500' },
    { label: t.schools, value: neighborhood.schools_score, icon: GraduationCap, color: 'text-indigo-500' },
    { label: t.nightlife, value: neighborhood.nightlife_score, icon: Music, color: 'text-pink-500' }
  ];

  const avgScore = (
    (neighborhood.safety_score || 0) +
    (neighborhood.transport_score || 0) +
    (neighborhood.amenities_score || 0) +
    (neighborhood.restaurants_score || 0) +
    (neighborhood.schools_score || 0) +
    (neighborhood.nightlife_score || 0)
  ) / 6;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="glass-card hover:shadow-xl transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {neighborhood.name}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">{neighborhood.city}</p>
            </div>
            <Badge className={`${
              avgScore >= 8 ? 'bg-green-500' :
              avgScore >= 6 ? 'bg-blue-500' :
              avgScore >= 4 ? 'bg-amber-500' : 'bg-red-500'
            } text-white`}>
              {avgScore.toFixed(1)}/10
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {scores.map(({ label, value, icon: Icon, color }) => (
            value !== undefined && (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className={`h-3 w-3 ${color}`} />
                    {label}
                  </span>
                  <span className="font-medium">{value}/10</span>
                </div>
                <Progress value={value * 10} className="h-1.5" />
              </div>
            )
          ))}
          
          {neighborhood.average_price && (
            <div className="pt-2 border-t mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t.avgPrice}</span>
                <span className="font-bold text-black">€{neighborhood.average_price?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}