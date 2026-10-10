import java.util.Scanner;

public class PlayerFactory {
    public enum PlayerType {
        HUMAN,
        AI
    }

    private PlayerFactory() {
    }

    public static Player createPlayer(PlayerType type, String name, char mark, Scanner scanner) {
        return switch (type) {
            case HUMAN -> {
                if (scanner == null) {
                    throw new IllegalArgumentException("Для HumanPlayer нужен Scanner.");
                }
                yield new HumanPlayer(name, mark, scanner);
            }
            case AI -> new AIPlayer(name, mark);
        };
    }
}
