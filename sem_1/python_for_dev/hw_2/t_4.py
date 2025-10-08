with open("input.txt","r") as file:
    with open("unique_output.txt","w") as unique_output:
        set_lines = set(file.read().splitlines())
        unique_output.write("\n".join(sorted(set_lines)))

with open("unique_output.txt","r") as file:
    for line in file:
        print(line)