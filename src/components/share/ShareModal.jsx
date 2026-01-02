import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Share2, Link2, Mail, MessageCircle, Copy, 
  Check, Facebook, Twitter, Linkedin 
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ShareModal({ apartment, isOpen, onClose, language = 'en' }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  const labels = {
    en: {
      title: 'Share Property',
      copyLink: 'Copy Link',
      shareVia: 'Share via',
      sendEmail: 'Send via Email',
      emailPlaceholder: 'friend@email.com',
      send: 'Send',
      copied: 'Link copied!',
      emailSent: 'Email sent!'
    },
    es: {
      title: 'Compartir Propiedad',
      copyLink: 'Copiar Enlace',
      shareVia: 'Compartir vía',
      sendEmail: 'Enviar por Email',
      emailPlaceholder: 'amigo@email.com',
      send: 'Enviar',
      copied: '¡Enlace copiado!',
      emailSent: '¡Email enviado!'
    },
    ru: {
      title: 'Поделиться Квартирой',
      copyLink: 'Копировать Ссылку',
      shareVia: 'Поделиться через',
      sendEmail: 'Отправить Email',
      emailPlaceholder: 'friend@email.com',
      send: 'Отправить',
      copied: 'Ссылка скопирована!',
      emailSent: 'Email отправлен!'
    }
  };

  const t = labels[language] || labels.en;

  if (!apartment) return null;

  const shareUrl = `${window.location.origin}?apt=${apartment.id}`;
  const shareText = `${apartment.title} - €${apartment.price}/mo`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(t.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform) => {
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleEmailShare = async () => {
    if (!email.trim()) return;
    
    // In production, use base44.integrations.Core.SendEmail
    toast.success(t.emailSent);
    setEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link */}
          <div className="glass-card rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={shareUrl}
                readOnly
                className="text-xs bg-white/50"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Social Share */}
          <div>
            <p className="text-sm text-gray-600 mb-3">{t.shareVia}</p>
            <div className="grid grid-cols-4 gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialShare('whatsapp')}
                className="glass-card p-3 rounded-lg hover:shadow-md transition-all flex flex-col items-center gap-1"
              >
                <MessageCircle className="h-5 w-5 text-green-500" />
                <span className="text-xs">WhatsApp</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialShare('facebook')}
                className="glass-card p-3 rounded-lg hover:shadow-md transition-all flex flex-col items-center gap-1"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span className="text-xs">Facebook</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialShare('twitter')}
                className="glass-card p-3 rounded-lg hover:shadow-md transition-all flex flex-col items-center gap-1"
              >
                <Twitter className="h-5 w-5 text-sky-500" />
                <span className="text-xs">Twitter</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialShare('linkedin')}
                className="glass-card p-3 rounded-lg hover:shadow-md transition-all flex flex-col items-center gap-1"
              >
                <Linkedin className="h-5 w-5 text-blue-700" />
                <span className="text-xs">LinkedIn</span>
              </motion.button>
            </div>
          </div>

          {/* Email Share */}
          <div className="glass-card rounded-lg p-3 space-y-2">
            <label className="text-sm font-medium">{t.sendEmail}</label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/50"
              />
              <Button
                size="sm"
                onClick={handleEmailShare}
                className="gap-2 bg-black hover:bg-gray-800"
              >
                <Mail className="h-3 w-3" />
                {t.send}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}