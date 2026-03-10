package org.example;

import com.example.entity.Employee;
import com.example.dao.EmployeeDAO;
import com.example.console.ConsoleApp;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class Main {
    public static void main(String[] args) {
        try {
            // Создаем SessionFactory
            SessionFactory factory = new Configuration()
                    .configure("hibernate.cfg.xml")
                    .addAnnotatedClass(Employee.class)
                    .buildSessionFactory();

            // Создаем DAO
            EmployeeDAO employeeDAO = new EmployeeDAO(factory);

            // Запускаем консольное приложение
            ConsoleApp app = new ConsoleApp(employeeDAO);
            app.start();

            // Закрываем factory при выходе
            factory.close();

        } catch (Exception e) {
            System.err.println("Ошибка при запуске приложения:");
            e.printStackTrace();
        }
    }
}
