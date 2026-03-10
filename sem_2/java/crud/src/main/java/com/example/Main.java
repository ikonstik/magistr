package com.example;

import com.example.config.DatabaseConfig;
import com.example.model.Book;
import com.example.model.Reader;
import com.example.service.LibraryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

/**
 * ===================================================================
 * ГЛАВНЫЙ КЛАСС СИСТЕМЫ УПРАВЛЕНИЯ БИБЛИОТЕКОЙ
 * ===================================================================
 * 
 * Этот класс является точкой входа в приложение системы управления библиотекой.
 * Предоставляет консольный интерфейс для взаимодействия с пользователем
 * и координирует работу всех компонентов системы.
 * 
 * Основные функции:
 * - Инициализация системы и проверка подключения к БД
 * - Предоставление пользовательского интерфейса
 * - Управление жизненным циклом приложения
 * - Обработка ошибок и исключений
 * - Управление ресурсами (закрытие соединений, сканера)
 * 
 * Архитектура:
 * - Использует паттерн MVC (Model-View-Controller)
 * - Model: Book, Reader, BookLoan (модели данных)
 * - View: Консольный интерфейс (этот класс)
 * - Controller: LibraryService (бизнес-логика)
 * 
 * @author Система управления библиотекой
 * @version 1.0
 * @since 2024
 */
public class Main {
    
    // ===================================================================
    // ЛОГИРОВАНИЕ И РЕСУРСЫ
    // ===================================================================
    
    /**
     * Логгер для записи информации о работе приложения
     * Использует SLF4J для гибкого выбора реализации логирования
     */
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    
    /**
     * Сканер для чтения пользовательского ввода из консоли
     * Используется для интерактивного взаимодействия с пользователем
     */
    private static final Scanner scanner = new Scanner(System.in);
    
    // ===================================================================
    // СЕРВИСЫ ПРИЛОЖЕНИЯ
    // ===================================================================
    
    /**
     * Сервис для работы с библиотекой
     * Содержит всю бизнес-логику для управления книгами, читателями и выдачами
     */
    private static LibraryService libraryService;

    /**
     * ===================================================================
     * ГЛАВНЫЙ МЕТОД ПРИЛОЖЕНИЯ
     * ===================================================================
     * 
     * Точка входа в приложение. Выполняет инициализацию системы,
     * проверку подключения к базе данных и запуск основного цикла программы.
     * 
     * Последовательность выполнения:
     * 1. Инициализация логирования
     * 2. Проверка подключения к базе данных
     * 3. Инициализация сервисов
     * 4. Запуск основного цикла программы
     * 5. Обработка ошибок и закрытие ресурсов
     * 
     * @param args аргументы командной строки (не используются)
     */
    public static void main(String[] args) {
        // Логирование запуска приложения
        logger.info("=== Система управления библиотекой ===");
        logger.info("Запуск приложения...");
        
        try {
            // ===================================================================
            // ШАГ 1: ПРОВЕРКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ
            // ===================================================================
            logger.info("Проверка подключения к базе данных...");
            
            if (!DatabaseConfig.isConnectionAvailable()) {
                // Критическая ошибка - без БД приложение не может работать
                System.err.println("   ОШИБКА: Не удалось подключиться к базе данных!");
                System.err.println("   Проверьте, что MySQL запущен и настройки подключения корректны.");
                System.err.println("   Информация о подключении: " + DatabaseConfig.getConnectionInfo());
                
                logger.error("Критическая ошибка: недоступна база данных");
                return; // Завершение работы приложения
            }
            
            System.out.println("Подключение к базе данных установлено успешно");
            logger.info("Подключение к базе данных успешно установлено");
            
            // ===================================================================
            // ШАГ 2: ИНИЦИАЛИЗАЦИЯ СЕРВИСОВ
            // ===================================================================
            logger.info("Инициализация сервисов...");
            
            // Создание экземпляра сервиса библиотеки
            // Сервис содержит всю бизнес-логику для работы с данными
            libraryService = new LibraryService();
            
            logger.info("Сервисы успешно инициализированы");
            
            // ===================================================================
            // ШАГ 3: ЗАПУСК ОСНОВНОГО ЦИКЛА ПРОГРАММЫ
            // ===================================================================
            logger.info("Запуск основного цикла программы...");
            
            // Запуск главного меню и основного цикла взаимодействия с пользователем
            runMainMenu();
            
            logger.info("Основной цикл программы завершен");
            
        } catch (Exception e) {
            // ===================================================================
            // ОБРАБОТКА КРИТИЧЕСКИХ ОШИБОК
            // ===================================================================
            // Логирование критической ошибки с полным стеком вызовов
            logger.error("Критическая ошибка в программе", e);
            
            // Вывод понятного сообщения пользователю
            System.err.println("Произошла критическая ошибка: " + e.getMessage());
            System.err.println("Детали ошибки записаны в лог файл");
            
            // В реальном приложении здесь можно добавить:
            // - Отправку уведомлений администратору
            // - Сохранение состояния для восстановления
            // - Автоматический перезапуск (для серверных приложений)
            
        } finally {
            // ===================================================================
            // ЗАКРЫТИЕ РЕСУРСОВ
            // ===================================================================
            logger.info("Завершение работы приложения...");
            
            // Закрытие сканера для предотвращения утечек ресурсов
            if (scanner != null) {
                scanner.close();
                logger.debug("Сканер закрыт");
            }
            
            // Примечание: DriverManager не требует явного закрытия
            // Соединения с БД закрываются автоматически при завершении приложения
            
            System.out.println("\nПрограмма завершена. До свидания!");
            logger.info("Приложение успешно завершено");
        }
    }

