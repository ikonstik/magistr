class NumberPrinter implements Runnable {
    private int startNumber;
    private static final Object lock = new Object();
    private static int currentThread = 1; // 1 - первый поток, 2 - второй поток

    public NumberPrinter(int startNumber) {
        this.startNumber = startNumber;
    }

    @Override
    public void run() {
        synchronized (lock) {
            for (int i = startNumber; i < startNumber + 10; i++) {
                // Ждем, пока не наступит наша очередь
                while ((startNumber == 1 && currentThread != 1) ||
                        (startNumber == 11 && currentThread != 2)) {
                    try {
                        lock.wait();
                    } catch (InterruptedException e) {
                        throw new RuntimeException(e);
                    }
                }

                System.out.println("Поток " + Thread.currentThread().getName() + ": " + i);

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }

                // Передаем ход следующему потоку
                if (startNumber == 1 && i == startNumber + 9) {
                    currentThread = 2;
                    lock.notifyAll();
                }
            }
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Thread t1 = new Thread(new NumberPrinter(1), "1");
        Thread t2 = new Thread(new NumberPrinter(11), "2");

        // Запускаем потоки ОДНОВРЕМЕННО
        t1.start();
        t2.start();

        try {
            t1.join();
            t2.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}