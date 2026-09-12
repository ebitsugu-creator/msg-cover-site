#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path
from urllib.parse import urlparse

import yaml

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "_sns_share"
OUTPUT = ROOT / "share"
SITE = "https://miraiwithyou.jp"
DEFAULT_IMAGE = "/assets/img/ogp.jpg"


def read_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8-sig")
    m = re.match(r"^---\s*\r?\n(.*?)\r?\n---(?:\s*\r?\n|\s*$)", text, re.S)
    if not m:
        return {}
    data = yaml.safe_load(m.group(1)) or {}
    return data if isinstance(data, dict) else {}


def truthy(value, default=True) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() not in {"false", "0", "no", "off", "null", "none", ""}


def normalize_image(value) -> str:
    if isinstance(value, dict):
        value = value.get("url") or value.get("src") or value.get("path") or ""
    value = str(value or "").strip()
    if not value:
        value = DEFAULT_IMAGE
    if value.startswith(("http://", "https://")):
        return value
    if value.startswith("/public/images/"):
        return SITE + value
    if value.startswith("public/images/"):
        return SITE + "/" + value
    if value.startswith("/images/"):
        return SITE + "/public" + value
    if value.startswith("images/"):
        return SITE + "/public/" + value
    if not value.startswith("/"):
        value = "/" + value
    return SITE + value


def valid_target(value) -> str:
    value = str(value or "").strip()
    try:
        p = urlparse(value)
        if p.scheme in {"http", "https"} and p.netloc:
            return value
    except Exception:
        pass
    return SITE + "/"


