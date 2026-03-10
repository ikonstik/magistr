package com.example.model;

import java.time.LocalDate;
import java.util.Objects;

/**
 * ===================================================================
 * МОДЕЛЬ ВЫДАЧИ КНИГИ ДЛЯ СИСТЕМЫ УПРАВЛЕНИЯ БИБЛИОТЕКОЙ
 * ===================================================================
 * 
 * Этот класс представляет сущность "Выдача книги" в системе управления библиотекой.
 * Связывает книги с читателями и отслеживает временные рамки выдачи.
 * 
 * Основные характеристики:
 * - Уникальный идентификатор выдачи (ID)
 * - Ссылка на книгу (bookId)
 * - Ссылка на читателя (readerId)
 * - Дата выдачи книги
 * - Дата возврата книги (null если книга не возвращена)
 * 
 * Класс реализует паттерн JavaBean с геттерами и сеттерами,
 * а также переопределяет методы equals(), hashCode() и toString()
 * для корректной работы с коллекциями и логированием.
 * 
 * @author Система управления библиотекой
 * @version 1.0
 * @since 2024
 */
public class BookLoan {
    
    // ===================================================================
    // ПОЛЯ КЛАССА (ПРИВАТНЫЕ СВОЙСТВА)
    // ===================================================================
    
    /**
     * Уникальный идентификатор выдачи в базе данных
     * Может быть null для новых выдач, которые еще не сохранены в БД
     * После сохранения в БД получает значение от AUTO_INCREMENT
     */
    private Integer id;
    
    /**
     * Идентификатор книги, которая была выдана
     * Ссылается на таблицу books(id)
     * Обязательное поле, не может быть null
     */
    private Integer bookId;
    
    /**
     * Идентификатор читателя, которому была выдана книга
     * Ссылается на таблицу readers(id)
     * Обязательное поле, не может быть null
     */
    private Integer readerId;
    
    /**
     * Дата выдачи книги читателю
     * Обязательное поле, не может быть null
     * Обычно устанавливается в текущую дату при выдаче
     */
    private LocalDate loanDate;
    
    /**
     * Дата возврата книги в библиотеку
     * Может быть null, если книга еще не возвращена
     * Устанавливается при возврате книги
     */
    private LocalDate returnDate;

    // ===================================================================
    // КОНСТРУКТОРЫ
    // ===================================================================
    
    /**
     * Конструктор по умолчанию (без параметров)
     * 
     * Создает пустой объект BookLoan с инициализацией полей значениями по умолчанию.
     * Используется фреймворками (например, Hibernate) для создания объектов
     * из данных базы данных.
     * 
     * Все поля инициализируются как null
     */
    public BookLoan() {
        // Пустой конструктор для фреймворков
        // Поля инициализируются значениями по умолчанию
    }

    /**
     * Конструктор для создания новой выдачи книги (без ID)
     * 
     * Используется при выдаче книги читателю.
     * ID будет присвоен автоматически при сохранении в базу данных.
     * 
     * @param bookId идентификатор выдаваемой книги
     * @param readerId идентификатор читателя, получающего книгу
     * @param loanDate дата выдачи книги (обычно текущая дата)
     */
    public BookLoan(Integer bookId, Integer readerId, LocalDate loanDate) {
        this.bookId = bookId;
        this.readerId = readerId;
        this.loanDate = loanDate;
        // При выдаче дата возврата не установлена (книга еще не возвращена)
        this.returnDate = null;
    }

    /**
     * Полный конструктор со всеми параметрами
     * 
     * Используется для создания объекта BookLoan со всеми данными,
     * включая ID (например, при загрузке из базы данных).
     * 
     * @param id уникальный идентификатор выдачи
     * @param bookId идентификатор книги
     * @param readerId идентификатор читателя
     * @param loanDate дата выдачи книги
     * @param returnDate дата возврата книги (может быть null)
     */
    public BookLoan(Integer id, Integer bookId, Integer readerId, LocalDate loanDate, LocalDate returnDate) {
        this.id = id;
        this.bookId = bookId;
        this.readerId = readerId;
        this.loanDate = loanDate;
        this.returnDate = returnDate;
    }

