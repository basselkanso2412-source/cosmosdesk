from ._rss_helper import parse_feed

FEEDS = [
    ("https://www.sciencedaily.com/rss/space_time.xml",           "ScienceDaily Space"),
    ("https://www.sciencedaily.com/rss/fossils_ruins/evolution.xml", "ScienceDaily Evolution"),
    ("https://www.sciencedaily.com/rss/matter_energy.xml",        "ScienceDaily Physics"),
    ("https://www.sciencedaily.com/rss/plants_animals.xml",       "ScienceDaily Biology"),
]


def fetch() -> list[dict]:
    articles = []
    for url, name in FEEDS:
        articles.extend(parse_feed(url, name))
    return articles
