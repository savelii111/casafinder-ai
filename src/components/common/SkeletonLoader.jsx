import React from 'react';
import { motion } from 'framer-motion';

export default function SkeletonLoader({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl overflow-hidden"
        >
          {/* Image skeleton with shimmer */}
          <div className="relative h-36 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%]" />
          
          <div className="p-4 space-y-3">
            {/* Title skeleton */}
            <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%] rounded w-3/4" />
            
            {/* Price skeleton */}
            <div className="h-6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%] rounded w-1/2" />
            
            {/* Address skeleton */}
            <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%] rounded w-full" />
            
            {/* Details skeleton */}
            <div className="flex gap-3">
              <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%] rounded w-16" />
              <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%] rounded w-16" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}