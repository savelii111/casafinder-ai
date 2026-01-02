import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { celebrateLead } from '@/components/utils/confetti';

export default function LeadGenerationModal({ 
  isOpen, 
  onClose, 
  apartment,
  language = 'en'
}) {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    transferNeeded: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const labels = {
    en: {
      title: 'Hire AI Agent to Verify Property',
      subtitle: 'Our AI concierge will verify this property and contact you via WhatsApp',
      name: 'Your Name',
      whatsapp: 'WhatsApp Number',
      transferNeeded: 'I need transfer assistance',
      submit: 'Start AI Verification',
      submitting: 'Connecting...',
      success: 'AI Agent Started!',
      successMsg: 'Expect a WhatsApp message within 10 minutes with property verification and details.'
    },
    es: {
      title: 'Contratar Agente IA para Verificar Propiedad',
      subtitle: 'Nuestro conserje IA verificará esta propiedad y te contactará por WhatsApp',
      name: 'Tu Nombre',
      whatsapp: 'Número de WhatsApp',
      transferNeeded: 'Necesito asistencia con traslado',
      submit: 'Iniciar Verificación IA',
      submitting: 'Conectando...',
      success: '¡Agente IA Iniciado!',
      successMsg: 'Espera un mensaje de WhatsApp en 10 minutos con la verificación y detalles.'
    },
    ru: {
      title: 'Нанять AI Агента для Проверки Недвижимости',
      subtitle: 'Наш AI консьерж проверит эту квартиру и свяжется с вами через WhatsApp',
      name: 'Ваше Имя',
      whatsapp: 'Номер WhatsApp',
      transferNeeded: 'Мне нужна помощь с переездом',
      submit: 'Начать AI Проверку',
      submitting: 'Подключение...',
      success: 'AI Агент Запущен!',
      successMsg: 'Ожидайте сообщение в WhatsApp в течение 10 минут с проверкой и деталями.'
    }
  };

  const t = labels[language] || labels.en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call to create lead
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would:
      // 1. Save lead to database
      // 2. Trigger WhatsApp notification via integration
      // 3. Create AI agent task
      
      setIsSuccess(true);
      celebrateLead();
      
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ name: '', whatsapp: '', transferNeeded: false });
      }, 3000);
    } catch (error) {
      console.error('Lead submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border-white/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">{t.subtitle}</p>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 mt-4"
            >
              {apartment && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-gray-900">{apartment.title}</p>
                  <p className="text-gray-600">{apartment.address}</p>
                  <p className="font-bold text-black mt-1">€{apartment.price}/mo</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">{t.whatsapp}</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+34 123 456 789"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transfer"
                  checked={formData.transferNeeded}
                  onCheckedChange={(checked) => setFormData({ ...formData, transferNeeded: checked })}
                  disabled={isSubmitting}
                />
                <Label htmlFor="transfer" className="text-sm cursor-pointer">
                  {t.transferNeeded}
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  t.submit
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h3>
              <p className="text-gray-600">{t.successMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}