import javax.swing.SwingUtilities;
import javax.swing.UIManager;

void main() {
    SwingUtilities.invokeLater(() -> {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception exception) {
            System.out.println("Не удалось включить системный вид окон: " + exception.getMessage());
        }
        new GameWindow();
    });
}
