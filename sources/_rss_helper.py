import feedparser
import time
import re

CATEGORY_KEYWORDS = {
    'quantum': [
        'quantum', 'qubit', 'superposition', 'entanglement', 'wave function',
        'heisenberg', 'schrödinger', 'schrodinger', 'uncertainty principle',
        'quantum computing', 'quantum mechanics', 'photon', 'spin',
        'decoherence', 'tunneling', 'wavefunction', 'planck'
    ],
    'cosmology': [
        'big bang', 'dark energy', 'dark matter', 'cosmic inflation', 'multiverse',
        'cosmology', 'cosmic microwave background', 'cmb', 'hubble constant',
        'expanding universe', 'redshift', 'galaxy cluster', 'large-scale structure',
        'baryon', 'lambda-cdm', 'dark universe', 'cosmological'
    ],
    'astrophysics': [
        'black hole', 'neutron star', 'supernova', 'gravitational wave',
        'pulsar', 'quasar', 'event horizon', 'singularity', 'hawking',
        'stellar', 'star formation', 'accretion disk', 'magnetar',
        'white dwarf', 'gamma-ray burst', 'ligo', 'virgo', 'james webb'
    ],
    'astronomy': [
        'planet', 'exoplanet', 'solar system', 'telescope', 'nasa', 'esa',
        'mars', 'moon', 'jupiter', 'saturn', 'asteroid', 'comet', 'galaxy',
        'nebula', 'milky way', 'orbit', 'spacecraft', 'mission', 'observatory',
        'eclipse', 'aurora', 'space station', 'hubble', 'jwst'
    ],
    'evolution': [
        'evolution', 'darwin', 'natural selection', 'fossil', 'dna', 'genome',
        'species', 'mutation', 'adaptation', 'phylogen', 'ancestor',
        'abiogenesis', 'origin of life', 'rna world', 'cambrian', 'extinction',
        'homo sapiens', 'neanderthal', 'primate', 'hominid', 'ape',
        'genetics', 'gene', 'chromosome', 'common ancestor', 'tree of life'
    ],
}

HEADERS = {
    'User-Agent': 'CosmosDesk/1.0 basselkanso2412@gmail.com'
}


def categorize(text: str) -> str:
    text_lower = text.lower()
    scores = {cat: 0 for cat in CATEGORY_KEYWORDS}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[cat] += 1
    best = max(scores, key=lambda k: scores[k])
    return best if scores[best] > 0 else 'general'


def parse_feed(url: str, source_name: str, default_category: str = 'general') -> list[dict]:
    try:
        feed = feedparser.parse(url, request_headers=HEADERS)
        articles = []
        for entry in feed.entries[:20]:
            title = entry.get('title', '').strip()
            link = entry.get('link', '')
            summary = re.sub(r'<[^>]+>', '', entry.get('summary', entry.get('description', ''))).strip()[:400]
            published = entry.get('published_parsed') or entry.get('updated_parsed')
            ts = int(time.mktime(published)) if published else int(time.time())
            full_text = f"{title} {summary}"
            category = categorize(full_text) if default_category == 'general' else default_category
            if title and link:
                articles.append({
                    'title': title,
                    'url': link,
                    'summary': summary,
                    'timestamp': ts,
                    'source': source_name,
                    'category': category,
                })
        return articles
    except Exception:
        return []
