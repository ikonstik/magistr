import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;

public class Client {
    public static void main(String[] args) throws IOException, InterruptedException {
        Selector selector = Selector.open();
        SocketChannel client = SocketChannel.open();
        client.configureBlocking(false);

        client.connect(new InetSocketAddress("localhost", 5050));
        client.register(selector, SelectionKey.OP_CONNECT);

        while (true) {
            selector.select();
            Iterator<SelectionKey> keys = selector.selectedKeys().iterator();

            while (keys.hasNext()) {
                SelectionKey key = keys.next();
                keys.remove();

                if (!key.isValid()) continue;

                if (key.isConnectable()) {
                    SocketChannel channel = (SocketChannel) key.channel();
                    if (channel.finishConnect()) {
                        System.out.println("Подключен к серверу");
                        key.interestOps(SelectionKey.OP_READ);
                    }

                } else if (key.isReadable()) {
                    SocketChannel channel = (SocketChannel) key.channel();
                    ByteBuffer buffer = ByteBuffer.allocate(256);

                    int bytesRead = channel.read(buffer);
                    if (bytesRead == -1) {
                        System.out.println("Сервер отключен");
                        channel.close();
                        return;
                    } else if (bytesRead > 0) {
                        buffer.flip();
                        String response = StandardCharsets.UTF_8.decode(buffer).toString();
                        System.out.println("Server says: " + response);
                        channel.close();
                        return;
                    }
                }
            }
        }
    }
}