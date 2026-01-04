import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function DistanceCalculator({ apartment, language = 'en' }) {
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateDistance = async () => {
    if (!destination.trim()) return;
    
    setLoading(true);
    try {
      const result = await base44.functions.invoke('calculateDistance', {
        from: `${apartment.lat},${apartment.lng}`,
        to: destination
      });
      
      setDistance(result.data);
    } catch (error) {
      toast.error('Failed to calculate distance');
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    en: { placeholder: 'Enter destination (e.g., Sol, Madrid)', calculate: 'Calculate', distance: 'Distance', duration: 'Travel Time' },
    es: { placeholder: 'Ingrese destino (ej. Sol, Madrid)', calculate: 'Calcular', distance: 'Distancia', duration: 'Tiempo de Viaje' },
    ru: { placeholder: 'Введите пункт назначения', calculate: 'Рассчитать', distance: 'Расстояние', duration: 'Время в Пути' }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder={t.placeholder}
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && calculateDistance()}
        />
        <Button onClick={calculateDistance} disabled={loading}>
          {loading ? '...' : t.calculate}
        </Button>
      </div>
      
      {distance && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">{t.distance}</p>
              <p className="font-semibold">{distance.distance}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">{t.duration}</p>
              <p className="font-semibold">{distance.duration}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}