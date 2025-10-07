val_1, val_2 = [i for i in input("Введите 2 числа через пробел ").split()]

try:
  res = int(val_1) / int(val_2)
  print(res)
except ZeroDivisionError:
  print("Деление на ноль")
except ValueError:
  print("Введено не число")