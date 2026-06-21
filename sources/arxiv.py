from ._rss_helper import parse_feed

ARXIV_FEEDS = [
    ("https://export.arxiv.org/rss/astro-ph", "arXiv Astrophysics", "astrophysics"),
    ("https://export.arxiv.org/rss/quant-ph", "arXiv Quantum Physics", "quantum"),
    ("https://export.arxiv.org/rss/gr-qc",    "arXiv Cosmology",       "cosmology"),
    ("https://export.arxiv.org/rss/q-bio",    "arXiv Biology",         "evolution"),
]


def fetch() -> list[dict]:
    articles = []
    for url, name, category in ARXIV_FEEDS:
        articles.extend(parse_feed(url, name, default_category=category))
    return articles