    /**
     * Главное меню программы
     */
    private static void runMainMenu() {
        boolean running = true;
        
        while (running) {
            System.out.println("\n" + "=".repeat(50));
            System.out.println("           СИСТЕМА УПРАВЛЕНИЯ БИБЛИОТЕКОЙ");
            System.out.println("=".repeat(50));
            System.out.println("1.  Управление книгами");
            System.out.println("2.  Управление читателями");
            System.out.println("3.  Выдача книг");
            System.out.println("4.  Возврат книг");
            System.out.println("5.  Просмотр выданных книг");
            System.out.println("6.  Статистика библиотеки");
            System.out.println("0.  Выход");
            System.out.println("=".repeat(50));
            
            System.out.print("Выберите действие (0-6): ");
            String choice = scanner.nextLine().trim();
            
            switch (choice) {
                case "1":
                    runBooksMenu();
                    break;
                case "2":
                    runReadersMenu();
                    break;
                case "3":
                    loanBook();
                    break;
                case "4":
                    returnBook();
                    break;
                case "5":
                    viewLoans();
                    break;
                case "6":
                    showStatistics();
                    break;
                case "0":
                    running = false;
                    System.out.println("Выход из программы...");
                    break;
                default:
                    System.out.println("Неверный выбор! Попробуйте снова.");
                    break;
            }
        }
    }

    /**
     * Меню управления книгами
     */
    private static void runBooksMenu() {
        boolean running = true;
        
        while (running) {
            System.out.println("\n" + "-".repeat(40));
            System.out.println("        УПРАВЛЕНИЕ КНИГАМИ");
            System.out.println("-".repeat(40));
            System.out.println("1.  Добавить новую книгу");
            System.out.println("2.  Просмотреть все книги");
            System.out.println("3.  Просмотреть доступные книги");
            System.out.println("4.  Найти книгу по названию");
            System.out.println("5.  Найти книгу по автору");
            System.out.println("6.  Обновить информацию о книге");
            System.out.println("7.  Удалить книгу");
            System.out.println("0.  Назад в главное меню");
            System.out.println("-".repeat(40));
            
            System.out.print("Выберите действие (0-7): ");
            String choice = scanner.nextLine().trim();
            
            switch (choice) {
                case "1":
                    addBook();
                    break;
                case "2":
                    viewAllBooks();
                    break;
                case "3":
                    viewAvailableBooks();
                    break;
                case "4":
                    searchBooksByTitle();
                    break;
                case "5":
                    searchBooksByAuthor();
                    break;
                case "6":
                    updateBook();
                    break;
                case "7":
                    deleteBook();
                    break;
                case "0":
                    running = false;
                    break;
                default:
                    System.out.println("Неверный выбор! Попробуйте снова.");
                    break;
            }
        }
    }

