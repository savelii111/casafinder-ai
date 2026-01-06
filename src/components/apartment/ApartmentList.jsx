import React from 'react';
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Home } from "lucide-react";
import ApartmentCard from "./ApartmentCard";
import { ApartmentCardSkeleton } from "../common/SkeletonCard";

export default function ApartmentList({ 
  apartments, 
  onApartmentClick, 
  selectedId,
  sortBy,
  onSortChange,
  language = 'en',
  isLoading = false,
  onUpgradeClick
}) {
  const labels = {
    en: {
      title: 'Available Properties',
      sortBy: 'Sort by',
      priceAsc: 'Price: Low to High',
      priceDesc: 'Price: High to Low',
      rooms: 'Rooms',
      riskAsc: 'Risk: Low to High',
      riskDesc: 'Risk: High to Low',
      noResults: 'No apartments found'
    },
    es: {
      title: 'Propiedades Disponibles',
      sortBy: 'Ordenar por',
      priceAsc: 'Precio: Menor a Mayor',
      priceDesc: 'Precio: Mayor a Menor',
      rooms: 'Habitaciones',
      riskAsc: 'Riesgo: Menor a Mayor',
      riskDesc: 'Riesgo: Mayor a Menor',
      noResults: 'No se encontraron apartamentos'
    },
    ru: {
      title: 'Доступные Квартиры',
      sortBy: 'Сортировать',
      priceAsc: 'Цена: по возрастанию',
      priceDesc: 'Цена: по убыванию',
      rooms: 'Комнаты',
      riskAsc: 'Риск: по возрастанию',
      riskDesc: 'Риск: по убыванию',
      noResults: 'Квартиры не найдены'
    }
  };

  const t = labels[language] || labels.en;

  const sortedApartments = React.useMemo(() => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 [APARTMENT LIST] Sorting (Sheets source)');
    console.log(`   Input: ${apartments?.length || 0} apartments`);
    console.log(`   Sort by: ${sortBy}`);

    if (!apartments) return [];
    const sorted = [...apartments];

    let result;
    switch (sortBy) {
      case 'price-asc':
        result = sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result = sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rooms':
        result = sorted.sort((a, b) => (b.rooms || 0) - (a.rooms || 0));
        break;
      case 'risk-asc':
        result = sorted.sort((a, b) => (a.riskScore || 5) - (b.riskScore || 5));
        break;
      case 'risk-desc':
        result = sorted.sort((a, b) => (b.riskScore || 5) - (a.riskScore || 5));
        break;
      default:
        result = sorted;
    }

    console.log(`   Output: ${result.length} apartments`);
    console.log('═══════════════════════════════════════════════════════');

    if (result.length === 20 && apartments.length > 20) {
      console.error('🚨 APARTMENT LIST: Output truncated to 20!');
    }

    return result;
  }, [apartments, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px] bg-white/70 backdrop-blur-sm border-white/20">
              <SelectValue placeholder={t.sortBy} />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-xl bg-white/90 border-white/20">
              <SelectItem value="price-asc">{t.priceAsc}</SelectItem>
              <SelectItem value="price-desc">{t.priceDesc}</SelectItem>
              <SelectItem value="rooms">{t.rooms}</SelectItem>
              <SelectItem value="risk-asc">{t.riskAsc}</SelectItem>
              <SelectItem value="risk-desc">{t.riskDesc}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <ApartmentCardSkeleton key={i} />
          ))}
        </div>
      ) : sortedApartments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t.noResults}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(() => {
            console.log('═══════════════════════════════════════════════════════');
            console.log(`📋 [APARTMENT CARDS] Rendering ${sortedApartments.length} cards`);
            console.log('═══════════════════════════════════════════════════════');

            if (sortedApartments.length === 20) {
              console.error('🚨 APARTMENT CARDS: Rendering exactly 20 - possible truncation!');
            }

            return sortedApartments.map((apt, index) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ApartmentCard
                apartment={apt}
                onClick={onApartmentClick}
                isSelected={selectedId === apt.id}
                language={language}
                onUpgradeClick={onUpgradeClick}
              />
            </motion.div>
          ));
          })()}
        </div>
      )}
    </div>
  );
}