import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, ArrowLeft, Trash2, MapPin, Home as HomeIcon,
  SortAsc, Calendar, GripVertical, FolderPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ApartmentCard from '@/components/apartment/ApartmentCard';
import PropertyModal from '@/components/apartment/PropertyModal';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { useFeatureAccess } from '@/components/subscription/SubscriptionManager';
import { useLanguage } from '@/components/context/LanguageContext';
import { toast } from 'sonner';

export default function Favorites() {
  const { language } = useLanguage();
  const [sortBy, setSortBy] = useState('date');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [draggedItems, setDraggedItems] = useState([]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.UserSubscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const { plan, canSaveFavorites } = useFeatureAccess();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Favorite.filter({ user_email: user.email });
    },
    enabled: !!user?.email && canSaveFavorites
  });

  const { data: apartments = [] } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list(),
  });

  const favoriteApartments = apartments.filter(apt => 
    favorites.some(fav => fav.apartment_id === apt.id)
  );

  const sortedApartments = [...favoriteApartments].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'date') {
      const favA = favorites.find(f => f.apartment_id === a.id);
      const favB = favorites.find(f => f.apartment_id === b.id);
      return new Date(favB.created_date) - new Date(favA.created_date);
    }
    return 0;
  });

  const labels = {
    en: {
      title: 'My Favorites',
      backToHome: 'Back to Home',
      noFavorites: 'No favorites yet',
      startExploring: 'Start exploring properties to add favorites',
      sortBy: 'Sort by',
      price: 'Price',
      dateAdded: 'Date Added',
      upgrade: 'Upgrade to save favorites'
    },
    es: {
      title: 'Mis Favoritos',
      backToHome: 'Volver al Inicio',
      noFavorites: 'Sin favoritos aún',
      startExploring: 'Comienza a explorar propiedades para agregar favoritos',
      sortBy: 'Ordenar por',
      price: 'Precio',
      dateAdded: 'Fecha Agregada',
      upgrade: 'Mejora para guardar favoritos'
    },
    ru: {
      title: 'Мое Избранное',
      backToHome: 'Назад на Главную',
      noFavorites: 'Пока нет избранного',
      startExploring: 'Начните изучать недвижимость, чтобы добавить в избранное',
      sortBy: 'Сортировать по',
      price: 'Цене',
      dateAdded: 'Дате Добавления',
      upgrade: 'Улучшите план для сохранения избранного'
    }
  };

  const t = labels[language] || labels.en;

  const deleteMutation = useMutation({
    mutationFn: (favoriteId) => base44.entities.Favorite.delete(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sortedApartments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDraggedItems(items);
  };

  const handleRemoveFavorite = (apartmentId) => {
    const favorite = favorites.find(f => f.apartment_id === apartmentId);
    if (favorite) {
      deleteMutation.mutate(favorite.id);
    }
  };

  if (!canSaveFavorites) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t.backToHome}
            </Button>
          </Link>
          <div className="glass-card rounded-2xl p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.upgrade}</h2>
            <p className="text-gray-600 mb-6">Upgrade to Pro to save your favorite properties</p>
            <Link to={createPageUrl('Subscription')}>
              <Button className="bg-black hover:bg-gray-800">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            {t.backToHome}
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              {t.title}
            </h1>
            <p className="text-gray-600 mt-2">
              {favoriteApartments.length} {favoriteApartments.length === 1 ? 'property' : 'properties'}
            </p>
          </div>

          {favoriteApartments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t.sortBy}:</span>
              <Button
                variant={sortBy === 'date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('date')}
                className="gap-1"
              >
                <Calendar className="h-3 w-3" />
                {t.dateAdded}
              </Button>
              <Button
                variant={sortBy === 'price-asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('price-asc')}
                className="gap-1"
              >
                <SortAsc className="h-3 w-3" />
                {t.price}
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <SkeletonLoader count={3} />
        ) : favoriteApartments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.noFavorites}</h2>
            <p className="text-gray-600 mb-6">{t.startExploring}</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-black hover:bg-gray-800">
                <HomeIcon className="h-4 w-4 mr-2" />
                Explore Properties
              </Button>
            </Link>
          </motion.div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="favorites">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {(draggedItems.length > 0 ? draggedItems : sortedApartments).map((apartment, index) => (
                    <Draggable key={apartment.id} draggableId={apartment.id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -5 }}
                          className={snapshot.isDragging ? 'opacity-50' : ''}
                        >
                          <div className="relative group">
                            <div 
                              {...provided.dragHandleProps}
                              className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg p-2 shadow-lg z-10 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -right-3 -top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-lg z-10 hover:bg-red-50"
                              onClick={() => handleRemoveFavorite(apartment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <ApartmentCard
                              apartment={apartment}
                              onClick={() => {
                                setSelectedApartment(apartment);
                                setShowPropertyModal(true);
                              }}
                              language={language}
                            />
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <PropertyModal
        apartment={selectedApartment}
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        language={language}
        userPlan={plan}
      />
    </div>
  );
}