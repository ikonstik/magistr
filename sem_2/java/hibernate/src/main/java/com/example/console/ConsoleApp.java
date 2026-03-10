package com.example.console;

import com.example.dao.EmployeeDAO;
import com.example.entity.Employee;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import java.math.BigDecimal;
import java.util.List;
import java.util.Scanner;

public class ConsoleApp {

    private final EmployeeDAO employeeDAO;
    private final Scanner scanner;

    public ConsoleApp(EmployeeDAO employeeDAO) {
        this.employeeDAO = employeeDAO;
        this.scanner = new Scanner(System.in);
    }

    public void start() {
        System.out.println("╔════════════════════════════════════╗");
        System.out.println("║   Система управления сотрудниками  ║");
        System.out.println("╚════════════════════════════════════╝");

        while (true) {
            printMainMenu();
            int choice = readInt("Выберите операцию: ");

            switch (choice) {
                case 1:
                    addEmployee();
                    break;
                case 2:
                    listAllEmployees();
                    break;
                case 3:
                    findEmployeeById();
                    break;
                case 4:
                    updateEmployee();
                    break;
                case 5:
                    deleteEmployee();
                    break;
                case 6:
                    searchByEmail();
                    break;
                case 7:
                    filterBySalary();
                    break;
                case 0:
                    System.out.println("👋 До свидания!");
                    return;
                default:
                    System.out.println("❌ Неверный выбор. Попробуйте снова.");
            }

            System.out.println("\nНажмите Enter для продолжения...");
            scanner.nextLine();
        }
    }

    private void printMainMenu() {
        System.out.println("\n═══════════════════════════════════");
        System.out.println("📋 ГЛАВНОЕ МЕНЮ:");
        System.out.println("1. ➕ Добавить нового сотрудника");
        System.out.println("2. 📋 Показать всех сотрудников");
        System.out.println("3. 🔍 Найти сотрудника по ID");
        System.out.println("4. ✏️ Обновить данные сотрудника");
        System.out.println("5. 🗑️ Удалить сотрудника");
        System.out.println("6. 📧 Поиск по email");
        System.out.println("7. 💰 Фильтр по зарплате");
        System.out.println("0. 🚪 Выход");
        System.out.println("═══════════════════════════════════");
    }

    // 1. Добавление сотрудника
    private void addEmployee() {
        System.out.println("\n--- ➕ ДОБАВЛЕНИЕ НОВОГО СОТРУДНИКА ---");

        String firstName = readString("Введите имя: ");
        String lastName = readString("Введите фамилию: ");
        String email = readString("Введите email: ");
        BigDecimal salary = readBigDecimal("Введите зарплату: ");

        // Проверка на уникальность email
        if (employeeDAO.findByEmail(email) != null) {
            System.out.println("❌ Сотрудник с таким email уже существует!");
            return;
        }

        Employee employee = new Employee(firstName, lastName, email, salary);
        employeeDAO.save(employee);
        System.out.println("✅ Сотрудник успешно добавлен с ID: " + employee.getId());
    }

    // 2. Просмотр всех сотрудников
    private void listAllEmployees() {
        System.out.println("\n--- 📋 ВСЕ СОТРУДНИКИ ---");
        List<Employee> employees = employeeDAO.findAll();

        if (employees.isEmpty()) {
            System.out.println("📭 В базе данных нет сотрудников.");
            return;
        }

        System.out.printf("%-5s | %-15s | %-15s | %-25s | %10s%n",
                "ID", "Имя", "Фамилия", "Email", "Зарплата");
        System.out.println("--------------------------------------------------------------------------------");

        for (Employee emp : employees) {
            System.out.printf("%-5d | %-15s | %-15s | %-25s | %10.2f%n",
                    emp.getId(),
                    emp.getFirstName(),
                    emp.getLastName(),
                    emp.getEmail(),
                    emp.getSalary());
        }
    }

    // 3. Поиск по ID
    private void findEmployeeById() {
        System.out.println("\n--- 🔍 ПОИСК ПО ID ---");
        Long id = readLong("Введите ID сотрудника: ");

        Employee employee = employeeDAO.findById(id);
        if (employee == null) {
            System.out.println("❌ Сотрудник с ID " + id + " не найден.");
            return;
        }

        printEmployeeDetails(employee);
    }

    // 4. Обновление сотрудника
    private void updateEmployee() {
        System.out.println("\n--- ✏️ ОБНОВЛЕНИЕ ДАННЫХ СОТРУДНИКА ---");
        Long id = readLong("Введите ID сотрудника для обновления: ");

        Employee employee = employeeDAO.findById(id);
        if (employee == null) {
            System.out.println("❌ Сотрудник с ID " + id + " не найден.");
            return;
        }

        System.out.println("\nТекущие данные:");
        printEmployeeDetails(employee);

        System.out.println("\nВведите новые данные (Enter - оставить без изменений):");

        String firstName = readStringWithDefault("Имя", employee.getFirstName());
        String lastName = readStringWithDefault("Фамилия", employee.getLastName());
        String email = readStringWithDefault("Email", employee.getEmail());

        // Проверка email на уникальность (если изменился)
        if (!email.equals(employee.getEmail()) && employeeDAO.findByEmail(email) != null) {
            System.out.println("❌ Сотрудник с таким email уже существует!");
            return;
        }

        String salaryStr = readStringWithDefault("Зарплата", employee.getSalary().toString());
        BigDecimal salary = new BigDecimal(salaryStr);

        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setEmail(email);
        employee.setSalary(salary);

        employeeDAO.update(employee);
        System.out.println("✅ Данные сотрудника успешно обновлены!");
    }

