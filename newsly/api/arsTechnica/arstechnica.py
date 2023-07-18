
import json
import requests
from colorama import colorama_text, Fore, Back, Style
import pyfiglet
result = pyfiglet.figlet_format("News", font = "poison"  )


response = requests.get("https://newsapi.org/v1/articles?source=ars-technica&sortBy=top&apiKey=5e32868f939b4ca2a0cb47a79b330331")
data = response.json()


with open('arstechnica.json', 'w') as outfile:
    json.dump(data, outfile,indent=2, sort_keys=True)
