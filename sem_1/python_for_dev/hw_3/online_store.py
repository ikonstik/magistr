class Product:
    """Товар"""

    def __init__(self, name: str, price, stock: int) -> None:
        self.__name = name
        self.__price = price # Цена товара
        self.__stock = stock # Количество товара на складе

    @property
    def name(self):
        return self.__name

    @property
    def price(self):
        return self.__price

    @property
    def stock(self) -> int:
        return self.__stock
    @stock.setter
    def stock(self, stock: int) -> None:
        self.__stock = stock

    def update_stock(self, quantity: int) -> None:
        """Метод, который обновляет количество товара на складе"""
        if self.stock + quantity < 0:
            raise ValueError("Количество товара недостаточно")
        self.stock += quantity

class Order:
    """Заказ"""
    _ID = 0

    @classmethod
    def get_id(cls) -> int:
        cls._ID += 1
        return cls._ID


    def __init__(self, products: dict = None) -> None:
        self.__products = products if products else {}
        self.__total_sum = 0
        self.__id = Order.get_id()

    @property
    def products(self) -> dict:
        return self.__products
    @products.setter
    def products(self, product: dict) -> None:
        self.__products = product

    @property
    def total_sum(self) -> float:
        return self.__total_sum
    @total_sum.setter
    def total_sum(self, total_sum: float) -> None:
        self.__total_sum = total_sum

    @property
    def id(self) -> int:
        return self.__id

    def add_product(self, product: Product, quantity: int) -> None:
        """Метод для добавления товара в заказ"""
        product.update_stock(-quantity)

        if product in self.products:
            self.products[product] += quantity
        else:
            self.products[product] = quantity

    def remove_product(self, product: Product, quantity: int) -> None:
        """Метод для изменения количества товара"""
        if product not in self.products:
            raise KeyError("Товар отсутствует в заказе")
        self.products[product] -= quantity
        if self.products[product] <= 0:
            del self.products[product]
        product.update_stock(quantity)

    def return_product(self, product: Product) -> None:
        """Метод для удаления конкретного товара из заказа"""
        if product not in self.products:
            raise KeyError("Товар отсутствует в заказе")
        quantity = self.products[product]
        product.update_stock(quantity)
        del self.products[product]

    def calculate_total(self) -> float:
        """метод для расчёта общей стоимости заказа"""
        total = 0
        for product, quantity in self.products.items():
            total += quantity * product.price
        self.total_sum = total
        return self.total_sum

class Store:
    """Магазин"""

    def __init__(self, products: list = None) -> None:
        self.__products = products if products else []

    @property
    def products(self) -> list:
        return self.__products
    @products.setter
    def products(self, product: Product) -> None:
        self.__products = product

    def add_product(self, product: Product) -> None:
        """Метод для добавления товара в магазин"""
        self.products.append(product)

    def list_products(self) -> None:
        """Метод для отображения всех товаров в магазине с их ценами и количеством на складе"""
        for product in self.products:
            print(f"Товар: {product.name}, цена : {product.price}, количество: {product.stock}")

    @staticmethod
    def create_order() -> Order:
        """Метод для создания нового заказа"""
        return Order()

    @staticmethod
    def cancel_order(order: Order) -> None:
        """Метод для отмены заказа"""
        for product in order.products:
            product.update_stock(order.products[product])
        order.products.clear()

#Создаем магазин
store = Store()

# Создаем товары
product1 = Product("Ноутбук", 1000, 5)
product2 = Product("Смартфон", 500, 10)

# Добавляем товары в магазин
store.add_product(product1)
store.add_product(product2)

# Список всех товаров
store.list_products()

# Создаем заказ
order = store.create_order()

# Добавляем товары в заказ
order.add_product(product1, 2)
order.add_product(product2, 3)

# Выводим общую стоимость заказа
total = order.calculate_total()
print(f"Общая стоимость заказа: {total}")

# Проверяем остатки на складе после заказа
store.list_products()

# После добавления функции remove_product
order.remove_product(product1, 1)
order.remove_product(product2, 3)
store.list_products()
total = order.calculate_total()
print(f"Общая стоимость заказа: {total}")

# Работа с несколькими заказами и отмена заказа
order2 = store.create_order()
order2.add_product(product1, 2)
order2.add_product(product2, 3)
store.list_products()
store.cancel_order(order2)
store.list_products()