import java.util.Random;

public class AIPlayer extends Player {
    private final Random random = new Random();
    private final String name = "Компьютер";

    public AIPlayer(String name, char mark) {
        super("Компьютер", mark);
    }

    @Override
    public int[] makeMove(Board board) {
        int row;
        int col;
        do {
            row = random.nextInt(3);
            col = random.nextInt(3);
        } while (!board.isFree(row, col));
        System.out.println(getName() + " ходит: " + (row + 1) + " " + (col + 1));
        return new int[]{row, col};
    }
}
