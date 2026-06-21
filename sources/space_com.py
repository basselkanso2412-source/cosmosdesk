from ._rss_helper import parse_feed


def fetch() -> list[dict]:
    return parse_feed("https://www.space.com/feeds/all", "Space.com", default_category="astronomy")
