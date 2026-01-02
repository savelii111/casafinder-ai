import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatInput({ onSend, isLoading, placeholder, language }) {
  const [message, setMessage] = useState('');

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

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative glass-card rounded-2xl shadow-xl p-2 hover:shadow-2xl transition-shadow duration-300">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || placeholders[language] || placeholders.en}
          className="min-h-[60px] max-h-[150px] resize-none border-0 bg-transparent focus-visible:ring-0 text-gray-800 placeholder:text-gray-400 pr-14"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isLoading}
          className="absolute right-4 bottom-4 h-10 w-10 rounded-xl bg-black hover:bg-gray-800 text-white shadow-lg transition-all duration-300"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </motion.form>
  );
}