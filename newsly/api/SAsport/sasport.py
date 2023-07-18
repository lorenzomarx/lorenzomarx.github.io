
import json
import requests
from colorama import colorama_text, Fore, Back, Style
import pyfiglet
result = pyfiglet.figlet_format("News", font = "poison"  )


response = requests.get("https://newsapi.org/v2/top-headlines?country=za&category=sports&apiKey=f71a099eb6744dbbbe096332ec1ac090")
data = response.json()



with open('sasport.json', 'w') as outfile:
    json.dump(data, outfile,indent=2, sort_keys=True)
