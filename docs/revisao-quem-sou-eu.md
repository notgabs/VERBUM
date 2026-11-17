# Revisão do modo "Quem sou eu?"

## Catálogo: só figuras do catolicismo

- O modo traz só santos, papas e religiosos: **60 figuras** (52 santos e 8 papas). Personagens bíblicos e arcanjos ficam no Clássico.
- Das figuras católicas que já existiam, ficaram 19. Entraram 41 novas, entre elas:
  - santos do Brasil: Anchieta, Irmã Dulce, Frei Galvão, Santa Paulina;
  - Doutores da Igreja: Teresa de Ávila, João da Cruz, Catarina de Sena, Jerônimo e outros;
  - papas: João XXIII, Paulo VI, Pio X, Gregório Magno, Leão XIV;
  - santos jovens: Carlo Acutis, Pier Giorgio Frassati.
- Para montar o catálogo, rode `node scripts/revisao/montar-qse.mjs`. Ele junta:
  - `qse-dicas-1.mjs`: dicas revisadas das figuras antigas;
  - `qse-catolicos.mjs`: as novas figuras, com a cena de cada foto.
- O script bloqueia a gravação se:
  - aparecer um tipo bíblico;
  - faltar nome ou apelido;
  - alguma figura não tiver 6 dicas diferentes;
  - uma dica citar o nome da própria figura.
- `qse-dicas-2.mjs` e `qse-dicas-3.mjs` guardam a revisão das dicas bíblicas, que não são mais usadas neste modo.
- **Fotos reais**, tiradas do Wikimedia Commons: a imagem principal do artigo da Wikipédia de cada figura (pinturas, ícones, vitrais e fotografias).
  - Ficam em `public/quem-sou-eu/<slug>.webp`, recortadas em quadrado (512 x 512).
  - Créditos de autor e licença: em `public/data/quem-sou-eu-creditos.json` e `public/quem-sou-eu/CREDITOS.md`, e listados na seção "Créditos das imagens" das regras do jogo, como pedem as licenças Creative Commons.
  - Para refazer: `python scripts/revisao/fotos-qse/buscar_fotos_wiki.py <pasta>` baixa as imagens e `publicar_wiki.py` recorta e publica (`foco_wiki.json` ajusta o recorte).
  - Carlo Acutis não tem foto livre (as fotos dele são protegidas), por isso entrou um relevo em madeira de uma igreja de Londres (CC BY-SA 4.0).
  - Para São Lourenço e São Luís Gonzaga, a imagem do artigo era uma cena com o santo pequeno, e foi trocada por um retrato (Zurbarán e uma gravura, ambos em domínio público).

## Ordem das pistas

- **Pista 6** é a mais difícil e é a primeira a abrir. **Pista 1** entrega a resposta.
- No catálogo, `dicas[0]` é a Pista 1 e `dicas[5]` é a Pista 6.

## O que mudou nas dicas das figuras antigas

- **Dificuldade reorganizada.**
  - As pistas difíceis passaram a usar detalhes pouco conhecidos, mas verdadeiros, que dão um rumo. Exemplos: Davi se fingindo de louco diante de um rei filisteu; Habacuc levado por um anjo até a cova dos leões (Dn 14).
  - A Pista 1 agora identifica sem ambiguidade (Filipe, Tiago Menor, Silas e Neemias tinham pistas finais fracas).
- **Grafia da Bíblia Ave-Maria:** Hus, Isaac, Booz, Heli, Acab, Amã, Ozias, Gomer, Amasias, Técua, Morasti, Fatuel, Gat-Ofer, Sorec, Maalon, Orfa, Edissa, Baltazar, Putifar, Henoc, Jared.
- **Citações bíblicas ajustadas ao texto da Ave-Maria:** Am 5,24; Mq 6,8; Jl 2,13; Ag 1,4; Hab 2,4; Sf 1,15.
- **Erros corrigidos:**
  - Jacó não "amava duas mulheres" (trabalhou sete anos por Raquel e recebeu Lia).
  - Caifás era genro de Anás, e não seu sucessor direto.
  - Simão, o Mago, creu e foi batizado; quem o confrontou foi Pedro.
  - Luís Gonzaga recebeu de São Carlos Borromeu a primeira comunhão, e não o "primeiro contato com a religião".
  - Simão de Cirene foi obrigado a carregar a cruz; não "se obrigou".
- **Erros de escrita e anacronismos:**
  - "Passe grande parte" virou "Passei".
  - "pedra rolar" foi corrigido.
  - "matrimônio civil" e "gangues políticas", ditos de Santa Rita (século XV), saíram.
  - "bando paramilitar" (Jefté) e "avivamentos" (Silas) saíram.
- **Resumos atualizados:**
  - Papa Francisco: pontificado de 2013 a 2025.
  - Tiago, irmão do Senhor: a tradição latina costuma identificá-lo com Tiago Menor.
  - Silas e Judas Macabeu: festa da Dedicação (Hanucá).
  - Apolo.

## Fontes católicas consultadas para os fatos menos óbvios

