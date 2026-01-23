import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../components/utils/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { toast } from 'sonner';

export default function Listings() {
  const [cityFilter, setCityFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch listings from Supabase with auto-refresh every 60s
  const { data: listings = [], isLoading, error } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      console.log('[LISTINGS] Fetching from Supabase...');
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[LISTINGS] Error:', error.message);
        toast.error('Ошибка загрузки');
        throw error;
      }

      console.log(`[LISTINGS] Loaded ${data?.length || 0} rows`);
      return data || [];
    },
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: false
  });

  // Client-side filtering
  const filteredListings = React.useMemo(() => {
    return listings.filter(item => {
      // City filter
      if (cityFilter && !item.city?.toLowerCase().includes(cityFilter.toLowerCase())) {
        return false;
      }
      
      // Price filter
      if (minPrice && item.price < parseFloat(minPrice)) {
        return false;
      }
      if (maxPrice && item.price > parseFloat(maxPrice)) {
        return false;
      }
      
      return true;
    });
  }, [listings, cityFilter, minPrice, maxPrice]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Listings from Supabase</h1>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Город"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Цена от"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Цена до"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <Button 
              variant="outline" 
              onClick={() => {
                setCityFilter('');
                setMinPrice('');
                setMaxPrice('');
              }}
            >
              Сбросить
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Показано: {filteredListings.length} из {listings.length}
          </div>
        </CardContent>
      </Card>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            Нет данных
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {listing.images && listing.images.length > 0 && (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{listing.title}</h3>
                
                <div className="space-y-1 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Цена:</span>
                    <span className="font-semibold">
                      {listing.price?.toLocaleString()} {listing.currency || 'EUR'}
                    </span>
                  </div>
                  
                  {listing.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Город:</span>
                      <span>{listing.city}</span>
                    </div>
                  )}
                  
                  {listing.rooms && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Комнаты:</span>
                      <span>{listing.rooms}</span>
                    </div>
                  )}
                  
                  {listing.bathrooms && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ванные:</span>
                      <span>{listing.bathrooms}</span>
                    </div>
                  )}
                  
                  {listing.surface && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Площадь:</span>
                      <span>{listing.surface} m²</span>
                    </div>
                  )}
                  
                  {listing.created_at && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Добавлено:</span>
                      <span>{new Date(listing.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                </div>
                
                {listing.url && (
                  <a 
                    href={listing.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Открыть объявление <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}