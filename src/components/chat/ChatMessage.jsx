import React from 'react';
import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";

export default function ChatMessage({ message, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-black text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-gray-600" />}
      </div>
      
      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl transition-all duration-300 ${
          isUser 
            ? 'glass-dark text-white rounded-tr-sm shadow-lg' 
            : 'glass-card rounded-tl-sm text-gray-800 shadow-lg hover:shadow-xl'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </motion.div>
  );
}