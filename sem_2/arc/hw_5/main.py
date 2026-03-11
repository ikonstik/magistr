from converters import CurrencyConverter

def main():    
    amount = int(input('Введите значение в USD: \n'))

    universal_converter = CurrencyConverter()

    valutes = ["rub", "eur", "gbp", "cny"]
    for val in valutes:
        print(f"{amount} USD to {val.upper()}: {universal_converter.convert(amount, val)}")

if __name__ == "__main__":
    main()