"use client";

import { useState } from "react";
import Image from "next/image";

type MarketingImageProps = {
  src: string;
  alt: string;
  fallbackLabel: string;
  aspectClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function MarketingImage({
  src,
  alt,
  fallbackLabel,
  aspectClassName = "aspect-video",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: MarketingImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${aspectClassName} bg-slate-200/10 shadow-xl shadow-slate-950/40 ring-1 ring-white/10`}
    >
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200/15 via-slate-300/10 to-slate-400/10 p-6">
          <p className="max-w-xs text-center text-sm font-medium text-slate-100/90">
            {fallbackLabel}
          </p>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

