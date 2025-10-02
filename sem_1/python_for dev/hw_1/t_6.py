from math import sqrt
digit = int(input("Ввдедите число "))

try:
  print(sqrt(digit))
except ValueError:
  print("Введено отрицательное число")
except NameError:
  print("Модуль math не импортирован")