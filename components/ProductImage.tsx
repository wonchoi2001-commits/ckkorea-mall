"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PLACEHOLDER_IMAGE = "/images/product-placeholder.svg";

export default function ProductImage({
  src,
  alt,
  fill = false,
  className,
  sizes,
  width,
  height,
  priority,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const [imageSrc, setImageSrc] = useState(src || PLACEHOLDER_IMAGE);

  useEffect(() => {
    setImageSrc(src || PLACEHOLDER_IMAGE);
  }, [src]);

  return (
    <Image
      src={imageSrc || PLACEHOLDER_IMAGE}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => {
        if (imageSrc !== PLACEHOLDER_IMAGE) {
          setImageSrc(PLACEHOLDER_IMAGE);
        }
      }}
    />
  );
}
