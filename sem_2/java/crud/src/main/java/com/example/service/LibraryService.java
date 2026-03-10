package com.example.service;

import com.example.config.DatabaseConfig;
import com.example.model.Book;
import com.example.model.BookLoan;
import com.example.model.Reader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Сервисный класс для управления библиотекой
 * Содержит все SQL операции для работы с базой данных
 */
public class LibraryService {
    private static final Logger logger = LoggerFactory.getLogger(LibraryService.class);

    // SQL запросы для книг
    private static final String INSERT_BOOK_SQL = 
            "INSERT INTO books (title, author, year, is_available) " +
            "VALUES (?, ?, ?, ?)";

    private static final String SELECT_BOOK_BY_ID_SQL = 
            "SELECT id, title, author, year, is_available FROM books WHERE id = ?";

    private static final String SELECT_ALL_BOOKS_SQL = 
            "SELECT id, title, author, year, is_available FROM books ORDER BY title";

    private static final String SELECT_AVAILABLE_BOOKS_SQL = 
            "SELECT id, title, author, year, is_available FROM books WHERE is_available = TRUE ORDER BY title";

    private static final String SELECT_BOOKS_BY_TITLE_SQL = 
            "SELECT id, title, author, year, is_available FROM books WHERE title LIKE ? ORDER BY title";

    private static final String SELECT_BOOKS_BY_AUTHOR_SQL = 
            "SELECT id, title, author, year, is_available FROM books WHERE author LIKE ? ORDER BY title";

    private static final String UPDATE_BOOK_SQL = 
            "UPDATE books SET title = ?, author = ?, year = ?, is_available = ? WHERE id = ?";

    private static final String UPDATE_BOOK_AVAILABILITY_SQL = 
            "UPDATE books SET is_available = ? WHERE id = ?";

    private static final String DELETE_BOOK_SQL = 
            "DELETE FROM books WHERE id = ?";

    // SQL запросы для читателей
    private static final String INSERT_READER_SQL = 
            "INSERT INTO readers (first_name, last_name, email) VALUES (?, ?, ?)";

    private static final String SELECT_READER_BY_ID_SQL = 
            "SELECT id, first_name, last_name, email FROM readers WHERE id = ?";

    private static final String SELECT_ALL_READERS_SQL = 
            "SELECT id, first_name, last_name, email FROM readers ORDER BY last_name, first_name";

    private static final String SELECT_READER_BY_EMAIL_SQL = 
            "SELECT id, first_name, last_name, email FROM readers WHERE email = ?";

    private static final String SELECT_READERS_BY_NAME_SQL = 
            "SELECT id, first_name, last_name, email FROM readers WHERE first_name LIKE ? OR last_name LIKE ? ORDER BY last_name, first_name";

    private static final String UPDATE_READER_SQL = 
            "UPDATE readers SET first_name = ?, last_name = ?, email = ? WHERE id = ?";

    private static final String DELETE_READER_SQL = 
            "DELETE FROM readers WHERE id = ?";

    // SQL запросы для выдач
    private static final String INSERT_BOOK_LOAN_SQL = 
            "INSERT INTO book_loans (book_id, reader_id, loan_date) VALUES (?, ?, ?)";

    private static final String SELECT_ACTIVE_LOAN_BY_BOOK_ID_SQL = 
            "SELECT id, book_id, reader_id, loan_date, return_date FROM book_loans WHERE book_id = ? AND return_date IS NULL";

    private static final String SELECT_ACTIVE_LOANS_SQL = 
            "SELECT bl.id, bl.book_id, bl.reader_id, bl.loan_date, bl.return_date, " +
            "b.title, b.author, b.year, r.first_name, r.last_name, r.email " +
            "FROM book_loans bl JOIN books b ON bl.book_id = b.id JOIN readers r ON bl.reader_id = r.id " +
            "WHERE bl.return_date IS NULL ORDER BY bl.loan_date";

    private static final String UPDATE_LOAN_RETURN_DATE_SQL = 
            "UPDATE book_loans SET return_date = ? WHERE id = ?";

    // ========== ОПЕРАЦИИ С КНИГАМИ ==========

