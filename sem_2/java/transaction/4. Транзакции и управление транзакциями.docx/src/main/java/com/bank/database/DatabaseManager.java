package com.bank.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Класс для управления подключением к базе данных
 */
public class DatabaseManager {
    private static final String DB_URL = "jdbc:h2:mem:bankdb;DB_CLOSE_DELAY=-1";
    private static final String DB_USER = "sa";
    private static final String DB_PASSWORD = "";
    
    private static DatabaseManager instance;
    private Connection connection;

    private DatabaseManager() {
        initializeDatabase();
    }

    /**
     * Получить экземпляр DatabaseManager (Singleton)
     * @return экземпляр DatabaseManager
     */
    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }

    /**
     * Получить подключение к базе данных
     * @return Connection объект
     * @throws SQLException если не удается подключиться к БД
     */
    public Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
        }
        return connection;
    }

    /**
     * Инициализация базы данных и создание таблиц
     */
    private void initializeDatabase() {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             Statement stmt = conn.createStatement()) {
            
            // Создание таблицы accounts
            String createTableSQL = "CREATE TABLE IF NOT EXISTS accounts (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "owner_name VARCHAR(255) NOT NULL, " +
                    "balance DECIMAL(15,2) NOT NULL CHECK (balance >= 0)" +
                    ")";
            
            stmt.execute(createTableSQL);
            System.out.println("База данных инициализирована успешно");
            
        } catch (SQLException e) {
            System.err.println("Ошибка при инициализации базы данных: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Закрыть подключение к базе данных
     */
    public void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("Подключение к базе данных закрыто");
            }
        } catch (SQLException e) {
            System.err.println("Ошибка при закрытии подключения: " + e.getMessage());
        }
    }
}
