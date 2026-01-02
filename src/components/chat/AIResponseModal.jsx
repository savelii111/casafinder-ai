import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AIResponseModal({ isOpen, onClose, title, response, language = 'en' }) {
  const [copied, setCopied] = React.useState(false);

  const labels = {
    en: { close: 'Close', copy: 'Copy Response', copied: 'Copied!' },
    es: { close: 'Cerrar', copy: 'Copiar Respuesta', copied: '¡Copiado!' },
    ru: { close: 'Закрыть', copy: 'Копировать Ответ', copied: 'Скопировано!' }
  };

  const t = labels[language] || labels.en;

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success(t.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/30 shadow-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gray-700" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="glass-card rounded-xl p-5 mb-4 shadow-lg">
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">
              {response}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex-1 gap-2 glass-card hover:shadow-lg transition-all duration-300"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {t.copied}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {t.copy}
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-black hover:bg-gray-800"
            >
              {t.close}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}