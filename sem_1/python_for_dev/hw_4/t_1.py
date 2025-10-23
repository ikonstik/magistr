from pydantic import BaseModel, Field, field_validator
from typing import List

class BookNotAvailable(Exception):
    pass

class Book(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    author: str = Field(..., min_length=1, max_length=100)
    year: int = Field(..., le = 800, ge = 2025)
    available: bool = Field(default=True)
    category: str = Field(..., min_length=1, max_length=100)
    categories: List = ["Роман", "Рассказ", "Сказка"]

    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        if v not in cls.categories:
            raise ValueError("Категории нету в списке: {}".format(cls.categories))
        return v
class User(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1, max_length=100)
    membership_id : str = Field(..., min_length=1, max_length=100)

    @field_validator('email', mode="before")
    @classmethod
    def validate_email(cls, v):
        if "@" in v:
            raise ValueError("Неверный email")
        return v.lower()

class Library(BaseModel):
    books: List[Book]
    users: List[User]

    def add_book(self, book: Book) -> None:
        if book in self.books:
            raise ValueError("Книга уже добавлена в библиотеку")
        self.books.append(book)

    def find_book(self, book: Book) -> str:
        if book not in self.books:
            raise BookNotAvailable("Книга не найдена")
        return "{} {} присутствует в библиотеке".format(book.title, book.author)


    def is_book_borrow(self, book: Book) -> bool:
        if book not in self.books:
            raise BookNotAvailable("Книга не найдена")
        v = self.books.index(book)
        return self.books[v].available

    def borrow_book(self, book: Book) -> str:
        if book not in self.books:
            raise BookNotAvailable("Книга не найдена")
        v = self.books.index(book)
        self.books[v].available = False
        return "Книга {} {} взята из библиотеки".format(book.title, book.author)

    def return_book(self, book: Book) -> str:
        if book not in self.books:
            raise BookNotAvailable("Книга не найдена")
        v = self.books.index(book)
        self.books[v].available = True
        return "Книга {} {} возвращена в библиотеку".format(book.title, book.author)

    def total_books(self) -> int:
        return len(self.books)