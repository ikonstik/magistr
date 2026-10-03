package player;

public abstract class Player {
    private final char mark;

    public Player(char mark) {
        this.mark = mark;
    }

    public char getMark() {
        return mark;
    }

    public abstract int[] makeMove();
}
