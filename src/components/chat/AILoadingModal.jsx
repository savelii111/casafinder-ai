import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Sparkles } from "lucide-react";

export default function AILoadingModal({ isOpen, message, language = 'en' }) {
  const messages = {
    en: {
      thinking: 'AI is analyzing...',
      analyzing: 'Processing property data...',
      comparing: 'Comparing with market data...',
      translating: 'Translating content...'
    },
    es: {
      thinking: 'IA está analizando...',
      analyzing: 'Procesando datos de propiedad...',
      comparing: 'Comparando con datos del mercado...',
      translating: 'Traduciendo contenido...'
    },
    ru: {
      thinking: 'ИИ анализирует...',
      analyzing: 'Обработка данных недвижимости...',
      comparing: 'Сравнение с рыночными данными...',
      translating: 'Перевод контента...'
    }
  };

  const t = messages[language] || messages.en;
  const displayMessage = message || t.thinking;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="glass-card border-white/30 shadow-2xl max-w-md">
        <div className="flex flex-col items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <Sparkles className="h-12 w-12 text-gray-700" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{displayMessage}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Please wait...</span>
            </div>
          </motion.div>

          <motion.div
            className="mt-6 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}