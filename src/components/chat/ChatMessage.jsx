import React from 'react';
import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`flex-shrink-0 w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-black dark:bg-white text-white dark:text-black' 
          : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
      }`}>
        {isUser ? <User className="h-3 w-3 lg:h-4 lg:w-4" /> : <Sparkles className="h-3 w-3 lg:h-4 lg:w-4" />}
      </div>
      
      <div className={`max-w-[85%] lg:max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-3 py-2 lg:px-4 lg:py-3 rounded-xl lg:rounded-2xl transition-all ${
          isUser 
            ? 'bg-black dark:bg-white text-white dark:text-black rounded-tr-sm shadow-md' 
            : 'glass-card dark:bg-gray-800/90 rounded-tl-sm text-gray-800 dark:text-gray-200 shadow-md border border-gray-200 dark:border-gray-700'
        }`}>
          {isUser ? (
            <p className="text-xs lg:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown 
              className="text-xs lg:text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
              components={{
                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                a: ({ children, ...props }) => (
                  <a {...props} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  );
}