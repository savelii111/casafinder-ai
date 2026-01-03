import React from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bed, Maximize, Shield, MapPin, Share2, Sparkles, TrendingDown, PawPrint, Sofa } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import FavoriteButton from './FavoriteButton';
import { useFeatureAccess } from '@/components/subscription/SubscriptionManager';
import ShareModal from '../share/ShareModal';

export default function ApartmentCard({ apartment, onClick, isSelected, language = 'en', onUpgradeClick }) {
  const [showShareModal, setShowShareModal] = React.useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { canSaveFavorites } = useFeatureAccess();

  // Check if property is new (created < 48h ago)
  const isNew = apartment.created_date && 
    (new Date() - new Date(apartment.created_date)) < 48 * 60 * 60 * 1000;

  // Check if price dropped (mock - in production check price history)
  const hasPriceDropped = apartment.marketPriceDiff && apartment.marketPriceDiff < -10;
  const getRiskColor = (score) => {
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getRiskLabel = (score) => {
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card 
          className={`cursor-pointer overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border transition-all duration-300 group ${
            isSelected ? 'border-black dark:border-white shadow-xl' : 'border-white/20 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl hover:-translate-y-1'
          }`}
          onClick={() => onClick?.(apartment)}
        >
          <div className="relative overflow-hidden">
            {apartment.photos?.[0] ? (
              <img 
                src={apartment.photos[0]} 
                alt={apartment.title}
                className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="absolute top-2 right-2">
              <FavoriteButton
                apartment={apartment}
                userEmail={user?.email}
                onUpgradeClick={onUpgradeClick}
                canSave={canSaveFavorites}
                language={language}
              />
            </div>
            
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {apartment.riskScore && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={`${getRiskColor(apartment.riskScore)} text-white border-0`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRiskLabel(apartment.riskScore)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Risk Score: {apartment.riskScore}/10</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {isNew && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 animate-pulse">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {language === 'es' ? 'Nueva' : language === 'ru' ? 'Новая' : 'New'}
                </Badge>
              )}
              {hasPriceDropped && (
                <Badge className="bg-green-500 text-white border-0">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {language === 'es' ? 'Rebajado' : language === 'ru' ? 'Скидка' : 'Price Drop'}
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 flex-1">
              {apartment.title}
            </h3>
          </div>

          <p className="text-2xl font-bold text-black dark:text-white mb-2">
            €{apartment.price?.toLocaleString()}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mo</span>
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
            <MapPin className="h-3 w-3 inline mr-1" />
            {apartment.address}
          </p>

          <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-300 flex-wrap">
            {apartment.rooms && (
              <span className="flex items-center gap-1">
                <Bed className="h-3 w-3" />
                {apartment.rooms} rooms
              </span>
            )}
            {apartment.size && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3 w-3" />
                {apartment.size} m²
              </span>
            )}
            {apartment.furnished && (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Sofa className="h-3 w-3" />
                {language === 'es' ? 'Amueblado' : language === 'ru' ? 'Мебель' : 'Furnished'}
              </span>
            )}
            {apartment.pets_allowed && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <PawPrint className="h-3 w-3" />
                {language === 'es' ? 'Mascotas' : language === 'ru' ? 'Питомцы' : 'Pets OK'}
              </span>
            )}
          </div>

          {apartment.aiInsight && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 italic">
              "{apartment.aiInsight}"
            </p>
          )}
        </div>
      </Card>

      <ShareModal
        apartment={apartment}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        language={language}
      />
    </motion.div>
    </TooltipProvider>
  );
}