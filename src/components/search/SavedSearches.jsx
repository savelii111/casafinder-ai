import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function SavedSearches({ language = 'en', onLoadSearch }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: searches = [] } = useQuery({
    queryKey: ['savedSearches', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.SearchHistory.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const toggleNotifyMutation = useMutation({
    mutationFn: async ({ id, currentStatus }) => {
      await base44.entities.SearchHistory.update(id, {
        auto_notify: !currentStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      toast.success(language === 'es' ? 'Actualizado' : language === 'ru' ? 'Обновлено' : 'Updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.SearchHistory.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      toast.success(language === 'es' ? 'Eliminado' : language === 'ru' ? 'Удалено' : 'Deleted');
    }
  });

  const labels = {
    en: { title: 'Saved Searches', results: 'results', notify: 'Notify', load: 'Load' },
    es: { title: 'Búsquedas Guardadas', results: 'resultados', notify: 'Notificar', load: 'Cargar' },
    ru: { title: 'Сохраненные Поиски', results: 'результатов', notify: 'Уведомления', load: 'Загрузить' }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.title}</h3>
      
      {searches.slice(0, 5).map((search) => (
        <Card key={search.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{search.query}</p>
              <Badge variant="outline" className="mt-1">
                {search.results_count} {t.results}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleNotifyMutation.mutate({ 
                  id: search.id, 
                  currentStatus: search.auto_notify 
                })}
              >
                {search.auto_notify ? (
                  <Bell className="h-4 w-4 text-blue-500" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onLoadSearch(search)}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteMutation.mutate(search.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}