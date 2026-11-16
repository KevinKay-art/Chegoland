import React, { useState } from 'react';
import { Milk } from 'lucide-react';

interface FarmImageProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  fallbackTitle?: string;
}

export function FarmImage({
  src,
  alt,
  className = '',
  eager = false,
  fallbackTitle,
}: FarmImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E8F5E9] via-[#FFF8E7] to-[#E3F2FD] text-[#2E7D32] p-4 text-center ${className}`}
      >
        <Milk className="w-8 h-8 mb-2 opacity-80" aria-hidden="true" />
        <span className="text-xs font-medium text-[#3E2723]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
