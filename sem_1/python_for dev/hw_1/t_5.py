number = input("Введите дробное число ")

try:
  float_number = float(number)
  print(float_number)
except ValueError:
  print("Введена строка, которую невозможно преобразовать в число.")