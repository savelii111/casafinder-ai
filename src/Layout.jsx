import React from 'react';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { LanguageProvider } from './components/context/LanguageContext';

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
        <style>{`
        :root {
          --background: 0 0% 100%;
          --foreground: 0 0% 3.9%;
          --card: 0 0% 100%;
          --card-foreground: 0 0% 3.9%;
          --primary: 0 0% 9%;
          --primary-foreground: 0 0% 98%;
          --secondary: 0 0% 96.1%;
          --secondary-foreground: 0 0% 9%;
          --muted: 0 0% 96.1%;
          --muted-foreground: 0 0% 45.1%;
          --accent: 0 0% 96.1%;
          --accent-foreground: 0 0% 9%;
          --border: 0 0% 89.8%;
          --ring: 0 0% 3.9%;
          --radius: 0.75rem;
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .leaflet-container {
          height: 100%;
          width: 100%;
          z-index: 1;
        }
        
        .leaflet-pane {
          z-index: 400;
        }
        
        .leaflet-top,
        .leaflet-bottom {
          z-index: 1000;
        }
        
        .custom-price-marker {
          background: transparent;
          border: none;
        }
        
        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        
        /* Shimmer animation */
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        
        /* Glass morphism utilities */
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
        }
        
        .glass-dark {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          }

          /* Dark mode styles */
          .dark {
          color-scheme: dark;
          }

          .dark .glass-card {
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.15);
          }

          .dark .glass-dark {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .dark input,
          .dark textarea,
          .dark select {
          background: rgba(30, 30, 30, 0.95);
          border-color: rgba(255, 255, 255, 0.2);
          color: white;
          }

          .dark input::placeholder,
          .dark textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
          }
          `}</style>
          {children}
          </div>
          </LanguageProvider>
          </ThemeProvider>
          );
          }