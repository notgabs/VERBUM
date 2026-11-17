/**
 * Banco de passagens do modo "Acerte a passagem", organizado na ordem dos livros
 * da Bíblia católica (1 Gênesis, 2 Êxodo, 3 Levítico, 4 Números, 5 Deuteronômio…).
 *
 * Cada passagem: [capitulo, versiculo, versiculoFim|null, texto, dica2, contexto]
 *  - versiculo: o versículo INICIAL, que o jogador precisa acertar.
 *  - texto: o que aparece na tela (descreve o episódio, sem a referência).
 *  - dica2: contexto que ajuda sem entregar livro ou capítulo.
 *  - contexto: explicação mostrada na vitória.
 * Referências e grafias conferidas na Bíblia Ave-Maria (bibliaonline.com.br/avm), base do jogo.
 * Atenção: a Ave-Maria segue a numeração grega nos Salmos (ex.: "O Senhor é meu pastor" = Salmo 22).
 *
 * Aplicar: node scripts/revisao/aplicar-passagens.mjs
 */

import { passagensHistoricos } from "./passagens-historicos.mjs";
import { passagensSapienciais } from "./passagens-sapienciais.mjs";
import { passagensProfeticos } from "./passagens-profeticos.mjs";
import { passagensEvangelhos } from "./passagens-evangelhos.mjs";
import { passagensEpistolas } from "./passagens-epistolas.mjs";
import { passagensApocalipse } from "./passagens-apocalipse.mjs";

