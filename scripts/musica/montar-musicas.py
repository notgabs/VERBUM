"""Monta public/data/musicas.json para o modo "Acerte a música".

- MUSICAS: as faixas que podem ser sorteadas. Cada uma aponta para o ID da faixa no Deezer;
  o jogo toca a prévia oficial de 30 s do Deezer (só os primeiros 20 s dela), buscada na hora.
- palpites.json (gerado por buscar-palpites.py): títulos de louvores conhecidos que só aparecem
  na busca, para que o palpite não fique óbvio. Eles não tocam.

Para acrescentar uma música jogável: ache o ID no Deezer (https://www.deezer.com/track/<ID>)
e coloque uma linha em MUSICAS.
Uso: python scripts/musica/montar-musicas.py
"""
import json, re, sys, unicodedata
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")

AQUI = Path(__file__).parent
MUSICAS = [
    # id, título, artista, ID no Deezer, apelidos aceitos no palpite
    ("faz-um-milagre-em-mim", "Faz um Milagre em Mim", "Padre Marcelo Rossi", 13784053, []),
    ("espirito-da-verdade", "Espírito da Verdade", "Tony Allysson", 826490532, []),
    ("a-casa-e-sua", "A Casa É Sua", "Casa Worship", 1751492317, []),
    ("o-fogo-ardera", "O Fogo Arderá", "Alexsander Lúcio", 4187162112, []),
    ("se-hoje-me-toca", "Se Hoje Me Toca", "José Jr", 3275892691, []),
    ("sacrario-do-amor", "Sacrário do Amor", "Rodrigo Torres", 3088163371, []),
    ("me-leva-pra-casa", "Me Leva pra Casa", "Gabriel Guedes de Almeida", 4304445852, []),
    ("o-maior-vilao-sou-eu", "O Maior Vilão Sou Eu", "Sarah Beatriz", 384152091, []),
    ("coracao-novo", "Coração Novo", "Banda Arkanjos", 3643102582, []),
    ("aquieta-minhalma", "Aquieta Minh'alma", "Ministério Zoe", 1355420212, []),
    ("santo-espirito", "Santo Espírito", "Dunamis Music e Laura Souguellis", 4156462432, []),
    ("ousado-amor", "Ousado Amor", "Isaías Saad", 4303966412, []),
    ("chamado-irresistivel", "Chamado Irresistível", "Renovação Carismática Católica", 1604701862, ["Chamada Irresistível"]),
    ("ezequiel-47", "Ezequiel 47", "Thiago Brito", 3377057721, []),
    ("eu-seguirei", "Eu Seguirei", "Frei Gilson", 3562109311, []),
    ("o-poco", "O Poço", "Juninho Cassimiro", 1714365287, []),
    ("tua-alegria", "Tua Alegria", "Drops INA e Paulo Vicente", 4304114672, []),
    ("nada-te-perturbe", "Nada Te Perturbe", "Ir. Míria T. Kolling", 105759110, []),
    ("vejam-eu-andei", "Vejam, Eu Andei", "Padre Paulo Gonzales", 937191082, ["Vejam Eu Andei pelas Vilas"]),
    ("minha-essencia", "Minha Essência", "Thiago Brado", 138803131, []),
    ("colo-de-mae", "Colo de Mãe", "Frei Gilson", 3565488001, []),
    ("amar-como-jesus-amou", "Amar como Jesus Amou", "Padre Marcelo Rossi", 13784047, []),
    ("noites-traicoeiras", "Noites Traiçoeiras", "Padre Marcelo Rossi", 128503847, ["Deus está aqui neste momento"]),
    ("quem-e-esta-que-avanca", "Quem É Esta que Avança como a Aurora", "Padre Marcelo Rossi", 91275116, ["Quem é Esta"]),
    ("tudo-e-do-pai", "Tudo É do Pai", "Padre Marcelo Rossi", 128503851, []),
    ("perfeito-e-quem-te-criou", "Perfeito É Quem Te Criou", "Vida Reluz", 359188351, []),
    ("como-es-lindo", "Como És Lindo", "Vida Reluz", 71698857, []),
    ("diante-do-rei", "Diante do Rei", "Vida Reluz", 71698756, []),
    ("confia-em-mim", "Confia em Mim", "Vida Reluz", 71698763, []),
    ("cartas-ao-remetente", "Cartas ao Remetente", "Rosa de Saron", 78469883, []),
    ("minha-historia-e-sua", "Minha História É Sua", "Gerados pela Imaculada", 2405970875, ["A Minha História É Sua"]),
    ("nao-se-apagara", "Não Se Apagará", "Gerados pela Imaculada", 3226473001, []),
    ("odres-novos", "Odres Novos", "Gerados pela Imaculada", 3726143362, []),
    ("me-deixa-ficar", "Me Deixa Ficar", "Gerados pela Imaculada", 4141888141, []),
    ("eis-me-aqui", "Eis-Me Aqui", "Colo de Deus", 1578393382, []),
    ("riqueza-eterna", "Riqueza Eterna", "Colo de Deus", 2081137297, []),
    ("yeshua-colo-de-deus", "Yeshua", "Colo de Deus", 135756062, []),
    ("eu-nao-vou-parar-de-te-adorar", "Eu Não Vou Parar de Te Adorar", "Colo de Deus", 135756058, ["Não Vou Parar de Te Adorar"]),
    ("se-ninguem-te-adorar-eu-vou", "Se Ninguém Te Adorar Eu Vou", "Colo de Deus", 144868084, []),
    ("casa", "Casa", "Colo de Deus", 807602182, []),
    ("mistica-sublime", "Mística Sublime", "Colo de Deus", 1213157192, []),
    ("jesus-meu-esposo", "Jesus Meu Esposo", "Colo de Deus", 429754962, []),
    ("ave-maria", "Ave Maria", "Colo de Deus", 2864238492, []),
    ("como-nao-me-apaixonar", "Como Não Me Apaixonar", "Colo de Deus", 730829082, []),
    ("eu-em-seu-lugar", "Eu em Seu Lugar", "Colo de Deus", 2699267762, []),
    ("desejado-das-nacoes", "Desejado das Nações", "Colo de Deus", 1830232357, []),
    ("isaias-53", "Isaías 53", "Colo de Deus", 2699267662, []),
    ("mae-da-sarca", "Mãe da Sarça", "Colo de Deus", 2385659295, []),
    ("jesus", "Jesus", "Colo de Deus", 3210612741, []),
    ("fogo-santo", "Fogo Santo", "Colo de Deus", 112596636, []),
    ("amor-incomparavel", "Amor Incomparável", "Colo de Deus", 730829042, []),
    ("abba-pai", "Abba Pai", "Colo de Deus", 2868824372, []),
    ("perdulario", "Perdulário", "Colo de Deus", 3886549981, []),
    ("lazaro", "Lázaro", "Colo de Deus", 3088902021, []),
    ("desperta", "Desperta", "Colo de Deus", 135756060, []),
    ("gavetas", "Gavetas", "Colo de Deus", 3724861672, ["Ministração Gavetas"]),
    ("pare-o-tempo", "Pare o Tempo", "Colo de Deus", 526710172, []),
    ("cheiro-de-rosas", "Cheiro de Rosas", "Colo de Deus", 2385659285, []),
    ("raboni", "Raboni", "Cristo Alegria", 3067683521, []),
    ("arranca-teu-coracao", "Arranca Teu Coração", "Cristo Alegria", 4381615541, ["Arranca o Teu Coração"]),
    ("jardim", "Jardim", "Fraternidade São João Paulo II", 1366702632, []),
    ("romanos-12", "Romanos 12", "Fraternidade São João Paulo II", 2522317111, []),
    ("99-ovelhas", "99 Ovelhas", "Fraternidade São João Paulo II", 3899608701, ["Noventa e Nove Ovelhas"]),
    ("perfume", "Perfume", "Fraternidade São João Paulo II", 3219201941, []),
    ("terra-seca", "Terra Seca", "Fraternidade São João Paulo II", 2721724432, []),
    ("e-tudo-sobre-voce", "É Tudo Sobre Você / Ser Mudado", "Morada", 4304431622, ["É Tudo Sobre Você", "Ser Mudado"]),
    ("nao-ha-amor-igual", "Não Há Amor Igual", "Morada", 4304431532, []),
    ("para-que-entre-o-rei", "Para Que Entre o Rei", "Morada", 4304424662, []),
    ("emaus", "Emaús", "Morada", 4304431542, []),
    ("rasga-os-ceus", "Rasga os Céus", "Songs Five Music", 2212091347, []),
    ("na-fenda-da-rocha", "Na Fenda da Rocha", "Songs Five Music", 2212091357, []),
    ("amar-como-voce", "Amar como Você", "Songs Five Music", 2212091367, ["Amar como Você Me Ama"]),
    ("yeshua-songs-five", "Yeshua", "Songs Five Music", 2212091377, []),
    ("alfa-e-omega", "Alfa e Ômega", "Songs Five Music", 2753799351, []),
    ("colado-a-ti", "Colado a Ti", "Songs Five Music", 2753799381, []),
]
# Títulos da lista automática que não servem como palpite (medleys, repetidos, outra língua, nome da banda)
FORA = {"anjosderesgate", "elrociodelamanana", "amigospelafemaisqueamigos"}
TROCAS = {"Música Pegadas na Areia": "Pegadas na Areia", "Um certo Galileu": "Um Certo Galileu",
          "A barca (Pescador de hombres)": "A Barca", "Oração de São Francisco Bonus Track": "Oração de São Francisco",
          "Estás Entre Nós (Tu És Minha Vida)": "Estás Entre Nós", "Ninguém Te Ama Como Eu (Mensagem Entrega)": "Ninguém Te Ama Como Eu",
          "Aos Pés de Tua Cruz": "Aos Pés da Tua Cruz", "Eu Te Levantarei (Remix)": "Eu Te Levantarei",
          "Força e Vitória ao vivo": "Força e Vitória", "Pelos Prados e Campinas Salmo 22": "Pelos Prados e Campinas",
          "Tesouro singelo": "Tesouro Singelo"}

