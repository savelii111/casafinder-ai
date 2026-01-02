import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X, SlidersHorizontal } from "lucide-react";

export default function ApartmentFilters({ 
  filters, 
  onFiltersChange, 
  isPro = false,
  language = 'en',
  onUpgradeClick
}) {
  const [isOpen, setIsOpen] = useState(false);

  const labels = {
    en: {
      filters: 'Filters',
      priceRange: 'Price Range',
      rooms: 'Rooms',
      any: 'Any',
      minSize: 'Min Size (m²)',
      maxRisk: 'Max Risk Score',
      apply: 'Apply Filters',
      reset: 'Reset',
      proFeature: 'Advanced filters are Pro feature',
      upgrade: 'Upgrade to Pro'
    },
    es: {
      filters: 'Filtros',
      priceRange: 'Rango de Precio',
      rooms: 'Habitaciones',
      any: 'Cualquiera',
      minSize: 'Tamaño Min (m²)',
      maxRisk: 'Riesgo Máximo',
      apply: 'Aplicar Filtros',
      reset: 'Restablecer',
      proFeature: 'Filtros avanzados son función Pro',
      upgrade: 'Mejorar a Pro'
    },
    ru: {
      filters: 'Фильтры',
      priceRange: 'Диапазон Цен',
      rooms: 'Комнаты',
      any: 'Любой',
      minSize: 'Мин. Площадь (м²)',
      maxRisk: 'Макс. Риск',
      apply: 'Применить',
      reset: 'Сбросить',
      proFeature: 'Расширенные фильтры — функция Pro',
      upgrade: 'Улучшить до Pro'
    }
  };

  const t = labels[language] || labels.en;

  const handleReset = () => {
    onFiltersChange({
      priceMin: 0,
      priceMax: 5000,
      rooms: 'any',
      minSize: 0,
      maxRisk: 10
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{t.filters}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="backdrop-blur-xl bg-white/95 border-white/20">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t.filters}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t.priceRange}</Label>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ''}
                onChange={(e) => onFiltersChange({ ...filters, priceMin: parseInt(e.target.value) || 0 })}
                className="bg-white/50"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ''}
                onChange={(e) => onFiltersChange({ ...filters, priceMax: parseInt(e.target.value) || 5000 })}
                className="bg-white/50"
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t.rooms}</Label>
            <Select 
              value={filters.rooms || 'any'} 
              onValueChange={(v) => onFiltersChange({ ...filters, rooms: v })}
            >
              <SelectTrigger className="bg-white/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t.any}</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters (Pro) */}
          {isPro ? (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t.minSize}</Label>
                <Input
                  type="number"
                  value={filters.minSize || ''}
                  onChange={(e) => onFiltersChange({ ...filters, minSize: parseInt(e.target.value) || 0 })}
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">{t.maxRisk}: {filters.maxRisk || 10}</Label>
                <Slider
                  value={[filters.maxRisk || 10]}
                  onValueChange={([v]) => onFiltersChange({ ...filters, maxRisk: v })}
                  max={10}
                  min={1}
                  step={1}
                  className="py-4"
                />
              </div>
            </>
          ) : (
            <motion.div 
              className="glass-card rounded-xl p-4 shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-gray-600 mb-3">{t.proFeature}</p>
              <Button 
                onClick={() => {
                  setIsOpen(false);
                  onUpgradeClick?.();
                }}
                className="w-full bg-black hover:bg-gray-800"
              >
                {t.upgrade}
              </Button>
            </motion.div>
          )}

          <div className="flex gap-3 pt-4">
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