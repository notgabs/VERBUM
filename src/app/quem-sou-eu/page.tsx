import React from "react";
import { QuemSouEuGame } from "@/components/QuemSouEuGame";
import { MonasteryBackground } from "@/components/MonasteryBackground";

export const metadata = {
  title: "Quem Sou Eu? | Verbum",
  description: "Descubra a figura católica a partir de 6 dicas.",
};

export default function QuemSouEuPage() {
  return (
    <MonasteryBackground
      showBackButton={true}
      infoContent={
        <div className="space-y-4 text-[0.95rem] leading-relaxed text-[var(--color-text-main)] font-medium">
          <p>
            Descubra qual é a figura católica (Bíblica, Santo, Papa ou Anjo) por trás das pistas.
          </p>
          <p>
            Você recebe uma pista por vez. Se errar o palpite, uma nova pista é revelada, até o máximo de 6 pistas.
          </p>
          <p>
            O jogo não possui limite de tentativas.
          </p>
        </div>
      }
    >
      <QuemSouEuGame />
    </MonasteryBackground>
  );
}
