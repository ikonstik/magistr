import player.ComputerPlayer;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.awt.Insets;
import java.util.Random;

public class GameWindow extends JFrame {
    private final JButton[][] cells = new JButton[3][3];
    private final JLabel status = new JLabel(" ", SwingConstants.CENTER);
    private final JLabel markLabel = new JLabel("Вы играете:");
    private final JComboBox<String> modeBox = new JComboBox<>(new String[]{
            "Против компьютера", "Два игрока"
    });
    private final JComboBox<String> markBox = new JComboBox<>(new String[]{"X", "O"});
    private final Random random = new Random();

    private Board board = new Board();
    private ComputerPlayer computer;
    private char humanMark = 'X';
    private char secondMark = 'O';
    private char currentMark = 'X';
    private boolean vsComputer = true;
    private boolean gameOver;

    public GameWindow() {
        super("Крестики-нолики");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        JPanel top = new JPanel(new FlowLayout(FlowLayout.CENTER, 8, 8));
        top.add(new JLabel("Режим:"));
        top.add(modeBox);
        top.add(markLabel);
        top.add(markBox);
        JButton restart = new JButton("Новая игра");
        restart.addActionListener(event -> startGame());
        top.add(restart);
        modeBox.addActionListener(event -> markLabel.setText(
                modeBox.getSelectedIndex() == 0 ? "Вы играете:" : "Игрок 1:"
        ));
        add(top, BorderLayout.NORTH);

        JPanel grid = new JPanel(new GridLayout(3, 3, 8, 8));
        grid.setBorder(BorderFactory.createEmptyBorder(4, 16, 8, 16));
        Font markFont = new Font(Font.SANS_SERIF, Font.BOLD, 48);
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                JButton button = new JButton();
                button.setFont(markFont);
                button.setMargin(new Insets(0, 0, 0, 0));
                button.setFocusPainted(false);
                button.setPreferredSize(new Dimension(110, 110));
                int cellRow = row;
                int cellCol = col;
                button.addActionListener(event -> onCell(cellRow, cellCol));
                cells[row][col] = button;
                grid.add(button);
            }
        }
        add(grid, BorderLayout.CENTER);

        status.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 18));
        status.setBorder(BorderFactory.createEmptyBorder(0, 8, 12, 8));
        add(status, BorderLayout.SOUTH);

        startGame();
        pack();
        setLocationRelativeTo(null);
        setResizable(false);
        setVisible(true);
    }

    private void startGame() {
        humanMark = "O".equals(String.valueOf(markBox.getSelectedItem())) ? 'O' : 'X';
        secondMark = humanMark == 'X' ? 'O' : 'X';
        vsComputer = modeBox.getSelectedIndex() == 0;
        computer = vsComputer ? new ComputerPlayer(secondMark) : null;
        board = new Board();
        gameOver = false;
        for (JButton[] row : cells) {
            for (JButton cell : row) {
                cell.setText("");
                cell.setForeground(Color.BLACK);
            }
        }
        currentMark = random.nextBoolean() ? humanMark : secondMark;
        if (vsComputer && currentMark == secondMark) {
            computerTurn();
        } else {
            showTurn();
        }
    }

    private void onCell(int row, int col) {
        if (gameOver || (vsComputer && currentMark != humanMark)) {
            return;
        }
        if (!board.placeMark(row, col, currentMark)) {
            return;
        }
        showMark(row, col, currentMark);
        if (finishIfNeeded()) {
            return;
        }
        currentMark = opposite(currentMark);
        if (vsComputer && currentMark == secondMark) {
            computerTurn();
        } else {
            showTurn();
        }
    }

    private void computerTurn() {
        int[] move;
        do {
            move = computer.makeMove();
        } while (!board.placeMark(move[0], move[1], secondMark));
        showMark(move[0], move[1], secondMark);
        if (finishIfNeeded()) {
            return;
        }
        currentMark = humanMark;
        showTurn();
    }

    private boolean finishIfNeeded() {
        char winner = board.getWinner();
        if (winner != '-') {
            gameOver = true;
            status.setText("Победил " + winner);
            return true;
        }
        if (board.isFull()) {
            gameOver = true;
            status.setText("Ничья");
            return true;
        }
        return false;
    }

    private void showTurn() {
        if (vsComputer) {
            status.setText("Ваш ход (" + humanMark + ")");
            return;
        }
        status.setText("Ход " + currentMark);
    }

    private void showMark(int row, int col, char mark) {
        JButton button = cells[row][col];
        button.setText(String.valueOf(mark));
        button.setForeground(mark == 'X' ? new Color(25, 90, 180) : new Color(185, 45, 45));
    }

    private char opposite(char mark) {
        return mark == 'X' ? 'O' : 'X';
    }
}
