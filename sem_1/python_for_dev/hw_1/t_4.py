digits = [int(i) for i in input("Введите 5 чисел через пробел ").split()]
index = int(input("Введите индекс нужного элемента "))

try:
  print(digits[index])
except IndexError:
  print("Индекс, выходящий за пределы списка")