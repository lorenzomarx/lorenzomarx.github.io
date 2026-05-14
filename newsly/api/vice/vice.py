#!/usr/bin/env python3
"""Fetch Vice News articles from newsapi.org and write to vice.json."""
import json
import os
import sys
import requests

API_KEY = os.environ.get('NEWSAPI_KEY')
if not API_KEY:
    sys.exit('NEWSAPI_KEY environment variable is not set')

# Vice's top-headlines feed is frozen on newsapi (stuck in 2020).
# /v2/everything still returns fresh articles, sorted by publishedAt.
response = requests.get(
    'https://newsapi.org/v2/everything',
    params={'sources': 'vice-news', 'sortBy': 'publishedAt', 'apiKey': API_KEY},
    timeout=30,
)
response.raise_for_status()
data = response.json()
if data.get('status') != 'ok':
    sys.exit(f"newsapi error: {data.get('message', data)}")

with open('vice.json', 'w') as f:
    json.dump(data, f, indent=2, sort_keys=True)