    // ===================================================================
    // ГЕТТЕРЫ И СЕТТЕРЫ (ACCESSOR METHODS)
    // ===================================================================
    // Геттеры и сеттеры обеспечивают инкапсуляцию данных
    // и позволяют контролировать доступ к полям класса

    /**
     * Получить уникальный идентификатор выдачи
     * 
     * @return ID выдачи или null, если выдача не сохранена в БД
     */
    public Integer getId() {
        return id;
    }

    /**
     * Установить уникальный идентификатор выдачи
     * 
     * @param id новый ID выдачи
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Получить идентификатор книги
     * 
     * @return ID книги
     */
    public Integer getBookId() {
        return bookId;
    }

    /**
     * Установить идентификатор книги
     * 
     * @param bookId новый ID книги
     */
    public void setBookId(Integer bookId) {
        this.bookId = bookId;
    }

    /**
     * Получить идентификатор читателя
     * 
     * @return ID читателя
     */
    public Integer getReaderId() {
        return readerId;
    }

    /**
     * Установить идентификатор читателя
     * 
     * @param readerId новый ID читателя
     */
    public void setReaderId(Integer readerId) {
        this.readerId = readerId;
    }

    /**
     * Получить дату выдачи книги
     * 
     * @return дата выдачи книги
     */
    public LocalDate getLoanDate() {
        return loanDate;
    }

    /**
     * Установить дату выдачи книги
     * 
     * @param loanDate новая дата выдачи книги
     */
    public void setLoanDate(LocalDate loanDate) {
        this.loanDate = loanDate;
    }

    /**
     * Получить дату возврата книги
     * 
     * @return дата возврата книги или null, если книга не возвращена
     */
    public LocalDate getReturnDate() {
        return returnDate;
    }

    /**
     * Установить дату возврата книги
     * 
     * @param returnDate новая дата возврата книги
     */
    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    // ===================================================================
    // ПЕРЕОПРЕДЕЛЕННЫЕ МЕТОДЫ ОБЪЕКТА
    // ===================================================================

    /**
     * Строковое представление объекта BookLoan
     * 
     * Используется для логирования и отладки.
     * Возвращает читаемое представление всех полей объекта.
     * 
     * @return строковое представление выдачи книги
     */
    @Override
    public String toString() {
        return "BookLoan{" +
                "id=" + id +
                ", bookId=" + bookId +
                ", readerId=" + readerId +
                ", loanDate=" + loanDate +
                ", returnDate=" + returnDate +
                '}';
    }

    /**
     * Сравнение объектов BookLoan на равенство
     * 
     * Две выдачи считаются равными, если все их поля совпадают.
     * Используется для сравнения объектов в коллекциях и при поиске.
     * 
     * @param o объект для сравнения
     * @return true если объекты равны, false в противном случае
     */
    @Override
    public boolean equals(Object o) {
        // Проверка на ссылочное равенство (быстрая проверка)
        if (this == o) return true;
        
        // Проверка на null и совместимость типов
        if (o == null || getClass() != o.getClass()) return false;
        
        // Приведение типа и сравнение полей
        BookLoan bookLoan = (BookLoan) o;
        return Objects.equals(id, bookLoan.id) &&
                Objects.equals(bookId, bookLoan.bookId) &&
                Objects.equals(readerId, bookLoan.readerId) &&
                Objects.equals(loanDate, bookLoan.loanDate) &&
                Objects.equals(returnDate, bookLoan.returnDate);
    }

    /**
     * Вычисление хеш-кода объекта
     * 
     * Возвращает хеш-код, основанный на всех полях объекта.
     * Важно для корректной работы с HashMap, HashSet и другими
     * коллекциями, использующими хеширование.
     * 
     * @return хеш-код объекта
     */
    @Override
    public int hashCode() {
        return Objects.hash(id, bookId, readerId, loanDate, returnDate);
    }
}

