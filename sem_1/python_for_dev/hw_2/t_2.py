with open("prices.txt", "r") as file:
    summ = 0
    for line in file:
        summ += int(line.strip("\n").split()[1]) * int(line.strip("\n").split()[2])

    print(summ)
