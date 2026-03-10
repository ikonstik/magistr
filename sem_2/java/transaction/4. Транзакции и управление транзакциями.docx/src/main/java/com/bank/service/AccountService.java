package com.bank.service;

import com.bank.database.DatabaseManager;
import com.bank.model.Account;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Сервис для работы с банковскими счетами
 */
public class AccountService {
    private final DatabaseManager dbManager;

    public AccountService() {
        this.dbManager = DatabaseManager.getInstance();
    }

    /**
     * Создает новый счет
     * @param account объект счета для создания
     * @throws SQLException если произошла ошибка при работе с БД
     * @throws IllegalArgumentException если данные счета некорректны
     */
    public void createAccount(Account account) throws SQLException, IllegalArgumentException {
        // Валидация данных
        validateAccount(account);
        
        String sql = "INSERT INTO accounts (owner_name, balance) VALUES (?, ?)";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, account.getOwnerName());
            stmt.setDouble(2, account.getBalance());
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        account.setId(generatedKeys.getInt(1));
                        System.out.println("Счет создан успешно с ID: " + account.getId());
                    }
                }
            }
        }
    }

    /**
     * Переводит деньги между счетами с использованием транзакций
     * @param fromAccountId ID счета отправителя
     * @param toAccountId ID счета получателя
     * @param amount сумма перевода
     * @throws SQLException если произошла ошибка при работе с БД
     * @throws IllegalArgumentException если параметры некорректны
     * @throws RuntimeException если недостаточно средств на счете
     */
    public void transferMoney(int fromAccountId, int toAccountId, double amount) 
            throws SQLException, IllegalArgumentException, RuntimeException {
        
        // Валидация параметров
        if (amount <= 0) {
            throw new IllegalArgumentException("Сумма перевода должна быть больше нуля");
        }
        
        if (fromAccountId == toAccountId) {
            throw new IllegalArgumentException("Нельзя переводить деньги на тот же счет");
        }
        
        Connection conn = null;
        try {
            conn = dbManager.getConnection();
            conn.setAutoCommit(false); // Начинаем транзакцию
            
            // Проверяем существование счетов и достаточность средств
            Account fromAccount = getAccountById(conn, fromAccountId);
            Account toAccount = getAccountById(conn, toAccountId);
            
            if (fromAccount == null) {
                throw new RuntimeException("Счет отправителя с ID " + fromAccountId + " не найден");
            }
            
            if (toAccount == null) {
                throw new RuntimeException("Счет получателя с ID " + toAccountId + " не найден");
            }
            
            if (fromAccount.getBalance() < amount) {
                throw new RuntimeException("Недостаточно средств на счете отправителя. " +
                        "Текущий баланс: " + fromAccount.getBalance() + ", требуется: " + amount);
            }
            
            // Выполняем перевод
            updateAccountBalance(conn, fromAccountId, fromAccount.getBalance() - amount);
            updateAccountBalance(conn, toAccountId, toAccount.getBalance() + amount);
            
            // Подтверждаем транзакцию
            conn.commit();
            System.out.println("Перевод выполнен успешно: " + amount + " с счета " + 
                    fromAccountId + " на счет " + toAccountId);
            
        } catch (SQLException | RuntimeException e) {
            // Откатываем транзакцию в случае ошибки
            if (conn != null) {
                try {
                    conn.rollback();
                    System.out.println("Транзакция откачена из-за ошибки: " + e.getMessage());
                } catch (SQLException rollbackEx) {
                    System.err.println("Ошибка при откате транзакции: " + rollbackEx.getMessage());
                }
            }
            throw e;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                } catch (SQLException e) {
                    System.err.println("Ошибка при восстановлении автокоммита: " + e.getMessage());
                }
            }
        }
    }

    /**
     * Получает информацию о счете по ID
     * @param id идентификатор счета
     * @return объект Account или null, если счет не найден
     * @throws SQLException если произошла ошибка при работе с БД
     */
    public Account getAccount(int id) throws SQLException {
        try (Connection conn = dbManager.getConnection()) {
            return getAccountById(conn, id);
        }
    }

    /**
     * Получает все счета
     * @return список всех счетов
     * @throws SQLException если произошла ошибка при работе с БД
     */
    public List<Account> getAllAccounts() throws SQLException {
        List<Account> accounts = new ArrayList<>();
        String sql = "SELECT id, owner_name, balance FROM accounts ORDER BY id";
        
        try (Connection conn = dbManager.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                Account account = new Account();
                account.setId(rs.getInt("id"));
                account.setOwnerName(rs.getString("owner_name"));
                account.setBalance(rs.getDouble("balance"));
                accounts.add(account);
            }
        }
        
        return accounts;
    }

    /**
     * Валидирует данные счета
     * @param account счет для валидации
     * @throws IllegalArgumentException если данные некорректны
     */
    private void validateAccount(Account account) throws IllegalArgumentException {
        if (account == null) {
            throw new IllegalArgumentException("Счет не может быть null");
        }
        
        if (account.getOwnerName() == null || account.getOwnerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Имя владельца счета не может быть пустым");
        }
        
        if (account.getBalance() < 0) {
            throw new IllegalArgumentException("Баланс счета не может быть отрицательным");
        }
    }

    /**
     * Получает счет по ID с использованием существующего подключения
     * @param conn подключение к БД
     * @param id идентификатор счета
     * @return объект Account или null, если счет не найден
     * @throws SQLException если произошла ошибка при работе с БД
     */
    private Account getAccountById(Connection conn, int id) throws SQLException {
        String sql = "SELECT id, owner_name, balance FROM accounts WHERE id = ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Account account = new Account();
                    account.setId(rs.getInt("id"));
                    account.setOwnerName(rs.getString("owner_name"));
                    account.setBalance(rs.getDouble("balance"));
                    return account;
                }
            }
        }
        
        return null;
    }

    /**
     * Обновляет баланс счета
     * @param conn подключение к БД
     * @param accountId ID счета
     * @param newBalance новый баланс
     * @throws SQLException если произошла ошибка при работе с БД
     */
    private void updateAccountBalance(Connection conn, int accountId, double newBalance) throws SQLException {
        String sql = "UPDATE accounts SET balance = ? WHERE id = ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setDouble(1, newBalance);
            stmt.setInt(2, accountId);
            
            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Не удалось обновить баланс счета с ID: " + accountId);
            }
        }
    }
}
