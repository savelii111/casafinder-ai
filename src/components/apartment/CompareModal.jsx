import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, Bed, Maximize, MapPin, TrendingUp, TrendingDown, 
  Minus, DollarSign, Shield, X
} from "lucide-react";

export default function CompareModal({ apartments = [], isOpen, onClose, onRemove, language = 'en' }) {
  const labels = {
    en: {
      title: 'Compare Properties',
      price: 'Price',
      rooms: 'Rooms',
      size: 'Size',
      risk: 'Risk Score',
      trueCost: 'True Cost',
      marketDiff: 'Market Difference',
      location: 'Location',
      perMonth: '/mo',
      overpriced: 'Overpriced',
      bargain: 'Bargain',
      fairPrice: 'Fair',
      remove: 'Remove'
    },
    es: {
      title: 'Comparar Propiedades',
      price: 'Precio',
      rooms: 'Habitaciones',
      size: 'Tamaño',
      risk: 'Riesgo',
      trueCost: 'Coste Real',
      marketDiff: 'Diferencia de Mercado',
      location: 'Ubicación',
      perMonth: '/mes',
      overpriced: 'Sobrevalorado',
      bargain: 'Oferta',
      fairPrice: 'Justo',
      remove: 'Eliminar'
    },
    ru: {
      title: 'Сравнить Квартиры',
      price: 'Цена',
      rooms: 'Комнаты',
      size: 'Площадь',
      risk: 'Риск',
      trueCost: 'Реальная Стоимость',
      marketDiff: 'Рыночная Разница',
      location: 'Местоположение',
      perMonth: '/мес',
      overpriced: 'Переоценено',
      bargain: 'Выгодно',
      fairPrice: 'Справедливо',
      remove: 'Удалить'
    }
  };

  const t = labels[language] || labels.en;

  const getMarketLabel = (diff) => {
    if (diff > 5) return { label: t.overpriced, color: 'text-red-500' };
    if (diff < -5) return { label: t.bargain, color: 'text-green-500' };
    return { label: t.fairPrice, color: 'text-gray-500' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t.title}</DialogTitle>
        </DialogHeader>

        {apartments.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No properties selected for comparison</p>
          </div>
        ) : apartments.length <= 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {apartments.map((apt) => {
              const marketInfo = getMarketLabel(apt.marketPriceDiff || 0);
              const totalCost = apt.trueCost 
                ? apt.trueCost.rent + apt.trueCost.utilities + apt.trueCost.internet + (apt.trueCost.food || 0)
                : apt.price;

              return (
                <div key={apt.id} className="glass-card rounded-2xl overflow-hidden shadow-lg relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                    onClick={() => onRemove?.(apt.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Photo */}
                  <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                    {apt.photos?.[0] ? (
                      <img src={apt.photos[0]} alt={apt.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">{apt.title}</h3>

                    <div className="space-y-3 text-base">
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-600">{t.price}</span>
                        <span className="font-bold text-xl text-black">€{apt.price?.toLocaleString()}{t.perMonth}</span>
                      </div>

                      {apt.trueCost && (
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-gray-600">{t.trueCost}</span>
                          <span className="font-bold text-lg text-purple-600">€{totalCost?.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-600">{t.rooms}</span>
                        <span className="font-semibold">{apt.rooms || 'N/A'}</span>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-600">{t.size}</span>
                        <span className="font-semibold">{apt.size ? `${apt.size} m²` : 'N/A'}</span>
                      </div>

                      {apt.riskScore && (
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-gray-600">{t.risk}</span>
                          <Badge className={`${
                            apt.riskScore <= 3 ? 'bg-green-500' :
                            apt.riskScore <= 6 ? 'bg-amber-500' : 'bg-red-500'
                          } text-white text-sm`}>
                            {apt.riskScore}/10
                          </Badge>
                        </div>
                      )}

                      {apt.marketPriceDiff !== undefined && (
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-gray-600">{t.marketDiff}</span>
                          <span className={`font-semibold ${marketInfo.color}`}>
                            {apt.marketPriceDiff > 0 ? '+' : ''}{apt.marketPriceDiff}%
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-2 pt-2">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-500 line-clamp-2">{apt.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apt) => {
              const marketInfo = getMarketLabel(apt.marketPriceDiff || 0);
              const totalCost = apt.trueCost 
                ? apt.trueCost.rent + apt.trueCost.utilities + apt.trueCost.internet + (apt.trueCost.food || 0)
                : apt.price;

              return (
                <div key={apt.id} className="glass-card rounded-2xl overflow-hidden shadow-lg relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                    onClick={() => onRemove?.(apt.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Photo */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                    {apt.photos?.[0] ? (
                      <img src={apt.photos[0]} alt={apt.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm line-clamp-1">{apt.title}</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-gray-600">{t.price}</span>
                        <span className="font-bold text-black">€{apt.price?.toLocaleString()}{t.perMonth}</span>
                      </div>

                      {apt.trueCost && (
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">{t.trueCost}</span>
                          <span className="font-bold text-purple-600">€{totalCost?.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-gray-600">{t.rooms}</span>
                        <span className="font-medium">{apt.rooms || 'N/A'}</span>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-gray-600">{t.size}</span>
                        <span className="font-medium">{apt.size ? `${apt.size} m²` : 'N/A'}</span>
                      </div>

                      {apt.riskScore && (
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">{t.risk}</span>
                          <Badge className={`${
                            apt.riskScore <= 3 ? 'bg-green-500' :
                            apt.riskScore <= 6 ? 'bg-amber-500' : 'bg-red-500'
                          } text-white`}>
                            {apt.riskScore}/10
                          </Badge>
                        </div>
                      )}

                      {apt.marketPriceDiff !== undefined && (
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">{t.marketDiff}</span>
                          <span className={`font-medium ${marketInfo.color}`}>
                            {apt.marketPriceDiff > 0 ? '+' : ''}{apt.marketPriceDiff}%
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-2 pt-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-500 line-clamp-2">{apt.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}