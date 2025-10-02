val_1, val_2 = [int(i) for i in input("Введите 2 числа через пробел").split()]
try:
  res = val_1 / val_2
  print(res)
except:
  print("Деление на ноль")