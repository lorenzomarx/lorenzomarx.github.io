#!/usr/bin/env python3
"""Fetch BBC News articles from newsapi.org and write to bbc.json."""
import json
import os
import sys
import requests

API_KEY = os.environ.get('NEWSAPI_KEY')
if not API_KEY:
    sys.exit('NEWSAPI_KEY environment variable is not set')

response = requests.get(
    'https://newsapi.org/v2/top-headlines',
    params={'sources': 'bbc-news', 'apiKey': API_KEY},
    timeout=30,
)
response.raise_for_status()
data = response.json()
if data.get('status') != 'ok':
    sys.exit(f"newsapi error: {data.get('message', data)}")

with open('bbc.json', 'w') as f:
    json.dump(data, f, indent=2, sort_keys=True)
