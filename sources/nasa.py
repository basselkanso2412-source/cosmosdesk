from ._rss_helper import parse_feed

NASA_FEEDS = [
    ("https://www.nasa.gov/rss/dyn/breaking_news.rss", "NASA"),
    ("https://www.nasa.gov/rss/dyn/solar_system.rss", "NASA Solar System"),
    ("https://www.nasa.gov/rss/dyn/universe.rss", "NASA Universe"),
]


def fetch() -> list[dict]:
    articles = []
    for url, name in NASA_FEEDS:
        articles.extend(parse_feed(url, name))
    return articles
