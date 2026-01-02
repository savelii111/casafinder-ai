import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function ApartmentCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" 
           style={{ backgroundSize: '200% 100%' }} />
      <CardContent className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full"
      />
    </div>
  );
}

export function PropertyModalSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}