    /**
     * Меню управления читателями
     */
    private static void runReadersMenu() {
        boolean running = true;
        
        while (running) {
            System.out.println("\n" + "-".repeat(40));
            System.out.println("        УПРАВЛЕНИЕ ЧИТАТЕЛЯМИ");
            System.out.println("-".repeat(40));
            System.out.println("1.  Добавить нового читателя");
            System.out.println("2.  Просмотреть всех читателей");
            System.out.println("3.  Найти читателя по имени");
            System.out.println("4.  Найти читателя по email");
            System.out.println("5.  Обновить информацию о читателе");
            System.out.println("6.  Удалить читателя");
            System.out.println("0.  Назад в главное меню");
            System.out.println("-".repeat(40));
            
            System.out.print("Выберите действие (0-6): ");
            String choice = scanner.nextLine().trim();
            
            switch (choice) {
                case "1":
                    addReader();
                    break;
                case "2":
                    viewAllReaders();
                    break;
                case "3":
                    searchReadersByName();
                    break;
                case "4":
                    searchReaderByEmail();
                    break;
                case "5":
                    updateReader();
                    break;
                case "6":
                    deleteReader();
                    break;
                case "0":
                    running = false;
                    break;
                default:
                    System.out.println("Неверный выбор! Попробуйте снова.");
                    break;
            }
        }
    }

    /**
     * Добавление новой книги
     */
    private static void addBook() {
        System.out.println("\n--- Добавление новой книги ---");
        
        System.out.print("Введите название книги: ");
        String title = scanner.nextLine().trim();
        if (title.isEmpty()) {
            System.out.println("Название книги не может быть пустым!");
            return;
        }
        
        System.out.print("Введите автора книги: ");
        String author = scanner.nextLine().trim();
        if (author.isEmpty()) {
            System.out.println("Автор книги не может быть пустым!");
            return;
        }
        
        System.out.print("Введите год издания: ");
        String yearStr = scanner.nextLine().trim();
        try {
            int year = Integer.parseInt(yearStr);
            
            Book createdBook = libraryService.addBook(title, author, year);
            
            System.out.println("Книга успешно добавлена:");
            System.out.println("   ID: " + createdBook.getId());
            System.out.println("   Название: " + createdBook.getTitle());
            System.out.println("   Автор: " + createdBook.getAuthor());
            System.out.println("   Год: " + createdBook.getYear());
            
        } catch (NumberFormatException e) {
            System.out.println("Неверный формат года! Введите число.");
        } catch (Exception e) {
            System.out.println("Ошибка при добавлении книги: " + e.getMessage());
        }
    }

    /**
     * Просмотр всех книг
     */
    private static void viewAllBooks() {
        System.out.println("\n--- Все книги в библиотеке ---");
        
        try {
            List<Book> books = libraryService.getAllBooks();
            
            if (books.isEmpty()) {
                System.out.println("В библиотеке пока нет книг.");
                return;
            }
            
            System.out.printf("%-4s %-30s %-25s %-6s %-10s%n", "ID", "Название", "Автор", "Год", "Статус");
            System.out.println("-".repeat(80));
            
            for (Book book : books) {
                String status = book.getIsAvailable() ? "Доступна" : "Выдана";
                System.out.printf("%-4d %-30s %-25s %-6d %-10s%n",
                    book.getId(), book.getTitle(), book.getAuthor(), book.getYear(), status);
            }
            
        } catch (Exception e) {
            System.out.println("Ошибка при получении списка книг: " + e.getMessage());
        }
    }

    /**
     * Просмотр доступных книг
     */
    private static void viewAvailableBooks() {
        System.out.println("\n--- Доступные для выдачи книги ---");
        
        try {
            List<Book> books = libraryService.getAvailableBooks();
            
            if (books.isEmpty()) {
                System.out.println("Нет доступных книг для выдачи.");
                return;
            }
            
            System.out.printf("%-4s %-30s %-25s %-6s%n", "ID", "Название", "Автор", "Год");
            System.out.println("-".repeat(70));
            
            for (Book book : books) {
                System.out.printf("%-4d %-30s %-25s %-6d%n",
                    book.getId(), book.getTitle(), book.getAuthor(), book.getYear());
            }
            
        } catch (Exception e) {
            System.out.println("Ошибка при получении списка доступных книг: " + e.getMessage());
        }
    }

