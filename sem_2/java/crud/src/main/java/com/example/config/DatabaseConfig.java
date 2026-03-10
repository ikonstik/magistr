package com.example.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * ===================================================================
 * КОНФИГУРАЦИЯ ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ MYSQL
 * ===================================================================
 * 
 * Этот класс предоставляет централизованную конфигурацию для подключения
 * к MySQL базе данных через JDBC DriverManager.
 * 
 * Основные функции:
 * - Регистрация JDBC драйвера MySQL
 * - Управление параметрами подключения
 * - Создание соединений с базой данных
 * - Проверка доступности подключения
 * - Логирование операций подключения
 * 
 * Использует паттерн Singleton для обеспечения единой точки
 * конфигурации подключения во всем приложении.
 * 
 * @author Система управления библиотекой
 * @version 1.0
 * @since 2024
 */
public class DatabaseConfig {
    
    // ===================================================================
    // ЛОГИРОВАНИЕ
    // ===================================================================
    
    /**
     * Логгер для записи информации о работе с базой данных
     * Использует SLF4J для гибкого выбора реализации логирования
     */
    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);
    
    // ===================================================================
    // КОНСТАНТЫ ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ
    // ===================================================================
    
    /**
     * URL для подключения к MySQL базе данных библиотеки
     * 
     * Параметры подключения:
     * - localhost:3306 - стандартные настройки MySQL
     * - library_db - название базы данных библиотеки
     * - useSSL=false - отключение SSL для локальной разработки
     * - serverTimezone=UTC - установка часового пояса UTC
     * - allowPublicKeyRetrieval=true - разрешение получения публичного ключа
     */
    private static final String DB_URL = "jdbc:mysql://localhost:3306/library_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    
    /**
     * Имя пользователя для подключения к базе данных
     * root - стандартный административный пользователь MySQL
     */
    private static final String DB_USERNAME = "root";
    
    /**
     * Пароль для подключения к базе данных
     * 
     * ВНИМАНИЕ: В реальных проектах пароли должны храниться в:
     * - Конфигурационных файлах (application.properties)
     * - Переменных окружения
     * - Системах управления секретами
     * - Зашифрованных хранилищах
     * 
     * НЕ ХРАНИТЕ ПАРОЛИ В ИСХОДНОМ КОДЕ!
     */
    private static final String DB_PASSWORD = "root"; // Замените на ваш пароль
    
    // ===================================================================
    // СТАТИЧЕСКИЙ БЛОК ИНИЦИАЛИЗАЦИИ
    // ===================================================================
    
    /**
     * Статический блок инициализации для регистрации JDBC драйвера
     * 
     * Выполняется один раз при первом обращении к классу.
     * Регистрирует MySQL JDBC драйвер в DriverManager.
     * 
     * В современных версиях Java (JDBC 4.0+) автоматическая регистрация
     * драйверов может работать, но явная регистрация обеспечивает
     * совместимость и предсказуемость поведения.
     */
    static {
        try {
            // Регистрация MySQL JDBC драйвера в DriverManager
            // Это позволяет DriverManager.getConnection() находить подходящий драйвер
            Class.forName("com.mysql.cj.jdbc.Driver");
            logger.info("Драйвер MySQL успешно зарегистрирован");
            
        } catch (ClassNotFoundException e) {
            // Обработка ошибки отсутствия драйвера
            logger.error("   Ошибка регистрации драйвера MySQL", e);
            logger.error("   Убедитесь, что mysql-connector-java.jar добавлен в classpath");
            
            // Выброс RuntimeException для предотвращения дальнейшей работы
            // если драйвер не найден, приложение не может работать с БД
            throw new RuntimeException("Не удалось зарегистрировать драйвер MySQL", e);
        }
    }

    // ===================================================================
    // ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С ПОДКЛЮЧЕНИЕМ
    // ===================================================================

    /**
     * Получение соединения с базой данных
     * 
     * Создает новое соединение с MySQL базой данных используя
     * зарегистрированный драйвер и параметры подключения.
     * 
     * Соединение должно быть закрыто после использования для
     * предотвращения утечек ресурсов.
     * 
     * @return Connection объект для работы с базой данных
     * @throws SQLException если произошла ошибка при установке соединения
     * 
     * @see java.sql.Connection
     * @see java.sql.DriverManager#getConnection(String, String, String)
     */
    public static Connection getConnection() throws SQLException {
        try {
            // Создание соединения через DriverManager
            // DriverManager автоматически выбирает подходящий драйвер по URL
            Connection connection = DriverManager.getConnection(DB_URL, DB_USERNAME, DB_PASSWORD);
            
            // Логирование успешного подключения (уровень DEBUG для частых операций)
            logger.debug("Соединение с базой данных установлено");
            logger.debug("   База данных: {}", connection.getCatalog());
            logger.debug("   URL: {}", connection.getMetaData().getURL());
            
            return connection;
            
        } catch (SQLException e) {
            // Логирование ошибки подключения с деталями
            logger.error("   Ошибка подключения к базе данных");
            logger.error("   URL: {}", DB_URL);
            logger.error("   Пользователь: {}", DB_USERNAME);
            logger.error("   Код ошибки: {}", e.getErrorCode());
            logger.error("   Состояние SQL: {}", e.getSQLState());
            logger.error("   Сообщение: {}", e.getMessage());
            
            // Повторный выброс исключения для обработки вызывающим кодом
            throw e;
        }
    }

    /**
     * Проверка доступности подключения к базе данных
     * 
     * Выполняет быструю проверку возможности подключения к БД
     * без выполнения сложных операций. Используется для валидации
     * конфигурации перед началом работы приложения.
     * 
     * Автоматически закрывает тестовое соединение после проверки.
     * 
     * @return true если подключение доступно, false в противном случае
     */
    public static boolean isConnectionAvailable() {
        try (Connection connection = getConnection()) {
            // Проверка, что соединение создано и не закрыто
            boolean isAvailable = connection != null && !connection.isClosed();
            
            if (isAvailable) {
                logger.debug("Проверка подключения: доступно");
            } else {
                logger.warn("Проверка подключения: недоступно");
            }
            
            return isAvailable;
            
        } catch (SQLException e) {
            // Логирование ошибки проверки подключения
            logger.error("Ошибка проверки подключения к базе данных", e);
            return false;
        }
    }

    /**
     * Тестирование подключения к базе данных
     * 
     * Выполняет полное тестирование подключения с выводом
     * подробной информации о результате. Используется для
     * диагностики проблем с подключением.
     * 
     * @return true если подключение успешно, false в противном случае
     */
    public static boolean testConnection() {
        try (Connection connection = getConnection()) {
            // Проверка состояния соединения
            if (connection != null && !connection.isClosed()) {
                // Получение метаданных для дополнительной информации
                String databaseProduct = connection.getMetaData().getDatabaseProductName();
                String databaseVersion = connection.getMetaData().getDatabaseProductVersion();
                String driverName = connection.getMetaData().getDriverName();
                String driverVersion = connection.getMetaData().getDriverVersion();
                
                logger.info("   Тест подключения к базе данных успешен");
                logger.info("   База данных: {} {}", databaseProduct, databaseVersion);
                logger.info("   Драйвер: {} {}", driverName, driverVersion);
                logger.info("   URL: {}", connection.getMetaData().getURL());
                
                return true;
            } else {
                logger.warn("Соединение с базой данных недоступно");
                return false;
            }
            
        } catch (SQLException e) {
            // Логирование ошибки тестирования с подробностями
            logger.error("Ошибка при тестировании подключения к базе данных");
            logger.error("   Код ошибки: {}", e.getErrorCode());
            logger.error("   Состояние SQL: {}", e.getSQLState());
            logger.error("   Сообщение: {}", e.getMessage());
            logger.error("   Причина: {}", e.getCause());
            
            return false;
        }
    }

    /**
     * Получение информации о подключении (без пароля)
     * 
     * Возвращает безопасную строку с информацией о подключении,
     * исключая пароль для предотвращения его случайного вывода в логах.
     * 
     * @return строка с информацией о подключении (URL и пользователь)
     */
    public static String getConnectionInfo() {
        return String.format("URL: %s, User: %s", DB_URL, DB_USERNAME);
    }
}