- Santa Clara foi a primeira mulher a escrever uma regra aprovada por um Papa. Fontes: [Vatican News](https://www.vaticannews.va/pt/santo-do-dia/08/11/s--clara-de-assis--fundadora-das-clarissas.html) e [ACI Digital](https://www.acidigital.com/noticia/52811/cinco-dados-sobre-santa-clara-de-assis).
- São Luís Gonzaga recebeu a primeira comunhão de São Carlos Borromeu e morreu de peste em Roma. Fontes: [Vatican News](https://www.vaticannews.va/pt/santo-do-dia/06/21/s--luis-gonzaga--jesuita--padroeiro-da-juventude-catolica.html) e [Enciclopédia Católica](https://www.newadvent.org/cathen/01331c.htm).
- O convento de São Maximiliano Kolbe em Nagasaki resistiu à bomba atômica. Fonte: [Catholic News Agency](https://www.catholicnewsagency.com/amp/news/258589/the-nagasaki-mission-house-built-by-st-maximilian-kolbe-that-survived-the-atomic-bomb).
- Santo Antônio foi o primeiro professor de teologia da ordem e antes era cônego agostiniano em Coimbra. Fontes: [Vatican News](https://www.vaticannews.va/pt/santo-do-dia/06/13/s--antonio-de-padua--sacerdote-franciscano-e-doutor-da-igreja.html) e [Franciscanos](https://franciscanos.org.br/vidacrista/calendario/santo-antonio-de-padua-e-lisboa/).
- Bento XVI serviu na defesa antiaérea, foi perito do cardeal Frings no Concílio e nasceu num Sábado Santo. Fontes: [vatican.va](https://www.vatican.va/news_services/press/documentazione/documents/cardinali_biografie/cardinali_bio_ratzinger_j_en.html) e [Vatican News](https://www.vaticannews.va/pt/vaticano/news/2022-12/bento-xvi-biografia.html).
- Papa Francisco era técnico químico, foi porteiro de balada na juventude e perdeu parte de um pulmão quando seminarista. Fontes: [vatican.va](https://w2.vatican.va/content/francesco/pt/biography/documents/papa-francesco-biografia-bergoglio.html), [Aleteia](https://pt.aleteia.org/2013/12/04/papa-francisco-revela-que-ja-trabalhou-como-porteiro-de-balada/) e [Aleteia](https://pt.aleteia.org/2023/03/30/francisco-um-papa-de-saude-fragil/).
- Padre Pio fundou a Casa Alívio do Sofrimento e ficou anos em casa por motivo de saúde depois de ordenado. Fonte: [vatican.va](https://www.vatican.va/roman_curia/congregations/csaints/documents/rc_con_csaints_doc_19990502_padre-pio_po.html).

## Retirado por falta de confirmação em fonte católica

- Padre Pio "dispensado do serviço militar por saúde": as fontes falam em motivos de saúde, mas não em dispensa militar.
- O "testamento espiritual" de Bento XVI mencionando a Baviera.

### Fatos conferidos para as novas figuras

- Carlo Acutis e Pier Giorgio Frassati foram canonizados por Leão XIV em 7 de setembro de 2025. Fontes: [Canção Nova](https://noticias.cancaonova.com/igreja/papa-canoniza-carlo-acutis-e-pier-giorgio-frassati/) e [ACI Digital](https://www.acidigital.com/noticia/64431/frassati-e-acutis-sao-um-convite-aos-jovens-a-nao-desperdicar-a-vida-e-fazer-dela-uma-obra-prima-diz-leao-xiv).
- Biografia de Leão XIV (Chicago, agostiniano, Chiclayo, Dicastério para os Bispos, matemática). Fontes: [vatican.va](https://www.vatican.va/content/leo-xiv/pt/biography/documents/biografia_leone-xiv.html) e [Vatican News](https://www.vaticannews.va/pt/papa/news/2025-05/robertum-franciscum-prevostleone-xiv.html).
- Dom Bosco sonhou com uma terra entre os paralelos 15 e 20 e é copadroeiro de Brasília. Fonte: [Aleteia](https://pt.aleteia.org/2017/08/04/brasilia-recebe-reliquias-de-dom-bosco/).
- Santa Paulina perdeu o braço direito por causa do diabetes e fundou a congregação em Nova Trento. Fontes: [CNBB](https://www.cnbb.org.br/9-de-julho-igreja-comemora-a-santidade-da-naturalizada-brasileira-amabile-lucia-visintainer-hoje-santa-paulina/) e [ACI Digital](https://www.acidigital.com/noticia/34702/hoje-e-celebrada-santa-paulina-a-primeira-santa-do-brasil).
- São Benedito era filho de africanos escravizados, foi cozinheiro e, mesmo sem saber ler, foi superior do convento. Fontes: [Franciscanos](https://franciscanos.org.br/carisma/calendario/sao-benedito-o-mouro) e [ACI Digital](https://www.acidigital.com/noticia/49825/igreja-no-brasil-celebra-hoje-sao-benedito-padroeiro-dos-cozinheiros).
- Irmã Dulce começou a obra num galinheiro, foi indicada ao Nobel em 1988 e foi canonizada em 2019. Fontes: [Aleteia](https://pt.aleteia.org/2019/06/20/irma-dulce-a-madre-teresa-do-brasil-e-sua-obra-iniciada-em-um-galinheiro/) e [ACI Digital](https://www.acidigital.com/noticia/52818/dez-dados-marcantes-da-vida-de-irma-dulce-primeira-santa-brasileira).
- Catarina de Sena: a ordem exata entre os irmãos varia nas fontes, por isso a dica diz apenas que ela foi "uma das últimas filhas" de uma família com mais de vinte filhos.
