
import json
import requests
from colorama import colorama_text, Fore, Back, Style
import pyfiglet
result = pyfiglet.figlet_format("News", font = "poison"  )

response = requests.get("https://newsapi.org/v1/articles?source=national-geographic&sortBy=top&apiKey=3b0812f373dd4cf6be98999b0bb159b4")
data = response.json()


with open('natgeo.json', 'w') as outfile:
    json.dump(data, outfile,indent=2, sort_keys=True)
