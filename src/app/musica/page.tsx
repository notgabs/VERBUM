import React from "react";
import { MusicGame } from "@/components/MusicGame";
import { AppShell } from "@/components/AppShell";

export const metadata = {
  title: "Acerte a Música",
  description: "Descubra o louvor ouvindo trechos cada vez maiores: de 0,2 s a 20 s.",
};

export default function MusicaPage() {
  return (
    <AppShell
      gameControls
      fitViewport
      infoContent={
        <div className="space-y-8 text-[0.95rem] leading-relaxed text-[var(--color-text-main)]">
          <section className="space-y-3">
            <p>Descubra qual é o louvor ouvindo só o começo dele.</p>
            <p>
              Aperte o botão para ouvir o trecho liberado. Você começa com <strong>0,2 segundo</strong>. A cada palpite errado, ou se você
              pular, o trecho cresce: 0,2 s, 0,5 s, 1 s, 1,5 s, 2 s, 5 s, 10 s e 20 s.
            </p>
            <p>São <strong>8 tentativas</strong>. Se errar a última, com 20 s de música, a resposta é revelada.</p>
            <p>Só valem músicas da lista: escolha uma das sugestões. Pode buscar pelo nome da música ou do artista.</p>
          </section>

          <section className="space-y-3">
            <h3>Ouça completa</h3>
            <p>No fim, aparecem a capa, o artista e links para ouvir a música inteira no Spotify, no YouTube e no Deezer.</p>
          </section>

          <section className="space-y-3">
            <h3>De onde vêm os trechos</h3>
            <p className="text-sm opacity-90">
              Os trechos são a prévia oficial de cada faixa no Deezer, tocada direto do Deezer. O jogo usa só os primeiros 20 segundos dela,
              para divulgar os louvores e seus artistas. Os direitos das músicas pertencem aos autores e às gravadoras.
            </p>
          </section>
        </div>
      }
    >
      <MusicGame />
    </AppShell>
  );
}
