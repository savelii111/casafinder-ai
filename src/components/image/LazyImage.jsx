import React, { useState, useEffect, useRef } from 'react';

export default function LazyImage({ src, alt, className, placeholder = '/placeholder.jpg' }) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef();

  useEffect(() => {
    let observer;
    
    if (imgRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = new Image();
              img.src = src;
              img.onload = () => {
                setImageSrc(src);
                setIsLoading(false);
              };
              img.onerror = () => {
                setImageSrc(placeholder);
                setIsLoading(false);
              };
              observer.disconnect();
            }
          });
        },
        { rootMargin: '50px' }
      );
      
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [src, placeholder]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
    />
  );
}