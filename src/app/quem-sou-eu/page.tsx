import React from "react";
import { QuemSouEuGame } from "@/components/QuemSouEuGame";
import { AppShell } from "@/components/AppShell";
import creditos from "../../../public/data/quem-sou-eu-creditos.json";
import catalogo from "../../../public/data/quem-sou-eu.json";

/** Nome de cada figura pelo slug da imagem, para listar os créditos. */
const NOMES: Record<string, string> = Object.fromEntries(
  catalogo.map((f) => [f.imagem.replace("/quem-sou-eu/", "").replace(".webp", ""), f.nome])
);
const CREDITOS = Object.entries(creditos as Record<string, { pagina: string; autor: string; licenca: string }>)
  .map(([slug, c]) => ({ slug, nome: NOMES[slug] ?? slug, ...c }))
  .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

export const metadata = {
  title: "Quem Sou Eu?",
  description: "Descubra a figura católica a partir de 6 pistas, da mais difícil à que entrega a resposta.",
};

export default function QuemSouEuPage() {
  return (
    <AppShell
      gameControls
      fitViewport
      infoContent={
        <div className="space-y-8 text-[0.95rem] leading-relaxed text-[var(--color-text-main)]">
          <section className="space-y-3">
            <p>
              Descubra qual é a figura católica secreta usando as pistas reveladas a cada tentativa.
            </p>
            <p>
              Você começa com a <strong>Pista 6</strong>, a mais difícil. A cada palpite errado, a próxima carta se vira, em contagem regressiva, até a <strong>Pista 1</strong>, que praticamente entrega a resposta.
            </p>
            <p>
              Só valem nomes do catálogo: escolha uma das sugestões. Um texto que não corresponde a nenhuma figura não gasta tentativa.
            </p>
            <div className="mt-3 bg-[var(--color-fill)] p-4 rounded-2xl text-sm">
              <p className="mb-2">Você também pode usar o teclado:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><kbd>↑</kbd> e <kbd>↓</kbd> para navegar pelas sugestões;</li>
                <li><kbd>Enter</kbd> para escolher a opção selecionada.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h3>Quem pode aparecer</h3>
            <p>Só figuras da história da Igreja Católica, sem personagens bíblicos:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-2">
              <div className="bg-[var(--color-fill)] p-3 rounded-2xl">
                <strong className="block text-[var(--color-text-main)]">Santos</strong>
                <span className="opacity-90">Mártires, doutores da Igreja, fundadores, místicos e santos do Brasil.</span>
              </div>
              <div className="bg-[var(--color-fill)] p-3 rounded-2xl">
                <strong className="block text-[var(--color-text-main)]">Papas</strong>
                <span className="opacity-90">Sucessores de São Pedro que marcaram a história da Igreja.</span>
              </div>
            </div>
            <p className="text-sm opacity-90">Cada palpite aparece nas 6 vagas de tentativas, com a foto e o nome da figura.</p>
          </section>

          <section className="space-y-3">
            <h3>Ordem das Pistas</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Pistas 6 e 5:</strong> detalhes pouco conhecidos, que dão um rumo para quem conhece bem a Bíblia e a vida dos santos.</li>
              <li><strong>Pistas 4 e 3:</strong> episódios, missão, escritos ou relações importantes.</li>
              <li><strong>Pistas 2 e 1:</strong> os feitos mais famosos. A Pista 1 deixa a resposta na cara.</li>
            </ul>
            <p className="text-sm bg-[var(--color-fill)] p-3 rounded-2xl">
              As pistas foram conferidas em fontes católicas.
            </p>
          </section>

          <section className="space-y-3">
            <h3>Créditos das imagens</h3>
            <p className="text-sm opacity-90">
              Imagens do Wikimedia Commons, recortadas e reduzidas. Clique no nome para ver o original, o autor e a licença.
            </p>
            <details className="bg-[var(--color-fill)] p-3 rounded-2xl text-xs">
              <summary className="cursor-pointer font-bold text-sm">Ver os {CREDITOS.length} créditos</summary>
              <ul className="mt-2 space-y-1.5">
                {CREDITOS.map((c) => (
                  <li key={c.slug}>
                    <a href={c.pagina} target="_blank" rel="noopener noreferrer" className="font-bold underline">{c.nome}</a>
                    {": "}{c.autor || "autor desconhecido"} · {c.licenca}
                  </li>
                ))}
              </ul>
            </details>
          </section>

          <section className="space-y-3">
            <h3>Tentativas</h3>
            <p>Você tem <strong>6 tentativas</strong>. Cinco erros abrem todas as pistas, e depois disso resta apenas <strong>mais 1 tentativa</strong>. Se errar a última, a resposta é revelada e o desafio termina.</p>
          </section>
        </div>
      }
    >
      <QuemSouEuGame />
    </AppShell>
  );
}
