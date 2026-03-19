import requests
import re
from collections import Counter

def get_text(url):
    response = requests.get(url)
    return response.text

def count_word_frequencies(text, words_to_count):
    clean_text = re.sub(r"[^\w\s]", " ", text.lower())
    
    counted_words = Counter(clean_text.split())

    return counted_words

def words_from_file(name):
    with open(name, 'r', encoding="utf-8") as file:
        return [line.strip() for line in file if line.strip()]
    

def main():
    words_file = "words.txt"
    url = "https://eng.mipt.ru/why-mipt/"
    text = get_text(url)

    words_to_count = words_from_file(words_file)

    frequencies = count_word_frequencies(text, words_to_count)
    
    print(frequencies)

if __name__ == "__main__":
    main()