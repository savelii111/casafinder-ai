import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatInput({ onSend, isLoading, placeholder, language }) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  const placeholders = {
    en: "Search apartments: '2-bedroom in Madrid center under €1200'...",
    es: "Buscar apartamentos: '2 habitaciones en centro de Madrid menos de €1200'...",
    ru: "Поиск квартир: '2-комнатная в центре Мадрида до €1200'..."
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceClick = () => {
    if (isLoading) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert(
        language === 'es' ? 'Búsqueda por voz не поддерживается в этом браузере' :
        language === 'ru' ? 'Голосовой поиск не поддерживается в этом браузере' :
        'Voice search is not supported in this browser'
      );
      return;
    }
    const rec = new SR();
    rec.lang = language === 'es' ? 'es-ES' : language === 'ru' ? 'ru-RU' : 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setIsListening(true);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative"
    >
      <div className="relative glass-card rounded-xl shadow-sm p-2 hover:shadow-md transition-shadow bg-white/90 dark:bg-gray-800/90">
        <button
          type="button"
          onClick={handleVoiceClick}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
          title={language === 'es' ? 'Búsqueda por voz' : language === 'ru' ? 'Голосовой поиск' : 'Voice search'}
        >
          <Mic className={`h-4 w-4 ${isListening ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'}`} />
        </button>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || placeholders[language] || placeholders.en}
          className="min-h-[50px] lg:min-h-[60px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 pl-12 pr-14 text-sm py-3"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isLoading}
          className="absolute right-3 bottom-3 h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black shadow-md"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
          ) : (
            <Send className="h-4 w-4 lg:h-5 lg:w-5" />
          )}
        </Button>
      </div>
    </form>
  );
}