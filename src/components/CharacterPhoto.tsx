"use client";

import React from "react";
import { asset } from "@/utils/asset";

interface CharacterPhotoProps {
  id?: string;
  image?: string;
  alt: string;
  className?: string;
}

export const CharacterPhoto: React.FC<CharacterPhotoProps> = ({ id, image, alt, className }) => (
  <img
    src={asset(image ?? (id ? `/personagens/${id}.webp` : "/cubo-interrogacao.webp"))}
    alt={alt}
    loading="lazy"
    decoding="async"
    className={className}
    onError={(event) => { event.currentTarget.src = asset("/cubo-interrogacao.webp"); }}
  />
);
