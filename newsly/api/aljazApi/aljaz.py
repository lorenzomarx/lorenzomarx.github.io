
import json
import requests
from colorama import colorama_text, Fore, Back, Style
import pyfiglet
result = pyfiglet.figlet_format("News", font = "poison"  )


response = requests.get("https://newsapi.org/v2/everything?sources=al-jazeera-english&apiKey=5e32868f939b4ca2a0cb47a79b330331")
data = response.json()



with open('aljaz.json', 'w') as outfile:
    json.dump(data, outfile,indent=2, sort_keys=True)
