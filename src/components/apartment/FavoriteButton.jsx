import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { celebrateFavorite } from '@/components/utils/confetti';

export default function FavoriteButton({ apartment, userEmail, onUpgradeClick, canSave = false, language = 'en' }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return base44.entities.Favorite.filter({ user_email: userEmail });
    },
    enabled: !!userEmail && canSave
  });

  useEffect(() => {
    if (favorites && apartment) {
      const found = favorites.some(fav => fav.apartment_id === apartment.id);
      setIsFavorited(found);
    }
  }, [favorites, apartment]);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!canSave) {
        onUpgradeClick?.();
        return;
      }

      if (isFavorited) {
        const fav = favorites.find(f => f.apartment_id === apartment.id);
        if (fav) {
          await base44.entities.Favorite.delete(fav.id);
        }
      } else {
        await base44.entities.Favorite.create({
          user_email: userEmail,
          apartment_id: apartment.id
        });
        celebrateFavorite();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      const messages = {
        en: isFavorited ? 'Removed from favorites' : 'Added to favorites!',
        es: isFavorited ? 'Eliminado de favoritos' : '¡Agregado a favoritos!',
        ru: isFavorited ? 'Удалено из избранного' : 'Добавлено в избранное!'
      };
      toast.success(messages[language] || messages.en);
    }
  });

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        toggleMutation.mutate();
      }}
      className={`p-2 rounded-full transition-all ${
        isFavorited 
          ? 'bg-red-500 text-white shadow-lg' 
          : 'bg-white/80 text-gray-600 hover:bg-white'
      }`}
    >
      <Heart 
        className={`h-5 w-5 ${isFavorited ? 'fill-white' : ''}`}
      />
    </motion.button>
  );
}