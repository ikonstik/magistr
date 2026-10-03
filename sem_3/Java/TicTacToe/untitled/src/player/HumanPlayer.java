package player;

import java.util.Scanner;

public class HumanPlayer extends Player {
    private final Scanner scanner;

    public HumanPlayer(char mark, Scanner scanner) {
        super(mark);
        this.scanner = scanner;
    }

    @Override
    public int[] makeMove() {
        while (true) {
            System.out.print("Введите строку и столбец через пробел от 1 до 3: ");
            if (!scanner.hasNextInt()) {
                System.out.println("Нужны два числа от 1 до 3.");
                scanner.next();
                continue;
            }
            int x = scanner.nextInt();
            if (!scanner.hasNextInt()) {
                System.out.println("Нужны два числа от 1 до 3.");
                scanner.next();
                continue;
            }
            int y = scanner.nextInt();
            if (x < 1 || x > 3 || y < 1 || y > 3) {
                System.out.println("Координаты должны быть от 1 до 3.");
                continue;
            }
            return new int[]{x - 1, y - 1};
        }
    }
}
