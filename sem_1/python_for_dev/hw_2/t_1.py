with open("source.txt", "r") as file1:
    with open("destination.txt", "a") as file2:
        for line in file1:
            file2.write(line)