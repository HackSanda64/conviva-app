import { useState } from 'react';

interface ElegantImageProps {
  src: string;
  alt: string;
  className?: string;
  classNameImg?: string;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  [key: string]: any;
}

export function ElegantImage({
  src,
  alt,
  className = "",
  classNameImg = "",
  referrerPolicy = 'no-referrer',
  ...props
}: ElegantImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5F2EB] via-[#FDFBF7] to-[#F5F2EB] bg-[length:200%_100%] animate-shimmer" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'} ${classNameImg}`}
        onLoad={() => setLoaded(true)}
        referrerPolicy={referrerPolicy}
        {...props}
      />
    </div>
  );
}
