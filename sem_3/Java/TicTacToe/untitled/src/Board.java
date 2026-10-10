public class Board {
    private static final int DEFAULT_SIZE = 3;

    private final char[][] grid;
    private final char emptyCell;

    private Board(char[][] grid, char emptyCell) {
        this.grid = grid;
        this.emptyCell = emptyCell;
    }

    public static Builder builder() {
        return new Builder();
    }

    public void displayBoard() {
        System.out.print("  ");
        for (int col = 1; col <= grid[0].length; col++) {
            System.out.print(col + " ");
        }
        System.out.println();
        for (int row = 0; row < grid.length; row++) {
            System.out.print((row + 1) + " ");
            for (char cell : grid[row]) {
                System.out.print(cell + " ");
            }
            System.out.println();
        }
    }

    public boolean isFree(int row, int col) {
        return isInside(row, col) && grid[row][col] == emptyCell;
    }

    public boolean placeMark(int row, int col, char mark) {
        if (!isFree(row, col)) {
            return false;
        }
        grid[row][col] = mark;
        return true;
    }

    public boolean isFull() {
        for (char[] row : grid) {
            for (char cell : row) {
                if (cell == emptyCell) {
                    return false;
                }
            }
        }
        return true;
    }

    public boolean checkWin() {
        int size = grid.length;
        for (int i = 0; i < size; i++) {
            if (same(grid[i][0], grid[i][1], grid[i][2])) {
                return true;
            }
            if (same(grid[0][i], grid[1][i], grid[2][i])) {
                return true;
            }
        }
        return same(grid[0][0], grid[1][1], grid[2][2])
                || same(grid[0][2], grid[1][1], grid[2][0]);
    }

    private boolean isInside(int row, int col) {
        return row >= 0 && row < grid.length && col >= 0 && col < grid[row].length;
    }

    private boolean same(char a, char b, char c) {
        return a != emptyCell && a == b && b == c;
    }

    public static class Builder {
        private int size = DEFAULT_SIZE;
        private char emptyCell = '-';
        private char[][] grid;

        public Builder size(int size) {
            if (size != DEFAULT_SIZE) {
                throw new IllegalArgumentException("Для этой игры размер поля должен быть 3.");
            }
            this.size = size;
            initGrid();
            return this;
        }

        public Builder emptyCell(char emptyCell) {
            this.emptyCell = emptyCell;
            initGrid();
            return this;
        }

        public Builder mark(int row, int col, char mark) {
            ensureGrid();
            if (!isInside(row, col)) {
                throw new IllegalArgumentException("Клетка вне поля: " + (row + 1) + " " + (col + 1));
            }
            if (grid[row][col] != emptyCell) {
                throw new IllegalArgumentException("Клетка уже занята: " + (row + 1) + " " + (col + 1));
            }
            grid[row][col] = mark;
            return this;
        }

        public Board build() {
            ensureGrid();
            char[][] copy = new char[size][size];
            for (int row = 0; row < size; row++) {
                System.arraycopy(grid[row], 0, copy[row], 0, size);
            }
            return new Board(copy, emptyCell);
        }

        private void ensureGrid() {
            if (grid == null) {
                initGrid();
            }
        }

        private void initGrid() {
            grid = new char[size][size];
            for (int row = 0; row < size; row++) {
                for (int col = 0; col < size; col++) {
                    grid[row][col] = emptyCell;
                }
            }
        }

        private boolean isInside(int row, int col) {
            return row >= 0 && row < size && col >= 0 && col < size;
        }
    }
}
