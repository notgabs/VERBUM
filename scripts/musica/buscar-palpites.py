"""Monta a lista de títulos que aparecem na busca do Acerte a música (só os nomes, não toca nada).
Pega as faixas mais ouvidas de artistas católicos no Deezer."""
import json, re, sys, time, unicodedata, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding="utf-8")
UA = {"User-Agent": "VerbumGame/1.0"}
ARTISTAS = ["Padre Marcelo Rossi", "Vida Reluz", "Colo de Deus", "Padre Fábio de Melo", "Ministério Amor e Adoração",
            "Eliana Ribeiro", "Walmir Alencar", "Anjos de Resgate", "Frei Gilson", "Comunidade Católica Shalom",
            "Dunga", "Padre Zezinho", "Ziza Fernandes", "Adoração e Vida", "Celina Borges", "Banda Dom",
            "Padre Reginaldo Manzotti", "Ir. Kelly Patrícia", "Davidson Silva", "Missionário Shalom"]

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.loads(r.read())

def limpa(t):
    t = re.sub(r"\s*[\(\[][^)\]]*(ao vivo|live|feat|part|playback|remaster|vers[aã]o|ac[uú]stic|instrumental|bonus)[^)\]]*[\)\]]", "", t, flags=re.I)
    return re.sub(r"\s+", " ", t).strip(" -")

def chave(t):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", t.lower()).encode("ascii", "ignore").decode())

out, vistos = [], set()
for nome in ARTISTAS:
    try:
        a = get("https://api.deezer.com/search/artist?q=" + urllib.parse.quote(nome) + "&limit=1")["data"]
        if not a:
            print("sem artista:", nome); continue
        art = a[0]
        top = get(f"https://api.deezer.com/artist/{art['id']}/top?limit=12")["data"]
        n = 0
        for t in top:
            titulo = limpa(t["title"])
            if not titulo or "instrumental" in t["title"].lower() or chave(titulo) in vistos:
                continue
            vistos.add(chave(titulo))
            out.append({"titulo": titulo, "artista": art["name"]})
            n += 1
        print(f"{nome} -> {art['name']}: {n}")
    except Exception as e:
        print("falha", nome, e)
    time.sleep(0.4)
json.dump(out, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "títulos")