# Por enquanto a busca mostra só as músicas jogáveis. Troque para True para incluir os títulos de palpites.json.
USAR_PALPITES = False

def chave(t):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", t.lower()).encode("ascii", "ignore").decode())

def busca_url(base, titulo, artista):
    from urllib.parse import quote
    return base + quote(f"{titulo} {artista}")

saida = {"musicas": [], "outrasMusicas": []}
vistos = set()
ids = [m[0] for m in MUSICAS]
assert len(ids) == len(set(ids)), "id repetido"
assert len({m[3] for m in MUSICAS}) == len(MUSICAS), "faixa do Deezer repetida"
for mid, titulo, artista, deezer, apelidos in MUSICAS:
    vistos.add(chave(titulo))
    saida["musicas"].append({
        "id": mid, "titulo": titulo, "artista": artista, "deezerId": deezer, "apelidos": apelidos,
        "deezer": f"https://www.deezer.com/track/{deezer}",
        "youtube": busca_url("https://www.youtube.com/results?search_query=", titulo, artista),
        "spotify": busca_url("https://open.spotify.com/search/", titulo, artista),
    })

for p in (json.loads((AQUI / "palpites.json").read_text(encoding="utf-8")) if USAR_PALPITES else []):
    titulo = re.sub(r"\s+(Ao Vivo|ao vivo)$", "", p["titulo"].strip())
    titulo = TROCAS.get(titulo, titulo)
    if "/" in titulo or ":" in titulo or "(" in titulo or "medley" in titulo.lower() or len(titulo) > 48:
        continue
    k = chave(titulo)
    if k in vistos or k in FORA:
        continue
    vistos.add(k)
    saida["outrasMusicas"].append({"titulo": titulo, "artista": p["artista"].strip()})

destino = AQUI.parent.parent / "public" / "data" / "musicas.json"
destino.write_text(json.dumps(saida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(len(saida["musicas"]), "jogáveis,", len(saida["outrasMusicas"]), "só para palpite")
