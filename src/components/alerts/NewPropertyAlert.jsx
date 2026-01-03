import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/components/context/LanguageContext';

export default function NewPropertyAlert({ isOpen, onClose, filters }) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [frequency, setFrequency] = useState('daily');
  const [enabled, setEnabled] = useState(true);

  const labels = {
    en: {
      title: 'Create Property Alert',
      description: 'Get notified when new properties match your search',
      frequency: 'Notification Frequency',
      instant: 'Instant',
      daily: 'Daily Digest',
      weekly: 'Weekly Digest',
      enabled: 'Enable notifications',
      create: 'Create Alert',
      success: 'Alert created successfully!'
    },
    es: {
      title: 'Crear Alerta de Propiedad',
      description: 'Recibe notificaciones cuando nuevas propiedades coincidan',
      frequency: 'Frecuencia de Notificación',
      instant: 'Instantáneo',
      daily: 'Resumen Diario',
      weekly: 'Resumen Semanal',
      enabled: 'Activar notificaciones',
      create: 'Crear Alerta',
      success: '¡Alerta creada exitosamente!'
    },
    ru: {
      title: 'Создать Оповещение',
      description: 'Получайте уведомления о новых подходящих объектах',
      frequency: 'Частота Уведомлений',
      instant: 'Мгновенно',
      daily: 'Ежедневно',
      weekly: 'Еженедельно',
      enabled: 'Включить уведомления',
      create: 'Создать Оповещение',
      success: 'Оповещение создано!'
    }
  };

  const t = labels[language] || labels.en;

  const createAlertMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.EmailAlert.create({
        user_email: user.email,
        alert_type: 'new_properties',
        frequency: data.frequency,
        enabled: data.enabled,
        search_criteria: data.search_criteria
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_alerts'] });
      toast.success(t.success);
      onClose();
    }
  });

  const handleCreate = () => {
    createAlertMutation.mutate({
      frequency,
      enabled,
      search_criteria: filters
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <p className="text-sm text-gray-600">{t.description}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.frequency}</label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">{t.instant}</SelectItem>
                <SelectItem value="daily">{t.daily}</SelectItem>
                <SelectItem value="weekly">{t.weekly}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between glass-card p-3 rounded-lg">
            <span className="text-sm font-medium">{t.enabled}</span>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="glass-card p-3 rounded-lg text-xs text-gray-600">
            <strong>Current filters:</strong>
            <ul className="mt-2 space-y-1">
              {filters.priceMin && <li>• Min price: €{filters.priceMin}</li>}
              {filters.priceMax && <li>• Max price: €{filters.priceMax}</li>}
              {filters.rooms !== 'any' && <li>• Rooms: {filters.rooms}</li>}
              {filters.furnished === 'yes' && <li>• Furnished</li>}
              {filters.pets_allowed === 'yes' && <li>• Pets allowed</li>}
            </ul>
          </div>

          <Button
            className="w-full bg-black hover:bg-gray-800"
            onClick={handleCreate}
            disabled={createAlertMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.create}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}