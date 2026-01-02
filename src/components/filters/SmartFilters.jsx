import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { 
  SlidersHorizontal, Wifi, Car, Wind, Coffee, TreePine, 
  Dumbbell, Shield, PawPrint, Baby, Snowflake, Waves
} from "lucide-react";

export default function SmartFilters({ filters, onFiltersChange, language = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);

  const labels = {
    en: {
      title: 'Smart Filters',
      amenities: 'Amenities',
      apply: 'Apply Filters',
      reset: 'Reset',
      hasBalcony: 'Balcony',
      hasParking: 'Parking',
      hasAC: 'Air Conditioning',
      hasDishwasher: 'Dishwasher',
      hasPool: 'Pool',
      hasGym: 'Gym',
      hasElevator: 'Elevator',
      hasSecurity: 'Security',
      petsAllowed: 'Pets Allowed',
      furnished: 'Furnished',
      nearMetro: 'Near Metro',
      nearPark: 'Near Park',
      active: 'active'
    },
    es: {
      title: 'Filtros Inteligentes',
      amenities: 'Comodidades',
      apply: 'Aplicar Filtros',
      reset: 'Restablecer',
      hasBalcony: 'Balcón',
      hasParking: 'Estacionamiento',
      hasAC: 'Aire Acondicionado',
      hasDishwasher: 'Lavavajillas',
      hasPool: 'Piscina',
      hasGym: 'Gimnasio',
      hasElevator: 'Ascensor',
      hasSecurity: 'Seguridad',
      petsAllowed: 'Se Admiten Mascotas',
      furnished: 'Amueblado',
      nearMetro: 'Cerca del Metro',
      nearPark: 'Cerca del Parque',
      active: 'activos'
    },
    ru: {
      title: 'Умные Фильтры',
      amenities: 'Удобства',
      apply: 'Применить',
      reset: 'Сбросить',
      hasBalcony: 'Балкон',
      hasParking: 'Парковка',
      hasAC: 'Кондиционер',
      hasDishwasher: 'Посудомойка',
      hasPool: 'Бассейн',
      hasGym: 'Спортзал',
      hasElevator: 'Лифт',
      hasSecurity: 'Охрана',
      petsAllowed: 'Можно с Животными',
      furnished: 'Меблированная',
      nearMetro: 'Рядом Метро',
      nearPark: 'Рядом Парк',
      active: 'активно'
    }
  };

  const t = labels[language] || labels.en;

  const amenitiesOptions = [
    { key: 'hasBalcony', label: t.hasBalcony, icon: Wind },
    { key: 'hasParking', label: t.hasParking, icon: Car },
    { key: 'hasAC', label: t.hasAC, icon: Snowflake },
    { key: 'hasDishwasher', label: t.hasDishwasher, icon: Waves },
    { key: 'hasPool', label: t.hasPool, icon: Waves },
    { key: 'hasGym', label: t.hasGym, icon: Dumbbell },
    { key: 'hasElevator', label: t.hasElevator, icon: Baby },
    { key: 'hasSecurity', label: t.hasSecurity, icon: Shield },
    { key: 'petsAllowed', label: t.petsAllowed, icon: PawPrint },
    { key: 'furnished', label: t.furnished, icon: Coffee },
    { key: 'nearMetro', label: t.nearMetro, icon: Wifi },
    { key: 'nearPark', label: t.nearPark, icon: TreePine }
  ];

  const handleToggle = (key) => {
    onFiltersChange({
      ...filters,
      amenities: {
        ...filters.amenities,
        [key]: !filters.amenities?.[key]
      }
    });
  };

  const handleReset = () => {
    onFiltersChange({
      ...filters,
      amenities: {}
    });
  };

  const activeCount = Object.values(filters.amenities || {}).filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal className="h-4 w-4" />
          {t.title}
          {activeCount > 0 && (
            <Badge className="ml-1 px-1.5 py-0 h-5 min-w-[20px] bg-blue-500">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div>
            <h4 className="font-medium text-sm mb-4">{t.amenities}</h4>
            <div className="grid grid-cols-2 gap-3">
              {amenitiesOptions.map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    filters.amenities?.[key]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggle(key)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${filters.amenities?.[key] ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              {t.reset}
            </Button>
            <Button onClick={() => setIsOpen(false)} className="flex-1 bg-black hover:bg-gray-800">
              {t.apply}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}