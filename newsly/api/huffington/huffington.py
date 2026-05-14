#!/usr/bin/env python3
"""Fetch Huffington Post articles from newsapi.org and write to huff.json."""
import json
import os
import sys
import requests

API_KEY = os.environ.get('NEWSAPI_KEY')
if not API_KEY:
    sys.exit('NEWSAPI_KEY environment variable is not set')

response = requests.get(
    'https://newsapi.org/v2/top-headlines',
    params={'sources': 'the-huffington-post', 'apiKey': API_KEY},
    timeout=30,
)
response.raise_for_status()
data = response.json()
if data.get('status') != 'ok':
    sys.exit(f"newsapi error: {data.get('message', data)}")

with open('huff.json', 'w') as f:
    json.dump(data, f, indent=2, sort_keys=True)
