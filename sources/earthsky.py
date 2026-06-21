from ._rss_helper import parse_feed


def fetch() -> list[dict]:
    return parse_feed("https://earthsky.org/feed/", "EarthSky", default_category="astronomy")
