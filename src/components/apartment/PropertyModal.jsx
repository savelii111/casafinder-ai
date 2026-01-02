import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import PropertyTabs from './PropertyTabs';
import PhotoGallery from './PhotoGallery';
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, Bed, Maximize, MapPin, ChevronLeft, ChevronRight,
  Home, TrendingUp, TrendingDown, Minus, Calendar, PawPrint, Share2,
  CalendarCheck, Images, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import POINearby from '../map/POINearby';
import ShareModal from '../share/ShareModal';

export default function PropertyModal({ 
  apartment, 
  isOpen, 
  onClose, 
  onAskAI, 
  onCompare,
  onHireAgent,
  language = 'en',
  userPlan = 'free',
  canCompare = false,
  canUseWhatsApp = false
}) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [includeFood, setIncludeFood] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!apartment) return null;

  const photos = apartment.photos || [];

  const labels = {
    en: {
      rooms: 'rooms',
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
      no: 'No',
      hireAgent: 'Hire AI Agent',
      trueCost: 'True Cost Calculator',
      rent: 'Rent',
      utilities: 'Utilities',
      internet: 'Internet',
      food: 'Food',
      total: 'Total Monthly Cost',
      includeFood: 'Include food estimate',
      perMonth: '/month',
      quickActions: 'Quick Actions',
      shareLink: 'Share Link',
      scheduleVisit: 'Schedule Visit',
      viewGallery: 'View Gallery',
      linkCopied: 'Link copied!',
      visitScheduled: 'Visit scheduled!'
    },
    es: {
      rooms: 'habitaciones',
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
      no: 'No',
      hireAgent: 'Contratar Agente IA'
    },
    ru: {
      rooms: 'комнат',
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
      no: 'Нет',
      hireAgent: 'Нанять AI Агента'
    }
  };

  const t = labels[language] || labels.en;

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);

  const handleShareLink = () => {
    setShowShareModal(true);
  };

  const handleScheduleVisit = () => {
    toast.success(t.visitScheduled);
  };

  const calculateTotalCost = () => {
    if (!apartment.trueCost) return apartment.price;
    const base = apartment.trueCost.rent + apartment.trueCost.utilities + apartment.trueCost.internet;
    return includeFood ? base + (apartment.trueCost.food || 300) : base;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 glass-card border-white/30 shadow-2xl">
        {/* Photo Gallery */}
        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer group" onClick={() => setShowGallery(true)}>
        {photos.length > 0 ? (
        <>
        <img 
        src={photos[currentPhotoIndex]} 
        alt={apartment.title}
        className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
        <Button
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
        >
          <Images className="h-5 w-5 mr-2" />
          {t.viewGallery}
        </Button>
        </div>
        {photos.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
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

        <PhotoGallery 
        photos={photos}
        initialIndex={currentPhotoIndex}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        />

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

          {/* Property Tabs */}
          <motion.div 
            className="glass-card rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <PropertyTabs 
              apartment={apartment}
              language={language}
              onTranslate={(apt) => onAskAI?.(apt, 'translate')}
              userPlan={userPlan}
            />
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
          {apartment.trueCost && (
            <motion.div 
              className="glass-card rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">{t.trueCost}</h3>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.rent}</span>
                  <span className="font-medium">€{apartment.trueCost.rent}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.utilities}</span>
                  <span className="font-medium">€{apartment.trueCost.utilities}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.internet}</span>
                  <span className="font-medium">€{apartment.trueCost.internet}</span>
                </div>
                {includeFood && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">{t.food}</span>
                    <span className="font-medium">€{apartment.trueCost.food || 300}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-900">{t.total}</span>
                  <span className="font-bold text-lg text-purple-600">€{calculateTotalCost()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm text-gray-700">{t.includeFood}</span>
                <Switch checked={includeFood} onCheckedChange={setIncludeFood} />
              </div>
            </motion.div>
          )}

          {/* POI Nearby */}
          <motion.div 
            className="glass-card rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <POINearby apartment={apartment} language={language} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="glass-card rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="font-semibold text-gray-900 mb-3">{t.quickActions}</h3>
            <div className="grid grid-cols-1 gap-2">
              {canUseWhatsApp && (
                <Button 
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  onClick={() => onHireAgent?.(apartment)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t.hireAgent}
                </Button>
              )}
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleScheduleVisit}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                {t.scheduleVisit}
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleShareLink}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t.shareLink}
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>

      <ShareModal
        apartment={apartment}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        language={language}
      />
    </Dialog>
  );
}