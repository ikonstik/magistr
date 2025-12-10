import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;

public class Output_task {
    public static void main(String[] args) {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter("output.txt"))) {

            for (int i = 1; i < 11; i++) {
                bw.write("Запись " + i);
                bw.newLine();
            }
            bw.write("Файл успешно записан");
            System.out.println("Данные успешно записаны в файл output.txt");

        } catch (FileNotFoundException e) {
            System.out.println("Ошибка: Файл input.txt не найден в корне проекта");
        } catch (IOException e) {
            System.out.println("Ошибка ввода-вывода при чтении файла: " + e.getMessage());;
        }
    }
}
