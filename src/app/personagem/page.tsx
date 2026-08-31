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
        <div className="space-y-8 text-[0.95rem] leading-relaxed text-[var(--color-text-main)] font-medium">
          <section>
            <p>
              Descubra qual é o personagem bíblico secreto usando as informações reveladas a cada tentativa.
            </p>
            <p className="mt-3">
              Digite o nome de um personagem no campo de busca e selecione uma das sugestões.
            </p>
            <div className="mt-3 bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
              <p className="mb-2">Você também pode usar o teclado:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><kbd className="font-sans px-1 border border-gray-300 rounded shadow-sm bg-gray-50">↑</kbd> e <kbd className="font-sans px-1 border border-gray-300 rounded shadow-sm bg-gray-50">↓</kbd> para navegar pelas sugestões;</li>
                <li><kbd className="font-sans px-1 border border-gray-300 rounded shadow-sm bg-gray-50">Enter</kbd> para escolher a opção selecionada;</li>
                <li>se nenhuma opção estiver selecionada, <kbd className="font-sans px-1 border border-gray-300 rounded shadow-sm bg-gray-50">Enter</kbd> escolhe a primeira sugestão da lista.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-sans font-bold uppercase tracking-wider text-[var(--color-text-accent)] text-base border-b border-[var(--color-border-subtle)] pb-1">Como ler as cores</h3>
            <p>Cada coluna compara o personagem escolhido com o personagem secreto.</p>

            <div className="space-y-4 mt-4">
              <div>
                <h4 className="flex items-center gap-2 font-bold uppercase text-[var(--color-status-correct)]">
                  <span className="inline-block h-4 w-4 rounded-sm bg-[var(--color-status-correct)] shadow-sm" /> 
                  Verde
                </h4>
                <p className="mt-1">A informação está correta.</p>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-bold uppercase text-[var(--color-status-partial)]">
                  <span className="inline-block h-4 w-4 rounded-sm bg-[var(--color-status-partial)] shadow-sm" /> 
                  Amarelo
                </h4>
                <p className="mt-1">A informação está parcialmente correta.</p>
                <div className="mt-2 text-sm bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                  Para a coluna Ocupação, o amarelo pode aparecer quando:
                  <ul className="list-disc pl-5 mt-1 mb-2">
                    <li>as ocupações compartilham uma função em comum;</li>
                    <li>ou pertencem ao mesmo grupo de funções.</li>
                  </ul>
                  <strong>Exemplos:</strong><br/>
                  <code className="bg-black/5 px-1 rounded text-[var(--color-text-main)] font-mono">Profeta e Sacerdote</code> × <code className="bg-black/5 px-1 rounded text-[var(--color-text-main)] font-mono">Sacerdote</code> → AMARELO<br/>
                  <code className="bg-black/5 px-1 rounded text-[var(--color-text-main)] font-mono">Rei</code> × <code className="bg-black/5 px-1 rounded text-[var(--color-text-main)] font-mono">Rainha</code> → AMARELO
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-bold uppercase text-[var(--color-status-wrong)]">
                  <span className="inline-block h-4 w-4 rounded-sm bg-[var(--color-status-wrong)] shadow-sm" /> 
                  Vermelho
                </h4>
                <p className="mt-1">A informação não corresponde.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-sans font-bold uppercase tracking-wider text-[var(--color-text-accent)] text-base border-b border-[var(--color-border-subtle)] pb-1">Setas</h3>
            <p>Algumas colunas também utilizam setas para indicar a direção da resposta.</p>

            <div className="mt-4">
              <h4 className="font-bold text-[var(--color-text-main)] mb-2">HISTÓRIA NA BÍBLIA</h4>
              <p className="mb-3">Esta coluna compara a localização bíblica dos personagens na ordem católica:</p>
              
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong className="text-[var(--color-status-correct)]">Verde:</strong> mesma história/referência exata.</li>
                <li><strong className="text-[var(--color-status-partial)]">Amarelo:</strong> estão no mesmo livro (mas com história diferente) <strong>OU</strong> os livros estão próximos (até 2 posições de distância).</li>
                <li><strong className="text-[var(--color-status-wrong)]">Vermelho:</strong> os livros estão mais distantes.</li>
              </ul>

              <p>As setas indicam a direção na Bíblia:</p>
              <div className="mt-3 space-y-3">
                <div className="bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                  <h4 className="font-bold mb-1"><span className="text-[var(--color-text-accent)] text-lg">↑</span> SETA PARA CIMA</h4>
                  <p>A resposta está <strong>mais antes</strong> na ordem da Bíblia.</p>
                </div>
                <div className="bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                  <h4 className="font-bold mb-1"><span className="text-[var(--color-text-accent)] text-lg">↓</span> SETA PARA BAIXO</h4>
                  <p>A resposta está <strong>mais depois</strong> na ordem da Bíblia.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-sans font-bold uppercase tracking-wider text-[var(--color-text-accent)] text-base border-b border-[var(--color-border-subtle)] pb-1">Nascimento</h3>
            <p>A coluna de nascimento também utiliza setas.</p>
            <div className="space-y-2">
              <div className="flex gap-3 items-center">
                <span className="font-bold text-[var(--color-text-accent)] text-xl w-6 text-center">↑</span>
                <p>O personagem secreto nasceu em uma época mais <strong>recente</strong>.</p>
              </div>
              <div className="flex gap-3 items-center">
                <span className="font-bold text-[var(--color-text-accent)] text-xl w-6 text-center">↓</span>
                <p>O personagem secreto nasceu em uma época mais <strong>antiga</strong>.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-sans font-bold uppercase tracking-wider text-[var(--color-text-accent)] text-base border-b border-[var(--color-border-subtle)] pb-1">Grupos de Ocupação</h3>
            <p>Algumas funções são relacionadas entre si. Se duas ocupações pertencem ao mesmo grupo, a coluna pode ficar amarela.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <strong className="block text-[var(--color-text-accent)]">Realeza</strong>
                <span className="opacity-90">Rei, Rainha, Imperador, Imperador Romano e Faraó</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Militar</strong>
                <span className="opacity-90">Guerreiro, Soldado, General, Comandante e Líder militar</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Liderança</strong>
                <span className="opacity-90">Líder, Governador, Líder militar, Administrador, Conselheiro, Patriarca e Ancião</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Profético</strong>
                <span className="opacity-90">Profeta e Profetisa</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Sacerdotal</strong>
                <span className="opacity-90">Sacerdote, Sumo Sacerdote, Levita, Diácono, Diaconisa e Chefe religioso</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Seguidores de Jesus</strong>
                <span className="opacity-90">Apóstolo, Discípulo e Discípula</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Judicial</strong>
                <span className="opacity-90">Juiz e Juíza</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Missão</strong>
                <span className="opacity-90">Missionário, Missionária, Evangelista e Pregador</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Serviço</strong>
                <span className="opacity-90">Servo, Serva, Diácono e Diaconisa</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Familiar</strong>
                <span className="opacity-90">Pai, Mãe, Esposa, Esposo, Filho, Filha, Viúva, Patriarca e Matriarca</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Intelectual / Religioso</strong>
                <span className="opacity-90">Escriba, Mestre da Lei, Sábio e Conselheiro</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Sobrenatural</strong>
                <span className="opacity-90">Anjo, Arcanjo e Demônio</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-accent)]">Pastoril</strong>
                <span className="opacity-90">Pastor, Criador de ovelhas e Criador</span>
              </div>
            </div>

            <div className="mt-2 text-sm bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
              <p>Uma função pode pertencer a mais de um grupo. Exemplo:</p>
              <ul className="list-disc pl-5 mt-1">
                <li><code className="bg-black/5 px-1 rounded font-mono text-[var(--color-text-main)]">Patriarca</code> está em Liderança e Familiar.</li>
                <li><code className="bg-black/5 px-1 rounded font-mono text-[var(--color-text-main)]">Diácono</code> está em Sacerdotal e Serviço.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold uppercase tracking-wider text-[var(--color-text-accent)] text-base border-b border-[var(--color-border-subtle)] pb-1">Dicas</h3>
            <p>Após algumas tentativas, novas dicas ficam disponíveis na parte superior da tela.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dica 1 é liberada após <strong>6</strong> tentativas.</li>
              <li>Dica 2 é liberada após <strong>12</strong> tentativas.</li>
            </ul>
            <p>Clique no botão da dica para visualizar o conteúdo. As dicas não são mostradas automaticamente.</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-sans font-bold uppercase tracking-wider text-[var(--color-text-accent)] text-base border-b border-[var(--color-border-subtle)] pb-1">Objetivo</h3>
            <p>Não existe limite de tentativas. Você pode continuar tentando até encontrar o personagem correto.</p>
            <p>O objetivo é chegar à resposta usando cada vez mais as informações das tentativas anteriores.</p>
          </section>
        </div>
      }
    >
      <CharacterGame />
    </MonasteryBackground>
  );
}
