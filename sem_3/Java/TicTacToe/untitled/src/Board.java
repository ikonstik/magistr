public class Board {
    private final char[][] grid = {
            {'-', '-', '-'},
            {'-', '-', '-'},
            {'-', '-', '-'}
    };

    public void showBoard() {
        System.out.println("  1 2 3");
        for (int row = 0; row < grid.length; row++) {
            System.out.print((row + 1) + " ");
            for (char cell : grid[row]) {
                System.out.print(cell + " ");
            }
            System.out.println();
        }
    }

    public boolean placeMark(int x, int y, char mark) {
        if (!isInside(x, y) || grid[x][y] != '-') {
            return false;
        }
        grid[x][y] = mark;
        return true;
    }

    public boolean isFull() {
        for (char[] row : grid) {
            for (char cell : row) {
                if (cell == '-') {
                    return false;
                }
            }
        }
        return true;
    }

    public char getWinner() {
        for (int i = 0; i < 3; i++) {
            if (same(grid[i][0], grid[i][1], grid[i][2])) {
                return grid[i][0];
            }
            if (same(grid[0][i], grid[1][i], grid[2][i])) {
                return grid[0][i];
            }
        }
        if (same(grid[0][0], grid[1][1], grid[2][2])) {
            return grid[0][0];
        }
        if (same(grid[0][2], grid[1][1], grid[2][0])) {
            return grid[0][2];
        }
        return '-';
    }

    private boolean isInside(int x, int y) {
        return x >= 0 && x < 3 && y >= 0 && y < 3;
    }

    private boolean same(char a, char b, char c) {
        return a != '-' && a == b && b == c;
    }
}
