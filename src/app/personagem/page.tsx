"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { CharacterGame } from "@/components/CharacterGame";

export default function PersonagemPage() {
  return (
    <AppShell
      gameControls
      infoContent={
        <div className="space-y-8 text-[0.95rem] leading-relaxed text-[var(--color-text-main)]">
          <section>
            <p>
              Descubra qual é o personagem bíblico secreto usando as informações reveladas a cada tentativa.
            </p>
            <p className="mt-3">
              Digite o nome de um personagem no campo de busca e selecione uma das sugestões.
            </p>
            <div className="mt-3 bg-[var(--color-fill)] p-4 rounded-2xl">
              <p className="mb-2">Você também pode usar o teclado:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><kbd>↑</kbd> e <kbd>↓</kbd> para navegar pelas sugestões;</li>
                <li><kbd>Enter</kbd> para escolher a opção selecionada;</li>
                <li>se nenhuma opção estiver selecionada, <kbd>Enter</kbd> escolhe a primeira sugestão da lista.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h3>Como ler as cores</h3>
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
                <h4 className="flex items-center gap-2 font-bold uppercase text-[var(--color-status-partial-text)]">
                  <span className="inline-block h-4 w-4 rounded-sm bg-[var(--color-status-partial)] shadow-sm" /> 
                  Amarelo
                </h4>
                <p className="mt-1">A informação está parcialmente correta.</p>
                <div className="mt-2 text-sm bg-[var(--color-fill)] p-3 rounded-2xl">
                  Para a coluna Ocupação, o amarelo pode aparecer quando:
                  <ul className="list-disc pl-5 mt-1 mb-2">
                    <li>as ocupações compartilham uma função em comum;</li>
                    <li>ou pertencem ao mesmo grupo de funções.</li>
                  </ul>
                  <strong>Exemplos:</strong><br/>
                  <code>Profeta e Sacerdote</code> × <code>Sacerdote</code> → AMARELO<br/>
                  <code>Rei</code> × <code>Rainha</code> → AMARELO
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
            <h3>Setas</h3>
            <p>Algumas colunas também utilizam setas para indicar a direção da resposta.</p>

            <div className="mt-4">
              <h4 className="font-bold text-[var(--color-text-main)] mb-2">PASSAGEM NA BÍBLIA</h4>
              <p className="mb-3">Esta coluna compara a localização bíblica dos personagens na ordem católica:</p>
              
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong className="text-[var(--color-status-correct)]">Verde:</strong> mesma história/referência exata.</li>
                <li><strong className="text-[var(--color-status-partial-text)]">Amarelo:</strong> aparecem em algum livro em comum (mas com história diferente) <strong>OU</strong> algum livro de um está próximo de algum livro do outro (até 2 posições de distância).</li>
                <li><strong className="text-[var(--color-status-wrong)]">Vermelho:</strong> todos os livros estão mais distantes.</li>
              </ul>
              <p className="mb-4 text-sm opacity-90">Todos os livros onde o personagem aparece contam. Ex.: Jesus aparece em Mateus, Marcos, Lucas e João; se o personagem secreto está em Atos, João fica a 1 livro de distância e a coluna fica amarela.</p>

              <p>As setas indicam a direção na Bíblia:</p>
              <div className="mt-3 space-y-3">
                <div className="bg-[var(--color-fill)] p-3 rounded-2xl">
                  <h4 className="font-bold mb-1"><span className="text-[var(--color-text-main)] text-lg">↑</span> SETA PARA CIMA</h4>
                  <p>A resposta está <strong>mais antes</strong> na ordem da Bíblia.</p>
                </div>
                <div className="bg-[var(--color-fill)] p-3 rounded-2xl">
                  <h4 className="font-bold mb-1"><span className="text-[var(--color-text-main)] text-lg">↓</span> SETA PARA BAIXO</h4>
                  <p>A resposta está <strong>mais depois</strong> na ordem da Bíblia.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3>Divisão e Testamento</h3>
            <p>Alguns personagens aparecem em mais de uma divisão (ex.: <code>Epístolas e Históricos</code>) ou nos dois testamentos.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-[var(--color-status-correct)]">Verde:</strong> exatamente as mesmas divisões.</li>
              <li><strong className="text-[var(--color-status-partial-text)]">Amarelo:</strong> pelo menos uma divisão em comum, mas não todas.</li>
              <li><strong className="text-[var(--color-status-wrong)]">Vermelho:</strong> nenhuma divisão em comum.</li>
            </ul>
            <div className="text-sm bg-[var(--color-fill)] p-3 rounded-2xl">
              <code>Epístolas e Históricos</code> × <code>Históricos</code> → AMARELO<br />
              <code>Históricos</code> × <code>Históricos</code> → VERDE
            </div>
          </section>

          <section className="space-y-4">
            <h3>Povo</h3>
            <p>Mostra o povo ou a origem do personagem e, quando a Bíblia informa, a tribo de Israel (ex.: <code>Israelita (Judá)</code>).</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-[var(--color-status-correct)]">Verde:</strong> mesmo povo e mesma tribo.</li>
              <li><strong className="text-[var(--color-status-partial-text)]">Amarelo:</strong> mesmo povo, mas tribo diferente ou não informada. Também vale para <code>Hebreu</code> (família de Abraão, antes de Jacó) × <code>Israelita</code>, e para anjo × demônio.</li>
              <li><strong className="text-[var(--color-status-wrong)]">Vermelho:</strong> povos diferentes.</li>
            </ul>
            <div className="text-sm bg-[var(--color-fill)] p-3 rounded-2xl">
              <code>Israelita (Benjamim)</code> × <code>Israelita (Judá)</code> → AMARELO<br />
              <code>Romano</code> × <code>Israelita</code> → VERMELHO
            </div>
          </section>

          <section className="space-y-4">
            <h3>Grupos de Ocupação</h3>
            <p>Algumas funções são relacionadas entre si. Se duas ocupações pertencem ao mesmo grupo, a coluna pode ficar amarela.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <strong className="block text-[var(--color-text-main)]">Realeza</strong>
                <span className="opacity-90">Rei, Rainha, Imperador, Imperador Romano e Faraó</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Militar</strong>
                <span className="opacity-90">Guerreiro, Soldado, General, Comandante e Líder militar</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Liderança</strong>
                <span className="opacity-90">Líder, Governador, Líder militar, Administrador, Conselheiro, Patriarca e Ancião</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Profético</strong>
                <span className="opacity-90">Profeta e Profetisa</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Sacerdotal</strong>
                <span className="opacity-90">Sacerdote, Sumo Sacerdote, Levita, Diácono, Diaconisa e Chefe religioso</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Seguidores de Jesus</strong>
                <span className="opacity-90">Apóstolo, Discípulo e Discípula</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Judicial</strong>
                <span className="opacity-90">Juiz e Juíza</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Missão</strong>
                <span className="opacity-90">Missionário, Missionária, Evangelista e Pregador</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Serviço</strong>
                <span className="opacity-90">Servo, Serva, Diácono e Diaconisa</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Familiar</strong>
                <span className="opacity-90">Pai, Mãe, Esposa, Esposo, Filho, Filha, Viúva, Patriarca e Matriarca</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Intelectual / Religioso</strong>
                <span className="opacity-90">Escriba, Mestre da Lei, Sábio e Conselheiro</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Sobrenatural</strong>
                <span className="opacity-90">Anjo, Arcanjo e Demônio</span>
              </div>
              <div>
                <strong className="block text-[var(--color-text-main)]">Pastoril</strong>
                <span className="opacity-90">Pastor, Criador de ovelhas e Criador</span>
              </div>
            </div>

            <div className="mt-2 text-sm bg-[var(--color-fill)] p-3 rounded-2xl">
              <p>Uma função pode pertencer a mais de um grupo. Exemplo:</p>
              <ul className="list-disc pl-5 mt-1">
                <li><code>Patriarca</code> está em Liderança e Familiar.</li>
                <li><code>Diácono</code> está em Sacerdotal e Serviço.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h3>Dicas</h3>
            <p>Após algumas tentativas, novas dicas ficam disponíveis na parte superior da tela.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dica 1 é liberada após <strong>6</strong> tentativas.</li>
              <li>Dica 2 é liberada após <strong>12</strong> tentativas.</li>
            </ul>
            <p>Clique no botão da dica para visualizar o conteúdo. As dicas não são mostradas automaticamente.</p>
          </section>

          <section className="space-y-3">
            <h3>Objetivo</h3>
            <p>Não existe limite de tentativas. Você pode continuar tentando até encontrar o personagem correto.</p>
            <p>O objetivo é chegar à resposta usando cada vez mais as informações das tentativas anteriores.</p>
          </section>
        </div>
      }
    >
      <CharacterGame />
    </AppShell>
  );
}
