"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { PassageGame } from "@/components/PassageGame";

export default function PassagemPage() {
  return (
    <AppShell
      gameControls
      infoContent={
        <div className="space-y-8 text-[0.95rem] leading-relaxed text-[var(--color-text-main)]">
          <section className="space-y-4">
            <p>
              Descubra de qual passagem bíblica é o trecho apresentado.
            </p>
            <p>
              Escolha o Livro e informe o Capítulo e o Versículo do seu palpite.
            </p>
            <p>
              A cada tentativa, as pistas mostram o quanto você se aproximou da referência correta.
            </p>
            <p className="text-sm bg-[var(--color-fill)] p-3 rounded-2xl">
              Capítulos e versículos seguem a <strong>Bíblia Ave-Maria</strong>. Atenção aos Salmos: ela usa a numeração grega, geralmente um número abaixo do das Bíblias que seguem a numeração hebraica (ex.: &quot;O Senhor é meu pastor&quot; é o Salmo 22).
            </p>
          </section>

          <section className="space-y-4">
            <h3>Como fazer um palpite</h3>
            
            <div>
              <h4 className="font-bold text-[var(--color-text-main)] mb-1">LIVRO</h4>
              <p>Comece digitando o nome de um livro da Bíblia e selecione uma opção da lista.</p>
              <div className="mt-2 bg-[var(--color-fill)] p-3 rounded-2xl text-sm">
                Você também pode usar o teclado:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><kbd>↑</kbd> e <kbd>↓</kbd> para navegar pelas opções;</li>
                  <li><kbd>Enter</kbd> para selecionar.</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[var(--color-text-main)] mb-1 mt-4">CAPÍTULO E VERSÍCULO</h4>
              <p>Informe os números correspondentes ao seu palpite. Os botões <kbd>+</kbd> e <kbd>−</kbd> também podem ser utilizados para ajustar os valores.</p>
              <p className="mt-2">Depois clique em <strong>Confirmar Palpite</strong>.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h3>Cores</h3>
            
            <div className="space-y-4 mt-2">
              <div>
                <h4 className="flex items-center gap-2 font-bold uppercase text-[var(--color-status-correct)]">
                  <span className="inline-block h-4 w-4 rounded-sm bg-[var(--color-status-correct)] shadow-sm" /> 
                  Verde
                </h4>
                <p className="mt-1">O valor está correto.</p>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-bold uppercase text-[var(--color-status-partial-text)]">
                  <span className="inline-block h-4 w-4 rounded-sm bg-[var(--color-status-partial)] shadow-sm" /> 
                  Amarelo
                </h4>
                <p className="mt-1">O valor está muito próximo.</p>
                <div className="mt-2 text-sm bg-[var(--color-fill)] p-3 rounded-2xl">
                  <p>Para <strong>Capítulo</strong> e <strong>Versículo</strong>, o amarelo aparece quando o seu palpite está a uma distância de até <strong>2 números</strong> do correto, para cima ou para baixo.</p>
                  <p className="mt-2 text-xs opacity-90"><strong>Exemplo:</strong> Se a resposta é o Capítulo 5, palpites como 3, 4, 6 e 7 ficarão amarelos.</p>
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-bold uppercase text-[var(--color-status-wrong)]">
                  <span className="inline-block h-4 w-4 rounded-sm bg-[var(--color-status-wrong)] shadow-sm" /> 
                  Vermelho
                </h4>
                <p className="mt-1">O valor está incorreto e distante.</p>
                <p className="mt-1 text-sm opacity-90">No modo Passagem, a principal orientação nos valores incorretos vem das setas.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3>Como funcionam as setas</h3>
            <p>As setas indicam onde está a resposta correta em relação ao seu palpite.</p>

            <div className="mt-4">
              <h4 className="font-bold text-[var(--color-text-main)] mb-2">LIVRO</h4>
              <p>Imagine os 73 livros da Bíblia organizados verticalmente na ordem canônica:</p>
              <div className="my-3 font-mono text-sm bg-[var(--color-fill)] p-3 rounded-2xl text-center">
                <strong>Gênesis</strong> (no topo)<br/>
                ↓<br/>
                ...<br/>
                ↓<br/>
                <strong>Apocalipse</strong> (na parte inferior)
              </div>
              
              <div className="space-y-3 mt-3">
                <div className="bg-[var(--color-fill)] p-3 rounded-2xl">
                  <h4 className="font-bold mb-1"><span className="text-[var(--color-text-main)] text-lg">↑</span> SETA PARA CIMA</h4>
                  <p>Significa que o livro correto está <strong>antes / acima</strong> do livro escolhido.</p>
                  <p className="mt-2 text-sm opacity-90"><strong>Exemplo:</strong> Palpite: Êxodo | Resposta: Gênesis → <span className="font-bold">↑</span></p>
                </div>

                <div className="bg-[var(--color-fill)] p-3 rounded-2xl">
                  <h4 className="font-bold mb-1"><span className="text-[var(--color-text-main)] text-lg">↓</span> SETA PARA BAIXO</h4>
                  <p>Significa que o livro correto está <strong>depois / abaixo</strong> do livro escolhido.</p>
                  <p className="mt-2 text-sm opacity-90"><strong>Exemplo:</strong> Palpite: Gênesis | Resposta: Êxodo → <span className="font-bold">↓</span></p>
                </div>
              </div>

              <div className="mt-3 bg-[var(--color-status-partial-bg)] p-3 rounded-2xl text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nunca existe um livro acima de Gênesis.</li>
                  <li>Nunca existe um livro abaixo de Apocalipse.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-bold text-[var(--color-text-main)] mb-2">CAPÍTULO</h4>
              <p>A mesma regra se aplica aos capítulos:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>↑</strong> → o capítulo correto é <strong>menor</strong> que o seu palpite.<br/><span className="text-sm opacity-80">(Ex: Palpite: Capítulo 10 | Resposta: Capítulo 7)</span></li>
                <li><strong>↓</strong> → o capítulo correto é <strong>maior</strong> que o seu palpite.<br/><span className="text-sm opacity-80">(Ex: Palpite: Capítulo 10 | Resposta: Capítulo 15)</span></li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-bold text-[var(--color-text-main)] mb-2">VERSÍCULO</h4>
              <p>Mesma regra:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>↑</strong> → o versículo correto é <strong>menor</strong>.<br/><span className="text-sm opacity-80">(Ex: Palpite: Versículo 20 | Resposta: Versículo 12)</span></li>
                <li><strong>↓</strong> → o versículo correto é <strong>maior</strong>.</li>
              </ul>

              <div className="mt-4 bg-[var(--color-fill)] p-3 rounded-2xl text-sm">
                <h5 className="font-bold mb-1">E as passagens com mais de um versículo?</h5>
                <p>
                  O jogo exige que você acerte somente o versículo <strong>inicial</strong> da passagem. Se a passagem correta vai do versículo 13 ao 35, o seu palpite no campo Versículo deve ser exatamente <strong>13</strong> para estar verde.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3>Dicas</h3>
            <p>As dicas não aparecem imediatamente. Você precisa clicar na lâmpada para revelar a dica quando ela estiver disponível.</p>
            
            <div className="space-y-4 mt-3">
              <div>
                <h4 className="font-bold text-[var(--color-text-main)]">DICA 1</h4>
                <p className="text-sm opacity-90 mt-1">Liberada após <strong>6</strong> palpites.</p>
                <p className="mt-1">Ela revela o Testamento e a divisão bíblica da passagem.</p>
                <p className="mt-1 text-sm bg-[var(--color-fill)] p-2 rounded-2xl">
                  <strong>Exemplo:</strong> &quot;A passagem pertence ao Antigo Testamento, na seção Sapienciais.&quot;
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[var(--color-text-main)]">DICA 2</h4>
                <p className="text-sm opacity-90 mt-1">Liberada após <strong>12</strong> palpites.</p>
                <p className="mt-1">Ela fornece uma pista contextual específica da passagem. Pode ajudar com a situação, o tema, o contexto histórico ou o momento narrativo.</p>
                <p className="mt-1">Ela <strong>não revela</strong> diretamente o livro, capítulo ou versículo.</p>
              </div>
            </div>

            <p className="mt-4 text-sm opacity-90 italic">O uso das dicas é registrado nas suas estatísticas.</p>
          </section>

          <section className="space-y-3">
            <h3>Tentativas</h3>
            <p>Não existe limite de tentativas.</p>
            <p>Continue usando o texto da passagem, as setas e as dicas até encontrar a referência correta.</p>
          </section>
        </div>
      }
    >
      <PassageGame />
    </AppShell>
  );
}
