import json
import os
import time
from datetime import date
from flask import Flask, render_template, jsonify, request, Response
from news_aggregator import fetch_all_news
from topics_data import TOPICS, TIMELINE, DAILY_FACTS
from scientists_data import SCIENTISTS
from extras_data import GLOSSARY, BOOKS, ON_THIS_DAY, SPACE_EVENTS, MEDIA_PICKS
from debunked_data import DEBUNKED
from arguments_data import FALLACIES, SCRIPTURE_VS_SCIENCE, DESIGNED_VS_ACTUAL, PHILOSOPHY_TREE
from articles_data import ARTICLES

app = Flask(__name__)

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/news')
def news():
    category = request.args.get('category', 'all').lower()
    data = fetch_all_news(category)
    return jsonify(data)


@app.route('/api/topics')
def topics():
    brief = [{
        'slug':     t['slug'],
        'title':    t['title'],
        'subtitle': t['subtitle'],
        'category': t['category'],
        'color':    t['color'],
        'icon':     t['icon'],
        'summary':  t['summary'],
    } for t in TOPICS]
    return jsonify(brief)


@app.route('/api/topic/<slug>')
def topic(slug):
    t = next((t for t in TOPICS if t['slug'] == slug), None)
    if not t:
        return jsonify({'error': 'Topic not found'}), 404
    return jsonify(t)


@app.route('/api/timeline')
def timeline():
    return jsonify(TIMELINE)


@app.route('/api/scientists')
def scientists():
    return jsonify(SCIENTISTS)


@app.route('/api/daily_fact')
def daily_fact():
    idx = date.today().timetuple().tm_yday % len(DAILY_FACTS)
    return jsonify(DAILY_FACTS[idx])


@app.route('/api/glossary')
def glossary():
    return jsonify(GLOSSARY)


@app.route('/api/books')
def books():
    return jsonify(BOOKS)


@app.route('/api/on_this_day')
def on_this_day():
    today_key = date.today().strftime('%m-%d')
    match = next((e for e in ON_THIS_DAY if e['date'] == today_key), None)
    if not match:
        idx = date.today().timetuple().tm_yday % len(ON_THIS_DAY)
        match = ON_THIS_DAY[idx]
    return jsonify(match)


@app.route('/api/events')
def events():
    return jsonify(SPACE_EVENTS)


@app.route('/api/debunked')
def debunked():
    return jsonify(DEBUNKED)


@app.route('/api/media')
def media():
    return jsonify(MEDIA_PICKS)


@app.route('/api/fallacies')
def fallacies():
    return jsonify(FALLACIES)


@app.route('/api/scripture_vs_science')
def scripture_vs_science():
    return jsonify(SCRIPTURE_VS_SCIENCE)


@app.route('/api/designed_vs_actual')
def designed_vs_actual():
    return jsonify(DESIGNED_VS_ACTUAL)


@app.route('/api/philosophy_tree')
def philosophy_tree():
    return jsonify(PHILOSOPHY_TREE)


@app.route('/api/articles')
def articles():
    brief = [{
        'id':       a['id'],
        'title':    a['title'],
        'subtitle': a['subtitle'],
        'category': a['category'],
        'icon':     a['icon'],
        'color':    a['color'],
        'read_time': a['read_time'],
        'intro':    a['intro'],
    } for a in ARTICLES]
    return jsonify(brief)


@app.route('/api/article/<article_id>')
def article(article_id):
    a = next((a for a in ARTICLES if a['id'] == article_id), None)
    if not a:
        return jsonify({'error': 'Article not found'}), 404
    return jsonify(a)


@app.route('/api/quiz')
def quiz():
    items = []
    for t in TOPICS:
        for m in t.get('misconceptions', []):
            items.append({'topic': t['title'], 'category': t['category'], 'myth': m['myth'], 'reality': m['reality']})
    return jsonify(items)


@app.route('/api/ask', methods=['POST'])
def ask():
    body = request.get_json(silent=True) or {}
    messages = body.get('messages', [])
    if not messages:
        return jsonify({'error': 'No messages'}), 400

    system_prompt = body.get('system') or (
        "You are a science communicator specializing in cosmology, quantum physics, astrophysics, "
        "evolutionary biology, and the scientific case for a naturalistic worldview. "
        "You explain complex scientific topics with clarity and enthusiasm. "
        "You are honest about what science does and does not know. "
        "You do not shy away from explaining where scientific evidence contradicts religious claims, "
        "but you do so respectfully and factually. "
        "Always cite relevant scientists, experiments, and discoveries. "
        "If asked about religion or God, give the scientific perspective honestly."
    )

    anthropic_key = os.getenv('ANTHROPIC_API_KEY', '')
    openai_key    = os.getenv('OPENAI_API_KEY', '')
    gemini_key    = os.getenv('GEMINI_API_KEY', '')

    def stream_anthropic():
        import anthropic
        client = anthropic.Anthropic(api_key=anthropic_key)
        with client.messages.stream(
            model='claude-opus-4-8',
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield f'data: {json.dumps({"delta": text})}\n\n'
        yield 'data: [DONE]\n\n'

    def stream_openai():
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        resp = client.chat.completions.create(
            model='gpt-4o',
            stream=True,
            messages=[{'role': 'system', 'content': system_prompt}] + messages,
        )
        for chunk in resp:
            delta = chunk.choices[0].delta.content or ''
            if delta:
                yield f'data: {json.dumps({"delta": delta})}\n\n'
        yield 'data: [DONE]\n\n'

    def stream_gemini():
        from google import genai as gai
        from google.genai import types as gtypes
        client = gai.Client(api_key=gemini_key)
        # Build contents list: prepend system as a user turn for context
        contents = []
        for m in messages:
            role = 'user' if m['role'] == 'user' else 'model'
            contents.append(gtypes.Content(role=role, parts=[gtypes.Part(text=m['content'])]))
        cfg = gtypes.GenerateContentConfig(system_instruction=system_prompt, max_output_tokens=1024)
        for chunk in client.models.generate_content_stream(
            model='gemini-2.5-flash',
            contents=contents,
            config=cfg,
        ):
            text = chunk.text or ''
            if text:
                yield f'data: {json.dumps({"delta": text})}\n\n'
        yield 'data: [DONE]\n\n'

    if anthropic_key:
        return Response(stream_anthropic(), mimetype='text/event-stream')
    if gemini_key:
        return Response(stream_gemini(), mimetype='text/event-stream')
    if openai_key:
        return Response(stream_openai(), mimetype='text/event-stream')
    return jsonify({'error': 'No API key configured. Add GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY to .env'}), 503


# ── Entry ───────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    app.run(debug=True, port=5001)
