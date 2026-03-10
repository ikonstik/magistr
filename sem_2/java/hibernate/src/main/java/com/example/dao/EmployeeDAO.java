package com.example.dao;

import com.example.entity.Employee;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.query.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;

public class EmployeeDAO {

    private final SessionFactory sessionFactory;

    // Конструктор принимает SessionFactory
    public EmployeeDAO(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    // --- CREATE (Добавление) ---
    public void save(Employee employee) {
        executeInTransaction(session -> session.persist(employee));
    }

    // --- READ (Получение по ID) ---
    public Employee findById(Long id) {
        return executeWithResult(session -> session.get(Employee.class, id));
    }

    // --- READ (Получение всех сотрудников) ---
    public List<Employee> findAll() {
        return executeWithResult(session -> {
            Query<Employee> query = session.createQuery("FROM Employee", Employee.class);
            return query.list();
        });
    }

    // --- UPDATE (Обновление) ---
    public void update(Employee employee) {
        executeInTransaction(session -> session.merge(employee));
    }

    // --- DELETE by ID (Удаление по ID) ---
    public void deleteById(Long id) {
        executeInTransaction(session -> {
            Employee employee = session.get(Employee.class, id);
            if (employee != null) {
                session.remove(employee);
            }
        });
    }

    // --- ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С ТРАНЗАКЦИЯМИ ---

    // Метод для операций без возврата результата (save, update, delete)
    private void executeInTransaction(Consumer<Session> action) {
        Transaction transaction = null;
        try (Session session = sessionFactory.openSession()) {
            transaction = session.beginTransaction();
            action.accept(session);
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            throw new RuntimeException("Ошибка при выполнении операции с БД", e);
        }
    }

    // Метод для операций с возвратом результата (find)
    private <T> T executeWithResult(Function<Session, T> action) {
        try (Session session = sessionFactory.openSession()) {
            return action.apply(session);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при выполнении операции с БД", e);
        }
    }

    // --- ДОПОЛНИТЕЛЬНЫЕ ПОЛЕЗНЫЕ МЕТОДЫ ---

    // Получить сотрудника по email
    public Employee findByEmail(String email) {
        return executeWithResult(session -> {
            Query<Employee> query = session.createQuery(
                    "FROM Employee WHERE email = :email", Employee.class);
            query.setParameter("email", email);
            return query.uniqueResult();
        });
    }

    // Получить сотрудников с зарплатой выше указанной
    public List<Employee> findBySalaryGreaterThan(BigDecimal salary) {
        return executeWithResult(session -> {
            Query<Employee> query = session.createQuery(
                    "FROM Employee WHERE salary > :salary", Employee.class);
            query.setParameter("salary", salary);
            return query.list();
        });
    }

    // Получить количество сотрудников
    public Long count() {
        return executeWithResult(session -> {
            Query<Long> query = session.createQuery(
                    "SELECT COUNT(e) FROM Employee e", Long.class);
            return query.uniqueResult();
        });
    }
}