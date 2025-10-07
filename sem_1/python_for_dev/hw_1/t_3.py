digits = [int(i) for i in input("Введите 5 чисел через пробел ").split()]

class EvenNumber(Exception):
  pass

class NegativeNumber(Exception):
  pass

result = 0

try:
  for num in digits:
    if num % 2 == 0:
      raise EvenNumber("Четное число")
    if num < 0:
      raise NegativeNumber("Отрицательное число")
    result += num
except EvenNumber as e:
  print(e)
except NegativeNumber as n:
  print(n)
finally:
  print(result)