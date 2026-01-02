import React from 'react';
import { motion } from 'framer-motion';

export default function MapSkeleton() {
  return (
    <div className="relative w-full h-full bg-gray-100 rounded-2xl overflow-hidden">
      {/* Animated pulse effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Fake map elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-500 font-medium">Loading map...</p>
        </div>
      </div>

      {/* Fake markers */}
      <div className="absolute top-20 left-20 w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-gray-300 rounded-full animate-pulse delay-100"></div>
      <div className="absolute bottom-32 left-40 w-8 h-8 bg-gray-300 rounded-full animate-pulse delay-200"></div>
    </div>
  );
}