const pentateuco = {
  "Gênesis": [
    [1, 1, 2, "No princípio, Deus cria o céu e a terra.", "Abre não só o livro, mas a Bíblia inteira, antes de existir qualquer ser humano.", "A abertura da Escritura apresenta Deus como origem de tudo: o mundo não é fruto do acaso, mas recebe dele ordem e sentido."],
    [1, 26, 28, "Deus cria o ser humano, homem e mulher, à sua imagem e semelhança.", "Acontece no sexto dia, depois da criação dos animais.", "O ser humano é criado à imagem de Deus e recebe a missão de cuidar da criação. A dignidade de cada pessoa nasce daqui."],
    [2, 7, null, "Deus forma o homem do barro da terra e sopra em suas narinas o fôlego de vida.", "Faz parte do segundo relato da criação, que se passa num jardim.", "Formado do pó e animado pelo sopro de Deus, o homem é ao mesmo tempo terra e espírito, totalmente dependente do Criador."],
    [2, 18, 24, "\"Não é bom que o homem esteja só\": Deus forma a mulher da costela do homem.", "Termina com o homem e a mulher se tornando 'uma só carne'.", "A criação da mulher mostra que o ser humano foi feito para a comunhão. Jesus citará este texto ao falar do matrimônio."],
    [3, 1, 7, "A serpente tenta a mulher, e o casal come do fruto proibido.", "É o momento em que o pecado entra no mundo, ainda no jardim.", "O relato da queda mostra a desconfiança em Deus que leva ao pecado e rompe a harmonia original entre Deus, o ser humano e a criação."],
    [3, 15, null, "Deus anuncia inimizade entre a serpente e a mulher: a descendência dela lhe esmagará a cabeça.", "A tradição da Igreja chama este versículo de 'Protoevangelho', o primeiro anúncio da salvação.", "Logo após a queda, Deus já promete a vitória sobre o mal. A Igreja vê aqui o primeiro anúncio de Cristo e de Maria."],
    [4, 8, 10, "Caim leva o irmão ao campo e o mata.", "Logo depois, Deus pergunta: 'Onde está teu irmão?'", "O primeiro homicídio mostra como o pecado se espalha da relação com Deus para a relação entre irmãos."],
    [6, 13, 22, "Deus manda Noé construir uma arca para salvar sua família e os animais.", "Inclui as medidas da embarcação, em côvados.", "Diante da violência que tomou a terra, Deus preserva um justo e recomeça a história com ele."],
    [7, 11, 12, "As fontes do abismo se rompem e chove sobre a terra por quarenta dias e quarenta noites.", "Acontece quando Noé tinha seiscentos anos.", "O dilúvio é apresentado como uma volta ao caos das origens, do qual Deus salva os que estão na arca."],
    [9, 13, 15, "Deus põe o arco-íris nas nuvens como sinal da aliança.", "É a promessa de que as águas nunca mais destruirão toda a vida.", "A primeira aliança da Bíblia é feita com toda a humanidade e com toda a criação, e o arco-íris é o seu sinal."],
    [11, 1, 9, "Os homens tentam construir uma torre que chegue ao céu, e Deus confunde a língua deles.", "Explica por que os povos falam línguas diferentes.", "A torre de Babel mostra o orgulho humano que quer alcançar o céu sem Deus e acaba em dispersão."],
    [12, 1, 3, "Deus chama Abrão: \"Sai da tua terra… em ti serão abençoadas todas as famílias da terra\".", "Abre a história dos patriarcas.", "O chamado de Abraão inicia a história da salvação com um povo escolhido para ser bênção para todos."],
    [15, 5, 6, "Deus leva Abrão para fora da tenda e diz: \"Conta as estrelas, se puderes\".", "Termina dizendo que ele creu e isso lhe foi atribuído como justiça.", "Abraão crê na promessa de uma descendência impossível. Paulo usará este texto para falar da justificação pela fé."],
    [18, 1, 15, "Três visitantes aparecem a Abraão junto aos carvalhos de Mambré, e Sara ri da promessa de um filho.", "Abraão os recebe com pão e um bezerro, no calor do dia.", "A hospitalidade de Abraão é recompensada com a confirmação da promessa: nada é impossível para Deus."],
    [19, 24, 26, "Fogo e enxofre caem sobre Sodoma e Gomorra, e a mulher de Ló vira uma estátua de sal.", "Aconteceu depois que dois anjos tiraram a família da cidade.", "A destruição das cidades mostra o juízo de Deus sobre o mal; olhar para trás é sinal de apego ao que se deixa."],
    [22, 1, 14, "Deus põe Abraão à prova e pede que ofereça o filho Isaac no monte Moriá.", "Termina com um carneiro preso pelos chifres num arbusto.", "A prova de Abraão mostra uma fé total em Deus. A tradição cristã vê em Isaac, que carrega a lenha, uma figura de Cristo."],
    [25, 29, 34, "Esaú, faminto, vende ao irmão o direito de primogenitura por um prato de lentilhas.", "Os dois irmãos eram gêmeos.", "Esaú despreza a primogenitura por uma necessidade imediata, e a bênção passa para a linhagem de Jacó."],
    [27, 1, 29, "Disfarçado com peles de cabrito, Jacó engana o pai cego e recebe a bênção destinada ao irmão.", "A ideia do disfarce foi da mãe, Rebeca.", "Mesmo por caminhos tortuosos, a bênção chega a Jacó, que será o pai das doze tribos."],
    [28, 10, 17, "Jacó sonha com uma escada que liga a terra ao céu, por onde sobem e descem anjos.", "Ele dormia com a cabeça apoiada numa pedra, a caminho de Harã.", "Deus renova a Jacó a promessa feita a Abraão. O lugar recebe o nome de Betel, 'casa de Deus'."],
    [29, 15, 30, "Jacó trabalha sete anos por Raquel, recebe Lia no casamento e trabalha mais sete anos.", "Quem enganou desta vez foi o futuro sogro, Labão.", "Jacó, que enganou o pai, agora é enganado. Das duas irmãs nascerão as tribos de Israel."],
    [32, 25, 31, "Jacó luta a noite inteira com um misterioso homem e recebe o nome de Israel.", "Acontece junto ao vau do Jaboc, antes do reencontro com Esaú.", "Jacó 'luta com Deus' e sai abençoado e ferido. O novo nome, Israel, passa a ser o nome de todo o povo."],
    [37, 3, 28, "José ganha do pai uma túnica especial, conta seus sonhos e é vendido pelos irmãos.", "Ele foi vendido a mercadores ismaelitas por vinte moedas de prata.", "A inveja dos irmãos leva José ao Egito, mas por esse caminho Deus vai salvar toda a família."],
    [39, 7, 12, "A mulher de Putifar tenta seduzir José, que foge deixando o manto nas mãos dela.", "José era administrador da casa de um oficial egípcio.", "José permanece fiel a Deus mesmo sozinho em terra estrangeira, embora isso lhe custe a prisão."],
    [41, 1, 36, "O faraó sonha com sete vacas gordas e sete vacas magras, e José interpreta o sonho.", "José foi tirado da prisão para isso.", "A sabedoria dada por Deus a José prepara o Egito para a fome e o eleva a governador."],
    [45, 4, 8, "José se revela aos irmãos: \"Eu sou José, vosso irmão, que vendestes para o Egito\".", "Ele diz que foi Deus quem o enviou à frente deles para salvar vidas.", "O reencontro dos irmãos é uma cena de perdão e de leitura da história à luz da providência de Deus."],
    [50, 20, null, "\"Vós planejastes o mal contra mim, mas Deus o transformou em bem.\"", "É dito pouco antes do fim do livro, depois da morte de Jacó.", "José resume toda a sua história: Deus é capaz de tirar o bem até do mal que os homens fazem."],
  ],
  "Êxodo": [
    [1, 22, null, "O faraó ordena que todos os meninos hebreus recém-nascidos sejam jogados no rio.", "As parteiras já tinham desobedecido a uma ordem parecida.", "A opressão chega ao extremo. É nesse cenário de morte que nascerá o libertador do povo."],
    [2, 3, 10, "Um menino hebreu é colocado num cesto de papiro no rio e encontrado pela filha do faraó.", "A irmã do menino observava tudo de longe.", "Salvo das águas, Moisés é criado na corte do faraó. O nome dele lembra que foi 'tirado das águas'."],
    [3, 2, 6, "Deus fala a Moisés de uma sarça que arde sem se consumir.", "Moisés pastoreava o rebanho do sogro e precisou tirar as sandálias.", "Na sarça ardente Deus se revela como o Deus dos patriarcas que ouviu o clamor do seu povo."],
    [3, 14, null, "Deus revela seu nome a Moisés: \"Eu sou aquele que sou\".", "Moisés tinha perguntado o que responderia se o povo quisesse saber o nome de Deus.", "O nome revelado mostra Deus como aquele que existe por si mesmo e que está presente com o seu povo."],
    [7, 20, 21, "Aarão fere as águas do Nilo com a vara, e elas se transformam em sangue.", "É a primeira de uma série de pragas.", "As pragas mostram o poder de Deus sobre o Egito e seus deuses, diante da teimosia do faraó."],
    [12, 7, 13, "O sangue do cordeiro nos batentes das portas protege as casas dos israelitas.", "Faz parte das instruções para a primeira refeição da Páscoa.", "A Páscoa celebra a passagem do Senhor e a libertação. Os cristãos veem no cordeiro uma figura de Cristo."],
    [12, 29, 31, "À meia-noite morrem os primogênitos do Egito, e o faraó manda o povo partir.", "É a última das pragas.", "A última praga quebra a resistência do faraó e abre caminho para a saída do Egito."],
    [14, 21, 22, "Moisés estende a mão sobre o mar, as águas se dividem e Israel atravessa a pé enxuto.", "Um vento leste soprou a noite inteira.", "A travessia do mar é o grande sinal da libertação de Israel, que a Igreja relê como figura do batismo."],
    [15, 20, 21, "A profetisa Maria, irmã de Aarão, toma o tamborim e as mulheres dançam celebrando a vitória.", "Acontece logo depois que os carros do faraó afundaram.", "O povo libertado responde com louvor. Este cântico está entre os mais antigos da Bíblia."],
    [16, 13, 15, "De manhã o chão do deserto amanhece coberto de um alimento fino: o maná.", "À tarde tinham chegado codornizes ao acampamento.", "No deserto, Deus alimenta o povo dia após dia. Jesus se apresentará como o verdadeiro pão do céu."],
    [17, 6, null, "Moisés bate na rocha do Horeb e dela sai água para o povo beber.", "O lugar foi chamado Massa e Meriba, porque o povo pôs Deus à prova.", "Mesmo diante das murmurações, Deus faz brotar água da rocha. Paulo dirá que a rocha era Cristo."],
    [17, 11, 12, "Enquanto Moisés mantém as mãos erguidas, Israel vence Amalec.", "Aarão e Hur seguravam os braços dele quando se cansavam.", "A vitória vem de Deus e da oração perseverante, sustentada pela comunidade."],
    [20, 2, 17, "Deus entrega os Dez Mandamentos no Sinai.", "Começa lembrando que Deus tirou o povo da escravidão.", "O Decálogo é o centro da aliança: indica o caminho de uma vida livre, em fidelidade a Deus e respeito ao próximo."],
    [32, 4, 6, "O povo faz um bezerro de ouro e o adora enquanto Moisés está no monte.", "Aarão moldou o ídolo com os brincos de ouro do povo.", "Pouco depois de receber a aliança, o povo cai na idolatria. Moisés intercederá por ele."],
    [34, 29, 35, "Moisés desce do Sinai com as tábuas e o rosto dele brilha.", "Ele passou a usar um véu para falar com o povo.", "O encontro com Deus transforma Moisés. Paulo relaciona esse brilho à glória que Cristo revela."],
  ],
  "Levítico": [
    [10, 1, 2, "Nadab e Abiú oferecem um fogo estranho ao Senhor e são consumidos pelas chamas.", "Eram filhos do sumo sacerdote.", "O episódio mostra a seriedade do culto: não se aproxima de Deus de qualquer maneira."],
    [11, 2, 8, "A lei separa os animais que podem e os que não podem ser comidos.", "Diz que o porco, por exemplo, não pode ser comido.", "As leis de pureza lembravam a Israel que todo o seu cotidiano devia refletir a santidade de Deus."],
    [16, 21, 22, "O sumo sacerdote põe as mãos sobre um bode, confessa os pecados do povo e o envia ao deserto.", "Faz parte do ritual do Dia da Expiação.", "O 'bode expiatório' carrega simbolicamente os pecados do povo. A carta aos Hebreus relê este dia à luz de Cristo."],
    [19, 2, null, "\"Sede santos, porque eu, o Senhor vosso Deus, sou santo.\"", "Abre o chamado código de santidade.", "A santidade de Deus é o modelo da vida do povo. Pedro retomará este versículo em sua carta."],
    [19, 18, null, "\"Amarás o teu próximo como a ti mesmo.\"", "Vem logo depois da ordem de não se vingar nem guardar rancor.", "Jesus colocará este mandamento ao lado do amor a Deus como o resumo de toda a Lei."],
    [25, 10, null, "O quinquagésimo ano é declarado santo: um ano de jubileu e libertação.", "Nesse ano cada um voltava à sua propriedade e à sua família.", "O jubileu devolvia terras e libertava escravos. A Igreja retoma a ideia nos seus anos jubilares."],
  ],
  "Números": [
    [6, 24, 26, "\"O Senhor te abençoe e te guarde; faça brilhar sobre ti a sua face.\"", "Era a bênção que os sacerdotes, filhos de Aarão, pronunciavam sobre o povo.", "Esta bênção pede a presença, a proteção e a paz de Deus. É usada até hoje na liturgia."],
    [11, 31, 33, "Um vento traz codornizes em grande quantidade, e o povo, guloso, é castigado.", "O povo reclamava de comer só maná.", "A murmuração e a gula mostram a falta de confiança do povo no cuidado de Deus."],
    [12, 10, null, "Maria, irmã de Moisés, fica leprosa, branca como a neve, depois de falar contra Moisés.", "Ela e Aarão criticaram Moisés por causa da esposa cuxita.", "O episódio defende a autoridade de Moisés como profeta com quem Deus falava face a face."],
    [13, 23, null, "Os exploradores cortam um cacho de uvas tão grande que dois homens o carregam numa vara.", "O lugar se chamava vale de Escol.", "Os frutos mostram a riqueza da terra prometida, mas o medo levará o povo a não querer entrar."],
    [14, 33, 34, "O povo é condenado a vagar quarenta anos pelo deserto, um ano para cada dia de exploração.", "Só Josué e Calebe, entre os adultos, entrariam na terra.", "Por falta de fé, aquela geração não entra na terra. O deserto vira tempo de purificação."],
    [16, 31, 33, "A terra se abre e engole Coré e os que se revoltaram com ele.", "A revolta questionava a liderança de Moisés e Aarão.", "O castigo dos rebeldes confirma o sacerdócio escolhido por Deus."],
    [17, 23, null, "A vara de Aarão floresce e dá amêndoas durante a noite.", "Cada tribo tinha deixado uma vara diante da Arca.", "O sinal confirma a escolha da tribo de Levi para o sacerdócio."],
    [20, 11, 12, "Moisés bate duas vezes na rocha com a vara em vez de lhe falar, e por isso não entrará na terra.", "Aconteceu em Cades, depois da morte de Maria, irmã de Moisés.", "Mesmo o grande líder falha. A falta de confiança impede Moisés de entrar na terra prometida."],
    [21, 8, 9, "Quem fosse picado e olhasse para a serpente de bronze erguida numa haste ficava curado.", "Serpentes venenosas tinham atacado o povo no deserto.", "Jesus usará esta imagem: assim como a serpente foi levantada, o Filho do Homem será levantado na cruz."],
    [22, 28, 30, "A jumenta de Balaão fala e pergunta por que ele a espancou três vezes.", "Só o animal via o anjo parado no caminho.", "O adivinho contratado para amaldiçoar Israel é corrigido por uma jumenta e acaba abençoando o povo."],
    [24, 17, null, "\"Um astro sai de Jacó, um cetro levanta-se de Israel.\"", "É um oráculo de Balaão.", "A tradição viu neste oráculo um anúncio do Messias, relacionado à estrela que guiou os magos."],
    [27, 18, 23, "Moisés impõe as mãos sobre Josué e o apresenta como seu sucessor.", "Foi diante do sacerdote Eleazar e de toda a comunidade.", "A liderança do povo é transmitida com a imposição das mãos, garantindo a continuidade da missão."],
  ],
  "Deuteronômio": [
    [5, 6, 21, "Moisés repete os Dez Mandamentos ao povo antes da entrada na terra.", "É a segunda vez que eles aparecem no Pentateuco.", "Moisés relembra a aliança à nova geração, que precisa assumi-la como sua."],
    [6, 4, 5, "\"Ouve, Israel: o Senhor nosso Deus é o único Senhor. Amarás o Senhor teu Deus de todo o coração.\"", "É a oração que os judeus chamam de Shemá.", "O Shemá chama Israel a amar a Deus com toda a vida. Jesus o citará como o primeiro mandamento."],
    [6, 6, 9, "As palavras de Deus devem ser gravadas no coração, ensinadas aos filhos e escritas nos batentes das portas.", "Vem logo depois do mandamento de amar a Deus de todo o coração.", "A fé deve atravessar a família, a memória e o dia a dia, de geração em geração."],
    [8, 3, null, "\"Não só de pão vive o homem, mas de toda palavra que sai da boca do Senhor.\"", "Recorda o maná dado no deserto.", "Jesus responde ao tentador no deserto citando este versículo."],
    [18, 15, null, "\"O Senhor teu Deus suscitará do meio de ti um profeta como eu; a ele ouvireis.\"", "Quem fala é Moisés.", "A promessa de um profeta como Moisés é aplicada a Jesus no Novo Testamento."],
    [30, 19, 20, "\"Ponho diante de ti a vida e a morte, a bênção e a maldição: escolhe, pois, a vida.\"", "Céu e terra são chamados como testemunhas.", "No fim de seus discursos, Moisés coloca o povo diante de uma escolha: a fidelidade a Deus é caminho de vida."],
    [31, 6, null, "\"Sede fortes e corajosos, não temais, pois o Senhor vosso Deus vai convosco.\"", "Moisés diz isso pouco antes de passar a liderança a Josué.", "O povo vai entrar na terra sem Moisés, mas não sem Deus, que nunca o abandona."],
    [34, 1, 4, "Do alto do monte Nebo, Moisés contempla a terra prometida em que não vai entrar.", "Deus lhe mostra a terra de Galaad até o mar.", "Moisés vê de longe a promessa realizada para o povo que conduziu por quarenta anos."],
    [34, 5, 7, "Moisés morre na terra de Moab, aos cento e vinte anos, e ninguém conhece o seu túmulo.", "São quase as últimas palavras do Pentateuco.", "Termina a vida do maior profeta de Israel, 'com quem o Senhor tratava face a face'."],
  ],
};

export const passagens = { ...pentateuco, ...passagensHistoricos, ...passagensSapienciais, ...passagensProfeticos, ...passagensEvangelhos, ...passagensEpistolas, ...passagensApocalipse };
