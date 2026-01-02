import React from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Maximize, Shield, MapPin } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import FavoriteButton from './FavoriteButton';
import { useFeatureAccess } from '@/components/subscription/SubscriptionManager';

export default function ApartmentCard({ apartment, onClick, isSelected, language = 'en', onUpgradeClick }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { canSaveFavorites } = useFeatureAccess();
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card 
        className={`cursor-pointer overflow-hidden backdrop-blur-xl bg-white/70 border transition-all duration-300 group ${
          isSelected ? 'border-black shadow-xl' : 'border-white/20 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1'
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
          
          {apartment.riskScore && (
            <Badge className={`absolute top-2 left-2 ${getRiskColor(apartment.riskScore)} text-white border-0`}>
              <Shield className="h-3 w-3 mr-1" />
              {getRiskLabel(apartment.riskScore)}
            </Badge>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1">
              {apartment.title}
            </h3>
          </div>

          <p className="text-2xl font-bold text-black mb-2">
            €{apartment.price?.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span>
          </p>

          <p className="text-xs text-gray-500 mb-3 line-clamp-1">
            <MapPin className="h-3 w-3 inline mr-1" />
            {apartment.address}
          </p>

          <div className="flex gap-3 text-xs text-gray-600">
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
          </div>

          {apartment.aiInsight && (
            <p className="text-xs text-gray-500 mt-3 line-clamp-2 italic">
              "{apartment.aiInsight}"
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}