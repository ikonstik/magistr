import java.util.Random;

public class Game {
    private static Game instance;

    private final Random random = new Random();
    private final Board board;
    private final Player player1;
    private final Player player2;
    private Player currentPlayer;

    private Game(Board board, Player player1, Player player2) {
        this.board = board;
        this.player1 = player1;
        this.player2 = player2;
    }

    public static Game getInstance(Board board, Player player1, Player player2) {
        if (instance == null) {
            instance = new Game(board, player1, player2);
        }
        return instance;
    }

    public void startGame() {
        currentPlayer = getFirstPlayer();
        System.out.println("Первым ходит " + currentPlayer.getName()
                + " (" + currentPlayer.getMark() + ")");
        board.displayBoard();

        while (true) {
            System.out.println("Ход " + currentPlayer.getName()
                    + " (" + currentPlayer.getMark() + ")");
            int[] move = currentPlayer.makeMove(board);
            board.placeMark(move[0], move[1], currentPlayer.getMark());
            board.displayBoard();
            if (checkForWinOrDraw()) {
                return;
            }
            switchPlayer();
        }
    }

    public void switchPlayer() {
        currentPlayer = currentPlayer == player1 ? player2 : player1;
    }

    public boolean checkForWinOrDraw() {
        if (board.checkWin()) {
            System.out.println("Победил " + currentPlayer.getName()
                    + " (" + currentPlayer.getMark() + ")");
            return true;
        }
        if (board.isFull()) {
            System.out.println("Ничья");
            return true;
        }
        return false;
    }

    public Player getFirstPlayer() {
        int num = random.nextInt(2);
        if (num == 0) {
            return player1;
        }
        return player2;
    }

    public Board getBoard() {
        return board;
    }

    public Player getCurrentPlayer() {
        return currentPlayer;
    }
}
