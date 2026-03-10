import java.sql.*;
import java.util.ArrayList;


public class DBConnection {
    static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/product_db";
        String user = "postgres";
        String password = "123";

        try {
            Connection connection = DriverManager.getConnection(url, user, password);
            if (connection != null) {
                System.out.println("Соединение установлено");
            }

            String createTable = "CREATE TABLE IF NOT EXISTS products (" +
                    "id SERIAL PRIMARY KEY," +
                    "name VARCHAR(100) NOT NULL," +
                    "price DECIMAL(10,2) NOT NULL)";
            Statement statement = connection.createStatement();
            statement.executeUpdate(createTable);

            ArrayList<Product> products = new ArrayList<>();
            products.add(new Product("Bread", 99.2));
            products.add(new Product("Milk", 87.5));
            products.add(new Product("Eggs", 102.5));
            products.add(new Product("Pasta", 180.0));
            products.add(new Product("Sausage", 353.8));

            for (Product p : products) {
                String insertQuery = "INSERT INTO products (name, price) VALUES (?, ?)";
                PreparedStatement preparedStatement = connection.prepareStatement(insertQuery);
                preparedStatement.setString(1, p.name);
                preparedStatement.setDouble(2, p.price);
                preparedStatement.executeUpdate();
            }

        } catch (SQLException e) {
            System.out.println("Ошибка" + e.getMessage());
        }
    }
}