    // 5. Удаление сотрудника
    private void deleteEmployee() {
        System.out.println("\n--- 🗑️ УДАЛЕНИЕ СОТРУДНИКА ---");
        Long id = readLong("Введите ID сотрудника для удаления: ");

        Employee employee = employeeDAO.findById(id);
        if (employee == null) {
            System.out.println("❌ Сотрудник с ID " + id + " не найден.");
            return;
        }

        System.out.println("\nСотрудник, которого вы собираетесь удалить:");
        printEmployeeDetails(employee);

        String confirm = readString("Вы уверены? (да/нет): ");
        if (confirm.equalsIgnoreCase("да") || confirm.equalsIgnoreCase("yes") || confirm.equalsIgnoreCase("y")) {
            employeeDAO.deleteById(id);
            System.out.println("✅ Сотрудник успешно удален!");
        } else {
            System.out.println("❌ Удаление отменено.");
        }
    }

    // 6. Поиск по email
    private void searchByEmail() {
        System.out.println("\n--- 📧 ПОИСК ПО EMAIL ---");
        String email = readString("Введите email: ");

        Employee employee = employeeDAO.findByEmail(email);
        if (employee == null) {
            System.out.println("❌ Сотрудник с email " + email + " не найден.");
            return;
        }

        printEmployeeDetails(employee);
    }

    // 7. Фильтр по зарплате
    private void filterBySalary() {
        System.out.println("\n--- 💰 ФИЛЬТР ПО ЗАРПЛАТЕ ---");
        System.out.println("1. Сотрудники с зарплатой выше указанной");
        System.out.println("2. Сотрудники с зарплатой ниже указанной");
        System.out.print("Выберите вариант: ");
        int choice = scanner.nextInt();
        scanner.nextLine(); // очистка буфера

        BigDecimal salary = readBigDecimal("Введите сумму: ");
        List<Employee> employees;

        if (choice == 1) {
            employees = employeeDAO.findBySalaryGreaterThan(salary);
            System.out.println("\n📊 Сотрудники с зарплатой > " + salary + ":");
        } else {
            System.out.println("❌ Неверный выбор.");
            return;
        }

        if (employees.isEmpty()) {
            System.out.println("📭 Нет сотрудников, соответствующих критерию.");
            return;
        }

        for (Employee emp : employees) {
            System.out.printf("ID: %d | %s %s | %s | %.2f%n",
                    emp.getId(), emp.getFirstName(), emp.getLastName(),
                    emp.getEmail(), emp.getSalary());
        }
    }


    // --- ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ВВОДА ---

    private void printEmployeeDetails(Employee employee) {
        System.out.println("═══════════════════════════════════");
        System.out.println("ID: " + employee.getId());
        System.out.println("Имя: " + employee.getFirstName());
        System.out.println("Фамилия: " + employee.getLastName());
        System.out.println("Email: " + employee.getEmail());
        System.out.printf("Зарплата: %.2f%n", employee.getSalary());
        System.out.println("═══════════════════════════════════");
    }

    private String readString(String prompt) {
        System.out.print(prompt);
        return scanner.nextLine().trim();
    }

    private String readStringWithDefault(String fieldName, String defaultValue) {
        System.out.print(fieldName + " [" + defaultValue + "]: ");
        String input = scanner.nextLine().trim();
        return input.isEmpty() ? defaultValue : input;
    }

    private int readInt(String prompt) {
        while (true) {
            try {
                System.out.print(prompt);
                int value = scanner.nextInt();
                scanner.nextLine(); // очистка буфера
                return value;
            } catch (Exception e) {
                System.out.println("❌ Пожалуйста, введите число.");
                scanner.nextLine(); // очистка буфера
            }
        }
    }

    private long readLong(String prompt) {
        while (true) {
            try {
                System.out.print(prompt);
                long value = scanner.nextLong();
                scanner.nextLine(); // очистка буфера
                return value;
            } catch (Exception e) {
                System.out.println("❌ Пожалуйста, введите число.");
                scanner.nextLine(); // очистка буфера
            }
        }
    }

    private BigDecimal readBigDecimal(String prompt) {
        while (true) {
            try {
                System.out.print(prompt);
                String input = scanner.nextLine().trim();
                return new BigDecimal(input);
            } catch (NumberFormatException e) {
                System.out.println("❌ Пожалуйста, введите корректное число.");
            }
        }
    }

    // --- ТОЧКА ВХОДА ---
    public static void main(String[] args) {
        // Настройка Hibernate
        try (SessionFactory factory = new Configuration()
                .configure("hibernate.cfg.xml")
                .addAnnotatedClass(Employee.class)
                .buildSessionFactory()) {

            EmployeeDAO employeeDAO = new EmployeeDAO(factory);
            ConsoleApp app = new ConsoleApp(employeeDAO);


            app.start();

        } catch (Exception e) {
            System.err.println("❌ Ошибка при запуске приложения:");
            e.printStackTrace();
        }
    }
}
