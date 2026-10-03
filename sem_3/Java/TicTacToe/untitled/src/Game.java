import player.HumanPlayer;
import player.Player;

import java.util.Random;

public class Game {
    private final Random random = new Random();
    private final Board board = new Board();
    private final Player player1;
    private final Player player2;
    private Player currentPlayer;

    public Game(Player player1, Player player2) {
        this.player1 = player1;
        this.player2 = player2;
    }

    public void play() {
        currentPlayer = random.nextBoolean() ? player1 : player2;
        System.out.println("Первым ходит " + currentPlayer.getMark());
        board.showBoard();

        while (true) {
            System.out.println("Ход " + currentPlayer.getMark());
            placeCurrentMove();
            board.showBoard();

            char winner = board.getWinner();
            if (winner != '-') {
                System.out.println("Победил " + winner);
                return;
            }
            if (board.isFull()) {
                System.out.println("Ничья");
                return;
            }
            switchPlayer();
        }
    }

    private void placeCurrentMove() {
        while (true) {
            int[] move = currentPlayer.makeMove();
            if (board.placeMark(move[0], move[1], currentPlayer.getMark())) {
                return;
            }
            if (currentPlayer instanceof HumanPlayer) {
                System.out.println("Эта клетка занята. Выберите другую.");
            }
        }
    }

    private void switchPlayer() {
        currentPlayer = currentPlayer == player1 ? player2 : player1;
    }
}
