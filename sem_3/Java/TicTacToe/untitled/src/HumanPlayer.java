import java.util.Scanner;

public class HumanPlayer extends Player {
    private final Scanner scanner;

    public HumanPlayer(String name, char mark, Scanner scanner) {
        super(name, mark);
        this.scanner = scanner;
    }

    @Override
    public int[] makeMove(Board board) {
        while (true) {
            System.out.print("Введите строку и столбец через пробел от 1 до 3: ");
            int row = scanner.nextInt();
            int col = scanner.nextInt();
            if (row < 1 || row > 3 || col < 1 || col > 3) {
                System.out.println("Координаты должны быть от 1 до 3.");
                continue;
            }
            if (!board.isFree(row - 1, col - 1)) {
                System.out.println("Эта клетка занята. Выберите другую.");
                continue;
            }
            return new int[]{row - 1, col - 1};
        }
    }
}
