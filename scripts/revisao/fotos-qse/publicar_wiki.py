"""Recorta em quadrado, converte para webp 512x512 e publica em public/quem-sou-eu/, com os créditos.
O recorte de imagens verticais fica no alto (onde costuma estar o rosto); FOCO ajusta casos específicos
(0 = topo, 0.5 = centro, 1 = base da parte que sobra).
Uso: python publicar_wiki.py <pasta do projeto>
"""
import json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).parent
PASTA = HERE / "wiki_fotos"
proj = Path(sys.argv[1])
dest = proj / "public" / "quem-sou-eu"
dest.mkdir(parents=True, exist_ok=True)
FOCO = json.loads((HERE / "foco_wiki.json").read_text(encoding="utf-8")) if (HERE / "foco_wiki.json").exists() else {}
creditos = json.loads((PASTA / "creditos.json").read_text(encoding="utf-8"))

for slug, c in creditos.items():
    f = FOCO.get(slug, 0.12)
    # Quadrado com o lado menor; desloca o recorte pela fração `f` do que sobra no outro eixo.
    vf = (f"crop='min(iw,ih)':'min(iw,ih)':'(iw-min(iw,ih))*{f if f is not None else 0.5}':'(ih-min(iw,ih))*{f}',"
          "scale=512:512:flags=lanczos,format=yuv420p")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(PASTA / c["baixado"]), "-vf", vf,
                    "-frames:v", "1", "-c:v", "libwebp", "-quality", "88", str(dest / f"{slug}.webp")], check=True)

# Créditos públicos (licenças CC exigem atribuição)
linhas = ["# Créditos das imagens do modo \"Quem sou eu?\"", "",
          "Imagens obtidas no Wikimedia Commons (imagem principal do artigo da Wikipédia de cada figura).",
          "Foram recortadas em quadrado e reduzidas para 512 x 512.", ""]
for slug, c in sorted(creditos.items()):
    autor = c["autor"] or "autor desconhecido"
    lic = c["licenca"] or "ver página"
    linhas.append(f"- **{slug}**: [{c['arquivo']}]({c['pagina']}), {autor}, {lic}")
(dest / "CREDITOS.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
(proj / "public" / "data" / "quem-sou-eu-creditos.json").write_text(
    json.dumps({s: {k: c[k] for k in ("arquivo", "pagina", "autor", "licenca", "url_licenca")} for s, c in creditos.items()},
               ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(len(creditos), "imagens publicadas")