    /**
     * CREATE - Добавление новой книги
     */
    public Book addBook(String title, String author, int year) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_BOOK_SQL, Statement.RETURN_GENERATED_KEYS)) {
            
            statement.setString(1, title);
            statement.setString(2, author);
            statement.setInt(3, year);
            statement.setBoolean(4, true);
            
            int affectedRows = statement.executeUpdate();
            
            if (affectedRows == 0) {
                throw new SQLException("Создание книги не удалось");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    Book book = new Book(generatedKeys.getInt(1), title, author, year, true);
                    logger.info("Книга добавлена: {} - {}", book.getId(), book.getTitle());
                    return book;
                } else {
                    throw new SQLException("Не удалось получить ID новой книги");
                }
            }
            
        } catch (SQLException e) {
            logger.error("Ошибка добавления книги: {} - {}", title, author, e);
            throw new RuntimeException("Не удалось добавить книгу", e);
        }
    }

    /**
     * READ - Получение книги по ID
     */
    public Optional<Book> getBookById(int id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_BOOK_BY_ID_SQL)) {
            
            statement.setInt(1, id);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    Book book = mapResultSetToBook(resultSet);
                    return Optional.of(book);
                } else {
                    return Optional.empty();
                }
            }
            
        } catch (SQLException e) {
            logger.error("Ошибка поиска книги по ID: {}", id, e);
            throw new RuntimeException("Не удалось найти книгу", e);
        }
    }

    /**
     * READ - Получение всех книг
     */
    public List<Book> getAllBooks() {
        List<Book> books = new ArrayList<>();
        
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_BOOKS_SQL);
             ResultSet resultSet = statement.executeQuery()) {
            
            while (resultSet.next()) {
                books.add(mapResultSetToBook(resultSet));
            }
            
            return books;
            
        } catch (SQLException e) {
            logger.error("Ошибка получения всех книг", e);
            throw new RuntimeException("Не удалось получить список книг", e);
        }
    }

    /**
     * READ - Получение доступных книг
     */
    public List<Book> getAvailableBooks() {
        List<Book> books = new ArrayList<>();
        
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_AVAILABLE_BOOKS_SQL);
             ResultSet resultSet = statement.executeQuery()) {
            
            while (resultSet.next()) {
                books.add(mapResultSetToBook(resultSet));
            }
            
            return books;
            
        } catch (SQLException e) {
            logger.error("Ошибка получения доступных книг", e);
            throw new RuntimeException("Не удалось получить список доступных книг", e);
        }
    }

    /**
     * READ - Поиск книг по названию
     */
    public List<Book> searchBooksByTitle(String title) {
        List<Book> books = new ArrayList<>();
        
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_BOOKS_BY_TITLE_SQL)) {
            
            statement.setString(1, "%" + title + "%");
            
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    books.add(mapResultSetToBook(resultSet));
                }
                return books;
            }
            
        } catch (SQLException e) {
            logger.error("Ошибка поиска книг по названию: {}", title, e);
            throw new RuntimeException("Не удалось найти книги по названию", e);
        }
    }

    /**
     * READ - Поиск книг по автору
     */
    public List<Book> searchBooksByAuthor(String author) {
        List<Book> books = new ArrayList<>();
        
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_BOOKS_BY_AUTHOR_SQL)) {
            
            statement.setString(1, "%" + author + "%");
            
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    books.add(mapResultSetToBook(resultSet));
                }
                return books;
            }
            
        } catch (SQLException e) {
            logger.error("Ошибка поиска книг по автору: {}", author, e);
            throw new RuntimeException("Не удалось найти книги по автору", e);
        }
    }

    /**
     * UPDATE - Обновление книги
     */
    public boolean updateBook(Book book) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_BOOK_SQL)) {
            
            statement.setString(1, book.getTitle());
            statement.setString(2, book.getAuthor());
            statement.setInt(3, book.getYear());
            statement.setBoolean(4, book.getIsAvailable());
            statement.setInt(5, book.getId());
            
            int affectedRows = statement.executeUpdate();
            boolean updated = affectedRows > 0;
            
            if (updated) {
                logger.info("Книга обновлена: {} - {}", book.getId(), book.getTitle());
            }
            
            return updated;
            
        } catch (SQLException e) {
            logger.error("Ошибка обновления книги: {}", book, e);
            throw new RuntimeException("Не удалось обновить книгу", e);
        }
    }

    /**
     * UPDATE - Обновление статуса доступности книги
     */
    public boolean updateBookAvailability(int bookId, boolean isAvailable) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_BOOK_AVAILABILITY_SQL)) {
            
            statement.setBoolean(1, isAvailable);
            statement.setInt(2, bookId);
            
            int affectedRows = statement.executeUpdate();
            return affectedRows > 0;
            
        } catch (SQLException e) {
            logger.error("Ошибка обновления статуса книги с ID: {}", bookId, e);
            throw new RuntimeException("Не удалось обновить статус книги", e);
        }
    }

    /**
     * DELETE - Удаление книги
     */
    public boolean deleteBook(int id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_BOOK_SQL)) {
            
            statement.setInt(1, id);
            int affectedRows = statement.executeUpdate();
            boolean deleted = affectedRows > 0;
            
            if (deleted) {
                logger.info("Книга удалена с ID: {}", id);
            }
            
            return deleted;
            
        } catch (SQLException e) {
            logger.error("Ошибка удаления книги с ID: {}", id, e);
            throw new RuntimeException("Не удалось удалить книгу", e);
        }
    }

    // ========== ОПЕРАЦИИ С ЧИТАТЕЛЯМИ ==========

    /**
     * CREATE - Добавление нового читателя
     */
    public Reader addReader(String firstName, String lastName, String email) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_READER_SQL, Statement.RETURN_GENERATED_KEYS)) {
            
            statement.setString(1, firstName);
            statement.setString(2, lastName);
            statement.setString(3, email);
            
            int affectedRows = statement.executeUpdate();
            
            if (affectedRows == 0) {
                throw new SQLException("Создание читателя не удалось");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    Reader reader = new Reader(generatedKeys.getInt(1), firstName, lastName, email);
                    logger.info("Читатель добавлен: {} - {} {}", reader.getId(), reader.getFirstName(), reader.getLastName());
                    return reader;
                } else {
                    throw new SQLException("Не удалось получить ID нового читателя");
                }
            }
            
        } catch (SQLException e) {
            logger.error("Ошибка добавления читателя: {} {} - {}", firstName, lastName, email, e);
            throw new RuntimeException("Не удалось добавить читателя", e);
        }
    }

    /**
     * READ - Получение читателя по ID
     */
    public Optional<Reader> getReaderById(int id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_READER_BY_ID_SQL)) {
            
            statement.setInt(1, id);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    Reader reader = mapResultSetToReader(resultSet);
                    return Optional.of(reader);
                } else {
                    return Optional.empty();
                }
            }
            
        } catch (SQLException e) {
            logger.error("Ошибка поиска читателя по ID: {}", id, e);
            throw new RuntimeException("Не удалось найти читателя", e);
        }
    }

    /**
     * READ - Получение всех читателей
     */
    public List<Reader> getAllReaders() {
        List<Reader> readers = new ArrayList<>();
        
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ALL_READERS_SQL);
             ResultSet resultSet = statement.executeQuery()) {
            
            while (resultSet.next()) {
                readers.add(mapResultSetToReader(resultSet));
            }
            
            return readers;
            
        } catch (SQLException e) {
            logger.error("Ошибка получения всех читателей", e);
            throw new RuntimeException("Не удалось получить список читателей", e);
        }
    }

    /**
     * READ - Поиск читателя по email
     */
    public Optional<Reader> getReaderByEmail(String email) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_READER_BY_EMAIL_SQL)) {
            
            statement.setString(1, email);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    Reader reader = mapResultSetToReader(resultSet);
                    return Optional.of(reader);
                } else {
                    return Optional.empty();
                }
            }
            
        } catch (SQLException e) {
            logger.error("Ошибка поиска читателя по email: {}", email, e);
            throw new RuntimeException("Не удалось найти читателя по email", e);
        }
    }

    /**
     * READ - Поиск читателей по имени
     */
    public List<Reader> searchReadersByName(String name) {
        List<Reader> readers = new ArrayList<>();
        
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_READERS_BY_NAME_SQL)) {
            
            String searchPattern = "%" + name + "%";
            statement.setString(1, searchPattern);
            statement.setString(2, searchPattern);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    readers.add(mapResultSetToReader(resultSet));
                }
                return readers;
            }
            
        } catch (SQLException e) {
            logger.error("Ошибка поиска читателей по имени: {}", name, e);
            throw new RuntimeException("Не удалось найти читателей по имени", e);
        }
    }

    /**
     * UPDATE - Обновление читателя
     */
    public boolean updateReader(Reader reader) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(UPDATE_READER_SQL)) {
            
            statement.setString(1, reader.getFirstName());
            statement.setString(2, reader.getLastName());
            statement.setString(3, reader.getEmail());
            statement.setInt(4, reader.getId());
            
            int affectedRows = statement.executeUpdate();
            boolean updated = affectedRows > 0;
            
            if (updated) {
                logger.info("Читатель обновлен: {} - {} {}", reader.getId(), reader.getFirstName(), reader.getLastName());
            }
            
            return updated;
            
        } catch (SQLException e) {
            logger.error("Ошибка обновления читателя: {}", reader, e);
            throw new RuntimeException("Не удалось обновить читателя", e);
        }
    }

    /**
     * DELETE - Удаление читателя
     */
    public boolean deleteReader(int id) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(DELETE_READER_SQL)) {
            
            statement.setInt(1, id);
            int affectedRows = statement.executeUpdate();
            boolean deleted = affectedRows > 0;
            
            if (deleted) {
                logger.info("Читатель удален с ID: {}", id);
            }
            
            return deleted;
            
        } catch (SQLException e) {
            logger.error("Ошибка удаления читателя с ID: {}", id, e);
            throw new RuntimeException("Не удалось удалить читателя", e);
        }
    }

    // ========== ОПЕРАЦИИ С ВЫДАЧАМИ КНИГ ==========

    /**
     * Выдача книги читателю
     */
    public boolean loanBook(int bookId, int readerId) {
        try (Connection connection = DatabaseConfig.getConnection()) {
            connection.setAutoCommit(false); // Начинаем транзакцию
            
            try {
                // Проверяем существование книги
                Optional<Book> bookOpt = getBookById(bookId);
                if (bookOpt.isEmpty()) {
                    logger.warn("Попытка выдать несуществующую книгу с ID: {}", bookId);
                    return false;
                }

                // Проверяем существование читателя
                Optional<Reader> readerOpt = getReaderById(readerId);
                if (readerOpt.isEmpty()) {
                    logger.warn("Попытка выдать книгу несуществующему читателю с ID: {}", readerId);
                    return false;
                }

                Book book = bookOpt.get();

                // Проверяем доступность книги
                if (!book.getIsAvailable()) {
                    logger.warn("Попытка выдать недоступную книгу '{}' (ID: {})", book.getTitle(), bookId);
                    return false;
                }

                // Проверяем, не выдана ли уже эта книга
                Optional<BookLoan> activeLoan = getActiveLoanByBookId(bookId);
                if (activeLoan.isPresent()) {
                    logger.warn("Книга '{}' (ID: {}) уже выдана", book.getTitle(), bookId);
                    return false;
                }

                // Создаем запись о выдаче
                try (PreparedStatement loanStatement = connection.prepareStatement(INSERT_BOOK_LOAN_SQL)) {
                    loanStatement.setInt(1, bookId);
                    loanStatement.setInt(2, readerId);
                    loanStatement.setDate(3, Date.valueOf(LocalDate.now()));
                    
                    int loanRows = loanStatement.executeUpdate();
                    if (loanRows == 0) {
                        throw new SQLException("Не удалось создать запись о выдаче");
                    }
                }

                // Обновляем статус книги на "недоступна"
                boolean updated = updateBookAvailability(bookId, false);
                if (!updated) {
                    throw new SQLException("Не удалось обновить статус книги");
                }

                connection.commit(); // Подтверждаем транзакцию
                logger.info("Книга '{}' (ID: {}) успешно выдана читателю ID: {}", book.getTitle(), bookId, readerId);
                return true;

            } catch (Exception e) {
                connection.rollback(); // Откатываем транзакцию при ошибке
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }

        } catch (SQLException e) {
            logger.error("Ошибка при выдаче книги ID: {} читателю ID: {}", bookId, readerId, e);
            return false;
        }
    }

    /**
     * Возврат книги
     */
    public boolean returnBook(int bookId) {
        try (Connection connection = DatabaseConfig.getConnection()) {
            connection.setAutoCommit(false); // Начинаем транзакцию
            
            try {
                // Проверяем существование книги
                Optional<Book> bookOpt = getBookById(bookId);
                if (bookOpt.isEmpty()) {
                    logger.warn("Попытка вернуть несуществующую книгу с ID: {}", bookId);
                    return false;
                }

                Book book = bookOpt.get();

                // Находим активную выдачу для этой книги
                Optional<BookLoan> activeLoanOpt = getActiveLoanByBookId(bookId);
                if (activeLoanOpt.isEmpty()) {
                    logger.warn("Книга '{}' (ID: {}) не выдана или уже возвращена", book.getTitle(), bookId);
                    return false;
                }

                BookLoan activeLoan = activeLoanOpt.get();

                // Устанавливаем дату возврата
                try (PreparedStatement returnStatement = connection.prepareStatement(UPDATE_LOAN_RETURN_DATE_SQL)) {
                    returnStatement.setDate(1, Date.valueOf(LocalDate.now()));
                    returnStatement.setInt(2, activeLoan.getId());
                    
                    int returnRows = returnStatement.executeUpdate();
                    if (returnRows == 0) {
                        throw new SQLException("Не удалось обновить дату возврата");
                    }
                }

                // Обновляем статус книги на "доступна"
                boolean updated = updateBookAvailability(bookId, true);
                if (!updated) {
                    throw new SQLException("Не удалось обновить статус книги");
                }

                connection.commit(); // Подтверждаем транзакцию
                logger.info("Книга '{}' (ID: {}) успешно возвращена", book.getTitle(), bookId);
                return true;

            } catch (Exception e) {
                connection.rollback(); // Откатываем транзакцию при ошибке
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }

        } catch (SQLException e) {
            logger.error("Ошибка при возврате книги ID: {}", bookId, e);
            return false;
        }
    }

    /**
     * Получение активной выдачи по ID книги
     */
    private Optional<BookLoan> getActiveLoanByBookId(int bookId) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ACTIVE_LOAN_BY_BOOK_ID_SQL)) {
            
            statement.setInt(1, bookId);
            
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    BookLoan bookLoan = new BookLoan();
                    bookLoan.setId(resultSet.getInt("id"));
                    bookLoan.setBookId(resultSet.getInt("book_id"));
                    bookLoan.setReaderId(resultSet.getInt("reader_id"));
                    bookLoan.setLoanDate(resultSet.getDate("loan_date").toLocalDate());
                    
                    Date returnDate = resultSet.getDate("return_date");
                    if (returnDate != null) {
                        bookLoan.setReturnDate(returnDate.toLocalDate());
                    }
                    
                    return Optional.of(bookLoan);
                } else {
                    return Optional.empty();
                }
            }
            
        } catch (SQLException e) {
            logger.error("Ошибка поиска активной выдачи по ID книги: {}", bookId, e);
            throw new RuntimeException("Не удалось найти активную выдачу", e);
        }
    }

    /**
     * Получение списка выданных книг с информацией о читателях
     */
    public List<BookLoanInfo> getActiveLoansWithDetails() {
        List<BookLoanInfo> activeLoans = new ArrayList<>();
        
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SELECT_ACTIVE_LOANS_SQL);
             ResultSet resultSet = statement.executeQuery()) {
            
            while (resultSet.next()) {
                Book book = new Book();
                book.setId(resultSet.getInt("book_id"));
                book.setTitle(resultSet.getString("title"));
                book.setAuthor(resultSet.getString("author"));
                book.setYear(resultSet.getInt("year"));
                
                Reader reader = new Reader();
                reader.setId(resultSet.getInt("reader_id"));
                reader.setFirstName(resultSet.getString("first_name"));
                reader.setLastName(resultSet.getString("last_name"));
                reader.setEmail(resultSet.getString("email"));
                
                BookLoanInfo info = new BookLoanInfo(
                    resultSet.getInt("id"),
                    book,
                    reader,
                    resultSet.getDate("loan_date").toLocalDate(),
                    null // return_date всегда null для активных выдач
                );
                activeLoans.add(info);
            }
            
            return activeLoans;
            
        } catch (SQLException e) {
            logger.error("Ошибка получения активных выдач с деталями", e);
            return new ArrayList<>();
        }
    }

    /**
     * Получение статистики библиотеки
     */
    public LibraryStatistics getStatistics() {
        try {
            int totalBooks = getAllBooks().size();
            int availableBooks = getAvailableBooks().size();
            int totalReaders = getAllReaders().size();
            int activeLoans = getActiveLoansWithDetails().size();
            
            return new LibraryStatistics(totalBooks, availableBooks, totalReaders, activeLoans);
            
        } catch (Exception e) {
            logger.error("Ошибка получения статистики библиотеки", e);
            return new LibraryStatistics(0, 0, 0, 0);
        }
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

    /**
     * Маппинг ResultSet в объект Book
     */
    private Book mapResultSetToBook(ResultSet resultSet) throws SQLException {
        Book book = new Book();
        book.setId(resultSet.getInt("id"));
        book.setTitle(resultSet.getString("title"));
        book.setAuthor(resultSet.getString("author"));
        book.setYear(resultSet.getInt("year"));
        book.setIsAvailable(resultSet.getBoolean("is_available"));
        return book;
    }

    /**
     * Маппинг ResultSet в объект Reader
     */
    private Reader mapResultSetToReader(ResultSet resultSet) throws SQLException {
        Reader reader = new Reader();
        reader.setId(resultSet.getInt("id"));
        reader.setFirstName(resultSet.getString("first_name"));
        reader.setLastName(resultSet.getString("last_name"));
        reader.setEmail(resultSet.getString("email"));
        return reader;
    }

    // ========== ВНУТРЕННИЕ КЛАССЫ ==========

    /**
     * Класс для хранения информации о выдаче с деталями
     */
    public static class BookLoanInfo {
        private final int loanId;
        private final Book book;
        private final Reader reader;
        private final LocalDate loanDate;
        private final LocalDate returnDate;

        public BookLoanInfo(int loanId, Book book, Reader reader, LocalDate loanDate, LocalDate returnDate) {
            this.loanId = loanId;
            this.book = book;
            this.reader = reader;
            this.loanDate = loanDate;
            this.returnDate = returnDate;
        }

        public int getLoanId() { return loanId; }
        public Book getBook() { return book; }
        public Reader getReader() { return reader; }
        public LocalDate getLoanDate() { return loanDate; }
        public LocalDate getReturnDate() { return returnDate; }

        @Override
        public String toString() {
            return String.format("Выдача ID: %d | Книга: '%s' (%s) | Читатель: %s %s | Выдана: %s%s",
                loanId, book.getTitle(), book.getAuthor(),
                reader.getFirstName(), reader.getLastName(), loanDate,
                returnDate != null ? " | Возвращена: " + returnDate : "");
        }
    }

    /**
     * Класс для хранения статистики библиотеки
     */
    public static class LibraryStatistics {
        private final int totalBooks;
        private final int availableBooks;
        private final int totalReaders;
        private final int activeLoans;

        public LibraryStatistics(int totalBooks, int availableBooks, int totalReaders, int activeLoans) {
            this.totalBooks = totalBooks;
            this.availableBooks = availableBooks;
            this.totalReaders = totalReaders;
            this.activeLoans = activeLoans;
        }

        public int getTotalBooks() { return totalBooks; }
        public int getAvailableBooks() { return availableBooks; }
        public int getTotalReaders() { return totalReaders; }
        public int getActiveLoans() { return activeLoans; }

        @Override
        public String toString() {
            return String.format(
                "Статистика библиотеки:\n" +
                "  Всего книг: %d\n" +
                "  Доступных книг: %d\n" +
                "  Выданных книг: %d\n" +
                "  Всего читателей: %d\n" +
                "  Активных выдач: %d",
                totalBooks, availableBooks, totalBooks - availableBooks,
                totalReaders, activeLoans
            );
        }
    }
}