def clean_text(value) -> str:
    value = str(value or "")
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def render_page(slug: str, data: dict) -> str:
    title = clean_text(data.get("title")) or "中くらいの政府"
    summary = clean_text(data.get("summary")) or "中くらいの政府の記事をご紹介します。"
    target = valid_target(data.get("targetUrl"))
    image = normalize_image(data.get("thumbnail"))
    share_url = f"{SITE}/share/{slug}/"

    e_title = html.escape(title, quote=True)
    e_summary = html.escape(summary, quote=True)
    e_target = html.escape(target, quote=True)
    e_image = html.escape(image, quote=True)
    e_share = html.escape(share_url, quote=True)
    js_target = json.dumps(target, ensure_ascii=False).replace("</", "<\\/")

    return f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,follow">
  <title>{e_title}｜中くらいの政府</title>
  <meta name="description" content="{e_summary}">
  <link rel="canonical" href="{e_target}">

  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="中くらいの政府">
  <meta property="og:title" content="{e_title}">
  <meta property="og:description" content="{e_summary}">
  <meta property="og:url" content="{e_share}">
  <meta property="og:image" content="{e_image}">
  <meta property="og:image:alt" content="{e_title}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e_title}">
  <meta name="twitter:description" content="{e_summary}">
  <meta name="twitter:image" content="{e_image}">

  <style>
    *{{box-sizing:border-box}}html,body{{margin:0;min-height:100%;background:#fff;color:#17243a}}
    body{{font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif;display:grid;place-items:center;padding:28px}}
    main{{width:min(92vw,760px);text-align:center}}
    img{{display:block;width:100%;max-height:399px;object-fit:cover;border-radius:18px;margin:0 auto 22px;background:#f3f4f6}}
    h1{{font-size:clamp(22px,3vw,32px);line-height:1.5;margin:0 0 10px}}
    p{{font-size:15px;line-height:1.85;color:#596579;margin:0 auto 22px;max-width:680px}}
    a{{display:inline-block;padding:11px 22px;border-radius:999px;background:#102846;color:#fff;text-decoration:none;font-weight:700}}
    small{{display:block;margin-top:16px;color:#8a93a2}}
  </style>
</head>
<body>
  <main>
    <img src="{e_image}" alt="">
    <h1>{e_title}</h1>
    <p>{e_summary}</p>
    <a href="{e_target}">本記事を開く</a>
    <small>通常は本記事へ自動的に移動します。</small>
  </main>
  <script>
    (function(){{
      var q = new URLSearchParams(location.search);
      if (q.get('preview') === '1') return;
      var target = {js_target};
      window.setTimeout(function(){{ location.replace(target); }}, 450);
    }}());
  </script>
</body>
</html>
'''


def render_index(items: list[dict]) -> str:
    cards = []
    for item in items:
        title = html.escape(item["title"], quote=True)
        url = html.escape(item["url"], quote=True)
        preview = html.escape(item["url"] + "?preview=1", quote=True)
        cards.append(f'''<article class="card">
      <h2>{title}</h2>
      <p class="url">{url}</p>
      <div class="actions">
        <a class="open" href="{preview}" target="_blank" rel="noopener">プレビュー</a>
        <button class="copy" type="button" data-copy="{url}">URLをコピー</button>
      </div>
    </article>''')
    content = "\n    ".join(cards) if cards else '<p class="empty">まだSNS共有ページはありません。Pitで作成すると、ここに自動で表示されます。</p>'
    return f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>SNSシェアURL一覧｜中くらいの政府</title>
  <style>
    *{{box-sizing:border-box}}body{{margin:0;background:#f6f7f9;color:#17243a;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif}}
    .wrap{{width:min(94vw,900px);margin:0 auto;padding:44px 0 70px}}h1{{font-size:28px;margin:0 0 8px}}.lead{{color:#687386;line-height:1.8;margin:0 0 28px}}
    .card,.empty{{background:#fff;border:1px solid #e4e8ef;border-radius:18px;padding:20px;margin:0 0 14px}}.card h2{{font-size:18px;line-height:1.5;margin:0 0 8px}}.url{{font-size:13px;word-break:break-all;color:#6c7688;margin:0 0 13px}}
    .actions{{display:flex;gap:10px;flex-wrap:wrap}}.actions a,.actions button{{border:0;border-radius:999px;padding:9px 16px;font:inherit;font-size:13px;cursor:pointer;text-decoration:none}}.open{{background:#102846;color:#fff}}.copy{{background:#e9edf3;color:#17243a}}
  </style>
</head>
<body>
  <main class="wrap">
    <h1>SNSシェアURL一覧</h1>
    <p class="lead">Facebookなどには「URLをコピー」で取得した共有URLを貼ってください。「プレビュー」は自動転送せず、カード内容を確認できます。</p>
    {content}
  </main>
  <script>
    document.addEventListener('click', function(e){{
      var b=e.target.closest('[data-copy]'); if(!b)return;
      var v=b.getAttribute('data-copy')||'';
      navigator.clipboard.writeText(v).then(function(){{var old=b.textContent;b.textContent='コピーしました';setTimeout(function(){{b.textContent=old}},1200);}});
    }});
  </script>
</body>
</html>
'''


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    # Remove only generated entry directories; keep unrelated files if any.
    for child in list(OUTPUT.iterdir()):
        if child.is_dir() and (child / ".sns-share-generated").exists():
            shutil.rmtree(child)

    items = []
    if SOURCE.exists():
        for path in sorted(SOURCE.glob("*.md")):
            if path.name.startswith("."):
                continue
            data = read_frontmatter(path)
            if not data or not truthy(data.get("published"), True):
                continue
            slug = path.stem
            outdir = OUTPUT / slug
            outdir.mkdir(parents=True, exist_ok=True)
            (outdir / "index.html").write_text(render_page(slug, data), encoding="utf-8")
            (outdir / ".sns-share-generated").write_text("generated\n", encoding="utf-8")
            items.append({
                "title": clean_text(data.get("title")) or slug,
                "url": f"{SITE}/share/{slug}/",
            })

    items.reverse()
    (OUTPUT / "index.html").write_text(render_index(items), encoding="utf-8")
    print(f"Generated {len(items)} SNS share page(s).")


if __name__ == "__main__":
    main()
