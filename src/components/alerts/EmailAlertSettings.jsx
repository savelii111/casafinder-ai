import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

export default function EmailAlertSettings({ language = 'en' }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['emailAlerts', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.EmailAlert.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailAlert.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailAlerts'] });
      toast.success('Alert created');
    }
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailAlert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailAlerts'] });
      toast.success('Alert updated');
    }
  });

  const labels = {
    en: {
      title: 'Email Alerts',
      newProperties: 'New Properties',
      priceChanges: 'Price Changes',
      savedSearches: 'Saved Search Matches',
      favoritesUpdates: 'Favorites Updates',
      frequency: 'Frequency',
      instant: 'Instant',
      daily: 'Daily',
      weekly: 'Weekly'
    },
    es: {
      title: 'Alertas por Email',
      newProperties: 'Nuevas Propiedades',
      priceChanges: 'Cambios de Precio',
      savedSearches: 'Búsquedas Guardadas',
      favoritesUpdates: 'Actualizaciones de Favoritos',
      frequency: 'Frecuencia',
      instant: 'Instantáneo',
      daily: 'Diario',
      weekly: 'Semanal'
    },
    ru: {
      title: 'Email Уведомления',
      newProperties: 'Новые Объекты',
      priceChanges: 'Изменения Цен',
      savedSearches: 'Сохранённые Поиски',
      favoritesUpdates: 'Обновления Избранного',
      frequency: 'Частота',
      instant: 'Мгновенно',
      daily: 'Ежедневно',
      weekly: 'Еженедельно'
    }
  };

  const t = labels[language] || labels.en;

  const alertTypes = [
    { key: 'new_properties', label: t.newProperties },
    { key: 'price_changes', label: t.priceChanges },
    { key: 'saved_search', label: t.savedSearches },
    { key: 'favorites_update', label: t.favoritesUpdates }
  ];

  const getAlert = (type) => alerts.find(a => a.alert_type === type);

  const handleToggle = (type) => {
    const alert = getAlert(type);
    if (alert) {
      updateAlertMutation.mutate({
        id: alert.id,
        data: { enabled: !alert.enabled }
      });
    } else {
      createAlertMutation.mutate({
        user_email: user.email,
        alert_type: type,
        frequency: 'daily',
        enabled: true
      });
    }
  };

  const handleFrequencyChange = (type, frequency) => {
    const alert = getAlert(type);
    if (alert) {
      updateAlertMutation.mutate({
        id: alert.id,
        data: { frequency }
      });
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alertTypes.map(({ key, label }) => {
          const alert = getAlert(key);
          const isEnabled = alert?.enabled || false;

          return (
            <div key={key} className="flex items-center justify-between pb-4 border-b last:border-0">
              <div className="flex-1">
                <p className="font-medium text-sm">{label}</p>
              </div>
              <div className="flex items-center gap-3">
                {isEnabled && (
                  <Select
                    value={alert?.frequency || 'daily'}
                    onValueChange={(val) => handleFrequencyChange(key, val)}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">{t.instant}</SelectItem>
                      <SelectItem value="daily">{t.daily}</SelectItem>
                      <SelectItem value="weekly">{t.weekly}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(key)}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}