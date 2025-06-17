'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';

interface SafeImageProps extends ImageProps {
  fallbackSrc: string;
  alt: string;
}

const SafeImage = (props: SafeImageProps) => {
  const { src, fallbackSrc, alt, ...rest } = props;
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  return (
    <Image
      {...rest}
      alt={alt}
      src={error ? fallbackSrc : src || fallbackSrc}
      onError={() => {
        setError(true);
      }}
    />
  );
};

export default SafeImage; 