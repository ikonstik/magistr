with open("text_file.txt","r") as file:
    summ_words = 0
    for line in file:
        for word in line.strip().split():
            if word.isalpha():
                summ_words += 1
    print(summ_words)