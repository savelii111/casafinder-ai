import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield, Calculator, MessageSquare, ArrowLeftRight, Languages,
  X, Bed, Maximize, MapPin, ChevronLeft, ChevronRight, Sparkles,
  Zap, Wifi, UtensilsCrossed, Home, TrendingUp, TrendingDown, 
  Minus, Calendar, PawPrint, Package
} from "lucide-react";

export default function PropertyModal({ 
  apartment, 
  isOpen, 
  onClose, 
  onAskAI, 
  onCompare,
  language = 'en',
  userPlan = 'free'
}) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [includeFood, setIncludeFood] = useState(false);

  if (!apartment) return null;

  const photos = apartment.photos || [];
  const trueCost = apartment.trueCost || { rent: apartment.price, utilities: 80, internet: 30, food: 200 };
  const totalCost = trueCost.rent + trueCost.utilities + trueCost.internet + (includeFood ? trueCost.food : 0);

  const getRiskColor = (score) => {
    if (score <= 3) return 'text-green-500';
    if (score <= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRiskBgColor = (score) => {
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const labels = {
    en: {
      riskDetector: 'Risk Detector',
      trueCost: 'True Cost Calculator',
      aiActions: 'AI Actions',
      askAI: 'Ask AI',
      compare: 'Compare',
      translate: 'Translate',
      rent: 'Rent',
      utilities: 'Utilities',
      internet: 'Internet',
      food: 'Food (optional)',
      total: 'Total Monthly Cost',
      rooms: 'rooms',
      lowRisk: 'Low Risk',
      mediumRisk: 'Medium Risk',
      highRisk: 'High Risk',
      marketPrice: 'Market Price Analysis',
      overpriced: 'Above market',
      bargain: 'Below market',
      fairPrice: 'Fair price',
      details: 'Property Details',
      floor: 'Floor',
      elevator: 'Elevator',
      furnished: 'Furnished',
      petsAllowed: 'Pets Allowed',
      availableFrom: 'Available From',
      yes: 'Yes',
      no: 'No'
    },
    es: {
      riskDetector: 'Detector de Riesgo',
      trueCost: 'Calculadora de Coste Real',
      aiActions: 'Acciones IA',
      askAI: 'Preguntar IA',
      compare: 'Comparar',
      translate: 'Traducir',
      rent: 'Alquiler',
      utilities: 'Servicios',
      internet: 'Internet',
      food: 'Comida (opcional)',
      total: 'Coste Mensual Total',
      rooms: 'habitaciones',
      lowRisk: 'Bajo Riesgo',
      mediumRisk: 'Riesgo Medio',
      highRisk: 'Alto Riesgo',
      marketPrice: 'Análisis de Precio de Mercado',
      overpriced: 'Sobre el mercado',
      bargain: 'Bajo el mercado',
      fairPrice: 'Precio justo',
      details: 'Detalles de la Propiedad',
      floor: 'Piso',
      elevator: 'Ascensor',
      furnished: 'Amueblado',
      petsAllowed: 'Mascotas Permitidas',
      availableFrom: 'Disponible Desde',
      yes: 'Sí',
      no: 'No'
    },
    ru: {
      riskDetector: 'Детектор Рисков',
      trueCost: 'Калькулятор Реальной Стоимости',
      aiActions: 'AI Действия',
      askAI: 'Спросить AI',
      compare: 'Сравнить',
      translate: 'Перевести',
      rent: 'Аренда',
      utilities: 'Коммунальные',
      internet: 'Интернет',
      food: 'Еда (опционально)',
      total: 'Итого в Месяц',
      rooms: 'комнат',
      lowRisk: 'Низкий Риск',
      mediumRisk: 'Средний Риск',
      highRisk: 'Высокий Риск',
      marketPrice: 'Анализ Рыночной Цены',
      overpriced: 'Выше рынка',
      bargain: 'Ниже рынка',
      fairPrice: 'Справедливая цена',
      details: 'Детали Квартиры',
      floor: 'Этаж',
      elevator: 'Лифт',
      furnished: 'С мебелью',
      petsAllowed: 'Животные Разрешены',
      availableFrom: 'Доступно С',
      yes: 'Да',
      no: 'Нет'
    }
  };

  const t = labels[language] || labels.en;

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 glass-card border-white/30 shadow-2xl">
        {/* Photo Gallery */}
        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
          {photos.length > 0 ? (
            <>
              <img 
                src={photos[currentPhotoIndex]} 
                alt={apartment.title}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button 
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {photos.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`w-2 h-2 rounded-full ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{apartment.title}</h2>
            <p className="text-3xl font-bold text-black mt-2">
              €{apartment.price?.toLocaleString()}<span className="text-base font-normal text-gray-500">/mo</span>
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {apartment.address}
              </span>
              {apartment.rooms && (
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {apartment.rooms} {t.rooms}
                </span>
              )}
              {apartment.size && (
                <span className="flex items-center gap-1">
                  <Maximize className="h-4 w-4" />
                  {apartment.size} m²
                </span>
              )}
            </div>
          </div>

          {/* Property Details */}
          <motion.div 
            className="glass-card rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">{t.details}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {apartment.floor !== undefined && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.floor}</span>
                  <span className="font-medium">{apartment.floor}</span>
                </div>
              )}
              {apartment.hasElevator !== undefined && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.elevator}</span>
                  <span className="font-medium">{apartment.hasElevator ? t.yes : t.no}</span>
                </div>
              )}
              {apartment.furnished !== undefined && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.furnished}</span>
                  <span className="font-medium">{apartment.furnished ? t.yes : t.no}</span>
                </div>
              )}
              {apartment.pets_allowed !== undefined && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-1">
                    <PawPrint className="h-3 w-3" />
                    {t.petsAllowed}
                  </span>
                  <span className="font-medium">{apartment.pets_allowed ? t.yes : t.no}</span>
                </div>
              )}
              {apartment.available_from && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t.availableFrom}
                  </span>
                  <span className="font-medium">{new Date(apartment.available_from).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Risk Detector */}
          <motion.div 
            className="glass-card rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className={`h-5 w-5 ${getRiskColor(apartment.riskScore)}`} />
              <h3 className="font-semibold text-gray-900">{t.riskDetector}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Risk Score</span>
                <span className={`font-bold ${getRiskColor(apartment.riskScore)}`}>
                  {apartment.riskScore || '?'}/10
                </span>
              </div>
              <Progress 
                value={(apartment.riskScore || 5) * 10} 
                className={`h-2 ${getRiskBgColor(apartment.riskScore)}`}
              />
              {apartment.aiInsight && (
                <p className="text-sm text-gray-600 mt-3 italic bg-gray-50 rounded-lg p-3">
                  <Sparkles className="h-4 w-4 inline mr-1 text-gray-400" />
                  {apartment.aiInsight}
                </p>
              )}
            </div>
          </motion.div>

          {/* Market Price Analysis */}
          {apartment.marketPriceDiff !== undefined && (
            <motion.div 
              className="glass-card rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                {apartment.marketPriceDiff > 5 ? (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                ) : apartment.marketPriceDiff < -5 ? (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-500" />
                )}
                <h3 className="font-semibold text-gray-900">{t.marketPrice}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Market Difference</span>
                  <span className={`font-bold ${
                    apartment.marketPriceDiff > 5 ? 'text-red-500' : 
                    apartment.marketPriceDiff < -5 ? 'text-green-500' : 
                    'text-gray-500'
                  }`}>
                    {apartment.marketPriceDiff > 0 ? '+' : ''}{apartment.marketPriceDiff}%
                  </span>
                </div>
                <Progress 
                  value={Math.abs(apartment.marketPriceDiff) * 5} 
                  className={`h-2 ${
                    apartment.marketPriceDiff > 5 ? 'bg-red-500' : 
                    apartment.marketPriceDiff < -5 ? 'bg-green-500' : 
                    'bg-gray-500'
                  }`}
                />
                <p className="text-sm text-gray-600 mt-3 italic bg-gray-50 rounded-lg p-3">
                  {apartment.marketPriceDiff > 5 ? (
                    <>🔴 {t.overpriced}: This property is priced above the market average for the area.</>
                  ) : apartment.marketPriceDiff < -5 ? (
                    <>🟢 {t.bargain}: Great deal! This property is priced below market average.</>
                  ) : (
                    <>⚪ {t.fairPrice}: This property is fairly priced for the market.</>
                  )}
                </p>
              </div>
            </motion.div>
          )}

          {/* True Cost Calculator */}
          <motion.div 
            className="glass-card rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">{t.trueCost}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Home className="h-4 w-4" /> {t.rent}
                </span>
                <span className="font-medium">€{trueCost.rent}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4" /> {t.utilities}
                </span>
                <span className="font-medium">€{trueCost.utilities}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Wifi className="h-4 w-4" /> {t.internet}
                </span>
                <span className="font-medium">€{trueCost.internet}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="food-toggle" className="text-sm text-gray-600">{t.food}</Label>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-400">€{trueCost.food}</span>
                  <Switch id="food-toggle" checked={includeFood} onCheckedChange={setIncludeFood} />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-900">{t.total}</span>
                <span className="text-2xl font-bold text-black">€{totalCost}</span>
              </div>
            </div>
          </motion.div>

          {/* AI Actions */}
          <motion.div 
            className="glass-card rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">{t.aiActions}</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-auto py-4 glass-card hover:scale-105 hover:shadow-xl transition-all duration-300 border-gray-200"
                onClick={() => onAskAI?.(apartment)}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">{t.askAI}</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-auto py-4 glass-card hover:scale-105 hover:shadow-xl transition-all duration-300 border-gray-200 disabled:opacity-50 disabled:hover:scale-100"
                onClick={() => onCompare?.(apartment)}
                disabled={userPlan === 'free'}
              >
                <ArrowLeftRight className="h-5 w-5" />
                <span className="text-xs">{t.compare}</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col items-center gap-2 h-auto py-4 glass-card hover:scale-105 hover:shadow-xl transition-all duration-300 border-gray-200"
                onClick={() => onAskAI?.(apartment, 'translate')}
              >
                <Languages className="h-5 w-5" />
                <span className="text-xs">{t.translate}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}