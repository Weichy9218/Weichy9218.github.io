"""Generate rss.xml and sitemap.xml from the maintained static pages."""
from __future__ import annotations

from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path
from xml.sax.saxutils import escape
import re

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://weichy9218.github.io"


def parse_note(path: Path) -> dict[str, str]:
    html = path.read_text(encoding="utf-8")
    slug = path.parent.name
    h1_m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
    title = re.sub(r"<[^>]+>", "", h1_m.group(1)).strip() if h1_m else slug
    desc_m = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', html, re.S)
    desc = " ".join(desc_m.group(1).split()) if desc_m else title
    date_m = re.search(r"\b(20\d{2}-\d{2}-\d{2})\b", html)
    date_str = date_m.group(1) if date_m else "2026-01-01"
    return {
        "slug": slug,
        "title": title,
        "description": desc,
        "date": date_str,
        "url": f"{SITE}/notes/{slug}/",
    }


def build() -> None:
    notes = [parse_note(p) for p in sorted((ROOT / "notes").glob("*/index.html"))]
    notes.sort(key=lambda item: (item["date"], item["slug"]), reverse=True)

    now = datetime.now(timezone.utc)
    rss_items = []
    for n in notes:
        dt = datetime.strptime(n["date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        rss_items.append(
            "    <item>\n"
            f"      <title>{escape(n['title'])}</title>\n"
            f"      <link>{escape(n['url'])}</link>\n"
            f"      <guid isPermaLink=\"true\">{escape(n['url'])}</guid>\n"
            f"      <pubDate>{format_datetime(dt)}</pubDate>\n"
            f"      <description>{escape(n['description'])}</description>\n"
            "    </item>"
        )

    rss_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        "    <title>Chuyang Wei | Research Notes</title>\n"
        f"    <link>{SITE}/notes/</link>\n"
        f'    <atom:link href="{SITE}/rss.xml" rel="self" type="application/rss+xml" />\n'
        "    <description>Research notes on RSI, Benchmark RSI, agent post-training, optimization, context attribution, retrieval, diffusion RL, and time series.</description>\n"
        "    <language>zh-CN</language>\n"
        f"    <lastBuildDate>{format_datetime(now)}</lastBuildDate>\n"
        + "\n".join(rss_items)
        + "\n  </channel>\n"
        "</rss>\n"
    )
    (ROOT / "rss.xml").write_text(rss_xml, encoding="utf-8")

    latest_date = notes[0]["date"] if notes else now.strftime("%Y-%m-%d")
    sitemap_entries = [
        (f"{SITE}/", latest_date, "1.0"),
        (f"{SITE}/notes/", latest_date, "0.9"),
        (f"{SITE}/cv/", latest_date, "0.8"),
    ]
    for n in notes:
        sitemap_entries.append((n["url"], n["date"], "0.7"))

    url_blocks = []
    for loc, lastmod, prio in sitemap_entries:
        url_blocks.append(
            "  <url>\n"
            f"    <loc>{escape(loc)}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n"
            f"    <priority>{prio}</priority>\n"
            "  </url>"
        )

    sitemap_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(url_blocks)
        + "\n</urlset>\n"
    )
    (ROOT / "sitemap.xml").write_text(sitemap_xml, encoding="utf-8")
    print(f"Generated rss.xml ({len(notes)} notes) and sitemap.xml ({len(sitemap_entries)} URLs).")


if __name__ == "__main__":
    build()