    /**
     * Поиск книг по названию
     */
    private static void searchBooksByTitle() {
        System.out.println("\n--- Поиск книг по названию ---");
        System.out.print("Введите название книги (или его часть): ");
        String title = scanner.nextLine().trim();
        
        if (title.isEmpty()) {
            System.out.println("Название для поиска не может быть пустым!");
            return;
        }
        
        try {
            List<Book> books = libraryService.searchBooksByTitle(title);
            
            if (books.isEmpty()) {
                System.out.println("Книги с названием, содержащим '" + title + "', не найдены.");
                return;
            }
            
            System.out.println("Найденные книги:");
            System.out.printf("%-4s %-30s %-25s %-6s %-10s%n", "ID", "Название", "Автор", "Год", "Статус");
            System.out.println("-".repeat(80));
            
            for (Book book : books) {
                String status = book.getIsAvailable() ? "Доступна" : "Выдана";
                System.out.printf("%-4d %-30s %-25s %-6d %-10s%n",
                    book.getId(), book.getTitle(), book.getAuthor(), book.getYear(), status);
            }
            
        } catch (Exception e) {
            System.out.println("Ошибка при поиске книг: " + e.getMessage());
        }
    }

    /**
     * Поиск книг по автору
     */
    private static void searchBooksByAuthor() {
        System.out.println("\n--- Поиск книг по автору ---");
        System.out.print("Введите имя автора (или его часть): ");
        String author = scanner.nextLine().trim();
        
        if (author.isEmpty()) {
            System.out.println("Имя автора для поиска не может быть пустым!");
            return;
        }
        
        try {
            List<Book> books = libraryService.searchBooksByAuthor(author);
            
            if (books.isEmpty()) {
                System.out.println("Книги автора, содержащего '" + author + "', не найдены.");
                return;
            }
            
            System.out.println("Найденные книги:");
            System.out.printf("%-4s %-30s %-25s %-6s %-10s%n", "ID", "Название", "Автор", "Год", "Статус");
            System.out.println("-".repeat(80));
            
            for (Book book : books) {
                String status = book.getIsAvailable() ? "Доступна" : "Выдана";
                System.out.printf("%-4d %-30s %-25s %-6d %-10s%n",
                    book.getId(), book.getTitle(), book.getAuthor(), book.getYear(), status);
            }
            
        } catch (Exception e) {
            System.out.println("Ошибка при поиске книг по автору: " + e.getMessage());
        }
    }

