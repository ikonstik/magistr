package com.bank.ui;

import com.bank.model.Account;
import com.bank.service.AccountService;

import java.sql.SQLException;
import java.util.List;
import java.util.Scanner;

/**
 * Консольный интерфейс для работы с банковским приложением
 */
public class BankConsole {
    private final AccountService accountService;
    private final Scanner scanner;

    public BankConsole() {
        this.accountService = new AccountService();
        this.scanner = new Scanner(System.in);
    }

    /**
     * Запускает консольное приложение
     */
    public void run() {
        System.out.println("=== Банковское приложение для управления счетами ===");
        System.out.println("Добро пожаловать в систему управления банковскими счетами!");
        
        boolean running = true;
        while (running) {
            showMenu();
            try {
                int choice = Integer.parseInt(scanner.nextLine().trim());
                running = handleUserChoice(choice);
            } catch (NumberFormatException e) {
                System.out.println("Ошибка: Введите корректный номер пункта меню.");
            } catch (Exception e) {
                System.out.println("Произошла ошибка: " + e.getMessage());
            }
        }
        
        scanner.close();
        System.out.println("Спасибо за использование банковского приложения!");
    }

    /**
     * Отображает главное меню
     */
    private void showMenu() {
        System.out.println("\n=== ГЛАВНОЕ МЕНЮ ===");
        System.out.println("1. Создать новый счет");
        System.out.println("2. Перевести деньги между счетами");
        System.out.println("3. Просмотреть информацию о счете");
        System.out.println("4. Просмотреть все счета");
        System.out.println("5. Выход");
        System.out.print("Выберите пункт меню (1-5): ");
    }

    /**
     * Обрабатывает выбор пользователя
     * @param choice выбранный пункт меню
     * @return true, если приложение должно продолжать работу
     */
    private boolean handleUserChoice(int choice) {
        switch (choice) {
            case 1:
                createAccount();
                break;
            case 2:
                transferMoney();
                break;
            case 3:
                viewAccount();
                break;
            case 4:
                viewAllAccounts();
                break;
            case 5:
                return false;
            default:
                System.out.println("Неверный выбор. Пожалуйста, выберите пункт от 1 до 5.");
        }
        return true;
    }

    /**
     * Создает новый счет
     */
    private void createAccount() {
        System.out.println("\n=== СОЗДАНИЕ НОВОГО СЧЕТА ===");
        
        System.out.print("Введите имя владельца счета: ");
        String ownerName = scanner.nextLine().trim();
        
        if (ownerName.isEmpty()) {
            System.out.println("Ошибка: Имя владельца не может быть пустым.");
            return;
        }
        
        System.out.print("Введите начальный баланс: ");
        try {
            double balance = Double.parseDouble(scanner.nextLine().trim());
            
            if (balance < 0) {
                System.out.println("Ошибка: Баланс не может быть отрицательным.");
                return;
            }
            
            Account account = new Account(ownerName, balance);
            accountService.createAccount(account);
            
        } catch (NumberFormatException e) {
            System.out.println("Ошибка: Введите корректную сумму.");
        } catch (SQLException e) {
            System.out.println("Ошибка при создании счета: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("Ошибка валидации: " + e.getMessage());
        }
    }

    /**
     * Выполняет перевод денег между счетами
     */
    private void transferMoney() {
        System.out.println("\n=== ПЕРЕВОД ДЕНЕГ ===");
        
        try {
            System.out.print("Введите ID счета отправителя: ");
            int fromAccountId = Integer.parseInt(scanner.nextLine().trim());
            
            System.out.print("Введите ID счета получателя: ");
            int toAccountId = Integer.parseInt(scanner.nextLine().trim());
            
            System.out.print("Введите сумму перевода: ");
            double amount = Double.parseDouble(scanner.nextLine().trim());
            
            accountService.transferMoney(fromAccountId, toAccountId, amount);
            
        } catch (NumberFormatException e) {
            System.out.println("Ошибка: Введите корректные числовые значения.");
        } catch (SQLException e) {
            System.out.println("Ошибка при выполнении перевода: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("Ошибка валидации: " + e.getMessage());
        } catch (RuntimeException e) {
            System.out.println("Ошибка перевода: " + e.getMessage());
        }
    }

    /**
     * Просматривает информацию о конкретном счете
     */
    private void viewAccount() {
        System.out.println("\n=== ПРОСМОТР СЧЕТА ===");
        
        System.out.print("Введите ID счета: ");
        try {
            int accountId = Integer.parseInt(scanner.nextLine().trim());
            Account account = accountService.getAccount(accountId);
            
            if (account != null) {
                System.out.println("\nИнформация о счете:");
                System.out.println("ID: " + account.getId());
                System.out.println("Владелец: " + account.getOwnerName());
                System.out.println("Баланс: " + account.getBalance());
            } else {
                System.out.println("Счет с ID " + accountId + " не найден.");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("Ошибка: Введите корректный ID счета.");
        } catch (SQLException e) {
            System.out.println("Ошибка при получении информации о счете: " + e.getMessage());
        }
    }

    /**
     * Просматривает все счета
     */
    private void viewAllAccounts() {
        System.out.println("\n=== ВСЕ СЧЕТА ===");
        
        try {
            List<Account> accounts = accountService.getAllAccounts();
            
            if (accounts.isEmpty()) {
                System.out.println("Счета не найдены.");
            } else {
                System.out.println("Найдено счетов: " + accounts.size());
                System.out.println("----------------------------------------");
                for (Account account : accounts) {
                    System.out.println("ID: " + account.getId() + 
                                     " | Владелец: " + account.getOwnerName() + 
                                     " | Баланс: " + account.getBalance());
                }
                System.out.println("----------------------------------------");
            }
            
        } catch (SQLException e) {
            System.out.println("Ошибка при получении списка счетов: " + e.getMessage());
        }
    }
}
