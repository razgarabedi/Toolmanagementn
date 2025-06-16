'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';

interface SafeImageProps extends ImageProps {
  fallbackSrc: string;
}

const SafeImage = (props: SafeImageProps) => {
  const { src, fallbackSrc, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...rest}
      src={imgSrc || fallbackSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default SafeImage; 