    /**
     * Обновление информации о книге
     */
    private static void updateBook() {
        System.out.println("\n--- Обновление информации о книге ---");
        System.out.print("Введите ID книги для обновления: ");
        String idStr = scanner.nextLine().trim();
        
        try {
            int id = Integer.parseInt(idStr);
            Optional<Book> bookOpt = libraryService.getBookById(id);
            
            if (bookOpt.isEmpty()) {
                System.out.println("Книга с ID " + id + " не найдена!");
                return;
            }
            
            Book book = bookOpt.get();
            System.out.println("Текущая информация о книге:");
            System.out.println("  ID: " + book.getId());
            System.out.println("  Название: " + book.getTitle());
            System.out.println("  Автор: " + book.getAuthor());
            System.out.println("  Год: " + book.getYear());
            System.out.println("  Статус: " + (book.getIsAvailable() ? "Доступна" : "Выдана"));
            
            System.out.print("\nВведите новое название (Enter для пропуска): ");
            String newTitle = scanner.nextLine().trim();
            if (!newTitle.isEmpty()) {
                book.setTitle(newTitle);
            }
            
            System.out.print("Введите нового автора (Enter для пропуска): ");
            String newAuthor = scanner.nextLine().trim();
            if (!newAuthor.isEmpty()) {
                book.setAuthor(newAuthor);
            }
            
            System.out.print("Введите новый год издания (Enter для пропуска): ");
            String newYearStr = scanner.nextLine().trim();
            if (!newYearStr.isEmpty()) {
                try {
                    int newYear = Integer.parseInt(newYearStr);
                    book.setYear(newYear);
                } catch (NumberFormatException e) {
                    System.out.println("Неверный формат года! Год не изменен.");
                }
            }
            
            boolean updated = libraryService.updateBook(book);
            if (updated) {
                System.out.println("Информация о книге успешно обновлена!");
            } else {
                System.out.println("Ошибка при обновлении информации о книге!");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("Неверный формат ID! Введите число.");
        } catch (Exception e) {
            System.out.println("Ошибка при обновлении книги: " + e.getMessage());
        }
    }

    /**
     * Удаление книги
     */
    private static void deleteBook() {
        System.out.println("\n--- Удаление книги ---");
        System.out.print("Введите ID книги для удаления: ");
        String idStr = scanner.nextLine().trim();
        
        try {
            int id = Integer.parseInt(idStr);
            Optional<Book> bookOpt = libraryService.getBookById(id);
            
            if (bookOpt.isEmpty()) {
                System.out.println("Книга с ID " + id + " не найдена!");
                return;
            }
            
            Book book = bookOpt.get();
            System.out.println("Найдена книга: " + book.getTitle() + " (" + book.getAuthor() + ")");
            System.out.print("Вы уверены, что хотите удалить эту книгу? (y/N): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if ("y".equals(confirm) || "yes".equals(confirm) || "да".equals(confirm)) {
                boolean deleted = libraryService.deleteBook(id);
                if (deleted) {
                    System.out.println("Книга успешно удалена!");
                } else {
                    System.out.println("Ошибка при удалении книги!");
                }
            } else {
                System.out.println("Удаление отменено.");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("Неверный формат ID! Введите число.");
        } catch (Exception e) {
            System.out.println("Ошибка при удалении книги: " + e.getMessage());
        }
    }

    /**
     * Добавление нового читателя
     */
    private static void addReader() {
        System.out.println("\n--- Добавление нового читателя ---");
        
        System.out.print("Введите имя читателя: ");
        String firstName = scanner.nextLine().trim();
        if (firstName.isEmpty()) {
            System.out.println("Имя читателя не может быть пустым!");
            return;
        }
        
        System.out.print("Введите фамилию читателя: ");
        String lastName = scanner.nextLine().trim();
        if (lastName.isEmpty()) {
            System.out.println("Фамилия читателя не может быть пустой!");
            return;
        }
        
        System.out.print("Введите email читателя: ");
        String email = scanner.nextLine().trim();
        if (email.isEmpty()) {
            System.out.println("Email читателя не может быть пустым!");
            return;
        }
        
        try {
            Reader createdReader = libraryService.addReader(firstName, lastName, email);
            
            System.out.println("Читатель успешно добавлен:");
            System.out.println("   ID: " + createdReader.getId());
            System.out.println("   Имя: " + createdReader.getFirstName());
            System.out.println("   Фамилия: " + createdReader.getLastName());
            System.out.println("   Email: " + createdReader.getEmail());
            
        } catch (Exception e) {
            System.out.println("Ошибка при добавлении читателя: " + e.getMessage());
        }
    }

    /**
     * Просмотр всех читателей
     */
    private static void viewAllReaders() {
        System.out.println("\n--- Все читатели ---");
        
        try {
            List<Reader> readers = libraryService.getAllReaders();
            
            if (readers.isEmpty()) {
                System.out.println("В системе пока нет читателей.");
                return;
            }
            
            System.out.printf("%-4s %-15s %-15s %-30s%n", "ID", "Имя", "Фамилия", "Email");
            System.out.println("-".repeat(70));
            
            for (Reader reader : readers) {
                System.out.printf("%-4d %-15s %-15s %-30s%n",
                    reader.getId(), reader.getFirstName(), reader.getLastName(), reader.getEmail());
            }
            
        } catch (Exception e) {
            System.out.println("Ошибка при получении списка читателей: " + e.getMessage());
        }
    }

    /**
     * Поиск читателей по имени
     */
    private static void searchReadersByName() {
        System.out.println("\n--- Поиск читателей по имени ---");
        System.out.print("Введите имя или фамилию читателя: ");
        String name = scanner.nextLine().trim();
        
        if (name.isEmpty()) {
            System.out.println("Имя для поиска не может быть пустым!");
            return;
        }
        
        try {
            List<Reader> readers = libraryService.searchReadersByName(name);
            
            if (readers.isEmpty()) {
                System.out.println("Читатели с именем, содержащим '" + name + "', не найдены.");
                return;
            }
            
            System.out.println("Найденные читатели:");
            System.out.printf("%-4s %-15s %-15s %-30s%n", "ID", "Имя", "Фамилия", "Email");
            System.out.println("-".repeat(70));
            
            for (Reader reader : readers) {
                System.out.printf("%-4d %-15s %-15s %-30s%n",
                    reader.getId(), reader.getFirstName(), reader.getLastName(), reader.getEmail());
            }
            
        } catch (Exception e) {
            System.out.println("Ошибка при поиске читателей: " + e.getMessage());
        }
    }

    /**
     * Поиск читателя по email
     */
    private static void searchReaderByEmail() {
        System.out.println("\n--- Поиск читателя по email ---");
        System.out.print("Введите email читателя: ");
        String email = scanner.nextLine().trim();
        
        if (email.isEmpty()) {
            System.out.println("Email для поиска не может быть пустым!");
            return;
        }
        
        try {
            Optional<Reader> readerOpt = libraryService.getReaderByEmail(email);
            
            if (readerOpt.isEmpty()) {
                System.out.println("Читатель с email '" + email + "' не найден.");
                return;
            }
            
            Reader reader = readerOpt.get();
            System.out.println("Найденный читатель:");
            System.out.printf("%-4s %-15s %-15s %-30s%n", "ID", "Имя", "Фамилия", "Email");
            System.out.println("-".repeat(70));
            System.out.printf("%-4d %-15s %-15s %-30s%n",
                reader.getId(), reader.getFirstName(), reader.getLastName(), reader.getEmail());
            
        } catch (Exception e) {
            System.out.println("Ошибка при поиске читателя по email: " + e.getMessage());
        }
    }

    /**
     * Обновление информации о читателе
     */
    private static void updateReader() {
        System.out.println("\n--- Обновление информации о читателе ---");
        System.out.print("Введите ID читателя для обновления: ");
        String idStr = scanner.nextLine().trim();
        
        try {
            int id = Integer.parseInt(idStr);
            Optional<Reader> readerOpt = libraryService.getReaderById(id);
            
            if (readerOpt.isEmpty()) {
                System.out.println("Читатель с ID " + id + " не найден!");
                return;
            }
            
            Reader reader = readerOpt.get();
            System.out.println("Текущая информация о читателе:");
            System.out.println("  ID: " + reader.getId());
            System.out.println("  Имя: " + reader.getFirstName());
            System.out.println("  Фамилия: " + reader.getLastName());
            System.out.println("  Email: " + reader.getEmail());
            
            System.out.print("\nВведите новое имя (Enter для пропуска): ");
            String newFirstName = scanner.nextLine().trim();
            if (!newFirstName.isEmpty()) {
                reader.setFirstName(newFirstName);
            }
            
            System.out.print("Введите новую фамилию (Enter для пропуска): ");
            String newLastName = scanner.nextLine().trim();
            if (!newLastName.isEmpty()) {
                reader.setLastName(newLastName);
            }
            
            System.out.print("Введите новый email (Enter для пропуска): ");
            String newEmail = scanner.nextLine().trim();
            if (!newEmail.isEmpty()) {
                reader.setEmail(newEmail);
            }
            
            boolean updated = libraryService.updateReader(reader);
            if (updated) {
                System.out.println("Информация о читателе успешно обновлена!");
            } else {
                System.out.println("Ошибка при обновлении информации о читателе!");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("Неверный формат ID! Введите число.");
        } catch (Exception e) {
            System.out.println("Ошибка при обновлении читателя: " + e.getMessage());
        }
    }

    /**
     * Удаление читателя
     */
    private static void deleteReader() {
        System.out.println("\n--- Удаление читателя ---");
        System.out.print("Введите ID читателя для удаления: ");
        String idStr = scanner.nextLine().trim();
        
        try {
            int id = Integer.parseInt(idStr);
            Optional<Reader> readerOpt = libraryService.getReaderById(id);
            
            if (readerOpt.isEmpty()) {
                System.out.println("Читатель с ID " + id + " не найден!");
                return;
            }
            
            Reader reader = readerOpt.get();
            System.out.println("Найден читатель: " + reader.getFirstName() + " " + reader.getLastName());
            System.out.print("Вы уверены, что хотите удалить этого читателя? (y/N): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if ("y".equals(confirm) || "yes".equals(confirm) || "да".equals(confirm)) {
                boolean deleted = libraryService.deleteReader(id);
                if (deleted) {
                    System.out.println("Читатель успешно удален!");
                } else {
                    System.out.println("Ошибка при удалении читателя!");
                }
            } else {
                System.out.println(" Удаление отменено.");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("Неверный формат ID! Введите число.");
        } catch (Exception e) {
            System.out.println("Ошибка при удалении читателя: " + e.getMessage());
        }
    }

    /**
     * Выдача книги читателю
     */
    private static void loanBook() {
        System.out.println("\n--- Выдача книги читателю ---");
        
        System.out.print("Введите ID книги для выдачи: ");
        String bookIdStr = scanner.nextLine().trim();
        
        System.out.print("Введите ID читателя: ");
        String readerIdStr = scanner.nextLine().trim();
        
        try {
            int bookId = Integer.parseInt(bookIdStr);
            int readerId = Integer.parseInt(readerIdStr);
            
            boolean success = libraryService.loanBook(bookId, readerId);
            
            if (success) {
                System.out.println("Книга успешно выдана читателю!");
            } else {
                System.out.println("Не удалось выдать книгу. Проверьте, что книга доступна и читатель существует.");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("Неверный формат ID! Введите числа.");
        } catch (Exception e) {
            System.out.println("Ошибка при выдаче книги: " + e.getMessage());
        }
    }

    /**
     * Возврат книги
     */
    private static void returnBook() {
        System.out.println("\n--- Возврат книги ---");
        System.out.print("Введите ID книги для возврата: ");
        String bookIdStr = scanner.nextLine().trim();
        
        try {
            int bookId = Integer.parseInt(bookIdStr);
            
            boolean success = libraryService.returnBook(bookId);
            
            if (success) {
                System.out.println("Книга успешно возвращена!");
            } else {
                System.out.println("Не удалось вернуть книгу. Проверьте, что книга была выдана.");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("Неверный формат ID! Введите число.");
        } catch (Exception e) {
            System.out.println("Ошибка при возврате книги: " + e.getMessage());
        }
    }

    /**
     * Просмотр выданных книг
     */
    private static void viewLoans() {
        System.out.println("\n--- Выданные книги ---");
        
        try {
            List<LibraryService.BookLoanInfo> activeLoans = libraryService.getActiveLoansWithDetails();
            
            if (activeLoans.isEmpty()) {
                System.out.println("В данный момент нет выданных книг.");
                return;
            }
            
            System.out.printf("%-4s %-30s %-25s %-20s %-12s%n", "ID", "Книга", "Автор", "Читатель", "Дата выдачи");
            System.out.println("-".repeat(100));
            
            for (LibraryService.BookLoanInfo loan : activeLoans) {
                System.out.printf("%-4d %-30s %-25s %-20s %-12s%n",
                    loan.getLoanId(),
                    loan.getBook().getTitle(),
                    loan.getBook().getAuthor(),
                    loan.getReader().getFirstName() + " " + loan.getReader().getLastName(),
                    loan.getLoanDate()
                );
            }
            
        } catch (Exception e) {
            System.out.println("Ошибка при получении списка выданных книг: " + e.getMessage());
        }
    }

    /**
     * Показ статистики библиотеки
     */
    private static void showStatistics() {
        System.out.println("\n--- Статистика библиотеки ---");
        
        try {
            LibraryService.LibraryStatistics stats = libraryService.getStatistics();
            System.out.println(stats);
            
        } catch (Exception e) {
            System.out.println("Ошибка при получении статистики: " + e.getMessage());
        }
    }
}
