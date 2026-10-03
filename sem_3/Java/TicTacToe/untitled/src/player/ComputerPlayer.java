package player;

import java.util.Random;

public class ComputerPlayer extends Player {
    private final Random random = new Random();

    public ComputerPlayer(char mark) {
        super(mark);
    }

    @Override
    public int[] makeMove() {
        return new int[]{random.nextInt(3), random.nextInt(3)};
    }
}
