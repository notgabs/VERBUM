"use client";

import React from "react";

interface CharacterPhotoProps {
  id?: string;
  image?: string;
  alt: string;
  className?: string;
}

export const CharacterPhoto: React.FC<CharacterPhotoProps> = ({
  id,
  image,
  alt,
  className,
}) => {
  return (
    <img
      src={image ?? (id ? `/personagens/${id}.png` : "/cubo-interrogacao.svg")}
      alt={alt}
      className={`pixelated ${className ?? ""}`}
      onError={(event) => { event.currentTarget.src = "/cubo-interrogacao.svg"; }}
    />
  );
};
