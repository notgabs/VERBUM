"use client";

import React from "react";
import { MonasteryBackground } from "@/components/MonasteryBackground";
import { CharacterGame } from "@/components/CharacterGame";

export default function PersonagemPage() {
  return (
    <MonasteryBackground
      showBackButton={true}
      logoMessage={
        <div className="border-2 border-[#2875a8] bg-[#174d78]/90 px-5 py-6 text-center text-sm leading-relaxed text-[#f4ecd8] shadow-inner">
          <div className="mb-4 text-[#f5c458]">✦ ✦ ✦</div>
          <p>
            Como vocês podem perceber, este jogo é totalmente inspirado nos
            jogos de navegador mais famosos, então o modo clássico não poderia
            faltar!
          </p>
          <p className="mt-4">
            Particularmente, é o meu favorito. Ele nos incentiva a enxergar a
            Bíblia de uma forma diferente, já que muitas pessoas têm uma visão
            limitada sobre ela e não conhecem todos os seus personagens.
          </p>
          <p className="mt-4">
            O jogo é uma maneira de despertar a curiosidade e incentivar todo
            mundo a buscar mais pela Palavra.
          </p>
          <div className="mt-5 text-xs italic text-[#d4b996]">
            feito com carinho ✦
          </div>
        </div>
      }
      infoContent={
        <div className="space-y-4 text-sm leading-relaxed text-[#f4ecd8]">
          <p>
            Descubra qual é o personagem bíblico secreto usando as pistas de
            cada tentativa.
          </p>
          <div>
            <h3 className="mb-1 font-black uppercase text-[#f5c458]">Como responder</h3>
            <p>
              Digite um nome na busca e escolha um personagem. A tabela mostra
              como os atributos dele se comparam ao personagem secreto.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-black uppercase text-[#f5c458]">Cores</h3>
            <ul className="space-y-1">
              <li><span className="inline-block h-3 w-3 bg-[#2b7a35] align-middle" /> Verde: atributo correto.</li>
              <li>
                <span className="inline-block h-3 w-3 bg-[#b57a0d] align-middle" />
                {" "}Amarelo: atributo parcialmente compatível. Exemplo: &quot;Rei&quot;
                {" "}e &quot;Rainha&quot; pertencem à mesma categoria de ocupação.
              </li>
              <li><span className="inline-block h-3 w-3 bg-[#8f2020] align-middle" /> Vermelho: atributo incorreto.</li>
            </ul>
          </div>
          <p>
            Nas colunas de história e nascimento, a seta indica se o personagem
            secreto está antes ou depois da sua tentativa.
          </p>
          <p>
            Depois de 6 e 12 tentativas, as dicas ficam disponíveis no topo da tela.
          </p>
        </div>
      }
    >
      <CharacterGame />
    </MonasteryBackground>
  );
}
