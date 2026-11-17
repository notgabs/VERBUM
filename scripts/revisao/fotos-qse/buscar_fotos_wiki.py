"""Busca a imagem principal do artigo da Wikipédia (inglês) de cada figura, com licença e autor do Wikimedia Commons.
Baixa o arquivo original para <pasta>/<slug>.<ext> e grava creditos.json.
Uso: python -I buscar_fotos_wiki.py <pasta_destino>
"""
import json, sys, time, urllib.parse, urllib.request, urllib.error, re
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path

UA = {"User-Agent": "VerbumGameAssets/1.0 (educational Catholic quiz)"}
TITULOS = {
    "sao-francisco": "Francis of Assisi", "santa-clara": "Clare of Assisi", "santo-antonio": "Anthony of Padua",
    "santa-teresinha": "Thérèse of Lisieux", "madre-teresa": "Mother Teresa", "joao-paulo-ii": "Pope John Paul II",
    "sao-bento": "Benedict of Nursia", "santo-agostinho": "Augustine of Hippo", "sao-tomas": "Thomas Aquinas",
    "faustina": "Faustina Kowalska", "rita-cassia": "Rita of Cascia", "padre-pio": "Padre Pio",
    "maximiliano-kolbe": "Maximilian Kolbe", "sao-domingos": "Saint Dominic", "sao-vicente-paulo": "Vincent de Paul",
    "luis-gonzaga": "Aloysius Gonzaga", "lourenco": "Saint Lawrence", "bento-xvi": "Pope Benedict XVI",
    "papa-francisco": "Pope Francis", "teresa-avila": "Teresa of Ávila", "joao-da-cruz": "John of the Cross",
    "inacio-loyola": "Ignatius of Loyola", "francisco-xavier": "Francis Xavier", "anchieta": "José de Anchieta",
    "irma-dulce": "pt:Dulce dos Pobres", "frei-galvao": "Frei Galvão", "madre-paulina": "pt:Paulina do Coração Agonizante de Jesus",
    "dom-bosco": "John Bosco", "cura-ars": "John Vianney", "bernadete": "Bernadette Soubirous",
    "joana-darc": "Joan of Arc", "catarina-sena": "Catherine of Siena", "carlo-acutis": "pt:Carlo Acutis",
    "santa-monica": "Saint Monica", "sao-jeronimo": "Jerome", "sao-patricio": "Saint Patrick",
    "sao-nicolau": "Saint Nicholas", "sao-jorge": "pt:Jorge da Capadócia", "sao-sebastiao": "Saint Sebastian",
    "santa-luzia": "Saint Lucy", "santa-cecilia": "Saint Cecilia", "bernardo-claraval": "Bernard of Clairvaux",
    "afonso-ligorio": "Alphonsus Liguori", "josemaria": "Josemaría Escrivá", "francisco-sales": "Francis de Sales",
    "gianna": "Gianna Beretta Molla", "bakhita": "Josephine Bakhita", "martinho-lima": "Martin de Porres",
    "rosa-lima": "Rose of Lima", "juan-diego": "Juan Diego", "charbel": "Charbel Makhlouf",
    "edith-stein": "Edith Stein", "joao-xxiii": "Pope John XXIII", "paulo-vi": "Pope Paul VI",
    "pio-x": "Pope Pius X", "gregorio-magno": "Pope Gregory I", "leao-xiv": "Pope Leo XIV",
    "frassati": "Pier Giorgio Frassati", "damiao-molokai": "Father Damien", "sao-benedito": "Benedict the Moor",
}

def get(url, tentativas=5):
    """GET com espera e nova tentativa quando o servidor pede para ir mais devagar (HTTP 429)."""
    for i in range(tentativas):
        req = urllib.request.Request(url, headers=UA)
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == tentativas - 1:
                raise
            espera = int(e.headers.get("Retry-After") or 0) or 15 * (i + 1)
            time.sleep(min(espera, 120))

def api(base, **params):
    params |= {"format": "json", "formatversion": "2"}
    return json.loads(get(base + "?" + urllib.parse.urlencode(params)))

def limpar(html):
    return re.sub(r"<[^>]+>", "", html or "").strip()

dest = Path(sys.argv[1]); dest.mkdir(parents=True, exist_ok=True)
alvos = sys.argv[2:] or list(TITULOS)
creditos_path = dest / "creditos.json"
creditos = json.loads(creditos_path.read_text(encoding="utf-8")) if creditos_path.exists() else {}
for slug in [a for a in alvos if a not in creditos]:
    titulo = TITULOS[slug]
    try:
        lang, titulo = (titulo.split(":", 1) if titulo.startswith("pt:") else ("en", titulo))
        q = api(f"https://{lang}.wikipedia.org/w/api.php", action="query", prop="pageimages", piprop="original|name",
                titles=titulo, redirects=1)
        page = q["query"]["pages"][0]
        arquivo = page.get("pageimage")
        if not arquivo:
            print(slug, "SEM IMAGEM", flush=True); continue
        info = api("https://commons.wikimedia.org/w/api.php", action="query", prop="imageinfo",
                   iiprop="url|extmetadata|size", iiurlwidth="1200", titles="File:" + arquivo)
        ii = info["query"]["pages"][0]["imageinfo"][0]
        meta = ii.get("extmetadata", {})
        url = ii.get("thumburl") or ii["url"]
        ext = Path(urllib.parse.urlparse(url).path).suffix.lower() or ".jpg"
        (dest / f"{slug}{ext}").write_bytes(get(url))
        creditos[slug] = {
            "arquivo": arquivo,
            "pagina": "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(arquivo),
            "autor": limpar(meta.get("Artist", {}).get("value")),
            "licenca": limpar(meta.get("LicenseShortName", {}).get("value")),
            "url_licenca": meta.get("LicenseUrl", {}).get("value", ""),
            "baixado": f"{slug}{ext}",
            "tamanho": [ii.get("width"), ii.get("height")],
        }
        print(slug, "ok", creditos[slug]["licenca"], "|", arquivo, flush=True)
    except Exception as e:
        print(slug, "FALHA", e, flush=True)
    creditos_path.write_text(json.dumps(creditos, ensure_ascii=False, indent=1), encoding="utf-8")
    time.sleep(4)
