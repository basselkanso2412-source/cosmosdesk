from ._rss_helper import parse_feed


def fetch() -> list[dict]:
    return parse_feed("https://www.quantamagazine.org/feed/", "Quanta Magazine")
