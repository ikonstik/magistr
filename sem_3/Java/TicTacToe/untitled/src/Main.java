import java.util.Scanner;

void main() {
    Scanner scanner = new Scanner(System.in);
    int countPlayers = readPlayerCount(scanner);

    System.out.println("Имя первого игрока:");
    String name1 = readName(scanner);
    char mark1 = readMark(scanner);
    char mark2 = mark1 == 'X' ? 'O' : 'X';

    Player player1 = PlayerFactory.createPlayer(
            PlayerFactory.PlayerType.HUMAN, name1, mark1, scanner);
    Player player2;
    if (countPlayers == 2) {
        System.out.println("Имя второго игрока:");
        String name2 = readName(scanner);
        player2 = PlayerFactory.createPlayer(
                PlayerFactory.PlayerType.HUMAN, name2, mark2, scanner);
    } else {
        player2 = PlayerFactory.createPlayer(
                PlayerFactory.PlayerType.AI, "Компьютер", mark2, null);
    }

    Board board = Board.builder().build();
    Game.getInstance(board, player1, player2).startGame();
}

int readPlayerCount(Scanner scanner) {
    while (true) {
        System.out.println("Введите количество игроков: 1 — против компьютера, 2 — два игрока");
        int count = scanner.nextInt();
        scanner.nextLine();
        if (count == 1 || count == 2) {
            return count;
        }
        System.out.println("Можно выбрать только 1 или 2.");
    }
}

String readName(Scanner scanner) {
    while (true) {
        String name = scanner.nextLine().trim();
        if (!name.isEmpty()) {
            return name;
        }
        System.out.println("Имя не может быть пустым.");
    }
}

char readMark(Scanner scanner) {
    while (true) {
        System.out.println("Выберите символ для игрока (Х или О)");
        String token = scanner.nextLine().trim();
        if (token.isEmpty()) {
            System.out.println("Введите X или O.");
            continue;
        }
        char mark = normalizeMark(token.charAt(0));
        if (mark == 'X' || mark == 'O') {
            return mark;
        }
        System.out.println("Введите X или O.");
    }
}

char normalizeMark(char mark) {
    return switch (mark) {
        case 'X', 'x', 'Х', 'х' -> 'X';
        case 'O', 'o', 'О', 'о' -> 'O';
        default -> mark;
    };
}
