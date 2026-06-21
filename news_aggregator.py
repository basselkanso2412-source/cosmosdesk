from concurrent.futures import ThreadPoolExecutor, as_completed

from sources.nasa import fetch as nasa_fetch
from sources.arxiv import fetch as arxiv_fetch
from sources.science_daily import fetch as science_daily_fetch
from sources.phys_org import fetch as phys_org_fetch
from sources.space_com import fetch as space_com_fetch
from sources.quanta import fetch as quanta_fetch
from sources.earthsky import fetch as earthsky_fetch
from sources.new_scientist import fetch as new_scientist_fetch

SOURCES = [
    ("NASA",            nasa_fetch),
    ("arXiv",           arxiv_fetch),
    ("ScienceDaily",    science_daily_fetch),
    ("Phys.org",        phys_org_fetch),
    ("Space.com",       space_com_fetch),
    ("Quanta Magazine", quanta_fetch),
    ("EarthSky",        earthsky_fetch),
    ("New Scientist",   new_scientist_fetch),
]

SOURCE_ORDER = [name for name, _ in SOURCES]


def fetch_all_news(category: str = 'all') -> list[dict]:
    results_map: dict[str, dict] = {}
    with ThreadPoolExecutor(max_workers=len(SOURCES)) as executor:
        futures = {executor.submit(fn): name for name, fn in SOURCES}
        for future in as_completed(futures):
            name = futures[future]
            try:
                articles = future.result(timeout=15)
                if category != 'all':
                    articles = [a for a in articles if a.get('category') == category]
                articles.sort(key=lambda a: a.get('timestamp', 0), reverse=True)
                results_map[name] = {'source': name, 'articles': articles, 'error': None}
            except Exception as exc:
                results_map[name] = {'source': name, 'articles': [], 'error': str(exc)}
    return [results_map[name] for name in SOURCE_ORDER if name in results_map]
