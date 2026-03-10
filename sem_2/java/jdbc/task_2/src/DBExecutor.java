import java.sql.*;

public class DBExecutor {
    static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/product_db";
        String user = "postgres";
        String password = "123";

        try {
            Connection connection = DriverManager.getConnection(url, user, password);
            if (connection != null) {
                System.out.println("Соединение установлено");
            }

            String select = "SELECT id, name, price FROM products";
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery(select);

            while (resultSet.next()) {
                int id = resultSet.getInt("id");
                String name = resultSet.getString("name");
                double price = resultSet.getDouble("price");
                System.out.println("ID: " + id + ", name: " + name + ", price: " + price + ".");
            }


        } catch (SQLException e) {
            System.out.println("Ошибка" + e.getMessage());
        }
    }
}