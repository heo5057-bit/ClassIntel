"use client";

import { useState } from "react";
import Image from "next/image";

type MarketingImageProps = {
  src: string;
  alt: string;
  fallbackLabel: string;
  aspectClassName?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function MarketingImage({
  src,
  alt,
  fallbackLabel,
  aspectClassName = "aspect-video",
  imageClassName = "object-cover object-center",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: MarketingImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${aspectClassName} bg-slate-200/10 shadow-xl shadow-slate-950/40 ring-1 ring-white/10`}
    >
      {hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          className={imageClassName}
          aria-label={fallbackLabel}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={imageClassName}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
