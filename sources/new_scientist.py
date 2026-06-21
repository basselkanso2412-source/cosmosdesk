from ._rss_helper import parse_feed


def fetch() -> list[dict]:
    return parse_feed("https://www.newscientist.com/feed/home/", "New Scientist")
