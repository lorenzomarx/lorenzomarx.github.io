# import random module
from random import randint

# Declaring names, verbs and nouns
names=["a cat","a dog","a human","a car","a truck","a woman","a gecko"]
verbs=["An oil painting of", "A watercolour of", "A tapestry of", "A medieval tapestry of"]
nouns=["playing cricket.", "watching television.", "singing.", "fighting.", "cycling."]

print(verbs[randint(0,len(verbs)-1)]+" "+names[randint(0,len(names)-1)]+" "+nouns[randint(0,len(nouns)-1)])
