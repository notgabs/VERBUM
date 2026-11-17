import React from "react";
import { asset } from "@/utils/asset";

/** Silhueta (gerada no ComfyUI): usa a imagem como máscara e se pinta com a cor do texto do contêiner. */
export function Silhueta({ src, ratio }: { src: string; ratio: number }) {
  const mask = `url(${asset(src)}) center / contain no-repeat`;
  return <span className="block h-full bg-current" style={{ aspectRatio: ratio, maxWidth: "100%", mask, WebkitMask: mask }} />;
}
