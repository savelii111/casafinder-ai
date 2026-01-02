import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Bell, Trash2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SearchHistory({ language = 'en', onSearchSelect }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: searches = [] } = useQuery({
    queryKey: ['searchHistory', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.SearchHistory.filter({ user_email: user.email }, '-created_date', 10);
    },
    enabled: !!user?.email
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SearchHistory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
      toast.success('Search removed');
    }
  });

  const toggleAlertMutation = useMutation({
    mutationFn: ({ id, auto_notify }) => 
      base44.entities.SearchHistory.update(id, { auto_notify }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
      toast.success('Alert updated');
    }
  });

  const labels = {
    en: {
      title: 'Recent Searches',
      results: 'results',
      alertOn: 'Alert ON',
      alertOff: 'Alert OFF',
      empty: 'No search history yet'
    },
    es: {
      title: 'Búsquedas Recientes',
      results: 'resultados',
      alertOn: 'Alerta ON',
      alertOff: 'Alerta OFF',
      empty: 'Sin historial de búsqueda'
    },
    ru: {
      title: 'Недавние Поиски',
      results: 'результатов',
      alertOn: 'Уведомления ВКЛ',
      alertOff: 'Уведомления ВЫКЛ',
      empty: 'История поиска пуста'
    }
  };

  const t = labels[language] || labels.en;

  if (searches.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">{t.empty}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {t.title}
      </h3>
      <AnimatePresence>
        {searches.map((search, idx) => (
          <motion.div
            key={search.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="glass-card hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => onSearchSelect?.(search)}
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {search.query}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {search.results_count || 0} {t.results}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(search.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAlertMutation.mutate({ 
                          id: search.id, 
                          auto_notify: !search.auto_notify 
                        });
                      }}
                    >
                      <Bell className={`h-3 w-3 ${search.auto_notify ? 'text-blue-500 fill-blue-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(search.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}