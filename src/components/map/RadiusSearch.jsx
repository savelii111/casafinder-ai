import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RadiusSearch({ onSearch, language = 'en' }) {
  const [radius, setRadius] = useState(1000);
  const [location, setLocation] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const labels = {
    en: {
      radiusSearch: 'Radius Search',
      location: 'Location',
      radius: 'Radius (meters)',
      search: 'Search',
      placeholder: 'Enter address or place',
      close: 'Close'
    },
    es: {
      radiusSearch: 'Búsqueda por Radio',
      location: 'Ubicación',
      radius: 'Radio (metros)',
      search: 'Buscar',
      placeholder: 'Ingresa dirección o lugar',
      close: 'Cerrar'
    },
    ru: {
      radiusSearch: 'Поиск по Радиусу',
      location: 'Местоположение',
      radius: 'Радиус (метры)',
      search: 'Искать',
      placeholder: 'Введите адрес или место',
      close: 'Закрыть'
    }
  };

  const t = labels[language] || labels.en;

  const handleSearch = () => {
    if (location.trim()) {
      onSearch?.({ location, radius });
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <MapPin className="h-4 w-4" />
        {t.radiusSearch}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 left-0 z-[1001]"
          >
            <Card className="glass-card shadow-xl w-80">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{t.radiusSearch}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <Input
                  placeholder={t.placeholder}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-sm"
                />

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    {t.radius}: {radius}m
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleSearch}
                  className="w-full bg-black hover:bg-gray-800 gap-2"
                  size="sm"
                >
                  <Search className="h-3 w-3" />
                  {t.search}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}